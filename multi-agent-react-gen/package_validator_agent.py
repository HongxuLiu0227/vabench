import os
import json
import requests
import subprocess
from typing import Dict, List, Tuple, Any
from dotenv import load_dotenv
import openai
from llm_output_utils import extract_json_from_llm_output, get_complete_llm_response
from logging_config import get_logger

logger = get_logger(__name__)


def check_package_exists(package_name: str, version: str = None) -> Tuple[bool, bool, str, str]:
    """
    Check if a package exists and is not deprecated using npm registry API.
    Returns: (exists, is_deprecated, latest_version, warning_message)
    """
    try:
        # Clean package name (remove scope prefix for API call if needed)
        clean_name = package_name.replace('@', '%40')
        url = f"https://registry.npmjs.org/{clean_name}"
        
        response = requests.get(url, timeout=10)
        if response.status_code == 404:
            return False, False, "", f"Package '{package_name}' does not exist"
        
        if response.status_code != 200:
            return False, False, "", f"Failed to check package '{package_name}' (HTTP {response.status_code})"
        
        data = response.json()
        
        # Check if package is deprecated
        latest_version = data.get('dist-tags', {}).get('latest', '')
        versions = data.get('versions', {})
        
        is_deprecated = False
        warning_message = ""
        
        # Check if the latest version is deprecated
        if latest_version and latest_version in versions:
            version_data = versions[latest_version]
            if version_data.get('deprecated'):
                is_deprecated = True
                warning_message = f"Package '{package_name}' is deprecated: {version_data.get('deprecated')}"
        
        # Check if the entire package is deprecated
        if data.get('deprecated'):
            is_deprecated = True
            warning_message = f"Package '{package_name}' is deprecated: {data.get('deprecated')}"
        
        return True, is_deprecated, latest_version, warning_message
        
    except requests.RequestException as e:
        return False, False, "", f"Network error checking package '{package_name}': {str(e)}"
    except Exception as e:
        return False, False, "", f"Error checking package '{package_name}': {str(e)}"


def validate_package_json(package_json_path: str) -> Dict[str, Any]:
    """
    Validate all packages in package.json and return validation results.
    """
    logger.info(f"[Package Validator Agent] Validating packages in {package_json_path}")
    
    if not os.path.exists(package_json_path):
        return {"error": f"package.json not found at {package_json_path}"}
    
    try:
        with open(package_json_path, 'r', encoding='utf-8') as f:
            package_data = json.load(f)
    except Exception as e:
        return {"error": f"Failed to read package.json: {str(e)}"}
    
    dependencies = package_data.get('dependencies', {})
    dev_dependencies = package_data.get('devDependencies', {})
    
    validation_results = {
        "valid_packages": [],
        "invalid_packages": [],
        "deprecated_packages": [],
        "recommendations": {},
        "errors": []
    }
    
    all_packages = {**dependencies, **dev_dependencies}
    
    for package_name, version in all_packages.items():
        logger.info(f"[Package Validator Agent] Checking {package_name}@{version}")
        
        exists, is_deprecated, latest_version, warning = check_package_exists(package_name, version)
        
        if not exists:
            validation_results["invalid_packages"].append({
                "name": package_name,
                "version": version,
                "error": warning
            })
        elif is_deprecated:
            validation_results["deprecated_packages"].append({
                "name": package_name,
                "version": version,
                "warning": warning,
                "latest_version": latest_version
            })
        else:
            validation_results["valid_packages"].append({
                "name": package_name,
                "version": version,
                "latest_version": latest_version
            })
    
    return validation_results


