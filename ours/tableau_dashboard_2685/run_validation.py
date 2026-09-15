#!/usr/bin/env python
"""Run deterministic Tableau source validation on this project."""

import json
import sys
from pathlib import Path

# Add the multi-agent-new pipeline to the path
pipeline_path = Path(__file__).parent.parent.parent / "multi-agent-new" / "pipeline"
sys.path.insert(0, str(pipeline_path))

from tableau_source_validation import validate_tableau_source

# Run validation
project_root = Path(__file__).parent
result = validate_tableau_source(project_root)

# Print results
print("=" * 80)
print("DETERMINISTIC TABLEAU SOURCE VALIDATION RESULTS")
print("=" * 80)

if result["passed"]:
    print("✓ VALIDATION PASSED")
else:
    print("✗ VALIDATION FAILED")
    print(f"\nFailure categories: {', '.join(result['failure_categories'])}")

print(f"\nFound {len(result['issues'])} issues:")
for i, issue in enumerate(result["issues"], 1):
    severity_icon = "✗" if issue["severity"] == "error" else "⚠"
    print(f"\n{i}. [{severity_icon}] {issue['code']}")
    print(f"   Severity: {issue['severity']}")
    print(f"   Message: {issue['message']}")
    print(f"   Path: {issue['path']}")

# Print dataset statistics
print("\n" + "=" * 80)
print("DATASET STATISTICS")
print("=" * 80)

for dataset in result["datasets"]:
    print(f"\nDataset: {Path(dataset['path']).name}")
    print(f"  Row count: {dataset.get('row_count', 'N/A')}")
    print(f"  Header row index: {dataset['header_row_index']}")
    print(f"  Headers need normalization: {dataset['raw_header_needs_normalization']}")

    if dataset.get("stats"):
        print(f"  Field statistics:")
        for field, stat in dataset["stats"]["field_stats"].items():
            print(f"    {field}:")
            print(f"      Kind: {stat['kind']}")
            print(f"      Parse ratio: {stat['parse_ratio']:.2f}")
            if stat['kind'] == 'numeric':
                print(f"      Non-zero ratio: {stat['nonzero_ratio']:.2f}")

    if dataset.get("missing_required_fields"):
        print(f"  Missing required fields: {', '.join(dataset['missing_required_fields'])}")

# Exit with error code if validation failed
sys.exit(0 if result["passed"] else 1)
