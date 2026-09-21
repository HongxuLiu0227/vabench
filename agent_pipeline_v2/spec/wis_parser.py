"""WIS (Workbook Interface Specification) — reliable .twb parsing.

Two-layer design:
  Layer 1 (faithful): copy what the XML says, verbatim. No interpretation.
  Layer 2 (resolve): decode field references, resolve Automatic marks,
      link actions to worksheet filters — every resolved value carries a
      confidence label: "explicit" | "inferred" | "missing".

The guiding rule: *parsing never guesses silently*. If information is not in
the file, the spec says "missing" instead of inventing a value.
"""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

SCHEMA_VERSION = "wis_v1"

# ---------------------------------------------------------------------------
# Field reference decoding
# ---------------------------------------------------------------------------
# Tableau encodes field references as  [datasource-id].[derivation:Name:type]
# e.g. [federated.0abc...].[ctd:SwimmerId:qk]
#   - derivation: how the base column is transformed (none/sum/avg/ctd/yr/...)
#   - type code:  nk=nominal, ok=ordinal, qk=quantitative (k = key)

DERIVATION_CODES = {
    "none": "None",
    "sum": "Sum",
    "avg": "Avg",
    "cnt": "Count",
    "ctd": "CountD",
    "cum": "Cumulative",
    "pcto": "PercentOfTotal",
    "min": "Min",
    "max": "Max",
    "med": "Median",
    "usr": "User",
    "yr": "Year",
    "qr": "Quarter",
    "mn": "Month",
    "dy": "Day",
    "hr": "Hour",
    "wk": "Week",
    "wd": "Weekday",
    "mdy": "MDY",
    "yrtr": "Year-Trunc",
    "qrtr": "Quarter-Trunc",
    "mntr": "Month-Trunc",
    "dytr": "Day-Trunc",
    "hrtr": "Hour-Trunc",
    "wktr": "Week-Trunc",
}

TYPE_CODES = {
    "nk": "nominal",
    "ok": "ordinal",
    "qk": "quantitative",
    "nh": "nominal",   # hierarchy variants occasionally appear
    "oh": "ordinal",
    "qh": "quantitative",
}

_FIELD_REF_RE = re.compile(r"\[([^\[\]]+)\]")


@dataclass
class FieldRef:
    """A decoded field reference."""

    raw: str
    datasource: Optional[str] = None
    derivation: str = "None"
    derivation_code: str = ""            # raw code, e.g. "tmn", "ctd"
    name: str = ""
    field_type: Optional[str] = None       # nominal / ordinal / quantitative
    is_action_placeholder: bool = False    # [Action (a,b)] pseudo-field
    is_measure_names: bool = False         # [Measure Names] etc.
    decoded: bool = True

    def as_dict(self) -> Dict[str, Any]:
        return {
            "raw": self.raw,
            "datasource": self.datasource,
            "derivation": self.derivation,
            "derivation_code": self.derivation_code,
            "name": self.name,
            "field_type": self.field_type,
            "is_action_placeholder": self.is_action_placeholder,
            "is_measure_names": self.is_measure_names,
            "decoded": self.decoded,
        }


def decode_field_ref(raw: str) -> FieldRef:
    """Decode a raw '[ds].[deriv:Name:type]' reference. Never raises."""
    raw = raw.strip()
    ref = FieldRef(raw=raw)
    if not raw:
        ref.decoded = False
        return ref

    parts = _FIELD_REF_RE.findall(raw)
    if not parts:
        ref.decoded = False
        ref.name = raw
        return ref

    # inner-most bracket group is the field part; a leading group is the datasource
    if len(parts) >= 2:
        ref.datasource = parts[0]
        field_part = parts[-1]
    else:
        field_part = parts[0]

    if field_part.startswith("Action ("):
        ref.is_action_placeholder = True
        ref.name = field_part
        return ref

    sub = field_part.split(":")
    if len(sub) >= 3:
        # [deriv:Name:type]; names may themselves contain ':' — join the middle
        deriv_code, type_code = sub[0], sub[-1]
        ref.derivation_code = deriv_code.strip().lower()
        ref.derivation = DERIVATION_CODES.get(ref.derivation_code, deriv_code)
        ref.name = ":".join(sub[1:-1]).strip()
        ref.field_type = TYPE_CODES.get(type_code.strip().lower())
    elif len(sub) == 2:
        deriv_code, name = sub
        ref.derivation_code = deriv_code.strip().lower()
        ref.derivation = DERIVATION_CODES.get(ref.derivation_code, deriv_code)
        ref.name = name.strip()
    else:
        ref.name = field_part
        # well-known single-part forms
        if field_part in ("Latitude (generated)", "Longitude (generated)"):
            ref.field_type = "quantitative"
        elif field_part.endswith("(group)"):
            ref.field_type = "nominal"
    # [Measure Names]/[Measure Values]/[Multiple Values] 伪字段（含 [none:Measure Names:nk] 形态）
    if ref.name in ("Measure Names", "Measure Values", "Multiple Values"):
        ref.is_measure_names = True
    return ref


