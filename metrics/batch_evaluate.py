from __future__ import annotations

import argparse
import csv
import json
from dataclasses import asdict
from pathlib import Path
from statistics import mean
from typing import Any

from .contracts import load_dashboard_spec
from .evaluate import evaluate_pair
from .interaction import compile_reference_episodes
from .models import EvaluationConfig


def discover_candidate_roots(reference_root: Path) -> list[Path]:
    parent = reference_root.parent
    return sorted(
        child
        for child in parent.iterdir()
        if child.is_dir() and child.name != reference_root.name
    )


def discover_dashboard_names(reference_root: Path) -> list[str]:
    return sorted(child.name for child in reference_root.iterdir() if child.is_dir())


def build_summary(case_reports: list[dict[str, Any]]) -> dict[str, Any]:
    successful = [case for case in case_reports if case["status"] == "ok"]
    models = sorted({case["model"] for case in case_reports})
    dashboards = sorted({case["dashboard"] for case in case_reports})

    by_model: list[dict[str, Any]] = []
    for model in models:
        model_cases = [case for case in case_reports if case["model"] == model]
        ok_cases = [case for case in model_cases if case["status"] == "ok"]
        by_model.append(
            {
                "model": model,
                "cases_total": len(model_cases),
                "cases_ok": len(ok_cases),
                "avg_s_data": mean(case["s_data"] for case in ok_cases) if ok_cases else None,
                "avg_s_int": mean(case["s_int"] for case in ok_cases) if ok_cases else None,
            }
        )

    by_dashboard: list[dict[str, Any]] = []
    for dashboard in dashboards:
        dashboard_cases = [case for case in case_reports if case["dashboard"] == dashboard]
        ok_cases = [case for case in dashboard_cases if case["status"] == "ok"]
        by_dashboard.append(
            {
                "dashboard": dashboard,
                "cases_total": len(dashboard_cases),
                "cases_ok": len(ok_cases),
                "avg_s_data": mean(case["s_data"] for case in ok_cases) if ok_cases else None,
                "avg_s_int": mean(case["s_int"] for case in ok_cases) if ok_cases else None,
            }
        )

    return {
        "cases_total": len(case_reports),
        "cases_ok": len(successful),
        "models": by_model,
        "dashboards": by_dashboard,
    }


