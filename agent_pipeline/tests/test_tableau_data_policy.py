from __future__ import annotations

from pathlib import Path

from agent_pipeline.config import build_default_config
from agent_pipeline.pipeline.context import PipelinePaths, PipelineState
from agent_pipeline.pipeline.stages.claude_cli_stages import (
    FirstGenerationStage,
    PlaceholderFixStage,
    build_snippet_context,
)


def _make_state(tmp_path: Path, *, tableau: bool) -> PipelineState:
    extras = {}
    if tableau:
        spec_path = tmp_path / "out" / "docs" / "tableau_spec.json"
        render_contract_path = tmp_path / "out" / "docs" / "tableau_render_contract.json"
        extras = {
            "mode": "tableau",
            "tableau_context": {
                "primary_data_url": "/data/analysis3_processed.csv",
                "data_files_manifest": [
                    {"fetch_url": "/data/analysis3_processed.csv"},
                ],
                "tableau_spec_path": str(spec_path),
                "tableau_spec_summary": {
                    "worksheet_count": 2,
                    "dashboard_count": 1,
                    "dashboard_text_zone_count": 2,
                    "dashboard_action_count": 2,
                    "highlight_binding_count": 3,
                },
                "tableau_render_contract_path": str(render_contract_path),
                "tableau_render_contract_summary": {
                    "worksheet_count": 2,
                    "dashboard_text_zone_count": 2,
                    "intent_counts": {"horizontal_stacked_percentage_bar": 1, "horizontal_ranked_bar": 1},
                    "dashboard_action_count": 2,
                    "highlight_binding_count": 3,
                },
            },
        }
    return PipelineState(paths=PipelinePaths.from_output_dir(tmp_path / "out"), extras=extras)


def test_first_generation_instruction_enforces_public_data_for_tableau(tmp_path):
    stage = FirstGenerationStage()
    state = _make_state(tmp_path, tableau=True)
    instruction = stage.build_instruction(state, build_default_config())
    assert "public/data" in instruction
    assert "fetch('/data/" in instruction
    assert "Do NOT place CSV/JSON files under `src/data` or `src/mocks`." in instruction
    assert "tableau_spec.json" in instruction
    assert "chart_type" in instruction
    assert "reference_lines" in instruction
    assert "style_rule_elements" in instruction
    assert "axis_titles" in instruction
    assert "legend_spec" in instruction
    assert "dashboard_actions" in instruction
    assert "highlight_bindings" in instruction
    assert "dashboard_text_zones" in instruction
    assert "dashboard_zones" in instruction
    assert "tableau_render_contract.json" in instruction
    assert "horizontal 100% stacked bar view" in instruction
    assert "vertical 100% stacked bar/column view" in instruction
    assert "horizontal box-and-whisker plots" in instruction
    assert "vertical box-and-whisker plots" in instruction
    assert "Do NOT infer chart type from dashboard position" in instruction
    assert "`category_order`, `series_order`" in instruction
    assert "`legend.required` is true" in instruction
    assert "Reproduce `dashboard_actions` and `highlight_bindings` interaction behavior" in instruction
    assert "no clipping" in instruction
    assert "D3" in instruction
    assert "Ant Design properly wired" not in instruction


def test_tableau_violation_scan_detects_src_data(tmp_path):
    stage = PlaceholderFixStage()
    out_dir = tmp_path / "out"
    src_data = out_dir / "src" / "data"
    src_data.mkdir(parents=True, exist_ok=True)
    (src_data / "analysis.csv").write_text("a,b\n1,2\n", encoding="utf-8")
    (out_dir / "src" / "App.tsx").write_text(
        "import React from 'react';\nexport const App = () => <div>Hello</div>;\n",
        encoding="utf-8",
    )
    findings = stage._scan_tableau_data_violations(out_dir)
    labels = {item["label"] for item in findings}
    assert "Dataset file under src/data" in labels
    assert "Missing fetch('/data/...') usage in src" in labels


def test_tableau_violation_scan_ignores_gitkeep_only(tmp_path):
    stage = PlaceholderFixStage()
    out_dir = tmp_path / "out"
    src_data = out_dir / "src" / "data"
    src_data.mkdir(parents=True, exist_ok=True)
    (src_data / ".gitkeep").write_text("", encoding="utf-8")
    (out_dir / "src" / "App.tsx").write_text(
        "export const App = async () => { await fetch('/data/analysis.csv'); return null; };",
        encoding="utf-8",
    )
    findings = stage._scan_tableau_data_violations(out_dir)
    labels = {item["label"] for item in findings}
    assert "Dataset file under src/data" not in labels


