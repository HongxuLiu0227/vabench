#!/usr/bin/env python3
"""Classify Tableau export folders into single- vs multi-dashboard buckets.

Scans each project under --source, counts dashboards in the primary .twb
(same rules as run_multi_tableau_dashboard_batch.py: skip storyboards and
unnamed dashboards), then places each project into --single-dir or --multi-dir.

Default mode moves projects into the destination folders (original --source tree is emptied).
"""

from __future__ import annotations

import argparse
import csv
import shutil
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Literal
from xml.etree import ElementTree as ET

Mode = Literal["symlink", "copy", "move"]


@dataclass(frozen=True)
class ProjectRecord:
    project_id: str
    source_dir: Path
    twb_path: Path
    dashboard_count: int
    dashboard_names: tuple[str, ...]
    bucket: Literal["single", "multi", "skipped"]

    @property
    def bucket_label(self) -> str:
        return self.bucket


def repo_root() -> Path:
    return Path(__file__).resolve().parent


def _local_name(tag: str) -> str:
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


def _iter_child_elements(element: ET.Element | None, name: str | None = None) -> list[ET.Element]:
    if element is None:
        return []
    children: list[ET.Element] = []
    for child in list(element):
        if not isinstance(child.tag, str):
            continue
        if name is None or _local_name(child.tag) == name:
            children.append(child)
    return children


def _find_first_child(element: ET.Element | None, name: str) -> ET.Element | None:
    if element is None:
        return None
    for child in _iter_child_elements(element):
        if _local_name(child.tag) == name:
            return child
    return None


def select_primary_twb(source_dir: Path) -> Path:
    twb_files = sorted(source_dir.glob("*.twb"))
    if not twb_files:
        raise FileNotFoundError(f"No .twb files found under: {source_dir}")
    return max(twb_files, key=lambda path: (path.stat().st_size, path.name))


def enumerate_dashboards(twb_path: Path) -> list[str]:
    root = ET.fromstring(twb_path.read_text(encoding="utf-8", errors="replace"))
    dashboards_root = _find_first_child(root, "dashboards")
    names: list[str] = []
    for child in _iter_child_elements(dashboards_root, "dashboard"):
        if str(child.attrib.get("type") or "").strip().lower() == "storyboard":
            continue
        name = str(child.attrib.get("name") or "").strip()
        if not name:
            continue
        names.append(name)
    return names


def project_id_from_dirname(dirname: str) -> str:
    if "_" in dirname:
        return dirname.split("_", 1)[0]
    return dirname


def classify_project(source_dir: Path) -> ProjectRecord:
    project_id = project_id_from_dirname(source_dir.name)
    try:
        twb_path = select_primary_twb(source_dir)
        dashboard_names = tuple(enumerate_dashboards(twb_path))
    except Exception:
        return ProjectRecord(
            project_id=project_id,
            source_dir=source_dir,
            twb_path=source_dir / "(missing)",
            dashboard_count=0,
            dashboard_names=(),
            bucket="skipped",
        )

    count = len(dashboard_names)
    bucket: Literal["single", "multi", "skipped"]
    if count <= 1:
        bucket = "single"
    else:
        bucket = "multi"

    return ProjectRecord(
        project_id=project_id,
        source_dir=source_dir,
        twb_path=twb_path,
        dashboard_count=count,
        dashboard_names=dashboard_names,
        bucket=bucket,
    )


