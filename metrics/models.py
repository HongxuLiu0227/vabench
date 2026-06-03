from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class WorksheetSpec:
    id: str
    name: str
    chart_intent: str


@dataclass(frozen=True)
class DashboardSpec:
    project_root: Path
    servable_dir: Path
    serve_mode: str
    render_contract_path: Path
    interaction_contract_path: Path
    worksheets: tuple[WorksheetSpec, ...]
    interaction_sources: tuple[str, ...]
    worksheet_name_by_id: dict[str, str]


@dataclass(frozen=True)
class MarkSnapshot:
    index: int
    tag: str
    title: str
    center_x: float
    center_y: float
    width: float
    height: float
    area: float
    fill: str
    stroke: str
    opacity: float
    cursor: str = ""

    def data_tokens(self) -> list[str]:
        return [
            f"tag:{self.tag}",
            f"cx:{self.center_x:.3f}",
            f"cy:{self.center_y:.3f}",
            f"w:{self.width:.3f}",
            f"h:{self.height:.3f}",
            f"a:{self.area:.3f}",
        ]

    def state_tokens(self) -> list[str]:
        return self.data_tokens() + [
            f"fill:{self.fill}",
            f"stroke:{self.stroke}",
            f"opacity:{self.opacity:.2f}",
        ]


@dataclass(frozen=True)
class ViewSnapshot:
    title: str
    order: int
    bbox_top: float
    bbox_left: float
    bbox_width: float
    bbox_height: float
    texts: tuple[str, ...]
    marks: tuple[MarkSnapshot, ...]

    def data_tokens(self) -> list[str]:
        tokens = list(self.texts)
        for mark in self.marks:
            tokens.extend(mark.data_tokens())
        return tokens

    def state_tokens(self) -> list[str]:
        tokens = list(self.texts)
        for mark in self.marks:
            tokens.extend(mark.state_tokens())
        return tokens


@dataclass(frozen=True)
class ProjectSnapshot:
    views: dict[str, ViewSnapshot]
    data_requests: tuple[str, ...] = ()


@dataclass(frozen=True)
class ViewDelta:
    changed_texts: tuple[str, ...]
    changed_mark_tokens: tuple[str, ...]
    changed_text_count: int
    changed_mark_count: int

    def tokens(self) -> list[str]:
        return list(self.changed_texts) + list(self.changed_mark_tokens)

    @property
    def total_changed_count(self) -> int:
        return self.changed_text_count + self.changed_mark_count


@dataclass(frozen=True)
class TriggerSpec:
    source_worksheet_id: str
    source_worksheet_name: str
    reference_mark_index: int
    mark_tag: str
    mark_title: str
    normalized_x: float
    normalized_y: float
    normalized_area: float


@dataclass(frozen=True)
class InteractionEpisode:
    id: str
    trigger: TriggerSpec
    affected_view_ids: tuple[str, ...]
    reference_view_deltas: dict[str, ViewDelta]


@dataclass(frozen=True)
class ViewMatchResult:
    worksheet_id: str
    worksheet_name: str
    score: float
    matched_title: str | None
    missing: bool = False
    diagnostics: tuple[str, ...] = ()


@dataclass(frozen=True)
class DataBindingEvaluation:
    score: float
    data_file_match: bool
    reference_data_files: tuple[str, ...]
    candidate_data_files: tuple[str, ...]
    per_view: tuple[ViewMatchResult, ...]


@dataclass(frozen=True)
class InteractionEpisodeResult:
    episode_id: str
    passed: bool
    score: float
    source_worksheet_id: str
    source_worksheet_name: str
    selected_mark_title: str | None = None
    view_results: tuple["InteractionViewResult", ...] = ()
    diagnostics: tuple[str, ...] = ()


@dataclass(frozen=True)
class InteractionEvaluation:
    score: float
    episodes: tuple[InteractionEpisodeResult, ...]


@dataclass(frozen=True)
class InteractionViewResult:
    worksheet_id: str
    worksheet_name: str
    passed: bool
    score: float
    change_detected: bool
    delta_similarity: float
    reference_changed_count: int
    candidate_changed_count: int
    diagnostics: tuple[str, ...] = ()


@dataclass(frozen=True)
class EvaluationConfig:
    route: str = "/"
    viewport_width: int = 1440
    viewport_height: int = 1024
    page_ready_timeout_ms: int = 15_000
    post_load_settle_ms: int = 800
    interaction_timeout_ms: int = 2_500
    poll_interval_ms: int = 200
    max_trigger_candidates: int = 8
    min_state_change: float = 0.05
    min_affected_views: int = 1
    post_state_similarity_threshold: float = 0.55
    interaction_change_weight: float = 0.25
    interaction_coverage_weight: float = 0.2
    interaction_similarity_weight: float = 0.55
    data_text_weight: float = 0.7
    data_geometry_weight: float = 0.3
    data_request_folder_name: str = "data"


@dataclass
class EpisodeCompilationTrace:
    attempted_marks: int = 0
    skipped_worksheets: list[str] = field(default_factory=list)
