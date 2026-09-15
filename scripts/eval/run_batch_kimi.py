#!/usr/bin/env python3
"""Serial batch runner for kimi_vision_once single-pass pipeline."""

from __future__ import annotations

import argparse
import json
import os
import shlex
import signal
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from threading import Event

# Shared shutdown event — set by signal handler to request graceful stop.
_shutdown = Event()


def repo_root() -> Path:
    return Path(__file__).resolve().parent


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Serially run kimi_vision_once pipeline for GT dashboard projects."
    )
    parser.add_argument(
        "--input-root",
        default="input_bench/ours",
        help="Directory containing GT project folders (tableau_dashboard_*).",
    )
    parser.add_argument(
        "--output-root",
        default="generated-react-app-v2-gpt",
        help="Base directory for generated projects.",
    )
    parser.add_argument(
        "--ids",
        nargs="*",
        help="Only run these project ids (e.g. 121 160). Default: all folders under input-root.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Limit number of projects after filtering (0=all).",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Pass --force to the pipeline and rerun even if output already exists.",
    )
    parser.add_argument(
        "--no-skip-existing",
        action="store_true",
        help="Run even when the output directory already exists (without --force).",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=0,
        help="Number of retries per project on failure (default: 0).",
    )
    parser.add_argument(
        "--model",
        default="gpt5",
        help="Model name defined in ~/.kimi/config.toml (default: gpt5).",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=1,
        help="Number of projects to run in parallel (default: 1 = serial).",
    )
    parser.add_argument(
        "--stop-on-error",
        action="store_true",
        help="Stop after the first failed project (default: continue).",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=7200,
        help="Per-project timeout in seconds (default: 7200 = 2h).",
    )
    parser.add_argument(
        "--no-conda",
        action="store_true",
        help="Run without conda (uses current python directly).",
    )
    parser.add_argument(
        "--conda-env",
        default="img2code",
        help="Conda environment name (default: img2code).",
    )
    parser.add_argument(
        "--conda-python",
        default="",
        help="Path to conda env python binary (e.g. ~/miniconda3/envs/img2code/bin/python). "
             "When set, bypasses 'conda run' entirely for faster startup.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned commands without executing them.",
    )
    parser.add_argument(
        "--pipeline",
        default="kimi_vision_once",
        choices=["kimi_vision_once", "kimi_loop"],
        help="Pipeline module to use (default: kimi_vision_once).",
    )
    return parser.parse_args()


_ID_PREFIX = "tableau_dashboard_"
_ID_PREFIX_LEN = len(_ID_PREFIX)


def project_id(project_dir: Path) -> str:
    name = project_dir.name
    if name.startswith(_ID_PREFIX):
        return name[_ID_PREFIX_LEN:]
    return name


def output_dir_for(output_root: Path, proj: Path) -> Path:
    return output_root / proj.name


_DONE_MARKER = "_done"


def should_skip(out_dir: Path, *, force: bool, skip_existing: bool) -> tuple[bool, str]:
    if force or not skip_existing:
        return False, ""
    done_marker = out_dir / _DONE_MARKER
    if done_marker.exists():
        return True, "completed (_done marker exists)"
    if out_dir.exists():
        return False, ""  # partial output — re-run
    return False, ""


def discover_projects(input_root: Path, ids: list[str] | None) -> list[Path]:
    projects = sorted(
        path for path in input_root.iterdir()
        if path.is_dir() and path.name.startswith("tableau_dashboard_")
    )
    if ids:
        id_set = {str(item) for item in ids}
        projects = [path for path in projects if project_id(path) in id_set]
        missing = sorted(id_set - {project_id(path) for path in projects})
        if missing:
            print(
                f"Warning: no project folder found for ids: {', '.join(missing)}",
                file=sys.stderr,
            )
    return projects


