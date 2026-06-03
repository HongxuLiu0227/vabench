#!/usr/bin/env python3
"""
Test script for code validation step.
This script validates an existing React project by treating all files in the src/ folder as generated files.
"""

import os
import sys
import json
import argparse
from pathlib import Path

# Add parent directory to path to import the agents
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from code_validation_agent import validate_code
from dependency_checker_agent import check_dependencies


def read_project_files(project_dir):
    """
    Read all files from the directory of the project and return them as generated_files dict.
    """    
    generated_files = {}
    
    # Walk through all files in project_dir
    for root, dirs, files in os.walk(project_dir):
        for file in files:
            # Skip node_modules and other common exclusions
            if any(exclude in root for exclude in ['steps_log', 'node_modules', '.git', '__pycache__']):
                continue
            
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, project_dir)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                generated_files[rel_path] = content
                print(f"Loaded: {rel_path}")
            except Exception as e:
                print(f"Warning: Could not read {rel_path}: {e}")
    
    return generated_files


def get_allowed_libraries(project_dir):
    """
    Extract allowed libraries from package.json.
    """
    package_json_path = os.path.join(project_dir, "package.json")
    if not os.path.exists(package_json_path):
        print("Warning: package.json not found, using empty allowed libraries list")
        return []
    
    try:
        with open(package_json_path, 'r', encoding='utf-8') as f:
            pkg = json.load(f)
        
        dependencies = list(pkg.get("dependencies", {}).keys())
        dev_dependencies = list(pkg.get("devDependencies", {}).keys())
        allowed_libraries = dependencies + dev_dependencies
        
        print(f"Found {len(allowed_libraries)} allowed libraries from package.json")
        return allowed_libraries
    except Exception as e:
        print(f"Warning: Could not read package.json: {e}")
        return []


def run_validation_test(project_dir, output_file=None):
    """
    Run the complete validation test on the project.
    """
    print(f"=== Code Validation Test for: {project_dir} ===")
    
    # 1. Read project files
    print("\n1. Reading project files from src/ directory...")
    generated_files = read_project_files(project_dir)
    
    if not generated_files:
        print("ERROR: No files found in src/ directory")
        return False
    
    print(f"   Loaded {len(generated_files)} files")
    
    # 2. Get allowed libraries
    # print("\n2. Extracting allowed libraries from package.json...")
    # allowed_libraries = get_allowed_libraries(project_dir)
    
    # 3. Run code validation
    print("\n3. Running code validation (ESLint + TypeScript)...")
    validation_issues = validate_code(project_dir, generated_files)
    
    # # 4. Check dependencies
    # print("\n4. Checking for forbidden dependencies...")
    # forbidden_dependencies = check_dependencies(generated_files, allowed_libraries)
    
    # 5. Display results
    print("\n=== VALIDATION RESULTS ===")
    
    if validation_issues:
        print(f"\n❌ Found {len(validation_issues)} validation issues:")
        for i, issue in enumerate(validation_issues, 1):
            print(f"   {i}. {issue}")
    else:
        print("\n✅ No validation issues found!")
    
    # if forbidden_dependencies:
    #     print(f"\n❌ Found {len(forbidden_dependencies)} forbidden dependencies:")
    #     for dep in forbidden_dependencies:
    #         print(f"   - {dep['library']} in {dep['file']}")
    # else:
    #     print("\n✅ No forbidden dependencies found!")
    
    # 6. Save results to file if requested
    # if output_file:
    #     results = {
    #         "project_dir": project_dir,
    #         "files_analyzed": len(generated_files),
    #         "allowed_libraries": allowed_libraries,
    #         "validation_issues": validation_issues,
    #         "forbidden_dependencies": forbidden_dependencies,
    #         "total_issues": len(validation_issues) + len(forbidden_dependencies),
    #         "success": len(validation_issues) == 0 and len(forbidden_dependencies) == 0
    #     }
        
    #     with open(output_file, 'w', encoding='utf-8') as f:
    #         json.dump(results, f, indent=2, ensure_ascii=False)
    #     print(f"\n📄 Results saved to: {output_file}")
    
    # # 7. Summary
    # total_issues = len(validation_issues) + len(forbidden_dependencies)
    # if total_issues == 0:
    #     print("\n🎉 SUCCESS: All validation checks passed!")
    #     return True
    # else:
    #     print(f"\n⚠️  WARNING: Found {total_issues} total issues")
    #     return False


def main():
    parser = argparse.ArgumentParser(description="Test code validation on an existing React project")
    parser.add_argument('project_dir', help='Path to the React project directory to validate')
    parser.add_argument('--output', '-o', help='Output file to save results (JSON format)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose output')
    
    args = parser.parse_args()
    
    # Validate project directory
    if not os.path.exists(args.project_dir):
        print(f"ERROR: Project directory '{args.project_dir}' does not exist")
        sys.exit(1)
    
    if not os.path.isdir(args.project_dir):
        print(f"ERROR: '{args.project_dir}' is not a directory")
        sys.exit(1)
    
    # Run the validation test
    success = run_validation_test(args.project_dir, args.output)
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main() 