"""CLI for the single-pass vision-driven pipeline."""

from __future__ import annotations

import argparse

from .logging_config import get_logger
from .pipeline import infer_output_dir, run_pipeline

logger = get_logger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run a single-pass vision-driven React generation pipeline.")
    parser.add_argument("--gt-dir", help="GT project directory containing docs/image.png, docs/interaction_contract.json, and public/data.")
    parser.add_argument("--image", help="Path to target screenshot image.")
    parser.add_argument("--interaction", help="Path to interaction_contract.json.")
    parser.add_argument("--data-dir", help="Directory containing one or more CSV files.")
    parser.add_argument("--output-dir", help="Output project directory. Defaults to generation-app/<gt_name> under the shared parent directory.")
    parser.add_argument("--force", action="store_true", help="Delete output directory before scaffolding.")
    args = parser.parse_args()

    if args.gt_dir:
        return args

    if args.image and args.interaction and args.data_dir:
        return args

    parser.error("Provide either --gt-dir or all of --image, --interaction, and --data-dir.")
    return args


def main() -> None:
    args = parse_args()
    resolved_output_dir = infer_output_dir(
        gt_dir=args.gt_dir,
        image_path=args.image,
        interaction_contract_path=args.interaction,
        data_dir=args.data_dir,
        output_dir=args.output_dir,
    )
    logger.info("Resolved output directory: %s", resolved_output_dir)

    result = run_pipeline(
        gt_dir=args.gt_dir,
        image_path=args.image,
        interaction_contract_path=args.interaction,
        data_dir=args.data_dir,
        output_dir=args.output_dir,
        force=args.force,
    )
    logger.info("Pipeline finished: success=%s", result["success"])
    logger.info("Output stored in %s", result["output_dir"])


if __name__ == "__main__":
    main()