def test_tableau_spec_contract_scan_detects_missing_spec(tmp_path):
    stage = PlaceholderFixStage()
    out_dir = tmp_path / "out"
    findings = stage._scan_tableau_spec_contract_violations(out_dir)
    labels = {item["label"] for item in findings}
    assert "Missing tableau_spec.json contract" in labels


def test_tableau_render_contract_scan_detects_missing_contract(tmp_path):
    stage = PlaceholderFixStage()
    out_dir = tmp_path / "out"
    findings = stage._scan_tableau_render_contract_violations(out_dir)
    labels = {item["label"] for item in findings}
    assert "Missing tableau_render_contract.json" in labels


def test_tableau_numeric_coercion_scan_detects_suspicious_string_addition(tmp_path):
    stage = PlaceholderFixStage()
    out_dir = tmp_path / "out"
    src_utils = out_dir / "src" / "utils"
    src_utils.mkdir(parents=True, exist_ok=True)
    (src_utils / "agg.ts").write_text(
        "const row = { value: '10' };\nlet sum = 0;\nsum += row.value;\n",
        encoding="utf-8",
    )
    findings = stage._scan_tableau_numeric_coercion_violations(out_dir)
    labels = {item['label'] for item in findings}
    assert "Possible string aggregation without numeric coercion" in labels


def test_build_snippet_context_deprioritizes_generic_antd_catalog():
    snippets = {
        "antd-components.tsx": "import { Card, Button } from 'antd';\n" * 140,
        "viz-utils.ts": "export const clamp = (value: number) => Math.max(0, value);\n",
    }
    context = build_snippet_context(snippets, limit=2)
    assert "antd-components.tsx" not in context
    assert "viz-utils.ts" in context


def test_tailwind_scan_detects_utility_classes_without_setup(tmp_path):
    stage = PlaceholderFixStage()
    out_dir = tmp_path / "out"
    src = out_dir / "src"
    src.mkdir(parents=True, exist_ok=True)
    (out_dir / "package.json").write_text(
        '{"name":"app","dependencies":{"react":"^19.0.0"},"devDependencies":{"vite":"^7.0.0"}}',
        encoding="utf-8",
    )
    (src / "App.tsx").write_text(
        'export const App = () => <div className="min-h-screen bg-blue-50 flex items-center">Hello</div>;',
        encoding="utf-8",
    )

    findings = stage._scan_tailwind_without_setup(out_dir)
    labels = {item["label"] for item in findings}
    assert "Tailwind utility classes used without Tailwind setup" in labels


def test_placeholder_scan_ignores_logs_and_docs_noise(tmp_path):
    stage = PlaceholderFixStage()
    out_dir = tmp_path / "out"
    src = out_dir / "src"
    src.mkdir(parents=True, exist_ok=True)
    (src / "App.tsx").write_text("export const App = () => <div>Ready</div>;", encoding="utf-8")

    logs_dir = out_dir / "pipeline_logs"
    logs_dir.mkdir(parents=True, exist_ok=True)
    (logs_dir / "placeholder_fix_attempt1.log").write_text("placeholder Sample data TBD TODO", encoding="utf-8")

    docs_dir = out_dir / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)
    (docs_dir / "requirements.md").write_text("## Sample Data\nplaceholder", encoding="utf-8")
    (docs_dir / "workbook.twb").write_text("binary-like TBD bytes", encoding="utf-8")

    findings = stage._scan_placeholders(out_dir)
    assert findings == []


def test_tableau_data_violation_scan_accepts_indirect_fetch_data_url(tmp_path):
    stage = PlaceholderFixStage()
    out_dir = tmp_path / "out"
    src = out_dir / "src"
    services = src / "services"
    services.mkdir(parents=True, exist_ok=True)
    (services / "dataLoader.ts").write_text(
        "const DATA_URL = '/data/orders.csv';\n"
        "export async function load() { return fetch(DATA_URL); }\n",
        encoding="utf-8",
    )
    (src / "App.tsx").write_text(
        "import { load } from './services/dataLoader';\n"
        "export const App = () => { void load(); return null; };\n",
        encoding="utf-8",
    )

    findings = stage._scan_tableau_data_violations(out_dir)
    labels = {item["label"] for item in findings}
    assert "Missing fetch('/data/...') usage in src" not in labels


def test_tailwind_scan_ignores_regular_css_class_names(tmp_path):
    stage = PlaceholderFixStage()
    out_dir = tmp_path / "out"
    src = out_dir / "src"
    src.mkdir(parents=True, exist_ok=True)
    (src / "App.tsx").write_text(
        'export const App = () => <div className="dashboard-grid chart-panel">Hello</div>;',
        encoding="utf-8",
    )

    findings = stage._scan_tailwind_without_setup(out_dir)
    labels = {item["label"] for item in findings}
    assert "Tailwind utility classes used without Tailwind setup" not in labels
