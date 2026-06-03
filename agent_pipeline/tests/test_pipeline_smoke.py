from __future__ import annotations

import os
import shutil

import pytest

from agent_pipeline.pipeline import PipelineOrchestrator


def test_pipeline_smoke(tmp_path):
    try:
        import claude_agent_sdk  # type: ignore # noqa: F401
    except ModuleNotFoundError:
        pytest.skip("claude_agent_sdk not installed; skipping integration-heavy pipeline smoke test.")
    if not os.getenv("LLM_KEY"):
        pytest.skip("LLM_KEY not configured; skipping integration-heavy pipeline smoke test.")
    if shutil.which("pnpm") is None:
        pytest.skip("pnpm not available; skipping pipeline smoke test.")

    orchestrator = PipelineOrchestrator()
    prompt = (
        "Design a complex operations intelligence dashboard with Ant Design, "
        "including executive overview, incident response, forecasting lab, and team collaboration."
    )
    output_dir = tmp_path / "complex-app"
    result = orchestrator.run(prompt=prompt, output_dir=str(output_dir))

    assert result.success, "Pipeline should succeed for the smoke prompt when prerequisites are met."
    assert [stage.name for stage in result.stage_results] == [
        "requirement_enrichment",
        "project_scaffolder",
        "first_generation",
        "tableau_source_compliance",
        "placeholder_fix",
        "bug_fix",
        "render_fix",
        "quality_assurance",
    ]
