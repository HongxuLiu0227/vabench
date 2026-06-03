# code_validation_agent.py

import os
import subprocess
import tempfile
import shutil
import re
import json
from logging_config import get_logger

logger = get_logger(__name__)

def check_structural_issues(generated_files):
    """
    Check for common structural issues in generated files.
    Returns a list of issues as strings.
    """
    issues = []
    
    # Check main.tsx import paths
    main_tsx_path = "src/main.tsx"
    if main_tsx_path in generated_files:
        content = generated_files[main_tsx_path]
        
        # Check for wrong App import paths
        if "from './layouts/App'" in content and "src/App.tsx" in generated_files:
            issues.append(f"Structural: {main_tsx_path}: main.tsx imports App from wrong path './layouts/App', should be './App'")
        
        # Check for missing BrowserRouter import when used
        if "<BrowserRouter" in content and "BrowserRouter" not in [
            line for line in content.split('\n') if line.strip().startswith('import') and 'BrowserRouter' in line
        ]:
            issues.append(f"Structural: {main_tsx_path}: BrowserRouter is used but not imported from react-router-dom")
    
    # Check for App.tsx existence when referenced in main.tsx
    if main_tsx_path in generated_files and "src/App.tsx" not in generated_files:
        content = generated_files[main_tsx_path]
        if "from './App'" in content:
            issues.append(f"Structural: {main_tsx_path}: main.tsx imports './App' but src/App.tsx does not exist")
    
    # Check for CSS-in-JS files with proper extensions
    for file_path in generated_files:
        if file_path.endswith('.css.tsx'):
            content = generated_files[file_path]
            # This is actually correct for CSS-in-JS, so no issue here
            # The .css.tsx extension is valid for styled-components, emotion, etc.
            pass
    
    return issues

def get_shared_project_packages():
    """
    Get the list of packages available in the shared project's node_modules.
    Returns a set of package names.
    """
    shared_project_path = os.path.join(os.path.dirname(__file__), "..", "shared-package")
    package_json_path = os.path.join(shared_project_path, "package.json")
    
    available_packages = set()
    
    # Get packages from package.json dependencies and devDependencies
    if os.path.exists(package_json_path):
        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                package_data = json.load(f)
            
            # Add dependencies
            if 'dependencies' in package_data:
                available_packages.update(package_data['dependencies'].keys())
            
            # Add devDependencies
            if 'devDependencies' in package_data:
                available_packages.update(package_data['devDependencies'].keys())
                
        except Exception as e:
            logger.error(f"[Code Validation Agent] Error reading package.json: {e}")
    
    # Also check node_modules directory for installed packages
    node_modules_path = os.path.join(shared_project_path, "node_modules")
    if os.path.exists(node_modules_path):
        try:
            for item in os.listdir(node_modules_path):
                if not item.startswith('.'):  # Skip hidden files
                    available_packages.add(item)
        except Exception as e:
            logger.error(f"[Code Validation Agent] Error reading node_modules: {e}")
    
    return available_packages


def check_forbidden_packages(generated_files):
    """
    Check for forbidden packages by analyzing imports against shared project's available packages.
    Returns a list of forbidden package items.
    """
    available_packages = get_shared_project_packages()
    forbidden_packages = []
    
    # Common packages that should be available
    common_packages = {
        'react', 'react-dom', 'typescript', '@types/react', '@types/react-dom',
        'vite', '@vitejs/plugin-react', 'eslint', '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser', 'prettier', 'tailwindcss', 'autoprefixer',
        'postcss', 'css-loader', 'style-loader', 'file-loader', 'url-loader'
    }
    
    # Add common packages to available packages
    available_packages.update(common_packages)
    
    logger.info(f"[Code Validation Agent] Available packages: {len(available_packages)}")
    
    # Import patterns to check
    import_patterns = [
        r'import\s+.*\s+from\s+[\'"]([^\'"]+)[\'"]',  # ES6 imports
        r'require\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)',   # CommonJS requires
    ]
    
    for file_path, content in generated_files.items():
        if not file_path.endswith(('.ts', '.tsx', '.js', '.jsx')):
            continue
            
        for pattern in import_patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                # Skip relative imports and built-in modules
                if match.startswith('.') or match.startswith('/'):
                    continue
                
                # Extract package name
                if match.startswith('@'):
                    # Scoped packages like @foo/bar
                    parts = match.split('/')
                    if len(parts) >= 2:
                        package_name = f"{parts[0]}/{parts[1]}"
                    else:
                        # Invalid scoped package (e.g., just "@foo" without second part)
                        # These are likely internal aliases, not real npm packages
                        continue
                else:
                    # Regular packages
                    package_name = match.split('/')[0]
                
                # Skip invalid internal aliases that look like scoped packages but aren't
                if package_name.startswith('@') and '/' in package_name:
                    scope, name = package_name.split('/', 1)
                    # Common internal aliases that shouldn't be treated as npm packages
                    internal_aliases = {'features', 'hooks', 'routes', 'pages', 'layouts', 'styles', 'components', 'utils', 'services', 'types', 'constants', 'api', 'store', 'contexts'}
                    if scope == '@':
                        continue
                    if name in internal_aliases:
                        continue
                
                # Check if package is not available
                if package_name not in available_packages:
                    forbidden_packages.append({
                        'file': file_path,
                        'library': package_name,
                        'import': match
                    })
    
    # Remove duplicates based on library name and file
    unique_forbidden = []
    seen = set()
    for item in forbidden_packages:
        key = (item['file'], item['library'])
        if key not in seen:
            seen.add(key)
            unique_forbidden.append(item)
    
    return unique_forbidden