# ---------------------------------------------------------------------------
# Shelf expression parsing:  ([a] * [b])  /  [a] + [b]
# ---------------------------------------------------------------------------

def parse_shelf_expression(raw: str) -> Dict[str, Any]:
    """Parse a rows/cols shelf expression into a tree of FieldRefs.

    Operators: '*' nests (cross), '+' appends (concat). Parentheses group.
    Falls back to {"op": "raw"} when the expression is not understood.
    """
    raw = (raw or "").strip()
    if not raw:
        return {"op": "empty", "children": []}

    tokens: List[str] = []
    i = 0
    while i < len(raw):
        ch = raw[i]
        if ch == "[":
            # a field token is one or more bracket groups joined by dots:
            # [datasource].[deriv:Name:type]
            j = i
            while j < len(raw) and raw[j] == "[":
                close = raw.find("]", j)
                if close == -1:
                    j = len(raw)
                    break
                j = close + 1
                if j + 1 < len(raw) and raw[j] == "." and raw[j + 1] == "[":
                    j += 1  # consume the dot, loop continues at '['
                else:
                    break
            tokens.append(raw[i:j])
            i = j
        elif ch in "*+/()":
            tokens.append(ch)
            i += 1
        elif ch.isspace():
            i += 1
        else:
            tokens.append(raw[i:])
            break

    pos = 0

    def parse_expr() -> Dict[str, Any]:
        nonlocal pos
        node = parse_term()
        while pos < len(tokens) and tokens[pos] in ("*", "+", "/"):
            # '*' nests (cross), '+' concatenates (concat), '/' separates panes —
            # all still contribute their fields to the shelf
            op = "cross" if tokens[pos] == "*" else "concat"
            pos += 1
            rhs = parse_term()
            if node.get("op") == op:
                node["children"].append(rhs)
            else:
                node = {"op": op, "children": [node, rhs]}
        return node

    def parse_term() -> Dict[str, Any]:
        nonlocal pos
        if pos >= len(tokens):
            return {"op": "raw", "raw": raw}
        tok = tokens[pos]
        if tok == "(":
            pos += 1
            node = parse_expr()
            if pos < len(tokens) and tokens[pos] == ")":
                pos += 1
            return node
        pos += 1
        return {"op": "field", "field": decode_field_ref(tok).as_dict()}

    try:
        tree = parse_expr()
        if pos != len(tokens):
            return {"op": "raw", "raw": raw}
        return tree
    except Exception:
        return {"op": "raw", "raw": raw}


