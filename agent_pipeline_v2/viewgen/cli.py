"""CLI: stage ④ — per-view LLM generation for a skeleton project.

Usage:
  python -m agent_pipeline_v2.viewgen.cli <project_dir> [--only view_id] [--attempts 3]

Reads src/specs/views.json + src/specs/interactions.json + public/data/enriched.json
inside the skeleton project, then generates src/views/<View>.tsx one by one.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List

# allow running from repo root without installation
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from agent_pipeline_v2.dataprep.engine import run_query  # noqa: E402
from agent_pipeline_v2.dataprep.csv_loader import EnrichedDataset, CoercionReport  # noqa: E402
from .driver import OpenAICompatDriver  # noqa: E402
from .loop import generate_view  # noqa: E402


def _role_text(role: Dict[str, Any]) -> str:
    if role.get("role") == "source":
        extra = "，空白处点击会清除选择" if role.get("auto_clear") else ""
        return (f"你是交互源视图：用户点击你的图形元素（柱子/点/扇形）时，"
                f"调用 props.onSelect([该元素的 {role['field']} 值]){extra}。")
    if role.get("role") == "target":
        return (f"你是被联动视图：当 props.selection.field === '{role['field']}' 且 values 非空时，"
                f"高亮 props.data 中 {role['field']} 在 values 里的行/图形（其余降低透明度到 0.25）。")
    return ""


def main() -> None:
    parser = argparse.ArgumentParser(description="Stage ④: per-view generation")
    parser.add_argument("project_dir")
    parser.add_argument("--only", help="只生成某个 view_id")
    parser.add_argument("--attempts", type=int, default=3)
    args = parser.parse_args()

    project = Path(args.project_dir)
    specs: Dict[str, Any] = json.loads((project / "src/specs/views.json").read_text(encoding="utf-8"))
    roles_path = project / "src/specs/interactions.json"
    roles: Dict[str, Any] = json.loads(roles_path.read_text(encoding="utf-8")) if roles_path.exists() else {}

    # load columnar data for prompt samples
    payload = json.loads((project / "public/data/enriched.json").read_text(encoding="utf-8"))
    columns = payload["columns"]
    rows = [dict(zip(columns, r)) for r in payload["rows"]]

    driver = OpenAICompatDriver()

    view_ids = [args.only] if args.only else list(specs.keys())
    results = []
    for vid in view_ids:
        spec = specs[vid]
        sample = run_query(rows, spec)[:3]
        role_text = _role_text(roles.get(vid, {}))
        print(f"▶ 生成 {spec['view_name']} ({spec['mark']})...", flush=True)
        result = generate_view(project, spec, sample, driver,
                               interaction_role=role_text, max_attempts=args.attempts)
        status = "✅" if result.success else "❌"
        print(f"  {status} attempts={result.attempts}", flush=True)
        if result.problems:
            for p in result.problems[:3]:
                print(f"     {p[:100]}", flush=True)
        results.append({"view_id": vid, "success": result.success, "attempts": result.attempts,
                        "problems": result.problems})

    ok = sum(1 for r in results if r["success"])
    print(f"\n完成: {ok}/{len(results)} 视图生成成功")
    (project / "pipeline_logs").mkdir(exist_ok=True)
    (project / "pipeline_logs" / "viewgen_results.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