def run_one(
    project_dir: Path,
    out_dir: Path,
    *,
    force: bool,
    timeout: int,
    log_path: Path,
    use_conda: bool,
    conda_env: str,
    conda_python: str,
    model: str,
    pipeline_module: str,
) -> tuple[str, str, str]:
    """Run pipeline on one project. Returns (name, status, message)."""
    name = project_dir.name

    python_bin = conda_python or sys.executable
    kimi_cmd = [
        python_bin,
        "-m",
        f"{pipeline_module}.cli",
        "--gt-dir",
        str(project_dir),
        "--output-dir",
        str(out_dir),
        "--timeout",
        str(timeout),
        "--model",
        model,
    ]
    if force:
        kimi_cmd.append("--force")

    log_path.parent.mkdir(parents=True, exist_ok=True)
    header = f"$ {shlex.join(kimi_cmd)}\n\n"

    if use_conda and not conda_python:
        cmd = [
            "conda", "run", "-n", conda_env, "--live-stream",
            *kimi_cmd,
        ]
    else:
        cmd = kimi_cmd

    try:
        with log_path.open("w", encoding="utf-8") as log_file:
            log_file.write(header)
            log_file.flush()
            result = subprocess.run(
                cmd,
                cwd=repo_root(),
                stdout=log_file,
                stderr=subprocess.STDOUT,
                text=True,
                timeout=timeout,
            )
    except subprocess.TimeoutExpired:
        with log_path.open("a", encoding="utf-8") as log_file:
            log_file.write(f"\n\nBatch runner timeout after {timeout}s\n")
        return name, "failed", f"timeout ({timeout}s)"

    if result.returncode == 0:
        # Write completion marker so future runs can reliably skip.
        (out_dir / _DONE_MARKER).write_text(
            f"completed at {time.strftime('%Y-%m-%d %H:%M:%S')}\n",
            encoding="utf-8",
        )
        return name, "done", str(log_path)

    tail = ""
    try:
        contents = log_path.read_text(encoding="utf-8", errors="replace").strip()
        if contents:
            tail = contents.splitlines()[-1][-120:]
    except OSError:
        tail = ""

    message = tail or f"exit={result.returncode}"
    return name, "failed", f"{message} (log: {log_path.name})"


def run_one_with_retry(
    project_dir: Path,
    out_dir: Path,
    *,
    force: bool,
    timeout: int,
    log_path: Path,
    use_conda: bool,
    conda_env: str,
    conda_python: str,
    model: str,
    retries: int,
    pipeline_module: str,
) -> tuple[str, str, str]:
    """Wrap run_one with exponential-backoff retries."""
    if _shutdown.is_set():
        return project_dir.name, "failed", "shutdown requested, skipped"
    for attempt in range(1 + retries):
        name, status, msg = run_one(
            project_dir,
            out_dir,
            force=force,
            timeout=timeout,
            log_path=log_path,
            use_conda=use_conda,
            conda_env=conda_env,
            conda_python=conda_python,
            model=model,
            pipeline_module=pipeline_module,
        )
        if status == "done" or attempt >= retries:
            if attempt > 0 and status == "done":
                msg += f" (succeeded on retry {attempt})"
            return name, status, msg
        if _shutdown.is_set():
            return name, status, msg + " (shutdown requested, skipping retries)"
        delay = min(2 ** attempt * 5, 60)  # 5s, 10s, 20s, 40s, 60s cap
        print(f"  [↻] {name} attempt {attempt + 1} failed, retrying in {delay}s...")
        _shutdown.wait(delay)  # interruptible sleep
    return name, status, msg  # unreachable but keeps type checker happy


