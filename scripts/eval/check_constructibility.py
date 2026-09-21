#!/usr/bin/env python3
"""Run constructibility checks over the whole corpus; write a verdict report."""
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from agent_pipeline_v2.spec import build_wis  # noqa: E402
from agent_pipeline_v2.dataprep.csv_loader import find_data_file, load_enriched_dataset  # noqa: E402
from agent_pipeline_v2.dataprep.query_spec import derive_view_specs  # noqa: E402
from agent_pipeline_v2.dataprep.engine import run_query  # noqa: E402
from agent_pipeline_v2.dataprep.constructibility import check_constructibility  # noqa: E402

ROOT = Path("output/dashboard/output_twbx_single")
OUT = Path("output/dataprep/constructibility_report.json")


def process(d: Path) -> dict:
    rec = {"dir": d.name}
    twbs = list(d.glob("*.twb"))
    if not twbs:
        return {**rec, "status": "reject", "reasons": [{"tier": "reject", "kind": "no_twb", "detail": ""}]}
    wis = build_wis(twbs[0])
    ds = wis["datasources"][0] if wis.get("datasources") else {}
    csv = find_data_file(d / "data", ds.get("caption", ""))
    if csv is None:
        return {**rec, "status": "reject", "reasons": [{"tier": "reject", "kind": "no_csv", "detail": ds.get("caption", "")}]}
    calc = [cf for ws in wis["worksheets"] for cf in ws["calculated_fields"]]
    dataset = load_enriched_dataset(csv, name=ds.get("caption", ""), wis_fields=ds.get("fields", []),
                                    calculated_fields=calc)
    specs = derive_view_specs(wis)
    results = {}
    for spec in specs:
        try:
            results[spec["view_id"]] = run_query(dataset.rows, spec)
        except Exception as e:
            results[spec["view_id"]] = []
    verdict = check_constructibility(wis, dataset.columns, dataset.report.unsupported_formulas,
                                     specs, results)
    return {**rec, **verdict, "rows": len(dataset.rows), "views": len(specs)}


def main() -> None:
    dirs = sorted(p for p in ROOT.iterdir() if p.is_dir())
    report = []
    for i, d in enumerate(dirs, 1):
        t0 = time.time()
        try:
            rec = process(d)
        except Exception as e:
            rec = {"dir": d.name, "status": "reject",
                   "reasons": [{"tier": "reject", "kind": "exception", "detail": f"{type(e).__name__}: {e}"}]}
        rec["elapsed"] = round(time.time() - t0, 1)
        report.append(rec)
        print(f"[{i}/{len(dirs)}] {rec['status']:6} {d.name[:50]} ({rec['elapsed']}s)", flush=True)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    from collections import Counter
    stats = Counter(r["status"] for r in report)
    print(f"\n完成 → {OUT}")
    print(dict(stats))


if __name__ == "__main__":
    main()
