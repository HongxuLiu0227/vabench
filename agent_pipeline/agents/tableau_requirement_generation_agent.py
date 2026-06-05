from __future__ import annotations

import csv
import json
import os
import random
import re
import shutil
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import quote
from xml.etree import ElementTree as ET

try:
    import openai  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    openai = None

try:
    from dotenv import load_dotenv  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    def load_dotenv(*args, **kwargs):  # type: ignore
        return False

from .llm_output_utils import extract_json_from_llm_output, get_complete_llm_response
from ..logging_config import get_logger

logger = get_logger(__name__)

SAMPLE_DATA_PLACEHOLDER = "{{SAMPLE_DATA}}"
FIELD_REF_PATTERN = re.compile(r"\[[^\]]+\]")


TABLEAU_REQUIREMENT_SYSTEM_PROMPT = f"""You are an expert Tableau dashboard reverse-engineer and senior React engineer.

Your job: Given a Tableau workbook definition (.twb, XML) and information about the available dataset files, produce an EXTREMELY DETAILED, implementation-ready specification for recreating the SAME dashboard in a React + TypeScript application.

Hard constraints (do not violate):
- Tech stack MUST be: React + TypeScript + Vite.
- UI component library is optional. Do not force Ant Design unless the input explicitly requires it.
- The Tableau workbook definition is the ground truth. The React implementation must match the Tableau dashboard's:
  - layout (container structure, relative positioning, sizing intent)
  - sheet composition (what worksheets exist and how they are placed on the dashboard)
  - visual encodings (mark type, axes, measures/dimensions, colors, labels, tooltips)
  - interactions (filters, parameters, highlight actions, selections) as defined in the workbook
  - copy/text (titles, captions, legend labels). Preserve exact wording/case when present in the workbook.
- Do NOT invent new charts, KPIs, sections, or interactions. Only infer details when the workbook is ambiguous, and keep inference minimal.
- For visualization implementation details, prefer D3 primitives (`d3-scale`, `d3-shape`, `d3-axis`, `d3-array`) over card-centric chart wrappers.

Data constraints:
- Full dataset files will be available in the generated app under the Vite public folder at: public/data/...
- At runtime, those files can be fetched from the browser at URLs like: /data/<filename>
- Your output MUST include a "Data Loading" section that explains how to fetch and parse the full dataset using fetch().
- Your output MUST include a "Sample Data" section that contains EXACTLY the placeholder token {SAMPLE_DATA_PLACEHOLDER} (verbatim).
  - Put the placeholder inside a JSON code block. It will be replaced later with 10 randomly sampled rows.

Output format (CRITICAL):
- You MUST output ONLY a valid JSON object.
- The JSON must have exactly this structure:
{{
  "enriched_prompt": "..."
}}
- Do not include any text before or after the JSON object.
- The enriched_prompt must be written in ENGLISH (but preserve any Tableau-provided UI strings verbatim if they are not English).
"""


def _local_name(tag: str) -> str:
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


def _iter_child_elements(element: Optional[ET.Element], name: Optional[str] = None) -> List[ET.Element]:
    if element is None:
        return []
    children: List[ET.Element] = []
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


def _iter_descendants(element: Optional[ET.Element], name: str) -> List[ET.Element]:
    if element is None:
        return []
    matches: List[ET.Element] = []
    for descendant in element.iter():
        if descendant is element:
            continue
        if isinstance(descendant.tag, str) and _local_name(descendant.tag) == name:
            matches.append(descendant)
    return matches


def _normalize_bucket_value(value: str) -> str:
    text = str(value or "").strip()
    if len(text) >= 2 and text[0] == '"' and text[-1] == '"':
        return text[1:-1]
    return text


def _extract_field_tokens(raw_text: str) -> List[str]:
    if not raw_text:
        return []
    return FIELD_REF_PATTERN.findall(raw_text)


def _normalize_tableau_text(raw_text: str) -> str:
    text = str(raw_text or "")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Tableau rich-text runs sometimes contain this artifact around line breaks.
    text = text.replace("Æ", "")
    return text


def _extract_formatted_text_runs(formatted_text: Optional[ET.Element]) -> List[Dict[str, Any]]:
    runs: List[Dict[str, Any]] = []
    for run in _iter_child_elements(formatted_text, "run"):
        runs.append(
            {
                "text": _normalize_tableau_text(run.text or ""),
                "style": dict(run.attrib),
            }
        )
    return runs


def _compose_title_text(runs: List[Dict[str, Any]]) -> str:
    raw = "".join(str(run.get("text") or "") for run in runs if isinstance(run, dict))
    if not raw:
        return ""
    compact = _normalize_tableau_text(raw).replace("\n", " ")
    compact = re.sub(r"\s+", " ", compact)
    return compact.strip()


def _compose_zone_text(runs: List[Dict[str, Any]]) -> str:
    raw = "".join(str(run.get("text") or "") for run in runs if isinstance(run, dict))
    if not raw:
        return ""
    text = _normalize_tableau_text(raw)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _extract_zone_type(zone: ET.Element) -> str:
    for key, value in zone.attrib.items():
        if key.endswith("type-v2"):
            return str(value)
    for key, value in zone.attrib.items():
        if key.endswith("type"):
            return str(value)
    return ""


def _extract_title_runs(worksheet: ET.Element) -> List[Dict[str, Any]]:
    layout_options = _find_first_child(worksheet, "layout-options")
    title = _find_first_child(layout_options, "title")
    formatted_text = _find_first_child(title, "formatted-text")
    return _extract_formatted_text_runs(formatted_text)


def _parse_table_calc(worksheet: ET.Element) -> List[Dict[str, Any]]:
    table = _find_first_child(worksheet, "table")
    view = _find_first_child(table, "view")
    dependencies = _find_first_child(view, "datasource-dependencies")
    table_calcs: List[Dict[str, Any]] = []

    for column_instance in _iter_child_elements(dependencies, "column-instance"):
        parent_name = (
            column_instance.attrib.get("name")
            or column_instance.attrib.get("column")
            or ""
        )
        for table_calc in _iter_descendants(column_instance, "table-calc"):
            entry = dict(table_calc.attrib)
            entry["column_instance"] = parent_name
            table_calcs.append(entry)
    return table_calcs


def _parse_manual_sorts(worksheet: ET.Element) -> List[Dict[str, Any]]:
    table = _find_first_child(worksheet, "table")
    view = _find_first_child(table, "view")
    manual_sorts: List[Dict[str, Any]] = []

    for manual_sort in _iter_child_elements(view, "manual-sort"):
        dictionary = _find_first_child(manual_sort, "dictionary")
        buckets = [
            _normalize_bucket_value((bucket.text or "").strip())
            for bucket in _iter_child_elements(dictionary, "bucket")
            if (bucket.text or "").strip()
        ]
        manual_sorts.append(
            {
                "column": manual_sort.attrib.get("column", ""),
                "direction": manual_sort.attrib.get("direction", ""),
                "buckets": buckets,
            }
        )
    return manual_sorts


def _parse_filter_expression(node: ET.Element) -> Dict[str, Any]:
    payload: Dict[str, Any] = {
        "tag": _local_name(node.tag),
        "attributes": dict(node.attrib),
    }
    text = (node.text or "").strip()
    if text:
        payload["text"] = text

    child_nodes = _iter_child_elements(node)
    if child_nodes:
        payload["children"] = [_parse_filter_expression(child) for child in child_nodes]
    return payload


def _parse_filters(worksheet: ET.Element) -> List[Dict[str, Any]]:
    table = _find_first_child(worksheet, "table")
    view = _find_first_child(table, "view")
    filters: List[Dict[str, Any]] = []

    for filter_node in _iter_child_elements(view, "filter"):
        filters.append(
            {
                "class": filter_node.attrib.get("class", ""),
                "column": filter_node.attrib.get("column", ""),
                "expression": _parse_filter_expression(filter_node),
            }
        )
    return filters


def _parse_rows_or_cols(worksheet: ET.Element, axis_name: str) -> Dict[str, Any]:
    table = _find_first_child(worksheet, "table")
    axis = _find_first_child(table, axis_name)
    raw_text = (axis.text or "").strip() if axis is not None else ""
    return {
        "raw": raw_text,
        "fields": _extract_field_tokens(raw_text),
    }


def _parse_slices(worksheet: ET.Element) -> List[str]:
    table = _find_first_child(worksheet, "table")
    view = _find_first_child(table, "view")
    slices_node = _find_first_child(view, "slices")
    return [
        (column.text or "").strip()
        for column in _iter_child_elements(slices_node, "column")
        if (column.text or "").strip()
    ]


