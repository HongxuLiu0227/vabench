from __future__ import annotations

import json
from pathlib import Path

from multi_agent_new.config import build_default_config
from multi_agent_new.pipeline.context import PipelinePaths, PipelineState
from multi_agent_new.pipeline.knowledge_base import KnowledgeBase
from multi_agent_new.pipeline.stages.requirement_architect import RequirementArchitectStage


def test_tableau_mode_copies_data_and_injects_sample(tmp_path, monkeypatch):
    monkeypatch.setenv("PIPELINE_CACHE_ROOT", str(tmp_path / "cache"))
    # Force the Tableau requirement agent into the fallback path (no external LLM calls in tests).
    monkeypatch.delenv("LLM_KEY", raising=False)
    monkeypatch.delenv("MODEL_NAME", raising=False)

    tableau_dir = tmp_path / "tableau_export"
    tableau_dir.mkdir()
    twb_path = tableau_dir / "Book1.twb"
    twb_path.write_text("<workbook></workbook>\n", encoding="utf-8")

    data_dir = tableau_dir / "data"
    data_dir.mkdir()
    csv_path = data_dir / "data.csv"
    csv_path.write_text(
        "a,b\n"
        "1,2\n"
        "3,4\n"
        "5,6\n"
        "7,8\n"
        "9,10\n"
        "11,12\n",
        encoding="utf-8",
    )

    out_dir = tmp_path / "out_app"
    paths = PipelinePaths.from_output_dir(out_dir)
    state = PipelineState(
        paths=paths,
        prompt=twb_path.read_text(encoding="utf-8"),
        extras={
            "mode": "tableau",
            "tableau_input_dir": str(tableau_dir),
            "tableau_twb_path": str(twb_path),
        },
    )

    config = build_default_config()
    kb = KnowledgeBase(config.knowledge_base_root)
    stage = RequirementArchitectStage()
    output = stage.execute(state, config, kb)

    public_csv = out_dir / "public" / "data" / "data.csv"
    assert public_csv.exists()
    assert public_csv.read_text(encoding="utf-8").startswith("a,b")

    requirements_md = out_dir / "docs" / "requirements.md"
    assert requirements_md.exists()
    text = requirements_md.read_text(encoding="utf-8")

    assert "{{SAMPLE_DATA}}" not in text
    assert "/data/data.csv" in text
    assert "fetch(" in text or "fetch (" in text

    tableau_spec_path = out_dir / "docs" / "tableau_spec.json"
    assert tableau_spec_path.exists()
    tableau_spec = json.loads(tableau_spec_path.read_text(encoding="utf-8"))
    assert isinstance(tableau_spec.get("worksheets"), list)
    assert isinstance(tableau_spec.get("dashboard_zones"), list)
    assert isinstance(tableau_spec.get("dashboard_text_zones"), list)
    assert isinstance(tableau_spec.get("dashboard_actions"), list)
    assert isinstance(tableau_spec.get("highlight_bindings"), list)

    tableau_render_contract = out_dir / "docs" / "tableau_render_contract.json"
    assert tableau_render_contract.exists()
    contract = json.loads(tableau_render_contract.read_text(encoding="utf-8"))
    assert isinstance(contract.get("worksheets"), list)
    assert isinstance(contract.get("dashboard_text_zones"), list)
    assert isinstance(contract.get("dashboard_actions"), list)
    assert isinstance(contract.get("highlight_bindings"), list)
    assert "summary" in contract

    # Basic sanity: we should still produce a product_spec update in state_updates.
    assert "product_spec" in output.state_updates
