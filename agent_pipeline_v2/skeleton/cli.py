"""CLI: run stages ①+②+③ for a workbook directory (twb + data/).

Usage:
  python -m agent_pipeline_v2.skeleton.cli <workbook_dir> --out <project_dir> [--force]
"""

from __future__ import annotations

import argparse
from pathlib import Path

from ..spec import build_wis
from ..dataprep.csv_loader import find_data_file, load_enriched_dataset
from ..dataprep.query_spec import derive_view_specs
from .builder import build_project


def main() -> None:
    parser = argparse.ArgumentParser(description="Build dashboard project skeleton from a workbook")
    parser.add_argument("workbook_dir")
    parser.add_argument("--out", required=True)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--limit", type=int, default=None, help="Limit CSV rows (quick test)")
    args = parser.parse_args()

    wb = Path(args.workbook_dir)
    twb = list(wb.glob("*.twb"))[0]

    wis = build_wis(twb)
    ds = wis["datasources"][0] if wis.get("datasources") else {}
    csv = find_data_file(wb / "data", ds.get("caption", ""))
    if csv is None:
        raise SystemExit("no CSV found")
    calc = [cf for ws in wis["worksheets"] for cf in ws["calculated_fields"]]
    dataset = load_enriched_dataset(
        csv, name=ds.get("caption", ""), wis_fields=ds.get("fields", []),
        calculated_fields=calc, sample_limit=args.limit,
    )
    specs = derive_view_specs(wis)

    result = build_project(wis, dataset, specs, args.out, force=args.force)
    print(f"✅ 骨架已生成: {result['out_dir']}")
    print(f"  视图: {result['views']}")
    print(f"  字段名清理: {result['renamed_fields']} 处")
    if result["missing_fields"]:
        print(f"  ⚠️ 订单引用但数据缺失的字段: {result['missing_fields']}")
    print("  下一步: cd <out> && pnpm install && pnpm build")


if __name__ == "__main__":
    main()
