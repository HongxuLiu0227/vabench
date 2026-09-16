#!/usr/bin/env python3
"""Scan all native .twb files to catalog the structural variety the new parser must cover."""
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

ROOT = Path("output/dashboard/output_twbx_single")


def local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def scan_twb(path: Path, stats: dict) -> None:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
        root = ET.fromstring(text)
    except Exception as e:
        stats["parse_errors"].append(f"{path.parent.name}: {type(e).__name__}: {e}")
        return

    stats["workbooks"] += 1

    for ws in root.iter():
        if local(ws.tag) == "worksheet":
            stats["worksheets"] += 1
        elif local(ws.tag) == "dashboard":
            stats["dashboards"] += 1

    # mark classes
    for el in root.iter():
        if local(el.tag) == "mark":
            cls = el.attrib.get("class", "(none)")
            stats["mark_class"][cls] += 1

    # actions
    for el in root.iter():
        if local(el.tag) == "action":
            stats["actions"] += 1
            act = el.find(".//")
            for child in el.iter():
                if local(child.tag) == "activation":
                    stats["activation_type"][child.attrib.get("type", "?")] += 1
                if local(child.tag) == "command":
                    stats["command_type"][child.attrib.get("command", "?")] += 1

    # zone types
    for el in root.iter():
        if local(el.tag) == "zone":
            ztype = el.attrib.get("type-v2", el.attrib.get("type", "(none)"))
            stats["zone_type"][ztype] += 1

    # column-instance derivations (field encoding prefix)
    for el in root.iter():
        if local(el.tag) == "column-instance":
            deriv = el.attrib.get("derivation", "?")
            stats["derivation"][deriv] += 1

    # calculated fields
    for el in root.iter():
        if local(el.tag) == "calculation":
            stats["calc_fields"] += 1

    # encodings channels used
    for el in root.iter():
        if local(el.tag) == "encodings":
            for ch in el:
                stats["encoding_channel"][local(ch.tag)] += 1

    # explicit colors in style rules
    for m in re.finditer(r"attr='(mark-color|color)'", text):
        stats["explicit_colors"] += 1
    for m in re.finditer(r"<palette", text):
        stats["palette_defs"] += 1

    # filter classes
    for el in root.iter():
        if local(el.tag) == "filter":
            stats["filter_class"][el.attrib.get("class", "?")] += 1

    # datasources count
    for el in root.iter():
        if local(el.tag) == "datasource" and el.attrib.get("inline"):
            stats["inline_datasources"] += 1


def main() -> None:
    stats = {
        "workbooks": 0, "worksheets": 0, "dashboards": 0, "actions": 0,
        "calc_fields": 0, "explicit_colors": 0, "palette_defs": 0,
        "inline_datasources": 0,
        "mark_class": Counter(), "activation_type": Counter(),
        "command_type": Counter(), "zone_type": Counter(),
        "derivation": Counter(), "encoding_channel": Counter(),
        "filter_class": Counter(),
        "parse_errors": [],
    }
    twbs = sorted(ROOT.glob("*/*.twb"))
    print(f"found {len(twbs)} .twb files")
    for p in twbs:
        scan_twb(p, stats)

    print(f"\nworkbooks={stats['workbooks']} worksheets={stats['worksheets']} dashboards={stats['dashboards']} actions={stats['actions']}")
    print(f"calculated_fields={stats['calc_fields']} explicit_mark_colors={stats['explicit_colors']} palette_defs={stats['palette_defs']} inline_datasources={stats['inline_datasources']}")
    for key in ("mark_class", "activation_type", "command_type", "zone_type", "derivation", "encoding_channel", "filter_class"):
        print(f"\n== {key} ==")
        for k, v in stats[key].most_common(25):
            print(f"  {k}: {v}")
    if stats["parse_errors"]:
        print(f"\n== parse errors ({len(stats['parse_errors'])}) ==")
        for e in stats["parse_errors"][:10]:
            print(" ", e)


if __name__ == "__main__":
    sys.exit(main())
