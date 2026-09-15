"""Batch CLI for running the single-pass vision pipeline across many GT projects."""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Any, Dict, List

from .logging_config import get_logger
from .pipeline import infer_output_dir, run_pipeline

logger = get_logger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Batch-run the single-pass vision-driven React generation pipeline.")
    parser.add_argument("--gt-root", required=True, help="Directory whose child folders are GT projects.")
    parser.add_argument("--pattern", default="tableau_dashboard_*", help="Glob pattern used to select GT project folders under --gt-root.")
    parser.add_argument("--output-root", help="Optional root directory for generated projects. Defaults to generation-app under the shared parent directory.")
    parser.add_argument("--summary-path", help="Optional JSON path for batch summary. Defaults to <gt-root>/batch_singlepass_summary.json.")
    parser.add_argument("--limit", type=int, help="Optional cap on how many GT projects to process.")
    parser.add_argument("--force", action="store_true", help="Delete each output directory before scaffolding.")
    parser.add_argument("--fail-fast", action="store_true", help="Stop on the first failed GT project.")
    parser.add_argument("--timeout", type=int, default=1800, help="Kimi CLI timeout in seconds (default: 1800 = 30min).")
    parser.add_argument("--model", default="gpt5", help="Model name defined in ~/.kimi/config.toml (default: gpt5).")
    parser.add_argument("--skip-existing", action="store_true", help="Skip projects whose output dir already has a successful pipeline_run_summary.json.")
    return parser.parse_args()


def discover_gt_dirs(gt_root: Path, pattern: str) -> List[Path]:
    if not gt_root.exists() or not gt_root.is_dir():
        raise NotADirectoryError(f"GT root not found: {gt_root}")

    candidates = sorted(path for path in gt_root.glob(pattern) if path.is_dir())
    valid_gt_dirs: List[Path] = []
    for path in candidates:
        docs_dir = path / "docs"
        data_dir = path / "public" / "data"
        if (docs_dir / "image.png").is_file() and (docs_dir / "interaction_contract.json").is_file() and data_dir.is_dir():
            valid_gt_dirs.append(path)
    return valid_gt_dirs


def resolve_batch_output_dir(gt_dir: Path, output_root: Path | None) -> Path:
    if output_root is None:
        return infer_output_dir(gt_dir=str(gt_dir))
    return output_root / gt_dir.name


def build_summary_path(gt_root: Path, summary_path: str | None) -> Path:
    if summary_path:
        return Path(summary_path).expanduser().resolve()
    return gt_root / "batch_singlepass_summary.json"


def main() -> None:
    args = parse_args()
    gt_root = Path(args.gt_root).expanduser().resolve()
    output_root = Path(args.output_root).expanduser().resolve() if args.output_root else None
    summary_path = build_summary_path(gt_root, args.summary_path)

    gt_dirs = discover_gt_dirs(gt_root, args.pattern)
    if args.limit is not None:
        gt_dirs = gt_dirs[: args.limit]

    if not gt_dirs:
        raise FileNotFoundError(f"No GT projects matched pattern '{args.pattern}' under {gt_root}")

    logger.info("Discovered %s GT projects under %s", len(gt_dirs), gt_root)
    if output_root is not None:
        output_root.mkdir(parents=True, exist_ok=True)
        logger.info("Using batch output root: %s", output_root)

    run_started_at = time.time()
    results: List[Dict[str, Any]] = []

    for index, gt_dir in enumerate(gt_dirs, start=1):
        output_dir = resolve_batch_output_dir(gt_dir, output_root)
        if args.skip_existing:
            summary_file = output_dir / "pipeline_logs" / "pipeline_run_summary.json"
            if summary_file.exists():
                try:
                    existing = json.loads(summary_file.read_text(encoding="utf-8"))
                    if existing.get("success"):
                        logger.info("[%s/%s] Skipping (already succeeded): %s", index, len(gt_dirs), gt_dir.name)
                        results.append({
                            "gt_dir": str(gt_dir),
                            "gt_name": gt_dir.name,
                            "output_dir": str(output_dir),
                            "success": True,
                            "skipped": True,
                        })
                        continue
                except Exception:
                    pass
        logger.info("[%s/%s] Running GT project: %s", index, len(gt_dirs), gt_dir.name)
        logger.info("[%s/%s] Output directory: %s", index, len(gt_dirs), output_dir)

        started_at = time.time()
        try:
            result = run_pipeline(
                gt_dir=str(gt_dir),
                output_dir=str(output_dir),
                force=args.force,
                timeout_seconds=args.timeout,
                model=args.model,
            )
            elapsed_seconds = round(time.time() - started_at, 2)
            results.append({
                "gt_dir": str(gt_dir),
                "gt_name": gt_dir.name,
                "output_dir": str(output_dir),
                "success": True,
                "elapsed_seconds": elapsed_seconds,
                "result": result,
            })
            logger.info("[%s/%s] Completed in %ss", index, len(gt_dirs), elapsed_seconds)
        except Exception as exc:  # noqa: BLE001
            elapsed_seconds = round(time.time() - started_at, 2)
            failure = {
                "gt_dir": str(gt_dir),
                "gt_name": gt_dir.name,
                "output_dir": str(output_dir),
                "success": False,
                "elapsed_seconds": elapsed_seconds,
                "error": str(exc),
            }
            results.append(failure)
            logger.exception("[%s/%s] Failed after %ss: %s", index, len(gt_dirs), elapsed_seconds, gt_dir.name)
            if args.fail_fast:
                break

    summary = {
        "gt_root": str(gt_root),
        "pattern": args.pattern,
        "output_root": str(output_root) if output_root else None,
        "summary_path": str(summary_path),
        "total": len(results),
        "succeeded": sum(1 for item in results if item["success"]),
        "failed": sum(1 for item in results if not item["success"]),
        "elapsed_seconds": round(time.time() - run_started_at, 2),
        "results": results,
    }

    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    logger.info("Batch summary written to %s", summary_path)


if __name__ == "__main__":
    main()
