from __future__ import annotations

import json
from pathlib import Path

from multi_agent_new.pipeline.tableau_source_validation import validate_tableau_source


def _write_contract(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    contract = {
        "worksheets": [
            {
                "name": "Bar",
                "rows_field": "([federated].[none:Category:nk] / [federated].[none:Sub-Category:nk])",
                "cols_field": "[federated].[sum:Sales:qk]",
            },
            {
                "name": "Line",
                "rows_field": "[federated].[sum:Sales:qk]",
                "cols_field": "[federated].[tmn:Order Date:qk]",
            },
        ]
    }
    path.write_text(json.dumps(contract), encoding="utf-8")


def test_validate_tableau_source_detects_preamble_header_and_missing_skip(tmp_path):
    project_root = tmp_path / "app"
    data_path = project_root / "public" / "data" / "orders.csv"
    data_path.parent.mkdir(parents=True, exist_ok=True)
    data_path.write_text(
        "Dataset description,Unused\n"
        ",\n"
        "Row ID,Order Date,Category,Sub-Category,Region,Sales\n"
        "1,2018-01-01,Furniture,Chairs,West,100\n",
        encoding="utf-8",
    )
    _write_contract(project_root / "docs" / "tableau_render_contract.json")
    loader_path = project_root / "src" / "services" / "dataLoader.ts"
    loader_path.parent.mkdir(parents=True, exist_ok=True)
    loader_path.write_text(
        "export async function load() { const text = await (await fetch('/data/orders.csv')).text(); return text; }\n",
        encoding="utf-8",
    )

    validation = validate_tableau_source(project_root, {"primary_data_url": "/data/orders.csv"})
    codes = {issue["code"] for issue in validation["issues"]}

    assert not validation["passed"]
    assert "csv_preamble_before_header" in codes
    assert "loader_missing_preamble_skip" in codes


def test_validate_tableau_source_detects_quoted_headers_and_missing_normalization(tmp_path):
    project_root = tmp_path / "app"
    data_path = project_root / "public" / "data" / "orders.csv"
    data_path.parent.mkdir(parents=True, exist_ok=True)
    data_path.write_text(
        '"""Row ID""","""Order Date""","""Category""","""Sub-Category""","""Region""","""Sales"""\n'
        '1,2018-11-08,Furniture,Bookcases,South,261.96\n',
        encoding="utf-8",
    )
    _write_contract(project_root / "docs" / "tableau_render_contract.json")
    loader_path = project_root / "src" / "services" / "dataLoader.ts"
    loader_path.parent.mkdir(parents=True, exist_ok=True)
    loader_path.write_text(
        "export const field = row['Order Date'];\nexport async function load() { return await fetch('/data/orders.csv'); }\n",
        encoding="utf-8",
    )

    validation = validate_tableau_source(project_root, {"primary_data_url": "/data/orders.csv"})
    codes = {issue["code"] for issue in validation["issues"]}

    assert not validation["passed"]
    assert "csv_headers_need_normalization" in codes
    assert "loader_missing_header_normalization" in codes


def test_validate_tableau_source_accepts_runtime_handled_preamble_headers(tmp_path):
    project_root = tmp_path / "app"
    data_path = project_root / "public" / "data" / "orders.csv"
    data_path.parent.mkdir(parents=True, exist_ok=True)
    data_path.write_text(
        "Dataset description,Unused\n"
        ",\n"
        "Row ID,Order Date,Category,Sub-Category,Region,Sales\n"
        "1,2018-01-01,Furniture,Chairs,West,100\n",
        encoding="utf-8",
    )
    _write_contract(project_root / "docs" / "tableau_render_contract.json")
    loader_path = project_root / "src" / "services" / "dataLoader.ts"
    loader_path.parent.mkdir(parents=True, exist_ok=True)
    loader_path.write_text(
        "export async function load() {\n"
        "  const text = await (await fetch('/data/orders.csv')).text();\n"
        "  const rows = text.split(/\\r?\\n/).map((line) => line.split(','));\n"
        "  const headerRowIndex = rows.findIndex((row) => row[0] === 'Row ID');\n"
        "  return rows.slice(headerRowIndex);\n"
        "}\n",
        encoding="utf-8",
    )

    validation = validate_tableau_source(project_root, {"primary_data_url": "/data/orders.csv"})

    assert validation["passed"]
    assert "csv_preamble_before_header" not in validation["failure_categories"]
    assert "loader_missing_preamble_skip" not in validation["failure_categories"]


def test_validate_tableau_source_accepts_runtime_header_normalization(tmp_path):
    project_root = tmp_path / "app"
    data_path = project_root / "public" / "data" / "orders.csv"
    data_path.parent.mkdir(parents=True, exist_ok=True)
    data_path.write_text(
        '"""Row ID""","""Order Date""","""Category""","""Sub-Category""","""Region""","""Sales"""\n'
        '1,2018-11-08,Furniture,Bookcases,South,261.96\n',
        encoding="utf-8",
    )
    _write_contract(project_root / "docs" / "tableau_render_contract.json")
    loader_path = project_root / "src" / "services" / "dataLoader.ts"
    loader_path.parent.mkdir(parents=True, exist_ok=True)
    loader_path.write_text(
        "export function normalizeHeader(value) {\n"
        "  return value.trim().replace(/^\"+|\"+$/g, '');\n"
        "}\n"
        "export async function load() {\n"
        "  const text = await (await fetch('/data/orders.csv')).text();\n"
        "  const headers = text.split(/\\r?\\n/)[0].split(',').map(normalizeHeader);\n"
        "  return headers;\n"
        "}\n",
        encoding="utf-8",
    )

    validation = validate_tableau_source(project_root, {"primary_data_url": "/data/orders.csv"})

    assert validation["passed"]
    assert "csv_headers_need_normalization" not in validation["failure_categories"]
    assert "loader_missing_header_normalization" not in validation["failure_categories"]


def test_validate_tableau_source_ignores_nested_aggregations_and_runtime_fields(tmp_path):
    project_root = tmp_path / "app"
    data_path = project_root / "public" / "data" / "orders.csv"
    data_path.parent.mkdir(parents=True, exist_ok=True)
    data_path.write_text(
        "client_id,number_diagnoses,Order Date,Sales,Category,Sub-Category,Region\n"
        "1,3,2018-01-01,100,Furniture,Chairs,West\n",
        encoding="utf-8",
    )
    contract = {
        "worksheets": [
            {
                "name": "Runtime Fields",
                "rows_field": "[federated].[pcto:cnt:client_id:qk:11]",
                "cols_field": "[federated].[none:number_diagnoses (bin):qk]",
                "series_field": "[federated].[avg:Calculation_503488417541140484:qk]",
            }
        ]
    }
    contract_path = project_root / "docs" / "tableau_render_contract.json"
    contract_path.parent.mkdir(parents=True, exist_ok=True)
    contract_path.write_text(json.dumps(contract), encoding="utf-8")
    loader_path = project_root / "src" / "services" / "dataLoader.ts"
    loader_path.parent.mkdir(parents=True, exist_ok=True)
    loader_path.write_text(
        "export async function load() {\n"
        "  const text = await (await fetch('/data/orders.csv')).text();\n"
        "  return text;\n"
        "}\n",
        encoding="utf-8",
    )

    validation = validate_tableau_source(project_root, {"primary_data_url": "/data/orders.csv"})
    codes = {issue["code"] for issue in validation["issues"] if isinstance(issue, dict)}

    assert validation["passed"]
    assert "csv_missing_required_fields" not in codes


def test_validate_tableau_source_treats_all_zero_numeric_risk_as_warning(tmp_path):
    project_root = tmp_path / "app"
    data_path = project_root / "public" / "data" / "orders.csv"
    data_path.parent.mkdir(parents=True, exist_ok=True)
    data_path.write_text(
        "caseId,precedentAlteration,issueArea,justiceName,term,vote_direction\n"
        "1,0,Civil Rights,Justice A,2010,1\n"
        "2,0,Civil Rights,Justice B,2011,0\n",
        encoding="utf-8",
    )
    contract = {
        "worksheets": [
            {
                "name": "Sheet",
                "rows_field": "[federated].[sum:precedentAlteration:qk]",
                "cols_field": "[federated].[none:issueArea:nk]",
            }
        ]
    }
    contract_path = project_root / "docs" / "tableau_render_contract.json"
    contract_path.parent.mkdir(parents=True, exist_ok=True)
    contract_path.write_text(json.dumps(contract), encoding="utf-8")
    loader_path = project_root / "src" / "services" / "dataLoader.ts"
    loader_path.parent.mkdir(parents=True, exist_ok=True)
    loader_path.write_text(
        "export async function load() { return fetch('/data/orders.csv'); }\n",
        encoding="utf-8",
    )

    validation = validate_tableau_source(project_root, {"primary_data_url": "/data/orders.csv"})
    codes = {issue["code"]: issue["severity"] for issue in validation["issues"] if isinstance(issue, dict)}

    assert validation["passed"]
    assert codes["csv_numeric_all_zero_risk"] == "warning"


def test_validate_tableau_source_accepts_runtime_header_rekeying(tmp_path):
    project_root = tmp_path / "app"
    data_path = project_root / "public" / "data" / "orders.csv"
    data_path.parent.mkdir(parents=True, exist_ok=True)
    data_path.write_text(
        '"""Row ID""","""Order Date""","""Category""","""Sub-Category""","""Region""","""Sales"""\n'
        '1,2018-11-08,Furniture,Bookcases,South,261.96\n',
        encoding="utf-8",
    )
    _write_contract(project_root / "docs" / "tableau_render_contract.json")
    loader_path = project_root / "src" / "services" / "dataLoader.ts"
    loader_path.parent.mkdir(parents=True, exist_ok=True)
    loader_path.write_text(
        "function cleanColumnName(colName) { return String(colName).replace(/^\\\"|\\\"$/g, '').trim(); }\n"
        "export async function load() {\n"
        "  const text = await (await fetch('/data/orders.csv')).text();\n"
        "  const parsed = text.split(/\\r?\\n/).filter(Boolean).slice(1).map(() => ({}));\n"
        "  return parsed.map((row) => {\n"
        "    const cleaned = {};\n"
        "    Object.keys(row).forEach((key) => {\n"
        "      const cleanKey = cleanColumnName(key);\n"
        "      cleaned[cleanKey] = row[key];\n"
        "    });\n"
        "    return cleaned;\n"
        "  });\n"
        "}\n",
        encoding="utf-8",
    )

    validation = validate_tableau_source(project_root, {"primary_data_url": "/data/orders.csv"})

    assert validation["passed"]
    assert "loader_missing_header_normalization" not in validation["failure_categories"]
