"""Project scaffolder stage."""

from __future__ import annotations

import json
import os
import shutil
from pathlib import Path
from typing import Dict

from ...config import PipelineConfig
from ...logging_config import get_logger
from ..context import PipelineState, WorkspaceArtifact
from ..knowledge_base import KnowledgeBase
from ..stage import PipelineStage, StageOutput
from ..utils import ensure_directory
from ...agents.scaffold_agent import scaffold_with_vite
from ...agents.file_structure_agent import design_file_structure

logger = get_logger(__name__)
GLOBAL_CACHE = Path(os.getenv("PIPELINE_CACHE_ROOT", ".pipeline_cache")).resolve()
ensure_directory(GLOBAL_CACHE)


ESSENTIAL_FILES = [
    "package.json",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "vite.config.ts",
    "eslint.config.js",
    "index.html",
    "README.md",
]


class ProjectScaffolderStage(PipelineStage):
    """Bootstrap the project workspace with configs, scripts, and dependencies."""

    def __init__(self) -> None:
        super().__init__(
            name="project_scaffolder",
            description="Create the base React + Vite workspace.",
            consumes=["product_spec"],
            produces=["workspace"],
        )

    def execute(
        self,
        state: PipelineState,
        config: PipelineConfig,
        knowledge_base: KnowledgeBase,
    ) -> StageOutput:
        if state.product_spec is None:
            raise ValueError("Project scaffolder stage requires requirement analysis output.")

        output_dir = state.paths.output_dir
        ensure_directory(state.paths.cache_dir)
        ensure_directory(state.paths.logs_dir)

        template_dir = GLOBAL_CACHE / "vite_template"
        temp_dir = GLOBAL_CACHE / "vite_template_tmp"
        needs_bootstrap = not template_dir.exists() or not any(template_dir.iterdir())
        if needs_bootstrap:
            logger.info("Initializing scaffold cache at %s", template_dir)
            ensure_directory(template_dir.parent)
            if template_dir.exists():
                shutil.rmtree(template_dir)
            if temp_dir.exists():
                shutil.rmtree(temp_dir)
            scaffold_with_vite(temp_dir.name, cwd=str(GLOBAL_CACHE))
            if not temp_dir.exists() or not any(temp_dir.iterdir()):
                raise RuntimeError("Failed to scaffold Vite template cache.")
            shutil.move(str(temp_dir), str(template_dir))

        output_dir.mkdir(parents=True, exist_ok=True)
        logger.info("Merging cached scaffold into %s", output_dir)
        for src_path in template_dir.rglob("*"):
            rel_path = src_path.relative_to(template_dir)
            dest_path = output_dir / rel_path
            if src_path.is_dir():
                dest_path.mkdir(parents=True, exist_ok=True)
            else:
                if not dest_path.exists():
                    dest_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(src_path, dest_path)

        config_files: Dict[str, str] = {}
        for name in ESSENTIAL_FILES:
            path = output_dir / name
            if path.exists():
                config_files[name] = path.read_text(encoding="utf-8")

        index_css = output_dir / "src" / "index.css"
        if index_css.exists():
            index_css.write_text("", encoding="utf-8")

        package_json_path = output_dir / "package.json"
        package_json = json.loads(package_json_path.read_text(encoding="utf-8")) if package_json_path.exists() else {}
        dependencies = package_json.get("dependencies", {})
        dev_dependencies = package_json.get("devDependencies", {})

        logger.info("Designing file structure via legacy agent")
        file_structure_manifest = design_file_structure(
            str(output_dir),
            state.product_spec.enriched_prompt,
        ) or []

        workspace = WorkspaceArtifact(
            root_path=output_dir,
            package_manager="pnpm",
            config_files=config_files,
            file_structure_manifest=file_structure_manifest,
            package_json=package_json,
            dependencies=dependencies,
            dev_dependencies=dev_dependencies,
            tooling_notes=["Scaffolded with Vite React TS template via legacy agent pipeline."],
        )

        return StageOutput(
            state_updates={"workspace": workspace},
            artifacts={
                "config_files": config_files,
                "file_structure_manifest": file_structure_manifest,
            },
            metrics={
                "dependency_count": len(dependencies),
                "dev_dependency_count": len(dev_dependencies),
                "manifest_items": len(file_structure_manifest),
            },
        )


__all__ = ["ProjectScaffolderStage"]
