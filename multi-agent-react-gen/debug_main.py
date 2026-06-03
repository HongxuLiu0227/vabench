import argparse
from scaffold_agent import scaffold_with_vite
from requirement_analysis_agent import analyze_requirements
from file_structure_agent import design_file_structure, get_file_manifest
from config_agent import optimize_configs
from structure_planner_agent import plan_structure
from component_generator_agent import generate_components, generate_index_ts_content
from relationship_refactor_agent import refactor_relationships
from code_validation_agent import validate_code, check_forbidden_packages, get_shared_project_packages
from code_fixer_agent import fix_code_issues, generate_file_tree_for_imports
from package_validator_agent import validate_and_fix_packages
from render_agent import render_project
from import_resolver_agent import resolve_imports_and_files
from router_design_agent import design_routes
from logging_config import get_logger
from enhanced_checkpoint_manager import EnhancedCheckpointManager
import os
import json
import sys

ENABLE_SECOND_PASS = False
MAX_VALIDATION_ATTEMPTS = 10
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

def update_all_index_files(output_dir, generated_files):
    """
    Update all index.ts files to export all named exports from files in their respective folders.
    This ensures that after the pipeline finishes and files are modified, index.ts files are up to date.
    """
    try:
        logger.info("[Orchestrator] Updating all index.ts files to reflect current exports...")
        
        # First, scan the src directory to get all files (including those written to disk)
        src_dir = os.path.join(output_dir, "src")
        all_files = {}
        
        if os.path.exists(src_dir):
            for root, dirs, files in os.walk(src_dir):
                # Skip certain directories
                dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.next', 'dist', 'build']]
                
                for file in files:
                    if file.endswith(('.ts', '.tsx')) and not file.endswith('.d.ts'):
                        abs_path = os.path.join(root, file)
                        rel_path = os.path.relpath(abs_path, output_dir)
                        
                        # Read file content from disk
                        try:
                            with open(abs_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                            all_files[rel_path] = content
                        except Exception as e:
                            logger.warning(f"[Orchestrator] Could not read file {rel_path}: {e}")
        
        # Merge with generated_files (generated_files takes precedence)
        all_files.update(generated_files)
        
        # Group files by folder
        folders_with_files = {}
        for file_path in all_files.keys():
            folder_path = os.path.dirname(file_path)
            if folder_path not in folders_with_files:
                folders_with_files[folder_path] = []
            folders_with_files[folder_path].append(file_path)
        
        updated_files = {}
        
        # Update index.ts for each folder with multiple files
        for folder_path, file_paths in folders_with_files.items():
            # Only process folders with multiple files (excluding index.ts itself)
            non_index_files = [f for f in file_paths if not f.endswith('/index.ts') and not f.endswith('/index.tsx')]
            if len(non_index_files) > 1:
                index_path = f"{folder_path}/index.ts"
                
                # Create a subset of all_files for this folder
                folder_files_dict = {f: all_files[f] for f in non_index_files}
                new_index_content = generate_index_ts_content(folder_path, folder_files_dict)
                
                if new_index_content:
                    # Check if the content is different from existing
                    existing_content = all_files.get(index_path, "")
                    if new_index_content != existing_content:
                        updated_files[index_path] = new_index_content
                        logger.info(f"[Orchestrator] Updated index.ts for folder: {folder_path}")
                    else:
                        logger.info(f"[Orchestrator] Index.ts already up to date for folder: {folder_path}")
        
        # Update generated_files with the new index.ts contents
        if updated_files:
            generated_files.update(updated_files)
            logger.info(f"[Orchestrator] Updated {len(updated_files)} index.ts files")
            
            # Write the updated index.ts files to disk
            for index_path, content in updated_files.items():
                abs_path = os.path.join(output_dir, index_path)
                os.makedirs(os.path.dirname(abs_path), exist_ok=True)
                with open(abs_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                logger.info(f"[Orchestrator] Wrote updated index.ts: {abs_path}")
        else:
            logger.info("[Orchestrator] All index.ts files are already up to date")
        
        return generated_files
        
    except Exception as e:
        logger.error(f"[Orchestrator] ERROR updating index.ts files: {e}")
        return generated_files

def generate_react_project_debug(prompt=None, prompt_file=None, output_dir='generated-react-app', 
                                debug_mode=False, resume_from_step=None, single_step=False):
    """
    Generate a React project with enhanced debugging capabilities.
    
    Args:
        prompt (str, optional): The project prompt/description
        prompt_file (str, optional): Path to a file containing the project prompt
        output_dir (str): Output directory for the generated project
        debug_mode (bool): Enable debug mode
        resume_from_step (str, optional): Specific step to resume from
        single_step (bool): Execute only one step then pause
    
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
    
    # Initialize enhanced checkpoint manager
    checkpoint_manager = EnhancedCheckpointManager(output_dir)
    
    # Configure debug mode if requested
    if debug_mode:
        try:
            checkpoint_manager.enable_debug_mode(resume_from_step, single_step)
            logger.info("[Orchestrator] Debug mode enabled")
        except ValueError as e:
            logger.error(f"[Orchestrator] ERROR: {e}")
            return False
    
    # Check for existing checkpoint and debug status
    checkpoint_info = checkpoint_manager.get_checkpoint_info()
    debug_status = checkpoint_manager.get_debug_status()
    
    if debug_status["debug_mode_enabled"]:
        logger.info(f"[Debug] Debug mode enabled")
        logger.info(f"[Debug] Resume from step: {debug_status['resume_from_step']}")
        logger.info(f"[Debug] Single step mode: {debug_status['single_step_mode']}")
        logger.info(f"[Debug] Next step: {debug_status['next_step']}")
    
    if checkpoint_info["has_checkpoint"]:
        logger.info(f"[Orchestrator] Found existing checkpoint from step '{checkpoint_info['last_step']}' at {checkpoint_info['last_timestamp']}")
        logger.info(f"[Orchestrator] Will resume from step: {checkpoint_info['next_step']}")
        
        # Load previous state
        checkpoint_data = checkpoint_manager.load_checkpoint()
        previous_state = checkpoint_data.get("state", {})
        generated_files = previous_state.get("generated_files", {})
        component_manifest = previous_state.get("component_manifest", {})
        routing_manifest = previous_state.get("routing_manifest", {})
        allowed_libraries = previous_state.get("allowed_libraries", [])
        resume_from_step = checkpoint_info["next_step"]
    else:
        logger.info("[Orchestrator] Starting fresh generation process")
        generated_files = {}
        component_manifest = {}
        routing_manifest = {}
        allowed_libraries = []
        resume_from_step = None

    try:
        # 1. Scaffold Agent
        if checkpoint_manager.should_execute_step("scaffold"):
            checkpoint_manager.mark_step_started("scaffold")
            logger.info("[Orchestrator] Running Scaffold Agent...")
            
            # If directory exists but no valid checkpoint, clean it up first
            if os.path.exists(output_dir):
                if checkpoint_info["has_checkpoint"]:
                    logger.info(f"[Orchestrator] Directory exists with valid checkpoint, will resume")
                else:
                    logger.warning(f"[Orchestrator] Directory exists but no valid checkpoint found. Cleaning up for fresh start...")
                    import shutil
                    shutil.rmtree(output_dir)
                    logger.info(f"[Orchestrator] Cleaned up directory: {output_dir}")
            
            scaffold_with_vite(output_dir)
            save_step_log(output_dir, "scaffold", {"status": "done"}, is_json=True)
            
            # Read scaffold config files
            scaffold_config_files = {}
            essential_files = [
                "package.json", "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json", 
                "vite.config.ts", "eslint.config.js", "index.html", "README.md"
            ]
            for file_name in essential_files:
                file_path = os.path.join(output_dir, file_name)
                if os.path.exists(file_path):
                    with open(file_path, "r", encoding="utf-8") as f:
                        scaffold_config_files[file_name] = f.read()
                    logger.info(f"[Orchestrator] Loaded scaffold config file: {file_name}")
            
            # Clear the content of project/src/index.css to avoid style issues
            with open(os.path.join(output_dir, "src", "index.css"), "w", encoding="utf-8") as f:
                f.write("")
            
            # Save checkpoint after scaffold
            checkpoint_manager.save_checkpoint("scaffold", {
                "generated_files": scaffold_config_files,
                "component_manifest": {},
                "allowed_libraries": [],
                "prompt": prompt
            })
            
            checkpoint_manager.mark_step_completed("scaffold")
            
            # Check if we should continue in single step mode
            if checkpoint_manager.is_single_step_mode():
                logger.info("[Debug] Single step mode: Scaffold completed. Run again to continue.")
                return True
        else:
            logger.info("[Orchestrator] Skipping Scaffold Agent (already completed)")
            # Load scaffold files from previous run
            scaffold_config_files = generated_files

        # 2. Requirement Analysis Agent
        if checkpoint_manager.should_execute_step("requirement_analysis"):
            checkpoint_manager.mark_step_started("requirement_analysis")
            logger.info("[Orchestrator] Running Requirement Analysis Agent...")
            requirement_analysis = analyze_requirements(prompt)
            save_step_log(output_dir, "requirement_analysis", requirement_analysis, is_json=True)
            
            # Use the enriched prompt for subsequent agents
            enriched_prompt = requirement_analysis["enriched_prompt"]
            logger.info(f"[Orchestrator] Using enriched prompt: {enriched_prompt[:100]}...")
            
            # Save checkpoint after requirement analysis
            checkpoint_manager.save_checkpoint("requirement_analysis", {
                "generated_files": scaffold_config_files,
                "component_manifest": {},
                "allowed_libraries": [],
                "prompt": prompt,
                "enriched_prompt": enriched_prompt,
                "requirement_analysis": requirement_analysis
            })
            
            checkpoint_manager.mark_step_completed("requirement_analysis")
            
            # Check if we should continue in single step mode
            if checkpoint_manager.is_single_step_mode():
                logger.info("[Debug] Single step mode: Requirement analysis completed. Run again to continue.")
                return True
        else:
            logger.info("[Orchestrator] Skipping Requirement Analysis Agent (already completed)")
            # Load from checkpoint
            checkpoint_data = checkpoint_manager.load_checkpoint()
            if checkpoint_data and "state" in checkpoint_data:
                requirement_analysis = checkpoint_data["state"].get("requirement_analysis", {})
                enriched_prompt = checkpoint_data["state"].get("enriched_prompt", prompt)
            else:
                logger.warning("[Orchestrator] Could not load checkpoint data for requirement analysis")
                requirement_analysis = {}
                enriched_prompt = prompt

        file_structure_manifest = {}

        # Skip file structure and planning if resuming from later checkpoint
        if resume_from_step in [None, "scaffold", "requirement_analysis"]:
            # 3. File Structure Agent
            logger.info("[Orchestrator] Running File Structure Agent...")
            file_structure_manifest = design_file_structure(output_dir, enriched_prompt)
            save_step_log(output_dir, "file_structure_manifest", file_structure_manifest, is_json=True)

            # 5. Structure Planner Agent
            logger.info("[Orchestrator] Running Structure Planner Agent...")
            component_manifest = plan_structure(output_dir, enriched_prompt)
            save_step_log(output_dir, "structure_planner_manifest", component_manifest, is_json=True)
        else:
            # Load from checkpoint
            logger.info("[Orchestrator] Loading file structure and component manifest from checkpoint")
            checkpoint_data = checkpoint_manager.load_checkpoint()
            if checkpoint_data and "state" in checkpoint_data:
                previous_state = checkpoint_data.get("state", {})
                file_structure_manifest = previous_state.get("file_structure_manifest", {})
                component_manifest = previous_state.get("component_manifest", {})
                routing_manifest = previous_state.get("routing_manifest", routing_manifest)
            else:
                logger.warning("[Orchestrator] Could not load checkpoint data for file structure")
                file_structure_manifest = {}
                component_manifest = {}

        # 5. Router Design Agent
        if checkpoint_manager.should_execute_step("router_design"):
            checkpoint_manager.mark_step_started("router_design")
            logger.info("[Orchestrator] Running Router Design Agent...")
            routing_manifest = design_routes(output_dir, enriched_prompt, component_manifest)
            save_step_log(output_dir, "routing_manifest", routing_manifest, is_json=True)

            checkpoint_manager.save_checkpoint("router_design", {
                "generated_files": scaffold_config_files if resume_from_step in [None, "scaffold", "requirement_analysis"] else generated_files,
                "component_manifest": component_manifest,
                "routing_manifest": routing_manifest,
                "allowed_libraries": allowed_libraries,
                "prompt": prompt,
                "enriched_prompt": enriched_prompt,
                "requirement_analysis": requirement_analysis,
                "file_structure_manifest": file_structure_manifest
            })

            checkpoint_manager.mark_step_completed("router_design")

            if checkpoint_manager.is_single_step_mode():
                logger.info("[Debug] Single step mode: Router design completed. Run again to continue.")
                return True
        else:
            logger.info("[Orchestrator] Skipping Router Design Agent (already completed)")
            checkpoint_data = checkpoint_manager.load_checkpoint()
            if checkpoint_data and "state" in checkpoint_data:
                previous_state = checkpoint_data.get("state", {})
                routing_manifest = previous_state.get("routing_manifest", routing_manifest)
            else:
                logger.warning("[Orchestrator] Could not load checkpoint data for router design")

        # 6. Component Generator Agent (First Pass: pages/components)
        if checkpoint_manager.should_execute_step("component_generation"):
            checkpoint_manager.mark_step_started("component_generation")
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
            
            # Add scaffold config files to generated files
            generated_files.update(scaffold_config_files)
            
            # Second pass generation (if enabled)
            if ENABLE_SECOND_PASS:
                # Update file structure manifest (scan src/ only)
                logger.info("[Orchestrator] Scanning updated file structure in src/...")
                src_dir = os.path.join(output_dir, "src")
                updated_fs_manifest = get_file_manifest(src_dir)
                updated_fs_manifest = [os.path.join("src", p) if not p.startswith("src/") else p for p in updated_fs_manifest]
                save_step_log(output_dir, "file_structure_manifest_after_first_pass", updated_fs_manifest, is_json=True)

                # Component Generator Agent (Second Pass: fill empty folders and non-page/component files in src/)
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
                
                # Merge second pass files
                generated_files.update(generated_files_2)
            else:
                generated_files_2 = {}
            
            # Save checkpoint after component generation (including second pass if enabled)
            checkpoint_manager.save_checkpoint("component_generation", {
                "generated_files": generated_files,
                "generated_files_2": generated_files_2,
                "component_manifest": component_manifest,
                "routing_manifest": routing_manifest,
                "allowed_libraries": allowed_libraries,
                "prompt": prompt,
                "enriched_prompt": enriched_prompt,
                "requirement_analysis": requirement_analysis,
                "file_structure_manifest": file_structure_manifest,
                "second_pass_enabled": ENABLE_SECOND_PASS
            })
            
            checkpoint_manager.mark_step_completed("component_generation")
            
            # Check if we should continue in single step mode
            if checkpoint_manager.is_single_step_mode():
                logger.info("[Debug] Single step mode: Component generation completed. Run again to continue.")
                return True
        else:
            logger.info("[Orchestrator] Skipping Component Generation (already completed)")
            # Load generated files from checkpoint
            checkpoint_data = checkpoint_manager.load_checkpoint()
            if checkpoint_data and "state" in checkpoint_data:
                checkpoint_state = checkpoint_data["state"]
                generated_files = checkpoint_state.get("generated_files", generated_files)
                generated_files_2 = checkpoint_state.get("generated_files_2", {})
                component_manifest = checkpoint_state.get("component_manifest", component_manifest)
                routing_manifest = checkpoint_state.get("routing_manifest", routing_manifest)
                allowed_libraries = checkpoint_state.get("allowed_libraries", allowed_libraries)
                file_structure_manifest = checkpoint_state.get("file_structure_manifest", file_structure_manifest)
                second_pass_was_enabled = checkpoint_state.get("second_pass_enabled", False)
                logger.info(f"[Orchestrator] Loaded {len(generated_files)} files from component generation checkpoint")
                if second_pass_was_enabled:
                    logger.info(f"[Orchestrator] Second pass was enabled - loaded {len(generated_files_2)} additional files")
            else:
                logger.warning("[Orchestrator] Could not load checkpoint data for component generation")
                generated_files_2 = {}

        # 9. Initial Relationship Refactor Agent
        if checkpoint_manager.should_execute_step("relationship_refactor"):
            checkpoint_manager.mark_step_started("relationship_refactor")
            logger.info("[Orchestrator] Running Initial Relationship Refactor Agent...")
            refactored_files = refactor_relationships({**generated_files, **generated_files_2}, component_manifest, enriched_prompt)
            save_step_log(output_dir, "initial_relationship_refactor", refactored_files, is_json=True)
            generated_files = {**generated_files, **generated_files_2, **refactored_files}
            
            # Save checkpoint after relationship refactor
            checkpoint_manager.save_checkpoint("relationship_refactor", {
                "generated_files": generated_files,
                "component_manifest": component_manifest,
                "routing_manifest": routing_manifest,
                "allowed_libraries": allowed_libraries,
                "prompt": prompt,
                "enriched_prompt": enriched_prompt,
                "requirement_analysis": requirement_analysis,
                "file_structure_manifest": file_structure_manifest,
                "refactored_files": refactored_files
            })
            
            checkpoint_manager.mark_step_completed("relationship_refactor")
            
            # Check if we should continue in single step mode
            if checkpoint_manager.is_single_step_mode():
                logger.info("[Debug] Single step mode: Relationship refactor completed. Run again to continue.")
                return True
        else:
            logger.info("[Orchestrator] Skipping Initial Relationship Refactor Agent (already completed)")
            # Load generated files from checkpoint (should include refactored content)
            checkpoint_data = checkpoint_manager.load_checkpoint()
            if checkpoint_data and "state" in checkpoint_data:
                checkpoint_state = checkpoint_data["state"]
                generated_files = checkpoint_state.get("generated_files", generated_files)
                component_manifest = checkpoint_state.get("component_manifest", component_manifest)
                routing_manifest = checkpoint_state.get("routing_manifest", routing_manifest)
                allowed_libraries = checkpoint_state.get("allowed_libraries", allowed_libraries)
                file_structure_manifest = checkpoint_state.get("file_structure_manifest", file_structure_manifest)
                logger.info(f"[Orchestrator] Loaded {len(generated_files)} files from relationship refactor checkpoint")
            else:
                logger.warning("[Orchestrator] Could not load checkpoint data for relationship refactor")

        # 9.1. Add scaffold config files to generated_files for render agent
        generated_files.update(scaffold_config_files)
        logger.info(f"[Orchestrator] Added {len(scaffold_config_files)} scaffold config files to generated_files")

        # 10. Validation, Dependency Check, and Fix Loop
        if checkpoint_manager.should_execute_step("validation_and_fixing"):
            checkpoint_manager.mark_step_started("validation_and_fixing")
            logger.info("[Orchestrator] Running Validation, Dependency Check, and Fix Loop...")
            validation_log = []
            max_attempts = MAX_VALIDATION_ATTEMPTS
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
                    logger.info(f"[Orchestrator] No issues found after {attempt} attempts. Validation complete! Now checking render result...")
                    render_result = render_project(generated_files)
                    if render_result["success"] and "Page error" not in render_result["console_output"] and "Console error" not in render_result["console_output"] and "Compilation error" not in render_result["console_output"]:
                        logger.info("[Orchestrator] Render successful!")
                        break
                    else:
                        logger.warning("[Orchestrator] Render failed! Try fixing the issues...")
                        issues = [render_result["console_output"]]
                
                logger.info(f"[Orchestrator] Found {len(issues)} validation issues and {len(forbidden)} forbidden libraries")
                
                # Fix the issues
                logger.info("[Orchestrator] Running Code Fixer Agent...")
                file_tree = generate_file_tree_for_imports(generated_files)
                fixed_files = fix_code_issues(generated_files, issues, forbidden, allowed_libraries, component_manifest, file_tree)
                
                files_changed = any(fixed_files.get(path) != generated_files.get(path) for path in fixed_files)
                
                # Track which files were changed
                changed_files = []
                if files_changed:
                    for path in fixed_files:
                        if fixed_files.get(path) != generated_files.get(path):
                            changed_files.append(path)
                            
                # Log this attempt
                validation_log.append({
                    "attempt": attempt,
                    "issues": issues,
                    "forbidden": forbidden,
                    "issues_count": len(issues),
                    "forbidden_count": len(forbidden),
                    "changed_files": changed_files,
                    "files_changed_count": len(changed_files)
                })
                
                if not files_changed and ENABLE_EARLY_BREAK:
                    logger.info("[Orchestrator] No files were changed by the fixers. Issues may be unfixable.")
                    break
                
                # Update generated_files with the fixed version
                generated_files = fixed_files
                
                # Log the validation results
                save_step_log(output_dir, "validation_and_dependency_check", validation_log, is_json=True)
                
                # Write the fixed files to disk
                write_generated_files(output_dir, generated_files)
                
                logger.info(f"[Orchestrator] Applied fixes. Re-running validation...")
            
            # Log the final validation results
            save_step_log(output_dir, "validation_and_dependency_check", validation_log, is_json=True)
            
            # Save checkpoint after validation and fixing
            checkpoint_manager.save_checkpoint("validation_and_fixing", {
                "generated_files": generated_files,
                "component_manifest": component_manifest,
                "routing_manifest": routing_manifest,
                "allowed_libraries": allowed_libraries,
                "prompt": prompt,
                "enriched_prompt": enriched_prompt,
                "requirement_analysis": requirement_analysis,
                "file_structure_manifest": file_structure_manifest,
                "validation_log": validation_log
            })
            
            checkpoint_manager.mark_step_completed("validation_and_fixing")
            
            # Check if we should continue in single step mode
            if checkpoint_manager.is_single_step_mode():
                logger.info("[Debug] Single step mode: Validation and fixing completed. Run again to continue.")
                return True
        else:
            logger.info("[Orchestrator] Skipping Validation and Fixing (already completed)")
            # Load state from checkpoint
            checkpoint_data = checkpoint_manager.load_checkpoint()
            if checkpoint_data and "state" in checkpoint_data:
                checkpoint_state = checkpoint_data["state"]
                generated_files = checkpoint_state.get("generated_files", generated_files)
                component_manifest = checkpoint_state.get("component_manifest", component_manifest)
                routing_manifest = checkpoint_state.get("routing_manifest", routing_manifest)
                allowed_libraries = checkpoint_state.get("allowed_libraries", allowed_libraries)
                file_structure_manifest = checkpoint_state.get("file_structure_manifest", file_structure_manifest)
                logger.info(f"[Orchestrator] Loaded {len(generated_files)} files from validation checkpoint")
            else:
                logger.warning("[Orchestrator] Could not load checkpoint data for validation")

        # Render the project
        if checkpoint_manager.should_execute_step("render"):
            checkpoint_manager.mark_step_started("render")
            logger.info("[Orchestrator] Rendering the project...")
            screenshot_path = os.path.join(output_dir, "screenshot.png")
            render_result = render_project(generated_files, screenshot_path)
            save_step_log(output_dir, "render_result", render_result, is_json=True)
            
            # Save checkpoint after render
            checkpoint_manager.save_checkpoint("render", {
                "generated_files": generated_files,
                "component_manifest": component_manifest,
                "routing_manifest": routing_manifest,
                "allowed_libraries": allowed_libraries,
                "prompt": prompt,
                "enriched_prompt": enriched_prompt,
                "requirement_analysis": requirement_analysis,
                "file_structure_manifest": file_structure_manifest,
                "render_result": render_result
            })
            
            checkpoint_manager.mark_step_completed("render")
            
            # Check if we should continue in single step mode
            if checkpoint_manager.is_single_step_mode():
                logger.info("[Debug] Single step mode: Render completed. Run again to continue.")
                return True
        else:
            logger.info("[Orchestrator] Skipping Render (already completed)")
            # Load state from checkpoint to ensure we have the latest data
            checkpoint_data = checkpoint_manager.load_checkpoint()
            if checkpoint_data and "state" in checkpoint_data:
                checkpoint_state = checkpoint_data["state"]
                generated_files = checkpoint_state.get("generated_files", generated_files)
                component_manifest = checkpoint_state.get("component_manifest", component_manifest)
                routing_manifest = checkpoint_state.get("routing_manifest", routing_manifest)
                allowed_libraries = checkpoint_state.get("allowed_libraries", allowed_libraries)
                logger.info(f"[Orchestrator] Loaded {len(generated_files)} files from render checkpoint")
            else:
                logger.warning("[Orchestrator] Could not load checkpoint data for render")

        # 12. Write final files to disk (already written, but ensure all are present)
        write_generated_files(output_dir, generated_files)

        # Mark completion and clear checkpoints
        checkpoint_manager.save_checkpoint("completion", {
            "status": "completed",
            "timestamp": checkpoint_manager._get_timestamp()
        })
        
        # Disable debug mode on completion
        if checkpoint_manager.is_debug_mode():
            checkpoint_manager.disable_debug_mode()
            logger.info("[Debug] Debug mode disabled - project generation completed")
        
        checkpoint_manager.clear_checkpoints()
        
        logger.info("[Orchestrator] Project generation complete!")
        return True
        
    except Exception as e:
        logger.error(f"[Orchestrator] ERROR during project generation: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Multi-agent React project generator with debugging capabilities.")
    parser.add_argument('--prompt', type=str, help='Project prompt/description')
    parser.add_argument('--prompt-file', type=str, help='Path to a file containing the project prompt')
    parser.add_argument('--output', type=str, default='generated-react-app', help='Output directory for the generated project')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    parser.add_argument('--resume-from', type=str, help='Resume from specific step (scaffold, requirement_analysis, router_design, component_generation, relationship_refactor, validation_and_fixing, render)')
    parser.add_argument('--single-step', action='store_true', help='Execute only one step then pause (requires --debug)')
    parser.add_argument('--status', action='store_true', help='Show current debug status and exit')
    
    args = parser.parse_args()
    
    # Show status if requested
    if args.status:
        checkpoint_manager = EnhancedCheckpointManager(args.output)
        status = checkpoint_manager.get_debug_status()
        print("\n=== Debug Status ===")
        print(f"Debug mode enabled: {status['debug_mode_enabled']}")
        print(f"Single step mode: {status['single_step_mode']}")
        print(f"Current step: {status['current_step']}")
        print(f"Resume from step: {status['resume_from_step']}")
        print(f"Next step: {status['next_step']}")
        print(f"Has checkpoint: {status['has_checkpoint']}")
        print(f"Last checkpoint step: {status['last_checkpoint_step']}")
        print(f"Completed steps: {status['completed_steps']}")
        print(f"All steps: {status['all_steps']}")
        print(f"Can continue: {status['can_continue']}")
        return
    
    # Validate arguments
    if args.single_step and not args.debug:
        logger.error("--single-step requires --debug to be enabled")
        sys.exit(1)
    
    if args.resume_from and not args.debug:
        logger.error("--resume-from requires --debug to be enabled")
        sys.exit(1)
    
    # Call the main generation function
    success = generate_react_project_debug(
        prompt=args.prompt,
        prompt_file=args.prompt_file,
        output_dir=args.output,
        debug_mode=args.debug,
        resume_from_step=args.resume_from,
        single_step=args.single_step
    )
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
