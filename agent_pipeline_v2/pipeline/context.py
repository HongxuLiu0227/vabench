"""Shared context and data structures used throughout the pipeline."""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class ProjectSeed:
    """Normalized seed information captured during the intake stage."""

    source: str
    raw_input: str
    domain: str
    personas: List[str]
    complexity_target: str
    requested_features: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProductSpec:
    """Detailed requirements emitted by the requirement architect."""

    raw_prompt: str
    enriched_prompt: str
    analysis: Dict[str, Any]
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class WorkspaceArtifact:
    """Information about the scaffolded project workspace."""

    root_path: Path
    package_manager: str
    config_files: Dict[str, str]
    file_structure_manifest: List[str]
    package_json: Dict[str, Any]
    dependencies: Dict[str, str] = field(default_factory=dict)
    dev_dependencies: Dict[str, str] = field(default_factory=dict)
    tooling_notes: List[str] = field(default_factory=list)


@dataclass
class ExperiencePlan:
    """Component manifest and coverage data."""

    component_manifest: Dict[str, Any]
    coverage_report: Dict[str, Any]


@dataclass
class DataStatePlan:
    """Routing manifest and dependency context."""

    routing_manifest: Dict[str, Any]
    allowed_libraries: List[str]


@dataclass
class ComponentAssembly:
    """Collection of generated files and post-processing metadata."""

    generated_files: Dict[str, str]
    refactored_files: Dict[str, str] = field(default_factory=dict)
    resolved_files: Dict[str, str] = field(default_factory=dict)
    notes: List[str] = field(default_factory=list)
    placeholder_ratio: float = 0.0


@dataclass
class IntegrationArtifact:
    """Artifacts produced during integration and validation."""

    validation_issues: List[str]
    forbidden_packages: List[Dict[str, Any]]
    fixes_applied: Dict[str, str]
    final_files: Dict[str, str]


@dataclass
class QAReport:
    """Quality assurance summary that feeds the final gate."""

    passed: bool
    findings: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    dimensions: Dict[str, Any] = field(default_factory=dict)
    failure_categories: List[str] = field(default_factory=list)
    evidence: Dict[str, Any] = field(default_factory=dict)
    placeholder_ratio: float = 0.0


@dataclass
class PackagingArtifact:
    """Final packaging information for dataset consumption."""

    bundle_path: Path
    metadata_card: Dict[str, Any]
    telemetry: Dict[str, Any]


@dataclass
class PipelinePaths:
    """Resolve paths used throughout a run."""

    output_dir: Path
    cache_dir: Path
    logs_dir: Path

    @classmethod
    def from_output_dir(cls, output_dir: Path) -> "PipelinePaths":
        cache_dir = output_dir / ".pipeline_cache"
        logs_dir = output_dir / "pipeline_logs"
        return cls(output_dir=output_dir, cache_dir=cache_dir, logs_dir=logs_dir)


@dataclass
class PipelineState:
    """Mutable state passed between stages."""

    paths: PipelinePaths
    prompt: str = ""
    seed: Optional[ProjectSeed] = None
    product_spec: Optional[ProductSpec] = None
    workspace: Optional[WorkspaceArtifact] = None
    experience_plan: Optional[ExperiencePlan] = None
    data_state_plan: Optional[DataStatePlan] = None
    components: Optional[ComponentAssembly] = None
    integration: Optional[IntegrationArtifact] = None
    qa_report: Optional[QAReport] = None
    packaging: Optional[PackagingArtifact] = None
    extras: Dict[str, Any] = field(default_factory=dict)
    telemetry: Dict[str, Any] = field(default_factory=dict)
    snippets: Dict[str, str] = field(default_factory=dict)

    def update(self, **kwargs: Any) -> "PipelineState":
        """Return a new state with selected attributes updated."""
        return replace(self, **kwargs)

    def record_extra(self, key: str, value: Any) -> None:
        self.extras[key] = value

    def record_metric(self, key: str, value: Any) -> None:
        metrics = self.telemetry.setdefault("metrics", {})
        metrics[key] = value


__all__ = [
    "ProjectSeed",
    "ProductSpec",
    "ExperiencePlan",
    "DataStatePlan",
    "WorkspaceArtifact",
    "ComponentAssembly",
    "IntegrationArtifact",
    "QAReport",
    "PackagingArtifact",
    "PipelinePaths",
    "PipelineState",
]
