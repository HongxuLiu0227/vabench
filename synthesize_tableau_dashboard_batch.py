#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import copy
import json
import random
import re
import shutil
import uuid
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Set, Tuple
from xml.etree import ElementTree as ET


DEFAULT_REFERENCE_PROJECT_IDS = [
    121,
    269,
    283,
    334,
    357,
    1225,
    1979,
    2010,
    2685,
    2819,
    3014,
    3352,
    3512,
    3533,
    3572,
    3947,
    4592,
    4838,
    5198,
    5251,
    6033,
    6490,
    9517,
    10700,
    10845,
]

CURATED_SYNTHESIS_PROFILES = [
    {
        "name": "superstore_triptych",
        "layout_project_id": 121,
        "views": [
            (1225, "Total Sales Each Year"),
            (9517, "Sales by Sub Category "),
            (6033, "Sales by Segment"),
        ],
    },
    {
        "name": "superstore_triptych_scatter",
        "layout_project_id": 121,
        "views": [
            (2685, "Monthly Profit"),
            (6033, "Sales by Segment"),
            (9517, "Sales by Sub Category "),
            (121, "Scatterplot"),
        ],
    },
    {
        "name": "superstore_quad",
        "layout_project_id": 1225,
        "views": [
            (1225, "Total Sales Each Year"),
            (9517, "Sales by Sub Category "),
            (6033, "Sales by Segment"),
            (121, "Scatterplot"),
        ],
    },
]

LAYOUT_TEMPLATE_PROJECT_IDS: Dict[int, Tuple[int, ...]] = {
    3: (121,),
    4: (1225, 2010),
}


@dataclass(frozen=True)
class DatasourceInfo:
    original_name: str
    caption: str
    relation_pairs: Tuple[Tuple[str, str], ...]
    source_csv: Optional[Path]
    is_parameter: bool


@dataclass(frozen=True)
class FieldSpec:
    ref: str
    caption: str
    datatype: str
    role: str
    semantic_role: str
    is_calculated: bool


@dataclass(frozen=True)
class WorksheetCandidate:
    project_id: int
    source_dir: Path
    source_name: str
    chart_type: str
    datasource_names: Tuple[str, ...]


@dataclass
class ProjectModel:
    project_id: int
    source_dir: Path
    twb_path: Path
    root: ET.Element
    workbook_attrs: Dict[str, str]
    dashboard_name: str
    dashboard_sheet_order: List[str]
    dashboard_zone_count: int
    dashboard_text_zone_count: int
    worksheet_map: Dict[str, ET.Element]
    window_map: Dict[str, ET.Element]
    action_elements: List[ET.Element]
    datasource_elements: Dict[str, ET.Element]
    datasource_infos: Dict[str, DatasourceInfo]
    datasource_field_specs: Dict[str, Dict[str, FieldSpec]]
    worksheet_datasources: Dict[str, Set[str]]
    chart_types: Dict[str, str]
    worksheet_has_action: Dict[str, bool]
    schema_signature: Set[str]
    data_files: List[Path]


@dataclass(frozen=True)
class SelectedWorksheet:
    donor: ProjectModel
    source_name: str
    new_name: str
    display_title: str
    chart_type: str
    datasource_names: Tuple[str, ...]


@dataclass(frozen=True)
class SynthesisPlan:
    index: int
    folder_name: str
    workbook_name: str
    dashboard_name: str
    layout_project: ProjectModel
    selected_worksheets: Tuple[SelectedWorksheet, ...]
    target_data_project: Optional[ProjectModel] = None
    worksheet_field_maps: Optional[Dict[Tuple[int, str], Dict[str, str]]] = None
    strategy: str = "generic"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Batch synthesize simple single-dashboard Tableau workbooks by mixing "
            "layout and worksheet views from reference projects."
        )
    )
    parser.add_argument(
        "--ids",
        nargs="*",
        type=int,
        default=DEFAULT_REFERENCE_PROJECT_IDS,
        help="Reference project ids. Defaults to the ids defined in this script.",
    )
    parser.add_argument(
        "--tableau-root",
        type=Path,
        default=Path("output/dashboard/output_twbx"),
        help="Directory containing extracted Tableau project folders.",
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path("synthesize"),
        help="Directory where synthesized projects will be written.",
    )
    parser.add_argument(
        "--clean-output-root",
        action="store_true",
        help="Delete the entire output root before generating new samples.",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=5,
        help="Number of synthesized projects to generate.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=23,
        help="Random seed for reproducible sampling.",
    )
    parser.add_argument(
        "--min-source-projects",
        type=int,
        default=2,
        help="Minimum number of distinct source projects to mix into each synthesis.",
    )
    parser.add_argument(
        "--max-source-projects",
        type=int,
        default=3,
        help="Maximum number of distinct source projects to mix into each synthesis.",
    )
    parser.add_argument(
        "--strategy",
        type=str,
        choices=("curated", "auto-cluster", "auto-remap", "generic"),
        default="auto-remap",
        help=(
            "Synthesis strategy. `auto-cluster` groups compatible projects by schema and "
            "samples within clusters. `auto-remap` remaps donor chart roles onto a shared "
            "target datasource. `curated` uses hand-picked profiles."
        ),
    )
    parser.add_argument(
        "--min-schema-similarity",
        type=float,
        default=0.6,
        help="Minimum Jaccard similarity between layout and donor datasource schemas.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite synthesized project folders if they already exist.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned outputs without writing files.",
    )
    return parser.parse_args()


def repo_root() -> Path:
    return Path(__file__).resolve().parent


def local_name(tag: str) -> str:
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


def canonical_tag_name(tag: str) -> str:
    name = local_name(tag)
    if "..." in name:
        return name.rsplit("...", 1)[1]
    return name


def iter_children(element: Optional[ET.Element], name: Optional[str] = None) -> List[ET.Element]:
    if element is None:
        return []
    result: List[ET.Element] = []
    for child in list(element):
        if not isinstance(child.tag, str):
            continue
        if name is None or local_name(child.tag) == name:
            result.append(child)
    return result


def find_first_child(element: Optional[ET.Element], name: str) -> Optional[ET.Element]:
    for child in iter_children(element):
        if local_name(child.tag) == name:
            return child
    return None


def replace_textual_content(node: ET.Element, replacements: Dict[str, str]) -> None:
    if node.text:
        for old, new in replacements.items():
            node.text = node.text.replace(old, new)
    if node.tail:
        for old, new in replacements.items():
            node.tail = node.tail.replace(old, new)
    for key, value in list(node.attrib.items()):
        updated = value
        for old, new in replacements.items():
            updated = updated.replace(old, new)
        node.attrib[key] = updated
    for child in list(node):
        replace_textual_content(child, replacements)


def prune_tree(node: ET.Element, predicate) -> None:
    for child in list(node):
        if predicate(child):
            node.remove(child)
            continue
        prune_tree(child, predicate)


def normalize_for_match(text: str) -> str:
    value = text.lower()
    value = value.replace("#csv", "")
    value = value.replace("#txt", "")
    value = value.replace(".csv", "")
    value = value.replace(".txt", "")
    value = value.replace("$", "")
    value = re.sub(r"[^a-z0-9]+", "", value)
    return value


def sanitize_slug(text: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9]+", "_", text).strip("_").lower()
    return value or "item"


def normalize_field_name(text: str) -> str:
    value = str(text or "").strip().lower()
    value = value.replace("[", "").replace("]", "")
    value = re.sub(r"[^a-z0-9]+", "_", value).strip("_")
    return value


def normalize_display_title(text: str) -> str:
    value = str(text or "").replace("\n", " ").replace("\r", " ")
    value = re.sub(r"\s+", " ", value).strip()
    return value or "Sheet"


def strip_outer_quotes(text: str) -> str:
    value = str(text or "")
    while len(value) >= 2 and value[0] == '"' and value[-1] == '"':
        value = value[1:-1]
    return value


def normalize_csv_header_row(csv_path: Path) -> None:
    try:
        with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.reader(handle)
            rows = list(reader)
    except Exception:
        return

    if not rows:
        return

    original_header = rows[0]
    cleaned_header = [strip_outer_quotes(cell) for cell in original_header]
    if cleaned_header == original_header:
        return

    rows[0] = cleaned_header
    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerows(rows)


def normalize_all_csv_headers(data_root: Path) -> None:
    if not data_root.exists():
        return
    for csv_path in sorted(data_root.rglob("*.csv")):
        normalize_csv_header_row(csv_path)


def parse_version_tuple(raw_version: str) -> Tuple[int, ...]:
    parts = []
    for token in str(raw_version or "").split("."):
        if token.isdigit():
            parts.append(int(token))
        else:
            match = re.search(r"\d+", token)
            if match:
                parts.append(int(match.group(0)))
    return tuple(parts) or (0,)


def compatibility_key(project: ProjectModel) -> Tuple[Tuple[int, ...], str, int]:
    version_tuple = parse_version_tuple(project.workbook_attrs.get("version", "0"))
    source_build = project.workbook_attrs.get("source-build", "")
    return (version_tuple, source_build, project.project_id)


def resolve_project_dir(tableau_root: Path, project_id: int) -> Optional[Path]:
    matches = sorted(path for path in tableau_root.glob(f"{project_id}_*") if path.is_dir())
    if len(matches) == 1:
        return matches[0]
    return None


def find_relation_elements(datasource: ET.Element) -> List[ET.Element]:
    relations: List[ET.Element] = []
    for elem in datasource.iter():
        if not isinstance(elem.tag, str):
            continue
        tag = local_name(elem.tag)
        if tag == "relation" or tag.endswith("relation"):
            relations.append(elem)
    return relations


def score_csv_match(relation_pairs: Sequence[Tuple[str, str]], datasource_caption: str, csv_path: Path) -> int:
    csv_name = csv_path.name
    csv_stem = csv_path.stem
    normalized_csv_name = normalize_for_match(csv_name)
    normalized_csv_stem = normalize_for_match(csv_stem)
    tokens = {
        normalized_csv_name,
        normalized_csv_stem,
    }
    score = 0

    for raw_name, raw_table in relation_pairs:
        for candidate in (raw_name, raw_table, datasource_caption):
            normalized = normalize_for_match(candidate)
            if not normalized:
                continue
            if normalized in tokens:
                score += 100
            if normalized and normalized_csv_name.startswith(normalized):
                score += 30
            if normalized and normalized in normalized_csv_name:
                score += 20
            if normalized and normalized_csv_stem.startswith(normalized):
                score += 20
            if normalized and normalized in normalized_csv_stem:
                score += 10
    return score


def resolve_datasource_csv(
    relation_pairs: Sequence[Tuple[str, str]],
    datasource_caption: str,
    data_files: Sequence[Path],
) -> Optional[Path]:
    if not data_files:
        return None
    if len(data_files) == 1:
        return data_files[0]

    ranked = sorted(
        ((score_csv_match(relation_pairs, datasource_caption, path), path) for path in data_files),
        key=lambda item: (item[0], item[1].name),
        reverse=True,
    )
    best_score, best_path = ranked[0]
    if best_score <= 0:
        return None
    if len(ranked) > 1 and ranked[1][0] == best_score:
        return None
    return best_path


