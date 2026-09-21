"""Constructibility check — 可构造性判定（只记录，不删除）。

Two tiers:
  reject — 证据确凿（字段不存在 / 用到不支持的公式 / 需要地理编码）
  review — 可疑但可能合法（结果 0 行 / 分组键 null 比例高）

Everything is a *report*: rejected workbooks stay on disk and can be
re-admitted once the underlying gap is fixed.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List

__all__ = ["check_constructibility"]

GEO_FIELDS = {"Latitude (generated)", "Longitude (generated)"}


def check_constructibility(
    wis: Dict[str, Any],
    dataset_columns: List[str],
    unsupported_formulas: Dict[str, str],
    specs: List[Dict[str, Any]],
    query_results: Dict[str, List[Dict[str, Any]]],
) -> Dict[str, Any]:
    """Return {status: ok|reject|review, reasons: [...]}.

    wis: WIS object; dataset_columns: enriched column names;
    unsupported_formulas: from CoercionReport; specs: derived query specs;
    query_results: view_id -> executed rows.
    """
    reasons: List[Dict[str, str]] = []
    columns = set(dataset_columns)

    # unsupported formulas actually used by on-dashboard views
    used_calc = {
        (cf.get("name") or "").strip("[]")
        for ws in wis.get("worksheets", [])
        if ws.get("on_dashboard")
        for cf in ws.get("calculated_fields", [])
    }
    for name, err in unsupported_formulas.items():
        if name in used_calc:
            reasons.append({
                "tier": "reject",
                "kind": "unsupported_formula_used",
                "detail": f"计算字段 {name} 被上架视图使用但无法求值: {err[:80]}",
            })

    for spec in specs:
        view = spec["view_name"].strip()
        rows = query_results.get(spec["view_id"], [])

        # 字段存在性（group_by / aggregates / filters 引用的列必须在数据里）
        referenced = (
            [g["field"] for g in spec.get("group_by", [])]
            + [a["field"] for a in spec.get("aggregates", []) if a["field"] != "__rowcount__"]
            + [f["field"] for f in spec.get("filters", [])]
        )
        missing = sorted({f for f in referenced if f not in columns})
        if missing:
            tier = "reject"
            kind = "missing_field"
            # 地理编码单独归类
            if all(m in GEO_FIELDS for m in missing):
                kind = "needs_geocoding"
            reasons.append({
                "tier": tier,
                "kind": kind,
                "detail": f"视图「{view}」引用了数据中不存在的列: {missing[:3]}",
            })

        # 空结果 / 分组键全 null → review 档
        if not rows:
            reasons.append({
                "tier": "review",
                "kind": "empty_result",
                "detail": f"视图「{view}」结果 0 行",
            })
        elif spec.get("group_by"):
            key = spec["group_by"][0]["as"]
            nonnull = sum(1 for r in rows if r.get(key) is not None)
            if nonnull / len(rows) < 0.5:
                reasons.append({
                    "tier": "review",
                    "kind": "null_group_keys",
                    "detail": f"视图「{view}」分组键 {key} 仅 {nonnull}/{len(rows)} 非空",
                })

    # 上架视图使用聚合链（Calculation_ 引用）
    for ws in wis.get("worksheets", []):
        if not ws.get("on_dashboard"):
            continue
        for cf in ws.get("calculated_fields", []):
            if "[Calculation_" in (cf.get("formula") or ""):
                reasons.append({
                    "tier": "reject",
                    "kind": "aggregate_chain",
                    "detail": f"视图「{ws['name'].strip()}」的计算字段含聚合链",
                })
        for f in ws.get("fields_used", []):
            if re.match(r"^Calculation_\d+$", f.get("name", "")):
                reasons.append({
                    "tier": "reject",
                    "kind": "aggregate_chain",
                    "detail": f"视图「{ws['name'].strip()}」直接引用聚合中间字段 {f['name']}",
                })
                break

    if any(r["tier"] == "reject" for r in reasons):
        status = "reject"
    elif reasons:
        status = "review"
    else:
        status = "ok"
    return {"status": status, "reasons": reasons}
