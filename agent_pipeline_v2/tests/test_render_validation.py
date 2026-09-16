from __future__ import annotations

import subprocess
from pathlib import Path

from agent_pipeline.config import build_default_config
from agent_pipeline.pipeline.context import PipelinePaths, PipelineState, WorkspaceArtifact
from agent_pipeline.pipeline.knowledge_base import KnowledgeBase
from agent_pipeline.pipeline.orchestrator import PipelineOrchestrator
from agent_pipeline.pipeline.stage import PipelineStage, StageOutput
from agent_pipeline.pipeline.stages.quality_assurance import QualityAssuranceStage
from agent_pipeline.pipeline.stages.render_fix import RenderFixStage, _build_render_validation


def test_build_render_validation_flags_expected_failures(tmp_path):
    project_root = tmp_path / "tableau_dashboard_9517"
    screenshots_dir = project_root / "screenshots"
    screenshots_dir.mkdir(parents=True)
    screenshot_path = screenshots_dir / "dashboard.png"
    screenshot_path.write_bytes(b"png")

    log_contents = f"""
  📸 Capturing route '/dashboard' -> {screenshot_path}
  🔴 Console error: Failed to load resource: the server responded with a status of 500 (Internal Server Error)
  ⚠️  Page appears to be empty (15 characters) - likely compilation failure
  Pre-transform error: Failed to resolve import "d3-selection" from "src/components/charts/HorizontalRankedBar.tsx".
"""

    validation = _build_render_validation(
        log_contents=log_contents,
        project_path=project_root,
        screenshots=["screenshots/dashboard.png"],
        returncode=0,
    )

    assert not validation["passed"]
    assert "http_500" in validation["failure_categories"]
    assert "empty_page" in validation["failure_categories"]
    assert "unresolved_import" in validation["failure_categories"]


def test_render_fix_preflight_reports_missing_node(tmp_path, monkeypatch):
    project_root = tmp_path / "tableau_dashboard_121"
    project_root.mkdir(parents=True)

    state = PipelineState(
        paths=PipelinePaths.from_output_dir(project_root),
        workspace=WorkspaceArtifact(
            root_path=project_root,
            package_manager="pnpm",
            config_files={},
            file_structure_manifest=[],
            package_json={},
        ),
    )
    config = build_default_config()
    knowledge_base = KnowledgeBase(tmp_path)
    monkeypatch.setattr("agent_pipeline.pipeline.stages.render_fix.resolve_node_executable", lambda: None)

    output = RenderFixStage().execute(state, config, knowledge_base)

    assert not output.success
    validation = output.state_updates["extras"]["render_fix_validation"]
    assert "render_preflight_failed" in validation["failure_categories"]
    assert validation["preflight_error"] == "Node.js executable not found in PATH."


def test_render_fix_retries_port_collision(tmp_path, monkeypatch):
    project_root = tmp_path / "tableau_dashboard_5198"
    project_root.mkdir(parents=True)
    screenshots_dir = project_root / "screenshots"
    screenshots_dir.mkdir(parents=True)

    state = PipelineState(
        paths=PipelinePaths.from_output_dir(project_root),
        workspace=WorkspaceArtifact(
            root_path=project_root,
            package_manager="pnpm",
            config_files={},
            file_structure_manifest=[],
            package_json={},
        ),
    )
    config = build_default_config()
    knowledge_base = KnowledgeBase(tmp_path)

    calls = {"count": 0}

    def fake_run(command, cwd, capture_output, text, env):
        calls["count"] += 1
        if calls["count"] == 1:
            return subprocess.CompletedProcess(
                command,
                1,
                stdout="error when starting dev server:\nError: Port 3000 is already in use\n",
                stderr="",
            )

        screenshot_path = screenshots_dir / "dashboard.png"
        screenshot_path.write_bytes(b"png")
        return subprocess.CompletedProcess(
            command,
            0,
            stdout=f"📸 Capturing route '/dashboard' -> {screenshot_path}\n",
            stderr="",
        )

    monkeypatch.setattr("agent_pipeline.pipeline.stages.render_fix.resolve_node_executable", lambda: Path("/usr/bin/node"))
    monkeypatch.setattr("agent_pipeline.pipeline.stages.render_fix.subprocess.run", fake_run)

    output = RenderFixStage().execute(state, config, knowledge_base)
    validation = output.state_updates["extras"]["render_fix_validation"]

    assert calls["count"] == 2
    assert output.success
    assert validation["passed"]
    assert validation["screenshots"] == ["screenshots/dashboard.png"]