def chart_type_for_worksheet(worksheet: ET.Element) -> str:
    for elem in worksheet.iter():
        if not isinstance(elem.tag, str):
            continue
        if local_name(elem.tag) == "mark":
            value = elem.attrib.get("class") or elem.attrib.get("type")
            if value:
                return value
    return "unknown"


def extract_dashboard_sheet_order(
    dashboard: ET.Element,
    worksheet_names: Set[str],
) -> Tuple[List[str], int]:
    ordered: List[str] = []
    raw_count = 0

    def walk(zone: ET.Element) -> None:
        nonlocal raw_count
        name = zone.attrib.get("name")
        if name in worksheet_names:
            raw_count += 1
            if name not in ordered:
                ordered.append(name)
        for child in list(zone):
            if not isinstance(child.tag, str):
                continue
            if local_name(child.tag) == "zone":
                walk(child)

    zones = find_first_child(dashboard, "zones")
    for zone in iter_children(zones, "zone"):
        walk(zone)
    return ordered, raw_count


def extract_dashboard_text_zone_count(dashboard: ET.Element) -> int:
    count = 0
    for elem in dashboard.iter():
        if not isinstance(elem.tag, str):
            continue
        if local_name(elem.tag) == "formatted-text":
            count += 1
    return count


def extract_worksheet_datasources(worksheet: ET.Element) -> Set[str]:
    names: Set[str] = set()
    for elem in worksheet.iter():
        if not isinstance(elem.tag, str):
            continue
        if local_name(elem.tag) != "datasource":
            continue
        name = elem.attrib.get("name") or elem.attrib.get("datasource")
        if name:
            names.add(name)
    return names


def worksheet_has_action_dependencies(worksheet: ET.Element) -> bool:
    for elem in worksheet.iter():
        if not isinstance(elem.tag, str):
            continue
        if elem.text and "[Action" in elem.text:
            return True
        for value in elem.attrib.values():
            if "[Action" in value or "ui-action-filter" in value:
                return True
    return False


def datasource_schema_signature(datasource: ET.Element) -> Set[str]:
    fields: Set[str] = set()
    for elem in datasource.iter():
        if not isinstance(elem.tag, str):
            continue
        if local_name(elem.tag) != "metadata-record" or elem.attrib.get("class") != "column":
            continue
        local_name_node = None
        for child in list(elem):
            if not isinstance(child.tag, str):
                continue
            if local_name(child.tag) == "local-name":
                local_name_node = (child.text or "").strip()
                break
        normalized = normalize_field_name(local_name_node or "")
        if not normalized:
            continue
        if normalized.startswith("action_"):
            continue
        if normalized in {"f1", "f2", "f3", "f4", "f5"}:
            continue
        fields.add(normalized)
    return fields


def datasource_direct_field_specs(datasource: ET.Element) -> Dict[str, FieldSpec]:
    specs: Dict[str, FieldSpec] = {}
    for child in list(datasource):
        if not isinstance(child.tag, str):
            continue
        if local_name(child.tag) != "column":
            continue
        field_ref = child.attrib.get("name", "")
        if not field_ref.startswith("[") or "__tableau_internal_object_id__" in field_ref:
            continue
        specs[field_ref] = FieldSpec(
            ref=field_ref,
            caption=child.attrib.get("caption", ""),
            datatype=child.attrib.get("datatype", ""),
            role=child.attrib.get("role", ""),
            semantic_role=child.attrib.get("semantic-role", ""),
            is_calculated=False,
        )
    return specs


def datasource_merged_field_specs(datasource: ET.Element) -> Dict[str, FieldSpec]:
    specs = datasource_direct_field_specs(datasource)
    for elem in datasource.iter():
        if not isinstance(elem.tag, str):
            continue
        if local_name(elem.tag) != "metadata-record" or elem.attrib.get("class") != "column":
            continue
        local_name_text = ""
        local_type_text = ""
        for child in list(elem):
            if not isinstance(child.tag, str):
                continue
            tag = local_name(child.tag)
            if tag == "local-name":
                local_name_text = (child.text or "").strip()
            elif tag == "local-type":
                local_type_text = (child.text or "").strip()
        if not local_name_text.startswith("["):
            continue
        if local_name_text in specs:
            continue
        inferred_role = "measure" if field_type_family(local_type_text) == "number" else "dimension"
        specs[local_name_text] = FieldSpec(
            ref=local_name_text,
            caption="",
            datatype=local_type_text or "string",
            role=inferred_role,
            semantic_role="",
            is_calculated=False,
        )
    return specs


def load_project_model(source_dir: Path, project_id: int) -> ProjectModel:
    twb_files = sorted(source_dir.glob("*.twb"))
    if not twb_files:
        raise FileNotFoundError(f"No .twb file found under {source_dir}")
    twb_path = max(twb_files, key=lambda path: (path.stat().st_size, path.name))
    root = ET.parse(twb_path).getroot()

    dashboards_root = find_first_child(root, "dashboards")
    dashboards = iter_children(dashboards_root, "dashboard")
    if len(dashboards) != 1:
        raise ValueError(f"{source_dir.name} is not a single-dashboard workbook")
    dashboard = dashboards[0]
    dashboard_name = dashboard.attrib.get("name", "").strip()
    if not dashboard_name:
        raise ValueError(f"{source_dir.name} dashboard name is empty")

    worksheets_root = find_first_child(root, "worksheets")
    worksheet_map = {
        worksheet.attrib["name"]: worksheet
        for worksheet in iter_children(worksheets_root, "worksheet")
        if worksheet.attrib.get("name")
    }
    if not worksheet_map:
        raise ValueError(f"{source_dir.name} has no worksheets")

    sheet_order, raw_zone_count = extract_dashboard_sheet_order(dashboard, set(worksheet_map))
    dashboard_text_zone_count = extract_dashboard_text_zone_count(dashboard)
    if len(sheet_order) < 2:
        raise ValueError(f"{source_dir.name} has fewer than two dashboard sheet zones")

    windows_root = find_first_child(root, "windows")
    window_map = {
        window.attrib["name"]: window
        for window in iter_children(windows_root, None)
        if window.attrib.get("name")
    }

    datasources_root = find_first_child(root, "datasources")
    data_files = sorted((source_dir / "data").glob("*.csv"))
    datasource_elements: Dict[str, ET.Element] = {}
    datasource_infos: Dict[str, DatasourceInfo] = {}
    datasource_field_specs: Dict[str, Dict[str, FieldSpec]] = {}
    for datasource in iter_children(datasources_root, "datasource"):
        name = datasource.attrib.get("name", "")
        caption = datasource.attrib.get("caption", "")
        if not name:
            continue

        relation_pairs = []
        for relation in find_relation_elements(datasource):
            table = relation.attrib.get("table", "")
            if table == "[Extract].[Extract]":
                continue
            relation_pairs.append((relation.attrib.get("name", ""), table))
        unique_pairs = tuple(sorted(set(relation_pairs)))
        is_parameter = name == "Parameters" or caption == "Parameters"
        source_csv = None if is_parameter else resolve_datasource_csv(unique_pairs, caption, data_files)

        datasource_elements[name] = datasource
        datasource_field_specs[name] = datasource_merged_field_specs(datasource)
        datasource_infos[name] = DatasourceInfo(
            original_name=name,
            caption=caption,
            relation_pairs=unique_pairs,
            source_csv=source_csv,
            is_parameter=is_parameter,
        )

    worksheet_datasources = {
        name: extract_worksheet_datasources(worksheet)
        for name, worksheet in worksheet_map.items()
    }
    chart_types = {
        name: chart_type_for_worksheet(worksheet)
        for name, worksheet in worksheet_map.items()
    }
    worksheet_has_action = {
        name: worksheet_has_action_dependencies(worksheet)
        for name, worksheet in worksheet_map.items()
    }
    schema_signature: Set[str] = set()
    for datasource in datasource_elements.values():
        schema_signature.update(datasource_schema_signature(datasource))
    actions_root = find_first_child(root, "actions")
    action_elements = iter_children(actions_root, "action")

    return ProjectModel(
        project_id=project_id,
        source_dir=source_dir,
        twb_path=twb_path,
        root=root,
        workbook_attrs=dict(root.attrib),
        dashboard_name=dashboard_name,
        dashboard_sheet_order=sheet_order,
        dashboard_zone_count=raw_zone_count,
        dashboard_text_zone_count=dashboard_text_zone_count,
        worksheet_map=worksheet_map,
        window_map=window_map,
        action_elements=action_elements,
        datasource_elements=datasource_elements,
        datasource_infos=datasource_infos,
        datasource_field_specs=datasource_field_specs,
        worksheet_datasources=worksheet_datasources,
        chart_types=chart_types,
        worksheet_has_action=worksheet_has_action,
        schema_signature=schema_signature,
        data_files=data_files,
    )


def project_is_layout_candidate(project: ProjectModel) -> bool:
    return len(project.dashboard_sheet_order) == project.dashboard_zone_count and project.dashboard_zone_count >= 2


def project_has_modern_dashboard_schema(project: ProjectModel) -> bool:
    dashboards_root = find_first_child(project.root, "dashboards")
    dashboards = iter_children(dashboards_root, "dashboard")
    if len(dashboards) != 1:
        return False
    dashboard = dashboards[0]
    child_tags = {local_name(child.tag) for child in list(dashboard) if isinstance(child.tag, str)}
    required_tags = {"style", "zones", "devicelayouts", "simple-id"}
    return required_tags.issubset(child_tags)


def schema_similarity(left: ProjectModel, right: ProjectModel) -> float:
    left_fields = left.schema_signature
    right_fields = right.schema_signature
    if not left_fields or not right_fields:
        return 0.0
    intersection = len(left_fields & right_fields)
    union = len(left_fields | right_fields)
    if union == 0:
        return 0.0
    return intersection / union


def field_type_family(datatype: str) -> str:
    value = str(datatype or "").lower()
    if value in {"date", "datetime"}:
        return "date"
    if value in {"integer", "real", "float", "double", "number"}:
        return "number"
    return "string"


def worksheet_is_auto_remappable(project: ProjectModel, worksheet_name: str) -> bool:
    worksheet = project.worksheet_map.get(worksheet_name)
    if worksheet is None:
        return False
    if project.worksheet_has_action.get(worksheet_name):
        return False
    datasource_names = [
        name
        for name in project.worksheet_datasources.get(worksheet_name, set())
        if not project.datasource_infos.get(name, DatasourceInfo("", "", tuple(), None, False)).is_parameter
    ]
    if len(datasource_names) != 1:
        return False

    for elem in worksheet.iter():
        if not isinstance(elem.tag, str):
            continue
        tag = local_name(elem.tag)
        if tag == "map" or tag == "mapsources":
            return False
    return True


