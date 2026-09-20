"""Python execution of query specs (数据订单的 Python 执行器).

Used at build time for validation and prompt samples; the generated app's
TypeScript engine (stage ③) executes the same spec at runtime.
"""

from __future__ import annotations

import statistics
from datetime import date, datetime
from typing import Any, Dict, List, Optional

__all__ = ["run_query", "QueryError"]


class QueryError(Exception):
    pass


def _date_value(v: Any) -> Optional[date]:
    if isinstance(v, datetime):
        return v
    if isinstance(v, date):
        return v
    if isinstance(v, str):
        for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
            try:
                return datetime.strptime(v, fmt)
            except ValueError:
                continue
    return None


def _group_key(row: Dict[str, Any], g: Dict[str, Any]) -> Any:
    value = row.get(g["field"])
    if "date_part" in g:
        dt = _date_value(value)
        if dt is None:
            return None
        part = g["date_part"]
        if part == "year":
            return dt.year
        if part == "quarter":
            return (dt.month - 1) // 3 + 1
        if part == "month":
            return dt.month
        if part == "day":
            return dt.day
        if part == "week":
            return int(dt.strftime("%U"))
        if part == "weekday":
            return dt.isoweekday()
        if part == "mdy":
            return dt.strftime("%m/%d/%Y")
    if "date_trunc" in g:
        dt = _date_value(value)
        if dt is None:
            return None
        trunc = g["date_trunc"]
        if trunc == "year":
            return f"{dt.year}"
        if trunc == "quarter":
            return f"{dt.year}-Q{(dt.month - 1) // 3 + 1}"
        if trunc == "month":
            return f"{dt.year}-{dt.month:02d}"
        if trunc == "week":
            iso = dt.isocalendar()
            return f"{iso[0]}-W{iso[1]:02d}"
        if trunc == "day":
            return dt.strftime("%Y-%m-%d")
        if trunc == "hour":
            return dt.strftime("%Y-%m-%d %H:00")
    return value


def _apply_filter(row: Dict[str, Any], flt: Dict[str, Any]) -> bool:
    value = row.get(flt["field"])
    if flt.get("date_part"):
        value = _date_part_value(value, flt["date_part"])
    op = flt.get("op")
    values = flt.get("values", [])

    def matches(v: Any, target: Any) -> bool:
        if target is None:
            return v is None or v == "" or v == "%null%"
        if v is None:
            return False
        if isinstance(v, (int, float)) and isinstance(target, str):
            try:
                target = float(target)
            except ValueError:
                pass
        elif isinstance(v, str) and isinstance(target, (int, float)):
            try:
                v = float(v)
            except ValueError:
                pass
        return v == target

    if op == "in":
        return any(matches(value, t) for t in values)
    if op == "not_in":
        return not any(matches(value, t) for t in values)
    if op == "neq":
        return not matches(value, flt.get("value"))
    if op == "eq":
        return matches(value, flt.get("value"))
    raise QueryError(f"unknown filter op {op!r}")


def _date_part_value(value: Any, part: str) -> Any:
    dt = _date_value(value)
    if dt is None:
        return None
    if part == "year":
        return dt.year
    if part == "quarter":
        return (dt.month - 1) // 3 + 1
    if part == "month":
        return dt.month
    if part == "day":
        return dt.day
    if part == "week":
        return int(dt.strftime("%U"))
    if part == "weekday":
        return dt.isoweekday()
    if part == "hour":
        return dt.hour if isinstance(dt, datetime) else 0
    return None


def _numeric(values: List[Any]) -> List[float]:
    out = []
    for v in values:
        if v is None:
            continue
        if isinstance(v, bool):
            out.append(1.0 if v else 0.0)
        elif isinstance(v, (int, float)):
            out.append(float(v))
        else:
            try:
                out.append(float(str(v).replace(",", "")))
            except ValueError:
                continue
    return out


def _aggregate(op: str, values: List[Any], field: str = "") -> Any:
    if field == "__rowcount__":
        return len(values)
    if op == "countd":
        return len({str(v) for v in values if v is not None})
    if op == "count":
        return sum(1 for v in values if v is not None)
    nums = _numeric(values)
    if op == "raw":
        return values[0] if values else None
    if not nums:
        return None
    if op == "sum":
        return sum(nums)
    if op == "avg":
        return sum(nums) / len(nums)
    if op == "min":
        return min(nums)
    if op == "max":
        return max(nums)
    if op == "median":
        return statistics.median(nums)
    raise QueryError(f"unknown aggregate op {op!r}")


def run_query(rows: List[Dict[str, Any]], spec: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Execute a query spec over enriched rows; return result rows."""
    # 1. filters
    filtered = rows
    for flt in spec.get("filters", []):
        filtered = [r for r in filtered if _apply_filter(r, flt)]

    group_by = spec.get("group_by", [])
    aggregates = spec.get("aggregates", [])

    # 2. row-level passthrough (scatter / symbol map)
    if spec.get("row_level") or not group_by:
        out = []
        for r in filtered:
            record: Dict[str, Any] = {}
            for agg in aggregates:
                if agg.get("field") == "__rowcount__":
                    record[agg["as"]] = 1  # 行级视图里每行即一条记录
                else:
                    record[agg["as"]] = r.get(agg["field"])
            out.append(record)
        return _post_process(out, spec)

    # 3. group + aggregate
    buckets: Dict[Any, List[Dict[str, Any]]] = {}
    for r in filtered:
        key = tuple(_group_key(r, g) for g in group_by)
        buckets.setdefault(key, []).append(r)

    out = []
    for key, members in buckets.items():
        record = {}
        for g, k in zip(group_by, key):
            record[g["as"]] = k
        for agg in aggregates:
            record[agg["as"]] = _aggregate(agg["op"], [m.get(agg["field"]) for m in members], agg.get("field", ""))
        out.append(record)

    return _post_process(out, spec)


def _post_process(rows: List[Dict[str, Any]], spec: Dict[str, Any]) -> List[Dict[str, Any]]:
    # 4. sort
    for sort in reversed(spec.get("sort", [])):
        field = sort["field"]
        reverse = sort.get("order", "asc") == "desc"
        rows = sorted(rows, key=lambda r: (r.get(field) is None, r.get(field)), reverse=reverse)

    # 5. post-pass ops (cumulative / percent-of-total)
    for agg in spec.get("aggregates", []):
        if agg["op"] == "cumulative":
            total = 0.0
            for r in rows:
                v = r.get(agg["as"])
                if isinstance(v, (int, float)):
                    total += v
                    r[agg["as"]] = total
        elif agg["op"] == "pcto":
            total = sum(v for v in (r.get(agg["as"]) for r in rows) if isinstance(v, (int, float)))
            for r in rows:
                v = r.get(agg["as"])
                r[agg["as"]] = (v / total) if total and isinstance(v, (int, float)) else None
    return rows
