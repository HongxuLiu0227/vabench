"""Command line interface for the single-view pipeline."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Optional

from .config import build_default_config
from .logging_config import get_logger
from .pipeline import PipelineOrchestrator

logger = get_logger(__name__)



def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the single-view multi-agent React pipeline.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    run_parser = subparsers.add_parser("run", help="Execute the pipeline for a provided prompt.")
    input_group = run_parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument("--prompt", type=str, help="Inline prompt describing the desired single view.")
    input_group.add_argument("--prompt-file", type=str, help="Path to a file containing the prompt.")
    run_parser.add_argument(
        "--output-dir",
        type=str,
        default="generated-react-app/single-view-cli",
        help="Directory where the generated project will be stored.",
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



def main() -> None:
    args = parse_args()
    if args.command != "run":
        raise ValueError(f"Unsupported command: {args.command}")

    prompt = load_prompt(args.prompt, args.prompt_file)
    orchestrator = PipelineOrchestrator(config=build_default_config())
    result = orchestrator.run(prompt=prompt, output_dir=args.output_dir, config_path=args.config)

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