def make_case_row(
    *,
    model: str,
    dashboard: str,
    candidate_project: Path,
    report: dict[str, Any] | None,
    error: str | None,
) -> dict[str, Any]:
    if report is None:
        return {
            "model": model,
            "dashboard": dashboard,
            "candidate_project": str(candidate_project),
            "status": "error",
            "s_data": None,
            "s_int": None,
            "data_file_match": None,
            "compiled_episode_count": None,
            "error": error,
        }

    data_binding = report.get("data_binding") or {}
    interaction = report.get("interaction") or {}
    return {
        "model": model,
        "dashboard": dashboard,
        "candidate_project": str(candidate_project),
        "status": "ok",
        "s_data": data_binding.get("score"),
        "s_int": interaction.get("score"),
        "data_file_match": data_binding.get("data_file_match"),
        "compiled_episode_count": report.get("compiled_episode_count"),
        "error": None,
    }


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "model",
        "dashboard",
        "candidate_project",
        "status",
        "s_data",
        "s_int",
        "data_file_match",
        "compiled_episode_count",
        "error",
    ]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def run_batch(
    *,
    reference_root: Path,
    candidate_roots: list[Path],
    dashboards: list[str],
    config: EvaluationConfig,
    include_data_binding: bool,
    include_interaction: bool,
) -> dict[str, Any]:
    case_rows: list[dict[str, Any]] = []
    full_reports: list[dict[str, Any]] = []

    for dashboard in dashboards:
        reference_project = reference_root / dashboard
        reference_spec = load_dashboard_spec(reference_project)

        precompiled_episodes = None
        precompiled_trace = None
        compile_error = None
        if include_interaction:
            try:
                episodes, trace = compile_reference_episodes(reference_spec, config)
                precompiled_episodes = episodes
                precompiled_trace = asdict(trace)
            except Exception as error:  # pragma: no cover - batch robustness
                compile_error = f"reference episode compilation failed: {error}"

        for candidate_root in candidate_roots:
            candidate_project = candidate_root / dashboard
            model = candidate_root.name
            if not candidate_project.exists():
                row = make_case_row(
                    model=model,
                    dashboard=dashboard,
                    candidate_project=candidate_project,
                    report=None,
                    error="candidate project missing",
                )
                case_rows.append(row)
                full_reports.append(row)
                continue

            try:
                if include_interaction and compile_error is not None:
                    raise RuntimeError(compile_error)

                report = evaluate_pair(
                    reference_spec,
                    candidate_project,
                    config,
                    include_data_binding=include_data_binding,
                    include_interaction=include_interaction,
                    precompiled_episodes=precompiled_episodes,
                    episode_trace=precompiled_trace,
                )
                row = make_case_row(
                    model=model,
                    dashboard=dashboard,
                    candidate_project=candidate_project,
                    report=report,
                    error=None,
                )
                case_rows.append(row)
                full_reports.append(
                    {
                        "model": model,
                        "dashboard": dashboard,
                        "status": "ok",
                        "report": report,
                    }
                )
            except Exception as error:  # pragma: no cover - batch robustness
                row = make_case_row(
                    model=model,
                    dashboard=dashboard,
                    candidate_project=candidate_project,
                    report=None,
                    error=str(error),
                )
                case_rows.append(row)
                full_reports.append(row)

    return {
        "reference_root": str(reference_root),
        "candidate_roots": [str(root) for root in candidate_roots],
        "dashboards": dashboards,
        "summary": build_summary(case_rows),
        "cases": case_rows,
        "full_reports": full_reports,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Batch-evaluate dashboard samples against samples/ours ground truth.")
    parser.add_argument("--reference-root", default="samples/ours", help="Directory containing ground-truth dashboards.")
    parser.add_argument("--candidate-roots", nargs="*", help="Directories containing candidate dashboards. Defaults to siblings of reference root.")
    parser.add_argument("--dashboards", nargs="*", help="Specific dashboard directory names to evaluate.")
    parser.add_argument("--route", default="/", help="Dashboard route to open. Defaults to '/'.")
    parser.add_argument("--skip-data-binding", action="store_true")
    parser.add_argument("--skip-interaction", action="store_true")
    parser.add_argument("--output-json", default="metrics/output/batch_report.json")
    parser.add_argument("--output-csv", default="metrics/output/batch_summary.csv")
    parser.add_argument("--json-indent", type=int, default=2)
    args = parser.parse_args()

    reference_root = Path(args.reference_root).expanduser().resolve()
    candidate_roots = (
        [Path(root).expanduser().resolve() for root in args.candidate_roots]
        if args.candidate_roots
        else discover_candidate_roots(reference_root)
    )
    dashboards = args.dashboards or discover_dashboard_names(reference_root)
    config = EvaluationConfig(route=args.route)

    batch_report = run_batch(
        reference_root=reference_root,
        candidate_roots=candidate_roots,
        dashboards=dashboards,
        config=config,
        include_data_binding=not args.skip_data_binding,
        include_interaction=not args.skip_interaction,
    )

    json_path = Path(args.output_json).expanduser().resolve()
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(batch_report, indent=args.json_indent, ensure_ascii=False), encoding="utf-8")

    csv_path = Path(args.output_csv).expanduser().resolve()
    write_csv(csv_path, batch_report["cases"])

    print(json.dumps(batch_report["summary"], indent=args.json_indent, ensure_ascii=False))
    print(f"Wrote JSON report to {json_path}")
    print(f"Wrote CSV summary to {csv_path}")


if __name__ == "__main__":
    main()