def materialize_link(
    *,
    source_dir: Path,
    dest_dir: Path,
    mode: Mode,
    force: bool,
    dry_run: bool,
) -> None:
    if dest_dir.exists() or dest_dir.is_symlink():
        if not force:
            raise FileExistsError(f"Destination already exists: {dest_dir}")
        if not dry_run:
            if dest_dir.is_symlink() or dest_dir.is_file():
                dest_dir.unlink()
            else:
                shutil.rmtree(dest_dir)

    if dry_run:
        return

    dest_dir.parent.mkdir(parents=True, exist_ok=True)
    if mode == "symlink":
        dest_dir.symlink_to(source_dir.resolve())
    elif mode == "copy":
        shutil.copytree(source_dir, dest_dir, symlinks=True)
    elif mode == "move":
        shutil.move(str(source_dir), str(dest_dir))
    else:
        raise ValueError(f"Unsupported mode: {mode}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Split Tableau export folders under output_twbx into single-dashboard "
            "and multi-dashboard directories."
        )
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=Path("output/dashboard/output_twbx"),
        help="Root directory containing extracted Tableau project folders.",
    )
    parser.add_argument(
        "--single-dir",
        type=Path,
        default=Path("output/dashboard/output_twbx_single"),
        help="Destination root for single-dashboard projects (<=1 dashboard).",
    )
    parser.add_argument(
        "--multi-dir",
        type=Path,
        default=Path("output/dashboard/output_twbx_multi"),
        help="Destination root for multi-dashboard projects (>=2 dashboards).",
    )
    parser.add_argument(
        "--mode",
        choices=("symlink", "copy", "move"),
        default="move",
        help="How to place projects into destination folders (default: move).",
    )
    parser.add_argument(
        "--report",
        type=Path,
        default=Path("output/dashboard/tableau_dashboard_classification.csv"),
        help="CSV report path (set empty string to disable).",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Replace existing destination entries.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only scan and print summary; do not create links or files.",
    )
    return parser.parse_args()


def write_report(path: Path, records: list[ProjectRecord], *, dry_run: bool) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "project_id",
                "source_dir",
                "twb_file",
                "dashboard_count",
                "dashboard_names",
                "bucket",
                "destination",
                "dry_run",
            ]
        )
        for record in records:
            dest_root = None
            if record.bucket == "single":
                dest_root = "single_dir"
            elif record.bucket == "multi":
                dest_root = "multi_dir"
            writer.writerow(
                [
                    record.project_id,
                    str(record.source_dir),
                    str(record.twb_path),
                    record.dashboard_count,
                    " | ".join(record.dashboard_names),
                    record.bucket,
                    dest_root or "",
                    dry_run,
                ]
            )


def main() -> int:
    args = parse_args()
    repo_dir = repo_root()
    source_root = (repo_dir / args.source).resolve()
    single_root = (repo_dir / args.single_dir).resolve()
    multi_root = (repo_dir / args.multi_dir).resolve()
    report_path = (repo_dir / args.report).resolve() if str(args.report).strip() else None

    if not source_root.is_dir():
        print(f"Source directory does not exist: {source_root}", file=sys.stderr)
        return 1

    if args.mode == "move" and not args.dry_run:
        print(
            "Warning: --mode move will empty the source tree as projects are relocated.",
            file=sys.stderr,
        )

    records: list[ProjectRecord] = []
    for child in sorted(source_root.iterdir()):
        if not child.is_dir():
            continue
        records.append(classify_project(child))

    single_records = [r for r in records if r.bucket == "single"]
    multi_records = [r for r in records if r.bucket == "multi"]
    skipped_records = [r for r in records if r.bucket == "skipped"]

    if not args.dry_run:
        single_root.mkdir(parents=True, exist_ok=True)
        multi_root.mkdir(parents=True, exist_ok=True)

    errors: list[str] = []
    for record in single_records + multi_records:
        dest_root = single_root if record.bucket == "single" else multi_root
        dest_dir = dest_root / record.source_dir.name
        try:
            materialize_link(
                source_dir=record.source_dir,
                dest_dir=dest_dir,
                mode=args.mode,
                force=args.force,
                dry_run=args.dry_run,
            )
        except Exception as exc:
            errors.append(f"{record.source_dir.name}: {exc}")

    if report_path is not None:
        write_report(report_path, records, dry_run=args.dry_run)

    print(f"Source: {source_root}")
    print(f"Single -> {single_root}")
    print(f"Multi  -> {multi_root}")
    print(f"Mode: {args.mode}" + (" (dry-run)" if args.dry_run else ""))
    print(
        f"Summary: total={len(records)} single={len(single_records)} "
        f"multi={len(multi_records)} skipped={len(skipped_records)} errors={len(errors)}"
    )
    if report_path is not None:
        print(f"Report: {report_path}")
    if errors:
        print("Errors:", file=sys.stderr)
        for item in errors[:20]:
            print(f"  - {item}", file=sys.stderr)
        if len(errors) > 20:
            print(f"  ... and {len(errors) - 20} more", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
