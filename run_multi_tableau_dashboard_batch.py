#!/Users/jack/miniconda3/bin/python
from __future__ import annotations

import argparse
import json
import shlex
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Optional
from xml.etree import ElementTree as ET

DEFAULT_PROJECT_IDS = [
    147,
    163,
    451,
    454,
    696,
    1107,
    1223,
    1378,
    1473,
    1602,
    1632,
    2656,
    2755,
    2936,
    3330,
    3430,
    3480,
    3980,
    4029,
    4030,
    4057,
    4245,
    4428,
    4836,
    5417,
    5781,
    5913,
    5938,
    6067,
    7172,
    8077,
    8233,
    9767,
    10580,
    10996,
]

SKIP_ZONE_TYPES = {
    "bitmap",
    "color",
    "filter",
    "layout-basic",
    "layout-flow",
    "text",
    "title",
}

ET.register_namespace("user", "http://www.tableausoftware.com/xml/user")


@dataclass(frozen=True)
class DashboardTask:
    project_id: int
    dashboard_index: int
    dashboard_name: str
    source_dir: Path
    source_twb_path: Path
    split_input_dir: Path
    output_dir: Path

    @property
    def label(self) -> str:
        return f"{self.project_id}_{self.dashboard_index}"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Split each multi-dashboard Tableau workbook into single-dashboard inputs and "
            "serially run the pipeline into generated-react-app/tableau_dashboard_<project>_<dashboard-index>."
        )
    )
    parser.add_argument(
        "--ids",
        nargs="*",
        type=int,
        default=DEFAULT_PROJECT_IDS,
        help="Project ids to run. Defaults to the filtered multi-dashboard project list.",
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
        "--split-root",
        type=Path,
        default=Path(".pipeline_cache/tableau_split_inputs_multi"),
        help="Directory where split single-dashboard Tableau inputs will be materialized.",
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
        help="Keep running later dashboard tasks after a failure. By default the script stops on the first error.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the planned invocations without executing the pipeline or writing split inputs.",
    )
    return parser.parse_args()


def repo_root() -> Path:
    return Path(__file__).resolve().parent


