"""skeleton builder — stage ③: WIS + dataprep outputs → complete project shell.

Everything here is deterministic codegen. The only LLM-produced files (view
components, stage ④) land in src/views/ later; the builder emits stubs so the
shell builds and renders before any LLM call.
"""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

__all__ = ["build_project"]

TEMPLATES = Path(__file__).parent / "templates"


# ---------------------------------------------------------------------------
# field name cleanup
# ---------------------------------------------------------------------------

def _slug(name: str) -> str:
    slug = re.sub(r"[^A-Za-z0-9]+", "_", name.strip()).strip("_")
    return slug or "field"


def build_rename_map(wis: Dict[str, Any]) -> Dict[str, str]:
    """WIS field reference name → clean column name used across the project."""
    rename: Dict[str, str] = {}
    for ds in wis.get("datasources", []):
        for f in ds.get("fields", []):
            local = (f.get("local_name") or "").strip("[]")
            remote = (f.get("remote_name") or "").strip()
            if local and remote and local != remote:
                rename[local] = remote
    for ws in wis.get("worksheets", []):
        for cf in ws.get("calculated_fields", []):
            mangled = (cf.get("name") or "").strip("[]")
            caption = (cf.get("caption") or "").strip()
            if mangled:
                rename[mangled] = _slug(caption or mangled)
    return rename


def _clean(name: str, rename: Dict[str, str]) -> str:
    return rename.get(name, name)


# ---------------------------------------------------------------------------
# data package: prune columns + columnar format
# ---------------------------------------------------------------------------

def _collect_used_fields(specs: List[Dict[str, Any]], extra_fields: List[str]) -> List[str]:
    used: List[str] = []
    for spec in specs:
        for g in spec.get("group_by", []):
            used.append(g["field"])
        for a in spec.get("aggregates", []):
            if a["field"] != "__rowcount__":
                used.append(a["field"])
        for f in spec.get("filters", []):
            used.append(f["field"])
        for ch_fields in (spec.get("channels") or {}).values():
            used.extend(ch_fields)
    used.extend(extra_fields)
    seen: List[str] = []
    for u in used:
        if u and u not in seen:
            seen.append(u)
    return seen


def write_data_package(dataset, specs: List[Dict[str, Any]], extra_fields: List[str],
                       rename: Dict[str, str], out_dir: Path) -> List[str]:
    """Write public/data/enriched.json: columnar, pruned to used columns."""
    used = _collect_used_fields(specs, extra_fields)
    available = set(dataset.columns)
    kept = [c for c in dataset.columns if c in used]  # keep original order
    missing = [u for u in used if u not in available]

    clean_columns = [_clean(c, rename) for c in kept]
    rows = [[row.get(c) for c in kept] for row in dataset.rows]
    payload = {"columns": clean_columns, "rows": rows}

    data_dir = out_dir / "public" / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / "enriched.json").write_text(
        json.dumps(payload, ensure_ascii=False, default=str), encoding="utf-8"
    )
    return missing


def clean_spec(spec: Dict[str, Any], rename: Dict[str, str]) -> Dict[str, Any]:
    """Rename all field references in a spec to the clean names."""
    out = dict(spec)
    out["group_by"] = [
        {**g, "field": _clean(g["field"], rename), "as": _clean(g["as"], rename)}
        for g in spec.get("group_by", [])
    ]
    out["aggregates"] = [
        {**a, "field": _clean(a["field"], rename), "as": _clean(a["as"], rename)}
        for a in spec.get("aggregates", [])
    ]
    out["filters"] = [
        {**f, "field": _clean(f["field"], rename)} for f in spec.get("filters", [])
    ]
    out["sort"] = [{**s, "field": _clean(s["field"], rename)} for s in spec.get("sort", [])]
    channels = {}
    for ch, fields in (spec.get("channels") or {}).items():
        channels[ch] = [_clean(f, rename) for f in fields]
    out["channels"] = channels
    return out


# ---------------------------------------------------------------------------
# Dashboard.tsx codegen
# ---------------------------------------------------------------------------

def _pascal(name: str) -> str:
    parts = re.split(r"[^A-Za-z0-9]+", name.strip())
    return "".join(p[:1].upper() + p[1:] for p in parts if p) or "View"


