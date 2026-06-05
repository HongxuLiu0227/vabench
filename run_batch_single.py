#!/usr/bin/env python3
"""Batch run pipeline on all single-dashboard projects with parallel workers."""

from __future__ import annotations

import argparse
import subprocess
import sys
from multiprocessing import Pool
from pathlib import Path


def repo_root() -> Path:
    return Path(__file__).resolve().parent


def parse_args():
    parser = argparse.ArgumentParser(description="Batch pipeline runner for single-dashboard projects")
    parser.add_argument("--tableau-root", default="output/dashboard/output_twbx_single")
    parser.add_argument("--output-root", default="generated-react-app")
    parser.add_argument("--processes", type=int, default=2, help="Number of parallel workers")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of projects (0=all)")
    parser.add_argument("--skip-existing", action="store_true", default=True)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--continue-on-error", action="store_true", default=True)
    return parser.parse_args()


def run_one(args_tuple: tuple[Path, Path]):
    """Run pipeline on a single project. Returns (name, success, message)."""
    project_dir, output_dir = args_tuple
    name = project_dir.name

    if output_dir.exists():
        return (name, "skipped", "already exists")

    cmd = [
        sys.executable, "-m", "agent_pipeline.cli", "run",
        "--tableau", str(project_dir),
        "--output-dir", str(output_dir),
    ]

    try:
        result = subprocess.run(cmd, cwd=repo_root(), capture_output=True, text=True, timeout=3600)
        if result.returncode == 0:
            return (name, "done", "")
        else:
            last = result.stderr.strip().split("\n")[-1] if result.stderr else f"exit={result.returncode}"
            return (name, "failed", last[-120:])
    except subprocess.TimeoutExpired:
        return (name, "failed", "timeout (1h)")
    except Exception as exc:
        return (name, "failed", str(exc)[-120:])


def main():
    args = parse_args()
    root = repo_root()
    tableau_root = (root / args.tableau_root).resolve()
    output_root = (root / args.output_root).resolve()
    output_root.mkdir(parents=True, exist_ok=True)

    if not tableau_root.exists():
        print(f"Error: {tableau_root} not found", file=sys.stderr)
        return 1

    projects = sorted([
        d for d in tableau_root.iterdir() if d.is_dir()
    ])
    if args.limit:
        projects = projects[:args.limit]

    tasks = []
    skipped_existing = 0
    for proj in projects:
        proj_id = proj.name.split("_", 1)[0]
        out_dir = output_root / f"tableau_dashboard_{proj_id}"
        if args.skip_existing and out_dir.exists():
            skipped_existing += 1
            continue
        tasks.append((proj, out_dir))

    if skipped_existing:
        print(f"Skipped {skipped_existing} already-generated projects.")

    print(f"Running {len(tasks)} projects with {args.processes} workers...")

    if args.dry_run:
        for proj_dir, out_dir in tasks:
            print(f"  {proj_dir.name} → {out_dir.name}")
        return 0

    results = {"done": 0, "skipped": 0, "failed": 0}
    with Pool(processes=args.processes) as pool:
        for name, status, msg in pool.imap_unordered(run_one, tasks):
            icon = {"done": "✓", "skipped": "⊙", "failed": "✗"}.get(status, "?")
            detail = f" — {msg}" if msg else ""
            print(f"  [{icon}] {name}{detail}")
            results[status] += 1

    print(f"\nDone: {results['done']} succeeded, {results['skipped']} skipped, {results['failed']} failed")
    return 0 if results["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
