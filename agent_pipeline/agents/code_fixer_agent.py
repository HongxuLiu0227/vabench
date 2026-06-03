import os
import json
import re
import threading
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any
from dotenv import load_dotenv
import openai
from .llm_output_utils import (
    extract_json_from_llm_output,
    get_complete_llm_response,
    get_complete_llm_response_with_mcp,
    get_complete_llm_response_with_mcp_v2,
)
from ..logging_config import get_logger

logger = get_logger(__name__)

def try_install_package_in_shared_project(package_name: str) -> bool:
    """
    Try to install a package in the shared project.
    Returns True if installation was successful, False otherwise.
    """
    shared_project_path = os.path.join(os.path.dirname(__file__), "..", "..", "shared-package")
    
    if not os.path.exists(shared_project_path):
        logger.info(f"[Code Fixer Agent] Shared project path not found: {shared_project_path}")
        return False
    
    try:
        logger.info(f"[Code Fixer Agent] Attempting to install {package_name} in shared project...")
        
        # Run npm install for the package
        result = subprocess.run(
            ["npm", "install", package_name],
            cwd=shared_project_path,
            capture_output=True,
            text=True,
            timeout=180
        )
        
        if result.returncode == 0:
            logger.info(f"[Code Fixer Agent] Successfully installed {package_name}")
            return True
        else:
            logger.info(f"[Code Fixer Agent] Failed to install {package_name}: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.info(f"[Code Fixer Agent] Timeout installing {package_name}")
        return False
    except Exception as e:
        logger.warning(f"[Code Fixer Agent] Error installing {package_name}: {e}")
        return False


def process_forbidden_libraries(forbidden_libraries: List[Dict], allowed_libraries: List[str]) -> tuple[List[Dict], List[str]]:
    """
    Process forbidden libraries by trying to install them first.
    Returns (remaining_forbidden, updated_allowed_libraries).
    """
    # Get unique packages to avoid duplicate installations
    unique_packages = {}
    for item in forbidden_libraries:
        library_name = item['library']
        if library_name not in unique_packages:
            unique_packages[library_name] = []
        unique_packages[library_name].append(item)
    
    remaining_forbidden = []
    updated_allowed = allowed_libraries.copy()
    
    logger.info(f"[Code Fixer Agent] Processing {len(unique_packages)} unique forbidden packages...")
    
    for library_name, items in unique_packages.items():
        # Try to install the package
        if try_install_package_in_shared_project(library_name):
            # Installation successful, add to allowed libraries
            if library_name not in updated_allowed:
                updated_allowed.append(library_name)
            logger.info(f"[Code Fixer Agent] {library_name} is now allowed after installation")
        else:
            # Installation failed, keep all items with this library in forbidden list
            remaining_forbidden.extend(items)
            logger.info(f"[Code Fixer Agent] {library_name} remains forbidden - will be removed")
    
    return remaining_forbidden, updated_allowed


def parse_typescript_errors_by_file(issues: List[str]) -> Dict[str, List[str]]:
    """
    Parse TypeScript errors and group them by file.
    Returns a dictionary with file paths as keys and lists of errors as values.
    """
    file_errors = {}
    
    for issue in issues:
        # Defensive programming: ensure issue is a string
        if not isinstance(issue, str):
            logger.warning(f"[Code Fixer Agent] Skipping non-string issue: {type(issue)} - {issue}")
            continue
            
        if not issue.startswith("TypeScript:"):
            continue
            
        # Extract the TypeScript errors from the issue string
        ts_errors = issue.replace("TypeScript: ", "")
        
        # Split by newlines to get individual errors
        error_lines = ts_errors.split('\n')
        
        last_file = None
        
        for error_line in error_lines:
            if not error_line.strip():
                continue
                
            # Extract file path from error line
            # Pattern: /path/to/file.tsx(line,col): error TSxxxx: message
            # The path can have multiple formats, so be flexible
            match = re.match(r'([^(]+)\((\d+),(\d+)\):\s*error\s+TS\d+:\s*(.+)', error_line)
            if not match:
                # Try alternative formats
                match = re.match(r'([^(]+)\((\d+),(\d+)\):\s*error:\s*(.+)', error_line)
            if not match:
                # Try even more flexible format
                match = re.match(r'([^(]+)\((\d+),(\d+)\):\s*(.+)', error_line)
            
            if match:
                file_path = match.group(1).strip()
                line_num = int(match.group(2))
                col_num = int(match.group(3))
                error_message = match.group(4).strip()
                
                # Clean up the file path (remove temp directory prefix and normalize)
                # Handle various temp directory patterns
                file_path = re.sub(r'.*?/(src/.+)', r'\1', file_path)
                # If still has temp path, try different pattern
                if '/T/' in file_path or '/tmp' in file_path:
                    file_path = re.sub(r'.*?/src/', 'src/', file_path)
                
                if file_path not in file_errors:
                    file_errors[file_path] = []
                    
                last_file = file_path
                
                file_errors[file_path].append(f"Line {line_num}, Column {col_num}: {error_message}")
            else:
                # Append this error to the previous file
                if last_file:
                    file_errors[last_file][-1] += f"\n{error_line}"
    
    logger.info(f"[Code Fixer Agent] Parsed {sum(len(errors) for errors in file_errors.values())} TypeScript errors across {len(file_errors)} files")
    return file_errors


def get_related_files_for_context(file_path: str, generated_files: Dict[str, str]) -> Dict[str, str]:
    """
    Get related files for context (imports and files that import this file).
    Returns a dictionary with file paths as keys and content as values.
    Limits context to most relevant files only.
    """
    related_files = {}
    
    # Get the file content itself
    # if file_path in generated_files:
    #     related_files[file_path] = generated_files[file_path]
    
    # Extract import statements from the current file to find direct dependencies
    if file_path in generated_files:
        content = generated_files[file_path]
        import_matches = re.findall(r'import.*from\s+[\'"](\.[^\'"]*)[\'"]\s*;?', content)
        
        # Add directly imported files
        count = 0
        for import_path in import_matches:
            # Resolve relative import
            if import_path.startswith('./'):
                resolved_path = os.path.join(os.path.dirname(file_path), import_path[2:])
            elif import_path.startswith('../'):
                resolved_path = os.path.normpath(os.path.join(os.path.dirname(file_path), import_path))
            else:
                continue
                
            resolved_path = resolved_path.replace('\\', '/')
            
            # Try different extensions
            for ext in ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js']:
                potential_path = f"{resolved_path}{ext}"
                if potential_path in generated_files:
                    related_files[potential_path] = generated_files[potential_path]
                    count += 1
                    break
    
    return related_files


def generate_file_tree_for_imports(generated_files: Dict[str, str]) -> List[str]:
    """
    Generate a comprehensive file tree for import resolution.
    Returns a list of file paths organized by directory structure.
    """
    file_tree = []
    
    # Group files by directory
    dirs = {}
    for file_path in generated_files.keys():
        dir_path = os.path.dirname(file_path)
        if dir_path not in dirs:
            dirs[dir_path] = []
        dirs[dir_path].append(file_path)
    
    # Sort directories and files for consistent output
    for dir_path in sorted(dirs.keys()):
        if dir_path:  # Skip root directory
            file_tree.append(f"📁 {dir_path}/")
        for file_path in sorted(dirs[dir_path]):
            file_tree.append(f"  📄 {file_path}")
    
    return file_tree


def fix_file_typescript_errors(file_path: str, errors: List[str], file_content: str, 
                              related_files: Dict[str, str], allowed_libraries: List[str], 
                              file_tree: List[str] = None, generated_files: Dict[str, str] = None) -> Dict[str, str]:
    """
    Fix TypeScript errors for a specific file and potentially other related files.
    Returns a dictionary of file paths to their fixed content.
    """
    logger.info(f"[Code Fixer Agent] Fixing {len(errors)} TypeScript errors in {file_path}")
    
    # Load LLM credentials from .env
    load_dotenv()
    api_key = os.getenv("LLM_KEY")
    model = os.getenv("MODEL_NAME")
    base_url = os.getenv("LLM_BASE_URL")
    
    if not api_key:
        logger.error("[Code Fixer Agent] ERROR: LLM_KEY not found in .env")
        return {file_path: file_content}
    
    # Create OpenAI client
    if base_url:
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
    else:
        client = openai.OpenAI(api_key=api_key)
    
    # System prompt for TypeScript error fixing
    system_prompt = f"""You are a TypeScript code fixer. Fix the specific errors listed while maintaining the original functionality and style.

Rules:
1. Fix ONLY the TypeScript errors provided
2. Use named exports: `export const MyComponent = ...`
3. Use named imports: `import {{ Component }} from './path'`
4. Keep all existing CSS and styling
5. Available libraries: {allowed_libraries}
6. If fixing errors in one file requires changes to other files (e.g., import/export fixes, type definitions), include those files in your response

CRITICAL RESTRICTIONS:
- NEVER replace existing components with placeholder content
- NEVER replace component implementations with simple placeholder divs or text
- NEVER remove functional component logic and replace with basic placeholders
- ALWAYS preserve the original component's functionality and UI structure
- If a component has TypeScript errors, fix the types/imports but keep the component's actual implementation
- Only make minimal changes necessary to resolve the specific TypeScript errors

WORKFLOW - ITERATIVE FIXING (MANDATORY):
1. ALL NECESSARY FILE CONTENT IS ALREADY PROVIDED IN THE USER MESSAGE - DO NOT USE READ TOOL if not necessary
2. Start fixing immediately using the provided file content
3. Write ONE small fix at a time using the write tool
4. Use check tool to validate the fix
5. If check passes, move to next error. If check fails, fix the issue and check again
6. NEVER return the final JSON format - always use tools to apply fixes incrementally

RULES:
- Fix errors ONE AT A TIME using write tool
- Always use check tool after each write
- NEVER output the final JSON format {{"finished": true}} unless it's finished
- Work iteratively until all errors are resolved
- Use tools to apply every single change
- NEVER replace components with placeholder content

You MUST use write and check tools for every fix. Do not return any final JSON response."""

    # User prompt with context
    file_tree_info = ""
    if file_tree:
        file_tree_info = f"""
PROJECT FILE TREE:
{chr(10).join([f"- {path}" for path in file_tree])}
"""
    
    # Prepare related files info (limit to essential context only)
    related_info = ""
    if len(related_files) > 1:  # Only include if there are related files besides the current one
        related_info = "\n\nRELATED FILES (for import context):\n"
        for path, content in list(related_files.items()):  # Limit to 3 files max
            if path != file_path:
                # Only show imports and exports, not full content
                lines = content.split('\n')
                import_export_lines = [line for line in lines if 'import' in line or 'export' in line]
                if import_export_lines:
                    related_info += f"// {path}\n" + "\n".join(import_export_lines[:5]) + "\n\n"
    
    user_prompt = f"""Fix these TypeScript errors:

FILE: {file_path}

ERRORS TO FIX:
{chr(10).join([f"- {error}" for error in errors])}  

FILE STRUCTURE:
{file_tree_info}

CURRENT FILE CONTENT:
{file_content}
{related_info}
Return the fixed file as JSON."""

    # Call LLM
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        # The MCP function now returns JSON with file updates from tool operations
        response_content = get_complete_llm_response_with_mcp(messages, model, client, generated_files, max_attempts=10, max_tokens=8192)
        
        # Parse the response to get the updated files
        try:
            updated_files = json.loads(response_content)
        except Exception as json_error:
            logger.error(f"[Code Fixer Agent] ERROR: Failed to parse response from MCP: {json_error}")
            logger.error(f"[Code Fixer Agent] Raw response: {response_content[:500]}...")
            return {file_path: file_content}
        
        if not isinstance(updated_files, dict):
            logger.error(f"[Code Fixer Agent] ERROR: MCP did not return file updates for {file_path}")
            logger.error(f"[Code Fixer Agent] Response type: {type(updated_files)}, content: {str(updated_files)[:200]}...")
            return {file_path: file_content}
        
        # Filter out empty values (deleted files) and return only updated files
        fixed_files = {}
        for path, content in updated_files.items():
            if path.startswith('src/'):
                if content and isinstance(content, str) and content.strip():
                    fixed_files[path] = content
                elif content and not isinstance(content, str):
                    logger.warning(f"[Code Fixer Agent] Content for {path} is not a string: {type(content)}, converting to string")
                    content_str = str(content)
                    if content_str.strip():
                        fixed_files[path] = content_str
            else:
                logger.warning(f"[Code Fixer Agent] Skipping file not in src directory: {path}")
                logger.warning(f"[Code Fixer Agent] Content: {content}")
        
        if not fixed_files:
            logger.info(f"[Code Fixer Agent] No files were modified for {file_path}")
            return {file_path: file_content}
        
        if "finished" in updated_files:
            logger.info(f"[Code Fixer Agent] Finished fixing {file_path}")
            del fixed_files["finished"]
        
        # Log the files that were fixed
        logger.info(f"[Code Fixer Agent] Fixed files through tools: {list(fixed_files.keys())}")
        
        return fixed_files
            
    except ValueError as e:
        if "LLM output incomplete after max attempts" in str(e):
            logger.warning(f"[Code Fixer Agent] LLM reached max attempts for {file_path}, but task may have been completed")
            # Check if any files were actually modified by looking at the generated_files
            # If the file content changed, consider it a success
            if file_path in generated_files and generated_files[file_path] != file_content:
                logger.info(f"[Code Fixer Agent] File {file_path} was modified, considering fix successful")
                return {file_path: generated_files[file_path]}
            else:
                logger.error(f"[Code Fixer Agent] No changes detected for {file_path}")
                return {file_path: file_content}
        else:
            logger.error(f"[Code Fixer Agent] ERROR: Failed to fix TypeScript errors in {file_path}: {e}")
            return {file_path: file_content}
    except Exception as e:
        logger.error(f"[Code Fixer Agent] ERROR: Failed to fix TypeScript errors in {file_path}: {e}")
        return {file_path: file_content}


def fix_code_issues_parallel(generated_files: Dict[str, str], issues: List[str], forbidden_libraries: List[Dict], allowed_libraries: List[str], component_manifest: Dict, file_tree: List[str] = None) -> Dict[str, str]:
    """
    Fix code issues by grouping TypeScript errors by file and fixing them in parallel.
    Returns updated generated_files dict with fixes applied.
    """
    # Filter out non-string issues for defensive programming
    string_issues = [issue for issue in issues if isinstance(issue, str)]
    if len(string_issues) != len(issues):
        logger.warning(f"[Code Fixer Agent] Filtered out {len(issues) - len(string_issues)} non-string issues in parallel processing")
    
    logger.info(f"[Code Fixer Agent] Fixing issues with parallel processing...")
    
    # Process forbidden libraries first - try to install them
    remaining_forbidden, updated_allowed = process_forbidden_libraries(forbidden_libraries, allowed_libraries)
    
    # Parse TypeScript errors by file
    file_errors = parse_typescript_errors_by_file(string_issues)
    logger.info(f"[Code Fixer Agent] Found TypeScript errors in {len(file_errors)} files")
    
    # Process each file with errors in parallel
    updated_files = generated_files.copy()
    
    def fix_single_file(file_path: str, errors: List[str]) -> tuple[str, Dict[str, str]]:
        """Fix a single file and return (file_path, dict_of_fixed_files). If the file does not exist yet, allow the fixer to create it."""
        # Prepare base content: use existing content or empty string for new files
        base_content = generated_files.get(file_path, "")

        # Get related files for context
        related_files = get_related_files_for_context(file_path, generated_files)

        # Fix the file (may return multiple files or create new ones)
        fixed_files = fix_file_typescript_errors(
            file_path,
            errors,
            base_content,
            related_files,
            updated_allowed,  # Use updated allowed libraries
            file_tree,  # Pass file tree for import resolution
            generated_files,
        )

        return file_path, fixed_files
    
    # Use ThreadPoolExecutor for parallel processing
    if len(file_errors) > 0:
        max_workers = min(len(file_errors), 3)  # Limit to 3 concurrent workers to avoid API overwhelm
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all file fixes
            future_to_file = {
                executor.submit(fix_single_file, file_path, errors): file_path 
                for file_path, errors in file_errors.items()
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_file):
                file_path, fixed_files = future.result()
                # Update all files that were fixed
                for fixed_file_path, fixed_content in fixed_files.items():
                    if not isinstance(fixed_content, str):
                        logger.warning(f"[Code Fixer Agent] Fixed content is not a string for {fixed_file_path}, will ignore it")
                        continue
                    updated_files[fixed_file_path] = fixed_content
                    if fixed_file_path == file_path:
                        logger.info(f"[Code Fixer Agent] Fixed {file_path}")
                    else:
                        logger.info(f"[Code Fixer Agent] Also fixed related file {fixed_file_path}")
    
    # Handle remaining forbidden libraries separately
    if remaining_forbidden:
        logger.info(f"[Code Fixer Agent] Fixing {len(remaining_forbidden)} remaining forbidden library issues...")
        updated_files = fix_specific_issues(updated_files, "dependencies", 
                                         [f"{item['file']}: {item['library']}" for item in remaining_forbidden], 
                                         updated_allowed)
    
    logger.info(f"[Code Fixer Agent] Successfully applied fixes to {len(file_errors)} files")
    return updated_files


def fix_code_issues_v2(generated_files: Dict[str, str], issues: List[str], forbidden_libraries: List[Dict], allowed_libraries: List[str], component_manifest: Dict, file_tree: List[str] = None, max_attempts: int = 10) -> Dict[str, str]:
    """
    Fix code issues based on validation results and dependency problems.
    Returns updated generated_files dict with fixes applied.
    """
    # Load LLM credentials from .env
    load_dotenv()
    api_key = os.getenv("LLM_KEY")
    model = os.getenv("MODEL_NAME")
    base_url = os.getenv("LLM_BASE_URL")
    
    if not api_key:
        logger.error("[Code Fixer Agent] ERROR: LLM_KEY not found in .env")
        return generated_files
    
    # Create OpenAI client
    if base_url:
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
    else:
        client = openai.OpenAI(api_key=api_key)
        
    # Filter out non-string issues for defensive programming
    string_issues = [issue for issue in issues if isinstance(issue, str)]
    if len(string_issues) != len(issues):
        logger.warning(f"[Code Fixer Agent] Filtered out {len(issues) - len(string_issues)} non-string issues")
    
    logger.info(f"[Code Fixer Agent] Fixing {len(string_issues)} validation issues and {len(forbidden_libraries)} dependency issues...")
    
    # Process forbidden libraries first - try to install them
    remaining_forbidden, updated_allowed = process_forbidden_libraries(forbidden_libraries, allowed_libraries)
        
    # Prepare issues summary
    issues_summary = "\n".join([f"- {issue}" for issue in string_issues]) if string_issues else "No validation issues found."
    
    # Prepare forbidden libraries summary (only remaining ones)
    forbidden_summary = "\n".join([f"- {item['file']}: {item['library']}" for item in remaining_forbidden]) if remaining_forbidden else "No forbidden libraries found."
        
    system_prompt = """
    You are a React code fixer. Fix the specific errors listed while maintaining the original functionality and style.
    Please use necessary tools to fix all the issues mentioned by user. Return the following JSON object to indicate finished:
    {"finished": true}
    """
    
    user_prompt = f"""
    Please fix the following issues in the React code:

VALIDATION ISSUES:
{issues_summary}

FORBIDDEN LIBRARIES (to be removed):
{forbidden_summary}
    """
    
    # Call LLM
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        _ = get_complete_llm_response_with_mcp_v2(messages, model, client, generated_files, max_attempts=max_attempts, max_tokens=8192)
        
        # No need for checking the response content, just return the original files
        logger.info(f"[Code Fixer Agent] Successfully applied fixes to project")
        return generated_files
        
    except Exception as e:
        logger.error(f"[Code Fixer Agent] ERROR: Failed to fix code issues: {e}")
        return generated_files
    
    

def fix_code_issues(generated_files: Dict[str, str], issues: List[str], forbidden_libraries: List[Dict], allowed_libraries: List[str], component_manifest: Dict, file_tree: List[str] = None) -> Dict[str, str]:
    """
    Fix code issues based on validation results and dependency problems.
    Returns updated generated_files dict with fixes applied.
    """
    # Filter out non-string issues for defensive programming
    string_issues = [issue for issue in issues if isinstance(issue, str)]
    if len(string_issues) != len(issues):
        logger.warning(f"[Code Fixer Agent] Filtered out {len(issues) - len(string_issues)} non-string issues")
    
    logger.info(f"[Code Fixer Agent] Fixing {len(string_issues)} validation issues and {len(forbidden_libraries)} dependency issues...")
    
    # Check if we have TypeScript errors to process in parallel
    ts_issues = [issue for issue in string_issues if issue.startswith("TypeScript:")]
    if ts_issues:
        return fix_code_issues_parallel(generated_files, string_issues, forbidden_libraries, allowed_libraries, component_manifest, file_tree)
    
    # Process forbidden libraries first - try to install them
    remaining_forbidden, updated_allowed = process_forbidden_libraries(forbidden_libraries, allowed_libraries)
    
    # Load LLM credentials from .env
    load_dotenv()
    api_key = os.getenv("LLM_KEY")
    model = os.getenv("MODEL_NAME")
    base_url = os.getenv("LLM_BASE_URL")
    
    if not api_key:
        logger.error("[Code Fixer Agent] ERROR: LLM_KEY not found in .env")
        return generated_files
    
    # Create OpenAI client
    if base_url:
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
    else:
        client = openai.OpenAI(api_key=api_key)
    
    # Prepare issues summary
    issues_summary = "\n".join([f"- {issue}" for issue in string_issues]) if string_issues else "No validation issues found."
    
    # Prepare forbidden libraries summary (only remaining ones)
    forbidden_summary = "\n".join([f"- {item['file']}: {item['library']}" for item in remaining_forbidden]) if remaining_forbidden else "No forbidden libraries found."
    
    # System prompt for code fixing
    system_prompt = """You are an expert React code fixer specializing in modern, well-styled components. Your job is to fix code issues based on validation results and dependency problems.

Your task:
1. Fix ESLint and TypeScript errors
2. Replace forbidden library imports with allowed alternatives
3. Ensure code follows React best practices
4. Maintain functionality while fixing issues
5. Preserve and enhance CSS styling
6. If a component's prop/param is an array type or a custom object type, always attach a mock data value as the default value for that prop/param.

CRITICAL RESTRICTIONS:
- NEVER replace existing components with placeholder content
- NEVER replace component implementations with simple placeholder divs or text
- NEVER remove functional component logic and replace with basic placeholders
- ALWAYS preserve the original component's functionality and UI structure
- If a component has errors, fix the issues but keep the component's actual implementation
- Only make minimal changes necessary to resolve the specific errors

EXPORT/IMPORT REQUIREMENTS:
- All exports must be named exports (e.g., `export const MyComponent = ...`).
- Do NOT use `export default` or default imports.
- Only use `import {{ MyComponent }} from ...` syntax for imports.

Available libraries: {allowed_libraries}

WORKFLOW - ITERATIVE FIXING (MANDATORY):
1. ALL NECESSARY FILE CONTENT IS ALREADY PROVIDED IN THE USER MESSAGE - DO NOT USE READ TOOL if not necessary
2. Start fixing immediately using the provided file content
3. Write ONE small fix at a time using the write tool  
4. Use check tool to validate each fix
5. If check passes, move to next issue. If check fails, fix and check again
6. NEVER return a final JSON format - always use tools to apply fixes

RULES:
- DO NOT USE READ TOOL if not necessary - all file content is already provided above
- Fix issues ONE AT A TIME using write tool
- Always use check tool after each write
- Work iteratively until all issues are resolved
- Use tools to apply every single change
- When finished, return {{"finished": true}}
- NEVER replace components with placeholder content

You MUST use write and check tools for every fix. Only return {{"finished": true}} when completely done.

CSS STYLING REQUIREMENTS:
- Maintain and improve all existing CSS styles in components
- Ensure every component has modern, clean CSS styling
- Use CSS modules, styled-components, or inline styles with proper CSS-in-JS
- Implement modern design principles: clean lines, proper spacing, subtle shadows, smooth transitions
- Use a consistent color palette with primary, secondary, and accent colors
- Include hover states, focus states, and interactive animations
- Ensure responsive design with mobile-first approach
- Use modern CSS features: CSS Grid, Flexbox, CSS Custom Properties, transitions
- Apply proper typography with readable fonts and appropriate font sizes
- Include subtle animations and micro-interactions where appropriate
- Use modern spacing units (rem, em) and consistent spacing scale
- Implement proper border-radius, shadows, and visual depth

Common fixes:
- Replace forbidden imports with allowed alternatives
- Fix TypeScript type errors
- Fix ESLint warnings (unused variables, missing dependencies, etc.)
- Fix import/export issues
- Fix React hook usage issues
- Fix prop type mismatches
- Preserve and enhance CSS styling during fixes

Be conservative - only fix what's clearly wrong. Don't change working code unnecessarily. Always preserve existing styling.

EXAMPLE WORKFLOW:
1. {{"response": "tool_call", "tool": "write", "path": "src/App.tsx", "content": "fixed content"}}
2. {{"response": "tool_call", "tool": "check", "path": "src/App.tsx"}}
3. Repeat for next error

When ALL errors are fixed, return: {{"finished": true}}

REMEMBER: NEVER return {{"finished": true}} format unless it's finished. Always use tools."""

    # User prompt with context
    user_prompt = f"""Please fix the following issues in the React code:

VALIDATION ISSUES:
{issues_summary}

FORBIDDEN LIBRARIES (to be removed):
{forbidden_summary}

COMPONENT MANIFEST:
{json.dumps(component_manifest, indent=2)}
""",
    # f"""GENERATED FILES:
# {chr(10).join([f"// {path}\n{content}" for path, content in generated_files.items()])}
# """,
    """
Fix the issues and return the corrected files as a JSON object."""

    # Call LLM
    messages = [
        {"role": "system", "content": system_prompt.format(allowed_libraries=updated_allowed)},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        # The MCP function now returns JSON with file updates from tool operations
        response_content = get_complete_llm_response_with_mcp(messages, model, client, generated_files, max_attempts=5, max_tokens=8192)
        
        # Parse the response to get the updated files
        try:
            updated_files_from_tools = json.loads(response_content)
        except Exception as json_error:
            logger.error(f"[Code Fixer Agent] ERROR: Failed to parse response from MCP: {json_error}")
            logger.error(f"[Code Fixer Agent] Raw response: {response_content[:500]}...")
            return generated_files
        
        if not isinstance(updated_files_from_tools, dict):
            logger.error(f"[Code Fixer Agent] ERROR: MCP did not return file updates: {type(updated_files_from_tools)}")
            logger.error(f"[Code Fixer Agent] Response content: {str(updated_files_from_tools)[:200]}...")
            return generated_files
        
        # Merge tool-updated files with original files (support add, overwrite, delete)
        updated_files = generated_files.copy()
        files_modified = 0
        for file_path, fixed_content in updated_files_from_tools.items():
            if file_path == "finished":
                continue
            # Deletion when content is exactly empty string
            if isinstance(fixed_content, str) and fixed_content == "":
                if file_path in updated_files:
                    del updated_files[file_path]
                    files_modified += 1
                    logger.info(f"[Code Fixer Agent] Deleted {file_path} through tools")
                continue

            if isinstance(fixed_content, str):
                if fixed_content.strip():
                    updated_files[file_path] = fixed_content
                    logger.info(f"[Code Fixer Agent] Fixed {file_path} through tools")
                    files_modified += 1
            else:
                logger.warning(f"[Code Fixer Agent] Fixed content for {file_path} is not a string: {type(fixed_content)}, converting")
                content_str = str(fixed_content)
                if content_str.strip():
                    updated_files[file_path] = content_str
                    logger.info(f"[Code Fixer Agent] Fixed {file_path} through tools (converted from {type(fixed_content)})")
                    files_modified += 1
        
        logger.info(f"[Code Fixer Agent] Successfully applied fixes to {files_modified} files through iterative tool usage")
        return updated_files
        
    except Exception as e:
        logger.error(f"[Code Fixer Agent] ERROR: Failed to fix code issues: {e}")
        return generated_files


def fix_specific_issues(generated_files: Dict[str, str], issue_type: str, issue_details: List[str], allowed_libraries: List[str]) -> Dict[str, str]:
    """
    Fix specific types of issues (validation, dependencies, etc.)
    """
    logger.info(f"[Code Fixer Agent] Fixing {issue_type} issues: {len(issue_details)} problems")
    
    # Load LLM credentials from .env
    load_dotenv()
    api_key = os.getenv("LLM_KEY")
    model = os.getenv("MODEL_NAME")
    base_url = os.getenv("LLM_BASE_URL")
    
    if not api_key:
        logger.error("[Code Fixer Agent] ERROR: LLM_KEY not found in .env")
        return generated_files
    
    # Create OpenAI client
    if base_url:
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
    else:
        client = openai.OpenAI(api_key=api_key)
    
    # Create specific prompts based on issue type
    if issue_type == "dependencies":
        # For dependency issues, only include files that import forbidden libraries
        files_with_forbidden_imports = {}
        
        # Extract forbidden library names from issue details
        forbidden_libraries = set()
        for detail in issue_details:
            # Parse "file: library" format
            if ':' in detail:
                library_name = detail.split(':')[-1].strip()
                forbidden_libraries.add(library_name)
        
        # Find files that import forbidden libraries
        for file_path, content in generated_files.items():
            for forbidden_lib in forbidden_libraries:
                # Check if the file imports the forbidden library
                import_pattern = rf'import.*from\s+[\'"]{re.escape(forbidden_lib)}[\'"]'
                if re.search(import_pattern, content):
                    files_with_forbidden_imports[file_path] = content
                    break
        
        if not files_with_forbidden_imports:
            logger.info(f"[Code Fixer Agent] No files found with forbidden imports: {forbidden_libraries}")
            return generated_files
        
        logger.info(f"[Code Fixer Agent] Found {len(files_with_forbidden_imports)} files with forbidden imports")
        
        system_prompt = f"""You are fixing forbidden library imports. Replace them with allowed alternatives or remove them entirely.

Allowed libraries: {allowed_libraries}

IMPORTANT: If a forbidden library cannot be replaced with an allowed alternative, remove the import and any usage of that library.

CRITICAL: You MUST output ONLY a valid JSON object with file paths as keys and fixed file content as values.
The JSON must be properly formatted and valid. Do NOT include any explanations, markdown, code blocks, or other text outside the JSON.
If you output anything other than a valid JSON object, your answer will be discarded and the original files will be used.

Return only the files that need changes, with forbidden imports replaced by allowed alternatives or removed entirely.

EXAMPLE OUTPUT FORMAT:
{{
  "src/components/MyComponent.tsx": "import React from 'react';\nimport {{ Button }} from 'antd';\n\nexport const MyComponent = () => {{\n  return <Button>Fixed content</Button>;\n}};",
  "src/utils/helper.ts": "export const helper = () => {{\n  return 'fixed';\n}};"
}}

DO NOT include any text before or after the JSON object. Only the JSON object itself."""
        
        user_prompt = f"""Fix these forbidden library imports:

Issues:
{chr(10).join([f"- {detail}" for detail in issue_details])}

Files with forbidden imports:
{chr(10).join([f"// {path}\n{content}" for path, content in files_with_forbidden_imports.items()])}

Replace forbidden imports with allowed alternatives or remove them entirely and return the fixed files as a JSON object."""
    
    elif issue_type == "validation":
        system_prompt = """You are fixing ESLint and TypeScript validation errors. Fix the issues while maintaining functionality.

CRITICAL: You MUST output ONLY a valid JSON object with file paths as keys and fixed file content as values.
The JSON must be properly formatted and valid. Do NOT include any explanations, markdown, code blocks, or other text outside the JSON.
If you output anything other than a valid JSON object, your answer will be discarded and the original files will be used.

Return only the files that need changes.

EXAMPLE OUTPUT FORMAT:
{{
  "src/components/MyComponent.tsx": "import React from 'react';\n\nexport const MyComponent = () => {{\n  return <div>Fixed content</div>;\n}};",
  "src/utils/helper.ts": "export const helper = () => {{\n  return 'fixed';\n}};"
}}

DO NOT include any text before or after the JSON object. Only the JSON object itself."""
        
        user_prompt = f"""Fix these validation errors:

Issues:
{chr(10).join([f"- {detail}" for detail in issue_details])}

Files:
{chr(10).join([f"// {path}\n{content}" for path, content in generated_files.items()])}

Fix the validation errors and return the corrected files as a JSON object."""
    
    else:
        return generated_files
    
    # Call LLM
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        response_content = get_complete_llm_response(messages, model, client, max_attempts=3, max_tokens=4096)
        
        # Try to extract JSON from the response
        try:
            fixed_files = extract_json_from_llm_output(response_content)
        except Exception as json_error:
            logger.error(f"[Code Fixer Agent] ERROR: Failed to parse JSON response for {issue_type} fixes: {json_error}")
            logger.error(f"[Code Fixer Agent] Raw response: {response_content[:500]}...")
            return generated_files
        
        if not isinstance(fixed_files, dict):
            logger.error(f"[Code Fixer Agent] ERROR: LLM returned invalid format for {issue_type} fixes: {type(fixed_files)}")
            logger.error(f"[Code Fixer Agent] Response content: {str(fixed_files)[:200]}...")
            return generated_files
        
        # Merge fixed files with original files
        updated_files = generated_files.copy()
        for file_path, fixed_content in fixed_files.items():
            if file_path in updated_files:
                updated_files[file_path] = fixed_content
                logger.info(f"[Code Fixer Agent] Fixed {issue_type} issue in {file_path}")
        
        logger.info(f"[Code Fixer Agent] Successfully applied {issue_type} fixes to {len(fixed_files)} files")
        return updated_files
        
    except Exception as e:
        logger.error(f"[Code Fixer Agent] ERROR: Failed to fix {issue_type} issues: {e}")
        return generated_files 
