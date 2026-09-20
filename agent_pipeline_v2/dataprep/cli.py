"""CLI: run stage ② dataprep for a workbook directory.

Usage:
  python -m agent_pipeline_v2.dataprep.cli <workbook_dir> [--limit N] [--out DIR]

workbook_dir is expected to contain one .twb and a data/ folder with CSVs
(the output_twbx_single layout).
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from ..spec import build_wis
from .csv_loader import find_data_file, load_enriched_dataset
from .engine import run_query
from .query_spec import derive_view_specs


def main() -> None:
    parser = argparse.ArgumentParser(description="Stage ② dataprep: WIS + CSV → view-ready data")
    parser.add_argument("workbook_dir", help="Directory containing one .twb and a data/ folder")
    parser.add_argument("--limit", type=int, default=None, help="Limit CSV rows (for quick tests)")
    parser.add_argument("--out", default=None, help="Output directory (default: <workbook_dir>/../dataprep)")
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args()

    wb_dir = Path(args.workbook_dir)
    twbs = list(wb_dir.glob("*.twb"))
    if not twbs:
        raise SystemExit(f"no .twb found in {wb_dir}")
    twb = twbs[0]

    wis = build_wis(twb)
    ds = wis["datasources"][0] if wis.get("datasources") else {}
    caption = ds.get("caption", "")

    csv_path = find_data_file(wb_dir / "data", caption)
    if csv_path is None:
        csvs = list((wb_dir / "data").glob("*.csv"))
        if not csvs:
            raise SystemExit(f"no CSV found under {wb_dir / 'data'}")
        csv_path = csvs[0]
        print(f"⚠️  caption {caption!r} 未精确匹配，使用 {csv_path.name}")

    # collect calculated fields from all worksheets
    calc_fields = []
    for ws in wis["worksheets"]:
        calc_fields.extend(ws.get("calculated_fields", []))

    dataset = load_enriched_dataset(
        csv_path,
        name=caption or csv_path.stem,
        wis_fields=ds.get("fields", []),
        calculated_fields=calc_fields,
        sample_limit=args.limit,
    )

    specs = derive_view_specs(wis)

    results = {}
    for spec in specs:
        rows = run_query(dataset.rows, spec)
        results[spec["view_id"]] = {
            "row_count": len(rows),
            "sample": rows[:5],
        }

    out_dir = Path(args.out) if args.out else wb_dir / "dataprep_out"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "enriched.json").write_text(
        json.dumps(dataset.as_json(), ensure_ascii=False, default=str), encoding="utf-8"
    )
    (out_dir / "view_specs.json").write_text(
        json.dumps(specs, ensure_ascii=False, indent=2, default=str), encoding="utf-8"
    )
    (out_dir / "query_results.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2, default=str), encoding="utf-8"
    )

    if not args.quiet:
        print(f"\n✅ {wb_dir.name}")
        print(f"  数据源: {caption} ← {csv_path.name}  ({len(dataset.rows)} 行)")
        kinds = dataset.report.column_kinds
        fails = dataset.report.failures
        print(f"  列类型: {len(kinds)} 列, 强转失败: {sum(fails.values())} 处")
        if dataset.report.unsupported_formulas:
            print(f"  ⚠️ 不支持的公式: {dataset.report.unsupported_formulas}")
        calc_names = [c.get('caption') or c.get('name') for c in calc_fields]
        if calc_names:
            print(f"  计算字段已物化: {calc_names}")
        print(f"  视图订单 ({len(specs)} 个):")
        for spec in specs:
            res = results[spec["view_id"]]
            gb = ", ".join(g["as"] for g in spec["group_by"]) or "(行级)"
            ag = ", ".join(f"{a['op']}({a['field']})" for a in spec["aggregates"])
            print(f"    ■ {spec['view_name']} [{spec['mark']}] → {res['row_count']} 行")
            print(f"      group_by: {gb}  |  aggregates: {ag}")
        print(f"\n  产物: {out_dir}/")


if __name__ == "__main__":
    main()
