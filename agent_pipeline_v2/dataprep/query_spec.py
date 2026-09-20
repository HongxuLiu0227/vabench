"""WIS worksheet → query spec (数据订单) derivation.

The derivation is a *translation*, not inference: every entry in the spec can be
traced back to a WIS field (shelf field refs, filter trees, encodings).
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

__all__ = ["derive_query_spec", "derive_view_specs"]

# derivation → aggregate op understood by engine.py
AGG_OPS = {
    "Sum": "sum",
    "Avg": "avg",
    "Count": "count",
    "CountD": "countd",
    "Min": "min",
    "Max": "max",
    "Median": "median",
    "Cumulative": "cumulative",
    "PercentOfTotal": "pcto",
}

# derivations that produce date-part / date-trunc group keys
DATE_PART_DERIVATIONS = {
    "Year": "year", "Quarter": "quarter", "Month": "month", "Day": "day",
    "Hour": "hour", "Week": "week", "Weekday": "weekday", "MDY": "mdy",
}
DATE_TRUNC_CODES = {
    "tyr": "year", "tqr": "quarter", "tmn": "month", "twk": "week", "tdy": "day", "thr": "hour",
}

# "count of records" pseudo-field:  cnt:<csv-stem>.csv_<hex>  — Tableau generates
# it for row counts of an extract; there is no such column in the CSV
_COUNT_PSEUDO_RE = re.compile(r"\.csv_[0-9a-f]{8,}$", re.IGNORECASE)


def _is_count_pseudo_field(name: str) -> bool:
    return bool(_COUNT_PSEUDO_RE.search(name or ""))

ROW_LEVEL_MARKS = {"circle", "map"}   # scatter / symbol map need raw rows


def _slug(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", name.strip().lower()).strip("_")
    return slug or "view"


def _is_measure(field: Dict[str, Any]) -> bool:
    return field.get("field_type") == "quantitative" or field.get("derivation") in AGG_OPS


def _date_key(field: Dict[str, Any]) -> Optional[Dict[str, str]]:
    """If the field is a date part/trunc derivation, return the group-key spec."""
    deriv = field.get("derivation")
    if deriv in DATE_PART_DERIVATIONS:
        return {"field": field["name"], "date_part": DATE_PART_DERIVATIONS[deriv]}
    code = field.get("derivation_code") or ""
    if code in DATE_TRUNC_CODES:
        return {"field": field["name"], "date_trunc": DATE_TRUNC_CODES[code]}
    return None


def _walk_shelf_fields(tree: Dict[str, Any]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    if tree.get("op") == "field" and isinstance(tree.get("field"), dict):
        out.append(tree["field"])
    for child in tree.get("children") or []:
        out.extend(_walk_shelf_fields(child))
    return out


def _translate_filter(flt: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Translate a WIS filter into a spec filter; None means 'skip' (no-op or
    action-linked, which belongs to interaction wiring, not the data order)."""
    if flt.get("linked_action"):
        return None
    column = flt.get("column") or {}
    if column.get("is_action_placeholder"):
        return None
    func = flt.get("function", "")
    members = flt.get("members") or []
    name = column.get("name", "")
    if not name:
        return None

    def clean(values: List[str]) -> List[Any]:
        out = []
        for v in values:
            if v == "%null%":
                out.append(None)
            elif v == "%many-values%":
                continue
            else:
                out.append(v.strip('"'))
        return out

    # 日期部分筛选（如 [yr:Order Date] 筛 2018）→ 引擎按年/月部分比较
    date_part = DATE_PART_DERIVATIONS.get(column.get("derivation") or "")

    if func == "except":
        spec: Dict[str, Any] = {"field": name, "op": "not_in", "values": clean(members)}
    elif func in ("union", "member", "level-members", "crossjoin", "all"):
        values = clean(members)
        if not values:
            return None  # level-members/all → keep everything
        spec = {"field": name, "op": "in", "values": values}
    else:
        return None
    if date_part:
        spec["date_part"] = date_part
    return spec