def _parse_encodings(worksheet: ET.Element) -> Dict[str, List[Dict[str, Any]]]:
    table = _find_first_child(worksheet, "table")
    panes = _find_first_child(table, "panes")
    encodings: Dict[str, List[Dict[str, Any]]] = {}

    # Extract palette/type from style-rule mark encoding
    style = _find_first_child(table, "style")
    mark_palette = ""
    mark_palette_type = ""
    if style is not None:
        for style_rule in _iter_child_elements(style, "style-rule"):
            if str(style_rule.attrib.get("element") or "").strip() != "mark":
                continue
            for enc_node in _iter_child_elements(style_rule, "encoding"):
                if str(enc_node.attrib.get("attr") or "").strip() == "color":
                    mark_palette = str(enc_node.attrib.get("palette") or "").strip()
                    mark_palette_type = str(enc_node.attrib.get("type") or "").strip()

    for pane_index, pane in enumerate(_iter_child_elements(panes, "pane")):
        pane_encodings = _find_first_child(pane, "encodings")
        for encoding_node in _iter_child_elements(pane_encodings):
            key = _local_name(encoding_node.tag)
            entry = dict(encoding_node.attrib)
            entry["pane_index"] = pane_index
            # Augment color entries with style-rule palette info
            if key == "color" and mark_palette:
                entry["palette"] = mark_palette
                entry["type"] = mark_palette_type
            encodings.setdefault(key, []).append(entry)

    return encodings


def _parse_reference_lines(worksheet: ET.Element) -> List[Dict[str, Any]]:
    table = _find_first_child(worksheet, "table")
    panes = _find_first_child(table, "panes")
    references: List[Dict[str, Any]] = []

    for pane_index, pane in enumerate(_iter_child_elements(panes, "pane")):
        for ref_line in _iter_descendants(pane, "reference-line"):
            entry = dict(ref_line.attrib)
            entry["pane_index"] = pane_index
            references.append(entry)

    return references


def _parse_style_rule_elements(worksheet: ET.Element) -> List[str]:
    table = _find_first_child(worksheet, "table")
    style = _find_first_child(table, "style")
    elements: List[str] = []
    for style_rule in _iter_child_elements(style, "style-rule"):
        element_name = str(style_rule.attrib.get("element") or "").strip()
        if element_name and element_name not in elements:
            elements.append(element_name)
    return elements


def _parse_chart_type(worksheet: ET.Element) -> str:
    table = _find_first_child(worksheet, "table")
    panes = _find_first_child(table, "panes")
    pane = _find_first_child(panes, "pane")
    mark = _find_first_child(pane, "mark")
    if mark is None:
        return "Unknown"
    return mark.attrib.get("class", "Unknown")


def _parse_axis_titles(worksheet: ET.Element) -> Dict[str, List[Dict[str, str]]]:
    table = _find_first_child(worksheet, "table")
    style = _find_first_child(table, "style")
    axis_titles: Dict[str, List[Dict[str, str]]] = {"rows": [], "cols": [], "other": []}

    for style_rule in _iter_child_elements(style, "style-rule"):
        if str(style_rule.attrib.get("element") or "").strip().lower() != "axis":
            continue
        for format_node in _iter_child_elements(style_rule, "format"):
            if str(format_node.attrib.get("attr") or "").strip().lower() != "title":
                continue
            title = str(format_node.attrib.get("value") or "").strip()
            if not title:
                continue
            entry = {
                "field": str(format_node.attrib.get("field") or "").strip(),
                "title": title,
            }
            scope = str(format_node.attrib.get("scope") or "").strip().lower()
            if scope == "rows":
                axis_titles["rows"].append(entry)
            elif scope == "cols":
                axis_titles["cols"].append(entry)
            else:
                axis_titles["other"].append(entry)

    return axis_titles


def _parse_legend_spec(worksheet: ET.Element) -> Dict[str, Any]:
    table = _find_first_child(worksheet, "table")
    style = _find_first_child(table, "style")
    legend_fields: List[str] = []
    legend_title = ""
    legend_title_alignment = ""

    for style_rule in _iter_child_elements(style, "style-rule"):
        element_name = str(style_rule.attrib.get("element") or "").strip().lower()
        if element_name == "legend":
            for format_node in _iter_child_elements(style_rule, "format"):
                field = str(format_node.attrib.get("field") or "").strip()
                if field and field not in legend_fields:
                    legend_fields.append(field)
        elif element_name == "legend-title":
            for format_node in _iter_child_elements(style_rule, "format"):
                attr_name = str(format_node.attrib.get("attr") or "").strip().lower()
                value = str(format_node.attrib.get("value") or "").strip()
                if not value:
                    continue
                if attr_name in {"text", "title", "caption"} and not legend_title:
                    legend_title = value
                if attr_name == "text-align" and not legend_title_alignment:
                    legend_title_alignment = value

    return {
        "has_legend_rule": bool(legend_fields),
        "legend_fields": legend_fields,
        "legend_title": legend_title,
        "legend_title_alignment": legend_title_alignment,
    }


def _split_action_values(raw_value: str) -> List[str]:
    text = str(raw_value or "").strip()
    if not text:
        return []
    parts = [segment.strip() for segment in re.split(r"[;,]", text) if segment.strip()]
    return parts or [text]


def _parse_dashboard_actions(root: ET.Element) -> List[Dict[str, Any]]:
    actions_root = _find_first_child(root, "actions")
    actions: List[Dict[str, Any]] = []

    for action in _iter_child_elements(actions_root, "action"):
        activation_node = _find_first_child(action, "activation")
        source_node = _find_first_child(action, "source")
        command_node = _find_first_child(action, "command")

        command_name = str(command_node.attrib.get("command") or "") if command_node is not None else ""
        params: Dict[str, str] = {}
        if command_node is not None:
            for param in _iter_child_elements(command_node, "param"):
                name = str(param.attrib.get("name") or "").strip()
                if not name:
                    continue
                params[name] = str(param.attrib.get("value") or "").strip()

        action_kind = "custom_action"
        if command_name == "tsc:brush":
            action_kind = "highlight_brush"
        elif "filter" in command_name.lower():
            action_kind = "filter_action"
        elif "parameter" in command_name.lower():
            action_kind = "parameter_action"

        actions.append(
            {
                "name": str(action.attrib.get("name") or ""),
                "caption": str(action.attrib.get("caption") or ""),
                "kind": action_kind,
                "activation": dict(activation_node.attrib) if activation_node is not None else {},
                "source": dict(source_node.attrib) if source_node is not None else {},
                "command": command_name,
                "params": params,
                "field_captions": _split_action_values(params.get("field-captions", "")),
                "target": params.get("target", ""),
            }
        )

    return actions


def _parse_window_highlights(root: ET.Element) -> List[Dict[str, Any]]:
    windows_root = _find_first_child(root, "windows")
    highlight_bindings: List[Dict[str, Any]] = []

    for window in _iter_child_elements(windows_root, "window"):
        window_class = str(window.attrib.get("class") or "")
        window_name = str(window.attrib.get("name") or "")
        viewpoints_root = _find_first_child(window, "viewpoints")
        viewpoint_nodes = _iter_child_elements(viewpoints_root, "viewpoint")
        if not viewpoint_nodes:
            viewpoint_nodes = _iter_child_elements(window, "viewpoint")

        for viewpoint in viewpoint_nodes:
            viewpoint_name = str(viewpoint.attrib.get("name") or window_name)
            for highlight_node in _iter_child_elements(viewpoint, "highlight"):
                fields: List[str] = []
                field_attr = str(highlight_node.attrib.get("field") or "").strip()
                if field_attr:
                    fields.append(field_attr)
                for field_node in _iter_descendants(highlight_node, "field"):
                    text = (field_node.text or "").strip()
                    if text:
                        fields.append(text)
                deduped_fields: List[str] = []
                seen = set()
                for field in fields:
                    if field in seen:
                        continue
                    seen.add(field)
                    deduped_fields.append(field)

                modes = [_local_name(child.tag) for child in _iter_child_elements(highlight_node)]
                highlight_bindings.append(
                    {
                        "window_class": window_class,
                        "window_name": window_name,
                        "viewpoint_name": viewpoint_name,
                        "fields": deduped_fields,
                        "modes": modes,
                    }
                )

    return highlight_bindings


def _parse_zone(zone: ET.Element, *, parent_id: Optional[str] = None) -> Dict[str, Any]:
    zone_spec: Dict[str, Any] = {
        "id": zone.attrib.get("id", ""),
        "name": zone.attrib.get("name", ""),
        "parent_id": parent_id,
        "zone_type": _extract_zone_type(zone),
        "x": zone.attrib.get("x", ""),
        "y": zone.attrib.get("y", ""),
        "w": zone.attrib.get("w", ""),
        "h": zone.attrib.get("h", ""),
        "param": zone.attrib.get("param", ""),
        "show_title": zone.attrib.get("show-title", ""),
        "legend_item_layout": zone.attrib.get("leg-item-layout", ""),
        "pane_specification_id": zone.attrib.get("pane-specification-id", ""),
    }

    zone_type = str(zone_spec.get("zone_type") or "").strip().lower()
    if zone_type == "text":
        formatted_text = _find_first_child(zone, "formatted-text")
        text_runs = _extract_formatted_text_runs(formatted_text)
        zone_spec["text_runs"] = text_runs
        zone_spec["text"] = _compose_zone_text(text_runs)

    zone_style = _find_first_child(zone, "zone-style")
    style_rules: Dict[str, str] = {}
    for format_node in _iter_child_elements(zone_style, "format"):
        attr_name = format_node.attrib.get("attr")
        if not attr_name:
            continue
        style_rules[attr_name] = str(format_node.attrib.get("value", ""))
    if style_rules:
        zone_spec["zone_style"] = style_rules

    children = _iter_child_elements(zone, "zone")
    zone_spec["children"] = [
        _parse_zone(child, parent_id=zone_spec["id"] or parent_id)
        for child in children
    ]
    return zone_spec


