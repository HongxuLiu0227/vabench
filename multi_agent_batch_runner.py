from __future__ import annotations

import argparse
import json
import re
import subprocess
import unicodedata
from dataclasses import dataclass
from multiprocessing import Pool, freeze_support
from pathlib import Path
from typing import Iterable, List, Optional


@dataclass
class BatchTask:
    """Represents a single pipeline invocation."""

    prompt: Optional[str]
    prompt_file: Optional[Path]
    output_dir: Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Batch runner for the multi-agent pipeline using prompt files or generated requirements."
    )
    parser.add_argument(
        "--requirements-file",
        type=str,
        help="JSONL file produced by requirement-gen (each line must include a 'requirement' field).",
    )
    parser.add_argument(
        "--prompt-files",
        nargs="*",
        default=["prompt1.log", "prompt2.log"],
        help="Prompt files to process when --requirements-file is not supplied.",
    )
    parser.add_argument(
        "--output-root",
        type=str,
        default="generated-react-app/requirements-batch",
        help="Base directory for outputs generated from the requirements grid.",
    )
    parser.add_argument(
        "--start-index",
        type=int,
        default=0,
        help="Zero-based starting index into the requirements file (grid mode only).",
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Maximum number of requirements to process from the file (grid mode only).",
    )
    parser.add_argument(
        "--processes",
        type=int,
        default=4,
        help="Number of worker processes to use.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the planned invocations without running the pipeline.",
    )
    return parser.parse_args()


def slugify(value: str, fallback: str) -> str:
    """Return a filesystem-friendly slug limited to 48 characters."""
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_only).strip("-").lower()
    slug = slug or fallback
    return slug[:48].rstrip("-") or fallback


def build_tasks_from_requirements(
    requirements_path: Path,
    output_root: Path,
    start_index: int,
    limit: Optional[int],
) -> List[BatchTask]:
    lines: List[dict] = []
    with requirements_path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                payload = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid JSON in {requirements_path}: {exc}") from exc
            lines.append(payload)

    if start_index < 0:
        raise ValueError("start_index must be non-negative")
    if start_index >= len(lines):
        return []

    subset = lines[start_index:]
    if limit is not None:
        subset = subset[:limit]

    output_root.mkdir(parents=True, exist_ok=True)
    tasks: List[BatchTask] = []
    for idx, entry in enumerate(subset, start=start_index):
        requirement = entry.get("requirement")
        if not requirement:
            raise ValueError(f"Requirement entry at index {idx} is missing the 'requirement' field")
        identifier = entry.get("id", idx)
        slug_source = f"{identifier}-{entry.get('domain', '')}-{entry.get('functionality', '')}-{entry.get('device', '')}"
        slug = slugify(slug_source, fallback=f"req-{identifier}")
        output_dir = output_root / slug
        tasks.append(BatchTask(prompt=requirement, prompt_file=None, output_dir=output_dir))
    return tasks


def build_tasks_from_prompt_files(prompt_files: Iterable[str]) -> List[BatchTask]:
    tasks: List[BatchTask] = []
    for prompt_path in prompt_files:
        path = Path(prompt_path)
        if not path.exists():
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
        output_dir = Path("generated-react-app") / path.stem
        tasks.append(BatchTask(prompt=None, prompt_file=path, output_dir=output_dir))
    return tasks


def run_task(task: BatchTask) -> None:
    cmd = ["python", "-m", "agent_pipeline.cli", "run"]
    if task.prompt is not None:
        cmd.extend(["--prompt", task.prompt])
    elif task.prompt_file is not None:
        cmd.extend(["--prompt-file", str(task.prompt_file)])
    else:  # pragma: no cover - defensive
        raise ValueError("Task must have either prompt or prompt_file.")
    cmd.extend(["--output-dir", str(task.output_dir)])
    subprocess.run(cmd, check=True)


def main():
    args = parse_args()
    requirements_file = Path(args.requirements_file) if args.requirements_file else None

    if requirements_file:
        tasks = build_tasks_from_requirements(
            requirements_file, Path(args.output_root), args.start_index, args.limit
        )
    else:
        tasks = build_tasks_from_prompt_files(args.prompt_files)

    if not tasks:
        print("No tasks to run.")
        return

    print(f"Prepared {len(tasks)} tasks using {args.processes} worker processes.")
    if args.dry_run:
        for task in tasks:
            mode = "--prompt" if task.prompt else "--prompt-file"
            source = (task.prompt or "").splitlines()[0][:80] if task.prompt else str(task.prompt_file)
            print(f"[DRY RUN] {mode} → {source} | output: {task.output_dir}")
        return

    with Pool(processes=args.processes) as pool:
        pool.map(run_task, tasks)


if __name__ == "__main__":
    freeze_support()  # optional on macOS/Linux but harmless
    main()
