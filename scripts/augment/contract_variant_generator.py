#!/usr/bin/env python3
"""Generate variant tableau_render_contract.json files using LLM.

Reads an existing render contract and asks the LLM to produce N variants with
different chart types, color schemes, and layouts. Each variant is a complete,
valid contract JSON that can be injected into the pipeline.

Usage:
    python contract_variant_generator.py \
        -i generated-react-app/tableau_dashboard_refine5_19/docs/tableau_render_contract.json \
        -n 3 \
        -o output/contract_variants
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from openai import OpenAI


SYSTEM_PROMPT = """You are a visualization expert. Your task: generate variant versions of a
Tableau render contract JSON.

A render contract describes a dashboard's worksheets, their chart types, layout zones,
colors, titles, legends, and interactions. It is used to drive React code generation.

You will receive a source contract and produce N variant contracts as a JSON array.

For each variant you MUST:
1. Change chart_intent for at least 2 worksheets to a DIFFERENT compatible type.
   Compatible swaps for a worksheet with 1 dimension + 1 measure:
     horizontal_ranked_bar ↔ vertical_bar ↔ line_chart ↔ area_chart
     horizontal_ranked_bar ↔ pie_chart (single category only)
     horizontal_ranked_bar ↔ scatter_plot ↔ heatmap
     horizontal_box_plot → scatter_plot, vertical_bar
   For each change, also update fidelity_rules to match the new chart type.
   Update bar_orientation to match (horizontal ↔ vertical).

2. Change ALL fontcolor values in title_runs across ALL worksheets to a new,
   coherent color palette. Each worksheet keeps ONE accent color, but the set of
   accents across worksheets should reflect the theme (warm, cool, dark, pastel, etc.).
   Also change fontcolor in dashboard_text_zones.

3. Modify at least 2 zone positions by swapping or adjusting x_ratio/y_ratio/w_ratio/h_ratio
   in their normalized coordinates.

4. Update the summary section to reflect changes (intent_counts, etc.).

CRITICAL RULES:
- Do NOT change any field references (rows_field, cols_field, series_field, slices, filter_members)
- Do NOT change worksheet names or dashboard names
- Do NOT change axis_titles content
- Do NOT change interaction/action definitions (unless chart type change requires it)
- Do NOT change dashboard_size
- Keep all JSON structure keys intact; only modify VALUES

