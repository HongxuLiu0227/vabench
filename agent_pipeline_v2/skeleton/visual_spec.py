"""Derive the generation-facing visual spec from a WIS worksheet.

This is a *translation* layer: everything here is derivable from WIS fields
(shelf expression tree, encodings, pane styles). Nothing is guessed.

Output goes into views.json as spec["visual"] and drives the stage-④ prompt.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

__all__ = ["derive_visual_spec"]


def _shelf_dims(tree: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Dimensions in a shelf expression, in order."""
    out: List[Dict[str, Any]] = []

    def walk(node: Dict[str, Any]) -> None:
        if node.get("op") == "field":
            f = node["field"]
            if f.get("field_type") in ("nominal", "ordinal") and not f.get("is_action_placeholder"):
                out.append(f)
        for c in node.get("children") or []:
            walk(c)

    walk(tree)
    return out


def _shelf_measures(tree: Dict[str, Any]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []

    def walk(node: Dict[str, Any]) -> None:
        if node.get("op") == "field":
            f = node["field"]
            if f.get("field_type") == "quantitative" and not f.get("is_action_placeholder"):
                out.append(f)
        for c in node.get("children") or []:
            walk(c)

    walk(tree)
    return out


def derive_visual_spec(ws: Dict[str, Any]) -> Dict[str, Any]:
    """Visual presentation facts for one worksheet."""
    mark = (ws.get("mark") or {}).get("resolved", "unknown")
    rows_expr = ws.get("shelves", {}).get("rows", {}).get("expr", {})
    cols_expr = ws.get("shelves", {}).get("cols", {}).get("expr", {})

    row_dims = _shelf_dims(rows_expr)
    col_dims = _shelf_dims(cols_expr)
    row_measures = _shelf_measures(rows_expr)
    col_measures = _shelf_measures(cols_expr)

    # orientation: dimension on rows → horizontal bars; on cols → vertical
    orientation: Optional[str] = None
    if mark == "bar":
        if row_dims and col_measures:
            orientation = "horizontal"
        elif col_dims and row_measures:
            orientation = "vertical"

    # faceting: cross(dim, measure) on a shelf → small multiples along that axis
    facet_rows: Optional[str] = None
    facet_cols: Optional[str] = None
    if rows_expr.get("op") == "cross" and row_dims and row_measures:
        facet_rows = row_dims[0]["name"]
    if cols_expr.get("op") == "cross" and col_dims and col_measures:
        facet_cols = col_dims[0]["name"]

    # colors: explicit pane colors + palette + color field
    color_entries = (ws.get("encodings") or {}).get("color", [])
    color_field = color_entries[0]["field"]["name"] if color_entries else None
    explicit_colors: List[str] = []
    palette = None
    for entry in color_entries:
        explicit_colors.extend(entry.get("explicit_colors") or [])
        palette = palette or entry.get("palette")

    # data labels: mark-labels-show in pane styles
    pane_styles = ws.get("pane_styles", [])
    show_labels = any(
        s.get("attr") == "mark-labels-show" and str(s.get("value")).lower() == "true"
        for s in pane_styles
    )

    # axis titles declared in worksheet style rules
    axis_titles = [
        {"scope": s.get("scope", ""), "title": s.get("value", "")}
        for s in ws.get("style_rules", [])
        if s.get("element") == "axis" and s.get("attr") == "title" and s.get("value")
    ]

    return {
        "orientation": orientation,
        "facet_rows": facet_rows,
        "facet_cols": facet_cols,
        "color_field": color_field,
        "explicit_colors": explicit_colors,
        "palette": palette,
        "show_labels": show_labels,
        "axis_titles": axis_titles,
        "title": ws.get("title", ""),
    }
