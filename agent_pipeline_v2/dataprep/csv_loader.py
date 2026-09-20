"""CSV loading and enrichment: raw .twbx-era CSV → clean typed rows.

Handles the corpus's real-world mess:
  - triple-quoted headers  (\"\"\"CompID\"\"\" → CompID)
  - floats in integer columns ("64698.0")
  - multiple date formats
  - trailing empty fields / BOM

Type coercion is driven by WIS datasource metadata (datatype per column).
Calculated fields (from WIS) are materialized as new columns via formula.py.
"""

from __future__ import annotations

import csv
import re
from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from .formula import UnsupportedFormula, compile_formula

__all__ = ["load_enriched_dataset", "EnrichedDataset", "CoercionReport"]


class CoercionReport:
    def __init__(self) -> None:
        self.column_kinds: Dict[str, str] = {}
        self.failures: Dict[str, int] = {}
        self.unsupported_formulas: Dict[str, str] = {}

    def as_dict(self) -> Dict[str, Any]:
        return {
            "column_kinds": self.column_kinds,
            "failures": self.failures,
            "unsupported_formulas": self.unsupported_formulas,
        }


class EnrichedDataset:
    def __init__(self, name: str, columns: List[str], rows: List[Dict[str, Any]],
                 report: CoercionReport) -> None:
        self.name = name
        self.columns = columns
        self.rows = rows
        self.report = report

    def as_json(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "columns": self.columns,
            "row_count": len(self.rows),
            "report": self.report.as_dict(),
            "rows": self.rows,
        }


def _clean_cell(text: str) -> str:
    """Strip BOM, whitespace, and one layer of surrounding quotes."""
    value = text.strip().lstrip("﻿")
    while len(value) >= 2 and value.startswith('"') and value.endswith('"'):
        value = value[1:-1].strip()
    return value


_INT_RE = re.compile(r"^-?\d+(\.0+)?$")
_FLOAT_RE = re.compile(r"^-?\d+\.\d+$|^-?\d+\.?\d*[eE][-+]?\d+$")

_DATE_FORMATS = (
    "%Y-%m-%d", "%Y/%m/%d", "%m/%d/%Y", "%d/%m/%Y", "%m-%d-%Y",
    "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S.%f",
    "%m/%d/%Y %H:%M:%S", "%d %b %Y", "%b %d, %Y",
)


def _parse_date(value: str) -> Optional[date]:
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(value.strip(), fmt)
        except ValueError:
            continue
    return None


def _coerce(value: str, datatype: str) -> Tuple[Any, bool]:
    """Coerce a cleaned string to the WIS datatype. Returns (value, ok)."""
    if value == "" or value.lower() in ("null", "nan"):
        return None, True
    dt = datatype.lower()
    if dt in ("integer",):
        if _INT_RE.match(value):
            return int(float(value)), True
        return value, False
    if dt in ("real", "float", "double"):
        try:
            return float(value.replace(",", "")), True
        except ValueError:
            return value, False
    if dt in ("date", "datetime"):
        parsed = _parse_date(value)
        if parsed is not None:
            return parsed.isoformat() if parsed else None, True
        return value, False
    # string / unknown: keep as-is
    return value, True


def _guess_kind(values: List[str]) -> str:
    """Datatype guess when WIS metadata is missing for a column."""
    samples = [v for v in values if v][:50]
    if not samples:
        return "string"
    ints = sum(1 for v in samples if _INT_RE.match(v))
    floats = sum(1 for v in samples if _FLOAT_RE.match(v) or _INT_RE.match(v))
    dates = sum(1 for v in samples if _parse_date(v) is not None)
    if ints == len(samples):
        return "integer"
    if floats == len(samples):
        return "real"
    if dates >= len(samples) * 0.8:
        return "date"
    return "string"


