#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import csv
import json
from pathlib import Path
from typing import List


DEFAULT_INPUT = "/root/autodl-tmp/chi26-image2code/img2code_results/claude/batch_report.json"
DEFAULT_OUTPUT = "/root/autodl-tmp/chi26-image2code/img2code_results/claude/dashboard_names_ordered.csv"


def extract_dashboard_names(payload: dict) -> List[str]:
    # 优先使用顶层 dashboards（通常就是原始顺序的名称列表）
    top = payload.get("dashboards")
    if isinstance(top, list) and top and all(isinstance(x, str) for x in top):
        return [x for x in top if x.startswith("tableau_dashboard_")]

    # 兼容 summary.dashboards（对象列表）
    summary = payload.get("summary", {})
    items = summary.get("dashboards", [])
    if isinstance(items, list):
        result = []
        for item in items:
            if isinstance(item, dict):
                name = str(item.get("dashboard", "")).strip()
                if name.startswith("tableau_dashboard_"):
                    result.append(name)
        return result

    return []


def main() -> None:
    parser = argparse.ArgumentParser(description="Export ordered dashboard names to CSV.")
    parser.add_argument("--input", default=DEFAULT_INPUT, help="Path to batch_report.json")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="Output CSV path")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    payload = json.loads(input_path.read_text(encoding="utf-8"))
    names = extract_dashboard_names(payload)
    if not names:
        raise ValueError("No dashboard names found in input json.")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["order", "dashboard"])
        for idx, name in enumerate(names, start=1):
            writer.writerow([idx, name])

    print(f"Exported {len(names)} dashboards to: {output_path}")


if __name__ == "__main__":
    main()
