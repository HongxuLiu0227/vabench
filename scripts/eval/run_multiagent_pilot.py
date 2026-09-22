#!/usr/bin/env python3
"""Pilot: run stages ①②③ + multi-agent generation for N workbooks end to end.

For each workbook: skeleton → multiagent graph → npm build → screenshot.
Writes plan/pilot_report.json and renders into plan/pilot_renders/.
"""
import json
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from agent_pipeline_v2.spec import build_wis  # noqa: E402
from agent_pipeline_v2.dataprep.csv_loader import find_data_file, load_enriched_dataset  # noqa: E402
from agent_pipeline_v2.dataprep.query_spec import derive_view_specs  # noqa: E402
from agent_pipeline_v2.dataprep.engine import run_query  # noqa: E402
from agent_pipeline_v2.skeleton.builder import build_project  # noqa: E402
from agent_pipeline_v2.multiagent.graph import build_dashboard_graph  # noqa: E402

ROOT = Path("output/dashboard/output_twbx_single")
OUT_ROOT = Path("output/gen_v2")
RENDER_DIR = Path("plan/pilot_renders")
SHOT_JS = Path("/tmp/shot_one.js")

PILOTS = [
    "10394_dash_dashboard0.png__TableauWorkbook",
    "8501_dash_dashboard0.png__Dashboard9",
    "10115_dash_dashboard0.png__Suicide_20Trends",
    "3572_dash_dashboard0.png__Human_20Resources",
    "19_dash_dashboard0.png__Nihad_dashboard",
]


def wis_summary(wis: dict) -> str:
    """Compact readable summary for the supervisor (subset of the full readable md)."""
    lines = [f"# Dashboard: {wis['dashboards'][0]['name'] if wis.get('dashboards') else ''}"]
    for ws in wis.get("worksheets", []):
        if not ws.get("on_dashboard"):
            continue
        m = ws["mark"]
        fields = []
        for axis in ("rows", "cols"):
            for f in ws.get("fields_used", []):
                if f.get("is_action_placeholder"):
                    continue
                name = ("" if f["derivation"] == "None" else f"[{f['derivation']}]") + f["name"]
                if name not in fields:
                    fields.append(name)
        color = ws["encodings"].get("color", [])
        color_txt = f"，颜色按 {color[0]['field']['name']}" if color else ""
        lines.append(f"- 视图「{ws['name'].strip()}」: {m['resolved']}（{m['confidence']}），字段: {', '.join(fields[:6])}{color_txt}")
    for a in wis.get("actions", []):
        lines.append(f"- 交互: 在「{a['source'].get('worksheet', '').strip()}」{a['activation'].get('type')} → {a['command']} → 影响 {', '.join(x.strip() for x in a.get('linked_worksheets', []))}")
    return "\n".join(lines)


def role_text(role: dict) -> str:
    if role.get("role") == "source":
        return (f"你是交互源视图：用户点击你的图形元素时，"
                f"调用 props.onSelect([该元素的 {role['field']} 值])。")
    if role.get("role") == "target":
        return (f"你是被联动视图：当 props.selection.field === '{role['field']}' 且 values 非空时，"
                f"高亮匹配行/图形（其余淡化到 0.25）。")
    return ""


def process(d: Path, app) -> dict:
    rec = {"dir": d.name, "t0": time.time()}
    twb = list(d.glob("*.twb"))[0]
    wis = build_wis(twb)
    ds = wis["datasources"][0] if wis.get("datasources") else {}
    csv = find_data_file(d / "data", ds.get("caption", ""))
    calc = [cf for ws in wis["worksheets"] for cf in ws["calculated_fields"]]
    dataset = load_enriched_dataset(csv, name=ds.get("caption", ""),
                                    wis_fields=ds.get("fields", []), calculated_fields=calc)
    specs = derive_view_specs(wis)
    vid = d.name.split("_")[0]
    out = OUT_ROOT / f"pilot_{vid}"
    result = build_project(wis, dataset, specs, out, force=True)

    roles_path = out / "src/specs/interactions.json"
    roles = json.loads(roles_path.read_text(encoding="utf-8")) if roles_path.exists() else {}
    payload = json.loads((out / "public/data/enriched.json").read_text(encoding="utf-8"))
    rows = [dict(zip(payload["columns"], r)) for r in payload["rows"]]

    jobs = []
    for spec in json.loads((out / "src/specs/views.json").read_text(encoding="utf-8")).values():
        jobs.append({
            "view_id": spec["view_id"], "spec": spec,
            "data_sample": run_query(rows, spec)[:3],
            "role_text": role_text(roles.get(spec["view_id"], {})),
        })

    final = app.invoke({
        "project_dir": str(out), "wis_summary": wis_summary(wis), "global_guidance": "",
        "jobs": jobs, "results": {}, "round_no": 0, "repair_tickets": [], "status": "",
    })

    npm = subprocess.run(["npm", "install", "--no-audit", "--no-fund"], cwd=out,
                         capture_output=True, text=True, timeout=600)
    build = subprocess.run(["npm", "run", "build"], cwd=out,
                           capture_output=True, text=True, timeout=600) if npm.returncode == 0 else npm

    ok_views = sum(1 for o in final["results"].values() if o.get("success"))
    attempts = {vid: o.get("attempts") for vid, o in final["results"].items()}
    rec.update({
        "views": len(jobs), "views_ok": ok_views, "attempts": attempts,
        "build_ok": build.returncode == 0,
        "guidance": final.get("global_guidance", "")[:300],
        "tickets": final.get("repair_tickets", [])[:5],
        "elapsed": round(time.time() - rec.pop("t0"), 1),
        "out_dir": str(out),
    })

    if build.returncode == 0:
        RENDER_DIR.mkdir(exist_ok=True)
        shot = RENDER_DIR / f"pilot_{vid}.png"
        port = 4600 + int(vid) % 100 if vid.isdigit() else 4600
        proc = subprocess.Popen(["npx", "vite", "preview", "--port", str(port), "--host", "127.0.0.1"],
                                cwd=out, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            time.sleep(3)
            subprocess.run(["node", str(SHOT_JS), f"http://127.0.0.1:{port}/", str(shot), "1280", "900"],
                           capture_output=True, timeout=120)
            rec["render"] = str(shot)
        finally:
            proc.terminate()
    return rec


def main() -> None:
    app = build_dashboard_graph()
    reports = []
    for i, name in enumerate(PILOTS, 1):
        d = ROOT / name
        try:
            rec = process(d, app)
            print(f"[{i}/{len(PILOTS)}] ✅ {name[:45]} 视图 {rec['views_ok']}/{rec['views']} build={rec['build_ok']} ({rec['elapsed']}s)", flush=True)
        except Exception as e:
            rec = {"dir": name, "error": f"{type(e).__name__}: {e}"}
            print(f"[{i}/{len(PILOTS)}] ❌ {name[:45]} {rec['error'][:80]}", flush=True)
        reports.append(rec)

    Path("plan/pilot_report.json").write_text(json.dumps(reports, ensure_ascii=False, indent=2))
    print("\n报告: plan/pilot_report.json")


if __name__ == "__main__":
    main()
