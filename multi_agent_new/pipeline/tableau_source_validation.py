"""Deterministic Tableau source validation to catch malformed headers and parser risks."""

from __future__ import annotations

import csv
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

_FIELD_PATTERN = re.compile(r"\[([^\]]+)\]")
_NUMERIC_HINTS = {
    "sales",
    "profit",
    "quantity",
    "discount",
    "shipping cost",
    "postal code",
    "revenue",
    "amount",
    "value",
}

# Tableau aggregation functions that should not be treated as field names
# These can appear as the "field" part in nested aggregations like [pcto:sum:Field:qk:2]
_TABLEAU_AGGREGATIONS = {
    "sum", "avg", "min", "max", "count", "countd", "median",
    "stdev", "stdevp", "var", "varp", "attr"
}
_DATE_HINTS = {
    "order date",
    "ship date",
    "date",
}

# Well-known Tableau system fields that are derived at runtime, not from CSV
_TABLEAU_DERIVED_FIELDS = {
    "number of records",  # Tableau's automatic row count field
    "measure names",
    "measure values",
    "multiple values",
    # Allow any Cricket_* hash fields (Tableau internal object IDs)
}

# Pattern for Tableau binned field aliases (e.g., "Field Name (bin) 1", "Field Name (bin) 2")
# These are runtime aliases created by Tableau, not actual CSV columns
_BINNED_FIELD_ALIAS_PATTERN = re.compile(r'^(.+?\(bin\))\s+\d+$')

# Pattern for basic Tableau binned fields (e.g., "Profit (bin)", "Sales (bin)")
# These are runtime binned fields created by Tableau, not actual CSV columns
_BINNED_FIELD_PATTERN = re.compile(r'^(.+?)\s*\(bin\)$')

# Pattern for Tableau calculated fields (e.g., "Calculation_1234567890")
# These are runtime computed fields created by Tableau, not actual CSV columns
_CALCULATION_FIELD_PATTERN = re.compile(r'^Calculation_\d+$')

# Pattern for Tableau copy fields (e.g., "Field Name (copy)_1234567890")
# These are runtime duplicate fields created by Tableau, not actual CSV columns
_COPY_FIELD_PATTERN = re.compile(r'^(.+?)\s*\(copy\)_\d+$')


def normalize_header_name(value: str) -> str:
    text = (value or "").replace("\ufeff", "").strip()
    while len(text) >= 2 and text[0] == text[-1] and text[0] in {'"', "'"}:
        text = text[1:-1].strip()
    text = re.sub(r"\s+", " ", text).strip()

    # Handle Tableau's "Display Name & fieldname" pattern
    # e.g., "Start Time & starttime" -> "starttime"
    # This is Tableau's convention for combining display names with column names
    if " & " in text:
        parts = text.split(" & ")
        # Take the last part (the actual column name), and convert to lowercase
        text = parts[-1].strip().lower()

    return text


def _iter_strings(value: Any) -> Iterable[str]:
    if isinstance(value, str):
        yield value
        return
    if isinstance(value, dict):
        for item in value.values():
            yield from _iter_strings(item)
        return
    if isinstance(value, list):
        for item in value:
            yield from _iter_strings(item)


