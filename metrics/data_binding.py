from __future__ import annotations

import asyncio
from pathlib import Path

from .dom_snapshot import title_similarity, view_data_similarity
from .models import DataBindingEvaluation, DashboardSpec, EvaluationConfig, ViewMatchResult
from .playwright_runner import BrowserProjectRunner, serve_project


def evaluate_data_binding(reference_spec: DashboardSpec, candidate_spec: DashboardSpec, config: EvaluationConfig) -> DataBindingEvaluation:
    return asyncio.run(_evaluate_data_binding_async(reference_spec, candidate_spec, config))


async def _evaluate_data_binding_async(reference_spec: DashboardSpec, candidate_spec: DashboardSpec, config: EvaluationConfig) -> DataBindingEvaluation:
    with serve_project(reference_spec) as reference_url, serve_project(candidate_spec) as candidate_url:
        async with BrowserProjectRunner(
            reference_url,
            config.route,
            config.viewport_width,
            config.viewport_height,
            config.page_ready_timeout_ms,
            config.post_load_settle_ms,
        ) as reference_runner, BrowserProjectRunner(
            candidate_url,
            config.route,
            config.viewport_width,
            config.viewport_height,
            config.page_ready_timeout_ms,
            config.post_load_settle_ms,
        ) as candidate_runner:
            await reference_runner.reset()
            await candidate_runner.reset()
            reference_snapshot = await reference_runner.capture_snapshot(reference_spec.worksheet_name_by_id)
            candidate_snapshot = await candidate_runner.capture_snapshot(reference_spec.worksheet_name_by_id)

    reference_data_files = _discover_data_files(reference_spec.servable_dir, reference_snapshot.data_requests, config.data_request_folder_name)
    candidate_data_files = _discover_data_files(candidate_spec.servable_dir, candidate_snapshot.data_requests, config.data_request_folder_name)
    data_file_match = bool(candidate_data_files) and set(candidate_data_files).issubset(set(reference_data_files))

    per_view: list[ViewMatchResult] = []
    total_score = 0.0
    for worksheet in reference_spec.worksheets:
        reference_view = reference_snapshot.views.get(worksheet.id)
        candidate_view = candidate_snapshot.views.get(worksheet.id)
        if reference_view is None or candidate_view is None or not data_file_match:
            score = 0.0
            missing = candidate_view is None
            matched_title = candidate_view.title if candidate_view else None
            diagnostics = []
            if not data_file_match:
                diagnostics.append("candidate data files do not match reference")
            if reference_view is None:
                diagnostics.append("reference view could not be extracted")
            if candidate_view is None:
                diagnostics.append("candidate view could not be matched")
        else:
            score = view_data_similarity(
                reference_view,
                candidate_view,
                text_weight=config.data_text_weight,
                geometry_weight=config.data_geometry_weight,
            )
            missing = False
            matched_title = candidate_view.title
            diagnostics = []
            similarity = title_similarity(worksheet.name, candidate_view.title)
            if similarity < 0.7:
                diagnostics.append("view title matched heuristically")

        total_score += score
        per_view.append(
            ViewMatchResult(
                worksheet_id=worksheet.id,
                worksheet_name=worksheet.name,
                score=score,
                matched_title=matched_title,
                missing=missing,
                diagnostics=tuple(diagnostics),
            )
        )

    overall = total_score / max(len(reference_spec.worksheets), 1)
    return DataBindingEvaluation(
        score=overall,
        data_file_match=data_file_match,
        reference_data_files=tuple(reference_data_files),
        candidate_data_files=tuple(candidate_data_files),
        per_view=tuple(per_view),
    )


def _discover_data_files(servable_dir: Path, request_paths: tuple[str, ...], folder_name: str) -> list[str]:
    requested = sorted({Path(path).name for path in request_paths if f"/{folder_name}/" in path})
    if requested:
        return requested

    data_dir = servable_dir / folder_name
    if data_dir.is_dir():
        return sorted(file_path.name for file_path in data_dir.iterdir() if file_path.is_file())
    return []