def worksheet_source_field_specs(project: ProjectModel, worksheet_name: str) -> Dict[str, FieldSpec]:
    worksheet = project.worksheet_map[worksheet_name]
    specs: Dict[str, FieldSpec] = {}
    for dep in worksheet.findall(".//datasource-dependencies"):
        for child in list(dep):
            if not isinstance(child.tag, str):
                continue
            tag = local_name(child.tag)
            if tag == "column":
                field_ref = child.attrib.get("name", "")
                if field_ref.startswith("["):
                    has_calculation = any(
                        isinstance(grandchild.tag, str) and local_name(grandchild.tag) == "calculation"
                        for grandchild in list(child)
                    )
                    specs[field_ref] = FieldSpec(
                        ref=field_ref,
                        caption=child.attrib.get("caption", ""),
                        datatype=child.attrib.get("datatype", ""),
                        role=child.attrib.get("role", ""),
                        semantic_role=child.attrib.get("semantic-role", ""),
                        is_calculated=has_calculation,
                    )
            elif tag == "column-instance":
                field_ref = child.attrib.get("column", "")
                if field_ref.startswith("[") and field_ref not in specs:
                    instance_type = child.attrib.get("type", "")
                    inferred_role = "measure" if instance_type == "quantitative" else "dimension"
                    inferred_datatype = "real" if instance_type == "quantitative" else "string"
                    specs[field_ref] = FieldSpec(
                        ref=field_ref,
                        caption="",
                        datatype=inferred_datatype,
                        role=inferred_role,
                        semantic_role="",
                        is_calculated=False,
                    )
    return specs


def primary_real_datasource_name(project: ProjectModel) -> Optional[str]:
    for name, info in project.datasource_infos.items():
        if info.is_parameter:
            continue
        if info.source_csv is not None:
            return name
    return None


def field_semantic_score(source: FieldSpec, target: FieldSpec) -> int:
    score = 0
    if source.role == target.role:
        score += 30
    if field_type_family(source.datatype) == field_type_family(target.datatype):
        score += 30
    if source.semantic_role and source.semantic_role == target.semantic_role:
        score += 20
    source_name = normalize_field_name(source.caption or source.ref)
    target_name = normalize_field_name(target.caption or target.ref)
    if source_name == target_name:
        score += 100
    else:
        source_tokens = set(source_name.split("_"))
        target_tokens = set(target_name.split("_"))
        score += len(source_tokens & target_tokens) * 5
    if source.is_calculated and "calculation" in normalize_field_name(source.ref):
        if "product" in source_name and "product" in target_name:
            score += 25
        if "customer" in source_name and "customer" in target_name:
            score += 25
        if "sub_category" in source_name and "sub_category" in target_name:
            score += 10
    return score


def choose_target_field(
    source_spec: FieldSpec,
    target_specs: Dict[str, FieldSpec],
    used_target_refs: Set[str],
) -> Optional[str]:
    if source_spec.ref in target_specs:
        return source_spec.ref

    ranked = sorted(
        (
            (field_semantic_score(source_spec, target_spec), target_ref)
            for target_ref, target_spec in target_specs.items()
            if target_ref not in used_target_refs
        ),
        key=lambda item: (item[0], item[1]),
        reverse=True,
    )
    if not ranked or ranked[0][0] <= 0:
        return None
    return ranked[0][1]


def source_field_key(field_spec: FieldSpec) -> str:
    return "::".join(
        [
            normalize_field_name(field_spec.ref),
            field_spec.role or "",
            field_type_family(field_spec.datatype),
        ]
    )


def build_consistent_field_map(
    source_specs: Dict[str, FieldSpec],
    target_specs: Dict[str, FieldSpec],
    global_map: Dict[str, str],
) -> Optional[Dict[str, str]]:
    field_map: Dict[str, str] = {}
    used_target_refs: Set[str] = set()
    for field_ref, field_spec in sorted(source_specs.items()):
        key = source_field_key(field_spec)
        target_ref = global_map.get(key)
        if target_ref is not None and target_ref in target_specs and target_ref not in used_target_refs:
            field_map[field_ref] = target_ref
            used_target_refs.add(target_ref)
            continue
        target_ref = choose_target_field(field_spec, target_specs, used_target_refs)
        if target_ref is None:
            return None
        global_map[key] = target_ref
        field_map[field_ref] = target_ref
        used_target_refs.add(target_ref)
    return field_map


def project_can_supply_dashboard_views(project: ProjectModel) -> bool:
    has_safe_dashboard_sheet = False
    for worksheet_name in project.dashboard_sheet_order:
        if project.worksheet_has_action.get(worksheet_name):
            continue
        has_safe_dashboard_sheet = True
        datasource_names = project.worksheet_datasources.get(worksheet_name, set())
        if not datasource_names:
            return False
        for datasource_name in datasource_names:
            info = project.datasource_infos.get(datasource_name)
            if info is None:
                return False
            if info.is_parameter:
                continue
            if len(info.relation_pairs) != 1:
                return False
            if info.source_csv is None:
                return False
    return has_safe_dashboard_sheet


def make_unique_worksheet_name(base_name: str, used_names: Set[str]) -> str:
    if base_name not in used_names:
        used_names.add(base_name)
        return base_name
    suffix = 2
    while True:
        candidate = f"{base_name}_{suffix}"
        if candidate not in used_names:
            used_names.add(candidate)
            return candidate
        suffix += 1


def choose_sheet_name(
    donor: ProjectModel,
    source_name: str,
    used_names: Set[str],
) -> str:
    prefix = f"P{donor.project_id}"
    base = f"{prefix}__{sanitize_slug(source_name)}"
    return make_unique_worksheet_name(base, used_names)


BRACKET_TOKEN_RE = re.compile(r"\[[^\]]+\]")


def rewrite_field_token(token: str, field_map: Dict[str, str]) -> str:
    if token in field_map:
        return field_map[token]

    inner = token[1:-1]
    for source_ref, target_ref in field_map.items():
        source_inner = source_ref[1:-1]
        target_inner = target_ref[1:-1]
        if f":{source_inner}:" in inner:
            return "[" + inner.replace(f":{source_inner}:", f":{target_inner}:") + "]"
    return token


def rewrite_node_field_tokens(node: ET.Element, field_map: Dict[str, str]) -> None:
    def rewrite_text(value: str) -> str:
        return BRACKET_TOKEN_RE.sub(lambda match: rewrite_field_token(match.group(0), field_map), value)

    if node.text:
        node.text = rewrite_text(node.text)
    if node.tail:
        node.tail = rewrite_text(node.tail)
    for key, value in list(node.attrib.items()):
        node.attrib[key] = rewrite_text(value)
    for child in list(node):
        rewrite_node_field_tokens(child, field_map)


def prune_view_filters_and_slices(worksheet: ET.Element) -> None:
    table = find_first_child(worksheet, "table")
    view = find_first_child(table, "view")
    if view is None:
        return
    for child in list(view):
        if not isinstance(child.tag, str):
            continue
        if local_name(child.tag) in {"filter", "slices"}:
            view.remove(child)


def select_synthesis_plan(
    index: int,
    projects: Sequence[ProjectModel],
    layout_candidates: Sequence[ProjectModel],
    rng: random.Random,
    min_source_projects: int,
    max_source_projects: int,
    min_schema_similarity: float,
) -> Optional[SynthesisPlan]:
    if not layout_candidates or not projects:
        return None

    for _ in range(200):
        layout_project = rng.choice(list(layout_candidates))
        slot_count = len(layout_project.dashboard_sheet_order)
        if slot_count < 2:
            continue

        donor_pool = [
            project
            for project in projects
            if schema_similarity(layout_project, project) >= min_schema_similarity
        ]
        rng.shuffle(donor_pool)
        donor_floor = min(min_source_projects, len(donor_pool))
        donor_ceiling = min(max_source_projects, len(donor_pool), slot_count)
        if slot_count > min_source_projects:
            donor_ceiling = min(donor_ceiling, slot_count - 1)
        donor_ceiling = max(donor_floor, donor_ceiling)
        donor_target = rng.randint(donor_floor, donor_ceiling)

        donors: List[ProjectModel] = []
        for donor in donor_pool:
            if donor not in donors:
                donors.append(donor)
            if len(donors) >= donor_target:
                break
        if len(donors) < min_source_projects:
            continue

        selections: List[Tuple[ProjectModel, str]] = []
        donor_usage: Dict[int, int] = {donor.project_id: 0 for donor in donors}
        used_source_pairs: Set[Tuple[int, str]] = set()
        used_chart_types: Set[str] = set()

        def pick_for_donor(donor: ProjectModel) -> Optional[str]:
            choices = [
                name
                for name in donor.dashboard_sheet_order
                if (donor.project_id, name) not in used_source_pairs
                and not donor.worksheet_has_action.get(name, False)
            ]
            if not choices:
                return None

            preferred = [
                name
                for name in choices
                if donor.chart_types.get(name, "unknown") not in used_chart_types
            ]
            pool = preferred or choices
            return rng.choice(pool)

        for donor in donors:
            choice = pick_for_donor(donor)
            if choice is None:
                break
            selections.append((donor, choice))
            donor_usage[donor.project_id] += 1
            used_source_pairs.add((donor.project_id, choice))
            used_chart_types.add(donor.chart_types.get(choice, "unknown"))

        if len(selections) < min_source_projects:
            continue

        while len(selections) < slot_count:
            ranked_donors = sorted(
                donors,
                key=lambda donor: (donor_usage[donor.project_id], donor.project_id),
            )
            chosen = False
            for donor in ranked_donors:
                choice = pick_for_donor(donor)
                if choice is None:
                    continue
                selections.append((donor, choice))
                donor_usage[donor.project_id] += 1
                used_source_pairs.add((donor.project_id, choice))
                used_chart_types.add(donor.chart_types.get(choice, "unknown"))
                chosen = True
                break
            if not chosen:
                break

        if len(selections) != slot_count:
            continue
        if len({donor.project_id for donor, _ in selections}) < min_source_projects:
            continue

        folder_name = build_folder_name(index, layout_project, selections)
        workbook_name = folder_name
        dashboard_name = f"Synthetic Dashboard {index:03d}"
        used_names: Set[str] = set()
        selected_worksheets: List[SelectedWorksheet] = []
        for donor, source_name in selections:
            new_name = choose_sheet_name(donor, source_name, used_names)
            selected_worksheets.append(
                SelectedWorksheet(
                    donor=donor,
                    source_name=source_name,
                    new_name=new_name,
                    display_title=normalize_display_title(source_name),
                    chart_type=donor.chart_types.get(source_name, "unknown"),
                    datasource_names=tuple(sorted(donor.worksheet_datasources.get(source_name, set()))),
                )
            )

        return SynthesisPlan(
            index=index,
            folder_name=folder_name,
            workbook_name=workbook_name,
            dashboard_name=dashboard_name,
            layout_project=layout_project,
            selected_worksheets=tuple(selected_worksheets),
        )
    return None


