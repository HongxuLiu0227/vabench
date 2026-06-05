#!/usr/bin/env python3
"""Generate .twb variants using LLM for breadth augmentation.

Strategy: Send the full .twb XML (minus thumbnails) to the LLM, ask it to
output N complete variant .twb files with modified chart types, colors, and layouts.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from openai import OpenAI


SYSTEM_PROMPT = """You are an expert in Tableau workbook (.twb) XML and data visualization.
Your task is to produce variant versions of a .twb file by modifying its visual presentation
while preserving ALL data references, field names, datasource connections, filters, calculations,
and metrics exactly as they are.

You may change:
- Chart mark types (<mark class='...'>): swap between compatible types (e.g. Bar↔Line↔Area,
  Automatic↔Bar↔Line↔Area↔Circle↔Square↔Text↔Shape). For box plots, keep as-is or convert
  to bar/scatter; for ranked bars, try line, area, pie, or donut.
- Chart orientation: swap <rows> and <cols> content, or change shelf-sort direction (ASC↔DESC).
- Color palette: replace fontcolor and other color attributes with coherent new palettes
  (e.g. warm, cool, pastel, monochrome, high-contrast, earth tones). Update ALL color
  attributes consistently.
- Layout: adjust zone x/y/w/h coordinates to reorder or resize charts within the dashboard
  grid (keep values within 0-100000 range). Swap positions of worksheet zones.
- Title formatting: change font sizes, font names, bold emphasis.
- Dashboard text zone content and styling.

CRITICAL RULES — do NOT change any of these:
1. Data source definitions (<datasource>, <connection>, <columns>, <metadata-records>)
2. Field/column names and references
3. Aggregation types (Sum, Avg, Count, None)
4. Filter definitions
5. The data source file name
6. All datasource-dependencies, column-instance definitions
7. Simple-ids/UUIDs
8. The workbook version and source-build attributes
9. The overall XML structure — keep all tags, nesting, and namespaces intact

Output format:
For each variant, output a complete, valid, self-contained .twb XML document wrapped in:
<twb_variant name="variant-name">
<!-- brief description of changes -->
<![CDATA[
  (full XML here)
]]>
</twb_variant>

Use exactly this wrapper for each variant."""


def build_variant_request(source_xml: str, num_variants: int, source_name: str) -> str:
    return f"""Generate {num_variants} variant .twb files based on the source workbook "{source_name}".

Each variant should differ in:
1. Chart types — change at least 2 worksheets to different chart types
2. Color scheme — apply a distinct, coherent color palette across all titles, text zones,
   and encodings (e.g. one variant warm, one cool, one dark/monochrome, one vibrant)
3. Layout — reorder or resize at least 2 chart zones in the dashboard

Make each variant feel like a genuinely different dashboard, not a minor tweak.

Source .twb XML:
```xml
{source_xml}
```