def test_quality_assurance_ignores_warning_only_tableau_source_and_non_placeholder_residuals(tmp_path):
    project_root = tmp_path / "tableau_dashboard_9517"
    src_dir = project_root / "src"
    docs_dir = project_root / "docs"
    logs_dir = project_root / "pipeline_logs"
    src_dir.mkdir(parents=True)
    docs_dir.mkdir(parents=True)
    logs_dir.mkdir(parents=True)

    (src_dir / "App.tsx").write_text(
        "export async function load() { return fetch('/data/orders.csv'); }\n"
        "export const App = () => null;\n",
        encoding="utf-8",
    )
    (docs_dir / "tableau_spec.json").write_text(
        '{"worksheets":[],"dashboard_zones":[],"dashboard_text_zones":[],"dashboard_actions":[],"highlight_bindings":[]}',
        encoding="utf-8",
    )
    (docs_dir / "tableau_render_contract.json").write_text(
        '{"worksheets":[],"dashboard_text_zones":[],"dashboard_actions":[],"highlight_bindings":[]}',
        encoding="utf-8",
    )

    state = PipelineState(
        paths=PipelinePaths.from_output_dir(project_root),
        workspace=WorkspaceArtifact(
            root_path=project_root,
            package_manager="pnpm",
            config_files={},
            file_structure_manifest=[],
            package_json={},
        ),
        extras={
            "mode": "tableau",
            "placeholder_residuals": [
                {
                    "file": str(src_dir / "App.tsx"),
                    "label": "Missing fetch('/data/...') usage in src",
                    "line": 1,
                    "preview": "warning only",
                }
            ],
            "bug_fix_validation": {
                "passed": True,
                "has_test_script": False,
                "commands": [],
                "failure_categories": [],
            },
            "render_fix_validation": {
                "passed": True,
                "screenshots": ["screenshots/dashboard.png"],
                "failure_categories": [],
                "fatal_matches": {},
            },
            "tableau_source_validation": {
                "passed": False,
                "issues": [
                    {
                        "code": "csv_headers_need_normalization",
                        "severity": "warning",
                        "message": "header normalization handled by source code",
                        "path": str(project_root / "public" / "data" / "orders.csv"),
                    }
                ],
                "failure_categories": [],
            },
            "tableau_context": {
                "tableau_render_contract_summary": {
                    "dashboard_action_count": 0,
                    "highlight_binding_count": 0,
                }
            },
        },
    )

    output = QualityAssuranceStage().execute(state, build_default_config(), KnowledgeBase(tmp_path))

    assert output.success
    assert output.quality["placeholder_ratio"] == 0.0


def test_orchestrator_build_stages_includes_quality_assurance():
    orchestrator = PipelineOrchestrator()
    assert [stage.name for stage in orchestrator.build_stages()] == [
        "requirement_enrichment",
        "project_scaffolder",
        "first_generation",
        "tableau_source_compliance",
        "placeholder_fix",
        "bug_fix",
        "render_fix",
        "quality_assurance",
    ]


def test_stage_run_respects_stage_output_success_false(tmp_path):
    class FailingStage(PipelineStage):
        def __init__(self) -> None:
            super().__init__(name="failing_stage", description="fails deliberately")

        def execute(self, state, config, knowledge_base):
            return StageOutput(success=False, diagnostics=["explicit failure"])

    orchestrator = PipelineOrchestrator()
    state = PipelineState(paths=PipelinePaths.from_output_dir(tmp_path))
    result = FailingStage().run(
        state=state,
        config=build_default_config(),
        knowledge_base=orchestrator.knowledge_base,
        logger=orchestrator.logger,
    )

    assert not result.success
    assert "explicit failure" in result.issues
