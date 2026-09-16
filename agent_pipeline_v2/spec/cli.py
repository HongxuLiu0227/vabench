"""CLI: dump the WIS for a .twb file.

Usage:
  python -m agent_pipeline_v2.spec.cli path/to/workbook.twb [--out out.json] [--summary]
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from .wis_parser import build_wis


def main() -> None:
    parser = argparse.ArgumentParser(description="Build WIS from a .twb workbook.")
    parser.add_argument("twb", help="Path to the .twb file")
    parser.add_argument("--out", help="Write full WIS JSON here (default: stdout summary only)")
    parser.add_argument("--full", action="store_true", help="Print full JSON to stdout")
    args = parser.parse_args()

    wis = build_wis(args.twb)

    if args.out:
        Path(args.out).write_text(json.dumps(wis, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"WIS written to {args.out}")
    if args.full or not args.out:
        print(json.dumps(wis, ensure_ascii=False, indent=2))
    else:
        print(json.dumps(wis["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
