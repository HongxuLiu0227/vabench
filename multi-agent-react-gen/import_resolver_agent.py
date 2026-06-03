import os
import re
import json
from typing import Dict, List, Tuple, Any, Set
from dotenv import load_dotenv
import openai
from llm_output_utils import extract_json_from_llm_output, get_complete_llm_response
from logging_config import get_logger

logger = get_logger(__name__)


def scan_project_files(project_dir: str) -> Dict[str, Any]:
    """
    Scan the project directory and return information about all files.
    Returns: {
        "files": {"file_path": "file_content"},
        "file_map": {"filename": ["full_paths"]},
        "component_map": {"ComponentName": "file_path"}
    }
    """
    files = {}
    file_map = {}
    component_map = {}
    
    # Scan src directory for all files
    src_dir = os.path.join(project_dir, "src")
    if not os.path.exists(src_dir):
        return {"files": {}, "file_map": {}, "component_map": {}}
    
    for root, dirs, filenames in os.walk(src_dir):
        # Skip node_modules and dist
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git']]
        
        for filename in filenames:
            if filename.endswith(('.tsx', '.ts', '.jsx', '.js')):
                full_path = os.path.join(root, filename)
                rel_path = os.path.relpath(full_path, project_dir)
                
                # Read file content
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    files[rel_path] = content
                    
                    # Map filename to full path
                    base_name = os.path.splitext(filename)[0]
                    if base_name not in file_map:
                        file_map[base_name] = []
                    file_map[base_name].append(rel_path)
                    
                    # Extract component names from exports
                    component_names = extract_component_names(content)
                    for comp_name in component_names:
                        component_map[comp_name] = rel_path
                        
                except Exception as e:
                    logger.warning(f"[Import Resolver] Warning: Could not read {full_path}: {e}")
    
    return {
        "files": files,
        "file_map": file_map,
        "component_map": component_map
    }


def extract_component_names(content: str) -> List[str]:
    """
    Extract component names from file content (exports).
    """
    component_names = []
    
    # Pattern for named exports
    named_export_patterns = [
        r'export\s+(?:const|function|class)\s+(\w+)',
        r'export\s+{\s*([^}]+)\s*}',
        r'export\s+default\s+(?:function\s+)?(\w+)',
        r'export\s+default\s+(\w+)'
    ]
    
    for pattern in named_export_patterns:
        matches = re.finditer(pattern, content, re.MULTILINE)
        for match in matches:
            if '{' in match.group(1):  # Handle export { A, B, C }
                exports = re.findall(r'\b(\w+)\b', match.group(1))
                component_names.extend(exports)
            else:
                component_names.append(match.group(1))
    
    # Filter out common non-component exports
    non_components = {'default', 'type', 'interface', 'enum', 'const', 'let', 'var'}
    component_names = [name for name in component_names if name not in non_components and name[0].isupper()]
    
    return list(set(component_names))  # Remove duplicates


def extract_imports(content: str) -> List[Dict[str, str]]:
    """
    Extract import statements from file content.
    Returns list of {import_statement, import_path, imported_items}
    """
    imports = []
    
    # Pattern for import statements
    import_patterns = [
        r'import\s+([^\'\"]+)\s+from\s+[\'\"](.*?)[\'\"]\s*;?',
        r'import\s+[\'\"](.*?)[\'\"]\s*;?'
    ]
    
    for pattern in import_patterns:
        matches = re.finditer(pattern, content, re.MULTILINE)
        for match in matches:
            if len(match.groups()) == 2:
                imported_items = match.group(1).strip()
                import_path = match.group(2).strip()
            else:
                imported_items = ""
                import_path = match.group(1).strip()
            
            imports.append({
                "import_statement": match.group(0),
                "import_path": import_path,
                "imported_items": imported_items
            })
    
    return imports