def _flatten_zone_tree(zone: Dict[str, Any]) -> List[Dict[str, Any]]:
    flattened: List[Dict[str, Any]] = []
    stack: List[Dict[str, Any]] = [zone]
    while stack:
        current = stack.pop(0)
        flattened.append(
            {
                "id": current.get("id", ""),
                "name": current.get("name", ""),
                "parent_id": current.get("parent_id"),
                "zone_type": current.get("zone_type", ""),
                "x": current.get("x", ""),
                "y": current.get("y", ""),
                "w": current.get("w", ""),
                "h": current.get("h", ""),
                "param": current.get("param", ""),
                "show_title": current.get("show_title", ""),
                "legend_item_layout": current.get("legend_item_layout", ""),
                "pane_specification_id": current.get("pane_specification_id", ""),
                "zone_style": current.get("zone_style", {}),
                "text_runs": current.get("text_runs", []),
                "text": current.get("text", ""),
            }
        )
        for child in current.get("children", []):
            stack.append(child)
    return flattened


def extract_tableau_structured_spec(twb_xml: str) -> Dict[str, Any]:
    if not isinstance(twb_xml, str) or not twb_xml.strip():
        raise ValueError("twb_xml must be a non-empty XML string.")

    root = ET.fromstring(twb_xml)
    if _local_name(root.tag) != "workbook":
        raise ValueError(f"Expected XML root tag 'workbook', got '{_local_name(root.tag)}'.")

    worksheets_root = _find_first_child(root, "worksheets")
    worksheet_specs: List[Dict[str, Any]] = []
    for worksheet in _iter_child_elements(worksheets_root, "worksheet"):
        title_runs = _extract_title_runs(worksheet)
        axis_titles = _parse_axis_titles(worksheet)
        legend_spec = _parse_legend_spec(worksheet)
        worksheet_specs.append(
            {
                "name": worksheet.attrib.get("name", ""),
                "chart_type": _parse_chart_type(worksheet),
                "rows": _parse_rows_or_cols(worksheet, "rows"),
                "cols": _parse_rows_or_cols(worksheet, "cols"),
                "slices": _parse_slices(worksheet),
                "encodings": _parse_encodings(worksheet),
                "reference_lines": _parse_reference_lines(worksheet),
                "style_rule_elements": _parse_style_rule_elements(worksheet),
                "table_calc": _parse_table_calc(worksheet),
                "manual_sort": _parse_manual_sorts(worksheet),
                "filter": _parse_filters(worksheet),
                "title_runs": title_runs,
                "title_text": _compose_title_text(title_runs),
                "axis_titles": axis_titles,
                "legend_spec": legend_spec,
            }
        )

    dashboard_actions = _parse_dashboard_actions(root)
    highlight_bindings = _parse_window_highlights(root)

    dashboards_root = _find_first_child(root, "dashboards")
    dashboard_specs: List[Dict[str, Any]] = []
    dashboard_zones: List[Dict[str, Any]] = []
    dashboard_text_zones: List[Dict[str, Any]] = []
    for dashboard in _iter_child_elements(dashboards_root, "dashboard"):
        size_node = _find_first_child(dashboard, "size")
        zones_root = _find_first_child(dashboard, "zones")
        zone_trees = [_parse_zone(zone_node) for zone_node in _iter_child_elements(zones_root, "zone")]
        flattened_zones: List[Dict[str, Any]] = []
        for zone_tree in zone_trees:
            flattened_zones.extend(_flatten_zone_tree(zone_tree))

        dashboard_name = dashboard.attrib.get("name", "")
        dashboard_specs.append(
            {
                "name": dashboard_name,
                "size": dict(size_node.attrib) if size_node is not None else {},
                "zones": flattened_zones,
            }
        )
        dashboard_zones.append(
            {
                "dashboard_name": dashboard_name,
                "zones": flattened_zones,
            }
        )
        for zone in flattened_zones:
            if not isinstance(zone, dict):
                continue
            if not _is_text_zone(zone):
                continue
            text_value = str(zone.get("text") or "").strip()
            if not text_value:
                continue
            dashboard_text_zones.append(
                {
                    "dashboard_name": dashboard_name,
                    "id": zone.get("id", ""),
                    "x": zone.get("x", ""),
                    "y": zone.get("y", ""),
                    "w": zone.get("w", ""),
                    "h": zone.get("h", ""),
                    "text": text_value,
                    "text_runs": zone.get("text_runs", []),
                }
            )

    return {
        "schema_version": "tableau_spec_v1",
        "workbook": {
            "tag": _local_name(root.tag),
            "attributes": dict(root.attrib),
        },
        "worksheets": worksheet_specs,
        "dashboard_zones": dashboard_zones,
        "dashboard_text_zones": dashboard_text_zones,
        "dashboards": dashboard_specs,
        "dashboard_actions": dashboard_actions,
        "highlight_bindings": highlight_bindings,
        "summary": {
            "worksheet_count": len(worksheet_specs),
            "dashboard_count": len(dashboard_specs),
            "dashboard_text_zone_count": len(dashboard_text_zones),
            "dashboard_action_count": len(dashboard_actions),
            "highlight_binding_count": len(highlight_bindings),
        },
    }


def _contains_token(value: str, token: str) -> bool:
    return token.lower() in str(value or "").lower()


def _extract_filter_member_values(filters: List[Dict[str, Any]]) -> List[str]:
    members: List[str] = []

    def walk(node: Any) -> None:
        if not isinstance(node, dict):
            return
        attributes = node.get("attributes")
        if isinstance(attributes, dict):
            for key in ("member", "from", "to"):
                if key in attributes and attributes[key]:
                    members.append(_normalize_bucket_value(str(attributes[key])))
        children = node.get("children")
        if isinstance(children, list):
            for child in children:
                walk(child)

    for filter_entry in filters:
        if not isinstance(filter_entry, dict):
            continue
        walk(filter_entry.get("expression"))

    return members


def _safe_float(value: Any) -> Optional[float]:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


MEASURE_PREFIXES = {
    "sum",
    "avg",
    "min",
    "max",
    "count",
    "countd",
    "median",
    "stdev",
    "var",
    "pcto",
    "running_sum",
    "window_sum",
}

DIMENSION_PREFIXES = {
    "none",
    "attr",
    "year",
    "quarter",
    "month",
    "week",
    "day",
    "weekday",
    "date",
}

TEMPORAL_TOKEN_PARTS = {
    "year",
    "quarter",
    "month",
    "week",
    "day",
    "weekday",
    "date",
    "yr",
    "qtr",
    "qr",
    "mn",
    "wk",
    "dy",
    "tmn",
    "tyr",
    "tqr",
    "tymd",
}

NON_BAR_MARK_TOKENS = (
    "line",
    "area",
    "pie",
    "map",
    "shape",
    "circle",
    "square",
    "text",
    "polygon",
)


def _normalize_field_token(token: str) -> str:
    text = str(token or "").strip()
    if not text:
        return ""

    # Tableau often prefixes field refs with datasource refs, e.g.
    # `[federated.xxx].[none:Feature:nk]`. Keep the terminal field token.
    segments = _extract_field_tokens(text)
    if segments:
        text = segments[-1]
    if len(text) >= 2 and text[0] == "[" and text[-1] == "]":
        text = text[1:-1]
    return text.strip().lower()


def _field_name_hint(token: str) -> str:
    normalized = _normalize_field_token(token)
    if not normalized:
        return ""

    parts = [part.strip() for part in normalized.split(":") if part.strip()]
    if not parts:
        return normalized

    while parts and parts[-1].isdigit():
        parts.pop()
    if parts and re.fullmatch(r"[a-z]{1,3}k?", parts[-1]):
        parts.pop()
    if parts and parts[0] in MEASURE_PREFIXES.union(DIMENSION_PREFIXES):
        parts.pop(0)

    return ":".join(parts) if parts else normalized


def _axis_field_tokens(axis_spec: Dict[str, Any], raw_text: str) -> List[str]:
    candidates: List[str] = []
    fields = axis_spec.get("fields")
    if isinstance(fields, list):
        for field in fields:
            if isinstance(field, str) and field.strip():
                candidates.append(field)
    if not candidates:
        candidates = _extract_field_tokens(raw_text)

    unique_tokens: List[str] = []
    seen = set()
    for token in candidates:
        normalized = _normalize_field_token(token)
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        unique_tokens.append(normalized)
    return unique_tokens


def _is_quantitative_field_token(token: str) -> bool:
    normalized = _normalize_field_token(token)
    if not normalized:
        return False
    if ":q" in normalized:
        return True
    prefix = normalized.split(":", 1)[0]
    return prefix in MEASURE_PREFIXES


def _is_dimension_field_token(token: str) -> bool:
    normalized = _normalize_field_token(token)
    if not normalized:
        return False
    if any(marker in normalized for marker in (":n", ":o", ":d")):
        return True
    prefix = normalized.split(":", 1)[0]
    if prefix in DIMENSION_PREFIXES:
        return True
    return prefix == "none" and not _is_quantitative_field_token(normalized)


def _is_temporal_field_token(token: str) -> bool:
    normalized = _normalize_field_token(token)
    if not normalized:
        return False
    parts = [part.strip() for part in normalized.split(":") if part.strip()]
    if any(part in TEMPORAL_TOKEN_PARTS for part in parts):
        return True
    return normalized.endswith(":ok") or normalized.endswith(":dk")


