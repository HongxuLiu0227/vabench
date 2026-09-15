#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import re
from pathlib import Path
from typing import Dict, Any


DEFAULT_MODEL = "claude"


LINE_PATTERN = re.compile(
    r"Project:\s*(?P<dashboard>tableau_dashboard_[^| ]+)\s*\|\s*"
    r"Ex:\s*(?P<ex>[01])\s*\|\s*"
    r"SSIM:\s*(?P<ssim>N/A|[-+]?[\d.]+)\s*\|\s*"
    r"1-MSE:\s*(?P<mse>N/A|[-+]?[\d.]+)\s*\|\s*"
    r"CLIP:\s*(?P<clip>N/A|[-+]?[\d.]+)\s*\|\s*"
    r"TreeBLEU:\s*(?P<tree>N/A|[-+]?[\d.]+)"
)


def _to_float_or_zero(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if not text or text.upper() == "N/A":
        return 0.0
    return float(text)


def parse_eval_details(path: Path) -> Dict[str, Dict[str, float]]:
    metrics: Dict[str, Dict[str, float]] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if "Project:" not in line:
            continue
        m = LINE_PATTERN.search(line)
        if not m:
            continue
        dashboard = m.group("dashboard")
        metrics[dashboard] = {
            "Ex": _to_float_or_zero(m.group("ex")),
            "ssim": _to_float_or_zero(m.group("ssim")),
            "mse_inv": _to_float_or_zero(m.group("mse")),
            "clip": _to_float_or_zero(m.group("clip")),
            "treebleu": _to_float_or_zero(m.group("tree")),
        }
    return metrics


def parse_batch_report(path: Path) -> Dict[str, Dict[str, float]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    summary = payload.get("summary", {})
    dashboards = summary.get("dashboards", [])
    result: Dict[str, Dict[str, float]] = {}
    for item in dashboards:
        if not isinstance(item, dict):
            continue
        name = str(item.get("dashboard", "")).strip()
        if not name.startswith("tableau_dashboard_"):
            continue
        result[name] = {
            "avg_s_data": _to_float_or_zero(item.get("avg_s_data")),
            "avg_s_int": _to_float_or_zero(item.get("avg_s_int")),
        }
    return result


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Compute per-dashboard overall_score and final average from evaluation details + batch report"
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help="Model folder name under img2code_results (e.g. claude, kimi, qwen, glm)",
    )
    parser.add_argument(
        "--output-json",
        default="",
        help="Optional output json path for per-dashboard scores and final mean",
    )
    args = parser.parse_args()

    base_dir = Path(__file__).resolve().parent
    model_dir = base_dir / args.model
    eval_path = model_dir / "evaluation_details-full.txt"
    report_path = model_dir / "batch_report.json"

    if not model_dir.exists() or not model_dir.is_dir():
        raise FileNotFoundError(f"model directory not found: {model_dir}")
    if not eval_path.exists():
        raise FileNotFoundError(f"evaluation details not found: {eval_path}")
    if not report_path.exists():
        raise FileNotFoundError(f"batch report not found: {report_path}")

    eval_metrics = parse_eval_details(eval_path)
    report_metrics = parse_batch_report(report_path)

    dashboards = sorted(set(eval_metrics.keys()) | set(report_metrics.keys()))
    per_dashboard: Dict[str, float] = {}

    for name in dashboards:
        e = eval_metrics.get(name, {})
        r = report_metrics.get(name, {})
        ex = _to_float_or_zero(e.get("Ex"))
        ssim = _to_float_or_zero(e.get("ssim"))
        mse_inv = _to_float_or_zero(e.get("mse_inv"))
        clip = _to_float_or_zero(e.get("clip"))
        treebleu = _to_float_or_zero(e.get("treebleu"))
        avg_s_data = _to_float_or_zero(r.get("avg_s_data"))
        avg_s_int = _to_float_or_zero(r.get("avg_s_int"))

        overall_score = ex * (((ssim + mse_inv + clip + treebleu) / 4.0 + avg_s_data + avg_s_int) / 3.0)
        per_dashboard[name] = overall_score

    final_average = sum(per_dashboard.values()) / len(per_dashboard) if per_dashboard else 0.0

    output = {
        "dashboard_count": len(per_dashboard),
        "final_average_overall_score": final_average,
        "per_dashboard_overall_score": per_dashboard,
    }

    output_text = json.dumps(output, ensure_ascii=False, indent=2)
    print(output_text)

    if args.output_json:
        out_path = Path(args.output_json)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(output_text + "\n", encoding="utf-8")

    default_txt_path = model_dir / "full-result.txt"
    default_txt_path.write_text(output_text + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