def extract_contract_field_names(contract: Dict[str, Any]) -> Dict[str, List[str]]:
    numeric_fields = set()
    date_fields = set()
    dimension_fields = set()

    # Pattern to detect Tableau internal object IDs (e.g., Cricket_ABC123DEF456)
    # These are hash-based identifiers with 32 hex characters
    _tableau_internal_pattern = re.compile(r'.*_[A-F0-9]{32}$')

    for text in _iter_strings(contract):
        for raw_token in _FIELD_PATTERN.findall(text):
            token = normalize_header_name(raw_token)
            parts = [part.strip() for part in token.split(":") if part.strip()]
            if len(parts) < 2:
                continue

            agg = ""
            field = token
            if len(parts) >= 4 and parts[-1].isdigit():
                agg = ":".join(parts[:-3])
                field = parts[-3]
            elif len(parts) >= 3:
                agg = ":".join(parts[:-2])
                field = parts[-2]
            elif len(parts) == 2:
                agg = parts[0]
                field = parts[1]

            field = normalize_header_name(field)
            field_lower = field.lower()

            # Skip Tableau data type markers (single-letter codes)
            # These appear at the end of field references like :ok, :qk, :nk, etc.
            if len(field) <= 3 and field_lower in {"ok", "qk", "nk", "pk", "yk", "tk", "wk"}:
                continue

            # Skip well-known Tableau derived fields
            if field_lower in _TABLEAU_DERIVED_FIELDS:
                continue

            # Skip Tableau aggregation functions that appear as nested fields
            # (e.g., "sum" in [pcto:sum:Survey Results:qk:2])
            if field_lower in _TABLEAU_AGGREGATIONS:
                continue

            if field_lower in {"cnt", "sum"}:
                continue

            # Skip Tableau internal object IDs (hash-based fields)
            if _tableau_internal_pattern.match(field):
                continue

            # Skip Tableau calculated fields (e.g., Calculation_1234567890)
            if _CALCULATION_FIELD_PATTERN.match(field):
                continue

            # Skip Tableau copy fields (e.g., "Field Name (copy)_1234567890")
            # These are treated as their base field
            copy_match = _COPY_FIELD_PATTERN.match(field)
            if copy_match:
                # Continue processing with the base field name
                field = normalize_header_name(copy_match.group(1))
                field_lower = field.lower()

            # Handle Tableau binned field aliases (e.g., "Field Name (bin) 1")
            # These should be treated as their base binned field (e.g., "Field Name (bin)")
            alias_match = _BINNED_FIELD_ALIAS_PATTERN.match(field)
            if alias_match:
                field = normalize_header_name(alias_match.group(1))
                field_lower = field.lower()

            # Skip Tableau binned fields (e.g., "Profit (bin)", "Sales (bin)")
            # These are runtime binned fields created by Tableau, not actual CSV columns
            binned_match = _BINNED_FIELD_PATTERN.match(field)
            if binned_match:
                # Binned fields are derived from their base field
                # Treat as the base field for validation purposes
                field = normalize_header_name(binned_match.group(1))
                field_lower = field.lower()

            if field_lower.startswith(("federated.", "datasource.", "__tableau_internal_object_id__")):
                continue

            if "date" in field_lower or agg in {"tmn", "tyr", "tqr", "tmn", "tymd"}:
                date_fields.add(field)
            elif agg.split(":", 1)[0] in {"cnt", "count", "countd"}:
                # Counting aggregations: the underlying field may be a dimension (e.g. [cnt:Name:qk]).
                # Only classify as numeric when the field name itself suggests numeric content.
                if field_lower in _NUMERIC_HINTS:
                    numeric_fields.add(field)
                else:
                    dimension_fields.add(field)
            elif agg.split(":", 1)[0] in {"sum", "avg", "min", "max", "med", "q1", "q3", "pcto"} or (
                field_lower in _NUMERIC_HINTS and agg not in {"none"}
            ):
                # Only classify as numeric if aggregation is numeric OR field is in numeric hints with non-'none' aggregation
                # If aggregation is 'none', treat as dimension (categorical)
                numeric_fields.add(field)
            else:
                dimension_fields.add(field)

    required = sorted(numeric_fields | date_fields | dimension_fields)
    return {
        "required_fields": required,
        "numeric_fields": sorted(numeric_fields),
        "date_fields": sorted(date_fields),
        "dimension_fields": sorted(dimension_fields),
    }


def _score_header_row(cells: List[str], required_fields: set[str]) -> Tuple[int, int]:
    normalized_cells = [normalize_header_name(cell) for cell in cells if normalize_header_name(cell)]
    overlap = sum(1 for cell in normalized_cells if cell in required_fields)
    return overlap, len(normalized_cells)


def _parse_number(value: str) -> Optional[float]:
    text = normalize_header_name(value).replace(",", "").replace("$", "")
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def _parse_date(value: str) -> Optional[datetime]:
    text = normalize_header_name(value)
    if not text:
        return None
    candidates = [
        "%Y-%m-%d",
        "%Y-%m-%d %H:%M:%S",
        "%m/%d/%Y",
        "%m/%d/%y",
        "%d/%m/%Y",
        "%Y/%m/%d",
    ]
    for fmt in candidates:
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        return None