def load_enriched_dataset(
    csv_path: str | Path,
    *,
    name: Optional[str] = None,
    wis_fields: Optional[List[Dict[str, Any]]] = None,
    calculated_fields: Optional[List[Dict[str, Any]]] = None,
    sample_limit: Optional[int] = None,
) -> EnrichedDataset:
    """Load a CSV and return an EnrichedDataset.

    wis_fields: WIS datasource field metadata (datatype per column).
    calculated_fields: WIS calculated fields; each is materialized via its formula.
    """
    csv_path = Path(csv_path)
    report = CoercionReport()

    with csv_path.open("r", encoding="utf-8-sig", errors="replace", newline="") as fh:
        # strip NUL bytes — a few corpus CSVs contain them and break csv.reader
        reader = csv.reader(line.replace("\x00", "") for line in fh)
        raw_header = next(reader)
        columns = [_clean_cell(h) for h in raw_header]
        raw_rows: List[List[str]] = []
        for i, row in enumerate(reader):
            if sample_limit is not None and i >= sample_limit:
                break
            if not any(cell.strip() for cell in row):
                continue
            # pad short rows
            if len(row) < len(columns):
                row = row + [""] * (len(columns) - len(row))
            raw_rows.append(row)

    # datatype lookup from WIS metadata
    datatype_by_col: Dict[str, str] = {}
    for f in wis_fields or []:
        remote = (f.get("remote_name") or "").strip()
        datatype = (f.get("datatype") or "").strip()
        if remote and datatype:
            datatype_by_col[remote] = datatype

    # materialize calculated fields first (they may be needed by coercion? no — append after)
    calc_runs: List[Tuple[str, Any]] = []
    for cf in calculated_fields or []:
        formula = cf.get("formula", "")
        col_name = (cf.get("name") or cf.get("caption") or "").strip("[]")
        if not formula or not col_name:
            continue
        try:
            calc_runs.append((col_name, compile_formula(formula)))
        except UnsupportedFormula as exc:
            report.unsupported_formulas[col_name] = str(exc)

    rows: List[Dict[str, Any]] = []
    for raw in raw_rows:
        cleaned = [_clean_cell(cell) for cell in raw[: len(columns)]]
        base: Dict[str, Any] = dict(zip(columns, cleaned))
        # calculated fields evaluated on the raw-string row
        for col_name, run in calc_runs:
            try:
                value = run(base)
                if isinstance(value, (datetime, date)):
                    value = value.isoformat()
                base[col_name] = value
            except Exception:
                base[col_name] = None
        rows.append(base)

    # type coercion per column
    final_columns = columns + [name for name, _ in calc_runs if name not in columns]
    for col in final_columns:
        datatype = datatype_by_col.get(col)
        if not datatype:
            datatype = _guess_kind([str(r.get(col) or "") for r in rows[:200]])

        # coerce into a parallel list first, keeping originals for downgrade
        coerced_values: List[Any] = []
        failures = 0
        for row in rows:
            raw_value = row.get(col)
            if raw_value is None or isinstance(raw_value, (int, float)):
                coerced_values.append(raw_value)
                continue
            coerced, ok = _coerce(str(raw_value), datatype)
            coerced_values.append(coerced)
            if not ok:
                failures += 1

        # auto-downgrade: a "numeric" column that actually contains non-numeric
        # values (e.g. rank codes like 'CMS') is a categorical string column
        if failures and datatype.lower() in ("integer", "real", "float", "double"):
            datatype = "string"

            def _as_string(v: Any) -> Any:
                if v is None or isinstance(v, str):
                    return v
                if isinstance(v, float) and v.is_integer():
                    return str(int(v))
                return str(v)

            coerced_values = [_as_string(v) for v in coerced_values]
            failures = 0

        report.column_kinds[col] = datatype
        for row, value in zip(rows, coerced_values):
            row[col] = value
        if failures:
            report.failures[col] = failures

    return EnrichedDataset(name or csv_path.stem, final_columns, rows, report)


def find_data_file(data_dir: str | Path, caption: str) -> Optional[Path]:
    """Match a WIS datasource caption to a CSV file in data_dir.

    Multi-table datasources (Orders/People/Returns) are common: fuzzy matches
    prefer the *largest* candidate, since the fact table dwarfs dimension tables.
    (Full join support is out of scope for v1.)
    """
    data_dir = Path(data_dir)
    if not data_dir.exists():
        return None
    exact = data_dir / f"{caption}.csv"
    if exact.exists():
        return exact

    def tokens(s: str) -> set:
        return {t for t in re.split(r"[^a-z0-9]+", s.lower()) if t}

    cap_tokens = tokens(caption)
    best: Optional[Path] = None
    best_key = (0.0, 0)
    for path in data_dir.glob("*.csv"):
        file_tokens = tokens(path.stem)
        if not file_tokens or not cap_tokens:
            continue
        overlap = len(cap_tokens & file_tokens) / max(len(cap_tokens), 1)
        # 并列时取更大文件（事实表通常远大于维表）
        key = (overlap, path.stat().st_size)
        if overlap > 0 and key > best_key:
            best, best_key = path, key
    if best is not None:
        return best
    # fallback: caption 与文件名完全对不上（如文件就叫 federated.csv）→ 取最大文件
    csvs = sorted(data_dir.glob("*.csv"), key=lambda p: -p.stat().st_size)
    return csvs[0] if csvs else None
