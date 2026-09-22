"""CLI: multi-agent dashboard generation (LangGraph).

Usage:
  python -m agent_pipeline_v2.multiagent.cli <project_dir> [--only view_id]

Requires the skeleton project (stages ①②③) plus a readable WIS summary
(e.g. plan/wis_160_readable.md) for the supervisor.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from agent_pipeline_v2.dataprep.engine import run_query  # noqa: E402
from .graph import build_dashboard_graph  # noqa: E402


def _role_text(role: dict) -> str:
    if role.get("role") == "source":
        extra = "，空白处点击会清除选择" if role.get("auto_clear") else ""
        return (f"你是交互源视图：用户点击你的图形元素（柱子/点/扇形）时，"
                f"调用 props.onSelect([该元素的 {role['field']} 值]){extra}。")
    if role.get("role") == "target":
        return (f"你是被联动视图：当 props.selection.field === '{role['field']}' 且 values 非空时，"
                f"高亮 props.data 中 {role['field']} 在 values 里的行/图形（其余降低透明度到 0.25）。")
    return ""


def main() -> None:
    parser = argparse.ArgumentParser(description="Multi-agent dashboard generation")
    parser.add_argument("project_dir")
    parser.add_argument("--summary", required=True, help="可读版 WIS 说明（md 文件路径）")
    parser.add_argument("--only", help="只生成某个 view_id")
    args = parser.parse_args()

    project = Path(args.project_dir)
    specs = json.loads((project / "src/specs/views.json").read_text(encoding="utf-8"))
    roles_path = project / "src/specs/interactions.json"
    roles = json.loads(roles_path.read_text(encoding="utf-8")) if roles_path.exists() else {}
    payload = json.loads((project / "public/data/enriched.json").read_text(encoding="utf-8"))
    rows = [dict(zip(payload["columns"], r)) for r in payload["rows"]]
    wis_summary = Path(args.summary).read_text(encoding="utf-8")

    view_ids = [args.only] if args.only else list(specs.keys())
    jobs = []
    for vid in view_ids:
        spec = specs[vid]
        jobs.append({
            "view_id": vid,
            "spec": spec,
            "data_sample": run_query(rows, spec)[:3],
            "role_text": _role_text(roles.get(vid, {})),
        })

    app = build_dashboard_graph()
    final = app.invoke({
        "project_dir": str(project),
        "wis_summary": wis_summary,
        "global_guidance": "",
        "jobs": jobs,
        "results": {},
        "round_no": 0,
        "repair_tickets": [],
        "status": "",
    })

    print("\n===== 主管下发的全局指导 =====")
    print(final.get("global_guidance", "")[:600])
    print("\n===== 各视图结果 =====")
    for job in final["jobs"]:
        o = final["results"].get(job["view_id"], {})
        mark = "✅" if o.get("success") else "❌"
        print(f"  {mark} {job['spec'].get('view_name')} attempts={o.get('attempts')}")
        for p in (o.get("problems") or [])[:2]:
            print(f"      {p[:90]}")
    if final.get("repair_tickets"):
        print("\n===== 评估返工单 =====")
        for t in final["repair_tickets"][:8]:
            print(f"  - {t[:100]}")
    ok = sum(1 for o in final["results"].values() if o.get("success"))
    print(f"\n完成: {ok}/{len(final['results'])} 视图成功, status={final.get('status')}")


if __name__ == "__main__":
    main()
