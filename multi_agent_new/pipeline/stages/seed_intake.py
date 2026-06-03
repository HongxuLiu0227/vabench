"""Seed intake stage."""

from __future__ import annotations

import re
from typing import List

from ...config import PipelineConfig
from ..context import PipelineState, ProjectSeed
from ..knowledge_base import KnowledgeBase
from ..stage import PipelineStage, StageOutput


def _infer_domain(prompt: str) -> str:
    keywords = ["analytics", "finance", "sales", "logistics", "health", "education"]
    for keyword in keywords:
        if keyword in prompt.lower():
            return keyword
    return "general_business"


def _extract_features(prompt: str) -> List[str]:
    raw_items = re.split(r"[,\n]", prompt)
    features = [item.strip() for item in raw_items if len(item.strip()) > 4]
    return features[:10] or ["dashboard overview", "team collaboration", "realtime metrics"]


class SeedIntakeStage(PipelineStage):
    """Normalize raw input into a structured project seed."""

    def __init__(self) -> None:
        super().__init__(
            name="seed_intake",
            description="Normalize the incoming brief and infer complexity targets.",
            produces=["seed"],
        )

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: KnowledgeBase,
    ) -> StageOutput:
        seed_input: str = state.extras.get("seed_input", "")
        if not seed_input:
            raise ValueError("Seed intake stage requires 'seed_input' in state extras.")

        domain = _infer_domain(seed_input)
        personas = ["Operations Manager", "Data Analyst"]
        if "executive" in seed_input.lower():
            personas.insert(0, "Executive Stakeholder")

        requested_features = _extract_features(seed_input)
        complexity_target = "complex" if len(requested_features) >= 3 else "standard"

        metadata = {
            "ant_patterns_summary": knowledge_base.ant_patterns()[:240],
            "prompt_length": len(seed_input),
        }

        project_seed = ProjectSeed(
            source="text_prompt",
            raw_input=seed_input,
            domain=domain,
            personas=personas,
            complexity_target=complexity_target,
            requested_features=requested_features,
            tags=[domain, complexity_target],
            metadata=metadata,
        )

        seed_summary = {
            "domain": domain,
            "personas": personas,
            "feature_count": len(requested_features),
            "complexity_target": complexity_target,
        }

        state_updates = {
            "seed": project_seed,
            "extras": {**state.extras, "seed_summary": seed_summary},
        }

        return StageOutput(
            state_updates=state_updates,
            artifacts={"seed_summary": seed_summary},
            metrics={"feature_count": len(requested_features)},
            quality={"complexity_score": 0.9},
        )


__all__ = ["SeedIntakeStage"]

