#!/usr/bin/env python3
"""
Example usage of the code validation functions.
This script demonstrates how to use the validation functions programmatically.
"""

import os
import sys
import json

# Add parent directory to path to import the agents
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from code_validation_agent import validate_code
from dependency_checker_agent import check_dependencies


def example_validation():
    """
    Example of how to use the validation functions programmatically.
    """
    # Example project directory
    project_dir = "../selected-project/complex-spa"
    
    # Read files from the project (simplified version)
    generated_files = {}
    src_dir = os.path.join(project_dir, "src")
    
    if os.path.exists(src_dir):
        for root, dirs, files in os.walk(src_dir):
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, project_dir)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        generated_files[rel_path] = content
                    except Exception as e:
                        print(f"Could not read {rel_path}: {e}")
    
    # Get allowed libraries from package.json
    allowed_libraries = []
    package_json_path = os.path.join(project_dir, "package.json")
    if os.path.exists(package_json_path):
        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                pkg = json.load(f)
            allowed_libraries = list(pkg.get("dependencies", {}).keys()) + list(pkg.get("devDependencies", {}).keys())
        except Exception as e:
            print(f"Could not read package.json: {e}")
    
    print(f"Loaded {len(generated_files)} files")
    print(f"Found {len(allowed_libraries)} allowed libraries")
    
    # Run validation
    print("\nRunning code validation...")
    validation_issues = validate_code(project_dir, generated_files)
    
    print("\nChecking dependencies...")
    forbidden_dependencies = check_dependencies(generated_files, allowed_libraries)
    
    # Display results
    print(f"\nValidation issues: {len(validation_issues)}")
    print(f"Forbidden dependencies: {len(forbidden_dependencies)}")
    
    if validation_issues:
        print("\nValidation issues:")
        for issue in validation_issues:
            print(f"  - {issue[:100]}...")
    
    if forbidden_dependencies:
        print("\nForbidden dependencies:")
        for dep in forbidden_dependencies:
            print(f"  - {dep['library']} in {dep['file']}")


if __name__ == "__main__":
    example_validation() 