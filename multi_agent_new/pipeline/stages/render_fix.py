"""Render validation stage that captures multi-route screenshots."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path
from typing import Any, Dict, List

from ...config import PipelineConfig
from ...logging_config import get_logger
from ..context import PipelineState
from ..knowledge_base import KnowledgeBase
from ..stage import PipelineStage, StageOutput
from ..utils import ensure_directory, env_with_node_path, resolve_node_executable, write_json

logger = get_logger(__name__)

_FATAL_PATTERNS = {
    "unresolved_import": [
        re.compile(r"Pre-transform error:", re.IGNORECASE),
        re.compile(r"Failed to resolve import", re.IGNORECASE),
        re.compile(r"could not be resolved", re.IGNORECASE),
    ],
    "empty_page": [
        re.compile(r"Page appears to be empty", re.IGNORECASE),
        re.compile(r"#root element not found", re.IGNORECASE),
        re.compile(r"Screenshot taken without #root element", re.IGNORECASE),
    ],
    "page_error": [
        re.compile(r"🔴 Page error:", re.IGNORECASE),
    ],
    "http_500": [
        re.compile(r"status of 500 \(Internal Server Error\)", re.IGNORECASE),
    ],
    "react_key_error": [
        re.compile(r"Encountered two children with the same key", re.IGNORECASE),
        re.compile(r'unique "key" prop', re.IGNORECASE),
    ],
    "svg_geometry_error": [
        re.compile(r"attribute width: A negative value is not valid", re.IGNORECASE),
        re.compile(r"attribute height: A negative value is not valid", re.IGNORECASE),
        re.compile(r"attribute d: Expected moveto path command", re.IGNORECASE),
    ],
}

_ROUTE_CAPTURE_RE = re.compile(r"📸 Capturing route '([^']+)' -> (.+)")
_DEFAULT_CAPTURE_RE = re.compile(r"📸 Capturing default route -> (.+)")
_FAILED_ROUTES_RE = re.compile(r"❌ Failed to capture routes: (.+)")
_CONSOLE_ERROR_RE = re.compile(r"🔴 Console error:.*")
_PORT_IN_USE_RE = re.compile(r"port\s+\d+\s+is already in use", re.IGNORECASE)


def _summarize_matches(lines: List[str], limit: int = 20) -> List[str]:
    if len(lines) <= limit:
        return lines
    return [*lines[:limit], f"... {len(lines) - limit} additional occurrences omitted"]


def _parse_route_results(log_contents: str, project_path: Path) -> List[Dict[str, Any]]:
    route_results: List[Dict[str, Any]] = []
    for match in _ROUTE_CAPTURE_RE.finditer(log_contents):
        route = match.group(1)
        screenshot_path = Path(match.group(2).strip())
        route_results.append(
            {
                "route": route,
                "screenshot_path": str(screenshot_path),
                "captured": screenshot_path.exists(),
            }
        )

    for match in _DEFAULT_CAPTURE_RE.finditer(log_contents):
        screenshot_path = Path(match.group(1).strip())
        route_results.append(
            {
                "route": "/",
                "screenshot_path": str(screenshot_path),
                "captured": screenshot_path.exists(),
            }
        )

    if route_results:
        return route_results

    screenshots_dir = project_path / "screenshots"
    return [
        {
            "route": "/",
            "screenshot_path": str(path),
            "captured": True,
        }
        for path in sorted(screenshots_dir.glob("*.png"))
    ]


def _build_render_validation(
    *,
    log_contents: str,
    project_path: Path,
    screenshots: List[str],
    returncode: int | None,
    preflight_error: str | None = None,
    node_executable: str | None = None,
) -> Dict[str, Any]:
    route_results = _parse_route_results(log_contents, project_path)
    fatal_matches: Dict[str, List[str]] = {}
    matched_console_lines: set[str] = set()

    for category, patterns in _FATAL_PATTERNS.items():
        lines: List[str] = []
        for line in log_contents.splitlines():
            if any(pattern.search(line) for pattern in patterns):
                lines.append(line.strip())
                if "🔴 Console error:" in line:
                    matched_console_lines.add(line.strip())
        if lines:
            fatal_matches[category] = _summarize_matches(lines)

    console_lines = [line.strip() for line in _CONSOLE_ERROR_RE.findall(log_contents)]
    unmatched_console_lines = [line for line in console_lines if line not in matched_console_lines]
    if unmatched_console_lines:
        fatal_matches["browser_console_error"] = _summarize_matches(unmatched_console_lines)

    failed_routes: List[str] = []
    failed_routes_match = _FAILED_ROUTES_RE.search(log_contents)
    if failed_routes_match:
        failed_routes = [item.strip() for item in failed_routes_match.group(1).split(",") if item.strip()]
    else:
        failed_routes = [result["route"] for result in route_results if not result["captured"]]

    failure_categories = sorted(fatal_matches.keys())
    if failed_routes:
        failure_categories.append("route_capture_failure")
    if returncode not in (0, None):
        failure_categories.append("renderer_process_failed")
    if not screenshots:
        failure_categories.append("missing_screenshots")
    if preflight_error:
        failure_categories.append("render_preflight_failed")

    warnings = []
    if "No test script configured" in log_contents:
        warnings.append("Render log unexpectedly mentions missing test script.")

    validation = {
        "project_root": str(project_path),
        "node_executable": node_executable,
        "returncode": returncode,
        "preflight_error": preflight_error,
        "screenshots": screenshots,
        "route_results": route_results,
        "fatal_matches": fatal_matches,
        "failed_routes": failed_routes,
        "warnings": warnings,
        "failure_categories": sorted(set(failure_categories)),
        "passed": not failure_categories,
        "metrics": {
            "screenshots": len(screenshots),
            "routes_attempted": len(route_results),
            "routes_captured": sum(1 for item in route_results if item.get("captured")),
            "console_error_count": len(console_lines),
        },
    }
    return validation


class RenderFixStage(PipelineStage):
    """Run the Node renderer to validate the UI and capture screenshots."""

    MAX_RENDER_ATTEMPTS = 3

    def __init__(self) -> None:
        super().__init__(
            name="render_fix",
            description="Render the generated project and save screenshots for each route.",
            consumes=["workspace"],
        )

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: KnowledgeBase,
    ) -> StageOutput:
        if not config.flags.visual_checks_enabled:
            logger.info("Visual checks disabled via configuration; skipping render_fix stage.")
            return StageOutput(
                diagnostics=["render_fix skipped because visual checks are disabled."],
                metrics={"render_skipped": 1},
            )

        if state.workspace is None:
            raise ValueError("Render fix stage requires the scaffolded workspace artifact.")

        project_path = state.workspace.root_path
        screenshots_dir = project_path / "screenshots"
        ensure_directory(screenshots_dir)
        ensure_directory(state.paths.logs_dir)

        repo_root = Path(__file__).resolve().parents[3]
        render_script = repo_root / "project-renderer" / "render-project.js"
        node_executable_path = resolve_node_executable()
        node_executable = str(node_executable_path) if node_executable_path else None
        preflight_error = None

        if node_executable is None:
            preflight_error = "Node.js executable not found in PATH."
        elif not render_script.exists():
            preflight_error = f"Render script not found at {render_script}"

        command: List[str] = []
        result: subprocess.CompletedProcess[str] | None = None
        log_sections: List[str] = []

        if preflight_error is None:
            command = [
                node_executable,
                str(render_script),
                "--project",
                str(project_path),
                "--output",
                str(screenshots_dir),
                "--routes",
                "auto",
            ]
            for attempt_index in range(1, self.MAX_RENDER_ATTEMPTS + 1):
                logger.info("Executing render command (attempt %s/%s): %s", attempt_index, self.MAX_RENDER_ATTEMPTS, " ".join(command))
                result = subprocess.run(
                    command,
                    cwd=str(render_script.parent),
                    capture_output=True,
                    text=True,
                    env=env_with_node_path(),
                )
                attempt_log = (result.stdout or "") + ("\n" if result.stdout and result.stderr else "") + (result.stderr or "")
                log_sections.append(f"## Render Attempt {attempt_index}\n{attempt_log.strip()}\n")
                if result.returncode == 0 or not _PORT_IN_USE_RE.search(attempt_log):
                    break
                logger.warning("Render attempt %s failed due to port collision; retrying.", attempt_index)
        else:
            logger.error(preflight_error)
            log_sections = [preflight_error]

        log_contents = "\n".join(section for section in log_sections if section)

        log_path = state.paths.logs_dir / "render_fix.log"
        log_path.write_text(log_contents, encoding="utf-8")

        screenshots = sorted(str(path.relative_to(project_path)) for path in screenshots_dir.glob("*.png"))
        validation = _build_render_validation(
            log_contents=log_contents,
            project_path=project_path,
            screenshots=screenshots,
            returncode=result.returncode if result is not None else None,
            preflight_error=preflight_error,
            node_executable=node_executable,
        )
        validation_path = state.paths.logs_dir / "render_validation.json"
        write_json(validation_path, validation)

        extras = dict(state.extras)
        extras["render_fix"] = {
            "command": command,
            "log_path": str(log_path),
            "screenshots": screenshots,
            "returncode": result.returncode if result is not None else None,
        }
        extras["render_fix_validation"] = validation

        artifacts = {
            "render_fix.log": log_contents,
            "render_log_path": str(log_path),
            "render_command": " ".join(command) if command else "",
            "render_screenshots": screenshots,
            "render_validation.json": validation,
            str(validation_path): str(validation_path),
        }

        metrics = {
            "render_returncode": result.returncode if result is not None else None,
            "render_screenshots": len(screenshots),
            "render_failure_categories": len(validation["failure_categories"]),
        }

        diagnostics = []
        if not validation["passed"]:
            categories = ", ".join(validation["failure_categories"])
            diagnostics.append(
                f"Render validation failed with categories: {categories}. See render_validation.json for details."
            )

        return StageOutput(
            success=validation["passed"],
            diagnostics=diagnostics,
            artifacts=artifacts,
            metrics=metrics,
            state_updates={"extras": extras},
        )


__all__ = ["RenderFixStage"]
