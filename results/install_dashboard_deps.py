#!/usr/bin/env python3
"""Install (and optionally build) dashboard projects under ours/kimi-style roots."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


@dataclass(frozen=True)
class ProjectTask:
    root_name: str
    project_dir: Path


def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def resolve_roots(raw_roots: list[str]) -> list[Path]:
    base = repo_root()
    resolved: list[Path] = []
    for raw in raw_roots:
        path = Path(raw).expanduser()
        if not path.is_absolute():
            # Treat relative paths as repo-root-relative (e.g. "ours", not "../ours").
            path = (base / path).resolve()
        else:
            path = path.resolve()
        if not path.is_dir():
            raise FileNotFoundError(f"Root not found: {path}")
        resolved.append(path)
    return resolved


def discover_projects(roots: list[Path], ids: set[str] | None) -> list[ProjectTask]:
    tasks: list[ProjectTask] = []
    for root in roots:
        for child in sorted(root.iterdir()):
            if not child.is_dir() or not child.name.startswith("tableau_dashboard_"):
                continue
            if ids and child.name.removeprefix("tableau_dashboard_") not in ids and child.name not in ids:
                continue
            if not (child / "package.json").is_file():
                continue
            tasks.append(ProjectTask(root_name=root.name, project_dir=child))
    return tasks


def _resolve_pm(project_dir: Path) -> tuple[str, list[str]]:
    if shutil.which("pnpm") and (project_dir / "pnpm-lock.yaml").is_file():
        return "pnpm", ["pnpm", "install", "--frozen-lockfile"]
    if shutil.which("pnpm"):
        return "pnpm", ["pnpm", "install"]
    if (project_dir / "package-lock.json").is_file():
        return "npm", ["npm", "ci", "--no-fund", "--no-audit"]
    return "npm", ["npm", "install", "--no-fund", "--no-audit"]


def _run(cmd: list[str], cwd: Path, timeout: int) -> tuple[int, str]:
    env = os.environ.copy()
    # pnpm 9+ may exit non-zero when build scripts are blocked; allow esbuild/vite builds.
    env.setdefault("PNPM_HOME", str(Path.home() / "Library" / "pnpm"))
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout,
            env=env,
        )
    except subprocess.TimeoutExpired:
        return 124, f"timeout after {timeout}s: {' '.join(cmd)}"
    output = (result.stdout or "") + (result.stderr or "")
    code = result.returncode
    if code != 0 and "ERR_PNPM_IGNORED_BUILDS" in output and (cwd / "node_modules").is_dir():
        return 0, output.strip()
    return code, output.strip()


def process_project(
    task: ProjectTask,
    *,
    skip_installed: bool,
    build_mode: str,
    timeout_install: int,
    timeout_build: int,
    dry_run: bool,
) -> dict[str, object]:
    project_dir = task.project_dir
    name = project_dir.name
    record: dict[str, object] = {
        "root": task.root_name,
        "project": name,
        "project_dir": str(project_dir),
        "status": "pending",
    }

    has_node_modules = (project_dir / "node_modules").is_dir()
    has_dist = (project_dir / "dist" / "index.html").is_file()
    record["had_node_modules"] = has_node_modules
    record["had_dist"] = has_dist

    need_install = not (skip_installed and has_node_modules)
    need_build = build_mode == "all" or (build_mode == "if-missing" and not has_dist)

    if dry_run:
        record["status"] = "dry_run"
        record["would_install"] = need_install
        record["would_build"] = need_build
        return record

    pm_name, install_cmd = _resolve_pm(project_dir)
    record["package_manager"] = pm_name

    if need_install:
        code, output = _run(install_cmd, project_dir, timeout_install)
        if code != 0 and pm_name == "pnpm" and "--frozen-lockfile" in install_cmd:
            fallback = ["pnpm", "install"]
            code, output = _run(fallback, project_dir, timeout_install)
            record["install_cmd"] = " ".join(fallback)
        else:
            record["install_cmd"] = " ".join(install_cmd)
        if code != 0:
            record["status"] = "install_failed"
            record["error"] = output[-2000:]
            return record
    else:
        record["install_cmd"] = "skipped"

    if need_build:
        build_cmd = [pm_name, "run", "build"]
        record["build_cmd"] = " ".join(build_cmd)
        code, output = _run(build_cmd, project_dir, timeout_build)
        if code != 0:
            record["status"] = "build_failed"
            record["error"] = output[-2000:]
            return record
        record["has_dist"] = (project_dir / "dist" / "index.html").is_file()
    else:
        record["build_cmd"] = "skipped"

    record["status"] = "ok"
    return record


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Install dependencies (and optionally build dist/) for dashboard projects."
    )
    parser.add_argument(
        "--roots",
        nargs="+",
        default=["ours", "kimi"],
        help="Root directories containing tableau_dashboard_* projects (default: ours kimi).",
    )
    parser.add_argument(
        "--ids",
        nargs="*",
        help="Only process these dashboard ids (e.g. 646 160 or tableau_dashboard_646).",
    )
    parser.add_argument(
        "--build",
        choices=("none", "if-missing", "all"),
        default="if-missing",
        help="Build dist/: none | if-missing (default) | all.",
    )
    parser.add_argument(
        "--skip-installed",
        action="store_true",
        help="Skip pnpm/npm install when node_modules already exists.",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=4,
        help="Parallel projects (default: 4). Use 1 for serial.",
    )
    parser.add_argument(
        "--timeout-install",
        type=int,
        default=900,
        help="Per-project install timeout in seconds (default: 900).",
    )
    parser.add_argument(
        "--timeout-build",
        type=int,
        default=900,
        help="Per-project build timeout in seconds (default: 900).",
    )
    parser.add_argument(
        "--report",
        default="install_dashboard_deps_report.json",
        help="Write JSON report path (relative to metric_results/).",
    )
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    metric_results_dir = Path(__file__).resolve().parent

    id_set = None
    if args.ids:
        id_set = set()
        for item in args.ids:
            id_set.add(item)
            id_set.add(item.removeprefix("tableau_dashboard_"))

    try:
        roots = resolve_roots(args.roots)
    except FileNotFoundError as error:
        print(error, file=sys.stderr)
        return 1

    tasks = discover_projects(roots, id_set)
    if not tasks:
        print("No projects found.", file=sys.stderr)
        return 1

    print(f"Found {len(tasks)} project(s) under: {', '.join(str(r) for r in roots)}")
    print(f"build={args.build}, skip_installed={args.skip_installed}, concurrency={args.concurrency}")

    started = time.time()
    records: list[dict[str, object]] = []

    def _run_task(task: ProjectTask) -> dict[str, object]:
        return process_project(
            task,
            skip_installed=args.skip_installed,
            build_mode=args.build,
            timeout_install=args.timeout_install,
            timeout_build=args.timeout_build,
            dry_run=args.dry_run,
        )

    if args.concurrency <= 1:
        for index, task in enumerate(tasks, start=1):
            record = _run_task(task)
            records.append(record)
            icon = "✓" if record["status"] in {"ok", "dry_run"} else "✗"
            print(f"[{index}/{len(tasks)}] [{icon}] {task.root_name}/{task.project_dir.name} -> {record['status']}")
    else:
        with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
            future_map = {pool.submit(_run_task, task): task for task in tasks}
            done = 0
            for future in as_completed(future_map):
                task = future_map[future]
                record = future.result()
                records.append(record)
                done += 1
                icon = "✓" if record["status"] in {"ok", "dry_run"} else "✗"
                print(f"[{done}/{len(tasks)}] [{icon}] {task.root_name}/{task.project_dir.name} -> {record['status']}")

    summary = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "elapsed_seconds": round(time.time() - started, 1),
        "roots": [str(r) for r in roots],
        "total": len(records),
        "ok": sum(1 for r in records if r["status"] == "ok"),
        "dry_run": sum(1 for r in records if r["status"] == "dry_run"),
        "install_failed": sum(1 for r in records if r["status"] == "install_failed"),
        "build_failed": sum(1 for r in records if r["status"] == "build_failed"),
        "records": sorted(records, key=lambda item: (str(item["root"]), str(item["project"]))),
    }

    report_path = Path(args.report)
    if not report_path.is_absolute():
        report_path = metric_results_dir / report_path
    report_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(
        f"\nSummary: ok={summary['ok']} install_failed={summary['install_failed']} "
        f"build_failed={summary['build_failed']} elapsed={summary['elapsed_seconds']}s"
    )
    print(f"Report: {report_path}")
    return 0 if summary["install_failed"] == 0 and summary["build_failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