def display_path(path: Path, root: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


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


def select_primary_twb(source_dir: Path) -> Path:
    twb_files = sorted(source_dir.glob("*.twb"))
    if not twb_files:
        raise FileNotFoundError(f"No .twb files found under: {source_dir}")
    return max(twb_files, key=lambda path: (path.stat().st_size, path.name))


def _local_name(tag: str) -> str:
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


def _iter_child_elements(element: Optional[ET.Element], name: Optional[str] = None) -> list[ET.Element]:
    if element is None:
        return []
    children: list[ET.Element] = []
    for child in list(element):
        if not isinstance(child.tag, str):
            continue
        if name is None or _local_name(child.tag) == name:
            children.append(child)
    return children


def _find_first_child(element: Optional[ET.Element], name: str) -> Optional[ET.Element]:
    if element is None:
        return None
    for child in _iter_child_elements(element):
        if _local_name(child.tag) == name:
            return child
    return None


def _extract_zone_type(zone: ET.Element) -> str:
    for key, value in zone.attrib.items():
        if key.endswith("type-v2"):
            return str(value)
    for key, value in zone.attrib.items():
        if key.endswith("type"):
            return str(value)
    return ""


def enumerate_dashboards(twb_path: Path) -> list[tuple[int, str]]:
    root = ET.fromstring(twb_path.read_text(encoding="utf-8", errors="replace"))
    dashboards_root = _find_first_child(root, "dashboards")
    entries: list[tuple[int, str]] = []
    for child in _iter_child_elements(dashboards_root, "dashboard"):
        if str(child.attrib.get("type") or "").strip().lower() == "storyboard":
            continue
        name = str(child.attrib.get("name") or "").strip()
        if not name:
            continue
        entries.append((len(entries) + 1, name))
    return entries


def build_tasks(
    *,
    project_ids: Iterable[int],
    tableau_root: Path,
    split_root: Path,
    output_root: Path,
) -> tuple[list[DashboardTask], list[int]]:
    tasks: list[DashboardTask] = []
    skipped_ids: list[int] = []
    for project_id in project_ids:
        source_dir = resolve_tableau_dir(tableau_root, project_id)
        source_twb_path = select_primary_twb(source_dir)
        dashboards = enumerate_dashboards(source_twb_path)
        if len(dashboards) <= 1:
            skipped_ids.append(project_id)
            continue
        for dashboard_index, dashboard_name in dashboards:
            tasks.append(
                DashboardTask(
                    project_id=project_id,
                    dashboard_index=dashboard_index,
                    dashboard_name=dashboard_name,
                    source_dir=source_dir,
                    source_twb_path=source_twb_path,
                    split_input_dir=split_root / f"{project_id}_{dashboard_index}",
                    output_dir=output_root / f"tableau_dashboard_{project_id}_{dashboard_index}",
                )
            )
    return tasks, skipped_ids


def collect_dashboard_worksheet_names(
    dashboard_element: ET.Element,
    worksheet_names: set[str],
) -> list[str]:
    names: list[str] = []
    seen: set[str] = set()

    def walk(zone_element: ET.Element) -> None:
        zone_type = _extract_zone_type(zone_element).strip().lower()
        name = str(zone_element.attrib.get("name") or "").strip()
        if name and name in worksheet_names and zone_type not in SKIP_ZONE_TYPES and name not in seen:
            seen.add(name)
            names.append(name)
        for child in _iter_child_elements(zone_element, "zone"):
            walk(child)

    zones_root = _find_first_child(dashboard_element, "zones")
    for zone in _iter_child_elements(zones_root, "zone"):
        walk(zone)
    return names


def prune_dashboards(
    root: ET.Element,
    *,
    keep_dashboard_index: int,
) -> tuple[str, set[str], set[str]]:
    dashboards_root = _find_first_child(root, "dashboards")
    worksheets_root = _find_first_child(root, "worksheets")
    worksheet_names = {
        str(worksheet.attrib.get("name") or "").strip()
        for worksheet in _iter_child_elements(worksheets_root, "worksheet")
        if str(worksheet.attrib.get("name") or "").strip()
    }
    all_dashboard_names: set[str] = set()
    selected_dashboard_name = ""
    kept_worksheet_names: set[str] = set()
    filtered_index = 0

    for dashboard in list(_iter_child_elements(dashboards_root, "dashboard")):
        dashboard_type = str(dashboard.attrib.get("type") or "").strip().lower()
        dashboard_name = str(dashboard.attrib.get("name") or "").strip()
        if dashboard_name:
            all_dashboard_names.add(dashboard_name)

        if dashboard_type == "storyboard" or not dashboard_name:
            dashboards_root.remove(dashboard)
            continue

        filtered_index += 1
        if filtered_index != keep_dashboard_index:
            dashboards_root.remove(dashboard)
            continue

        selected_dashboard_name = dashboard_name
        kept_worksheet_names = set(collect_dashboard_worksheet_names(dashboard, worksheet_names))

    if not selected_dashboard_name:
        raise ValueError(f"Could not resolve dashboard index {keep_dashboard_index}.")
    if not kept_worksheet_names:
        raise ValueError(
            f"Selected dashboard `{selected_dashboard_name}` does not reference any worksheet-backed zones."
        )
    return selected_dashboard_name, all_dashboard_names, kept_worksheet_names


def prune_worksheets(root: ET.Element, kept_worksheet_names: set[str]) -> None:
    worksheets_root = _find_first_child(root, "worksheets")
    for worksheet in list(_iter_child_elements(worksheets_root, "worksheet")):
        name = str(worksheet.attrib.get("name") or "").strip()
        if name and name not in kept_worksheet_names:
            worksheets_root.remove(worksheet)


def should_keep_action(
    action: ET.Element,
    *,
    keep_dashboard_name: str,
    kept_worksheet_names: set[str],
    all_dashboard_names: set[str],
    all_worksheet_names: set[str],
) -> bool:
    source = _find_first_child(action, "source")
    if source is not None:
        source_dashboard = str(source.attrib.get("dashboard") or "").strip()
        source_worksheet = str(source.attrib.get("worksheet") or "").strip()
        if source_dashboard and source_dashboard in all_dashboard_names and source_dashboard != keep_dashboard_name:
            return False
        if source_worksheet and source_worksheet in all_worksheet_names and source_worksheet not in kept_worksheet_names:
            return False

    command = _find_first_child(action, "command")
    for param in _iter_child_elements(command, "param"):
        value = str(param.attrib.get("value") or "").strip()
        if not value:
            continue
        if value in all_dashboard_names and value != keep_dashboard_name:
            return False
        if value in all_worksheet_names and value not in kept_worksheet_names:
            return False
    return True


def prune_actions(
    root: ET.Element,
    *,
    keep_dashboard_name: str,
    kept_worksheet_names: set[str],
    all_dashboard_names: set[str],
) -> None:
    all_worksheet_names = {
        str(worksheet.attrib.get("name") or "").strip()
        for worksheet in _iter_child_elements(_find_first_child(root, "worksheets"), "worksheet")
        if str(worksheet.attrib.get("name") or "").strip()
    }
    actions_root = _find_first_child(root, "actions")
    for action in list(_iter_child_elements(actions_root, "action")):
        if not should_keep_action(
            action,
            keep_dashboard_name=keep_dashboard_name,
            kept_worksheet_names=kept_worksheet_names,
            all_dashboard_names=all_dashboard_names,
            all_worksheet_names=all_worksheet_names,
        ):
            actions_root.remove(action)


def prune_windows(
    root: ET.Element,
    *,
    keep_dashboard_name: str,
    kept_worksheet_names: set[str],
) -> None:
    windows_root = _find_first_child(root, "windows")
    for window in list(_iter_child_elements(windows_root, "window")):
        window_class = str(window.attrib.get("class") or "").strip().lower()
        window_name = str(window.attrib.get("name") or "").strip()
        if window_class == "worksheet" and window_name and window_name not in kept_worksheet_names:
            windows_root.remove(window)
            continue
        if window_class == "dashboard" and window_name and window_name != keep_dashboard_name:
            windows_root.remove(window)


def prune_thumbnails(root: ET.Element, *, keep_dashboard_name: str) -> None:
    thumbnails_root = _find_first_child(root, "thumbnails")
    for thumbnail in list(_iter_child_elements(thumbnails_root, "thumbnail")):
        name = str(thumbnail.attrib.get("name") or "").strip()
        if name and name != keep_dashboard_name:
            thumbnails_root.remove(thumbnail)


def link_or_copy(src: Path, dest: Path) -> None:
    if dest.exists() or dest.is_symlink():
        if dest.is_dir() and not dest.is_symlink():
            shutil.rmtree(dest)
        else:
            dest.unlink()
    try:
        dest.symlink_to(src.resolve(), target_is_directory=src.is_dir())
        return
    except OSError:
        pass

    if src.is_dir():
        shutil.copytree(src, dest, symlinks=True)
    else:
        shutil.copy2(src, dest)


def materialize_split_input(task: DashboardTask) -> None:
    root = ET.fromstring(task.source_twb_path.read_text(encoding="utf-8", errors="replace"))
    keep_dashboard_name, all_dashboard_names, kept_worksheet_names = prune_dashboards(
        root,
        keep_dashboard_index=task.dashboard_index,
    )
    prune_worksheets(root, kept_worksheet_names)
    prune_actions(
        root,
        keep_dashboard_name=keep_dashboard_name,
        kept_worksheet_names=kept_worksheet_names,
        all_dashboard_names=all_dashboard_names,
    )
    prune_windows(
        root,
        keep_dashboard_name=keep_dashboard_name,
        kept_worksheet_names=kept_worksheet_names,
    )
    prune_thumbnails(root, keep_dashboard_name=keep_dashboard_name)

    if task.split_input_dir.exists():
        shutil.rmtree(task.split_input_dir)
    task.split_input_dir.mkdir(parents=True, exist_ok=True)

    for child in sorted(task.source_dir.iterdir(), key=lambda path: path.name):
        if child.is_file() and child.suffix.lower() == ".twb":
            continue
        link_or_copy(child, task.split_input_dir / child.name)

    split_twb_path = task.split_input_dir / task.source_twb_path.name
    split_twb_path.write_text(ET.tostring(root, encoding="unicode"), encoding="utf-8")

    metadata = {
        "project_id": task.project_id,
        "dashboard_index": task.dashboard_index,
        "dashboard_name": keep_dashboard_name,
        "source_dir": str(task.source_dir),
        "source_twb_path": str(task.source_twb_path),
        "split_twb_path": str(split_twb_path),
        "worksheet_names": sorted(kept_worksheet_names),
    }
    (task.split_input_dir / "split_metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


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
    split_root = (repo_dir / args.split_root).resolve()
    output_root.mkdir(parents=True, exist_ok=True)
    split_root.mkdir(parents=True, exist_ok=True)

    tasks, skipped_ids = build_tasks(
        project_ids=args.ids,
        tableau_root=tableau_root,
        split_root=split_root,
        output_root=output_root,
    )
    if not tasks:
        print("No multi-dashboard tasks to run.")
        if skipped_ids:
            print("Skipped non-multi-dashboard ids: " + ", ".join(str(item) for item in skipped_ids))
        return 0

    completed: list[str] = []
    skipped: list[str] = []
    failed: list[str] = []

    if skipped_ids:
        print("Skipped non-multi-dashboard ids: " + ", ".join(str(item) for item in skipped_ids))

    for index, task in enumerate(tasks, start=1):
        if task.output_dir.exists() and not args.force:
            print(
                f"[{index}/{len(tasks)}] Skipping {task.label}: "
                f"{display_path(task.output_dir, repo_dir)} already exists"
            )
            skipped.append(task.label)
            continue

        print(f"[{index}/{len(tasks)}] Running {task.label} ({task.dashboard_name})")

        if not args.dry_run:
            materialize_split_input(task)

        command = build_command(
            python_exec=args.python,
            tableau_dir=task.split_input_dir,
            output_dir=task.output_dir,
            repo_dir=repo_dir,
            force=args.force,
            seperate_steps=args.seperate_steps,
        )
        print("  " + shlex.join(command))

        if args.dry_run:
            continue

        result = subprocess.run(command, cwd=repo_dir, check=False)
        if result.returncode == 0:
            completed.append(task.label)
            continue

        failed.append(task.label)
        print(f"  Failed with exit code {result.returncode}")
        if not args.continue_on_error:
            break

    if args.dry_run:
        print(f"Dry run complete for {len(tasks)} dashboard task(s).")
        return 0

    print(
        "Summary: "
        f"completed={len(completed)}, skipped={len(skipped)}, failed={len(failed)}"
    )
    if completed:
        print("  Completed tasks: " + ", ".join(completed))
    if skipped:
        print("  Skipped tasks: " + ", ".join(skipped))
    if failed:
        print("  Failed tasks: " + ", ".join(failed))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
