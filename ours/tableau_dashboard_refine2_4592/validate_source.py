#!/usr/bin/env python3
"""Run Tableau source validation on this project."""

import sys
from pathlib import Path

# Add multi-agent-new to path
multi_agent_path = Path(__file__).parent.parent.parent / "multi-agent-new"
sys.path.insert(0, str(multi_agent_path))

# Import directly from the module
import importlib.util
spec = importlib.util.spec_from_file_location(
    "tableau_source_validation",
    multi_agent_path / "pipeline" / "tableau_source_validation.py"
)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

validate_tableau_source = module.validate_tableau_source

def main():
    project_dir = Path(__file__).parent
    result = validate_tableau_source(project_dir)

    print("=" * 80)
    print("TABLEAU SOURCE VALIDATION REPORT")
    print("=" * 80)
    print(f"\nResult: {'✓ PASSED' if result['passed'] else '✗ FAILED'}")
    print(f"\nFound {len(result['issues'])} issue(s):")

    for issue in result['issues']:
        severity_symbol = "✗" if issue['severity'] == "error" else "⚠"
        print(f"\n  {severity_symbol} [{issue['code'].upper()}] {issue['severity']}")
        print(f"    {issue['message']}")
        if 'path' in issue:
            print(f"    Path: {issue['path']}")

    if result['failure_categories']:
        print(f"\nFailure categories: {', '.join(result['failure_categories'])}")
    else:
        print("\nNo failure categories.")

    print(f"\nDatasets validated: {len(result['datasets'])}")
    for dataset in result['datasets']:
        row_count = dataset.get('row_count', 'N/A')
        print(f"  - {dataset['path']}: {row_count} rows")

    print("\n" + "=" * 80)

    return 0 if result['passed'] else 1

if __name__ == '__main__':
    sys.exit(main())