def find_correct_import_path(import_path: str, current_file: str, project_scan: Dict[str, Any]) -> Tuple[str, bool]:
    """
    Find the correct import path for a given import.
    Returns: (corrected_path, needs_correction)
    """
    # Skip external packages (don't start with . or /)
    if not import_path.startswith('.'):
        return import_path, False
    
    # Convert to absolute path for resolution
    current_dir = os.path.dirname(current_file)
    if import_path.startswith('./'):
        target_path = os.path.join(current_dir, import_path[2:])
    elif import_path.startswith('../'):
        # Handle relative paths with ../
        parts = import_path.split('/')
        target_dir = current_dir
        for part in parts:
            if part == '..':
                target_dir = os.path.dirname(target_dir)
            elif part and part != '.':
                target_dir = os.path.join(target_dir, part)
        target_path = target_dir
    else:
        target_path = os.path.join(current_dir, import_path)
    
    # Normalize path
    target_path = os.path.normpath(target_path)
    
    # Check if the exact file exists
    possible_extensions = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js']
    
    for ext in possible_extensions:
        full_target = target_path + ext
        rel_target = os.path.relpath(full_target, '.')
        
        if rel_target in project_scan["files"]:
            # Calculate the correct relative path
            correct_path = os.path.relpath(full_target, os.path.dirname(current_file))
            if correct_path.startswith('../') or not correct_path.startswith('.'):
                correct_path = './' + correct_path if not correct_path.startswith('../') else correct_path
            
            # Remove file extension for import
            if correct_path.endswith(('.tsx', '.ts', '.jsx', '.js')):
                correct_path = os.path.splitext(correct_path)[0]
            
            return correct_path, correct_path != import_path
    
    # Try to find by filename or component name
    import_name = os.path.basename(import_path)
    
    # Look in file_map
    if import_name in project_scan["file_map"]:
        possible_files = project_scan["file_map"][import_name]
        if possible_files:
            target_file = possible_files[0]  # Take the first match
            correct_path = os.path.relpath(target_file, os.path.dirname(current_file))
            if correct_path.startswith('../') or not correct_path.startswith('.'):
                correct_path = './' + correct_path if not correct_path.startswith('../') else correct_path
            
            # Remove file extension
            if correct_path.endswith(('.tsx', '.ts', '.jsx', '.js')):
                correct_path = os.path.splitext(correct_path)[0]
            
            return correct_path, True
    
    # Look in component_map
    if import_name in project_scan["component_map"]:
        target_file = project_scan["component_map"][import_name]
        correct_path = os.path.relpath(target_file, os.path.dirname(current_file))
        if correct_path.startswith('../') or not correct_path.startswith('.'):
            correct_path = './' + correct_path if not correct_path.startswith('../') else correct_path
        
        # Remove file extension
        if correct_path.endswith(('.tsx', '.ts', '.jsx', '.js')):
            correct_path = os.path.splitext(correct_path)[0]
        
        return correct_path, True
    
    # If nothing found, return original
    return import_path, False


def fix_imports_in_file(file_path: str, file_content: str, project_scan: Dict[str, Any]) -> Tuple[str, bool]:
    """
    Fix all import statements in a single file.
    Returns: (fixed_content, was_changed)
    """
    imports = extract_imports(file_content)
    if not imports:
        return file_content, False
    
    fixed_content = file_content
    was_changed = False
    
    for import_info in imports:
        import_path = import_info["import_path"]
        correct_path, needs_correction = find_correct_import_path(import_path, file_path, project_scan)
        
        if needs_correction:
            old_statement = import_info["import_statement"]
            new_statement = old_statement.replace(f'"{import_path}"', f'"{correct_path}"').replace(f"'{import_path}'", f"'{correct_path}'")
            
            fixed_content = fixed_content.replace(old_statement, new_statement)
            was_changed = True
            
            logger.info(f"[Import Resolver] Fixed import in {file_path}: {import_path} -> {correct_path}")
    
    return fixed_content, was_changed


def resolve_all_imports(generated_files: Dict[str, str], project_dir: str) -> Dict[str, str]:
    """
    Resolve all import issues in generated files.
    """
    logger.info("[Import Resolver Agent] Scanning project files...")
    project_scan = scan_project_files(project_dir)
    
    # Add generated files to the scan (they might not be written to disk yet)
    for file_path, content in generated_files.items():
        project_scan["files"][file_path] = content
        
        # Update file_map and component_map
        filename = os.path.splitext(os.path.basename(file_path))[0]
        if filename not in project_scan["file_map"]:
            project_scan["file_map"][filename] = []
        if file_path not in project_scan["file_map"][filename]:
            project_scan["file_map"][filename].append(file_path)
        
        # Extract component names
        component_names = extract_component_names(content)
        for comp_name in component_names:
            project_scan["component_map"][comp_name] = file_path
    
    logger.info(f"[Import Resolver Agent] Found {len(project_scan['files'])} files, {len(project_scan['component_map'])} components")
    
    # Fix imports in all generated files
    fixed_files = {}
    total_fixes = 0
    
    for file_path, content in generated_files.items():
        fixed_content, was_changed = fix_imports_in_file(file_path, content, project_scan)
        fixed_files[file_path] = fixed_content
        
        if was_changed:
            total_fixes += 1
    
    logger.info(f"[Import Resolver Agent] Fixed imports in {total_fixes} files")
    return fixed_files


