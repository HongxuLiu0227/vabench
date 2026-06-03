import argparse
from scaffold_agent import scaffold_with_vite
from requirement_analysis_agent import analyze_requirements
from file_structure_agent import design_file_structure, get_file_manifest
from config_agent import optimize_configs
from structure_planner_agent import plan_structure
from component_generator_agent import generate_components, generate_index_ts_content
from relationship_refactor_agent import refactor_relationships
from code_validation_agent import validate_code, check_forbidden_packages, get_shared_project_packages
from code_fixer_agent import fix_code_issues, fix_code_issues_v2, generate_file_tree_for_imports
from package_validator_agent import validate_and_fix_packages
from render_agent import render_project
# from import_resolver_agent import resolve_imports_and_files
from logging_config import get_logger
from router_design_agent import design_routes
import os
import json
import sys

ENABLE_SECOND_PASS = False
MAX_VALIDATION_ATTEMPTS = 100
MAX_TOOL_CALLS = 100
ENABLE_EARLY_BREAK = False

# Set up logger
logger = get_logger(__name__)


def save_step_log(output_dir, step_name, data, is_json=True):
    log_dir = os.path.join(output_dir, "steps_log")
    os.makedirs(log_dir, exist_ok=True)
    log_path = os.path.join(log_dir, f"{step_name}.json" if is_json else f"{step_name}.txt")
    with open(log_path, "w", encoding="utf-8") as f:
        if is_json:
            json.dump(data, f, indent=2, ensure_ascii=False)
        else:
            f.write(str(data))

def write_generated_files(output_dir, generated_files):
    for rel_path, content in generated_files.items():
        abs_path = os.path.join(output_dir, rel_path)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)
        logger.info(f"[Orchestrator] Wrote {abs_path}")

