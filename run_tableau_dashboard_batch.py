#!/Users/jack/miniconda3/bin/python
from __future__ import annotations

import argparse
import shlex
import subprocess
import sys
from pathlib import Path

PATH_SURFIX = '_refine5'

DEFAULT_PROJECT_IDS = [
    # 121, # 成功
    # 269, # 成功，多两个图表
    # 283, # 失败 // 失败，交互异常 // 成功
    # 334, # 待定，交互异常 // 成功
    # 357, # 成功
    # 1225, # 成功
    # 1979, # 成功
    # 2010, # 成功
    # 2685, # 成功
    # 2819, # 成功
    # 3014, # 成功
    # 3352, # 失败，数据异常 // 失败，数据异常 // 失败，数据异常 // 失败，数据异常 // 成功，图表方向不正确
    # 3512, # 失败，一个视图异常 // 失败，数据异常 // 失败，数据异常 // 失败，数据异常 // 成功
    # 3533, # 成功，图表方向不正确
    # 3572, # 成功
    # 3947, # 待定，一个图表类型错误 // 待定，一个图表类型错误 // 成功
    # 4592, # 待定，一个图表类型错误 // 待定，一个图表类型错误 // 成功
    # 4838, # 成功
    # 5198, # 失败，数据异常 // 成功
    # 5251, # 成功，图表方向不正确
    # 6033, # 成功
    # 6490, # 成功
    # 9517, # 待定，多三个图表，散点图数据显示不全 // 成功，多四个图表
    10700, # 失败 // 失败，数据异常 // 失败，数据异常 // 失败，数据异常 // 失败，数据异常 // 待定，图表类型不正确
    # 10845, # 成功
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Serially run the Tableau pipeline for the filtered single-dashboard projects "
            "and write each result to generated-react-app/tableau_dashboard_<id>."
        )
    )
    parser.add_argument(
        "--ids",
        nargs="*",
        type=int,
        default=DEFAULT_PROJECT_IDS,
        help="Project ids to run. Defaults to the filtered 25-project list.",
    )
    parser.add_argument(
        "--tableau-root",
        type=Path,
        default=Path("output/dashboard/output_twbx"),
        help="Directory containing the extracted Tableau project folders.",
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path("generated-react-app"),
        help="Base directory for generated projects.",
    )
    parser.add_argument(
        "--python",
        type=str,
        default=sys.executable,
        help="Python executable used to invoke `python -m multi_agent_new.cli run`.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Pass --force to the pipeline and rerun even if the output directory already exists.",
    )
    parser.add_argument(
        "--seperate-steps",
        action="store_true",
        help="Pass --seperate-steps through to the Tableau pipeline.",
    )
    parser.add_argument(
        "--continue-on-error",
        action="store_true",
        help="Keep running later ids after a failure. By default the script stops on the first error.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the commands without executing them.",
    )
    return parser.parse_args()


def repo_root() -> Path:
    return Path(__file__).resolve().parent


def resolve_tableau_dir(tableau_root: Path, project_id: int) -> Path:
    matches = sorted(path for path in tableau_root.glob(f"{project_id}_*") if path.is_dir())
    if not matches:
        raise FileNotFoundError(
            f"No Tableau export directory found for id {project_id} under {tableau_root}"
        )
    if len(matches) > 1:
        names = ", ".join(path.name for path in matches)
        raise RuntimeError(
            f"Expected exactly one Tableau export directory for id {project_id}, found {len(matches)}: {names}"
        )
    return matches[0]


def display_path(path: Path, root: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def build_command(
    *,
    python_exec: str,
    tableau_dir: Path,
    output_dir: Path,
    repo_dir: Path,
    force: bool,
    seperate_steps: bool,
) -> list[str]:
    command = [
        python_exec,
        "-m",
        "multi_agent_new.cli",
        "run",
        "--tableau",
        display_path(tableau_dir, repo_dir),
        "--output-dir",
        display_path(output_dir, repo_dir),
    ]
    if force:
        command.append("--force")
    if seperate_steps:
        command.append("--seperate-steps")
    return command


def main() -> int:
    args = parse_args()
    repo_dir = repo_root()
    tableau_root = (repo_dir / args.tableau_root).resolve()
    output_root = (repo_dir / args.output_root).resolve()
    output_root.mkdir(parents=True, exist_ok=True)

    completed: list[int] = []
    skipped: list[int] = []
    failed: list[int] = []

    for index, project_id in enumerate(args.ids, start=1):
        tableau_dir = resolve_tableau_dir(tableau_root, project_id)
        output_dir = output_root / f"tableau_dashboard{PATH_SURFIX}_{project_id}"

        if output_dir.exists() and not args.force:
            print(
                f"[{index}/{len(args.ids)}] Skipping {project_id}: "
                f"{display_path(output_dir, repo_dir)} already exists"
            )
            skipped.append(project_id)
            continue

        command = build_command(
            python_exec=args.python,
            tableau_dir=tableau_dir,
            output_dir=output_dir,
            repo_dir=repo_dir,
            force=args.force,
            seperate_steps=args.seperate_steps,
        )
        print(f"[{index}/{len(args.ids)}] Running {project_id}")
        print("  " + shlex.join(command))

        if args.dry_run:
            continue

        result = subprocess.run(command, cwd=repo_dir, check=False)
        if result.returncode == 0:
            completed.append(project_id)
            continue

        failed.append(project_id)
        print(f"  Failed with exit code {result.returncode}")
        if not args.continue_on_error:
            break

    if args.dry_run:
        print(f"Dry run complete for {len(args.ids)} project(s).")
        return 0

    print(
        "Summary: "
        f"completed={len(completed)}, skipped={len(skipped)}, failed={len(failed)}"
    )
    if completed:
        print("  Completed ids: " + ", ".join(str(item) for item in completed))
    if skipped:
        print("  Skipped ids: " + ", ".join(str(item) for item in skipped))
    if failed:
        print("  Failed ids: " + ", ".join(str(item) for item in failed))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
