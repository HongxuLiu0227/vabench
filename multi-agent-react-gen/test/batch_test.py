#!/usr/bin/env python3
"""
Batch test script for validating multiple React projects.
This script can test multiple projects and generate a summary report.
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime

# Add parent directory to path to import the agents
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from test_code_validation import run_validation_test


def find_react_projects(base_dir):
    """
    Find all React projects in the given directory.
    A project is considered a React project if it has a src/ directory and package.json.
    """
    projects = []
    
    for root, dirs, files in os.walk(base_dir):
        # Skip node_modules and other common exclusions
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '__pycache__', 'test']]
        
        if 'src' in dirs and 'package.json' in files:
            project_path = os.path.relpath(root, base_dir)
            projects.append(os.path.join(base_dir, project_path))
    
    return projects


def run_batch_test(projects_dir, output_file=None):
    """
    Run validation tests on all React projects found in the directory.
    """
    print(f"=== Batch Code Validation Test ===")
    print(f"Scanning directory: {projects_dir}")
    
    # Find all React projects
    projects = find_react_projects(projects_dir)
    
    if not projects:
        print("No React projects found!")
        return
    
    print(f"Found {len(projects)} React projects:")
    for project in projects:
        print(f"  - {project}")
    
    # Run tests on each project
    results = []
    successful_projects = 0
    
    for i, project in enumerate(projects, 1):
        print(f"\n{'='*60}")
        print(f"Testing project {i}/{len(projects)}: {project}")
        print(f"{'='*60}")
        
        try:
            success = run_validation_test(project, None)  # Don't save individual results
            if success:
                successful_projects += 1
            
            # Get basic project info
            project_info = {
                "project_path": project,
                "success": success,
                "timestamp": datetime.now().isoformat()
            }
            results.append(project_info)
            
        except Exception as e:
            print(f"ERROR testing {project}: {e}")
            project_info = {
                "project_path": project,
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            results.append(project_info)
    
    # Generate summary
    print(f"\n{'='*60}")
    print(f"BATCH TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Total projects tested: {len(projects)}")
    print(f"Successful projects: {successful_projects}")
    print(f"Failed projects: {len(projects) - successful_projects}")
    print(f"Success rate: {(successful_projects/len(projects)*100):.1f}%")
    
    # Save batch results if requested
    if output_file:
        batch_results = {
            "timestamp": datetime.now().isoformat(),
            "projects_dir": projects_dir,
            "total_projects": len(projects),
            "successful_projects": successful_projects,
            "failed_projects": len(projects) - successful_projects,
            "success_rate": successful_projects/len(projects)*100,
            "results": results
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(batch_results, f, indent=2, ensure_ascii=False)
        print(f"\n📄 Batch results saved to: {output_file}")
    
    return successful_projects == len(projects)


def main():
    parser = argparse.ArgumentParser(description="Batch test code validation on multiple React projects")
    parser.add_argument('projects_dir', help='Directory containing React projects to test')
    parser.add_argument('--output', '-o', help='Output file to save batch results (JSON format)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose output')
    
    args = parser.parse_args()
    
    # Validate projects directory
    if not os.path.exists(args.projects_dir):
        print(f"ERROR: Projects directory '{args.projects_dir}' does not exist")
        sys.exit(1)
    
    if not os.path.isdir(args.projects_dir):
        print(f"ERROR: '{args.projects_dir}' is not a directory")
        sys.exit(1)
    
    # Run batch test
    success = run_batch_test(args.projects_dir, args.output)
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main() 