Output all {num_variants} variants, each wrapped in <twb_variant> tags as specified."""


def strip_thumbnails(xml: str) -> str:
    return re.sub(
        r"<thumbnails>.*?</thumbnails>",
        "<thumbnails />",
        xml,
        flags=re.DOTALL,
    )


def parse_variants(response_text: str) -> List[dict]:
    """Extract individual .twb variants from the LLM response."""
    variants = []
    pattern = re.compile(
        r'<twb_variant\s+name="([^"]*)"\s*>(.*?)</twb_variant>',
        re.DOTALL,
    )
    for match in pattern.finditer(response_text):
        name = match.group(1).strip()
        content = match.group(2)

        cdata_match = re.search(r'<!\[CDATA\[(.*?)\]\]>', content, re.DOTALL)
        if cdata_match:
            xml_content = cdata_match.group(1).strip()
        else:
            xml_content = content.strip()
            xml_content = re.sub(r'^```(?:xml)?\s*\n?', '', xml_content)
            xml_content = re.sub(r'\n?```\s*$', '', xml_content)

        if xml_content and xml_content.startswith('<?xml'):
            variants.append({
                "name": name,
                "xml": xml_content,
            })
    return variants


def validate_variant(xml: str) -> Optional[str]:
    checks = {
        "XML declaration": '<?xml',
        "workbook tag": '<workbook ',
        "datasources": '<datasources>',
        "worksheets": '<worksheets>',
        "dashboards": '<dashboards>',
    }
    missing = [k for k, v in checks.items() if v not in xml]
    if missing:
        return f"Missing: {', '.join(missing)}"
    if not xml.strip().endswith('</workbook>'):
        return "Does not end with </workbook>"
    return None


def parse_args():
    parser = argparse.ArgumentParser(description="Generate .twb variants using LLM")
    parser.add_argument("-i", "--input", type=Path, required=True, help="Source .twb file")
    parser.add_argument("-o", "--output-dir", type=Path, default=Path("output/twb_variants"))
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

    twb_path = args.input.resolve()
    if not twb_path.exists():
        print(f"Error: {twb_path} not found", file=sys.stderr)
        return 1

    source_xml = twb_path.read_text(encoding="utf-8")
    source_xml = strip_thumbnails(source_xml)
    source_name = twb_path.stem

    user_prompt = build_variant_request(source_xml, args.num_variants, source_name)

    if args.dry_run:
        print(f"Source: {twb_path} ({len(source_xml)} chars, thumbnails stripped)")
        print(f"Prompt: {len(user_prompt)} chars")
        print(f"Model: {model}")
        print("Dry run — skipping LLM call.")
        return 0

    client = OpenAI(api_key=api_key, base_url=base_url)

    print(f"Source: {twb_path.name} ({len(source_xml)} chars, thumbnails stripped)")
    print(f"Calling {model}...")

    # --- Generate variants one at a time to avoid output truncation ---
    variants = []
    styles = [
        ("warm sunset palette", "swap bar chart positions"),
        ("cool ocean palette", "reorder bottom row"),
        ("dark monochrome palette", "swap left/right columns"),
        ("pastel palette", "compact stacked layout"),
        ("vibrant high-contrast palette", "grid rearrangement"),
        ("earth tone palette", "narrow sidebar layout"),
    ]

    for idx in range(args.num_variants):
        style_hint, layout_hint = styles[idx % len(styles)]

        single_prompt = (
            f"Generate 1 variant from this workbook. Apply these changes:\n"
            f"- Color: use a {style_hint} (replace ALL fontcolor values consistently)\n"
            f"- Chart types: change at least 2 mark class attributes to different compatible types\n"
            f"- Layout: {layout_hint} (modify zone x/y/w/h coordinates)\n\n"
            f"```xml\n{source_xml}\n```"
        )

        print(f"  [{idx+1}/{args.num_variants}] {style_hint}...")
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": single_prompt},
            ],
            temperature=0.85,
            max_tokens=32768,
        )
        text = resp.choices[0].message.content
        if not text:
            print(f"    Empty response, skipping")
            continue

        batch = parse_variants(text)
        if batch:
            for v in batch:
                error = validate_variant(v["xml"])
                if error:
                    print(f"    Validated: {v['name']} — {error}, skipping")
                    continue
                # Strip thumbnails from output too (LLM might reproduce them)
                v["xml"] = strip_thumbnails(v["xml"])
                variants.append(v)
                print(f"    → {v['name']} ({len(v['xml'])} chars)")
        else:
            print(f"    Failed to parse (response {len(text)} chars)")

    if not variants:
        print("Error: No valid variants generated.", file=sys.stderr)
        return 1

    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    # Source project directory (contains data/ folder) and project ID
    source_dir = twb_path.parent
    data_dir = source_dir / "data"
    project_id = source_dir.name.split("_", 1)[0]  # e.g. "19" from "19_dash_..."

    for i, variant in enumerate(variants, start=1):
        llm_name = variant["name"]
        short_name = re.sub(r'[^a-zA-Z0-9_]', '_', llm_name)[:24].strip("_") or f"var{i}"
        dir_name = f"{project_id}_var{i:02d}_{short_name}"
        project_dir = output_dir / dir_name
        project_dir.mkdir(parents=True, exist_ok=True)

        # Save .twb
        twb_out = project_dir / twb_path.name
        twb_out.write_text(variant["xml"], encoding="utf-8")

        # Link data directory
        data_link = project_dir / "data"
        if data_dir.exists() and not data_link.exists():
            try:
                data_link.symlink_to(data_dir.resolve(), target_is_directory=True)
                print(f"  Saved: {dir_name}/ (twb + data symlink)")
            except OSError:
                shutil.copytree(data_dir, data_link)
                print(f"  Saved: {dir_name}/ (twb + data copied)")
        else:
            print(f"  Saved: {dir_name}/ (twb only, no data dir found)")

    print(f"\nDone: {len(variants)} variants → {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
