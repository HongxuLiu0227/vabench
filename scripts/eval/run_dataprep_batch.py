#!/usr/bin/env python3
"""Batch-run stage ② dataprep over the whole output_twbx_single corpus.

Writes a JSONL report per workbook: rows, views, coercion failures,
unsupported formulas, query errors, elapsed time.
"""
import json
import sys
import time
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from agent_pipeline_v2.spec import build_wis  # noqa: E402
from agent_pipeline_v2.dataprep.csv_loader import find_data_file, load_enriched_dataset  # noqa: E402
from agent_pipeline_v2.dataprep.query_spec import derive_view_specs  # noqa: E402
from agent_pipeline_v2.dataprep.engine import run_query  # noqa: E402

ROOT = Path("output/dashboard/output_twbx_single")
OUT = Path("output/dataprep/batch_report.jsonl")


def process(d: Path) -> dict:
    t0 = time.time()
    rec = {"dir": d.name, "ok": False, "elapsed": 0.0}
    twbs = list(d.glob("*.twb"))
    if not twbs:
        rec["error"] = "no_twb"
        return rec
    try:
        wis = build_wis(twbs[0])
        ds = wis["datasources"][0] if wis.get("datasources") else {}
        csv = find_data_file(d / "data", ds.get("caption", ""))
        if csv is None:
            rec["error"] = f"no_csv_for:{ds.get('caption', '')[:40]}"
            return rec
        calc = [cf for ws in wis["worksheets"] for cf in ws["calculated_fields"]]
        dataset = load_enriched_dataset(
            csv, name=ds.get("caption", ""), wis_fields=ds.get("fields", []),
            calculated_fields=calc,
        )
        specs = derive_view_specs(wis)
        view_errors = []
        for spec in specs:
            try:
                run_query(dataset.rows, spec)
            except Exception as e:
                view_errors.append(f"{spec['view_name']}: {type(e).__name__}: {e}")
        rec.update({
            "ok": not view_errors,
            "csv": csv.name,
            "rows": len(dataset.rows),
            "views": len(specs),
            "coercion_failures": sum(dataset.report.failures.values()),
            "unsupported_formulas": dataset.report.unsupported_formulas,
            "view_errors": view_errors,
        })
    except Exception as e:
        rec["error"] = f"{type(e).__name__}: {e}"
        rec["trace"] = traceback.format_exc()[-400:]
    finally:
        rec["elapsed"] = round(time.time() - t0, 1)
    return rec


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    dirs = sorted(p for p in ROOT.iterdir() if p.is_dir())
    ok = 0
    with OUT.open("w", encoding="utf-8") as fh:
        for i, d in enumerate(dirs, 1):
            rec = process(d)
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
            fh.flush()
            status = "✅" if rec["ok"] else "❌"
            ok += rec["ok"]
            print(f"[{i}/{len(dirs)}] {status} {d.name[:55]} ({rec['elapsed']}s)", flush=True)
    print(f"\n完成: {ok}/{len(dirs)} 通过 → {OUT}")


if __name__ == "__main__":
    main()