def validate_code(project_dir, generated_files):
    """
    Run static analysis (ESLint, TypeScript) on the generated code.
    Returns a list of issues (if any).
    """
    issues = []
    
    # First, check for structural issues
    # structural_issues = check_structural_issues(generated_files)
    # issues.extend(structural_issues)
    # logger.info(f"[Code Validation Agent] Found {len(structural_issues)} structural issues")
    
    # Write generated files to a temp dir for validation
    temp_dir = tempfile.mkdtemp()
    try:
        # Check if we have any files to validate
        if not generated_files:
            logger.info("[Code Validation Agent] No files to validate")
            return issues
            
        logger.info(f"[Code Validation Agent] Validating {len(generated_files)} files...")
        
        for rel_path, content in generated_files.items():
            abs_path = os.path.join(temp_dir, rel_path)
            os.makedirs(os.path.dirname(abs_path), exist_ok=True)
            with open(abs_path, "w", encoding="utf-8") as f:
                f.write(content)
        
        # Write a minimal tsconfig.json to include all files
        tsconfig = {
            "compilerOptions": {
                "lib": ["ESNext", "DOM"],
                "strict": False,
                "jsx": "react-jsx",
                "noEmit": True,
                "skipLibCheck": True,
                "allowImportingTsExtensions": False,
                "noImplicitAny": False,
                "esModuleInterop": True,
                "moduleResolution": "node",
                "resolveJsonModule": True,
                "baseUrl": ".",
                "paths": {
                    "@/*": ["src/*"]
                },
                "target": "ES2020",
                "module": "ESNext",
                "allowSyntheticDefaultImports": True,
                "forceConsistentCasingInFileNames": False,
                "noImplicitReturns": False,
                "noUnusedLocals": False,
                "noUnusedParameters": False,
                "exactOptionalPropertyTypes": False,
                "noImplicitOverride": False,
                "noPropertyAccessFromIndexSignature": False,
                "noUncheckedIndexedAccess": False,
                "allowJs": True,
                "checkJs": False,
                "noEmitOnError": False,
            },
            "include": ["src/**/*.ts", "src/**/*.tsx", "**/*.ts", "**/*.tsx"],
            "exclude": ["node_modules/**/*"],
            "compileOnSave": False
        }
        with open(os.path.join(temp_dir, "tsconfig.json"), "w", encoding="utf-8") as f:
            import json
            json.dump(tsconfig, f, indent=2)
            
        # Try to symlink shared-package node_modules instead of copying to avoid timeout
        shared_node_modules = os.path.join(os.path.dirname(__file__), "..", "shared-package", "node_modules")
        temp_node_modules = os.path.join(temp_dir, "node_modules")
        
        try:
            if os.path.exists(shared_node_modules):
                os.symlink(shared_node_modules, temp_node_modules)
                logger.info("[Code Validation Agent] Symlinked shared node_modules")
            else:
                logger.warning("[Code Validation Agent] Shared node_modules not found")
        except Exception as e:
            logger.warning(f"[Code Validation Agent] Could not link node_modules: {e}")
        
        # Run tsc (TypeScript compiler) in temp dir with increased timeout
        # Use flags to be more permissive and continue on errors
        tsc_cmd = [
            os.path.join(os.path.dirname(__file__), "..", "shared-package", "node_modules", ".bin", "tsc"), 
            "--noEmit", 
            "--project", temp_dir,
            "--allowJs",
            "--maxNodeModuleJsDepth", "0",
            "--skipLibCheck"
        ]
        try:
            logger.info("[Code Validation Agent] Running TypeScript compiler...")
            result = subprocess.run(tsc_cmd, capture_output=True, text=True, timeout=60)
            if result.returncode != 0:
                tsc_output = result.stdout or result.stderr
                if tsc_output and tsc_output.strip():
                    issues.append(f"TypeScript: {tsc_output}")
        except subprocess.TimeoutExpired:
            issues.append("TypeScript: Command timed out after 60 seconds")
        except Exception as e:
            issues.append(f"TypeScript error: {e}")
            
    finally:
        shutil.rmtree(temp_dir)
    
    logger.info(f"[Code Validation Agent] Found {len(issues)} validation issues")
    return issues 