def interaction_roles(wis: Dict[str, Any], specs: List[Dict[str, Any]],
                      rename: Dict[str, str]) -> Dict[str, Dict[str, Any]]:
    """Per-view interaction role for the viewgen prompt and assembly wiring."""
    roles: Dict[str, Dict[str, Any]] = {}
    ws_by_name = {w["name"]: w for w in wis.get("worksheets", [])}
    spec_by_name = {s["view_name"]: s for s in specs}

    def source_field_for(ws_name: str) -> Optional[str]:
        ws = ws_by_name.get(ws_name)
        if not ws:
            return None
        for f in ws.get("fields_used", []):
            if f.get("field_type") in ("nominal", "ordinal") and not f.get("is_action_placeholder"):
                return _clean(f["name"], rename)
        return None

    for a in wis.get("actions", []):
        src_ws = a.get("source", {}).get("worksheet", "")
        field = source_field_for(src_ws)
        src_spec = spec_by_name.get(src_ws)
        if src_spec and field:
            roles[src_spec["view_id"]] = {
                "role": "source",
                "field": field,
                "command": a.get("command", ""),
                "auto_clear": a.get("activation", {}).get("auto-clear") == "true",
            }
        for target in a.get("linked_worksheets", []):
            tgt_spec = spec_by_name.get(target)
            if tgt_spec and field and tgt_spec["view_id"] not in roles:
                roles[tgt_spec["view_id"]] = {
                    "role": "target",
                    "field": field,
                    "command": a.get("command", ""),
                }
    return roles


def _pct(value: str) -> float:
    try:
        return float(value) / 1000.0  # 0..100000 → percentage with 2 decimals
    except (TypeError, ValueError):
        return 0.0


def _gen_dashboard_tsx(wis: Dict[str, Any], specs: List[Dict[str, Any]],
                       rename: Dict[str, str]) -> str:
    dash = wis["dashboards"][0]
    size = dash.get("size", {})
    width = int(float(size.get("maxwidth", 1200) or 1200))
    height = int(float(size.get("maxheight", 800) or 800))

    spec_by_name = {s["view_name"]: s for s in specs}
    spec_imports: List[str] = []
    body: List[str] = []

    # action wiring: source worksheet → its dimension fields
    actions = wis.get("actions", [])
    ws_by_name = {w["name"]: w for w in wis.get("worksheets", [])}
    auto_clear = any(a.get("activation", {}).get("auto-clear") == "true" for a in actions)

    def source_field_for(ws_name: str) -> Optional[str]:
        ws = ws_by_name.get(ws_name)
        if not ws:
            return None
        for f in ws.get("fields_used", []):
            if f.get("field_type") in ("nominal", "ordinal") and not f.get("is_action_placeholder"):
                return _clean(f["name"], rename)
        return None

    action_by_source = {a.get("source", {}).get("worksheet", ""): a for a in actions}
    # which views are targets of a filter action, and on which field
    target_link: Dict[str, str] = {}
    for a in actions:
        if a.get("command") != "tsc:tsl-filter":
            continue
        field = source_field_for(a.get("source", {}).get("worksheet", ""))
        for target in a.get("linked_worksheets", []):
            if field:
                target_link[target] = field

    for z in dash.get("zones", []):
        ztype = z["type"]
        g = z.get("geometry", {})
        style = (
            f"{{ position: 'absolute', left: '{_pct(g.get('x', '')):.2f}%', "
            f"top: '{_pct(g.get('y', '')):.2f}%', width: '{_pct(g.get('w', '')):.2f}%', "
            f"height: '{_pct(g.get('h', '')):.2f}%' }}"
        )
        if ztype == "sheet":
            ws_name = z.get("name", "")
            spec = spec_by_name.get(ws_name)
            if spec is None:
                continue
            comp = _pascal(spec["view_id"])
            spec_imports.append(comp)
            is_source = ws_name in action_by_source
            link_field = target_link.get(ws_name)
            props = [f"data={{useViewData(SPECS['{spec['view_id']}']{_link_arg(link_field)})}}",
                     "selection={selection}"]
            if is_source:
                field = source_field_for(ws_name)
                props.append(f"onSelect={{(values) => select('{spec['view_id']}', '{field}', values)}}")
            props.append(f"title={{'{ws_name.strip()}'}}")
            props.append(f"mark={{'{spec['mark']}'}}")
            body.append(
                f"      <div style={{{style}}}>\n"
                f"        <{comp} {' '.join(props)} />\n"
                f"      </div>"
            )
        elif ztype == "filter":
            field = _clean((z.get("param_field") or {}).get("name", ""), rename)
            body.append(
                f"      <div style={{{style}}}>\n"
                f"        <FilterControl field={{ '{field}' }} />\n"
                f"      </div>"
            )
        elif ztype == "color":
            field = _clean((z.get("param_field") or {}).get("name", ""), rename)
            body.append(
                f"      <div style={{{style}}}>\n"
                f"        <ColorLegend field={{ '{field}' }} />\n"
                f"      </div>"
            )
        elif ztype == "text" and z.get("text"):
            text = z["text"].replace("`", "'").replace("${", "(")
            body.append(
                f"      <div style={{{style}}}>\n"
                f"        <TextBlock text={{`{text}`}} />\n"
                f"      </div>"
            )
        elif ztype == "title":
            title = dash.get("name", "Dashboard")
            body.append(
                f"      <div style={{{style}}}>\n"
                f"        <h2 style={{{{ margin: 0, fontSize: 18 }}}}> {title} </h2>\n"
                f"      </div>"
            )

    imports = "\n".join(f"import {c} from './views/{c}';" for c in sorted(set(spec_imports)))
    clear_handler = " onClick={() => clear()}" if auto_clear else ""

    return f"""// GENERATED by agent_pipeline_v2.skeleton.builder — do not edit by hand.
import SPECS from './specs/views.json';
import {{ useViewData }} from './lib/useViewData';
import {{ useDashboardStore }} from './lib/store';
import FilterControl from './components/FilterControl';
import ColorLegend from './components/ColorLegend';
import TextBlock from './components/TextBlock';
{imports}

export default function Dashboard() {{
  const {{ selection, select, clear }} = useDashboardStore();
  return (
    <div
      style={{{{ position: 'relative', width: {width}, height: {height}, margin: '0 auto', background: '#fff' }}}}
      {clear_handler}
    >
{chr(10).join(body)}
    </div>
  );
}}
"""