def shelf_fields(tree: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Flatten a shelf expression tree into the list of field dicts."""
    out: List[Dict[str, Any]] = []
    if tree.get("op") == "field" and isinstance(tree.get("field"), dict):
        out.append(tree["field"])
    for child in tree.get("children", []) or []:
        out.extend(shelf_fields(child))
    return out


# ---------------------------------------------------------------------------
# XML helpers
# ---------------------------------------------------------------------------

def _local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def _children(el: Optional[ET.Element], name: Optional[str] = None) -> List[ET.Element]:
    if el is None:
        return []
    return [c for c in el if name is None or _local(c.tag) == name]


def _first(el: Optional[ET.Element], name: str) -> Optional[ET.Element]:
    for c in _children(el, name):
        return c
    return None


def _descendants(el: Optional[ET.Element], name: str) -> List[ET.Element]:
    if el is None:
        return []
    return [c for c in el.iter() if _local(c.tag) == name]


def _text_runs(el: Optional[ET.Element]) -> str:
    if el is None:
        return ""
    parts = [r.text or "" for r in _descendants(el, "run")]
    return "".join(parts).strip()


# ---------------------------------------------------------------------------
# Layer 1: faithful parse
# ---------------------------------------------------------------------------

def parse_datasources(root: ET.Element) -> List[Dict[str, Any]]:
    """Parse datasource metadata-records: the schema ground truth."""
    datasources: List[Dict[str, Any]] = []
    ds_root = _first(root, "datasources")
    for ds in _children(ds_root, "datasource"):
        fields: List[Dict[str, Any]] = []
        for rec in _descendants(ds, "metadata-record"):
            if rec.attrib.get("class") != "column":
                continue
            entry = {
                "remote_name": rec.attrib.get("remote-name", ""),
                "local_name": rec.attrib.get("local-name", ""),
                "datatype": rec.attrib.get("local-type", ""),
                "default_aggregation": rec.attrib.get("aggregation", ""),
                "contains_null": rec.attrib.get("contains-null", ""),
                "ordinal": rec.attrib.get("ordinal", ""),
            }
            calc = _first(rec, "calculation")
            if calc is not None:
                entry["formula"] = calc.attrib.get("formula", "")
            fields.append(entry)
        datasources.append({
            "id": ds.attrib.get("name", ""),
            "caption": ds.attrib.get("caption", ds.attrib.get("name", "")),
            "inline": ds.attrib.get("inline", ""),
            "fields": fields,
        })
    return datasources


def parse_actions(root: ET.Element) -> List[Dict[str, Any]]:
    """Dashboard-level actions (faithful)."""
    actions: List[Dict[str, Any]] = []
    for action in _descendants(_first(root, "actions"), "action"):
        activation = _first(action, "activation")
        source = _first(action, "source")
        command = _first(action, "command")
        params = {
            p.attrib.get("name", ""): p.attrib.get("value", "")
            for p in _children(command, "param")
        } if command is not None else {}
        actions.append({
            "name": action.attrib.get("name", ""),
            "caption": action.attrib.get("caption", ""),
            "activation": activation.attrib if activation is not None else {},
            "source": source.attrib if source is not None else {},
            "command": command.attrib.get("command", "") if command is not None else "",
            "params": params,
        })
    return actions


def parse_filters(view: Optional[ET.Element]) -> List[Dict[str, Any]]:
    """Worksheet-level filters, keeping the groupfilter tree intact."""
    filters: List[Dict[str, Any]] = []
    for f in _children(view, "filter"):
        group = _first(f, "groupfilter")
        filters.append({
            "class": f.attrib.get("class", ""),
            "column_raw": f.attrib.get("column", ""),
            "groupfilter": _parse_groupfilter(group) if group is not None else None,
        })
    return filters


def _parse_groupfilter(node: ET.Element) -> Dict[str, Any]:
    return {
        "function": node.attrib.get("function", ""),
        "level": node.attrib.get("level", ""),
        "member": node.attrib.get("member", ""),
        "ui_action_filter": node.attrib.get("{http://www.tableausoftware.com/xml/user}ui-action-filter", ""),
        "children": [_parse_groupfilter(c) for c in _children(node, "groupfilter")],
    }


def parse_panes(table: Optional[ET.Element]) -> List[Dict[str, Any]]:
    """Panes with marks, encodings, and pane-level style rules (faithful)."""
    panes: List[Dict[str, Any]] = []
    panes_node = _first(table, "panes")
    for pane in _children(panes_node, "pane"):
        mark = _first(pane, "mark")
        encodings: Dict[str, List[Dict[str, Any]]] = {}
        for enc in _children(_first(pane, "encodings")):
            encodings.setdefault(_local(enc.tag), []).append(dict(enc.attrib))
        styles: List[Dict[str, str]] = []
        for rule in _children(_first(pane, "style"), "style-rule"):
            for fmt in _children(rule, "format"):
                styles.append({
                    "element": rule.attrib.get("element", ""),
                    "attr": fmt.attrib.get("attr", ""),
                    "value": fmt.attrib.get("value", ""),
                    "field": fmt.attrib.get("field", ""),
                })
        panes.append({
            "mark_class": mark.attrib.get("class", "") if mark is not None else "",
            "encodings": encodings,
            "styles": styles,
        })
    return panes


def parse_worksheet_style(table: Optional[ET.Element]) -> List[Dict[str, str]]:
    """Worksheet-level style rules (axis display, header sizes, palette encodings...)."""
    out: List[Dict[str, str]] = []
    for rule in _children(_first(table, "style"), "style-rule"):
        for fmt in _children(rule, "format"):
            out.append({
                "element": rule.attrib.get("element", ""),
                "attr": fmt.attrib.get("attr", ""),
                "value": fmt.attrib.get("value", ""),
                "field": fmt.attrib.get("field", ""),
                "scope": fmt.attrib.get("scope", ""),
            })
        for enc in _children(rule, "encoding"):
            out.append({
                "element": rule.attrib.get("element", ""),
                "encoding_attr": enc.attrib.get("attr", ""),
                "palette": enc.attrib.get("palette", ""),
                "type": enc.attrib.get("type", ""),
                "field": enc.attrib.get("field", ""),
            })
    return out


def parse_worksheets(root: ET.Element) -> List[Dict[str, Any]]:
    worksheets: List[Dict[str, Any]] = []
    ws_root = _first(root, "worksheets")
    for ws in _children(ws_root, "worksheet"):
        table = _first(ws, "table")
        view = _first(table, "view")
        layout = _first(ws, "layout-options")

        rows_text = ""
        cols_text = ""
        rows_node = _first(table, "rows")
        cols_node = _first(table, "cols")
        if rows_node is not None and rows_node.text:
            rows_text = rows_node.text.strip()
        if cols_node is not None and cols_node.text:
            cols_text = cols_node.text.strip()

        # calculated fields + column roles declared at worksheet level
        calc_fields: List[Dict[str, str]] = []
        column_roles: Dict[str, Dict[str, str]] = {}
        for dep in _children(view, "datasource-dependencies"):
            for col in _children(dep, "column"):
                name = col.attrib.get("name", "").strip("[]")
                if name:
                    column_roles[name] = {
                        "role": col.attrib.get("role", ""),
                        "datatype": col.attrib.get("datatype", ""),
                    }
                calc = _first(col, "calculation")
                if calc is not None:
                    calc_fields.append({
                        "name": col.attrib.get("name", ""),
                        "caption": col.attrib.get("caption", ""),
                        "datatype": col.attrib.get("datatype", ""),
                        "role": col.attrib.get("role", ""),
                        "formula": calc.attrib.get("formula", ""),
                        "datasource": dep.attrib.get("datasource", ""),
                    })

        slices = [
            (c.text or "").strip()
            for c in _children(_first(view, "slices"), "column")
            if (c.text or "").strip()
        ]

        worksheets.append({
            "name": ws.attrib.get("name", ""),
            "title": _text_runs(_first(layout, "title")),
            "rows_raw": rows_text,
            "cols_raw": cols_text,
            "slices_raw": slices,
            "panes": parse_panes(table),
            "filters": parse_filters(view),
            "style_rules": parse_worksheet_style(table),
            "calculated_fields": calc_fields,
            "column_roles": column_roles,
        })
    return worksheets


def parse_zone(zone: ET.Element) -> Dict[str, Any]:
    """Recursive zone parse; geometry kept in Tableau's 0..100000 space."""
    zone_type = zone.attrib.get("type-v2", zone.attrib.get("type", ""))
    name = zone.attrib.get("name", "")
    if not zone_type:
        # sheet zones carry only a name; everything else unnamed is layout
        zone_type = "sheet" if name else "layout"
    node: Dict[str, Any] = {
        "id": zone.attrib.get("id", ""),
        "type": zone_type,
        "name": name,
        "param_raw": zone.attrib.get("param", ""),
        "mode": zone.attrib.get("mode", ""),
        "geometry": {
            k: zone.attrib.get(k, "")
            for k in ("x", "y", "w", "h")
        },
        "text": _text_runs(zone) if zone.attrib.get("type-v2") == "text" else "",
        "children": [parse_zone(c) for c in _children(zone, "zone")],
    }
    # text zones keep runs inside <formatted-text>; drop duplicated children text
    return node


def parse_dashboards(root: ET.Element) -> List[Dict[str, Any]]:
    dashboards: List[Dict[str, Any]] = []
    for dash in _children(_first(root, "dashboards"), "dashboard"):
        size = _first(dash, "size")
        zones_root = _first(dash, "zones")
        dashboards.append({
            "name": dash.attrib.get("name", ""),
            "size": dict(size.attrib) if size is not None else {},
            "zone_tree": [parse_zone(z) for z in _children(zones_root, "zone")],
        })
    return dashboards


# ---------------------------------------------------------------------------
# Layer 2: resolution with confidence
# ---------------------------------------------------------------------------

# temporal derivations: raw codes start with 't' (tmn=month, tyr=year, ...),
# mapped names cover the date-part / date-trunc family
TEMPORAL_DERIVATIONS = {
    "Year", "Quarter", "Month", "Day", "Hour", "Week", "Weekday", "MDY",
    "Year-Trunc", "Quarter-Trunc", "Month-Trunc", "Day-Trunc", "Week-Trunc", "Hour-Trunc",
}


def _is_temporal(ref: Dict[str, Any], column_roles: Optional[Dict[str, Dict[str, str]]] = None) -> bool:
    """A field is temporal if its derivation is a date part/truncation,
    or the worksheet declares its datatype as date/datetime."""
    if ref.get("derivation") in TEMPORAL_DERIVATIONS:
        return True
    code = ref.get("derivation_code") or ""
    if code.startswith("t") and code not in ("", "none"):
        return True
    if column_roles:
        name = ref.get("name") or ""
        entry = column_roles.get(name) or column_roles.get(name.strip("[]"))
        if entry and entry.get("datatype") in ("date", "datetime"):
            return True
    return False


def _field_role(ref: Dict[str, Any], column_roles: Optional[Dict[str, Dict[str, str]]] = None) -> str:
    """nominal/ordinal -> dimension-ish; quantitative -> measure-ish.

    Fallback: look the field up in the worksheet's datasource-dependencies,
    where Tableau declares role='dimension'/'measure' explicitly.
    """
    ftype = ref.get("field_type")
    if ftype == "quantitative":
        return "measure"
    if ftype in ("nominal", "ordinal"):
        return "dimension"
    name = ref.get("name") or ""
    if column_roles:
        entry = column_roles.get(name) or column_roles.get(name.strip("[]"))
        if entry:
            role = entry.get("role", "")
            if role == "measure":
                return "measure"
            if role == "dimension":
                return "dimension"
            datatype = entry.get("datatype", "")
            if datatype in ("integer", "real"):
                return "measure"
            if datatype in ("string", "date", "datetime"):
                return "dimension"
    return "unknown"


MAP_DECLARED_CLASSES = {"multipolygon", "polygon", "map"}
MAP_SYMBOL_SHAPES = {"circle", "square", "shape"}


def _map_result(declared: str, channels: set, *, confidence: str, rule: str) -> Dict[str, Any]:
    """Build a map mark result, keeping the subtype info generation needs."""
    declared_lower = declared.lower()
    filled = declared_lower in MAP_DECLARED_CLASSES or "geometry" in channels
    symbol_shape = declared_lower if declared_lower in MAP_SYMBOL_SHAPES else "circle"
    return {
        "declared": declared or "Automatic",
        "resolved": "map",
        "map_subtype": "filled" if filled else "symbol",
        "symbol_shape": None if filled else symbol_shape,
        "confidence": confidence,
        "rule": rule,
    }


def resolve_mark(panes: List[Dict[str, Any]], rows_tree: Dict[str, Any], cols_tree: Dict[str, Any],
                 column_roles: Optional[Dict[str, Dict[str, str]]] = None) -> Dict[str, Any]:
    """Resolve the mark class. Explicit if declared; otherwise apply Tableau's
    Automatic-mark rules and label the result 'inferred' with the rule name."""
    declared = panes[0]["mark_class"] if panes else ""

    channels = set()
    for pane in panes:
        channels.update(pane.get("encodings", {}).keys())

    row_fields = shelf_fields(rows_tree)
    col_fields = shelf_fields(cols_tree)
    field_names = {f.get("name", "") for f in row_fields + col_fields}
    has_latlong = {"Latitude (generated)", "Longitude (generated)"} <= field_names

    # maps: declared geo classes, generated lat/long pairs, or geometry encodings
    if declared and declared.lower() in MAP_DECLARED_CLASSES:
        return _map_result(declared, channels, confidence="explicit", rule="declared")
    if has_latlong or "geometry" in channels:
        confidence = "explicit" if declared and declared != "Automatic" else "inferred"
        return _map_result(declared, channels, confidence=confidence, rule="lat_long_or_geometry")

    if declared and declared != "Automatic":
        return {"declared": declared, "resolved": declared.lower(), "confidence": "explicit", "rule": "declared"}
    if not panes:
        return {"declared": "", "resolved": "unknown", "confidence": "missing", "rule": "no_pane"}

    # temporal fields behave as ordinal dimensions
    def role_of(f: Dict[str, Any]) -> str:
        if _is_temporal(f, column_roles):
            return "temporal"
        return _field_role(f, column_roles)

    row_roles = [role_of(f) for f in row_fields]
    col_roles = [role_of(f) for f in col_fields]
    row_measures = sum(r == "measure" for r in row_roles)
    col_measures = sum(r == "measure" for r in col_roles)
    row_dims = sum(r in ("dimension", "temporal") for r in row_roles)
    col_dims = sum(r in ("dimension", "temporal") for r in col_roles)
    has_temporal = any(r == "temporal" for r in row_roles + col_roles)

    # encoding-driven marks: no shelves, but the channel combination tells the story
    if not row_fields and not col_fields:
        if {"size", "color", "text"} <= channels:
            return {"declared": "Automatic", "resolved": "treemap", "confidence": "inferred", "rule": "size_color_text_no_shelves"}
        if "text" in channels:
            return {"declared": "Automatic", "resolved": "text", "confidence": "inferred", "rule": "text_only_no_shelves"}
        return {"declared": "Automatic", "resolved": "unknown", "confidence": "missing", "rule": "empty_shelves"}

    # Tableau Automatic mark rules (simplified Show Me logic)
    if has_temporal and (row_measures + col_measures) >= 1:
        # Tableau's Automatic mark for time series is a line
        return {"declared": "Automatic", "resolved": "line", "confidence": "inferred", "rule": "temporal_plus_measure"}
    if row_measures >= 1 and col_measures >= 1:
        return {"declared": "Automatic", "resolved": "circle", "confidence": "inferred", "rule": "measure_vs_measure"}
    if row_dims >= 1 and col_measures >= 1:
        return {"declared": "Automatic", "resolved": "bar", "confidence": "inferred", "rule": "dim_plus_measure"}
    if col_dims >= 1 and row_measures >= 1:
        return {"declared": "Automatic", "resolved": "bar", "confidence": "inferred", "rule": "dim_plus_measure"}
    if (row_dims + col_dims) >= 1 and (row_measures + col_measures) == 0:
        return {"declared": "Automatic", "resolved": "text", "confidence": "inferred", "rule": "dims_only"}
    if (row_measures + col_measures) >= 1 and (row_dims + col_dims) == 0:
        return {"declared": "Automatic", "resolved": "bar", "confidence": "inferred", "rule": "measures_only"}
    return {"declared": "Automatic", "resolved": "unknown", "confidence": "missing", "rule": "unresolved_roles"}


def _groupfilter_members(group: Optional[Dict[str, Any]]) -> List[str]:
    members: List[str] = []
    if not group:
        return members
    if group.get("member"):
        members.append(group["member"])
    for child in group.get("children", []):
        members.extend(_groupfilter_members(child))
    return members


def _groupfilter_action_link(group: Optional[Dict[str, Any]]) -> str:
    if not group:
        return ""
    if group.get("ui_action_filter"):
        return group["ui_action_filter"]
    for child in group.get("children", []):
        link = _groupfilter_action_link(child)
        if link:
            return link
    return ""


def resolve_filters(filters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for f in filters:
        ref = decode_field_ref(f.get("column_raw", ""))
        out.append({
            "class": f.get("class", ""),
            "column": ref.as_dict(),
            "function": (f.get("groupfilter") or {}).get("function", ""),
            "members": _groupfilter_members(f.get("groupfilter")),
            "linked_action": _groupfilter_action_link(f.get("groupfilter")),
            "confidence": "explicit",
        })
    return out


def resolve_encodings(panes: List[Dict[str, Any]], style_rules: List[Dict[str, str]]) -> Dict[str, Any]:
    """Resolve encodings; colors get palette + explicit mark colors merged in."""
    result: Dict[str, Any] = {}
    # worksheet-level style encoding carries palette + type
    palette, palette_type = "", ""
    for rule in style_rules:
        if rule.get("encoding_attr") == "color" and rule.get("palette"):
            palette = rule["palette"]
            palette_type = rule.get("type", "")

    for pane in panes:
        for channel, entries in pane.get("encodings", {}).items():
            for entry in entries:
                ref = decode_field_ref(entry.get("column", ""))
                item: Dict[str, Any] = {
                    "field": ref.as_dict(),
                    "confidence": "explicit",
                }
                if channel == "color":
                    if palette:
                        item["palette"] = palette
                        if palette_type:
                            item["palette_type"] = palette_type
                    # explicit per-mark colors from pane styles
                    mark_colors = [
                        s["value"] for s in pane.get("styles", [])
                        if s.get("element") == "mark" and s.get("attr") == "mark-color"
                    ]
                    if mark_colors:
                        item["explicit_colors"] = mark_colors
                result.setdefault(channel, []).append(item)
    return result


def flatten_zones(tree: List[Dict[str, Any]], parent: Optional[str] = None) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for z in tree:
        flat = {k: v for k, v in z.items() if k != "children"}
        flat["parent"] = parent
        out.append(flat)
        out.extend(flatten_zones(z.get("children", []), parent=z.get("id")))
    return out


# ---------------------------------------------------------------------------
# Top level
# ---------------------------------------------------------------------------

def build_wis(twb_path: str | Path) -> Dict[str, Any]:
    twb_path = Path(twb_path)
    root = ET.parse(twb_path).getroot()

    datasources = parse_datasources(root)
    worksheets_raw = parse_worksheets(root)
    dashboards_raw = parse_dashboards(root)
    actions_raw = parse_actions(root)

    worksheets: List[Dict[str, Any]] = []
    for ws in worksheets_raw:
        rows_tree = parse_shelf_expression(ws["rows_raw"])
        cols_tree = parse_shelf_expression(ws["cols_raw"])
        mark = resolve_mark(ws["panes"], rows_tree, cols_tree, ws.get("column_roles"))
        worksheets.append({
            "name": ws["name"],
            "title": ws["title"],
            "mark": mark,
            "shelves": {
                "rows": {"raw": ws["rows_raw"], "expr": rows_tree},
                "cols": {"raw": ws["cols_raw"], "expr": cols_tree},
            },
            "fields_used": shelf_fields(rows_tree) + shelf_fields(cols_tree),
            "encodings": resolve_encodings(ws["panes"], ws["style_rules"]),
            "filters": resolve_filters(ws["filters"]),
            "slices": [decode_field_ref(s).as_dict() for s in ws["slices_raw"]],
            "style_rules": ws["style_rules"],
            "calculated_fields": ws["calculated_fields"],
        })

    dashboards: List[Dict[str, Any]] = []
    for dash in dashboards_raw:
        zones = flatten_zones(dash["zone_tree"])
        for z in zones:
            if z.get("param_raw"):
                z["param_field"] = decode_field_ref(z["param_raw"]).as_dict()
        dashboards.append({
            "name": dash["name"],
            "size": dash["size"],
            "zones": zones,
        })

    # link actions to worksheet filters
    for action in actions_raw:
        linked = []
        for ws in worksheets:
            for f in ws["filters"]:
                if f.get("linked_action") and f["linked_action"] == action.get("name"):
                    if ws["name"] not in linked:
                        linked.append(ws["name"])
        action["linked_worksheets"] = linked

    # mark which worksheets actually appear on a dashboard (sheet zones)
    on_dash = {
        z.get("name", "")
        for d in dashboards
        for z in d["zones"]
        if z["type"] == "sheet" and z.get("name")
    }
    for ws in worksheets:
        ws["on_dashboard"] = ws["name"] in on_dash

    # confidence summary
    confidence = {"explicit": 0, "inferred": 0, "missing": 0}
    for ws in worksheets:
        confidence[ws["mark"]["confidence"]] += 1

    return {
        "schema_version": SCHEMA_VERSION,
        "source": {"file": twb_path.name, "build": root.attrib.get("source-build", "")},
        "datasources": datasources,
        "worksheets": worksheets,
        "dashboards": dashboards,
        "actions": actions_raw,
        "summary": {
            "worksheet_count": len(worksheets),
            "dashboard_count": len(dashboards),
            "action_count": len(actions_raw),
            "calculated_field_count": sum(len(w["calculated_fields"]) for w in worksheets),
            "mark_confidence": confidence,
        },
    }


__all__ = ["build_wis", "decode_field_ref", "parse_shelf_expression", "SCHEMA_VERSION"]