Output ONLY a JSON array:
[
  {
    "name": "snake_case_theme_name",
    "description": "one-line summary of changes",
    "contract": { ... full contract JSON ... }
  },
  ...
]"""


def build_request(source: Dict, num_variants: int) -> str:
    """Build the user prompt with the source contract."""
    source_str = json.dumps(source, ensure_ascii=False, indent=2)
    return (
        f"Generate {num_variants} variant render contracts from this source:\n\n"
        f"```json\n{source_str}\n```\n\n"
        f"Return exactly {num_variants} variants in the JSON array format specified."
    )


def parse_variants(response_text: str) -> List[Dict]:
    """Extract variant contracts from LLM response."""
    # Find JSON array in response
    json_match = re.search(r'\[\s*\{', response_text)
    if not json_match:
        return []

    # Try to find matching closing bracket
    start = json_match.start()
    # Walk through to find matching ]
    depth = 0
    end = start
    for i, ch in enumerate(response_text[start:], start):
        if ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                end = i + 1
                break

    json_str = response_text[start:end]
    try:
        data = json.loads(json_str)
        if isinstance(data, list):
            return data
    except json.JSONDecodeError as e:
        print(f"  JSON parse warning: {e}")

    return []


def validate_contract(contract: Dict) -> Optional[str]:
    """Basic validation that the contract has expected structure."""
    if not isinstance(contract, dict):
        return "Not a dict"
    if "worksheets" not in contract:
        return "Missing 'worksheets'"
    if "dashboard_text_zones" not in contract:
        return "Missing 'dashboard_text_zones'"
    if "summary" not in contract:
        return "Missing 'summary'"
    for ws in contract["worksheets"]:
        required = ["name", "chart_intent", "zone", "title_runs", "fidelity_rules"]
        for key in required:
            if key not in ws:
                return f"Worksheet '{ws.get('name', '?')}' missing '{key}'"
    return None


def parse_args():
    parser = argparse.ArgumentParser(description="Generate contract variants using LLM")
    parser.add_argument("-i", "--input", type=Path, required=True,
                        help="Source tableau_render_contract.json")
    parser.add_argument("-o", "--output-dir", type=Path,
                        default=Path("output/contract_variants"))
    parser.add_argument("-n", "--num-variants", type=int, default=3)
    parser.add_argument("--model", type=str, default=None)
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main():
    args = parse_args()
    root_dir = Path(__file__).resolve().parent

    for env_path in [root_dir / ".env", root_dir / "agent_pipeline" / ".env"]:
        if env_path.exists():
            load_dotenv(env_path)

    api_key = os.getenv("LLM_KEY")
    model = args.model or os.getenv("MODEL_NAME", "deepseek-chat")
    base_url = os.getenv("LLM_BASE_URL", "https://api.deepseek.com")
    if not api_key:
        raise RuntimeError("LLM_KEY not found")

    source_path = args.input.resolve()
    if not source_path.exists():
        print(f"Error: {source_path} not found", file=sys.stderr)
        return 1

    source = json.loads(source_path.read_text(encoding="utf-8"))
    source_str = json.dumps(source, ensure_ascii=False)
    print(f"Source contract: {len(source_str)} chars, "
          f"{len(source.get('worksheets', []))} worksheets")

    if args.dry_run:
        print("Dry run — exiting.")
        return 0

    prompt = build_request(source, args.num_variants)
    print(f"Prompt size: {len(prompt)} chars, calling {model}...")

    client = OpenAI(api_key=api_key, base_url=base_url)
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        max_tokens=16384,
    )

    # --- Generate variants one at a time to avoid truncation ---
    variants: List[Dict] = []
    for idx in range(args.num_variants):
        styles = ["warm palette", "cool palette", "dark palette", "pastel palette",
                   "vibrant palette", "monochrome palette", "earth tone palette"]
        style_hint = styles[idx % len(styles)]
        theme_hints = ["swap bar chart positions", "reorder bottom row", "swap left/right columns",
                        "narrow sidebar layout", "compact stacked layout", "grid rearrangement"]

        single_prompt = (
            f"Generate 1 variant from this contract. Apply these changes:\n"
            f"- Use a {style_hint} (replace ALL fontcolor values consistently)\n"
            f"- Change at least 2 chart_intent values to compatible different types "
            f"(e.g. horizontal_ranked_bar→vertical_bar, horizontal_ranked_bar→line_chart, "
            f"horizontal_box_plot→scatter_plot)\n"
            f"- Layout change: {theme_hints[idx % len(theme_hints)]}\n"
            f"- Update fidelity_rules to match new chart types\n"
            f"- Update summary.intent_counts\n\n"
            f"```json\n{source_str}\n```"
        )

        print(f"  [{idx+1}/{args.num_variants}] Generating with {style_hint}...")
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": single_prompt},
            ],
            temperature=0.85,
            max_tokens=16384,
        )
        text = resp.choices[0].message.content
        if not text:
            print(f"    Empty response, skipping")
            continue

        batch = parse_variants(text)
        if batch:
            variants.extend(batch)
            print(f"    Got variant: {batch[0].get('name', '?')}")
        else:
            print(f"    Failed to parse (response {len(text)} chars)")

    if not variants:
        print("Error: Could not parse any variants.", file=sys.stderr)
        print("--- Last response preview ---")
        print(text[:2000] if text else "(empty)")
        return 1

    print(f"\nParsed {len(variants)} variant(s) total.")

    output_dir = args.output_dir.resolve()
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    saved = 0
    for i, variant in enumerate(variants):
        name = variant.get("name", f"variant_{i+1}")
        desc = variant.get("description", "")
        contract = variant.get("contract")
        if not contract:
            print(f"  [{i+1}] {name}: no contract field, skipping")
            continue

        error = validate_contract(contract)
        if error:
            print(f"  [{i+1}] {name}: invalid — {error}")
            continue

        out_path = output_dir / f"{name}.json"
        out_path.write_text(json.dumps(contract, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  [{i+1}] {name}: {desc} → {out_path.name}")
        saved += 1

    print(f"\nDone: {saved}/{len(variants)} saved to {output_dir}")
    return 0 if saved > 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