def build_folder_name(
    index: int,
    layout_project: ProjectModel,
    selections: Sequence[Tuple[ProjectModel, str]],
) -> str:
    source_ids = []
    for donor, _ in selections:
        if donor.project_id not in source_ids:
            source_ids.append(donor.project_id)
    source_token = "-".join(str(item) for item in source_ids)
    return f"syn_{index:03d}_l{layout_project.project_id}_s{source_token}"


def build_curated_plans(
    *,
    index_start: int,
    count: int,
    projects_by_id: Dict[int, ProjectModel],
) -> List[SynthesisPlan]:
    plans: List[SynthesisPlan] = []
    used_names: Set[str] = set()
    for profile in CURATED_SYNTHESIS_PROFILES:
        layout_project = projects_by_id.get(profile["layout_project_id"])
        if layout_project is None:
            continue

        selections: List[SelectedWorksheet] = []
        local_used: Set[str] = set()
        valid = True
        for project_id, worksheet_name in profile["views"]:
            donor = projects_by_id.get(project_id)
            if donor is None:
                valid = False
                break
            if worksheet_name not in donor.worksheet_map:
                valid = False
                break
            if donor.worksheet_has_action.get(worksheet_name):
                valid = False
                break
            new_name = choose_sheet_name(donor, worksheet_name, local_used)
            selections.append(
                SelectedWorksheet(
                    donor=donor,
                    source_name=worksheet_name,
                    new_name=new_name,
                    display_title=normalize_display_title(worksheet_name),
                    chart_type=donor.chart_types.get(worksheet_name, "unknown"),
                    datasource_names=tuple(sorted(donor.worksheet_datasources.get(worksheet_name, set()))),
                )
            )
        if not valid:
            continue

        index = index_start + len(plans)
        folder_name = f"syn_{index:03d}_{profile['name']}"
        if folder_name in used_names:
            continue
        used_names.add(folder_name)
        plans.append(
            SynthesisPlan(
                index=index,
                folder_name=folder_name,
                workbook_name=folder_name,
                dashboard_name=f"Synthetic Dashboard {index:03d}",
                layout_project=layout_project,
                selected_worksheets=tuple(selections),
            )
        )
        if len(plans) >= count:
            break
    return plans


def cluster_projects_by_schema(
    projects: Sequence[ProjectModel],
    *,
    threshold: float,
) -> List[List[ProjectModel]]:
    eligible = [project for project in projects if project.schema_signature]
    if not eligible:
        return []

    index_by_id = {project.project_id: idx for idx, project in enumerate(eligible)}
    adjacency: Dict[int, Set[int]] = {project.project_id: set() for project in eligible}
    for idx, left in enumerate(eligible):
        for right in eligible[idx + 1:]:
            if schema_similarity(left, right) >= threshold:
                adjacency[left.project_id].add(right.project_id)
                adjacency[right.project_id].add(left.project_id)

    visited: Set[int] = set()
    clusters: List[List[ProjectModel]] = []
    for project in eligible:
        if project.project_id in visited:
            continue
        queue = [project.project_id]
        component_ids: List[int] = []
        while queue:
            current = queue.pop()
            if current in visited:
                continue
            visited.add(current)
            component_ids.append(current)
            queue.extend(sorted(adjacency[current] - visited))
        component = sorted(
            (eligible[index_by_id[project_id]] for project_id in component_ids),
            key=lambda item: item.project_id,
        )
        clusters.append(component)

    clusters.sort(
        key=lambda cluster: (
            -len(cluster),
            min(project.project_id for project in cluster),
        )
    )
    return clusters


def auto_cluster_layout_candidates(cluster: Sequence[ProjectModel]) -> List[ProjectModel]:
    candidates = [
        project
        for project in cluster
        if project_is_layout_candidate(project)
        and parse_version_tuple(project.workbook_attrs.get("version", "0")) >= (18, 1)
        and project_has_modern_dashboard_schema(project)
        and project.dashboard_text_zone_count == 0
    ]
    candidates.sort(
        key=lambda project: (
            project.dashboard_zone_count,
            project.dashboard_text_zone_count,
            project.project_id,
        )
    )
    return candidates


def stable_layout_templates(projects: Sequence[ProjectModel]) -> Dict[int, List[ProjectModel]]:
    by_id = {project.project_id: project for project in projects}
    templates: Dict[int, List[ProjectModel]] = {}
    for slot_count, project_ids in LAYOUT_TEMPLATE_PROJECT_IDS.items():
        chosen: List[ProjectModel] = []
        for project_id in project_ids:
            project = by_id.get(project_id)
            if project is None:
                continue
            if not project_is_layout_candidate(project):
                continue
            if parse_version_tuple(project.workbook_attrs.get("version", "0")) < (18, 1):
                continue
            if not project_has_modern_dashboard_schema(project):
                continue
            if project.dashboard_zone_count != slot_count:
                continue
            chosen.append(project)
        if chosen:
            templates[slot_count] = chosen
    return templates


def plan_signature(plan: SynthesisPlan) -> Tuple[int, Tuple[Tuple[int, str], ...]]:
    selections = tuple(
        (selection.donor.project_id, selection.source_name)
        for selection in plan.selected_worksheets
    )
    target_project_id = plan.target_data_project.project_id if plan.target_data_project else -1
    return (plan.layout_project.project_id * 100000 + target_project_id, selections)


def build_auto_cluster_plans(
    *,
    index_start: int,
    count: int,
    projects: Sequence[ProjectModel],
    min_source_projects: int,
    max_source_projects: int,
    min_schema_similarity: float,
    rng: random.Random,
) -> List[SynthesisPlan]:
    clusters = cluster_projects_by_schema(projects, threshold=min_schema_similarity)
    if not clusters:
        return []

    plans: List[SynthesisPlan] = []
    used_signatures: Set[Tuple[int, Tuple[Tuple[int, str], ...]]] = set()
    cluster_entries = []
    for cluster in clusters:
        layouts = auto_cluster_layout_candidates(cluster)
        if not layouts:
            continue
        cluster_entries.append((cluster, layouts))

    if not cluster_entries:
        return []

    attempts = 0
    max_attempts = max(50, count * 40)
    while len(plans) < count and attempts < max_attempts:
        progress = False
        for cluster, layouts in cluster_entries:
            if len(plans) >= count:
                break
            attempts += 1
            plan = select_synthesis_plan(
                index=index_start + len(plans),
                projects=cluster,
                layout_candidates=layouts,
                rng=rng,
                min_source_projects=min_source_projects,
                max_source_projects=max_source_projects,
                min_schema_similarity=min_schema_similarity,
            )
            if plan is None:
                continue
            signature = plan_signature(plan)
            if signature in used_signatures:
                continue
            used_signatures.add(signature)
            plans.append(plan)
            progress = True
        if not progress:
            break
    return plans


def build_auto_remap_plans(
    *,
    index_start: int,
    count: int,
    projects: Sequence[ProjectModel],
    min_source_projects: int,
    max_source_projects: int,
    min_schema_similarity: float,
    rng: random.Random,
) -> List[SynthesisPlan]:
    clusters = cluster_projects_by_schema(projects, threshold=min_schema_similarity)
    layout_templates = stable_layout_templates(projects)
    plans: List[SynthesisPlan] = []
    used_signatures: Set[Tuple[int, Tuple[Tuple[int, str], ...]]] = set()

    for cluster in clusters:
        if len(plans) >= count:
            break

        target_candidates = [
            project
            for project in cluster
            if primary_real_datasource_name(project) is not None
        ]
        if not target_candidates:
            continue

        candidate_sheets: List[Tuple[ProjectModel, str]] = []
        for donor in cluster:
            for worksheet_name in donor.dashboard_sheet_order:
                if not worksheet_is_auto_remappable(donor, worksheet_name):
                    continue
                candidate_sheets.append((donor, worksheet_name))
        if len(candidate_sheets) < 2:
            continue

        target_candidates = sorted(
            target_candidates,
            key=lambda project: (len(project.schema_signature), project.project_id),
            reverse=True,
        )

        max_slots = min(4, len(candidate_sheets))
        slot_options = [slot for slot in sorted(layout_templates) if 2 <= slot <= max_slots]
        if not slot_options:
            continue

        template_variants: List[Tuple[int, ProjectModel]] = []
        for slot_count in slot_options:
            for layout_project in layout_templates.get(slot_count, []):
                template_variants.append((slot_count, layout_project))

        progress = True
        while len(plans) < count and progress:
            progress = False
            for slot_count, layout_project in template_variants:
                if len(plans) >= count:
                    break
                for target_project in target_candidates[: min(5, len(target_candidates))]:
                    if len(plans) >= count:
                        break

                    target_datasource_name = primary_real_datasource_name(target_project)
                    if target_datasource_name is None:
                        continue
                    target_specs = target_project.datasource_field_specs.get(target_datasource_name, {})
                    if not target_specs:
                        continue

                    used_names: Set[str] = set()
                    global_field_map: Dict[str, str] = {}
                    worksheet_field_maps: Dict[Tuple[int, str], Dict[str, str]] = {}
                    selected: List[SelectedWorksheet] = []
                    chart_type_usage: Dict[str, int] = {}

                    candidate_scores: List[Tuple[float, ProjectModel, str]] = []
                    for donor, worksheet_name in candidate_sheets:
                        score = schema_similarity(donor, target_project)
                        if donor.project_id == target_project.project_id:
                            score += 0.35
                        if donor.project_id == layout_project.project_id:
                            score += 0.20
                        chart_type = donor.chart_types.get(worksheet_name, "unknown")
                        if chart_type in {"Bar", "Pie", "Circle", "Automatic"}:
                            score += 0.05
                        candidate_scores.append((score, donor, worksheet_name))
                    rng.shuffle(candidate_scores)
                    candidate_scores.sort(
                        key=lambda item: (item[0], item[1].project_id, item[2]),
                        reverse=True,
                    )

                    while len(selected) < slot_count:
                        valid_options: List[Tuple[float, ProjectModel, str, Dict[str, str]]] = []
                        for score, donor, worksheet_name in candidate_scores:
                            if any(
                                existing.donor.project_id == donor.project_id and existing.source_name == worksheet_name
                                for existing in selected
                            ):
                                continue

                            chart_type = donor.chart_types.get(worksheet_name, "unknown")
                            if chart_type_usage.get(chart_type, 0) >= 2:
                                continue

                            source_specs = worksheet_source_field_specs(donor, worksheet_name)
                            if not source_specs:
                                continue

                            tentative_global_map = dict(global_field_map)
                            field_map = build_consistent_field_map(source_specs, target_specs, tentative_global_map)
                            if field_map is None:
                                continue
                            valid_options.append((score, donor, worksheet_name, field_map))

                        if not valid_options:
                            break

                        valid_options.sort(key=lambda item: item[0], reverse=True)
                        chosen_score, donor, worksheet_name, field_map = rng.choice(
                            valid_options[: min(6, len(valid_options))]
                        )
                        global_field_map = dict(global_field_map)
                        build_consistent_field_map(
                            worksheet_source_field_specs(donor, worksheet_name),
                            target_specs,
                            global_field_map,
                        )
                        chart_type = donor.chart_types.get(worksheet_name, "unknown")
                        selected.append(
                            SelectedWorksheet(
                                donor=donor,
                                source_name=worksheet_name,
                                new_name=choose_sheet_name(donor, worksheet_name, used_names),
                                display_title=normalize_display_title(worksheet_name),
                                chart_type=chart_type,
                                datasource_names=(target_datasource_name,),
                            )
                        )
                        worksheet_field_maps[(donor.project_id, worksheet_name)] = field_map
                        chart_type_usage[chart_type] = chart_type_usage.get(chart_type, 0) + 1

                    if len(selected) < slot_count:
                        for worksheet_name in layout_project.dashboard_sheet_order:
                            if len(selected) >= slot_count:
                                break
                            if not worksheet_is_auto_remappable(layout_project, worksheet_name):
                                continue
                            if any(
                                existing.donor.project_id == layout_project.project_id and existing.source_name == worksheet_name
                                for existing in selected
                            ):
                                continue
                            chart_type = layout_project.chart_types.get(worksheet_name, "unknown")
                            source_specs = worksheet_source_field_specs(layout_project, worksheet_name)
                            if not source_specs:
                                continue
                            tentative_global_map = dict(global_field_map)
                            field_map = build_consistent_field_map(source_specs, target_specs, tentative_global_map)
                            if field_map is None:
                                continue
                            global_field_map = tentative_global_map
                            selected.append(
                                SelectedWorksheet(
                                    donor=layout_project,
                                    source_name=worksheet_name,
                                    new_name=choose_sheet_name(layout_project, worksheet_name, used_names),
                                    display_title=normalize_display_title(worksheet_name),
                                    chart_type=chart_type,
                                    datasource_names=(target_datasource_name,),
                                )
                            )
                            worksheet_field_maps[(layout_project.project_id, worksheet_name)] = field_map
                            chart_type_usage[chart_type] = chart_type_usage.get(chart_type, 0) + 1

                    if len(selected) < slot_count:
                        continue
                    donor_count = len({selection.donor.project_id for selection in selected})
                    if donor_count < min_source_projects:
                        continue
                    if donor_count > max_source_projects:
                        continue

                    folder_name = build_folder_name(
                        index_start + len(plans),
                        layout_project,
                        [(selection.donor, selection.source_name) for selection in selected],
                    )
                    plan = SynthesisPlan(
                        index=index_start + len(plans),
                        folder_name=folder_name,
                        workbook_name=folder_name,
                        dashboard_name=f"Synthetic Dashboard {index_start + len(plans):03d}",
                        layout_project=layout_project,
                        selected_worksheets=tuple(selected),
                        target_data_project=target_project,
                        worksheet_field_maps=worksheet_field_maps,
                        strategy="auto-remap",
                    )
                    signature = plan_signature(plan)
                    if signature in used_signatures:
                        continue
                    used_signatures.add(signature)
                    plans.append(plan)
                    progress = True
                    break

    return plans