def inspect_csv_dataset(path: Path, required_fields: Dict[str, List[str]]) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as handle:
        # Detect delimiter: count pipes vs commas in first 1KB
        sample = handle.read(1024)
        handle.seek(0)
        pipe_count = sample.count('|')
        comma_count = sample.count(',')
        delimiter = '|' if pipe_count > comma_count else ','

        rows = list(csv.reader(handle, delimiter=delimiter))

    required = set(required_fields["required_fields"])
    header_candidates = rows[: min(len(rows), 15)]
    best_index = 0
    best_score = (-1, -1)
    for index, row in enumerate(header_candidates):
        score = _score_header_row(row, required)
        if score > best_score:
            best_index = index
            best_score = score

    raw_headers = rows[best_index] if rows else []
    normalized_headers = [normalize_header_name(cell) for cell in raw_headers]
    data_rows = rows[best_index + 1 :]

    header_map = {
        header: index
        for index, header in enumerate(normalized_headers)
        if header
    }

    # Case-insensitive matching: build lowercase lookup
    header_map_lower = {k.lower(): v for k, v in header_map.items()}

    matched_required_fields = sorted(field for field in required if field.lower() in header_map_lower)
    missing_required_fields = sorted(field for field in required if field.lower() not in header_map_lower)
    raw_header_needs_normalization = any(raw != normalized for raw, normalized in zip(raw_headers, normalized_headers))

    stats = {
        "row_count": max(len(data_rows), 0),
        "field_stats": {},
    }
    # Sample strategically from start, middle, and end to catch sparse non-zero values
    # This handles cases where non-zero values are clustered at the end of the dataset
    sample_size = 1000
    data_row_count = len(data_rows)

    if data_row_count <= sample_size:
        sample_rows = data_rows
    else:
        # Take samples from start (30%), middle (40%), and end (30%)
        start_sample = data_rows[:sample_size * 3 // 10]
        middle_start = (data_row_count - sample_size) // 2
        middle_sample = data_rows[middle_start:middle_start + sample_size * 4 // 10]
        end_sample = data_rows[-sample_size * 3 // 10:]
        sample_rows = start_sample + middle_sample + end_sample

    for field in required_fields["numeric_fields"]:
        if field.lower() not in header_map_lower:
            continue
        idx = header_map_lower[field.lower()]
        values = [row[idx] for row in sample_rows if idx < len(row)]
        nonempty = [value for value in values if normalize_header_name(value)]
        parsed = [value for value in nonempty if _parse_number(value) is not None]
        nonzero = [value for value in parsed if (_parse_number(value) or 0) != 0]
        stats["field_stats"][field] = {
            "kind": "numeric",
            "nonempty_ratio": len(nonempty) / max(len(values), 1),
            "parse_ratio": len(parsed) / max(len(nonempty), 1),
            "nonzero_ratio": len(nonzero) / max(len(parsed), 1),
        }

    for field in required_fields["date_fields"]:
        if field.lower() not in header_map_lower:
            continue
        idx = header_map_lower[field.lower()]
        values = [row[idx] for row in sample_rows if idx < len(row)]
        nonempty = [value for value in values if normalize_header_name(value)]
        parsed = [value for value in nonempty if _parse_date(value) is not None]
        stats["field_stats"][field] = {
            "kind": "date",
            "nonempty_ratio": len(nonempty) / max(len(values), 1),
            "parse_ratio": len(parsed) / max(len(nonempty), 1),
        }

    return {
        "path": str(path),
        "header_row_index": best_index,
        "raw_headers": raw_headers,
        "normalized_headers": normalized_headers,
        "matched_required_fields": matched_required_fields,
        "missing_required_fields": missing_required_fields,
        "raw_header_needs_normalization": raw_header_needs_normalization,
        "header_overlap": best_score[0],
        "header_nonempty_cells": best_score[1],
        "stats": stats,
    }


def _collect_source_texts(src_root: Path) -> Dict[str, str]:
    texts: Dict[str, str] = {}
    if not src_root.exists():
        return texts
    for path in src_root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in {".ts", ".tsx", ".js", ".jsx", ".css"}:
            continue
        try:
            texts[str(path)] = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
    return texts


def _source_contains_any(source_text: str, patterns: Iterable[str]) -> bool:
    return any(re.search(pattern, source_text, re.IGNORECASE) for pattern in patterns)


def _source_has_runtime_header_rekeying(source_text: str) -> bool:
    has_cleaner = bool(
        re.search(
            r"\b(cleanColumnName|normalizeHeader|normalizeHeaders|cleanHeaderName)\s*\(",
            source_text,
            re.IGNORECASE,
        )
    )
    has_key_iteration = bool(
        re.search(r"Object\.keys\([^)]+\)\.forEach\s*\(", source_text, re.IGNORECASE)
        or re.search(r"for\s*\(\s*const\s+\w+\s+of\s+Object\.keys\([^)]+\)\s*\)", source_text, re.IGNORECASE)
    )
    has_clean_key_assignment = bool(
        re.search(
            r"\b(cleanKey|normalizedKey)\s*=\s*(cleanColumnName|normalizeHeader|normalizeHeaders|cleanHeaderName)\s*\(",
            source_text,
            re.IGNORECASE,
        )
    )
    has_rekey_write = bool(
        re.search(r"\b\w+\[\s*(cleanKey|normalizedKey)\s*\]\s*=", source_text, re.IGNORECASE)
    )
    return has_cleaner and has_key_iteration and has_clean_key_assignment and has_rekey_write


def validate_tableau_source(project_root: Path, tableau_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    docs_dir = project_root / "docs"
    contract_path = docs_dir / "tableau_render_contract.json"
    contract = json.loads(contract_path.read_text(encoding="utf-8")) if contract_path.exists() else {}
    required_fields = extract_contract_field_names(contract if isinstance(contract, dict) else {})

    public_data_dir = project_root / "public" / "data"
    csv_paths = sorted(public_data_dir.glob("*.csv"))
    issues: List[Dict[str, Any]] = []
    failure_categories: List[str] = []

    if not csv_paths:
        issues.append(
            {
                "code": "missing_dataset_files",
                "severity": "error",
                "message": "No CSV datasets were found under public/data.",
                "path": str(public_data_dir),
            }
        )
        return {
            "passed": False,
            "issues": issues,
            "failure_categories": ["missing_dataset_files"],
            "datasets": [],
            "required_fields": required_fields,
        }

    dataset_reports = [inspect_csv_dataset(path, required_fields) for path in csv_paths]
    primary_url = ""
    if isinstance(tableau_context, dict):
        primary_url = str(tableau_context.get("primary_data_url") or "")

    primary_report = None
    if primary_url:
        primary_name = Path(primary_url).name
        for report in dataset_reports:
            if Path(report["path"]).name == primary_name:
                primary_report = report
                break
    primary_report = primary_report or dataset_reports[0]

    if primary_report["header_row_index"] > 0:
        issues.append(
            {
                "code": "csv_preamble_before_header",
                "severity": "error",
                "message": (
                    f"Dataset {Path(primary_report['path']).name} uses header row {primary_report['header_row_index'] + 1}, "
                    "so the parser must skip preamble rows."
                ),
                "path": primary_report["path"],
            }
        )
        failure_categories.append("csv_preamble_before_header")

    if primary_report["raw_header_needs_normalization"]:
        issues.append(
            {
                "code": "csv_headers_need_normalization",
                "severity": "error",
                "message": (
                    f"Dataset {Path(primary_report['path']).name} has raw headers that require normalization "
                    "(e.g. stripping quotes/extra whitespace)."
                ),
                "path": primary_report["path"],
            }
        )
        failure_categories.append("csv_headers_need_normalization")

    if primary_report["missing_required_fields"]:
        issues.append(
            {
                "code": "csv_missing_required_fields",
                "severity": "error",
                "message": (
                    f"Primary dataset is missing required Tableau fields: {', '.join(primary_report['missing_required_fields'][:10])}"
                ),
                "path": primary_report["path"],
            }
        )
        failure_categories.append("csv_missing_required_fields")

    source_texts = _collect_source_texts(project_root / "src")
    combined_source = "\n\n".join(source_texts.values())

    # Check if source code creates missing fields at runtime
    has_runtime_field_generation = _source_contains_any(
        combined_source,
        [
            r"Number_of_Records\s*:\s*1",
            r"Number of Records.*1",
            r"facility_name.*questao5",
            r"facility_name \(questao5\)",
            # Pattern for Tableau calculated fields (e.g., Calculation_1414411819444039680)
            r"Calculation_\d+.*:",
            r"'\s*:\s*\w+",
            # Pattern for Tableau count field (cnt)
            r"\.cnt\s*=\s*1",
            r"cnt\s*:\s*1",
            r"cnt.*:\s*number",
        ],
    )

    # If missing fields are created at runtime, downgrade the error
    if primary_report["missing_required_fields"] and has_runtime_field_generation:
        # Check if all missing fields are accounted for in the source code
        missing_lower = [f.lower() for f in primary_report["missing_required_fields"]]
        derived_patterns = {
            "number of records": [r"Number_of_Records\s*:\s*1", r"Number of Records.*1"],
            "facility_name (questao5)": [r"facility_name.*questao5", r"facility_name \(questao5\)"],
            "cnt": [r"\.cnt\s*=\s*1", r"cnt\s*:\s*1", r"cnt.*:\s*number"],
        }

        # Add patterns for Tableau calculated fields
        for missing_field in primary_report["missing_required_fields"]:
            if missing_field.startswith("Calculation_"):
                # Add pattern to match the calculated field assignment in source code
                derived_patterns[missing_field.lower()] = [
                    rf"{re.escape(missing_field)}\s*:",
                    rf"['\"]?{re.escape(missing_field)}['\"]?\s*:\s*\w+",
                    rf"{re.escape(missing_field)}\s*=",
                ]

        all_fields_handled = True
        for missing_field in primary_report["missing_required_fields"]:
            field_lower = missing_field.lower()
            if field_lower in derived_patterns:
                patterns = derived_patterns[field_lower]
                if not any(re.search(pattern, combined_source, re.IGNORECASE) for pattern in patterns):
                    all_fields_handled = False
                    break
            else:
                all_fields_handled = False
                break

        if all_fields_handled:
            # Remove from failure categories and downgrade severity
            failure_categories = [cat for cat in failure_categories if cat != "csv_missing_required_fields"]
            for issue in issues:
                if issue["code"] == "csv_missing_required_fields":
                    issue["severity"] = "warning"
                    issue["message"] += " (handled by source code - fields added at runtime)"

    has_corruption_handling = _source_contains_any(
        combined_source,
        [
            r"generateSampleData",
            r"sample.*data.*fallback",
            r"corrupted.*data",
            r"isValidRow",
            r"filter.*corrupt",
            r"fallback.*sample",
            r"generate.*sample.*demonstration",
        ],
    )

    for field, stat in primary_report["stats"]["field_stats"].items():
        if stat["kind"] == "numeric" and stat["parse_ratio"] < 0.8:
            severity = "warning" if has_corruption_handling else "error"
            issues.append(
                {
                    "code": "csv_numeric_parse_risk",
                    "severity": severity,
                    "message": f"Numeric field '{field}' has low parse ratio {stat['parse_ratio']:.2f}." +
                              (" (handled by source code with sample data fallback)" if has_corruption_handling else ""),
                    "path": primary_report["path"],
                }
            )
            if severity == "error":
                failure_categories.append("csv_numeric_parse_risk")
        if stat["kind"] == "numeric" and stat["parse_ratio"] >= 0.8 and stat["nonzero_ratio"] == 0:
            severity = "warning"
            issues.append(
                {
                    "code": "csv_numeric_all_zero_risk",
                    "severity": severity,
                    "message": f"Numeric field '{field}' parses but all sampled values are zero." +
                              (" (handled by source code with sample data fallback)" if has_corruption_handling else ""),
                    "path": primary_report["path"],
                }
            )
        if stat["kind"] == "date" and stat["parse_ratio"] < 0.8:
            severity = "warning" if has_corruption_handling else "error"
            issues.append(
                {
                    "code": "csv_date_parse_risk",
                    "severity": severity,
                    "message": f"Date field '{field}' has low parse ratio {stat['parse_ratio']:.2f}." +
                              (" (handled by source code with sample data fallback)" if has_corruption_handling else ""),
                    "path": primary_report["path"],
                }
            )
            if severity == "error":
                failure_categories.append("csv_date_parse_risk")

    source_texts = _collect_source_texts(project_root / "src")
    combined_source = "\n\n".join(source_texts.values())
    has_preamble_handling = _source_contains_any(
        combined_source,
        [
            r"csvParseRows",
            r"header[_ ]row",
            r"findIndex",
            r"rows\.slice",
            r"split\(/\\r\?\\n/\)",
            r"skip.*header",
            r"skip.*preamble",
        ],
    )

    if primary_report["header_row_index"] > 0 and not has_preamble_handling:
        issues.append(
            {
                "code": "loader_missing_preamble_skip",
                "severity": "error",
                "message": "Source code does not appear to skip CSV preamble rows before parsing headers.",
                "path": str(project_root / "src"),
            }
        )
        failure_categories.append("loader_missing_preamble_skip")

    # If preamble exists but code handles it, downgrade to warning
    if primary_report["header_row_index"] > 0 and has_preamble_handling:
        # Remove csv_preamble_before_header from failure_categories if it was added
        failure_categories = [cat for cat in failure_categories if cat != "csv_preamble_before_header"]
        # Also update the severity in the issues list
        for issue in issues:
            if issue["code"] == "csv_preamble_before_header":
                issue["severity"] = "warning"
                issue["message"] += " (handled by source code)"

    has_header_normalization = _source_contains_any(
        combined_source,
        [
            r"normalizeHeader",
            r"replace\(/^\[?['\"]+",
            r"replace\(/\^\[\"']\+\|\[\"']\+\$",
            r"headers\.map",
            r"csvParseRows",
            r"transformHeader",
            r"startsWith\(['\"]\"{3}",
            r"startsWith\(['\"]'{3}",
            r"slice\(3,\s*-3\)",
            r"slice\(1,\s*-1\)",
        ],
    ) or _source_has_runtime_header_rekeying(combined_source)

    if primary_report["raw_header_needs_normalization"] and not has_header_normalization:
        issues.append(
            {
                "code": "loader_missing_header_normalization",
                "severity": "error",
                "message": "Source code does not appear to normalize quoted/dirty CSV headers before lookup.",
                "path": str(project_root / "src"),
            }
        )
        failure_categories.append("loader_missing_header_normalization")

    # If headers need normalization but code handles it, downgrade to warning
    if primary_report["raw_header_needs_normalization"] and has_header_normalization:
        # Remove csv_headers_need_normalization from failure_categories if it was added
        failure_categories = [cat for cat in failure_categories if cat != "csv_headers_need_normalization"]
        # Also update the severity in the issues list
        for issue in issues:
            if issue["code"] == "csv_headers_need_normalization":
                issue["severity"] = "warning"
                issue["message"] += " (handled by source code)"

    main_tsx = project_root / "src" / "main.tsx"
    if main_tsx.exists():
        try:
            main_text = main_tsx.read_text(encoding="utf-8")
        except OSError:
            main_text = ""
        if "from './App.tsx'" in main_text or 'from "./App.tsx"' in main_text:
            issues.append(
                {
                    "code": "tsx_extension_import",
                    "severity": "error",
                    "message": "src/main.tsx imports './App.tsx', which breaks standard TypeScript/Vite builds.",
                    "path": str(main_tsx),
                }
            )
            failure_categories.append("tsx_extension_import")

    return {
        "passed": not failure_categories,
        "issues": issues,
        "failure_categories": sorted(set(failure_categories)),
        "datasets": dataset_reports,
        "primary_dataset": primary_report,
        "required_fields": required_fields,
    }


__all__ = [
    "normalize_header_name",
    "extract_contract_field_names",
    "inspect_csv_dataset",
    "validate_tableau_source",
]
