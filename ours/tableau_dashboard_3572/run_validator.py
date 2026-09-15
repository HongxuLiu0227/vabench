#!/usr/bin/env python3
"""Run Tableau source validation on this project."""
import sys
from pathlib import Path

# Add multi-agent-new to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "multi-agent-new" / "pipeline"))

from tableau_source_validation import validate_tableau_source

if __name__ == "__main__":
    project_root = Path(__file__).parent
    result = validate_tableau_source(project_root)

    print("=" * 80)
    print("TABLEAU SOURCE VALIDATION RESULTS")
    print("=" * 80)
    print(f"Passed: {result['passed']}")
    print(f"Issues found: {len(result['issues'])}")
    print()

    for issue in result["issues"]:
        print(f"[{issue['code']}] {issue['severity'].upper()}: {issue['message']}")
        if 'path' in issue:
            print(f"  Path: {issue['path']}")
        print()

    if result["failure_categories"]:
        print("Failure categories:", ", ".join(result["failure_categories"]))
        print()

    sys.exit(0 if result["passed"] else 1)
