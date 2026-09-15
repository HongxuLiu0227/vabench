#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
from pathlib import Path
from typing import Dict, List, Tuple


DEFAULT_MODELS = ["claude", "kimi", "qwen", "glm"]


def normalize_dashboard_name(raw: str) -> str:
    text = raw.strip()
    if not text:
        return ""
    if text.startswith("tableau_dashboard_"):
        return text
    return f"tableau_dashboard_{text}"


def parse_bar_file(path: Path) -> List[str]:
    dashboards: List[str] = []
    seen = set()
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        name = normalize_dashboard_name(raw_line)
        if not name or name in seen:
            continue
        seen.add(name)
        dashboards.append(name)
    return dashboards


def parse_models(raw_models: str) -> List[str]:
    items = [m.strip() for m in raw_models.split(",")]
    return [m for m in items if m]


def load_model_scores(model_result_path: Path) -> Dict[str, float]:
    payload = json.loads(model_result_path.read_text(encoding="utf-8"))
    per_dashboard = payload.get("per_dashboard_overall_score", {})
    if not isinstance(per_dashboard, dict):
        return {}
    result: Dict[str, float] = {}
    for name, value in per_dashboard.items():
        if not isinstance(name, str):
            continue
        try:
            result[name] = float(value)
        except (TypeError, ValueError):
            continue
    return result


def collect_for_model(
    base_dir: Path, model: str, dashboards: List[str]
) -> Tuple[Dict[str, float], List[str]]:
    result_path = base_dir / model / "full-result.txt"
    if not result_path.exists():
        return {}, dashboards
    model_scores = load_model_scores(result_path)
    found: Dict[str, float] = {}
    missing: List[str] = []
    for dashboard in dashboards:
        if dashboard in model_scores:
            found[dashboard] = model_scores[dashboard]
        else:
            missing.append(dashboard)
    return found, missing


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Calculate per-model mean overall_score for dashboards listed in a bar file."
        )
    )
    parser.add_argument(
        "--bar-file",
        required=True,
        help="Path to bar.txt (each line is dashboard id or full tableau_dashboard_* name).",
    )
    parser.add_argument(
        "--models",
        default=",".join(DEFAULT_MODELS),
        help="Comma-separated model folders under img2code_results, e.g. claude,kimi,qwen,glm",
    )
    parser.add_argument(
        "--output-json",
        default="",
        help="Optional output json path.",
    )
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    bar_path = Path(args.bar_file).expanduser().resolve()
    if not bar_path.exists():
        raise FileNotFoundError(f"bar file not found: {bar_path}")

    dashboards = parse_bar_file(bar_path)
    if not dashboards:
        raise ValueError(f"no valid dashboard ids found in: {bar_path}")

    models = parse_models(args.models)
    if not models:
        raise ValueError("no valid models provided")

    model_results = {}
    for model in models:
        found, missing = collect_for_model(script_dir, model, dashboards)
        avg_score = sum(found.values()) / len(found) if found else 0.0
        model_results[model] = {
            "dashboard_count_requested": len(dashboards),
            "dashboard_count_found": len(found),
            "dashboard_count_missing": len(missing),
            "average_overall_score_on_found": avg_score,
            "per_dashboard_overall_score": found,
            "missing_dashboards": missing,
        }

    model_average_scores = {
        model: details["average_overall_score_on_found"]
        for model, details in model_results.items()
    }

    output = {
        "bar_file": str(bar_path),
        "requested_dashboards": dashboards,
        "model_average_scores": model_average_scores,
        "models": model_results,
    }
    output_text = json.dumps(output, ensure_ascii=False, indent=2)
    print(output_text)

    if args.output_json:
        out_path = Path(args.output_json).expanduser().resolve()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(output_text + "\n", encoding="utf-8")
        summary_path = out_path.with_name(f"{out_path.stem}_summary.txt")
        summary_lines = [f"{model}: {score}" for model, score in model_average_scores.items()]
        summary_path.write_text("\n".join(summary_lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