def build_generic_worksheet_window(worksheet_name: str) -> ET.Element:
    window = ET.Element("window", {"class": "worksheet", "name": worksheet_name})
    cards = ET.SubElement(window, "cards")
    left = ET.SubElement(cards, "edge", {"name": "left"})
    left_strip = ET.SubElement(left, "strip", {"size": "160"})
    ET.SubElement(left_strip, "card", {"type": "pages"})
    ET.SubElement(left_strip, "card", {"type": "filters"})
    ET.SubElement(left_strip, "card", {"type": "marks"})
    top = ET.SubElement(cards, "edge", {"name": "top"})
    top_strip = ET.SubElement(top, "strip", {"size": "2147483647"})
    ET.SubElement(top_strip, "card", {"type": "columns"})
    top_strip_2 = ET.SubElement(top, "strip", {"size": "2147483647"})
    ET.SubElement(top_strip_2, "card", {"type": "rows"})
    top_strip_3 = ET.SubElement(top, "strip", {"size": "31"})
    ET.SubElement(top_strip_3, "card", {"type": "title"})
    ensure_dashboard_window_has_simple_id(window)
    return window


def rewrite_worksheet_for_auto_remap(
    worksheet: ET.Element,
    *,
    source_datasource_names: Sequence[str],
    target_datasource_name: str,
    field_map: Dict[str, str],
    target_specs: Dict[str, FieldSpec],
    display_title: str,
) -> ET.Element:
    cloned = copy.deepcopy(worksheet)
    datasource_name_map = {name: target_datasource_name for name in source_datasource_names}
    replace_textual_content(cloned, datasource_name_map)
    rewrite_node_field_tokens(cloned, field_map)
    normalize_remapped_calculated_columns(cloned, target_specs)
    prune_unresolved_action_filters(cloned, set())
    prune_incompatible_view_nodes(cloned)
    prune_view_filters_and_slices(cloned)
    ensure_worksheet_title(cloned, display_title)
    ensure_worksheet_has_simple_id(cloned)
    return cloned


def dedupe_datasource_dependencies(worksheet: ET.Element) -> None:
    for deps in worksheet.findall(".//datasource-dependencies"):
        seen: Set[Tuple[str, str]] = set()
        for child in list(deps):
            if not isinstance(child.tag, str):
                continue
            tag = local_name(child.tag)
            key_name = child.attrib.get("name") or child.attrib.get("column") or ""
            key = (tag, key_name)
            if key in seen:
                deps.remove(child)
                continue
            seen.add(key)


def normalize_remapped_calculated_columns(
    worksheet: ET.Element,
    target_specs: Dict[str, FieldSpec],
) -> None:
    for deps in worksheet.findall(".//datasource-dependencies"):
        for child in list(deps):
            if not isinstance(child.tag, str):
                continue
            if local_name(child.tag) != "column":
                continue
            field_ref = child.attrib.get("name", "")
            if field_ref not in target_specs:
                continue
            has_calculation = any(
                isinstance(grandchild.tag, str) and local_name(grandchild.tag) == "calculation"
                for grandchild in list(child)
            )
            if not has_calculation:
                continue

            # Once a calculated field has been remapped onto an existing target field,
            # keep the target field definition only and drop the donor-side duplicate.
            deps.remove(child)
            continue

            for grandchild in list(child):
                if isinstance(grandchild.tag, str) and local_name(grandchild.tag) == "calculation":
                    child.remove(grandchild)

            target_spec = target_specs[field_ref]
            child.attrib["datatype"] = target_spec.datatype or child.attrib.get("datatype", "")
            child.attrib["role"] = target_spec.role or child.attrib.get("role", "")
            if target_spec.semantic_role:
                child.attrib["semantic-role"] = target_spec.semantic_role
            else:
                child.attrib.pop("semantic-role", None)
            if target_spec.caption:
                child.attrib["caption"] = target_spec.caption


def merge_donor_support_nodes_into_target_datasource(
    *,
    target_datasource: ET.Element,
    target_datasource_name: str,
    target_specs: Dict[str, FieldSpec],
    donor_datasource: ET.Element,
    donor_datasource_name: str,
    field_map: Dict[str, str],
) -> None:
    allowed_prefix_tags = {
        "repository-location",
        "connection",
        "utility-dimensions",
        "dimension",
        "overridable-settings",
        "aliases",
    }

    def insert_child_in_schema_order(parent: ET.Element, child: ET.Element, child_tag: str) -> None:
        ordered_tags_for_child = set(allowed_prefix_tags)
        if child_tag == "column":
            ordered_tags_for_child.update({"column"})
        elif child_tag == "column-instance":
            ordered_tags_for_child.update({"column", "column-instance"})
        elif child_tag == "group":
            ordered_tags_for_child.update({"column", "column-instance", "group"})
        else:
            parent.append(child)
            return

        insert_at = len(list(parent))
        for idx, existing in enumerate(list(parent)):
            if not isinstance(existing.tag, str):
                continue
            existing_tag = canonical_tag_name(existing.tag)
            if existing_tag not in ordered_tags_for_child:
                insert_at = idx
                break
        parent.insert(insert_at, child)

    existing_keys: Set[Tuple[str, str]] = set()
    for child in list(target_datasource):
        if not isinstance(child.tag, str):
            continue
        existing_keys.add((canonical_tag_name(child.tag), child.attrib.get("name", "")))

    for child in list(donor_datasource):
        if not isinstance(child.tag, str):
            continue
        tag = canonical_tag_name(child.tag)
        if tag not in {"column", "column-instance"}:
            continue
        cloned = copy.deepcopy(child)
        replace_textual_content(cloned, {donor_datasource_name: target_datasource_name})
        rewrite_node_field_tokens(cloned, field_map)
        if tag == "column":
            has_calculation = any(
                isinstance(grandchild.tag, str) and local_name(grandchild.tag) == "calculation"
                for grandchild in list(cloned)
            )
            rewritten_name = cloned.attrib.get("name", "")
            if has_calculation and rewritten_name in target_specs:
                continue
            if has_calculation:
                continue
        key = (tag, cloned.attrib.get("name", ""))
        if key in existing_keys:
            continue
        insert_child_in_schema_order(target_datasource, cloned, tag)
        existing_keys.add(key)


def set_named_connections(
    datasource: ET.Element,
    *,
    connection_class: str,
    package_directory: str,
    filename: str,
) -> None:
    connection = find_first_child(datasource, "connection")
    if connection is None:
        connection = ET.SubElement(datasource, "connection", {"class": "federated"})
    connection.attrib["class"] = "federated"

    named_connections = find_first_child(connection, "named-connections")
    if named_connections is None:
        named_connections = ET.Element("named-connections")
        connection.insert(0, named_connections)
    else:
        for child in list(named_connections):
            named_connections.remove(child)

    connection_prefix = "excel-direct.synthetic" if connection_class == "excel-direct" else "textscan.synthetic"
    named_connection_name = f"{connection_prefix}.{uuid.uuid4().hex[:24]}"
    named_connection = ET.SubElement(
        named_connections,
        "named-connection",
        {
            "caption": filename,
            "name": named_connection_name,
        },
    )
    ET.SubElement(
        named_connection,
        "connection",
        {
            "class": connection_class,
            "filename": f"{package_directory}/{filename}" if connection_class == "excel-direct" else filename,
            "directory": package_directory if connection_class == "textscan" else "",
            "server": "",
            "workgroup-auth-mode": "as-is",
        },
    )
    if connection_class == "excel-direct":
        nested = list(named_connection)[0]
        nested.attrib.pop("directory", None)
        nested.attrib["cleaning"] = "no"
        nested.attrib["compat"] = "no"
        nested.attrib["dataRefreshTime"] = ""
        nested.attrib["interpretationMode"] = "0"
        nested.attrib["validate"] = "no"

    for relation in find_relation_elements(datasource):
        if relation.attrib.get("table") == "[Extract].[Extract]":
            continue
        if "connection" in relation.attrib:
            relation.attrib["connection"] = named_connection_name