def generate_react_project(prompt=None, prompt_file=None, output_dir='generated-react-app'):
    """
    Generate a React project based on the given prompt or prompt file.
    
    Args:
        prompt (str, optional): The project prompt/description
        prompt_file (str, optional): Path to a file containing the project prompt
        output_dir (str): Output directory for the generated project
    
    Returns:
        bool: True if successful, False otherwise
    """
    # Determine prompt source
    if prompt_file:
        if not os.path.exists(prompt_file):
            logger.error(f"[Orchestrator] ERROR: Prompt file '{prompt_file}' does not exist.")
            return False
        with open(prompt_file, 'r', encoding='utf-8') as f:
            prompt = f.read().strip()
    elif prompt:
        prompt = prompt.strip()
    else:
        logger.error("[Orchestrator] ERROR: You must provide either prompt or prompt_file.")
        return False

    logger.info(f"[Orchestrator] Received prompt: {prompt}")
    logger.info(f"[Orchestrator] Output directory: {output_dir}")

    try:
        # 1. Scaffold Agent
        logger.info("[Orchestrator] Running Scaffold Agent...")
        scaffold_with_vite(output_dir)
        save_step_log(output_dir, "scaffold", {"status": "done"}, is_json=True)
        
        # 1.1. Clear the content of project/src/index.css to avoid style issues
        with open(os.path.join(output_dir, "src", "index.css"), "w", encoding="utf-8") as f:
            f.write("")

        # 2. Requirement Analysis Agent
        logger.info("[Orchestrator] Running Requirement Analysis Agent...")
        requirement_analysis = analyze_requirements(prompt)
        save_step_log(output_dir, "requirement_analysis", requirement_analysis, is_json=True)
        
        # Use the enriched prompt for subsequent agents
        enriched_prompt = requirement_analysis["enriched_prompt"]
        logger.info(f"[Orchestrator] Using enriched prompt: {enriched_prompt[:100]}...")

        # 3. File Structure Agent
        logger.info("[Orchestrator] Running File Structure Agent...")
        file_structure_manifest = design_file_structure(output_dir, enriched_prompt)
        save_step_log(output_dir, "file_structure_manifest", file_structure_manifest, is_json=True)

        # 4. Config Agent
        # logger.info("[Orchestrator] Running Config Agent...")
        # config_result = optimize_configs(output_dir, enriched_prompt)
        # save_step_log(output_dir, "config_agent", config_result if config_result is not None else {"status": "done"}, is_json=True)

        # 4.1. Package Validator Agent
        # logger.info("[Orchestrator] Running Package Validator Agent...")
        # package_validation = validate_and_fix_packages(output_dir, enriched_prompt)
        # save_step_log(output_dir, "package_validation", package_validation, is_json=True)

        # 5. Structure Planner Agent
        logger.info("[Orchestrator] Running Structure Planner Agent...")
        component_manifest = plan_structure(output_dir, enriched_prompt)
        save_step_log(output_dir, "structure_planner_manifest", component_manifest, is_json=True)

        # 5.1 Router Design Agent
        logger.info("[Orchestrator] Running Router Design Agent...")
        routing_manifest = design_routes(output_dir, enriched_prompt, component_manifest)
        save_step_log(output_dir, "routing_manifest", routing_manifest, is_json=True)

        # 6. Component Generator Agent (First Pass: pages/components)
        logger.info("[Orchestrator] Running Component Generator Agent (pages/components pass)...")
        package_json_path = os.path.join(output_dir, "package.json")
        allowed_libraries = []
        if os.path.exists(package_json_path):
            with open(package_json_path, "r", encoding="utf-8") as f:
                pkg = json.load(f)
                allowed_libraries = list(pkg.get("dependencies", {}).keys()) + list(pkg.get("devDependencies", {}).keys())
        # First pass: generate pages/components (not limited by FS manifest)
        generated_files = generate_components(
            output_dir,
            component_manifest,
            allowed_libraries,
            file_structure_manifest=file_structure_manifest,  # Always pass for context
            project_prompt=enriched_prompt,
            routing_manifest=routing_manifest,
            restrict_to_manifest=False
        )
        save_step_log(output_dir, "component_generation_first_pass", generated_files, is_json=True)
        write_generated_files(output_dir, generated_files)
        
        if ENABLE_SECOND_PASS:
            # 7. Update file structure manifest (scan src/ only)
            logger.info("[Orchestrator] Scanning updated file structure in src/...")
            src_dir = os.path.join(output_dir, "src")
            updated_fs_manifest = get_file_manifest(src_dir)
            updated_fs_manifest = [os.path.join("src", p) if not p.startswith("src/") else p for p in updated_fs_manifest]
            save_step_log(output_dir, "file_structure_manifest_after_first_pass", updated_fs_manifest, is_json=True)

            # 8. Component Generator Agent (Second Pass: fill empty folders and non-page/component files in src/)
            logger.info("[Orchestrator] Running Component Generator Agent (empty folders/other files in src)...")
            # Only consider files/folders in src/
            def is_page_or_component(path):
                name = os.path.splitext(os.path.basename(path))[0]
                if path.startswith("src/pages/"):
                    return any(p['name'] == name for p in component_manifest.get('pages', []))
                if path.startswith("src/components/"):
                    return any(c['name'] == name for c in component_manifest.get('components', []))
                return False
            # Only pass src/ files/folders that are not pages/components
            src_only_manifest = [p for p in updated_fs_manifest if p.startswith("src/") and not is_page_or_component(p)]
            generated_files_2 = generate_components(
                output_dir,
                component_manifest,
                allowed_libraries,
                file_structure_manifest=src_only_manifest,
                project_prompt=enriched_prompt,
                routing_manifest=routing_manifest,
                restrict_to_manifest=True
            )
            save_step_log(output_dir, "component_generation_second_pass", generated_files_2, is_json=True)
            write_generated_files(output_dir, generated_files_2)
        else:
            generated_files_2 = {}

        # # 9. Initial Relationship Refactor Agent
        # logger.info("[Orchestrator] Running Initial Relationship Refactor Agent...")
        # refactored_files = refactor_relationships({**generated_files, **generated_files_2}, component_manifest, enriched_prompt)
        # save_step_log(output_dir, "initial_relationship_refactor", refactored_files, is_json=True)
        # generated_files = {**generated_files, **generated_files_2, **refactored_files}
        generated_files = {**generated_files, **generated_files_2}

        # 10. Validation, Dependency Check, and Fix Loop
        # This loop continuously validates the code, fixes issues, and refactors relationships
        # until all problems are resolved or maximum attempts are reached
        logger.info("[Orchestrator] Running Validation, Dependency Check, and Fix Loop...")
        validation_log = []
        max_attempts = MAX_VALIDATION_ATTEMPTS  # Maximum number of fix attempts
        attempt = 0
        
        # Load allowed_libraries from shared project
        allowed_libraries = list(get_shared_project_packages())
        
        while attempt < max_attempts:
            attempt += 1
            logger.info(f"[Orchestrator] Validation attempt {attempt}/{max_attempts}")
            
            # Check for issues
            issues = validate_code(output_dir, generated_files)
            forbidden = check_forbidden_packages(generated_files)
            
            # If no issues found, we're done
            if not issues and not forbidden:
                logger.info(f"[Orchestrator] No issues found after {attempt} attempts. Validation complete!")
                break
            
            logger.info(f"[Orchestrator] Found {len(issues)} validation issues and {len(forbidden)} forbidden libraries")
            
            # Fix the issues
            logger.info("[Orchestrator] Running Code Fixer Agent...")
            # Get file tree from generated files for import resolution
            file_tree = generate_file_tree_for_imports(generated_files)
            fixed_files = fix_code_issues_v2(generated_files, issues, forbidden, allowed_libraries, component_manifest, file_tree, max_attempts=MAX_TOOL_CALLS)
            
            
            # Also run relationship refactor to check prompt alignment and project structure
            # logger.info("[Orchestrator] Running Relationship Refactor Agent...")
            # relationship_fixed_files = refactor_relationships(fixed_files, component_manifest, enriched_prompt)
            
            # Run import resolver to fix import paths and create missing files
            # logger.info("[Orchestrator] Running Import Resolver Agent...")
            # import_fixed_files = resolve_imports_and_files(relationship_fixed_files, output_dir)
            import_fixed_files = fixed_files
            
            # Check if any files were actually changed
            files_changed = any(import_fixed_files.get(path) != generated_files.get(path) for path in import_fixed_files)
            
            # Track which files were changed
            changed_files = []
            if files_changed:
                for path in import_fixed_files:
                    if import_fixed_files.get(path) != generated_files.get(path):
                        changed_files.append(path)
                        
            # Log this attempt
            validation_log.append({
                "attempt": attempt,
                "issues": issues,
                "forbidden": forbidden,
                "issues_count": len(issues),
                "forbidden_count": len(forbidden),
                "changed_files": changed_files if 'changed_files' in locals() else [],
                "files_changed_count": len(changed_files) if 'changed_files' in locals() else 0
            })
            
            if not files_changed and ENABLE_EARLY_BREAK:
                logger.info("[Orchestrator] No files were changed by the fixers. Issues may be unfixable.")
                break
            
            # Update generated_files with the fixed version
            generated_files = import_fixed_files
            
            # Update index.ts files after fixes to ensure they reflect any new exports
            # logger.info("[Orchestrator] Updating index.ts files after fixes...")
            # generated_files = update_all_index_files(output_dir, generated_files)
            
            
            # Log the validation results
            save_step_log(output_dir, "validation_and_dependency_check", validation_log, is_json=True)
            
            # Write the fixed files to disk
            write_generated_files(output_dir, generated_files)
            
            logger.info(f"[Orchestrator] Applied fixes. Re-running validation...")
        
        # Log the final validation results
        save_step_log(output_dir, "validation_and_dependency_check", validation_log, is_json=True)
        
        # Render the project
        logger.info("[Orchestrator] Rendering the project...")
        screenshot_path = os.path.join(output_dir, "screenshot.png")
        render_project(generated_files, screenshot_path)

        # 12. Write final files to disk (already written, but ensure all are present)
        write_generated_files(output_dir, generated_files)

        logger.info("[Orchestrator] Project generation complete!")
        return True
        
    except Exception as e:
        logger.error(f"[Orchestrator] ERROR during project generation: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Multi-agent React project generator.")
    parser.add_argument('--prompt', type=str, help='Project prompt/description')
    parser.add_argument('--prompt-file', type=str, help='Path to a file containing the project prompt')
    parser.add_argument('--output', type=str, default='generated-react-app', help='Output directory for the generated project')
    args = parser.parse_args()

    # Call the main generation function
    success = generate_react_project(
        prompt=args.prompt,
        prompt_file=args.prompt_file,
        output_dir=args.output
    )
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main() 
