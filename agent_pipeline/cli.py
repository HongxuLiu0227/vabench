"""Command line interface for the new multi-agent pipeline."""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Optional

from .config import build_default_config
from .logging_config import get_logger
from .pipeline import PipelineOrchestrator

logger = get_logger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the next-generation multi-agent React pipeline.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    run_parser = subparsers.add_parser("run", help="Execute the pipeline for a provided prompt.")
    input_group = run_parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument("--prompt", type=str, help="Inline prompt describing the desired project.")
    input_group.add_argument("--prompt-file", type=str, help="Path to a file containing the project prompt.")
    input_group.add_argument(
        "--tableau",
        type=str,
        help=(
            "Path to a Tableau export directory containing a .twb file (and optional data/ folder). "
            "When provided, the .twb workbook is used as the seed input and the pipeline switches to "
            "a Tableau-specific requirement generation agent."
        ),
    )
    run_parser.add_argument(
        "--output-dir",
        type=str,
        default="generated-react-app/complex-spa",
        help="Directory where the generated project will be stored.",
    )
    run_parser.add_argument(
        "--force",
        action="store_true",
        help="Delete the existing output directory before running the pipeline.",
    )
    run_parser.add_argument("--config", type=str, help="Optional path to a pipeline configuration file.")

    return parser.parse_args()


def load_prompt(prompt: Optional[str], prompt_file: Optional[str]) -> str:
    if prompt:
        return prompt.strip()
    if prompt_file:
        path = Path(prompt_file)
        if not path.exists():
            raise FileNotFoundError(f"Prompt file does not exist: {prompt_file}")
        return path.read_text(encoding="utf-8").strip()
    raise ValueError("You must supply either --prompt or --prompt-file.")


def load_tableau_seed(tableau_dir: str) -> tuple[str, dict]:
    input_dir = Path(tableau_dir).expanduser().resolve()
    if not input_dir.exists() or not input_dir.is_dir():
        raise NotADirectoryError(f"--tableau must point to an existing directory: {tableau_dir}")

    twb_files = sorted(input_dir.glob("*.twb"))
    if not twb_files:
        raise FileNotFoundError(f"No .twb files found under: {input_dir}")

    # If multiple workbooks exist, pick the largest (best chance it contains all dashboard definitions).
    twb_path = max(twb_files, key=lambda p: (p.stat().st_size, p.name))
    twb_xml = twb_path.read_text(encoding="utf-8", errors="replace").strip()
    # Strip base64 thumbnails (~71% of file size, useless for LLM token consumption)
    twb_xml = re.sub(
        r"<thumbnails>.*?</thumbnails>",
        "<thumbnails />",
        twb_xml,
        flags=re.DOTALL,
    )
    if not twb_xml:
        raise ValueError(f"Selected .twb file is empty: {twb_path}")

    extras = {
        "mode": "tableau",
        "tableau_input_dir": str(input_dir),
        "tableau_twb_path": str(twb_path.resolve()),
    }
    return twb_xml, extras


def main() -> None:
    args = parse_args()
    if args.command != "run":
        raise ValueError(f"Unsupported command: {args.command}")

    extras = None
    if getattr(args, "tableau", None):
        prompt, extras = load_tableau_seed(args.tableau)
    else:
        prompt = load_prompt(args.prompt, args.prompt_file)
    orchestrator = PipelineOrchestrator(config=build_default_config())
    result = orchestrator.run(
        prompt=prompt,
        output_dir=args.output_dir,
        config_path=args.config,
        extras=extras,
        force=args.force,
    )

    logger.info("Pipeline finished: success=%s", result.success)
    logger.info("Output stored in %s", result.output_dir)
    for stage_result in result.stage_results:
        logger.info(
            " - Stage %-22s | success=%s | duration=%.2fs",
            stage_result.name,
            stage_result.success,
            stage_result.duration_seconds,
        )


if __name__ == "__main__":  # pragma: no cover
    main()