def datasource_primary_named_connection_class(datasource: ET.Element) -> str:
    for elem in datasource.iter():
        if not isinstance(elem.tag, str):
            continue
        if local_name(elem.tag) != "connection":
            continue
        connection_class = elem.attrib.get("class", "")
        if connection_class and connection_class != "federated" and connection_class != "hyper":
            return connection_class
    return ""


def datasource_uses_excel_relation(datasource: ET.Element) -> bool:
    if datasource_primary_named_connection_class(datasource) == "excel-direct":
        return True
    for relation in find_relation_elements(datasource):
        table = relation.attrib.get("table", "")
        if table and table.endswith("$]"):
            return True
    return False


def normalize_excel_semantics_for_textscan(datasource: ET.Element, filename: str) -> None:
    non_extract_relations = [
        relation
        for relation in find_relation_elements(datasource)
        if relation.attrib.get("table") != "[Extract].[Extract]"
    ]
    if not non_extract_relations:
        return

    new_relation_name = filename
    new_parent_name = f"[{filename}]"
    new_table = f"[{Path(filename).stem}#csv]"

    old_relation_names = {
        relation.attrib.get("name", "")
        for relation in non_extract_relations
        if relation.attrib.get("name")
    }

    for relation in non_extract_relations:
        relation.attrib["name"] = new_relation_name
        relation.attrib["table"] = new_table
        columns = find_first_child(relation, "columns")
        if columns is not None:
            grid_origin = columns.attrib.pop("gridOrigin", None)
            outcome = columns.attrib.pop("outcome", None)
            if grid_origin is not None or outcome is not None:
                columns.attrib["character-set"] = columns.attrib.get("character-set", "UTF-8")
                columns.attrib["header"] = columns.attrib.get("header", "yes")
                columns.attrib["locale"] = columns.attrib.get("locale", "en_US")
                columns.attrib["separator"] = columns.attrib.get("separator", ",")

    for elem in datasource.iter():
        if not isinstance(elem.tag, str):
            continue

        if local_name(elem.tag) == "parent-name" and (elem.text or "") in {f"[{name}]" for name in old_relation_names}:
            elem.text = new_parent_name
        elif local_name(elem.tag) == "family" and (elem.text or "") in old_relation_names:
            elem.text = new_relation_name
        elif local_name(elem.tag) == "object" and elem.attrib.get("caption") in old_relation_names:
            old_id = elem.attrib.get("id", "")
            elem.attrib["caption"] = new_relation_name
            for old_name in old_relation_names:
                if old_id.startswith(f"{old_name}_"):
                    elem.attrib["id"] = old_id.replace(f"{old_name}_", f"{new_relation_name}_", 1)
                    break

        for attr_name, attr_value in list(elem.attrib.items()):
            updated = attr_value
            if attr_name == "caption" and attr_value in old_relation_names:
                updated = new_relation_name
            if attr_name == "name" and attr_value.startswith("[__tableau_internal_object_id__].["):
                for old_name in old_relation_names:
                    updated = updated.replace(
                        f"[__tableau_internal_object_id__].[{old_name}_",
                        f"[__tableau_internal_object_id__].[{new_relation_name}_",
                    )
            if attr_name == "id":
                for old_name in old_relation_names:
                    if updated.startswith(f"{old_name}_"):
                        updated = updated.replace(f"{old_name}_", f"{new_relation_name}_", 1)
            elem.attrib[attr_name] = updated

        if elem.text:
            for old_name in old_relation_names:
                elem.text = elem.text.replace(f"[{old_name}_", f"[{new_relation_name}_")


def prune_incompatible_datasource_nodes(datasource: ET.Element) -> None:
    def prune(node: ET.Element) -> None:
        for child in list(node):
            if not isinstance(child.tag, str):
                continue
            tag = local_name(child.tag)
            if tag == "manual-sort":
                node.remove(child)
                continue
            if tag == "layout":
                for attr_name in list(child.attrib):
                    if attr_name.endswith("dim-percentage") or attr_name.endswith("measure-percentage"):
                        child.attrib.pop(attr_name, None)
            prune(child)
            child_tag = local_name(child.tag)
            if child_tag == "default-sorts" and len(list(child)) == 0:
                node.remove(child)

    prune(datasource)


def rewrite_datasource_for_project(
    datasource: ET.Element,
    info: DatasourceInfo,
    *,
    new_datasource_name: str,
    package_directory: str,
    filename: Optional[str],
) -> ET.Element:
    cloned = copy.deepcopy(datasource)
    cloned.attrib["name"] = new_datasource_name

    if info.is_parameter or filename is None:
        return cloned

    def should_prune(node: ET.Element) -> bool:
        tag = local_name(node.tag)
        if tag == "extract":
            return True
        if tag == "properties" and node.attrib.get("context") == "extract":
            return True
        if tag == "connection" and node.attrib.get("class") == "hyper":
            return True
        if (tag == "relation" or tag.endswith("relation")) and node.attrib.get("table") == "[Extract].[Extract]":
            return True
        return False

    prune_tree(cloned, should_prune)
    normalize_excel_semantics_for_textscan(cloned, filename)
    prune_incompatible_datasource_nodes(cloned)
    set_named_connections(
        cloned,
        connection_class="textscan",
        package_directory=package_directory,
        filename=filename,
    )
    return cloned


def rewrite_worksheet_datasource_names(
    worksheet: ET.Element,
    datasource_name_map: Dict[str, str],
) -> ET.Element:
    cloned = copy.deepcopy(worksheet)
    replace_textual_content(cloned, datasource_name_map)
    return cloned


def collect_layout_sheet_zones(
    dashboard: ET.Element,
    layout_sheet_names: Sequence[str],
) -> List[ET.Element]:
    expected = set(layout_sheet_names)
    found: List[ET.Element] = []

    def walk(zone: ET.Element) -> None:
        name = zone.attrib.get("name")
        if name in expected:
            found.append(zone)
        for child in list(zone):
            if not isinstance(child.tag, str):
                continue
            if local_name(child.tag) == "zone":
                walk(child)

    zones = find_first_child(dashboard, "zones")
    for zone in iter_children(zones, "zone"):
        walk(zone)
    return found


def rewrite_dashboard(
    layout_dashboard: ET.Element,
    layout_sheet_names: Sequence[str],
    selected_worksheets: Sequence[SelectedWorksheet],
    dashboard_name: str,
) -> ET.Element:
    cloned = copy.deepcopy(layout_dashboard)
    cloned.attrib["name"] = dashboard_name
    name_map = {
        old_name: selection.new_name
        for old_name, selection in zip(layout_sheet_names, selected_worksheets)
    }

    sheet_zones = collect_layout_sheet_zones(cloned, layout_sheet_names)
    if len(sheet_zones) != len(selected_worksheets):
        raise ValueError(
            f"Layout sheet zone count mismatch: expected {len(selected_worksheets)}, found {len(sheet_zones)}"
        )

    for zone in cloned.iter():
        if not isinstance(zone.tag, str):
            continue
        if local_name(zone.tag) != "zone":
            continue
        zone_name = zone.attrib.get("name")
        if zone_name in name_map:
            zone.attrib["name"] = name_map[zone_name]
    return cloned


def random_uuid_braced() -> str:
    return "{" + str(uuid.uuid4()).upper() + "}"


def ensure_dashboard_contains_datasources(
    dashboard: ET.Element,
    datasource_entries: Sequence[Tuple[str, str]],
) -> None:
    datasources_node = find_first_child(dashboard, "datasources")
    if datasources_node is None:
        zones = find_first_child(dashboard, "zones")
        datasources_node = ET.Element("datasources")
        insert_at = list(dashboard).index(zones) if zones is not None else len(list(dashboard))
        dashboard.insert(insert_at, datasources_node)
    else:
        for child in list(datasources_node):
            datasources_node.remove(child)

    for datasource_name, datasource_caption in datasource_entries:
        attrs = {"name": datasource_name}
        if datasource_caption:
            attrs["caption"] = datasource_caption
        ET.SubElement(datasources_node, "datasource", attrs)


def ensure_dashboard_has_devicelayouts(dashboard: ET.Element) -> None:
    devicelayouts = find_first_child(dashboard, "devicelayouts")
    if devicelayouts is None:
        return


def ensure_dashboard_has_simple_id(dashboard: ET.Element) -> None:
    simple_id = find_first_child(dashboard, "simple-id")
    if simple_id is None:
        ET.SubElement(dashboard, "simple-id", {"uuid": random_uuid_braced()})


def ensure_dashboard_window_has_simple_id(window: ET.Element) -> None:
    simple_id = find_first_child(window, "simple-id")
    if simple_id is None:
        ET.SubElement(window, "simple-id", {"uuid": random_uuid_braced()})


def ensure_worksheet_has_simple_id(worksheet: ET.Element) -> None:
    simple_id = find_first_child(worksheet, "simple-id")
    if simple_id is None:
        ET.SubElement(worksheet, "simple-id", {"uuid": random_uuid_braced()})


def ensure_worksheet_title(worksheet: ET.Element, title_text: str) -> None:
    normalized = normalize_display_title(title_text)
    layout_options = find_first_child(worksheet, "layout-options")
    if layout_options is None:
        layout_options = ET.Element("layout-options")
        insert_at = 0
        repository_location = find_first_child(worksheet, "repository-location")
        if repository_location is not None:
            insert_at = list(worksheet).index(repository_location)
        worksheet.insert(insert_at, layout_options)

    title = find_first_child(layout_options, "title")
    if title is None:
        title = ET.SubElement(layout_options, "title")
    else:
        for child in list(title):
            title.remove(child)
    formatted_text = ET.SubElement(title, "formatted-text")
    run = ET.SubElement(formatted_text, "run")
    run.text = normalized


def rewrite_dashboard_window(
    layout_window: ET.Element,
    selected_worksheets: Sequence[SelectedWorksheet],
    dashboard_name: str,
) -> ET.Element:
    cloned = copy.deepcopy(layout_window)
    cloned.attrib["name"] = dashboard_name

    viewpoints = find_first_child(cloned, "viewpoints")
    if viewpoints is None:
        viewpoints = ET.SubElement(cloned, "viewpoints")
    else:
        for child in list(viewpoints):
            viewpoints.remove(child)
    for selection in selected_worksheets:
        ET.SubElement(viewpoints, "viewpoint", {"name": selection.new_name})
    ensure_dashboard_window_has_simple_id(cloned)
    return cloned


