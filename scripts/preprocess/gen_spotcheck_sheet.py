#!/usr/bin/env python3
"""Generate a human-readable WIS spot-check sheet from sampled workbooks."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from agent_pipeline_v2.spec import build_wis  # noqa: E402

SAMPLES = "/tmp/spotcheck_samples.json"
OUT = "plan/wis_spotcheck.md"

CONF_ICON = {"explicit": "🟢明写", "inferred": "🟡推断", "missing": "🔴缺失"}


def collect_fields(node, out):
    if node.get("op") == "field":
        f = node["field"]
        deriv = "" if f["derivation"] == "None" else f"[{f['derivation']}]"
        out.append(deriv + f["name"])
    for ch in node.get("children") or []:
        collect_fields(ch, out)


def main():
    samples = json.load(open(SAMPLES))
    lines = [
        "# WIS 抽查对照表",
        "",
        "用法：对每个 workbook，打开它目录里的 PNG 截图，逐视图核对解析结果。",
        "重点核对 🟡推断 的（explicit 是文件明写，基本不会错）。",
        "核对项：①图类型对不对 ②rows/cols 翻译对不对 ③颜色按什么字段 ④交互联动对不对",
    ]
    for s in samples:
        wis = s["wis"]
        lines.append(f"\n---\n\n## 📁 {s['dir']}")
        lines.append(f"\n截图文件：`{s['png']}`\n")
        for ws in wis["worksheets"]:
            m = ws["mark"]
            hidden = "" if ws.get("on_dashboard") else "　🚫未上仪表盘（截图里没有，不用核对）"
            subtype = ""
            if m["resolved"] == "map" and m.get("map_subtype"):
                shape = f"，点形状 {m['symbol_shape']}" if m.get("symbol_shape") else ""
                subtype = f"（{'填充地图' if m['map_subtype'] == 'filled' else '散点地图'}{shape}）"
            lines.append(f"### 视图「{ws['name'].strip()}」→ **{m['resolved']}**{subtype} {CONF_ICON[m['confidence']]}{hidden}")
            if m["confidence"] == "inferred":
                lines.append(f"- 推断依据: `{m['rule']}`")
            for axis in ("rows", "cols"):
                fields = []
                collect_fields(ws["shelves"][axis]["expr"], fields)
                if fields:
                    lines.append(f"- {axis}: {' × '.join(fields)}")
            for c in ws["encodings"].get("color", []):
                extra = f"，显式颜色 {c['explicit_colors']}" if c.get("explicit_colors") else ""
                lines.append(f"- 颜色: 按 {c['field']['name']}{extra}")
            if any(f.get("linked_action") for f in ws["filters"]):
                lines.append("- ⚡ 此视图响应交互动作（被联动）")
        for a in wis["actions"]:
            linked = ", ".join(w.strip() for w in a.get("linked_worksheets", [])) or "整个仪表盘"
            lines.append(
                f"\n**交互**: 在「{a['source'].get('worksheet', '?').strip()}」上 "
                f"{a['activation'].get('type', '?')} → {a['command']} → 影响 {linked}"
            )
        zones = wis["dashboards"][0]["zones"] if wis["dashboards"] else []
        special = [z for z in zones if z["type"] in ("filter", "color", "text")]
        if special:
            ctrl = "; ".join(
                f"{z['type']}({(z.get('param_field') or {}).get('name', '') or z.get('name', '')})"
                for z in special
            )
            lines.append(f"\n**控件/图例**: {ctrl}")

    Path(OUT).write_text("\n".join(lines), encoding="utf-8")
    print(f"written: {OUT}")


if __name__ == "__main__":
    main()