def create_missing_files(generated_files: Dict[str, str], project_dir: str) -> Dict[str, str]:
    """
    Create missing files that are imported but don't exist.
    """
    logger.info("[Import Resolver Agent] Checking for missing imported files...")
    
    project_scan = scan_project_files(project_dir)
    missing_files = set()
    
    # Add generated files to scan
    for file_path, content in generated_files.items():
        project_scan["files"][file_path] = content
    
    # Check all imports in generated files
    for file_path, content in generated_files.items():
        imports = extract_imports(content)
        
        for import_info in imports:
            import_path = import_info["import_path"]
            
            # Skip external packages
            if not import_path.startswith('.'):
                continue
            
            # Check if the imported file exists
            correct_path, needs_correction = find_correct_import_path(import_path, file_path, project_scan)
            
            if needs_correction:
                continue  # Can be fixed by import resolution
            
            # Check if the file actually exists
            current_dir = os.path.dirname(file_path)
            if import_path.startswith('./'):
                target_path = os.path.join(current_dir, import_path[2:])
            elif import_path.startswith('../'):
                parts = import_path.split('/')
                target_dir = current_dir
                for part in parts:
                    if part == '..':
                        target_dir = os.path.dirname(target_dir)
                    elif part and part != '.':
                        target_dir = os.path.join(target_dir, part)
                target_path = target_dir
            else:
                target_path = os.path.join(current_dir, import_path)
            
            target_path = os.path.normpath(target_path)
            
            # Check with extensions
            possible_files = [
                target_path + '.tsx',
                target_path + '.ts',
                target_path + '.jsx',
                target_path + '.js',
                os.path.join(target_path, 'index.tsx'),
                os.path.join(target_path, 'index.ts'),
                os.path.join(target_path, 'index.jsx'),
                os.path.join(target_path, 'index.js')
            ]
            
            file_exists = False
            for possible_file in possible_files:
                rel_file = os.path.relpath(possible_file, '.')
                if rel_file in project_scan["files"]:
                    file_exists = True
                    break
            
            if not file_exists:
                # Determine the best file to create
                if os.path.basename(target_path).endswith(('.tsx', '.ts', '.jsx', '.js')):
                    missing_file = target_path
                else:
                    missing_file = target_path + '.tsx'
                
                missing_files.add(os.path.relpath(missing_file, '.'))
    
    if missing_files:
        logger.info(f"[Import Resolver Agent] Creating {len(missing_files)} missing files...")
        new_files = generate_missing_files(list(missing_files), generated_files)
        generated_files.update(new_files)
    
    return generated_files


def generate_missing_files(missing_file_paths: List[str], generated_files: Dict[str, str]) -> Dict[str, str]:
    """
    Generate content for missing files using LLM.
    """
    # Load LLM credentials
    load_dotenv()
    api_key = os.getenv("LLM_KEY")
    model = os.getenv("MODEL_NAME")
    base_url = os.getenv("LLM_BASE_URL")
    
    if not api_key:
        logger.error("[Import Resolver Agent] ERROR: LLM_KEY not found in .env")
        return {}
    
    # Create OpenAI client
    if base_url:
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
    else:
        client = openai.OpenAI(api_key=api_key)
    
    # System prompt for generating missing files
    system_prompt = """You are a React developer creating missing files that are imported but don't exist. 

Your job:
1. Create minimal, functional components/modules for missing files
2. Ensure the exports match what's being imported
3. Use TypeScript with proper types
4. Follow React best practices
5. Create realistic placeholder content
6. Include modern, clean CSS styling
7. If a component's prop/param is an array type or a custom object type, always attach a mock data value as the default value for that prop/param.

CSS STYLING REQUIREMENTS:
- EVERY component MUST include modern, clean CSS styles
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

EXPORT/IMPORT REQUIREMENTS:
- All exports must be named exports (e.g., `export const MyComponent = ...`).
- Do NOT use `export default` or default imports.
- Only use `import { MyComponent } from ...` syntax for imports.

Return a JSON object where keys are file paths and values are the file contents.

Example output:
{
  "src/components/Button.tsx": "import React from 'react';\n\ninterface ButtonProps {\n  children: React.ReactNode;\n  onClick?: () => void;\n  variant?: 'primary' | 'secondary';\n}\n\nconst buttonStyles = {\n  padding: '0.75rem 1.5rem',\n  borderRadius: '0.5rem',\n  border: 'none',\n  fontSize: '1rem',\n  fontWeight: '500',\n  cursor: 'pointer',\n  transition: 'all 0.2s ease-in-out',\n  backgroundColor: 'var(--primary-color, #3b82f6)',\n  color: 'white',\n  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',\n};\n\nconst hoverStyles = {\n  transform: 'translateY(-1px)',\n  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',\n};\n\nexport const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary' }) => {\n  return (\n    <button \n      onClick={onClick}\n      style={buttonStyles}\n      onMouseEnter={(e) => {\n        Object.assign(e.currentTarget.style, hoverStyles);\n      }}\n      onMouseLeave={(e) => {\n        e.currentTarget.style.transform = '';\n        e.currentTarget.style.boxShadow = buttonStyles.boxShadow;\n      }}\n    >\n      {children}\n    </button>\n  );\n};"
}"""

    # User prompt with context
    user_prompt = f"""Create missing files that are imported but don't exist:

MISSING FILES:
{chr(10).join([f"- {path}" for path in missing_file_paths])}

EXISTING FILES FOR CONTEXT:
{chr(10).join([f"// {path}" for path in list(generated_files.keys())[:5]])}

Create minimal, functional content for each missing file. Make sure exports match what would typically be imported."""

    # Call LLM
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        response_content = get_complete_llm_response(messages, model, client, max_attempts=3, max_tokens=4096)
        new_files = extract_json_from_llm_output(response_content)
        
        if not isinstance(new_files, dict):
            logger.error("[Import Resolver Agent] ERROR: LLM returned invalid format for missing files")
            return {}
        
        logger.info(f"[Import Resolver Agent] Generated {len(new_files)} missing files")
        return new_files
        
    except Exception as e:
        logger.error(f"[Import Resolver Agent] ERROR: Failed to generate missing files: {e}")
        return {}


