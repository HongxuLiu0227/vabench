from __future__ import annotations

import json
from pathlib import Path

from .models import DashboardSpec, WorksheetSpec


def _resolve_project_root(project_path: str | Path) -> Path:
    path = Path(project_path).expanduser().resolve()
    if (path / "docs").is_dir():
        return path
    if path.parent.name == "dist" and (path.parent.parent / "docs").is_dir():
        return path.parent.parent
    if (path.parent / "docs").is_dir():
        return path.parent
    raise FileNotFoundError(f"Could not resolve dashboard project root from: {project_path}")


def _resolve_servable(project_root: Path) -> tuple[Path, str]:
    dist_dir = project_root / "dist"
    if (dist_dir / "index.html").is_file():
        return dist_dir, "static"
    if (project_root / "index.html").is_file():
        if (project_root / "src").is_dir() and (project_root / "package.json").is_file():
            return project_root, "vite"
        return project_root, "static"
    raise FileNotFoundError(f"Could not find a servable index.html under: {project_root}")


def load_dashboard_spec(project_path: str | Path) -> DashboardSpec:
    project_root = _resolve_project_root(project_path)
    servable_dir, serve_mode = _resolve_servable(project_root)
    render_contract_path = project_root / "docs" / "tableau_render_contract.json"
    interaction_contract_path = project_root / "docs" / "interaction_contract.json"

    render_contract = (
        json.loads(render_contract_path.read_text(encoding="utf-8"))
        if render_contract_path.is_file()
        else {}
    )
    interaction_contract = (
        json.loads(interaction_contract_path.read_text(encoding="utf-8"))
        if interaction_contract_path.is_file()
        else {}
    )

    worksheet_entries = render_contract.get("worksheets")
    if not worksheet_entries:
        worksheet_entries = interaction_contract.get("catalog", {}).get("worksheets", [])

    worksheets = tuple(
        WorksheetSpec(
            id=worksheet.get("id") or _find_worksheet_id(interaction_contract, worksheet["name"]),
            name=worksheet["name"],
            chart_intent=worksheet.get("chart_intent", "unknown"),
        )
        for worksheet in worksheet_entries
        if worksheet.get("name")
    )

    worksheet_name_by_id = {worksheet.id: worksheet.name for worksheet in worksheets}

    interaction_sources = tuple(
        _unique_preserve_order(
            [
                action["trigger"]["source_worksheet_id"]
                for action in interaction_contract.get("interactions", {}).get("worksheet_actions", [])
                if action.get("trigger", {}).get("source_worksheet_id")
            ]
            or [
                entry["worksheet_id"]
                for entry in interaction_contract.get("semantics", {}).get("per_worksheet", [])
                if "highlight" in entry.get("supports", [])
            ]
        )
    )

    return DashboardSpec(
        project_root=project_root,
        servable_dir=servable_dir,
        serve_mode=serve_mode,
        render_contract_path=render_contract_path,
        interaction_contract_path=interaction_contract_path,
        worksheets=worksheets,
        interaction_sources=interaction_sources,
        worksheet_name_by_id=worksheet_name_by_id,
    )


def _find_worksheet_id(interaction_contract: dict, worksheet_name: str) -> str:
    for worksheet in interaction_contract.get("catalog", {}).get("worksheets", []):
        if worksheet.get("name") == worksheet_name:
            return worksheet["id"]
    return f"ws_{worksheet_name.lower().replace(' ', '_')}"


def _unique_preserve_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for item in items:
        if item in seen:
            continue
        seen.add(item)
        ordered.append(item)
    return ordered