def _is_bar_compatible_mark(chart_type: str) -> bool:
    normalized = str(chart_type or "").strip().lower()
    if not normalized:
        return True
    if any(token in normalized for token in NON_BAR_MARK_TOKENS):
        return False
    return True


def _axis_orientation(
    row_tokens: List[str],
    col_tokens: List[str],
    *,
    has_pct_total: bool,
) -> Optional[str]:
    row_has_dimension = any(_is_dimension_field_token(token) for token in row_tokens)
    row_has_measure = any(_is_quantitative_field_token(token) for token in row_tokens)
    col_has_dimension = any(_is_dimension_field_token(token) for token in col_tokens)
    col_has_measure = any(_is_quantitative_field_token(token) for token in col_tokens)

    if row_has_dimension and (col_has_measure or has_pct_total):
        return "horizontal"
    if col_has_dimension and (row_has_measure or has_pct_total):
        return "vertical"
    return None


def _infer_chart_intent(
    *,
    chart_type: str,
    row_tokens: List[str],
    col_tokens: List[str],
    has_pct_total: bool,
    has_series_channel: bool,
    has_boxplot_signal: bool,
    encodings: Optional[Dict[str, Any]] = None,
) -> Tuple[str, Optional[str]]:
    normalized_chart_type = str(chart_type or "").strip().lower()
    encoding_keys = {
        str(key).strip().lower()
        for key in (encodings or {}).keys()
        if str(key).strip()
    }
    row_has_measure = any(_is_quantitative_field_token(token) for token in row_tokens)
    col_has_measure = any(_is_quantitative_field_token(token) for token in col_tokens)
    row_has_temporal = any(_is_temporal_field_token(token) for token in row_tokens)
    col_has_temporal = any(_is_temporal_field_token(token) for token in col_tokens)
    has_treemap_signature = {"size", "color", "text"} <= encoding_keys and not row_tokens and not col_tokens

    if "pie" in normalized_chart_type or "wedge-size" in encoding_keys:
        return "pie_chart", None

    if "treemap" in normalized_chart_type or has_treemap_signature:
        return "custom_tableau_view", None

    # Line chart: only when original mark type is explicitly Line (not Bar) AND has temporal+measure
    is_explicit_line = normalized_chart_type in {"line", "shape"}
    if is_explicit_line and ((col_has_temporal and row_has_measure) or (row_has_temporal and col_has_measure)):
        return "line_chart", None

    if not _is_bar_compatible_mark(chart_type):
        return "custom_tableau_view", None

    orientation = _axis_orientation(row_tokens, col_tokens, has_pct_total=has_pct_total)
    if not orientation:
        return "custom_tableau_view", None

    if has_boxplot_signal:
        return f"{orientation}_box_plot", orientation

    if has_pct_total and has_series_channel:
        return f"{orientation}_stacked_percentage_bar", orientation

    return f"{orientation}_ranked_bar", orientation


def _extract_sort_orders(
    *,
    manual_sort: List[Dict[str, Any]],
    category_field_tokens: List[str],
    series_field_token: str,
) -> Tuple[List[str], List[str]]:
    category_tokens = {_normalize_field_token(token) for token in category_field_tokens if token}
    category_hints = {_field_name_hint(token) for token in category_field_tokens if token}
    series_token_normalized = _normalize_field_token(series_field_token)
    series_hint = _field_name_hint(series_field_token)

    category_order: List[str] = []
    series_order: List[str] = []

    for sort_entry in manual_sort:
        if not isinstance(sort_entry, dict):
            continue
        column_name = str(sort_entry.get("column") or "")
        buckets = sort_entry.get("buckets")
        if not isinstance(buckets, list):
            continue

        normalized_buckets = [str(bucket) for bucket in buckets if str(bucket).strip()]
        if not normalized_buckets:
            continue

        column_token = _normalize_field_token(column_name)
        column_hint = _field_name_hint(column_name)

        is_category_column = (
            column_token in category_tokens
            or (column_hint and column_hint in category_hints)
        )
        is_series_column = (
            bool(series_token_normalized)
            and (
                column_token == series_token_normalized
                or (column_hint and series_hint and column_hint == series_hint)
            )
        )

        if is_category_column and not category_order:
            category_order = normalized_buckets
            continue
        if is_series_column and not series_order:
            series_order = normalized_buckets
            continue

    return category_order, series_order


def _has_box_plot_signature(
    *,
    title_runs: List[Dict[str, Any]],
    reference_lines: List[Dict[str, Any]],
    style_rule_elements: List[str],
) -> bool:
    for style_element in style_rule_elements:
        if str(style_element).strip().lower() == "refboxplot":
            return True

    for ref_line in reference_lines:
        if not isinstance(ref_line, dict):
            continue
        keys = {str(key).strip().lower() for key in ref_line.keys()}
        if "boxplot-whisker-type" in keys or "boxplot-mark-exclusion" in keys:
            return True

    title_text = _compose_title_text(title_runs).lower()
    if "boxplot" in title_text or "box plot" in title_text:
        return True

    return False


def _zone_area(zone: Dict[str, Any]) -> float:
    width = _safe_float(zone.get("w"))
    height = _safe_float(zone.get("h"))
    if width is None or height is None:
        return 0.0
    return max(width, 0.0) * max(height, 0.0)


def _is_color_legend_zone(zone: Dict[str, Any]) -> bool:
    zone_type = str(zone.get("zone_type") or "").strip().lower()
    return zone_type == "color"


def _is_text_zone(zone: Dict[str, Any]) -> bool:
    zone_type = str(zone.get("zone_type") or "").strip().lower()
    return zone_type == "text"


def _is_sheet_zone(zone: Dict[str, Any]) -> bool:
    if not isinstance(zone, dict):
        return False
    if _is_text_zone(zone) or _is_color_legend_zone(zone):
        return False
    zone_type = str(zone.get("zone_type") or "").strip().lower()
    if zone_type in {"bitmap", "filter", "layout-basic", "layout-flow", "title"}:
        return False
    return bool(str(zone.get("name") or "").strip())


def _zone_bounds(zone: Dict[str, Any]) -> Optional[Tuple[float, float, float, float]]:
    x = _safe_float(zone.get("x"))
    y = _safe_float(zone.get("y"))
    w = _safe_float(zone.get("w"))
    h = _safe_float(zone.get("h"))
    if x is None or y is None or w is None or h is None:
        return None
    return x, y, w, h


def _relative_zone_position(anchor_zone: Dict[str, Any], target_zone: Dict[str, Any]) -> str:
    anchor = _zone_bounds(anchor_zone)
    target = _zone_bounds(target_zone)
    if anchor is None or target is None:
        return "unknown"

    anchor_x, anchor_y, anchor_w, anchor_h = anchor
    target_x, target_y, target_w, target_h = target

    anchor_left = anchor_x
    anchor_top = anchor_y
    anchor_right = anchor_x + anchor_w
    anchor_bottom = anchor_y + anchor_h

    target_left = target_x
    target_top = target_y
    target_right = target_x + target_w
    target_bottom = target_y + target_h

    tolerance = max(2.0, min(anchor_w, anchor_h) * 0.01)

    if target_top >= anchor_bottom - tolerance:
        return "below"
    if target_bottom <= anchor_top + tolerance:
        return "above"
    if target_right <= anchor_left + tolerance:
        return "left"
    if target_left >= anchor_right - tolerance:
        return "right"

    horizontal_overlap = not (target_right <= anchor_left or target_left >= anchor_right)
    vertical_overlap = not (target_bottom <= anchor_top or target_top >= anchor_bottom)
    if horizontal_overlap and vertical_overlap:
        return "overlay"

    anchor_cx = anchor_left + (anchor_w / 2.0)
    anchor_cy = anchor_top + (anchor_h / 2.0)
    target_cx = target_left + (target_w / 2.0)
    target_cy = target_top + (target_h / 2.0)
    dx = target_cx - anchor_cx
    dy = target_cy - anchor_cy
    if abs(dx) >= abs(dy):
        return "right" if dx >= 0 else "left"
    return "below" if dy >= 0 else "above"


def _extract_dashboard_canvas_size(dashboard_size: Dict[str, Any]) -> Tuple[Optional[float], Optional[float]]:
    if not isinstance(dashboard_size, dict):
        return None, None

    width = None
    for key in ("maxwidth", "minwidth", "width"):
        width = _safe_float(dashboard_size.get(key))
        if width and width > 0:
            break

    height = None
    for key in ("maxheight", "minheight", "height"):
        height = _safe_float(dashboard_size.get(key))
        if height and height > 0:
            break

    return width, height


def _normalize_zone_coordinates(
    zone: Dict[str, Any],
    *,
    dashboard_width: Optional[float],
    dashboard_height: Optional[float],
) -> Dict[str, float]:
    if dashboard_width is None or dashboard_height is None or dashboard_width <= 0 or dashboard_height <= 0:
        return {}

    x = _safe_float(zone.get("x"))
    y = _safe_float(zone.get("y"))
    w = _safe_float(zone.get("w"))
    h = _safe_float(zone.get("h"))
    if x is None or y is None or w is None or h is None:
        return {}

    return {
        "x_ratio": round(x / dashboard_width, 4),
        "y_ratio": round(y / dashboard_height, 4),
        "w_ratio": round(w / dashboard_width, 4),
        "h_ratio": round(h / dashboard_height, 4),
    }