def fix_common_structural_issues(generated_files: Dict[str, str]) -> Dict[str, str]:
    """
    Fix common structural issues in generated files before running full import resolution.
    """
    fixed_files = generated_files.copy()
    
    # Fix main.tsx import paths
    main_tsx_path = "src/main.tsx"
    if main_tsx_path in fixed_files:
        content = fixed_files[main_tsx_path]
        
        # Fix import path for App component
        # Look for common wrong import patterns and fix them
        if "from './layouts/App'" in content and "src/App.tsx" in fixed_files:
            content = content.replace("from './layouts/App'", "from './App'")
            logger.info("[Import Resolver] Fixed main.tsx App import path from ./layouts/App to ./App")
        
        # Ensure BrowserRouter is imported if used
        if "BrowserRouter>" in content and "BrowserRouter" not in content:
            # Add BrowserRouter import at the top
            lines = content.split('\n')
            import_added = False
            for i, line in enumerate(lines):
                if line.startswith("import") and "react-router-dom" in line:
                    # Add BrowserRouter to existing react-router-dom import
                    if "BrowserRouter" not in line:
                        line = line.replace("} from 'react-router-dom'", ", BrowserRouter } from 'react-router-dom'")
                    lines[i] = line
                    import_added = True
                    break
                elif line.startswith("import") and i == len([l for l in lines[:i+5] if l.startswith("import")]) - 1:
                    # Add new import after last import
                    lines.insert(i + 1, "import { BrowserRouter } from 'react-router-dom';")
                    import_added = True
                    break
            
            if not import_added and not any("react-router-dom" in line for line in lines):
                # Add BrowserRouter import at the beginning
                first_import_idx = next((i for i, line in enumerate(lines) if line.startswith("import")), 0)
                lines.insert(first_import_idx, "import { BrowserRouter } from 'react-router-dom';")
                logger.info("[Import Resolver] Added missing BrowserRouter import to main.tsx")
            
            # Update content with modified lines
            content = '\n'.join(lines)
        
        fixed_files[main_tsx_path] = content
    
    return fixed_files

def resolve_imports_and_files(generated_files: Dict[str, str], project_dir: str) -> Dict[str, str]:
    """
    Main function to resolve import issues and create missing files.
    """
    logger.info("[Import Resolver Agent] Resolving import relationships...")
    
    # First, fix common structural issues
    fixed_files = fix_common_structural_issues(generated_files)
    
    # Then, try to fix import paths
    fixed_files = resolve_all_imports(fixed_files, project_dir)
    
    # Then, create any still-missing files
    complete_files = create_missing_files(fixed_files, project_dir)
    
    # Run import resolution again after creating missing files
    final_files = resolve_all_imports(complete_files, project_dir)
    
    return final_files 