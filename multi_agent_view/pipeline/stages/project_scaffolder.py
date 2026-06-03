"""Project scaffolder stage for single-view experiments."""

from __future__ import annotations

import json
import shutil
import uuid
from pathlib import Path
from typing import Dict

from agent_pipeline.agents.scaffold_agent import scaffold_with_vite
from agent_pipeline.pipeline.context import PipelineState, WorkspaceArtifact
from agent_pipeline.pipeline.stage import PipelineStage, StageOutput
from agent_pipeline.pipeline.utils import ensure_directory

from ...config import PipelineConfig
from ...logging_config import get_logger

logger = get_logger(__name__)

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
    """Create a fresh Vite React TS scaffold directly in the output directory."""

    def __init__(self) -> None:
        super().__init__(
            name="project_scaffolder",
            description="Scaffold an empty React + Vite project in the target output directory.",
            consumes=["product_spec"],
            produces=["workspace"],
        )

    def execute(self, state: PipelineState, config: PipelineConfig, knowledge_base) -> StageOutput:
        if state.product_spec is None:
            raise ValueError("Project scaffolder stage requires requirement analysis output.")

        output_dir = state.paths.output_dir.resolve()
        ensure_directory(state.paths.logs_dir)
        created_new_scaffold = False

        if output_dir.exists() and any(output_dir.iterdir()):
            if self._is_reusable_scaffold(output_dir):
                logger.info("Reusing existing scaffold at %s", output_dir)
            elif self._contains_only_pipeline_artifacts(output_dir):
                logger.info(
                    "Output directory contains only pipeline artifacts. Creating scaffold and merging into %s",
                    output_dir,
                )
                self._scaffold_into_existing_dir(output_dir)
                created_new_scaffold = True
            else:
                raise ValueError(
                    "Target output directory already exists and is not empty, and does not look like a "
                    "React scaffold. Please use an empty path or a valid scaffold directory: "
                    f"{output_dir}"
                )
        else:
            if output_dir.exists() and not any(output_dir.iterdir()):
                output_dir.rmdir()
            output_dir.parent.mkdir(parents=True, exist_ok=True)
            logger.info("Scaffolding fresh Vite project at %s", output_dir)
            scaffold_with_vite(output_dir.name, cwd=str(output_dir.parent))
            created_new_scaffold = True

        package_json_path = output_dir / "package.json"
        if not package_json_path.exists():
            raise RuntimeError(f"Scaffold step did not produce package.json under {output_dir}")

        index_css = output_dir / "src" / "index.css"
        if index_css.exists():
            index_css.write_text("", encoding="utf-8")

        config_files: Dict[str, str] = {}
        for name in ESSENTIAL_FILES:
            path = output_dir / name
            if path.exists():
                config_files[name] = path.read_text(encoding="utf-8")

        package_json = json.loads(package_json_path.read_text(encoding="utf-8"))
        dependencies = package_json.get("dependencies", {})
        dev_dependencies = package_json.get("devDependencies", {})

        workspace = WorkspaceArtifact(
            root_path=output_dir,
            package_manager="pnpm",
            config_files=config_files,
            file_structure_manifest=[],
            package_json=package_json,
            dependencies=dependencies,
            dev_dependencies=dev_dependencies,
            tooling_notes=[
                "Fresh Vite React TS scaffold generated for single-view pipeline."
                if created_new_scaffold
                else "Existing React scaffold reused for single-view pipeline."
            ],
        )

        return StageOutput(
            state_updates={"workspace": workspace},
            artifacts={
                "scaffold_root": str(output_dir),
                "config_files": config_files,
            },
            metrics={
                "dependency_count": len(dependencies),
                "dev_dependency_count": len(dev_dependencies),
            },
        )

    def _is_reusable_scaffold(self, output_dir: Path) -> bool:
        required_paths = [
            output_dir / "package.json",
            output_dir / "index.html",
            output_dir / "src" / "main.tsx",
        ]
        return all(path.exists() for path in required_paths)

    def _contains_only_pipeline_artifacts(self, output_dir: Path) -> bool:
        allowed = {
            "docs",
            "pipeline_logs",
            ".pipeline_cache",
            ".DS_Store",
        }
        names = {path.name for path in output_dir.iterdir()}
        return bool(names) and names.issubset(allowed)

    def _scaffold_into_existing_dir(self, output_dir: Path) -> None:
        parent = output_dir.parent
        temp_name = f"{output_dir.name}__scaffold_tmp_{uuid.uuid4().hex[:8]}"
        temp_dir = parent / temp_name

        scaffold_with_vite(temp_name, cwd=str(parent))
        if not (temp_dir / "package.json").exists():
            if temp_dir.exists():
                shutil.rmtree(temp_dir)
            raise RuntimeError(f"Scaffold step did not produce package.json under temporary path {temp_dir}")

        for src_path in temp_dir.rglob("*"):
            rel = src_path.relative_to(temp_dir)
            dest_path = output_dir / rel
            if src_path.is_dir():
                dest_path.mkdir(parents=True, exist_ok=True)
                continue
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            if dest_path.exists():
                continue
            shutil.copy2(src_path, dest_path)

        shutil.rmtree(temp_dir)


__all__ = ["ProjectScaffolderStage"]