def ordered_synthesized_windows(
    layout_project: ProjectModel,
    selected_worksheets: Sequence[SelectedWorksheet],
    worksheet_windows_by_name: Dict[str, ET.Element],
    dashboard_window: ET.Element,
) -> List[ET.Element]:
    layout_name_map = {
        layout_name: selection.new_name
        for layout_name, selection in zip(layout_project.dashboard_sheet_order, selected_worksheets)
    }
    ordered: List[ET.Element] = []
    used_names: Set[str] = set()
    dashboard_added = False

    for original_window in layout_project.root.findall("./windows/window"):
        window_class = original_window.attrib.get("class")
        window_name = original_window.attrib.get("name")
        if window_class == "dashboard" and window_name == layout_project.dashboard_name:
            ordered.append(copy.deepcopy(dashboard_window))
            dashboard_added = True
            continue
        if window_class != "worksheet":
            continue
        rewritten_name = layout_name_map.get(window_name)
        if rewritten_name is None or rewritten_name in used_names:
            continue
        window = worksheet_windows_by_name.get(rewritten_name)
        if window is None:
            continue
        ordered.append(copy.deepcopy(window))
        used_names.add(rewritten_name)

    for selection in selected_worksheets:
        if selection.new_name in used_names:
            continue
        window = worksheet_windows_by_name.get(selection.new_name)
        if window is None:
            continue
        ordered.append(copy.deepcopy(window))
        used_names.add(selection.new_name)

    if not dashboard_added:
        ordered.append(copy.deepcopy(dashboard_window))
    return ordered


def is_filter_action(action: ET.Element) -> bool:
    command = find_first_child(action, "command")
    if command is None:
        return False
    return command.attrib.get("command") == "tsc:tsl-filter"


def action_filter_reference(node: ET.Element) -> Optional[str]:
    for key, value in node.attrib.items():
        if key.endswith("ui-action-filter"):
            return value
    return None


def prune_unresolved_action_filters(worksheet: ET.Element, allowed_action_names: Set[str]) -> None:
    table = find_first_child(worksheet, "table")
    view = find_first_child(table, "view")
    if view is None:
        return

    for child in list(view):
        if not isinstance(child.tag, str):
            continue
        if local_name(child.tag) != "filter":
            continue
        unresolved = False
        for descendant in child.iter():
            if not isinstance(descendant.tag, str):
                continue
            action_name = action_filter_reference(descendant)
            if action_name and action_name not in allowed_action_names:
                unresolved = True
                break
        if unresolved:
            view.remove(child)


def prune_incompatible_view_nodes(worksheet: ET.Element) -> None:
    table = find_first_child(worksheet, "table")
    view = find_first_child(table, "view")
    if view is None:
        return
    for child in list(view):
        if not isinstance(child.tag, str):
            continue
        if local_name(child.tag) == "shelf-sorts":
            view.remove(child)


def build_actions(
    plan: SynthesisPlan,
    sheet_name_map: Dict[Tuple[int, str], str],
) -> Tuple[List[ET.Element], Dict[int, Dict[str, str]]]:
    usage_count: Dict[int, int] = {}
    donors_by_id: Dict[int, ProjectModel] = {}
    for selection in plan.selected_worksheets:
        usage_count[selection.donor.project_id] = usage_count.get(selection.donor.project_id, 0) + 1
        donors_by_id[selection.donor.project_id] = selection.donor

    actions: List[ET.Element] = []
    action_name_map_by_donor: Dict[int, Dict[str, str]] = {}
    action_counter = 1
    for donor in donors_by_id.values():
        if usage_count.get(donor.project_id, 0) < 2:
            continue
        for action in donor.action_elements:
            if not is_filter_action(action):
                continue
            source = find_first_child(action, "source")
            if source is None:
                continue
            source_sheet = source.attrib.get("worksheet")
            if not source_sheet:
                continue
            new_source_name = sheet_name_map.get((donor.project_id, source_sheet))
            if new_source_name is None:
                continue

            cloned = copy.deepcopy(action)
            new_action_name = f"[P{donor.project_id}_Action{action_counter}]"
            action_name_map_by_donor.setdefault(donor.project_id, {})[action.attrib.get("name", "")] = new_action_name
            cloned.attrib["name"] = new_action_name
            cloned.attrib["caption"] = f"Synthetic Filter {action_counter}"
            action_counter += 1

            cloned_source = find_first_child(cloned, "source")
            if cloned_source is not None:
                cloned_source.attrib["worksheet"] = new_source_name
                if cloned_source.attrib.get("dashboard"):
                    cloned_source.attrib["dashboard"] = plan.dashboard_name

            command = find_first_child(cloned, "command")
            if command is not None:
                for param in iter_children(command, "param"):
                    if param.attrib.get("name") == "target":
                        param.attrib["value"] = plan.dashboard_name
            actions.append(cloned)
    return actions, action_name_map_by_donor


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ensure_clean_dir(path: Path, force: bool) -> None:
    if path.exists():
        if not force:
            raise FileExistsError(f"{path} already exists")
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def write_workbook(path: Path, root: ET.Element) -> None:
    tree = ET.ElementTree(root)
    tree.write(path, encoding="utf-8", xml_declaration=True)