def fix_package_json(package_json_path: str, validation_results: Dict[str, Any], project_prompt: str) -> bool:
    """
    Fix package.json by replacing invalid/deprecated packages with valid alternatives.
    """
    logger.info(f"[Package Validator Agent] Fixing packages in {package_json_path}")
    
    if not validation_results.get("invalid_packages") and not validation_results.get("deprecated_packages"):
        logger.info("[Package Validator Agent] No packages need fixing")
        return False
    
    # Load LLM credentials
    load_dotenv()
    api_key = os.getenv("LLM_KEY")
    model = os.getenv("MODEL_NAME")
    base_url = os.getenv("LLM_BASE_URL")
    
    if not api_key:
        logger.error("[Package Validator Agent] ERROR: LLM_KEY not found in .env")
        return False
    
    # Create OpenAI client
    if base_url:
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
    else:
        client = openai.OpenAI(api_key=api_key)
    
    # Read current package.json
    try:
        with open(package_json_path, 'r', encoding='utf-8') as f:
            package_data = json.load(f)
    except Exception as e:
        logger.error(f"[Package Validator Agent] ERROR: Failed to read package.json: {e}")
        return False
    
    # Prepare issues for LLM
    issues_summary = []
    
    for pkg in validation_results.get("invalid_packages", []):
        issues_summary.append(f"INVALID: {pkg['name']}@{pkg['version']} - {pkg['error']}")
    
    for pkg in validation_results.get("deprecated_packages", []):
        issues_summary.append(f"DEPRECATED: {pkg['name']}@{pkg['version']} - {pkg['warning']}")
    
    # System prompt for package fixing
    system_prompt = """You are a React package dependency expert. Your job is to fix package.json files by replacing invalid or deprecated packages with valid, modern alternatives.

Rules:
1. Replace invalid packages with existing, maintained alternatives that provide similar functionality
2. Replace deprecated packages with their recommended successors or modern alternatives
3. Use the latest stable versions for new packages
4. Maintain the same functionality and purpose
5. Only suggest packages that are well-maintained and widely used
6. Keep the overall project architecture and functionality intact

Return a JSON object with the complete updated package.json content.
Make sure to include all existing valid packages and only replace the problematic ones.

Common replacements:
- For UI libraries: Use maintained alternatives like @mui/material, antd, chakra-ui
- For state management: Use @reduxjs/toolkit, zustand, jotai
- For routing: Use react-router-dom (latest)
- For forms: Use react-hook-form, formik
- For styling: Use styled-components, emotion, tailwindcss
- For date handling: Use date-fns, dayjs (not moment.js)
- For HTTP requests: Use axios, fetch (built-in)

Be conservative - only replace packages that are actually problematic."""

    # User prompt with context
    user_prompt = f"""Please fix the following package.json file by replacing invalid or deprecated packages:

PROJECT CONTEXT:
{project_prompt}

CURRENT PACKAGE.JSON:
{json.dumps(package_data, indent=2)}

PACKAGE ISSUES:
{chr(10).join(issues_summary)}

VALID PACKAGES (keep these):
{chr(10).join([f"- {pkg['name']}@{pkg['version']}" for pkg in validation_results.get("valid_packages", [])])}

Please provide a corrected package.json with invalid/deprecated packages replaced by valid, modern alternatives."""

    # Call LLM
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        response_content = get_complete_llm_response(messages, model, client, max_attempts=3, max_tokens=4096)
        fixed_package_data = extract_json_from_llm_output(response_content)
        
        if not isinstance(fixed_package_data, dict):
            logger.error("[Package Validator Agent] ERROR: LLM returned invalid package.json format")
            return False
        
        # Validate the fixed package.json structure
        required_fields = ['name', 'version', 'dependencies', 'devDependencies']
        if not all(field in fixed_package_data for field in ['name', 'version']):
            logger.error("[Package Validator Agent] ERROR: Fixed package.json missing required fields")
            return False
        
        # Write the fixed package.json
        with open(package_json_path, 'w', encoding='utf-8') as f:
            json.dump(fixed_package_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"[Package Validator Agent] Successfully fixed package.json")
        
        # Log what was changed
        old_deps = {**package_data.get('dependencies', {}), **package_data.get('devDependencies', {})}
        new_deps = {**fixed_package_data.get('dependencies', {}), **fixed_package_data.get('devDependencies', {})}
        
        for pkg_name in old_deps:
            if pkg_name not in new_deps:
                logger.info(f"[Package Validator Agent] REMOVED: {pkg_name}@{old_deps[pkg_name]}")
        
        for pkg_name in new_deps:
            if pkg_name not in old_deps:
                logger.info(f"[Package Validator Agent] ADDED: {pkg_name}@{new_deps[pkg_name]}")
            elif new_deps[pkg_name] != old_deps[pkg_name]:
                logger.info(f"[Package Validator Agent] UPDATED: {pkg_name} {old_deps[pkg_name]} -> {new_deps[pkg_name]}")
        
        return True
        
    except Exception as e:
        logger.error(f"[Package Validator Agent] ERROR: Failed to fix package.json: {e}")
        return False


def validate_and_fix_packages(project_dir: str, project_prompt: str) -> Dict[str, Any]:
    """
    Main function to validate and fix packages in a project.
    """
    package_json_path = os.path.join(project_dir, "package.json")
    
    # Validate packages
    validation_results = validate_package_json(package_json_path)
    
    if "error" in validation_results:
        logger.error(f"[Package Validator Agent] ERROR: {validation_results['error']}")
        return validation_results
    
    # Report validation results
    valid_count = len(validation_results.get("valid_packages", []))
    invalid_count = len(validation_results.get("invalid_packages", []))
    deprecated_count = len(validation_results.get("deprecated_packages", []))
    
    logger.info(f"[Package Validator Agent] Validation complete: {valid_count} valid, {invalid_count} invalid, {deprecated_count} deprecated")
    
    # Fix packages if needed
    if invalid_count > 0 or deprecated_count > 0:
        if fix_package_json(package_json_path, validation_results, project_prompt):
            # Re-validate after fixing
            logger.info("[Package Validator Agent] Re-validating after fixes...")
            validation_results = validate_package_json(package_json_path)
            validation_results["fixed"] = True
        else:
            validation_results["fixed"] = False
    else:
        validation_results["fixed"] = False
    
    return validation_results 