def derive_query_spec(worksheet: Dict[str, Any], datasource_caption: str) -> Dict[str, Any]:
    """Derive one view's query spec from its WIS worksheet object."""
    name = worksheet.get("name", "")
    mark = (worksheet.get("mark") or {}).get("resolved", "unknown")

    shelf_fields = (
        _walk_shelf_fields(worksheet["shelves"]["rows"]["expr"])
        + _walk_shelf_fields(worksheet["shelves"]["cols"]["expr"])
    )
    color_fields = [
        entry["field"] for entry in (worksheet.get("encodings") or {}).get("color", [])
    ]
    size_fields = [
        entry["field"] for entry in (worksheet.get("encodings") or {}).get("size", [])
    ]
    text_fields = [
        entry["field"] for entry in (worksheet.get("encodings") or {}).get("text", [])
    ]

    group_by: List[Dict[str, Any]] = []
    aggregates: List[Dict[str, Any]] = []
    seen_group, seen_agg = set(), set()

    def add_dimension(field: Dict[str, Any]) -> None:
        key = field.get("name", "")
        if not key or key in seen_group or field.get("is_action_placeholder"):
            return
        date_key = _date_key(field)
        if date_key is not None:
            entry: Dict[str, Any] = {**date_key, "as": f"{key}__{list(date_key.values())[1]}"}
        else:
            entry = {"field": key, "as": key}
        group_by.append(entry)
        seen_group.add(key)

    def add_measure(field: Dict[str, Any]) -> None:
        key = field.get("name", "")
        deriv = field.get("derivation") or "None"
        if not key or field.get("is_action_placeholder"):
            return
        # "count of records" 伪字段 → 行数统计（CSV 里没有这一列）
        if _is_count_pseudo_field(key):
            agg_id = f"rowcount:{key}"
            if agg_id not in seen_agg:
                op = "cumulative" if deriv == "Cumulative" else "count"
                aggregates.append({"field": "__rowcount__", "op": op, "as": f"count_{key}"})
                seen_agg.add(agg_id)
            return
        if deriv in AGG_OPS:
            agg_id = f"{AGG_OPS[deriv]}:{key}"
            if agg_id in seen_agg:
                return
            aggregates.append({"field": key, "op": AGG_OPS[deriv], "as": f"{AGG_OPS[deriv]}_{key}"})
            seen_agg.add(agg_id)
        else:
            # measure used as raw value (scatter/tooltip) or as category (color by measure)
            if key not in seen_agg:
                aggregates.append({"field": key, "op": "raw", "as": key})
                seen_agg.add(key)

    for field in shelf_fields:
        if field.get("is_measure_names"):
            continue
        # 日期派生字段永远是维度（时间轴），不管类型码怎么写
        if _date_key(field) is not None:
            add_dimension(field)
        elif _is_measure(field):
            add_measure(field)
        else:
            add_dimension(field)

    for field in color_fields + size_fields + text_fields:
        if field.get("is_action_placeholder") or field.get("is_measure_names"):
            continue
        if _is_measure(field):
            add_measure(field)
        else:
            add_dimension(field)

    filters: List[Dict[str, Any]] = []
    for flt in worksheet.get("filters", []):
        translated = _translate_filter(flt)
        if translated is not None:
            filters.append(translated)

    sort = [{"field": g["as"], "order": "asc"} for g in group_by[:1]]

    spec = {
        "view_id": _slug(name),
        "view_name": name,
        "source": datasource_caption,
        "mark": mark,
        "group_by": group_by,
        "aggregates": aggregates,
        "filters": filters,
        "sort": sort,
        "row_level": mark in ROW_LEVEL_MARKS and not aggregates,
        "channels": {
            "color": [f["name"] for f in color_fields],
            "size": [f["name"] for f in size_fields],
            "text": [f["name"] for f in text_fields],
        },
    }
    # row-level marks still need their measures as raw columns
    if spec["row_level"]:
        for agg in aggregates:
            agg["op"] = "raw"
        spec["group_by"] = []

    return spec


def derive_view_specs(wis: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Derive query specs for every on-dashboard worksheet in a WIS object."""
    caption = ""
    if wis.get("datasources"):
        caption = wis["datasources"][0].get("caption", "")
    specs = []
    for ws in wis.get("worksheets", []):
        if not ws.get("on_dashboard"):
            continue
        specs.append(derive_query_spec(ws, caption))
    return specs
