from __future__ import annotations

import asyncio

from .dom_snapshot import (
    choose_best_matching_mark,
    extract_view_delta,
    view_delta_similarity,
    view_state_change,
)
from .models import (
    DashboardSpec,
    EpisodeCompilationTrace,
    EvaluationConfig,
    InteractionEpisode,
    InteractionEpisodeResult,
    InteractionEvaluation,
    InteractionViewResult,
    TriggerSpec,
)
from .playwright_runner import BrowserProjectRunner, serve_project


def compile_reference_episodes(reference_spec: DashboardSpec, config: EvaluationConfig) -> tuple[tuple[InteractionEpisode, ...], EpisodeCompilationTrace]:
    return asyncio.run(_compile_reference_episodes_async(reference_spec, config))


async def _compile_reference_episodes_async(reference_spec: DashboardSpec, config: EvaluationConfig) -> tuple[tuple[InteractionEpisode, ...], EpisodeCompilationTrace]:
    trace = EpisodeCompilationTrace()
    episodes: list[InteractionEpisode] = []

    with serve_project(reference_spec) as reference_url:
        async with BrowserProjectRunner(
            reference_url,
            config.route,
            config.viewport_width,
            config.viewport_height,
            config.page_ready_timeout_ms,
            config.post_load_settle_ms,
        ) as runner:
            for source_id in reference_spec.interaction_sources:
                await runner.reset()
                baseline = await runner.capture_snapshot(reference_spec.worksheet_name_by_id)
                source_view = baseline.views.get(source_id)
                if source_view is None or not source_view.marks:
                    trace.skipped_worksheets.append(source_id)
                    continue

                compiled = await _compile_episode_for_view(
                    runner=runner,
                    baseline=baseline,
                    source_worksheet_id=source_id,
                    source_worksheet_name=reference_spec.worksheet_name_by_id[source_id],
                    worksheet_name_by_id=reference_spec.worksheet_name_by_id,
                    config=config,
                    trace=trace,
                )
                if compiled:
                    episodes.append(compiled)
                else:
                    trace.skipped_worksheets.append(source_id)

    return tuple(episodes), trace


def evaluate_interactions(
    reference_spec: DashboardSpec,
    candidate_spec: DashboardSpec,
    config: EvaluationConfig,
    episodes: tuple[InteractionEpisode, ...] | None = None,
) -> InteractionEvaluation:
    return asyncio.run(_evaluate_interactions_async(reference_spec, candidate_spec, config, episodes))


async def _evaluate_interactions_async(
    reference_spec: DashboardSpec,
    candidate_spec: DashboardSpec,
    config: EvaluationConfig,
    episodes: tuple[InteractionEpisode, ...] | None = None,
) -> InteractionEvaluation:
    episodes = episodes or (await _compile_reference_episodes_async(reference_spec, config))[0]
    if not episodes:
        return InteractionEvaluation(score=0.0, episodes=())

    results: list[InteractionEpisodeResult] = []

    with serve_project(candidate_spec) as candidate_url:
        async with BrowserProjectRunner(
            candidate_url,
            config.route,
            config.viewport_width,
            config.viewport_height,
            config.page_ready_timeout_ms,
            config.post_load_settle_ms,
        ) as runner:
            for episode in episodes:
                await runner.reset()
                baseline = await runner.capture_snapshot(reference_spec.worksheet_name_by_id)
                source_view = baseline.views.get(episode.trigger.source_worksheet_id)
                if source_view is None:
                    results.append(
                        InteractionEpisodeResult(
                            episode_id=episode.id,
                            passed=False,
                            score=0.0,
                            source_worksheet_id=episode.trigger.source_worksheet_id,
                            source_worksheet_name=episode.trigger.source_worksheet_name,
                            view_results=(),
                            diagnostics=("candidate source view could not be matched",),
                        )
                    )
                    continue

                candidate_mark = choose_best_matching_mark(_mark_from_trigger(episode.trigger), source_view.marks)
                if candidate_mark is None:
                    results.append(
                        InteractionEpisodeResult(
                            episode_id=episode.id,
                            passed=False,
                            score=0.0,
                            source_worksheet_id=episode.trigger.source_worksheet_id,
                            source_worksheet_name=episode.trigger.source_worksheet_name,
                            view_results=(),
                            diagnostics=("candidate mark selection failed",),
                        )
                    )
                    continue

                await runner.click_mark(source_view, candidate_mark)
                after = await runner.wait_for_state_change(
                    baseline,
                    reference_spec.worksheet_name_by_id,
                    config.poll_interval_ms,
                    config.interaction_timeout_ms,
                )

                diagnostics: list[str] = []
                view_results: list[InteractionViewResult] = []
                for affected_id in episode.affected_view_ids:
                    expected_delta = episode.reference_view_deltas[affected_id]
                    before_view = baseline.views.get(affected_id)
                    candidate_view = after.views.get(affected_id)
                    if before_view is None or candidate_view is None:
                        issue = f"affected view missing: {affected_id}"
                        diagnostics.append(issue)
                        view_results.append(
                            InteractionViewResult(
                                worksheet_id=affected_id,
                                worksheet_name=reference_spec.worksheet_name_by_id.get(affected_id, affected_id),
                                passed=False,
                                score=0.0,
                                change_detected=False,
                                delta_similarity=0.0,
                                reference_changed_count=expected_delta.total_changed_count,
                                candidate_changed_count=0,
                                diagnostics=(issue,),
                            )
                        )
                        continue

                    change = view_state_change(before_view, candidate_view)
                    candidate_delta = extract_view_delta(before_view, candidate_view)
                    similarity = view_delta_similarity(expected_delta, candidate_delta)
                    view_diagnostics: list[str] = []
                    if change < config.min_state_change or candidate_delta.total_changed_count == 0:
                        view_diagnostics.append(f"affected view did not change enough: {affected_id}")
                    if similarity < config.post_state_similarity_threshold:
                        view_diagnostics.append(f"post-state mismatch: {affected_id}")

                    passed = len(view_diagnostics) == 0
                    if view_diagnostics:
                        diagnostics.extend(view_diagnostics)

                    change_score = min(1.0, change / max(config.min_state_change, 1e-6))
                    coverage_score = (
                        min(candidate_delta.total_changed_count, expected_delta.total_changed_count)
                        / max(expected_delta.total_changed_count, 1)
                    )
                    partial_score = (
                        (config.interaction_change_weight * change_score)
                        + (config.interaction_coverage_weight * coverage_score)
                        + (config.interaction_similarity_weight * similarity)
                    )
                    view_score = 1.0 if passed else partial_score
                    view_results.append(
                        InteractionViewResult(
                            worksheet_id=affected_id,
                            worksheet_name=reference_spec.worksheet_name_by_id.get(affected_id, affected_id),
                            passed=passed,
                            score=view_score,
                            change_detected=change >= config.min_state_change and candidate_delta.total_changed_count > 0,
                            delta_similarity=similarity,
                            reference_changed_count=expected_delta.total_changed_count,
                            candidate_changed_count=candidate_delta.total_changed_count,
                            diagnostics=tuple(view_diagnostics),
                        )
                    )

                episode_score = (
                    sum(result.score for result in view_results) / len(view_results)
                    if view_results
                    else 0.0
                )
                episode_passed = all(result.passed for result in view_results) if view_results else False

                results.append(
                    InteractionEpisodeResult(
                        episode_id=episode.id,
                        passed=episode_passed,
                        score=episode_score,
                        source_worksheet_id=episode.trigger.source_worksheet_id,
                        source_worksheet_name=episode.trigger.source_worksheet_name,
                        selected_mark_title=candidate_mark.title or None,
                        view_results=tuple(view_results),
                        diagnostics=tuple(diagnostics),
                    )
                )

    score = sum(result.score for result in results) / max(len(results), 1)
    return InteractionEvaluation(score=score, episodes=tuple(results))


