"""Quality assurance stage."""

from __future__ import annotations

import re
from typing import Any, Dict, List

from ...config import PipelineConfig
from ..context import PipelineState, QAReport
from ..gating import PlaceholderGate
from ..knowledge_base import KnowledgeBase
from ..stage import PipelineStage, StageOutput
from .claude_cli_stages import PlaceholderFixStage, is_tableau_mode


class QualityAssuranceStage(PipelineStage):
    """Summarize objective validation results and determine pass/fail status."""

    def __init__(self) -> None:
        super().__init__(
            name="quality_assurance",
            description="Summarize objective validation results and determine pass/fail status.",
            consumes=["workspace"],
            produces=["qa_report"],
            gates=[PlaceholderGate()],
        )

    def _scan_interaction_coverage(self, state: PipelineState) -> list[dict]:
        tableau_context = state.extras.get("tableau_context")
        if not isinstance(tableau_context, dict):
            return []

        summary = tableau_context.get("tableau_render_contract_summary")
        if not isinstance(summary, dict):
            return []

        expected_actions = int(summary.get("dashboard_action_count") or 0)
        expected_highlights = int(summary.get("highlight_binding_count") or 0)
        if expected_actions + expected_highlights == 0:
            return []

        src_root = state.paths.output_dir / "src"
        if not src_root.exists():
            return [
                {
                    "file": str(src_root),
                    "label": "Missing src directory for interaction checks",
                    "line": 1,
                    "preview": "Expected source files to validate interaction coverage.",
                }
            ]

        source_texts: List[str] = []
        for path in src_root.rglob("*"):
            if not path.is_file() or path.suffix.lower() not in {".ts", ".tsx", ".js", ".jsx"}:
                continue
            try:
                source_texts.append(path.read_text(encoding="utf-8"))
            except (UnicodeDecodeError, OSError):
                continue
        combined = "\n".join(source_texts)

        findings: list[dict] = []
        if expected_actions > 0 and not re.search(r"\bonClick\b|\bhandleClick\b|\bnavigate\(|\bsetFilter\b|\bsetSelected\b", combined):
            findings.append(
                {
                    "file": str(src_root),
                    "label": "Missing action handler evidence",
                    "line": 1,
                    "preview": f"Render contract expects {expected_actions} dashboard actions, but no action handlers were detected.",
                }
            )

        if expected_highlights > 0 and not re.search(r"\bhighlight\b|\bselected\b|\bselection\b|\bfilter\b", combined, re.IGNORECASE):
            findings.append(
                {
                    "file": str(src_root),
                    "label": "Missing highlight/filter state evidence",
                    "line": 1,
                    "preview": f"Render contract expects {expected_highlights} highlight bindings, but no highlight-related state was detected.",
                }
            )

        return findings

    def _command_failures(self, validation: Dict[str, Any]) -> List[Dict[str, Any]]:
        failures: List[Dict[str, Any]] = []
        for command in validation.get("commands", []):
            if not isinstance(command, dict):
                continue
            if command.get("status") != "failed":
                continue
            failures.append(command)
        return failures

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: KnowledgeBase,
    ) -> StageOutput:
        if state.workspace is None:
            raise ValueError("Quality assurance requires the scaffolded workspace artifact.")

        placeholder_stage = PlaceholderFixStage()
        placeholder_residuals = state.extras.get("placeholder_residuals")
        if not isinstance(placeholder_residuals, list):
            placeholder_residuals = []
        placeholder_labels = {
            *[label for label, _pattern in placeholder_stage.PLACEHOLDER_PATTERNS],
            "Toast placeholder",
            "Console placeholder",
        }
        actual_placeholder_residuals = [
            item
            for item in placeholder_residuals
            if isinstance(item, dict) and str(item.get("label") or "") in placeholder_labels
        ]

        bug_fix_validation = state.extras.get("bug_fix_validation")
        if not isinstance(bug_fix_validation, dict):
            bug_fix_validation = {}

        render_fix_validation = state.extras.get("render_fix_validation")
        if not isinstance(render_fix_validation, dict):
            render_fix_validation = {}

        tableau_source_validation = state.extras.get("tableau_source_validation")
        if not isinstance(tableau_source_validation, dict):
            tableau_source_validation = {}

        tableau_mode = is_tableau_mode(state)
        data_findings: list[dict] = []
        spec_findings: list[dict] = []
        build_findings: list[dict] = []
        route_findings: list[dict] = []
        interaction_findings: list[dict] = []
        warning_findings: list[dict] = []

        if tableau_mode:
            data_findings.extend(placeholder_stage._scan_tableau_data_violations(state.paths.output_dir))
            data_findings.extend(placeholder_stage._scan_tableau_numeric_coercion_violations(state.paths.output_dir))
            spec_findings.extend(placeholder_stage._scan_tableau_spec_contract_violations(state.paths.output_dir))
            spec_findings.extend(placeholder_stage._scan_tableau_render_contract_violations(state.paths.output_dir))
            build_findings.extend(placeholder_stage._scan_tailwind_without_setup(state.paths.output_dir))
            interaction_findings.extend(self._scan_interaction_coverage(state))

        if tableau_mode and not tableau_source_validation:
            data_findings.append(
                {
                    "file": str(state.paths.logs_dir / "tableau_source_validation.json"),
                    "label": "Missing tableau source validation artifact",
                    "line": 1,
                    "preview": "Expected tableau_source_validation.json to exist in Tableau mode.",
                }
            )
        elif tableau_mode and not tableau_source_validation.get("passed", False):
            for issue in tableau_source_validation.get("issues", [])[:20]:
                if not isinstance(issue, dict):
                    continue
                finding = {
                    "file": str(issue.get("path") or state.paths.logs_dir / "tableau_source_validation.json"),
                    "label": f"tableau source validation failed: {issue.get('code')}",
                    "line": 1,
                    "preview": issue.get("message", ""),
                }
                if str(issue.get("severity") or "error").lower() == "warning":
                    warning_findings.append(finding)
                else:
                    data_findings.append(finding)

        if not bug_fix_validation:
            build_findings.append(
                {
                    "file": str(state.paths.logs_dir / "bug_fix_validation.json"),
                    "label": "Missing bug_fix validation artifact",
                    "line": 1,
                    "preview": "Expected bug_fix_validation.json to exist after bug_fix stage.",
                }
            )
        elif not bug_fix_validation.get("passed", False):
            for command in self._command_failures(bug_fix_validation):
                build_findings.append(
                    {
                        "file": str(command.get("log_path") or state.paths.logs_dir / f"bug_fix_{command.get('name')}.log"),
                        "label": f"bug_fix command failed: {command.get('name')}",
                        "line": 1,
                        "preview": command.get("output_summary", ""),
                    }
                )
        elif not bug_fix_validation.get("has_test_script", False):
            build_findings.append(
                {
                    "file": str(state.paths.logs_dir / "bug_fix_validation.json"),
                    "label": "No test script configured",
                    "line": 1,
                    "preview": "Test validation was skipped because package.json has no test script.",
                }
            )

        if not render_fix_validation:
            route_findings.append(
                {
                    "file": str(state.paths.logs_dir / "render_validation.json"),
                    "label": "Missing render validation artifact",
                    "line": 1,
                    "preview": "Expected render_validation.json to exist after render_fix stage.",
                }
            )
        else:
            if not render_fix_validation.get("passed", False):
                for category in render_fix_validation.get("failure_categories", []):
                    preview = ""
                    matches = render_fix_validation.get("fatal_matches", {}).get(category)
                    if isinstance(matches, list) and matches:
                        preview = matches[0]
                    route_findings.append(
                        {
                            "file": str(state.paths.logs_dir / "render_fix.log"),
                            "label": f"render validation failed: {category}",
                            "line": 1,
                            "preview": preview,
                        }
                    )
            if not render_fix_validation.get("screenshots"):
                route_findings.append(
                    {
                        "file": str(state.paths.logs_dir / "render_fix.log"),
                        "label": "No screenshots captured",
                        "line": 1,
                        "preview": "render_fix completed without screenshot outputs.",
                    }
                )

        placeholder_ratio = 0.0 if not actual_placeholder_residuals else 1.0
        dimensions = {
            "data_source_compliance": {
                "passed": not data_findings,
                "issue_count": len(data_findings),
                "issues": data_findings[:20],
            },
            "spec_contract_coverage": {
                "passed": not spec_findings,
                "issue_count": len(spec_findings),
                "issues": spec_findings[:20],
            },
            "build_runtime_health": {
                "passed": not [item for item in build_findings if item["label"] != "No test script configured"],
                "issue_count": len(build_findings),
                "issues": build_findings[:20],
            },
            "route_render_reachability": {
                "passed": not route_findings,
                "issue_count": len(route_findings),
                "issues": route_findings[:20],
            },
            "interaction_coverage": {
                "passed": not interaction_findings,
                "issue_count": len(interaction_findings),
                "issues": interaction_findings[:20],
            },
        }

        findings: List[Dict[str, Any]] = []
        failure_categories: List[str] = []
        for dimension_name, dimension in dimensions.items():
            if dimension["passed"]:
                continue
            failure_categories.append(dimension_name)
            for issue in dimension["issues"]:
                findings.append(
                    {
                        "severity": "error",
                        "dimension": dimension_name,
                        "message": f"{issue['label']}: {issue['preview']}",
                        "file": issue["file"],
                    }
                )

        for issue in build_findings:
            if issue["label"] != "No test script configured":
                continue
            findings.append(
                {
                    "severity": "warning",
                    "dimension": "build_runtime_health",
                    "message": f"{issue['label']}: {issue['preview']}",
                    "file": issue["file"],
                }
            )

        for issue in warning_findings:
            findings.append(
                {
                    "severity": "warning",
                    "dimension": "data_source_compliance",
                    "message": f"{issue['label']}: {issue['preview']}",
                    "file": issue["file"],
                }
            )

        failure_categories.extend(bug_fix_validation.get("failure_categories", []))
        failure_categories.extend(render_fix_validation.get("failure_categories", []))
        failure_categories.extend(tableau_source_validation.get("failure_categories", []))
        failure_categories = sorted(set(failure_categories))
        passed = not any(not dimension["passed"] for dimension in dimensions.values())

        metrics = {
            "dimension_count": len(dimensions),
            "failed_dimensions": sum(1 for dimension in dimensions.values() if not dimension["passed"]),
            "placeholder_ratio": placeholder_ratio,
            "failure_category_count": len(failure_categories),
        }

        evidence = {
            "tableau_source_validation_path": str(state.paths.logs_dir / "tableau_source_validation.json"),
            "bug_fix_validation_path": str(state.paths.logs_dir / "bug_fix_validation.json"),
            "render_validation_path": str(state.paths.logs_dir / "render_validation.json"),
            "render_log_path": str(state.paths.logs_dir / "render_fix.log"),
        }

        qa_report = QAReport(
            passed=passed,
            findings=findings,
            metrics=metrics,
            dimensions=dimensions,
            failure_categories=failure_categories,
            evidence=evidence,
            placeholder_ratio=placeholder_ratio,
        )

        return StageOutput(
            success=passed,
            state_updates={"qa_report": qa_report},
            artifacts={"qa_report": qa_report},
            metrics=metrics,
            quality={"placeholder_ratio": placeholder_ratio},
        )


__all__ = ["QualityAssuranceStage"]