def main() -> int:
    args = parse_args()

    # Install graceful-shutdown handler.
    def _handle_signal(signum: int, _frame: object) -> None:
        sig_name = signal.Signals(signum).name
        print(f"\n[!] Received {sig_name} — finishing current project(s) then stopping...")
        _shutdown.set()

    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)

    root = repo_root()
    input_root = (root / args.input_root).resolve()
    output_root = (root / args.output_root).resolve()
    output_root.mkdir(parents=True, exist_ok=True)
    skip_existing = not args.no_skip_existing
    use_conda = not args.no_conda
    conda_python = os.path.expanduser(args.conda_python) if args.conda_python else ""

    if not input_root.exists():
        print(f"Error: {input_root} not found", file=sys.stderr)
        return 1

    os.environ["PATH"] = (
        os.path.expanduser("~/.local/bin")
        + os.pathsep
        + os.environ.get("PATH", "")
    )

    projects = discover_projects(input_root, args.ids)
    if args.limit:
        projects = projects[: args.limit]

    tasks: list[tuple[Path, Path]] = []
    skipped = 0
    for proj in projects:
        out_dir = output_dir_for(output_root, proj)
        skip, reason = should_skip(out_dir, force=args.force, skip_existing=skip_existing)
        if skip:
            skipped += 1
            print(f"  [⊙] {proj.name} — skipped ({reason})")
            continue
        tasks.append((proj, out_dir))

    if skipped:
        print(f"Skipped {skipped} project(s) with existing output directories.")

    print(f"Running {len(tasks)} project(s)...")
    if args.dry_run:
        for proj_dir, out_dir in tasks:
            force_flag = " --force" if args.force else ""
            print(
                f"  {proj_dir.name} → {out_dir.name}{force_flag} "
                f"(log: {out_dir.name}_run.log)"
            )
        return 0

    results = {"done": 0, "failed": 0}
    failed_ids: list[str] = []
    run_records: list[dict] = []

    def _record(name: str, status: str, msg: str, proj_dir: Path) -> None:
        results[status] += 1
        if status == "failed":
            failed_ids.append(project_id(proj_dir))
        run_records.append({"project": name, "status": status, "message": msg})

    concurrency = max(1, args.concurrency)
    if concurrency == 1:
        # Serial path — preserve original behaviour with live progress.
        for index, (proj_dir, out_dir) in enumerate(tasks, start=1):
            if _shutdown.is_set():
                print("Graceful shutdown — skipping remaining projects.")
                break
            log_path = output_root / f"{out_dir.name}_run.log"
            print(f"[{index}/{len(tasks)}] {proj_dir.name} → {out_dir.name}")
            name, status, msg = run_one_with_retry(
                proj_dir,
                out_dir,
                force=args.force,
                timeout=args.timeout,
                log_path=log_path,
                use_conda=use_conda,
                conda_env=args.conda_env,
                conda_python=conda_python,
                model=args.model,
                retries=args.retries,
                pipeline_module=args.pipeline,
            )
            icon = "✓" if status == "done" else "✗"
            detail = f" — {msg}" if msg else ""
            print(f"  [{icon}] {name}{detail}")
            _record(name, status, msg, proj_dir)
            if status == "failed" and args.stop_on_error:
                print("Stopping after first failure (--stop-on-error).")
                break
    else:
        # Parallel path.
        print(f"Concurrency: {concurrency}")
        future_to_info: dict = {}
        with ThreadPoolExecutor(max_workers=concurrency) as executor:
            for index, (proj_dir, out_dir) in enumerate(tasks, start=1):
                if _shutdown.is_set():
                    print("Graceful shutdown — not submitting remaining projects.")
                    break
                log_path = output_root / f"{out_dir.name}_run.log"
                future = executor.submit(
                    run_one_with_retry,
                    proj_dir,
                    out_dir,
                    force=args.force,
                    timeout=args.timeout,
                    log_path=log_path,
                    use_conda=use_conda,
                    conda_env=args.conda_env,
                    conda_python=conda_python,
                    model=args.model,
                    retries=args.retries,
                    pipeline_module=args.pipeline,
                )
                future_to_info[future] = (index, proj_dir, out_dir)

            # Collect results from submitted futures.
            for future in as_completed(future_to_info):
                index, proj_dir, out_dir = future_to_info[future]
                try:
                    name, status, msg = future.result()
                except Exception:
                    name = proj_dir.name
                    status, msg = "failed", "future error"
                icon = "✓" if status == "done" else "✗"
                detail = f" — {msg}" if msg else ""
                print(f"  [{icon}] [{index}/{len(tasks)}] {name}{detail}")
                _record(name, status, msg, proj_dir)
                if _shutdown.is_set():
                    cancelled = 0
                    for f in future_to_info:
                        if f.cancel():
                            cancelled += 1
                    if cancelled:
                        print(f"Cancelled {cancelled} pending project(s).")
                    break

    # Write progress.json for resumability and post-analysis.
    progress_path = output_root / "progress.json"
    progress = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "summary": {
            "done": results["done"],
            "failed": results["failed"],
            "skipped": skipped,
        },
        "failed_ids": failed_ids,
        "runs": run_records,
    }
    progress_path.write_text(
        json.dumps(progress, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print(
        f"\nSummary: {results['done']} succeeded, {skipped} skipped, "
        f"{results['failed']} failed"
    )
    if failed_ids:
        print("  Failed ids: " + ", ".join(failed_ids))
    return 0 if results["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