async def _compile_episode_for_view(
    runner: BrowserProjectRunner,
    baseline,
    source_worksheet_id: str,
    source_worksheet_name: str,
    worksheet_name_by_id: dict[str, str],
    config: EvaluationConfig,
    trace: EpisodeCompilationTrace,
) -> InteractionEpisode | None:
    source_view = baseline.views.get(source_worksheet_id)
    if source_view is None:
        return None

    for candidate_mark in source_view.marks[: config.max_trigger_candidates]:
        trace.attempted_marks += 1
        await runner.reset()
        fresh_baseline = await runner.capture_snapshot(worksheet_name_by_id)
        fresh_source_view = fresh_baseline.views.get(source_worksheet_id)
        if fresh_source_view is None:
            return None

        fresh_mark = choose_best_matching_mark(candidate_mark, fresh_source_view.marks)
        if fresh_mark is None:
            continue

        await runner.click_mark(fresh_source_view, fresh_mark)
        after = await runner.wait_for_state_change(
            fresh_baseline,
            worksheet_name_by_id,
            config.poll_interval_ms,
            config.interaction_timeout_ms,
        )
        changed_views = _changed_views(fresh_baseline.views, after.views, config.min_state_change)
        changed_views = tuple(view_id for view_id in changed_views if view_id != source_worksheet_id)
        if len(changed_views) < config.min_affected_views:
            continue

        reference_deltas = {
            view_id: extract_view_delta(fresh_baseline.views[view_id], after.views[view_id])
            for view_id in changed_views
        }

        return InteractionEpisode(
            id=f"ep_{source_worksheet_id}",
            trigger=TriggerSpec(
                source_worksheet_id=source_worksheet_id,
                source_worksheet_name=source_worksheet_name,
                reference_mark_index=fresh_mark.index,
                mark_tag=fresh_mark.tag,
                mark_title=fresh_mark.title,
                normalized_x=fresh_mark.center_x,
                normalized_y=fresh_mark.center_y,
                normalized_area=fresh_mark.area,
            ),
            affected_view_ids=changed_views,
            reference_view_deltas=reference_deltas,
        )

    return None


def _changed_views(before_views, after_views, min_change: float) -> list[str]:
    changed: list[str] = []
    for view_id, before_view in before_views.items():
        after_view = after_views.get(view_id)
        if after_view is None:
            continue
        if view_state_change(before_view, after_view) >= min_change:
            changed.append(view_id)
    return changed


def _mark_from_trigger(trigger: TriggerSpec):
    from .models import MarkSnapshot

    return MarkSnapshot(
        index=trigger.reference_mark_index,
        tag=trigger.mark_tag,
        title=trigger.mark_title,
        center_x=trigger.normalized_x,
        center_y=trigger.normalized_y,
        width=0.0,
        height=0.0,
        area=trigger.normalized_area,
        fill="",
        stroke="",
        opacity=1.0,
    )