def _pick_primary_sheet_zone(zones: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not zones:
        return {}
    return max(zones, key=_zone_area)


def _extract_axis_title_strings(axis_titles: Dict[str, Any], scope: str) -> List[str]:
    values = axis_titles.get(scope) if isinstance(axis_titles, dict) else []
    if not isinstance(values, list):
        return []
    titles: List[str] = []
    for item in values:
        if not isinstance(item, dict):
            continue
        title = str(item.get("title") or "").strip()
        if title:
            titles.append(title)
    return titles


def _action_mentions_worksheet(action: Dict[str, Any], worksheet_name: str) -> bool:
    if not isinstance(action, dict):
        return False
    worksheet_name = str(worksheet_name or "").strip()
    if not worksheet_name:
        return False

    source = action.get("source")
    if isinstance(source, dict) and str(source.get("worksheet") or "").strip() == worksheet_name:
        return True

    target = str(action.get("target") or "").strip()
    return target == worksheet_name


def _extract_highlight_fields_for_worksheet(
    highlight_bindings: List[Dict[str, Any]],
    worksheet_name: str,
) -> List[str]:
    fields: List[str] = []
    for binding in highlight_bindings:
        if not isinstance(binding, dict):
            continue
        window_name = str(binding.get("window_name") or "").strip()
        viewpoint_name = str(binding.get("viewpoint_name") or "").strip()
        if worksheet_name not in {window_name, viewpoint_name}:
            continue
        for field in binding.get("fields", []) if isinstance(binding.get("fields"), list) else []:
            field_value = str(field).strip()
            if field_value and field_value not in fields:
                fields.append(field_value)
    return fields


def derive_tableau_render_contract(tableau_spec: Dict[str, Any]) -> Dict[str, Any]:
    worksheets = tableau_spec.get("worksheets") if isinstance(tableau_spec, dict) else []
    dashboards = tableau_spec.get("dashboards") if isinstance(tableau_spec, dict) else []
    dashboard_text_zones = tableau_spec.get("dashboard_text_zones") if isinstance(tableau_spec, dict) else []
    dashboard_actions = tableau_spec.get("dashboard_actions") if isinstance(tableau_spec, dict) else []
    highlight_bindings = tableau_spec.get("highlight_bindings") if isinstance(tableau_spec, dict) else []
    if not isinstance(worksheets, list):
        worksheets = []
    if not isinstance(dashboards, list):
        dashboards = []
    if not isinstance(dashboard_text_zones, list):
        dashboard_text_zones = []
    if not isinstance(dashboard_actions, list):
        dashboard_actions = []
    if not isinstance(highlight_bindings, list):
        highlight_bindings = []

    dashboard_size = {}
    sheet_zones_by_name: Dict[str, List[Dict[str, Any]]] = {}
    legend_zones_by_name: Dict[str, List[Dict[str, Any]]] = {}
    all_zones_by_name: Dict[str, List[Dict[str, Any]]] = {}
    zone_extent_width = 0.0
    zone_extent_height = 0.0
    if dashboards:
        first_dashboard = dashboards[0] if isinstance(dashboards[0], dict) else {}
        size = first_dashboard.get("size")
        dashboard_size = size if isinstance(size, dict) else {}
        zones = first_dashboard.get("zones")
        if isinstance(zones, list):
            for zone in zones:
                if not isinstance(zone, dict):
                    continue
                if _is_text_zone(zone):
                    text_value = str(zone.get("text") or "").strip()
                    if text_value:
                        dashboard_text_zones.append(
                            {
                                "dashboard_name": str(first_dashboard.get("name") or ""),
                                "id": zone.get("id", ""),
                                "x": zone.get("x", ""),
                                "y": zone.get("y", ""),
                                "w": zone.get("w", ""),
                                "h": zone.get("h", ""),
                                "text": text_value,
                                "text_runs": zone.get("text_runs", []),
                            }
                        )
                bounds = _zone_bounds(zone)
                if bounds is not None:
                    x, y, w, h = bounds
                    zone_extent_width = max(zone_extent_width, x + w)
                    zone_extent_height = max(zone_extent_height, y + h)
                name = str(zone.get("name") or "").strip()
                if name:
                    all_zones_by_name.setdefault(name, []).append(zone)
                    if _is_color_legend_zone(zone):
                        legend_zones_by_name.setdefault(name, []).append(zone)
                    else:
                        sheet_zones_by_name.setdefault(name, []).append(zone)
        referenced_worksheet_names = {
            str(zone.get("name") or "").strip()
            for zone_list in sheet_zones_by_name.values()
            for zone in zone_list
            if _is_sheet_zone(zone)
        }
    else:
        referenced_worksheet_names = set()
    has_any_legend_zone = any(bool(items) for items in legend_zones_by_name.values())
    dashboard_width, dashboard_height = _extract_dashboard_canvas_size(dashboard_size)
    if (
        dashboard_width is None
        or dashboard_height is None
        or (zone_extent_width > 0 and dashboard_width > 0 and zone_extent_width > dashboard_width * 2.0)
        or (zone_extent_height > 0 and dashboard_height > 0 and zone_extent_height > dashboard_height * 2.0)
    ):
        if zone_extent_width > 0:
            dashboard_width = zone_extent_width
        if zone_extent_height > 0:
            dashboard_height = zone_extent_height

    deduped_text_zones: List[Dict[str, Any]] = []
    seen_text_zone_keys = set()
    for zone in dashboard_text_zones:
        if not isinstance(zone, dict):
            continue
        key = (
            str(zone.get("dashboard_name") or ""),
            str(zone.get("id") or ""),
            str(zone.get("x") or ""),
            str(zone.get("y") or ""),
            str(zone.get("w") or ""),
            str(zone.get("h") or ""),
            str(zone.get("text") or ""),
        )
        if key in seen_text_zone_keys:
            continue
        seen_text_zone_keys.add(key)
        deduped_text_zones.append(zone)
    dashboard_text_zones = deduped_text_zones

    worksheet_contracts: List[Dict[str, Any]] = []
    intent_counts: Dict[str, int] = {}
    legend_required_worksheets: List[str] = []
    legend_anchor_positions: Dict[str, str] = {}
    axis_title_worksheets: List[str] = []
    highlight_action_worksheets: List[str] = []
    for worksheet in worksheets:
        if not isinstance(worksheet, dict):
            continue

        name = str(worksheet.get("name") or "").strip()
        if referenced_worksheet_names and name not in referenced_worksheet_names:
            continue
        chart_type = str(worksheet.get("chart_type") or "")
        rows = worksheet.get("rows") if isinstance(worksheet.get("rows"), dict) else {}
        cols = worksheet.get("cols") if isinstance(worksheet.get("cols"), dict) else {}
        encodings = worksheet.get("encodings") if isinstance(worksheet.get("encodings"), dict) else {}
        manual_sort = worksheet.get("manual_sort") if isinstance(worksheet.get("manual_sort"), list) else []
        filters = worksheet.get("filter") if isinstance(worksheet.get("filter"), list) else []
        table_calc = worksheet.get("table_calc") if isinstance(worksheet.get("table_calc"), list) else []
        reference_lines = worksheet.get("reference_lines") if isinstance(worksheet.get("reference_lines"), list) else []
        style_rule_elements = worksheet.get("style_rule_elements") if isinstance(worksheet.get("style_rule_elements"), list) else []
        title_runs = worksheet.get("title_runs") if isinstance(worksheet.get("title_runs"), list) else []
        axis_titles = worksheet.get("axis_titles") if isinstance(worksheet.get("axis_titles"), dict) else {}
        legend_spec = worksheet.get("legend_spec") if isinstance(worksheet.get("legend_spec"), dict) else {}

        rows_raw = str(rows.get("raw") or "")
        cols_raw = str(cols.get("raw") or "")
        slices = worksheet.get("slices") if isinstance(worksheet.get("slices"), list) else []
        color_encoding: Dict[str, str] = {}
        color_entries = encodings.get("color")
        if isinstance(color_entries, list) and color_entries and isinstance(color_entries[0], dict):
            entry = color_entries[0]
            field = str(entry.get("column") or "")
            palette = str(entry.get("palette") or "")
            palette_type = str(entry.get("type") or "")
            if field:
                color_encoding = {"field": field}
                if palette:
                    color_encoding["palette"] = palette
                if palette_type:
                    color_encoding["type"] = palette_type
        color_field = color_encoding.get("field", "")

        row_tokens = _axis_field_tokens(rows, rows_raw)
        col_tokens = _axis_field_tokens(cols, cols_raw)
        has_pct_total = any(_normalize_field_token(token).startswith("pcto:") for token in row_tokens + col_tokens) or any(
            isinstance(tc, dict) and _contains_token(str(tc.get("type") or ""), "PctTotal")
            for tc in table_calc
        )
        has_boxplot_signal = _has_box_plot_signature(
            title_runs=title_runs,
            reference_lines=reference_lines,
            style_rule_elements=style_rule_elements,
        )
        series_field = color_field or (slices[0] if slices else "")
        chart_intent, orientation = _infer_chart_intent(
            chart_type=chart_type,
            row_tokens=row_tokens,
            col_tokens=col_tokens,
            has_pct_total=has_pct_total,
            has_series_channel=bool(series_field),
            has_boxplot_signal=has_boxplot_signal,
            encodings=encodings,
        )

        category_field_tokens = col_tokens if orientation == "vertical" else row_tokens
        category_order, series_order = _extract_sort_orders(
            manual_sort=manual_sort,
            category_field_tokens=category_field_tokens,
            series_field_token=series_field,
        )

        filter_members = _extract_filter_member_values(filters)

        zone_candidates = sheet_zones_by_name.get(name) or all_zones_by_name.get(name) or []
        zone = _pick_primary_sheet_zone(zone_candidates)
        zone_normalized = _normalize_zone_coordinates(
            zone,
            dashboard_width=dashboard_width,
            dashboard_height=dashboard_height,
        )
        legend_zones = legend_zones_by_name.get(name, [])
        legend_zone = _pick_primary_sheet_zone(legend_zones)
        legend_zone_normalized = _normalize_zone_coordinates(
            legend_zone,
            dashboard_width=dashboard_width,
            dashboard_height=dashboard_height,
        )
        legend_relative_position = (
            _relative_zone_position(zone, legend_zone) if zone and legend_zone else "unknown"
        )
        w = _safe_float(zone.get("w"))
        h = _safe_float(zone.get("h"))
        zone_aspect_ratio = round(w / h, 4) if (w and h and h != 0) else None

        axis_title_rows = _extract_axis_title_strings(axis_titles, "rows")
        axis_title_cols = _extract_axis_title_strings(axis_titles, "cols")

        legend_fields = legend_spec.get("legend_fields") if isinstance(legend_spec.get("legend_fields"), list) else []
        legend_field = ""
        for legend_zone in legend_zones:
            candidate = str(legend_zone.get("param") or "").strip()
            if candidate:
                legend_field = candidate
                break
        if not legend_field:
            for candidate in legend_fields:
                text = str(candidate).strip()
                if text:
                    legend_field = text
                    break
        legend_required = bool(legend_zones)
        if not dashboards or not has_any_legend_zone:
            legend_required = legend_required or bool(legend_spec.get("has_legend_rule"))
        legend_item_layout = ""
        if legend_zones:
            legend_item_layout = str(legend_zones[0].get("legend_item_layout") or "")

        worksheet_actions = [
            action for action in dashboard_actions if _action_mentions_worksheet(action, name)
        ]
        highlight_fields = _extract_highlight_fields_for_worksheet(highlight_bindings, name)

        fidelity_rules: List[str] = [
            "Preserve title wording and emphasis from title_runs.",
            "Preserve full category labels; no clipped leading/trailing characters.",
            "Use dynamic chart margins so axis labels are fully visible.",
        ]
        if axis_title_rows or axis_title_cols:
            fidelity_rules.append("Render axis titles exactly as defined in the Tableau axis style rules.")
        if chart_intent in {"horizontal_stacked_percentage_bar", "vertical_stacked_percentage_bar"}:
            orientation_label = "horizontal" if chart_intent.startswith("horizontal_") else "vertical"
            fidelity_rules.extend(
                [
                    f"Render one {orientation_label} stacked bar per category.",
                    "Normalize each category bar to 100%.",
                    "Aggregate by series_field so each category has one segment per series category.",
                    "Do not reinterpret stacked-percentage bars as heatmap/table matrices or grouped bars.",
                ]
            )
            if series_order:
                fidelity_rules.append("Render stacked segment order exactly as series_order.")
        if chart_intent in {"horizontal_ranked_bar", "vertical_ranked_bar"}:
            fidelity_rules.append("Sort bars descending by displayed measure unless manual_sort dictates otherwise.")
        if chart_intent in {"horizontal_box_plot", "vertical_box_plot"}:
            orientation_label = "horizontal" if chart_intent.startswith("horizontal_") else "vertical"
            fidelity_rules.extend(
                [
                    f"Render {orientation_label} box-and-whisker plots per category.",
                    "Compute quartiles/median/whiskers from row-level records after filters, not from pre-aggregated sums.",
                    "Do not reinterpret box-plot worksheets as ranked/stacked bars.",
                ]
            )
        if legend_required:
            fidelity_rules.append("Render the worksheet legend in the dashboard with the same category mapping.")
            if legend_relative_position != "unknown":
                fidelity_rules.append(
                    f"Keep legend anchored {legend_relative_position} the worksheet based on dashboard zones; avoid global legend hoisting."
                )
        if worksheet_actions or highlight_fields:
            fidelity_rules.append(
                "Preserve on-select highlight interactions and keep auto-clear behavior for selection state."
            )

        intent_counts[chart_intent] = intent_counts.get(chart_intent, 0) + 1
        if legend_required and name:
            legend_required_worksheets.append(name)
            legend_anchor_positions[name] = legend_relative_position
        if (axis_title_rows or axis_title_cols) and name:
            axis_title_worksheets.append(name)
        if (worksheet_actions or highlight_fields) and name:
            highlight_action_worksheets.append(name)

        worksheet_contracts.append(
            {
                "name": name,
                "dashboard_name": str(first_dashboard.get("name") or ""),
                "chart_intent": chart_intent,
                "rows_field": rows_raw,
                "cols_field": cols_raw,
                "series_field": series_field,
                "slices": slices,
                "bar_orientation": orientation or "unknown",
                "category_order": category_order,
                "series_order": series_order,
                "stacking": {
                    "normalized_to_percent": chart_intent in {"horizontal_stacked_percentage_bar", "vertical_stacked_percentage_bar"},
                    "aggregate_by_series_field": chart_intent in {"horizontal_stacked_percentage_bar", "vertical_stacked_percentage_bar"},
                    "expected_series_values": series_order,
                },
                "filter_members": filter_members,
                "color_encoding": color_encoding if color_encoding else None,
                "title_runs": title_runs,
                "axis_title_rows": axis_title_rows,
                "axis_title_cols": axis_title_cols,
                "legend": {
                    "required": legend_required,
                    "field": legend_field,
                    "layout": legend_item_layout,
                    "title": str(legend_spec.get("legend_title") or ""),
                    "zone": {
                        "x": legend_zone.get("x", ""),
                        "y": legend_zone.get("y", ""),
                        "w": legend_zone.get("w", ""),
                        "h": legend_zone.get("h", ""),
                        "relative_position": legend_relative_position,
                        "normalized": legend_zone_normalized,
                    },
                },
                "interaction": {
                    "actions": worksheet_actions,
                    "highlight_fields": highlight_fields,
                },
                "zone": {
                    "x": zone.get("x", ""),
                    "y": zone.get("y", ""),
                    "w": zone.get("w", ""),
                    "h": zone.get("h", ""),
                    "aspect_ratio": zone_aspect_ratio,
                    "normalized": zone_normalized,
                },
                "fidelity_rules": fidelity_rules,
            }
        )

    return {
        "schema_version": "tableau_render_contract_v1",
        "dashboard_size": dashboard_size,
        "worksheets": worksheet_contracts,
        "dashboard_text_zones": dashboard_text_zones,
        "dashboard_actions": dashboard_actions,
        "highlight_bindings": highlight_bindings,
        "summary": {
            "worksheet_count": len(worksheet_contracts),
            "dashboard_text_zone_count": len(dashboard_text_zones),
            "intent_counts": intent_counts,
            "stacked_percentage_worksheets": [
                str(ws.get("name") or "Unnamed Worksheet")
                for ws in worksheet_contracts
                if isinstance(ws, dict) and str(ws.get("chart_intent") or "").endswith("_stacked_percentage_bar")
            ],
            "legend_required_worksheets": legend_required_worksheets,
            "legend_anchor_positions": legend_anchor_positions,
            "axis_title_worksheets": axis_title_worksheets,
            "interaction_worksheets": highlight_action_worksheets,
            "dashboard_action_count": len(dashboard_actions),
            "highlight_binding_count": len(highlight_bindings),
        },
    }


def build_tableau_render_contract_prompt_block(
    contract: Dict[str, Any],
    *,
    contract_path: Optional[str] = None,
) -> str:
    worksheets = contract.get("worksheets")
    if not isinstance(worksheets, list):
        worksheets = []
    dashboard_text_zones = contract.get("dashboard_text_zones")
    if not isinstance(dashboard_text_zones, list):
        dashboard_text_zones = []
    lines: List[str] = [
        "## Tableau Render Contract (Authoritative)",
        "The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.",
    ]
    if contract_path:
        lines.append(f"Contract file path: `{contract_path}`")
    lines.extend(
        [
            "- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.",
            "- If prose sections conflict with this contract, this contract wins.",
            "- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).",
            "- Ensure long titles are wrapped or laid out without text truncation.",
            "- Render legends and axis titles when required by the contract.",
            "- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.",
            "- Reproduce Tableau highlight/filter actions from the interaction contract.",
        ]
    )

    for worksheet in worksheets:
        if not isinstance(worksheet, dict):
            continue
        name = str(worksheet.get("name") or "Unnamed Worksheet")
        chart_intent = str(worksheet.get("chart_intent") or "custom_tableau_view")
        lines.append(f"### Worksheet: {name}")
        lines.append(f"- chart_intent: `{chart_intent}`")
        lines.append(f"- rows_field: `{worksheet.get('rows_field', '')}`")
        lines.append(f"- cols_field: `{worksheet.get('cols_field', '')}`")
        series_field = worksheet.get("series_field")
        if series_field:
            lines.append(f"- series_field: `{series_field}`")
        bar_orientation = worksheet.get("bar_orientation")
        if isinstance(bar_orientation, str) and bar_orientation and bar_orientation != "unknown":
            lines.append(f"- bar_orientation: `{bar_orientation}`")

        category_order = worksheet.get("category_order")
        if isinstance(category_order, list) and category_order:
            lines.append(f"- category_order: {', '.join(str(item) for item in category_order)}")
        series_order = worksheet.get("series_order")
        if isinstance(series_order, list) and series_order:
            lines.append(f"- series_order: {', '.join(str(item) for item in series_order)}")
        stacking = worksheet.get("stacking")
        if isinstance(stacking, dict):
            if stacking.get("normalized_to_percent"):
                lines.append("- stacking_normalized_to_percent: true")
            if stacking.get("aggregate_by_series_field"):
                lines.append("- aggregate_by_series_field: true")
            expected_series_values = stacking.get("expected_series_values")
            if isinstance(expected_series_values, list) and expected_series_values:
                lines.append(f"- expected_series_values: {', '.join(str(item) for item in expected_series_values)}")
        axis_title_rows = worksheet.get("axis_title_rows")
        if isinstance(axis_title_rows, list) and axis_title_rows:
            lines.append(f"- axis_title_rows: {', '.join(str(item) for item in axis_title_rows)}")
        axis_title_cols = worksheet.get("axis_title_cols")
        if isinstance(axis_title_cols, list) and axis_title_cols:
            lines.append(f"- axis_title_cols: {', '.join(str(item) for item in axis_title_cols)}")
        zone = worksheet.get("zone")
        if isinstance(zone, dict):
            zone_x = zone.get("x", "")
            zone_y = zone.get("y", "")
            zone_w = zone.get("w", "")
            zone_h = zone.get("h", "")
            if any(str(value).strip() for value in (zone_x, zone_y, zone_w, zone_h)):
                lines.append(f"- zone: x={zone_x}, y={zone_y}, w={zone_w}, h={zone_h}")
        legend = worksheet.get("legend")
        if isinstance(legend, dict):
            if legend.get("required"):
                lines.append("- legend_required: true")
            legend_field = str(legend.get("field") or "").strip()
            if legend_field:
                lines.append(f"- legend_field: `{legend_field}`")
            legend_title = str(legend.get("title") or "").strip()
            if legend_title:
                lines.append(f"- legend_title: {legend_title}")
            legend_zone = legend.get("zone")
            if isinstance(legend_zone, dict):
                relative_position = str(legend_zone.get("relative_position") or "").strip()
                if relative_position and relative_position != "unknown":
                    lines.append(f"- legend_relative_position: {relative_position}")
        interaction = worksheet.get("interaction")
        if isinstance(interaction, dict):
            highlight_fields = interaction.get("highlight_fields")
            if isinstance(highlight_fields, list) and highlight_fields:
                lines.append(f"- highlight_fields: {', '.join(str(item) for item in highlight_fields)}")

        fidelity_rules = worksheet.get("fidelity_rules")
        if isinstance(fidelity_rules, list):
            for rule in fidelity_rules:
                lines.append(f"- rule: {rule}")

    if dashboard_text_zones:
        lines.append("## Dashboard Text Zones")
        for text_zone in dashboard_text_zones[:20]:
            if not isinstance(text_zone, dict):
                continue
            text = str(text_zone.get("text") or "").strip()
            if not text:
                continue
            compact_text = re.sub(r"\s+", " ", text.replace("\n", " ")).strip()
            x = text_zone.get("x", "")
            y = text_zone.get("y", "")
            w = text_zone.get("w", "")
            h = text_zone.get("h", "")
            lines.append(f"- zone(x={x}, y={y}, w={w}, h={h}): {compact_text}")

    dashboard_actions = contract.get("dashboard_actions")
    if isinstance(dashboard_actions, list) and dashboard_actions:
        lines.append("## Dashboard Actions")
        for action in dashboard_actions[:20]:
            if not isinstance(action, dict):
                continue
            caption = str(action.get("caption") or action.get("name") or "Unnamed Action")
            kind = str(action.get("kind") or "custom_action")
            source = action.get("source")
            source_worksheet = ""
            if isinstance(source, dict):
                source_worksheet = str(source.get("worksheet") or source.get("dashboard") or "")
            target = str(action.get("target") or "")
            fields = action.get("field_captions")
            field_text = ", ".join(str(item) for item in fields) if isinstance(fields, list) and fields else ""
            lines.append(f"- {caption}: kind={kind}, source={source_worksheet or 'unknown'}, target={target or 'unknown'}")
            if field_text:
                lines.append(f"  fields: {field_text}")

    highlight_bindings = contract.get("highlight_bindings")
    if isinstance(highlight_bindings, list) and highlight_bindings:
        lines.append("## Highlight Bindings")
        for binding in highlight_bindings[:20]:
            if not isinstance(binding, dict):
                continue
            viewpoint_name = str(binding.get("viewpoint_name") or binding.get("window_name") or "unknown")
            fields = binding.get("fields")
            field_text = ", ".join(str(item) for item in fields) if isinstance(fields, list) and fields else "none"
            lines.append(f"- {viewpoint_name}: {field_text}")

    return "\n".join(lines).strip()


def _openai_client() -> Tuple[openai.OpenAI, str]:
    load_dotenv()
    api_key = os.getenv("LLM_KEY")
    model = os.getenv("MODEL_NAME")
    base_url = os.getenv("LLM_BASE_URL")

    if not api_key:
        raise RuntimeError("LLM_KEY not found in environment; cannot run Tableau requirement generator.")
    if not model:
        raise RuntimeError("MODEL_NAME not found in environment; cannot run Tableau requirement generator.")
    if openai is None:
        raise RuntimeError("openai package not installed; cannot run Tableau requirement generator.")

    client = openai.OpenAI(api_key=api_key, base_url=base_url) if base_url else openai.OpenAI(api_key=api_key)
    return client, model


def generate_tableau_requirements_template(
    twb_xml: str,
    *,
    primary_data_url: Optional[str],
    data_files_manifest: List[Dict[str, Any]],
    max_tokens: int = 8192,
) -> Dict[str, Any]:
    """
    Call the LLM to produce an enriched prompt template that includes {{SAMPLE_DATA}}.
    Post-processing (sample injection, file copying) happens outside this function.
    """
    logger.info("[Tableau Requirement Agent] Generating Tableau requirements template...")

    client, model = _openai_client()

    data_manifest_json = json.dumps(data_files_manifest, ensure_ascii=False, indent=2)
    primary_line = primary_data_url or "(none)"

    user_prompt = f"""You will be given:
1) A Tableau .twb workbook XML.
2) A list of dataset files that will be present under public/data and fetchable from /data/...

Your task:
- Produce an implementation-ready specification to recreate the Tableau dashboard(s) in React + TypeScript.
- Layout and visualization MUST follow the workbook definition as closely as possible.
- Explicitly map each Tableau worksheet to a React component, and each dashboard container to layout primitives (CSS Grid/Flex).
- Choose a charting approach that works well in React using D3-first implementations. If a chart type is not supported directly, describe a faithful approximation.
- Describe interactions (filters/parameters) and how they are wired to chart/table components.
- Include a "Data Loading" section with fetch() examples to load the full data from the provided URL(s).
- Include a "Sample Data" section with a JSON code block containing ONLY the placeholder token {SAMPLE_DATA_PLACEHOLDER}.

Primary data URL (recommended default to load first): {primary_line}

Available data files manifest (JSON):
{data_manifest_json}

Tableau workbook (.twb XML):
{twb_xml}
"""

    messages = [
        {"role": "system", "content": TABLEAU_REQUIREMENT_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    response_content = get_complete_llm_response(messages, model, client, max_attempts=3, max_tokens=max_tokens)
    analysis = extract_json_from_llm_output(response_content)
    if not isinstance(analysis, dict):
        raise ValueError(f"Expected dict JSON from Tableau requirement agent; got {type(analysis).__name__}")
    return analysis


def prepare_tableau_data_assets(
    tableau_input_dir: Path,
    *,
    output_dir: Path,
    sample_rows: int = 10,
) -> Dict[str, Any]:
    """
    Copy full data files from <tableau_input_dir>/data into <output_dir>/public/data and return:
    - data_files_manifest: [{relative_path, fetch_url, size_bytes, ext}]
    - primary_data_url: chosen best default URL
    - sample_data_json: pretty-printed JSON for sample injection
    """
    data_dir = tableau_input_dir / "data"
    public_data_dir = output_dir / "public" / "data"
    public_data_dir.mkdir(parents=True, exist_ok=True)

    data_files: List[Path] = []
    if data_dir.exists() and data_dir.is_dir():
        data_files = [p for p in data_dir.rglob("*") if p.is_file()]

    manifest: List[Dict[str, Any]] = []
    used_public_paths: set[str] = set()
    for src in sorted(data_files):
        rel = src.relative_to(data_dir).as_posix()
        public_rel = _sanitize_public_data_relative_path(rel, used_public_paths)
        dest = public_data_dir / public_rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
        fetch_url = f"/data/{quote(public_rel, safe='/')}"
        try:
            size_bytes = src.stat().st_size
        except OSError:
            size_bytes = 0
        manifest.append(
            {
                "relative_path": public_rel,
                "fetch_url": fetch_url,
                "ext": src.suffix.lower().lstrip("."),
                "size_bytes": size_bytes,
                "source_relative_path": rel,
            }
        )

    primary_entry = _choose_primary_data_entry(manifest)
    primary_url = primary_entry["fetch_url"] if primary_entry else None

    sample_json = "[]"
    if primary_entry:
        src_path = data_dir / str(primary_entry.get("source_relative_path") or primary_entry["relative_path"])
        sample_rows_obj = _sample_data_file(src_path, sample_rows=sample_rows)
        sample_json = json.dumps(sample_rows_obj, ensure_ascii=False, indent=2)

    return {
        "data_files_manifest": manifest,
        "primary_data_url": primary_url,
        "sample_data_json": sample_json,
        "public_data_dir": str(public_data_dir),
    }


def post_process_tableau_prompt(
    prompt_template: str,
    *,
    sample_data_json: str,
    primary_data_url: Optional[str],
    data_files_manifest: List[Dict[str, Any]],
) -> str:
    """
    Inject sample data and ensure fetch guidance exists in the final prompt.
    """
    if not isinstance(prompt_template, str):
        prompt_template = str(prompt_template)

    if SAMPLE_DATA_PLACEHOLDER in prompt_template:
        enriched = prompt_template.replace(SAMPLE_DATA_PLACEHOLDER, sample_data_json)
    else:
        enriched = prompt_template.strip() + "\n\n" + _default_sample_data_section(sample_data_json)

    if "fetch(" not in enriched and "fetch (" not in enriched:
        enriched = enriched.strip() + "\n\n" + _default_data_loading_section(primary_data_url, data_files_manifest)

    if data_files_manifest:
        urls = [str(item.get("fetch_url") or "") for item in data_files_manifest if item.get("fetch_url")]
        if urls and not any(url in enriched for url in urls[:5]):
            enriched = enriched.strip() + "\n\n" + _authoritative_data_files_section(primary_data_url, data_files_manifest)

    return enriched.strip()


def _choose_primary_data_entry(manifest: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not manifest:
        return None

    def rank(entry: Dict[str, Any]) -> Tuple[int, int, str]:
        ext = str(entry.get("ext") or "").lower()
        ext_rank = 0
        if ext == "csv":
            ext_rank = 3
        elif ext == "json":
            ext_rank = 2
        elif ext:
            ext_rank = 1
        size = int(entry.get("size_bytes") or 0)
        name = str(entry.get("relative_path") or "")
        return (ext_rank, size, name)

    return max(manifest, key=rank)


def _sanitize_public_data_part(value: str, *, fallback: str) -> str:
    text = str(value or "").strip()
    if not text:
        return fallback
    text = re.sub(r"[^A-Za-z0-9._-]+", "_", text)
    text = re.sub(r"_+", "_", text)
    text = text.strip("._-")
    return text or fallback


def _sanitize_public_data_relative_path(rel_path: str, used_paths: set[str]) -> str:
    parts = [part for part in Path(rel_path).as_posix().split("/") if part and part != "."]
    if not parts:
        parts = ["data_file"]

    sanitized_parts: List[str] = []
    for index, part in enumerate(parts):
        is_last = index == len(parts) - 1
        if is_last:
            raw_path = Path(part)
            suffix = raw_path.suffix
            stem = raw_path.name[:-len(suffix)] if suffix else raw_path.name
            sanitized_stem = _sanitize_public_data_part(stem, fallback="file")
            sanitized_suffix = re.sub(r"[^A-Za-z0-9.]+", "", suffix)
            if sanitized_suffix and not sanitized_suffix.startswith("."):
                sanitized_suffix = f".{sanitized_suffix}"
            sanitized_parts.append(f"{sanitized_stem}{sanitized_suffix}")
        else:
            sanitized_parts.append(_sanitize_public_data_part(part, fallback=f"dir{index + 1}"))

    candidate = "/".join(sanitized_parts)
    if candidate not in used_paths:
        used_paths.add(candidate)
        return candidate

    path_obj = Path(candidate)
    suffix = path_obj.suffix
    stem = candidate[:-len(suffix)] if suffix else candidate
    counter = 2
    while True:
        deduped = f"{stem}_{counter}{suffix}"
        if deduped not in used_paths:
            used_paths.add(deduped)
            return deduped
        counter += 1


def _sample_data_file(path: Path, *, sample_rows: int) -> List[Dict[str, Any]]:
    suffix = path.suffix.lower()
    if suffix == ".csv":
        return _sample_csv(path, sample_rows=sample_rows)
    if suffix == ".json":
        return _sample_json(path, sample_rows=sample_rows)
    # Best-effort: return empty sample for unknown formats.
    return []


def _sample_csv(path: Path, *, sample_rows: int) -> List[Dict[str, Any]]:
    reservoir: List[Dict[str, Any]] = []
    with path.open("r", encoding="utf-8", errors="replace", newline="") as handle:
        sample = handle.read(4096)
        handle.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample)
        except Exception:
            dialect = csv.excel
        reader = csv.DictReader(handle, dialect=dialect)

        for idx, row in enumerate(reader):
            cleaned = {k: _coerce_scalar(v) for k, v in row.items()} if isinstance(row, dict) else {}
            if idx < sample_rows:
                reservoir.append(cleaned)
                continue
            j = random.randint(0, idx)
            if j < sample_rows:
                reservoir[j] = cleaned
    return reservoir


def _sample_json(path: Path, *, sample_rows: int) -> List[Dict[str, Any]]:
    try:
        with path.open("r", encoding="utf-8", errors="replace") as handle:
            data = json.load(handle)
    except Exception:
        return []

    if isinstance(data, list):
        if not data:
            return []
        if len(data) <= sample_rows:
            return [_normalize_json_row(item) for item in data]
        picks = random.sample(data, k=sample_rows)
        return [_normalize_json_row(item) for item in picks]

    if isinstance(data, dict):
        # If dict of records, sample values.
        values = list(data.values())
        if not values:
            return []
        if len(values) <= sample_rows:
            return [_normalize_json_row(item) for item in values]
        picks = random.sample(values, k=sample_rows)
        return [_normalize_json_row(item) for item in picks]

    return []


def _normalize_json_row(item: Any) -> Dict[str, Any]:
    if isinstance(item, dict):
        return {str(k): _coerce_scalar(v) for k, v in item.items()}
    return {"value": _coerce_scalar(item)}


def _coerce_scalar(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, (int, float, bool)):
        return value
    text = str(value).strip()
    if text == "":
        return ""
    lower = text.lower()
    if lower in ("null", "none", "nan"):
        return None
    if lower in ("true", "false"):
        return lower == "true"
    try:
        if "." in text:
            return float(text)
        return int(text)
    except Exception:
        return text


def _default_sample_data_section(sample_data_json: str) -> str:
    return f"""## Sample Data (10 rows)
```json
{sample_data_json}
```"""


def _default_data_loading_section(
    primary_data_url: Optional[str],
    data_files_manifest: List[Dict[str, Any]],
) -> str:
    file_lines = "\n".join(f"- {item.get('fetch_url')}" for item in data_files_manifest[:20] if item.get("fetch_url"))
    url = primary_data_url or (data_files_manifest[0]["fetch_url"] if data_files_manifest else "/data/<your-file>")
    return f"""## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
{file_lines or "- (no data files found)"}

Example (CSV via fetch):
```ts
async function loadCsv(url: string) {{
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${{url}}: ${{res.status}}`);
  const csvText = await res.text();
  // Prefer a robust CSV parser (e.g. PapaParse) for production; keep a minimal parser if needed.
  const [headerLine, ...lines] = csvText.split(/\\r?\\n/).filter(Boolean);
  const headers = headerLine.split(\",\").map((h) => h.trim());
  return lines.map((line) => {{
    const cells = line.split(\",\");
    const row: Record<string, string> = {{}};
    headers.forEach((h, i) => (row[h] = (cells[i] ?? \"\").trim()));
    return row;
  }});
}}

// Default entrypoint
const rows = await loadCsv(\"{url}\");
```
"""


def _authoritative_data_files_section(
    primary_data_url: Optional[str],
    data_files_manifest: List[Dict[str, Any]],
) -> str:
    url = primary_data_url or (data_files_manifest[0]["fetch_url"] if data_files_manifest else "/data/<your-file>")
    file_lines = "\n".join(f"- {item.get('fetch_url')}" for item in data_files_manifest[:20] if item.get("fetch_url"))
    return f"""## Data Files (Authoritative)
Primary (recommended) URL: `{url}`

All available files under `/data/...`:
{file_lines or "- (no data files found)"}
"""


__all__ = [
    "SAMPLE_DATA_PLACEHOLDER",
    "TABLEAU_REQUIREMENT_SYSTEM_PROMPT",
    "build_tableau_render_contract_prompt_block",
    "derive_tableau_render_contract",
    "extract_tableau_structured_spec",
    "generate_tableau_requirements_template",
    "prepare_tableau_data_assets",
    "post_process_tableau_prompt",
]
