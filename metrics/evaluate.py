from __future__ import annotations

import argparse
import json
from dataclasses import asdict
from pathlib import Path
from typing import Any

from .contracts import load_dashboard_spec
from .data_binding import evaluate_data_binding
from .interaction import compile_reference_episodes, evaluate_interactions
from .models import DashboardSpec, EvaluationConfig, InteractionEpisode


def evaluate_pair(
    reference_project: str | Path | DashboardSpec,
    candidate_project: str | Path | DashboardSpec,
    config: EvaluationConfig,
    *,
    include_data_binding: bool = True,
    include_interaction: bool = True,
    precompiled_episodes: tuple[InteractionEpisode, ...] | None = None,
    episode_trace: dict[str, Any] | None = None,
) -> dict[str, object]:
    reference_spec = reference_project if isinstance(reference_project, DashboardSpec) else load_dashboard_spec(reference_project)
    candidate_spec = candidate_project if isinstance(candidate_project, DashboardSpec) else load_dashboard_spec(candidate_project)

    report: dict[str, object] = {
        "reference_project": str(reference_spec.project_root),
        "candidate_project": str(candidate_spec.project_root),
    }

    if include_data_binding:
        report["data_binding"] = asdict(evaluate_data_binding(reference_spec, candidate_spec, config))

    if include_interaction:
        episodes = precompiled_episodes
        trace_payload = episode_trace
        if episodes is None:
            episodes, trace = compile_reference_episodes(reference_spec, config)
            trace_payload = asdict(trace)
        report["compiled_episode_count"] = len(episodes)
        report["episode_compilation_trace"] = trace_payload
        report["interaction"] = asdict(evaluate_interactions(reference_spec, candidate_spec, config, episodes))

    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate generated dashboard data binding and interaction quality.")
    parser.add_argument("--reference-project", required=True, help="Path to the ground-truth dashboard project (usually samples/ours/...).")
    parser.add_argument("--candidate-project", required=True, help="Path to the dashboard project being evaluated.")
    parser.add_argument("--route", default="/", help="Dashboard route to open. Defaults to '/'.")
    parser.add_argument("--skip-data-binding", action="store_true")
    parser.add_argument("--skip-interaction", action="store_true")
    parser.add_argument("--json-indent", type=int, default=2)
    args = parser.parse_args()

    config = EvaluationConfig(route=args.route)
    report = evaluate_pair(
        args.reference_project,
        args.candidate_project,
        config,
        include_data_binding=not args.skip_data_binding,
        include_interaction=not args.skip_interaction,
    )

    print(json.dumps(report, indent=args.json_indent, ensure_ascii=False))


if __name__ == "__main__":
    main()
