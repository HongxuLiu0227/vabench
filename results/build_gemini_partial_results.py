#!/usr/bin/env python3
"""Expand Gemini 3.1 Pro partial metrics (3 successes) to full benchmark format.

Gemini only has 3 generated dashboards. All other benchmark items are treated as
failed generations:
  Ex=0, static metrics=0, S_data=null, S_int=null, overall=0.

Does not modify existing evaluation pipelines; writes into metric_results/gemini-3.1-pro/.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from statistics import mean
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
METRIC_DIR = Path(__file__).resolve().parent
MODEL_DIR = METRIC_DIR / "gemini-3.1-pro"
MODEL_NAME = "gemini-3.1-pro"
CANDIDATE_ROOT = REPO_ROOT / "generated-react-app-v2-gemini-3.1-pro"
REFERENCE_ROOT = REPO_ROOT / "ours"
KIMI_DIR = METRIC_DIR / "kimi"

LINE_PATTERN = re.compile(
    r"Project:\s*(?P<dashboard>tableau_dashboard_[^| ]+)\s*\|\s*"
    r"Ex:\s*(?P<ex>[01])\s*\|\s*"
    r"SSIM:\s*(?P<ssim>N/A|[-+]?[\d.]+)\s*\|\s*"
    r"1-MSE:\s*(?P<mse>N/A|[-+]?[\d.]+)\s*\|\s*"
    r"CLIP:\s*(?P<clip>N/A|[-+]?[\d.]+)\s*\|\s*"
    r"TreeBLEU:\s*(?P<tree>N/A|[-+]?[\d.]+)"
)

DASHBOARD_LINE = re.compile(r"Project:\s*(tableau_dashboard_[^| ]+)")


@dataclass
class StaticMetrics:
    ex: int
    ssim: float
    mse_inv: float
    clip: float
    treebleu: float

    @property
    def static_score(self) -> float:
        return (self.ssim + self.mse_inv + self.clip + self.treebleu) / 4.0


@dataclass
class DynamicMetrics:
    status: str
    s_data: float | None
    s_int: float | None
    data_file_match: bool | None
    compiled_episode_count: int | None
    error: str | None


@dataclass
class DashboardRecord:
    name: str
    static: StaticMetrics
    dynamic: DynamicMetrics

    def overall_score(self) -> float:
        if self.static.ex == 0:
            return 0.0
        s_data = self.dynamic.s_data if self.dynamic.s_data is not None else 0.0
        s_int = self.dynamic.s_int if self.dynamic.s_int is not None else 0.0
        return self.static.ex * (
            (self.static.static_score + s_data + s_int) / 3.0
        )


def _to_float(value: Any) -> float:
    if value is None:
        return 0.0
    text = str(value).strip()
    if not text or text.upper() == "N/A":
        return 0.0
    return float(text)


def parse_partial_static(path: Path) -> dict[str, StaticMetrics]:
    found: dict[str, StaticMetrics] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        match = LINE_PATTERN.search(line)
        if not match:
            continue
        name = match.group("dashboard")
        found[name] = StaticMetrics(
            ex=int(match.group("ex")),
            ssim=_to_float(match.group("ssim")),
            mse_inv=_to_float(match.group("mse")),
            clip=_to_float(match.group("clip")),
            treebleu=_to_float(match.group("tree")),
        )
    return found


def parse_partial_batch(path: Path) -> dict[str, DynamicMetrics]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    found: dict[str, DynamicMetrics] = {}
    for case in payload.get("cases", []):
        name = str(case.get("dashboard", "")).strip()
        if not name:
            continue
        found[name] = DynamicMetrics(
            status=str(case.get("status", "error")),
            s_data=case.get("s_data"),
            s_int=case.get("s_int"),
            data_file_match=case.get("data_file_match"),
            compiled_episode_count=case.get("compiled_episode_count"),
            error=case.get("error"),
        )
    return found


def load_subset_names(path: Path) -> list[str]:
    names: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        match = DASHBOARD_LINE.search(line)
        if match:
            names.append(match.group(1))
    return names


def failed_static() -> StaticMetrics:
    return StaticMetrics(ex=0, ssim=0.0, mse_inv=0.0, clip=0.0, treebleu=0.0)


def failed_dynamic(reason: str = "generation failed") -> DynamicMetrics:
    return DynamicMetrics(
        status="error",
        s_data=None,
        s_int=None,
        data_file_match=None,
        compiled_episode_count=None,
        error=reason,
    )


def build_record(
    name: str,
    partial_static: dict[str, StaticMetrics],
    partial_dynamic: dict[str, DynamicMetrics],
) -> DashboardRecord:
    if name in partial_static and name in partial_dynamic:
        return DashboardRecord(name, partial_static[name], partial_dynamic[name])
    return DashboardRecord(name, failed_static(), failed_dynamic())


def format_static_line(record: DashboardRecord) -> str:
    s = record.static
    if s.ex == 0:
        return (
            f"  -> Project: {record.name} | Ex: 0 | "
            f"SSIM: 0.0000 | 1-MSE: 0.0000 | CLIP: 0.0000 | TreeBLEU: 0.0000"
        )
    return (
        f"  -> Project: {record.name} | Ex: 1 | "
        f"SSIM: {s.ssim:.4f} | 1-MSE: {s.mse_inv:.4f} | "
        f"CLIP: {s.clip:.4f} | TreeBLEU: {s.treebleu:.4f}"
    )


def write_evaluation_details(path: Path, records: list[DashboardRecord], total_label: int) -> None:
    lines = [
        "Initializing Metrics...",
        "[ImageMetrics] Loading CLIP model ViT-B-32 on cpu...",
        f"Total projects found: {total_label}",
        "",
    ]
    for record in records:
        lines.append(f"Processing: {record.name}")
        if record.static.ex == 0:
            lines.append("  Missing images! GT found: True, Result found: False, skipping 4 metrics.")
            lines.append("  No result.png, skipping TreeBLEU.")
        lines.append(format_static_line(record))
        lines.append("")

    ex_values = [r.static.ex for r in records]
    success = [r for r in records if r.static.ex == 1]
    avg_ex = mean(ex_values) if ex_values else 0.0
    avg_ssim = mean(r.static.ssim for r in success) if success else 0.0
    avg_mse = mean(r.static.mse_inv for r in success) if success else 0.0
    avg_clip = mean(r.static.clip for r in success) if success else 0.0
    avg_tree = mean(r.static.treebleu for r in success) if success else 0.0
    overall_static = mean(r.static.static_score for r in success) if success else 0.0

    lines.extend(
        [
            "=============================================",
            "    FINAL AVERAGE SCORES ACROSS ALL TASKS",
            "=============================================",
            f" Total Projects : {len(records)}",
            f" Failed Projects: {len(records) - len(success)} (Missing result.png)",
            f" ALL_Ex         : {avg_ex:.4f}  (成功生成率)",
            f" ALL_SSIM       : {avg_ssim:.4f}  (越大越好 0~1)",
            f" ALL_1-MSE      : {avg_mse:.4f}  (越大越好 0~1)",
            f" ALL_CLIP       : {avg_clip:.4f}  (越大越好 常在0~1)",
            f" ALL_TreeBLEU   : {avg_tree:.4f}  (越大越好 0~1)",
            "---------------------------------------------",
            f" OVERALL SCORE  : {overall_static:.4f}  (仅计算成功项目的四大指标均值)",
            "=============================================",
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def build_batch_case(record: DashboardRecord) -> dict[str, Any]:
    candidate = CANDIDATE_ROOT / record.name
    dynamic = record.dynamic
    return {
        "model": MODEL_NAME,
        "dashboard": record.name,
        "candidate_project": str(candidate),
        "status": dynamic.status,
        "s_data": dynamic.s_data,
        "s_int": dynamic.s_int,
        "data_file_match": dynamic.data_file_match,
        "compiled_episode_count": dynamic.compiled_episode_count,
        "error": dynamic.error,
    }


def build_batch_summary(records: list[DashboardRecord]) -> dict[str, Any]:
    ok_cases = [r for r in records if r.dynamic.status == "ok"]
    by_dashboard = []
    for record in records:
        by_dashboard.append(
            {
                "dashboard": record.name,
                "cases_total": 1,
                "cases_ok": 1 if record.dynamic.status == "ok" else 0,
                "avg_s_data": record.dynamic.s_data if record.dynamic.status == "ok" else None,
                "avg_s_int": record.dynamic.s_int if record.dynamic.status == "ok" else None,
            }
        )

    return {
        "cases_total": len(records),
        "cases_ok": len(ok_cases),
        "models": [
            {
                "model": MODEL_NAME,
                "cases_total": len(records),
                "cases_ok": len(ok_cases),
                "avg_s_data": mean(r.dynamic.s_data for r in ok_cases) if ok_cases else None,
                "avg_s_int": mean(r.dynamic.s_int for r in ok_cases) if ok_cases else None,
            }
        ],
        "dashboards": by_dashboard,
    }


def write_batch_report(path: Path, records: list[DashboardRecord], dashboards: list[str]) -> None:
    cases = [build_batch_case(record) for record in records]
    payload = {
        "reference_root": str(REFERENCE_ROOT),
        "candidate_roots": [str(CANDIDATE_ROOT)],
        "dashboards": dashboards,
        "summary": build_batch_summary(records),
        "cases": cases,
        "full_reports": cases,
    }
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def write_batch_csv(path: Path, cases: list[dict[str, Any]]) -> None:
    fieldnames = [
        "model",
        "dashboard",
        "candidate_project",
        "status",
        "s_data",
        "s_int",
        "data_file_match",
        "compiled_episode_count",
        "error",
    ]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(cases)


def write_result_json(path: Path, records: list[DashboardRecord]) -> None:
    per_dashboard = {record.name: record.overall_score() for record in records}
    payload = {
        "dashboard_count": len(records),
        "final_average_overall_score": mean(per_dashboard.values()) if per_dashboard else 0.0,
        "per_dashboard_overall_score": per_dashboard,
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def subset_stats(records: list[DashboardRecord]) -> dict[str, Any]:
    success_static = [r for r in records if r.static.ex == 1]
    ok_dynamic = [r for r in records if r.dynamic.status == "ok"]
    overall_scores = [r.overall_score() for r in records]
    return {
        "count": len(records),
        "ex": mean(r.static.ex for r in records),
        "ex_success": len(success_static),
        "static": mean(r.static.static_score for r in success_static) if success_static else 0.0,
        "ssim": mean(r.static.ssim for r in success_static) if success_static else 0.0,
        "mse_inv": mean(r.static.mse_inv for r in success_static) if success_static else 0.0,
        "clip": mean(r.static.clip for r in success_static) if success_static else 0.0,
        "treebleu": mean(r.static.treebleu for r in success_static) if success_static else 0.0,
        "s_data": mean(r.dynamic.s_data for r in ok_dynamic) if ok_dynamic else None,
        "s_int": mean(r.dynamic.s_int for r in ok_dynamic) if ok_dynamic else None,
        "batch_ok": len(ok_dynamic),
        "overall": mean(overall_scores) if overall_scores else 0.0,
        "success_names": [r.name for r in success_static],
    }


def write_summary_txt(path: Path, full: dict[str, Any], re_stats: dict[str, Any], sy_stats: dict[str, Any]) -> None:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def block(title: str, stats: dict[str, Any], include_s_int: bool = False) -> list[str]:
        lines = [
            title,
            f"  项目数     : {stats['count']}",
            f"  Ex         : {stats['ex']:.4f}  ({stats['ex_success']}/{stats['count']} 有 result.png)",
            f"  静态       : {stats['static']:.4f}  (Ex=1 项目均值, {stats['ex_success']} 项)",
            f"  S_data     : {stats['s_data']:.4f}  (batch 成功 {stats['batch_ok']}/{stats['count']})"
            if stats["s_data"] is not None
            else f"  S_data     : N/A  (batch 成功 {stats['batch_ok']}/{stats['count']})",
        ]
        if include_s_int:
            if stats["s_int"] is not None:
                lines.append(f"  S_int      : {stats['s_int']:.4f}")
            else:
                lines.append("  S_int      : N/A")
        lines.append(f"  Overall    : {stats['overall']:.4f}")
        if stats["ex_success"]:
            lines.extend(
                [
                    "",
                    "  静态指标明细 (仅 Ex=1 项目):",
                    f"    SSIM     : {stats['ssim']:.4f}",
                    f"    1-MSE    : {stats['mse_inv']:.4f}",
                    f"    CLIP     : {stats['clip']:.4f}",
                    f"    TreeBLEU : {stats['treebleu']:.4f}",
                ]
            )
        return lines

    lines = [
        "=" * 60,
        "  Gemini 3.1 Pro 评测结果汇总",
        "=" * 60,
        f"生成时间: {now}",
        "",
        "说明:",
        "  - 仅 3 项生成成功: tableau_dashboard_10115, 10845, 1107_1",
        "  - 其余项目按生成失败处理: Ex=0, 静态=0, S_data/S_int=null",
        "  - 子集划分与 kimi 的 evaluation_details-re/sy/full 对齐",
        "",
        "Overall 计算方式:",
        "  overall_i = Ex_i × ((静态_i + S_data_i + S_int_i) / 3)",
        "  其中 静态_i = (SSIM + 1-MSE + CLIP + TreeBLEU) / 4",
        "  汇总 Overall = mean(overall_i)",
        "",
        "-" * 60,
        *block("一、子集 re（72 项）", re_stats),
        "",
        "-" * 60,
        *block("二、子集 sy（31 项）", sy_stats),
        "",
        "-" * 60,
        *block("三、并集 full（103 项）", full, include_s_int=True),
        "",
        "-" * 60,
        "四、成功项目",
        "-" * 60,
    ]
    for name in full["success_names"]:
        lines.append(f"  - {name}")
    lines.extend(["", "=" * 60, ""])
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build full Gemini partial benchmark results.")
    parser.add_argument(
        "--partial-static",
        default=str(MODEL_DIR / "evaluation_details-partial-3.txt"),
        help="Static metrics for the 3 successful dashboards.",
    )
    parser.add_argument(
        "--partial-batch",
        default=str(MODEL_DIR / "batch_report-partial-3.json"),
        help="Batch report for the 3 successful dashboards.",
    )
    parser.add_argument(
        "--subset-source",
        default=str(KIMI_DIR),
        help="Directory containing canonical evaluation_details-{full,re,sy}.txt",
    )
    parser.add_argument(
        "--output-dir",
        default=str(MODEL_DIR),
        help="Output directory under metric_results/",
    )
    args = parser.parse_args()

    output_dir = Path(args.output_dir).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    subset_source = Path(args.subset_source).expanduser().resolve()

    partial_static = parse_partial_static(Path(args.partial_static).expanduser().resolve())
    partial_dynamic = parse_partial_batch(Path(args.partial_batch).expanduser().resolve())

    full_names = load_subset_names(subset_source / "evaluation_details-full.txt")
    re_names = load_subset_names(subset_source / "evaluation_details-re.txt")
    sy_names = load_subset_names(subset_source / "evaluation_details-sy.txt")

    all_records = {name: build_record(name, partial_static, partial_dynamic) for name in full_names}
    re_records = [all_records[name] for name in re_names]
    sy_records = [all_records[name] for name in sy_names]
    full_records = [all_records[name] for name in full_names]

    write_evaluation_details(output_dir / "evaluation_details-full.txt", full_records, 103)
    write_evaluation_details(output_dir / "evaluation_details-re.txt", re_records, 72)
    write_evaluation_details(output_dir / "evaluation_details-sy.txt", sy_records, 31)

    full_cases = [build_batch_case(record) for record in full_records]
    write_batch_report(output_dir / "batch_report.json", full_records, full_names)
    write_batch_csv(output_dir / "batch_summary.csv", full_cases)

    write_result_json(output_dir / "full-result.txt", full_records)
    write_result_json(output_dir / "re-result.txt", re_records)
    write_result_json(output_dir / "sy-result.txt", sy_records)

    full_stats = subset_stats(full_records)
    re_stats = subset_stats(re_records)
    sy_stats = subset_stats(sy_records)
    write_summary_txt(output_dir / "gemini-3.1-pro-results.txt", full_stats, re_stats, sy_stats)

    print(json.dumps(
        {
            "output_dir": str(output_dir),
            "full_overall": full_stats["overall"],
            "re_overall": re_stats["overall"],
            "sy_overall": sy_stats["overall"],
            "success_count": full_stats["ex_success"],
        },
        ensure_ascii=False,
        indent=2,
    ))


if __name__ == "__main__":
    main()