def check_typescript_errors_for_file(generated_files, file_path):
    """
    Run static analysis (ESLint, TypeScript) on the generated code.
    Returns a list of issues (if any).
    """
    issues = []
    
    # First, check for structural issues
    # structural_issues = check_structural_issues(generated_files)
    # issues.extend(structural_issues)
    # logger.info(f"[Code Validation Agent] Found {len(structural_issues)} structural issues")
    
    # Write generated files to a temp dir for validation
    temp_dir = tempfile.mkdtemp()
    try:
        # Check if we have any files to validate
        if not generated_files:
            logger.info("[Code Validation Agent] No files to validate")
            return issues
            
        logger.info(f"[Code Validation Agent] Validating {len(generated_files)} files...")
        
        for rel_path, content in generated_files.items():
            abs_path = os.path.join(temp_dir, rel_path)
            os.makedirs(os.path.dirname(abs_path), exist_ok=True)
            with open(abs_path, "w", encoding="utf-8") as f:
                f.write(content)
        
        # Write a minimal tsconfig.json to include all files
        tsconfig = {
            "compilerOptions": {
                "lib": ["ESNext", "DOM"],
                "strict": False,
                "jsx": "react-jsx",
                "noEmit": True,
                "skipLibCheck": True,
                "allowImportingTsExtensions": False,
                "noImplicitAny": False,
                "esModuleInterop": True,
                "moduleResolution": "node",
                "resolveJsonModule": True,
                "baseUrl": ".",
                "paths": {
                    "@/*": ["src/*"]
                },
                "target": "ES2020",
                "module": "ESNext",
                "allowSyntheticDefaultImports": True,
                "forceConsistentCasingInFileNames": False,
                "noImplicitReturns": False,
                "noUnusedLocals": False,
                "noUnusedParameters": False,
                "exactOptionalPropertyTypes": False,
                "noImplicitOverride": False,
                "noPropertyAccessFromIndexSignature": False,
                "noUncheckedIndexedAccess": False,
                "allowJs": True,
                "checkJs": False,
                "noEmitOnError": False,
                "useImportType": False,
            },
            "include": ["src/**/*.ts", "src/**/*.tsx", "**/*.ts", "**/*.tsx"],
            "exclude": ["node_modules/**/*"],
            "compileOnSave": False
        }
        with open(os.path.join(temp_dir, "tsconfig.json"), "w", encoding="utf-8") as f:
            import json
            json.dump(tsconfig, f, indent=2)
            
        # Try to symlink shared-package node_modules instead of copying to avoid timeout
        shared_node_modules = os.path.join(os.path.dirname(__file__), "..", "shared-package", "node_modules")
        temp_node_modules = os.path.join(temp_dir, "node_modules")
        
        try:
            if os.path.exists(shared_node_modules):
                os.symlink(shared_node_modules, temp_node_modules)
                logger.info("[Code Validation Agent] Symlinked shared node_modules")
            else:
                logger.warning("[Code Validation Agent] Shared node_modules not found")
        except Exception as e:
            logger.warning(f"[Code Validation Agent] Could not link node_modules: {e}")
        
        # Run tsc (TypeScript compiler) in temp dir with increased timeout
        # Use flags to be more permissive and continue on errors
        tsc_cmd = [
            os.path.join(os.path.dirname(__file__), "..", "shared-package", "node_modules", ".bin", "tsc"), 
            "--noEmit", 
            "--allowJs",
            "--maxNodeModuleJsDepth", "0",
            "--skipLibCheck",
            os.path.join(temp_dir, file_path)
        ]
        try:
            logger.info("[Code Validation Agent] Running TypeScript compiler...")
            result = subprocess.run(tsc_cmd, capture_output=True, text=True, timeout=60)
            if result.returncode != 0:
                tsc_output = result.stdout or result.stderr
                if tsc_output and tsc_output.strip():
                    issues.append(f"TypeScript: {tsc_output}")
        except subprocess.TimeoutExpired:
            issues.append("TypeScript: Command timed out after 60 seconds")
        except Exception as e:
            issues.append(f"TypeScript error: {e}")
            
    finally:
        shutil.rmtree(temp_dir)
    
    logger.info(f"[Code Validation Agent] Found {len(issues)} validation issues")
    return issues 