def package_twbx(output_dir: Path, twb_path: Path, twbx_path: Path) -> None:
    with zipfile.ZipFile(twbx_path, "w", compression=zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.write(twb_path, arcname=twb_path.name)
        data_root = output_dir / "data"
        if data_root.exists():
            for file_path in sorted(data_root.rglob("*")):
                if file_path.is_file():
                    relative = file_path.relative_to(data_root).as_posix()
                    zip_file.write(file_path, arcname=f"Data/{relative}")


def build_synthesized_project(plan: SynthesisPlan, output_root: Path, force: bool) -> Path:
    output_dir = output_root / plan.folder_name
    ensure_clean_dir(output_dir, force=force)
    (output_dir / "data").mkdir(parents=True, exist_ok=True)

    compatibility_projects = [plan.layout_project, *[selection.donor for selection in plan.selected_worksheets]]
    shell_project = max(compatibility_projects, key=compatibility_key)
    synthesized_root = copy.deepcopy(shell_project.root)

    for key in ("version", "original-version", "source-build", "source-platform"):
        value = shell_project.workbook_attrs.get(key)
        if value:
            synthesized_root.attrib[key] = value

    repo_location = find_first_child(synthesized_root, "repository-location")
    if repo_location is not None:
        repo_location.attrib["id"] = f"{plan.folder_name}_{uuid.uuid4().hex[:8]}"

    datasources_root = find_first_child(synthesized_root, "datasources")
    worksheets_root = find_first_child(synthesized_root, "worksheets")
    actions_root = find_first_child(synthesized_root, "actions")
    dashboards_root = find_first_child(synthesized_root, "dashboards")
    windows_root = find_first_child(synthesized_root, "windows")
    thumbnails_root = find_first_child(synthesized_root, "thumbnails")

    if datasources_root is None or worksheets_root is None or actions_root is None or dashboards_root is None or windows_root is None:
        raise ValueError("Workbook is missing one of the required Tableau sections")

    for section in (datasources_root, worksheets_root, actions_root, dashboards_root, windows_root):
        for child in list(section):
            section.remove(child)
    if thumbnails_root is not None:
        for child in list(thumbnails_root):
            thumbnails_root.remove(child)

    datasource_key_to_name: Dict[Tuple[int, str], str] = {}
    worksheet_rewritten_names: Dict[Tuple[int, str], str] = {}
    worksheet_replacements: Dict[Tuple[int, str], Dict[str, str]] = {}

    for selection in plan.selected_worksheets:
        worksheet_rewritten_names[(selection.donor.project_id, selection.source_name)] = selection.new_name

    built_actions: List[ET.Element] = []
    action_name_map_by_donor: Dict[int, Dict[str, str]] = {}

    if plan.strategy == "auto-remap":
        target_project = plan.target_data_project
        if target_project is None:
            raise ValueError("auto-remap plan requires a target_data_project")
        target_datasource_name = primary_real_datasource_name(target_project)
        if target_datasource_name is None:
            raise ValueError("target_data_project must have a real datasource")
        target_specs = target_project.datasource_field_specs.get(target_datasource_name, {})
        if not target_specs:
            raise ValueError("target_data_project datasource is missing field specs")
        target_info = target_project.datasource_infos[target_datasource_name]
        target_original = target_project.datasource_elements[target_datasource_name]
        new_target_datasource_name = make_unique_worksheet_name(
            f"ds_p{target_project.project_id}_{sanitize_slug(target_datasource_name)}",
            set(),
        )
        copied_filename = f"p{target_project.project_id}_{target_info.source_csv.name}" if target_info.source_csv else None
        if copied_filename is None:
            raise ValueError("target_data_project datasource is missing source CSV")
        package_subdir = sanitize_slug(target_project.source_dir.name)
        lower_dir = output_dir / "data" / package_subdir
        lower_dir.mkdir(parents=True, exist_ok=True)
        lower_copy = lower_dir / copied_filename
        shutil.copy2(target_info.source_csv, lower_copy)
        normalize_csv_header_row(lower_copy)
        rewritten = rewrite_datasource_for_project(
            target_original,
            target_info,
            new_datasource_name=new_target_datasource_name,
            package_directory=f"Data/{package_subdir}",
            filename=copied_filename,
        )
        datasources_root.append(rewritten)
        datasource_key_to_name[(target_project.project_id, target_datasource_name)] = new_target_datasource_name

        for selection in plan.selected_worksheets:
            field_map = {}
            if plan.worksheet_field_maps:
                field_map = plan.worksheet_field_maps.get((selection.donor.project_id, selection.source_name), {})
            for donor_datasource_name in selection.donor.worksheet_datasources.get(selection.source_name, set()):
                donor_datasource = selection.donor.datasource_elements.get(donor_datasource_name)
                if donor_datasource is None:
                    continue
                merge_donor_support_nodes_into_target_datasource(
                    target_datasource=rewritten,
                    target_datasource_name=new_target_datasource_name,
                    target_specs=target_specs,
                    donor_datasource=donor_datasource,
                    donor_datasource_name=donor_datasource_name,
                    field_map=field_map,
                )
            rewritten_worksheet = rewrite_worksheet_for_auto_remap(
                selection.donor.worksheet_map[selection.source_name],
                source_datasource_names=tuple(
                    sorted(selection.donor.worksheet_datasources.get(selection.source_name, set()))
                ),
                target_datasource_name=new_target_datasource_name,
                field_map=field_map,
                target_specs=target_specs,
                display_title=selection.display_title,
            )
            dedupe_datasource_dependencies(rewritten_worksheet)
            rewritten_worksheet.attrib["name"] = selection.new_name
            worksheets_root.append(rewritten_worksheet)
            worksheet_replacements[(selection.donor.project_id, selection.source_name)] = {
                **{name: new_target_datasource_name for name in selection.datasource_names},
                **field_map,
            }
    else:
        built_actions, action_name_map_by_donor = build_actions(plan, worksheet_rewritten_names)

        for selection in plan.selected_worksheets:
            donor = selection.donor
            for old_datasource_name in selection.datasource_names:
                key = (donor.project_id, old_datasource_name)
                if key in datasource_key_to_name:
                    continue
                info = donor.datasource_infos[old_datasource_name]
                original_datasource = donor.datasource_elements[old_datasource_name]

                new_datasource_name = make_unique_worksheet_name(
                    f"ds_p{donor.project_id}_{sanitize_slug(old_datasource_name)}",
                    set(datasource_key_to_name.values()),
                )
                package_subdir = sanitize_slug(donor.source_dir.name)
                copied_filename: Optional[str] = None

                if not info.is_parameter:
                    if info.source_csv is None:
                        raise ValueError(
                            f"Datasource {old_datasource_name} in {donor.source_dir.name} could not be mapped to a CSV file"
                        )
                    copied_filename = f"p{donor.project_id}_{info.source_csv.name}"
                    lower_dir = output_dir / "data" / package_subdir
                    lower_dir.mkdir(parents=True, exist_ok=True)
                    lower_copy = lower_dir / copied_filename
                    shutil.copy2(info.source_csv, lower_copy)
                    normalize_csv_header_row(lower_copy)

                rewritten = rewrite_datasource_for_project(
                    original_datasource,
                    info,
                    new_datasource_name=new_datasource_name,
                    package_directory=f"Data/{package_subdir}",
                    filename=copied_filename,
                )
                datasources_root.append(rewritten)
                datasource_key_to_name[key] = new_datasource_name

        for selection in plan.selected_worksheets:
            replacements = {}
            for datasource_name in selection.datasource_names:
                replacements[datasource_name] = datasource_key_to_name[(selection.donor.project_id, datasource_name)]
            rewritten_worksheet = rewrite_worksheet_datasource_names(
                selection.donor.worksheet_map[selection.source_name],
                replacements,
            )
            action_name_map = action_name_map_by_donor.get(selection.donor.project_id, {})
            if action_name_map:
                replace_textual_content(rewritten_worksheet, action_name_map)
            prune_unresolved_action_filters(rewritten_worksheet, set(action_name_map.values()))
            prune_incompatible_view_nodes(rewritten_worksheet)
            ensure_worksheet_title(rewritten_worksheet, selection.display_title)
            ensure_worksheet_has_simple_id(rewritten_worksheet)
            rewritten_worksheet.attrib["name"] = selection.new_name
            worksheets_root.append(rewritten_worksheet)
            worksheet_replacements[(selection.donor.project_id, selection.source_name)] = {
                **replacements,
                **action_name_map,
            }

    dashboard = rewrite_dashboard(
        plan.layout_project.root.find("dashboards")[0],
        plan.layout_project.dashboard_sheet_order,
        plan.selected_worksheets,
        plan.dashboard_name,
    )
    dashboard_datasources: List[Tuple[str, str]] = []
    seen_dashboard_datasources: Set[str] = set()
    if plan.strategy == "auto-remap":
        target_project = plan.target_data_project
        assert target_project is not None
        target_datasource_name = primary_real_datasource_name(target_project)
        assert target_datasource_name is not None
        new_target_datasource_name = datasource_key_to_name[(target_project.project_id, target_datasource_name)]
        dashboard_datasources.append((new_target_datasource_name, target_project.datasource_infos[target_datasource_name].caption))
    else:
        for selection in plan.selected_worksheets:
            for old_datasource_name in selection.datasource_names:
                new_datasource_name = datasource_key_to_name[(selection.donor.project_id, old_datasource_name)]
                if new_datasource_name in seen_dashboard_datasources:
                    continue
                seen_dashboard_datasources.add(new_datasource_name)
                info = selection.donor.datasource_infos[old_datasource_name]
                dashboard_datasources.append((new_datasource_name, info.caption))
    ensure_dashboard_contains_datasources(dashboard, dashboard_datasources)
    ensure_dashboard_has_devicelayouts(dashboard)
    ensure_dashboard_has_simple_id(dashboard)
    dashboards_root.append(dashboard)

    worksheet_windows_by_name: Dict[str, ET.Element] = {}
    for selection in plan.selected_worksheets:
        if plan.strategy == "auto-remap":
            window = build_generic_worksheet_window(selection.new_name)
        else:
            window = copy.deepcopy(selection.donor.window_map[selection.source_name])
            replacements = worksheet_replacements.get((selection.donor.project_id, selection.source_name), {})
            if replacements:
                replace_textual_content(window, replacements)
            window.attrib["name"] = selection.new_name
        window.attrib["name"] = selection.new_name
        worksheet_windows_by_name[selection.new_name] = window

    dashboard_window = plan.layout_project.window_map.get(plan.layout_project.dashboard_name)
    if dashboard_window is None:
        raise ValueError(f"Missing dashboard window for {plan.layout_project.source_dir.name}")
    synthesized_dashboard_window = rewrite_dashboard_window(
        dashboard_window,
        plan.selected_worksheets,
        plan.dashboard_name,
    )
    for window in ordered_synthesized_windows(
        plan.layout_project,
        plan.selected_worksheets,
        worksheet_windows_by_name,
        synthesized_dashboard_window,
    ):
        windows_root.append(window)

    for action in built_actions:
        actions_root.append(action)

    normalize_all_csv_headers(output_dir / "data")

    workbook_path = output_dir / f"{plan.workbook_name}.twb"
    write_workbook(workbook_path, synthesized_root)
    ET.parse(workbook_path)

    twbx_path = output_dir / f"{plan.workbook_name}.twbx"
    package_twbx(output_dir, workbook_path, twbx_path)

    manifest = {
        "synthetic_project": plan.folder_name,
        "dashboard_name": plan.dashboard_name,
        "strategy": plan.strategy,
        "layout_project_id": plan.layout_project.project_id,
        "layout_project_dir": plan.layout_project.source_dir.name,
        "target_data_project_id": plan.target_data_project.project_id if plan.target_data_project else None,
        "target_data_project_dir": plan.target_data_project.source_dir.name if plan.target_data_project else None,
        "slot_count": len(plan.selected_worksheets),
        "source_project_ids": sorted({selection.donor.project_id for selection in plan.selected_worksheets}),
        "worksheets": [
            {
                "source_project_id": selection.donor.project_id,
                "source_project_dir": selection.donor.source_dir.name,
                "source_worksheet": selection.source_name,
                "new_worksheet": selection.new_name,
                "chart_type": selection.chart_type,
                "datasource_names": list(selection.datasource_names),
            }
            for selection in plan.selected_worksheets
        ],
        "files": {
            "twb": workbook_path.name,
            "twbx": twbx_path.name,
        },
    }
    write_json(output_dir / "manifest.json", manifest)
    return output_dir


def discover_projects(tableau_root: Path, ids: Iterable[int]) -> List[ProjectModel]:
    projects: List[ProjectModel] = []
    for project_id in ids:
        source_dir = resolve_project_dir(tableau_root, project_id)
        if source_dir is None:
            print(f"Skipping {project_id}: project directory not found or ambiguous")
            continue
        try:
            project = load_project_model(source_dir, project_id)
        except Exception as exc:
            print(f"Skipping {project_id}: {exc}")
            continue
        if not project_can_supply_dashboard_views(project):
            print(f"Skipping {project_id}: datasource to CSV mapping is not safe enough")
            continue
        projects.append(project)
    return projects


def main() -> int:
    args = parse_args()
    repo_dir = repo_root()
    tableau_root = (repo_dir / args.tableau_root).resolve()
    output_root = (repo_dir / args.output_root).resolve()
    ids = args.ids or DEFAULT_REFERENCE_PROJECT_IDS

    if args.count <= 0:
        raise ValueError("--count must be greater than zero")
    if args.min_source_projects <= 0 or args.max_source_projects <= 0:
        raise ValueError("Source project limits must be positive integers")
    if args.min_source_projects > args.max_source_projects:
        raise ValueError("--min-source-projects cannot be greater than --max-source-projects")
    if not (0.0 <= args.min_schema_similarity <= 1.0):
        raise ValueError("--min-schema-similarity must be between 0 and 1")

    rng = random.Random(args.seed)
    projects = discover_projects(tableau_root, ids)
    projects_by_id = {project.project_id: project for project in projects}
    layout_candidates = [
        project
        for project in projects
        if project_is_layout_candidate(project)
        and parse_version_tuple(project.workbook_attrs.get("version", "0")) >= (18, 1)
        and project_has_modern_dashboard_schema(project)
        and project.dashboard_text_zone_count == 0
    ]

    print(f"Eligible view donors: {len(projects)}")
    print(f"Eligible layout donors: {len(layout_candidates)}")

    if len(projects) < args.min_source_projects:
        print("Not enough eligible source projects to build a synthesis batch.")
        return 1
    if not layout_candidates:
        print("No eligible layout donors were found.")
        return 1

    if args.clean_output_root and output_root.exists():
        shutil.rmtree(output_root)
    output_root.mkdir(parents=True, exist_ok=True)

    built = 0
    planned_jobs: List[SynthesisPlan] = []
    if args.strategy == "curated":
        planned_jobs = build_curated_plans(
            index_start=1,
            count=args.count,
            projects_by_id=projects_by_id,
        )
    elif args.strategy == "auto-remap":
        planned_jobs = build_auto_remap_plans(
            index_start=1,
            count=args.count,
            projects=projects,
            min_source_projects=args.min_source_projects,
            max_source_projects=args.max_source_projects,
            min_schema_similarity=args.min_schema_similarity,
            rng=rng,
        )
    elif args.strategy == "auto-cluster":
        planned_jobs = build_auto_cluster_plans(
            index_start=1,
            count=args.count,
            projects=projects,
            min_source_projects=args.min_source_projects,
            max_source_projects=args.max_source_projects,
            min_schema_similarity=args.min_schema_similarity,
            rng=rng,
        )
    else:
        for index in range(1, args.count + 1):
            plan = select_synthesis_plan(
                index=index,
                projects=projects,
                layout_candidates=layout_candidates,
                rng=rng,
                min_source_projects=args.min_source_projects,
                max_source_projects=args.max_source_projects,
                min_schema_similarity=args.min_schema_similarity,
            )
            if plan is not None:
                planned_jobs.append(plan)

    if not planned_jobs:
        print("Unable to build any synthesis plans.")
        return 1

    for display_index, plan in enumerate(planned_jobs, start=1):

        source_ids = sorted({selection.donor.project_id for selection in plan.selected_worksheets})
        print(
            f"[{display_index}/{len(planned_jobs)}] {plan.folder_name}: "
            f"layout={plan.layout_project.project_id}, sources={source_ids}"
        )
        if args.dry_run:
            continue

        try:
            output_dir = build_synthesized_project(plan, output_root, force=args.force)
        except FileExistsError as exc:
            print(f"  Skipped: {exc}")
            continue
        except Exception as exc:
            print(f"  Failed: {exc}")
            continue
        built += 1
        print(f"  Wrote {output_dir.relative_to(repo_dir)}")

    if args.dry_run:
        print("Dry run complete.")
        return 0

    print(f"Finished. Built {built} synthesized project(s).")
    return 0 if built > 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