def _link_arg(field: Optional[str]) -> str:
    return f", {{ linkedSelectionField: '{field}' }}" if field else ""


# ---------------------------------------------------------------------------
# view stubs
# ---------------------------------------------------------------------------

_STUB = """// Placeholder view — stage ④ replaces this file with the real component.
import StubView from '../components/StubView';
import type { ViewProps } from '../lib/types';

interface Props extends ViewProps {
  title?: string;
  mark?: string;
}

export default function %s(props: Props) {
  return <StubView {...props} />;
}
"""


def _write_view_stubs(specs: List[Dict[str, Any]], out_dir: Path) -> None:
    views_dir = out_dir / "src" / "views"
    views_dir.mkdir(parents=True, exist_ok=True)
    for spec in specs:
        comp = _pascal(spec["view_id"])
        (views_dir / f"{comp}.tsx").write_text(_STUB % comp, encoding="utf-8")


# ---------------------------------------------------------------------------
# entry
# ---------------------------------------------------------------------------

def build_project(
    wis: Dict[str, Any],
    dataset,
    specs: List[Dict[str, Any]],
    out_dir: str | Path,
    *,
    force: bool = False,
) -> Dict[str, Any]:
    """Build a complete dashboard project shell from WIS + enriched data + specs."""
    out_dir = Path(out_dir)
    if out_dir.exists() and force:
        shutil.rmtree(out_dir)
    if out_dir.exists():
        raise FileExistsError(f"{out_dir} exists; pass force=True")

    rename = build_rename_map(wis)

    # extra fields needed by interaction wiring and control zones (original names)
    extra_fields: List[str] = []
    ws_by_name = {w["name"]: w for w in wis.get("worksheets", [])}
    for a in wis.get("actions", []):
        ws = ws_by_name.get(a.get("source", {}).get("worksheet", ""))
        for f in (ws or {}).get("fields_used", []):
            if f.get("field_type") in ("nominal", "ordinal") and not f.get("is_action_placeholder"):
                extra_fields.append(f["name"])
    for dash in wis.get("dashboards", []):
        for z in dash.get("zones", []):
            if z["type"] in ("filter", "color"):
                name = (z.get("param_field") or {}).get("name", "")
                if name:
                    extra_fields.append(name)

    # copy static template
    shutil.copytree(TEMPLATES, out_dir)

    # data package: collect used fields under ORIGINAL names, output clean names
    missing = write_data_package(dataset, specs, extra_fields, rename, out_dir)

    # specs bundle (clean names, matching the data package)
    clean_specs = [clean_spec(s, rename) for s in specs]

    # specs bundle
    specs_dir = out_dir / "src" / "specs"
    specs_dir.mkdir(parents=True, exist_ok=True)
    views_json = {s["view_id"]: s for s in clean_specs}
    (specs_dir / "views.json").write_text(
        json.dumps(views_json, ensure_ascii=False, indent=2, default=str), encoding="utf-8"
    )
    # interaction roles (consumed by stage ④ prompts)
    roles = interaction_roles(wis, clean_specs, rename)
    (specs_dir / "interactions.json").write_text(
        json.dumps(roles, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # view stubs + dashboard
    _write_view_stubs(clean_specs, out_dir)
    (out_dir / "src" / "Dashboard.tsx").write_text(
        _gen_dashboard_tsx(wis, clean_specs, rename), encoding="utf-8"
    )

    return {
        "out_dir": str(out_dir),
        "views": [s["view_id"] for s in clean_specs],
        "missing_fields": missing,
        "renamed_fields": len(rename),
    }
