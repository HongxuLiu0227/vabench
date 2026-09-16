import os
import json
import re
import asyncio
from typing import Dict, List, Any
from dotenv import load_dotenv
import openai
from .llm_output_utils import extract_json_from_llm_output, get_complete_llm_response
from ..logging_config import get_logger

logger = get_logger(__name__)

def extract_file_structure_info(content: str, file_path: str) -> Dict[str, Any]:
    """
    Extract only the essential import/export information from a file to reduce context length.
    Focuses on what the file exports and what it imports, not the internal logic.
    """
    info = {
        "file_path": file_path,
        "exports": [],
        "imports": [],
        "component_type": None,
        "has_styling": False
    }
    
    # Extract named exports
    export_patterns = [
        r'export\s+(?:const|function|class|interface|type|enum)\s+(\w+)',
        r'export\s+{\s*([^}]+)\s*}',
        r'export\s+default\s+(?:function\s+)?(\w+)',
        r'export\s+(\w+)\s*[=:]',
        r'export\s+(\w+)\s*;'
    ]
    
    for pattern in export_patterns:
        matches = re.finditer(pattern, content, re.MULTILINE)
        for match in matches:
            if '{' in match.group(1):  # Handle export { A, B, C }
                exports = re.findall(r'\b(\w+)\b', match.group(1))
                info["exports"].extend(exports)
            else:
                info["exports"].append(match.group(1).strip())
    
    # Remove duplicates and filter out common non-export names
    non_exports = {'default', 'type', 'interface', 'enum', 'const', 'let', 'var', 'export', 'function', 'class'}
    info["exports"] = list(set([exp for exp in info["exports"] if exp and exp not in non_exports]))
    
    # Extract imports
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
            
            info["imports"].append({
                "items": imported_items,
                "path": import_path
            })
    
    # Determine component type based on file content
    if any(exp[0].isupper() for exp in info["exports"] if exp):
        info["component_type"] = "React Component"
    elif any("interface" in line.lower() or "type" in line.lower() for line in content.split('\n')):
        info["component_type"] = "TypeScript Types"
    elif any("hook" in line.lower() for line in content.split('\n')):
        info["component_type"] = "React Hook"
    elif any("context" in line.lower() for line in content.split('\n')):
        info["component_type"] = "React Context"
    else:
        info["component_type"] = "Utility/Service"
    
    # Check if file has styling
    styling_indicators = [
        'css', 'styled', 'className', 'style=', 'css-in-js', 'emotion', 'styled-components',
        'background', 'color', 'margin', 'padding', 'border', 'display', 'flex', 'grid'
    ]
    content_lower = content.lower()
    info["has_styling"] = any(indicator in content_lower for indicator in styling_indicators)
    
    return info

def extract_project_structure(generated_files: Dict[str, str]) -> Dict[str, Any]:
    """
    Extract a lightweight structure of the project focusing on imports/exports and file relationships.
    """
    project_structure = {
        "files": {},
        "components": {},
        "types": {},
        "hooks": {},
        "contexts": {},
        "utilities": {},
        "routing": {},
        "styling": {}
    }
    
    for file_path, content in generated_files.items():
        file_info = extract_file_structure_info(content, file_path)
        project_structure["files"][file_path] = file_info
        
        # Categorize files
        if file_info["component_type"] == "React Component":
            project_structure["components"][file_path] = file_info
        elif file_info["component_type"] == "TypeScript Types":
            project_structure["types"][file_path] = file_info
        elif file_info["component_type"] == "React Hook":
            project_structure["hooks"][file_path] = file_info
        elif file_info["component_type"] == "React Context":
            project_structure["contexts"][file_path] = file_info
        else:
            project_structure["utilities"][file_path] = file_info
        
        # Check for routing
        if any(keyword in content.lower() for keyword in ['router', 'route', 'path', 'navigate']):
            project_structure["routing"][file_path] = file_info
        
        # Check for styling
        if file_info["has_styling"]:
            project_structure["styling"][file_path] = file_info
    
    return project_structure

async def fix_file_code(file_path: str, current_content: str, modifications: Dict[str, Any], 
                        project_prompt: str, model: str, client: openai.OpenAI) -> str:
    """
    Fix a single file's code based on the modifications specified by the analysis.
    """
    system_prompt = (
        "You are an expert React developer. Your job is to modify the given file according to the specified changes.\n\n"
        "MODIFICATION GUIDELINES:\n"
        "- Apply the requested changes while preserving existing functionality\n"
        "- Maintain code quality and React best practices\n"
        "- Keep existing styling and component structure\n"
        "- Ensure TypeScript types are properly defined\n"
        "- Follow the project's coding conventions\n\n"
        "OUTPUT FORMAT:\n"
        "Return a JSON object with only the 'fixed_content' field containing the complete updated file content.\n\n"
        "Example output:\n"
        "{\n"
        "  \"fixed_content\": \"import React from 'react';\\n\\nexport const MyComponent = () => {\\n  return <div>Hello</div>;\\n};\"\n"
        "}"
    )
    
    user_prompt = (
        f"FILE PATH: {file_path}\n\n"
        f"PROJECT PROMPT: {project_prompt}\n\n"
        f"REQUESTED MODIFICATIONS:\n{json.dumps(modifications, indent=2)}\n\n"
        f"CURRENT FILE CONTENT:\n{current_content}\n\n"
        f"Please apply the requested modifications and return the result in JSON format."
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        full_content = get_complete_llm_response(
            messages=messages,
            model=model,
            client=client,
            max_attempts=3,
            max_tokens=4096
        )
        
        # Extract JSON from the response
        result = extract_json_from_llm_output(full_content)
        
        # Validate the result structure
        if not isinstance(result, dict):
            logger.error(f"[Relationship Refactor Agent] Invalid JSON structure for {file_path}: not a dict")
            return current_content
            
        fixed_content = result.get("fixed_content", current_content)
        if fixed_content != current_content:
            logger.info(f"[Relationship Refactor Agent] Successfully fixed {file_path}")
        return fixed_content
            
    except Exception as e:
        logger.error(f"[Relationship Refactor Agent] ERROR fixing {file_path}: {e}")
        return current_content  # Return original content if fix fails

async def apply_code_fixes_parallel(files_to_modify: Dict[str, Any], generated_files: Dict[str, str], 
                                   project_prompt: str, model: str, client: openai.OpenAI) -> Dict[str, str]:
    """
    Apply code fixes to multiple files in parallel using asyncio.
    """
    tasks = []
    
    for file_path, modifications in files_to_modify.items():
        if file_path in generated_files:
            current_content = generated_files[file_path]
            task = fix_file_code(file_path, current_content, modifications, project_prompt, model, client)
            tasks.append((file_path, task))
    
    # Execute all tasks in parallel
    results = {}
    if tasks:
        logger.info(f"[Relationship Refactor Agent] Making {len(tasks)} parallel LLM calls to fix files...")
        
        # Create tasks
        task_dict = {file_path: task for file_path, task in tasks}
        
        # Wait for all tasks to complete
        logger.info(f"[Relationship Refactor Agent] Waiting for all LLM calls to complete...")
        completed_tasks = await asyncio.gather(*task_dict.values(), return_exceptions=True)
        
        # Process results
        for i, (file_path, _) in enumerate(tasks):
            result = completed_tasks[i]
            if isinstance(result, Exception):
                logger.error(f"[Relationship Refactor Agent] Failed to fix {file_path}: {result}")
                results[file_path] = generated_files[file_path]  # Keep original content
            else:
                results[file_path] = result
                logger.info(f"[Relationship Refactor Agent] Successfully fixed {file_path}")
    
    return results

async def refactor_relationships_async(generated_files: Dict[str, str], manifest: List[str], project_prompt: str) -> Dict[str, str]:
    """
    Analyze if the project code aligns well with the prompt requirements and apply fixes.
    Focuses on checking prompt alignment and applying necessary code modifications.
    Returns updated generated_files dict with any necessary changes.
    """
    load_dotenv()
    api_key = os.getenv("LLM_KEY")
    model = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    base_url = os.getenv("LLM_BASE_URL", "")
    if not api_key:
        logger.error("[Relationship Refactor Agent] ERROR: LLM_KEY not found in .env")
        return generated_files

    # Extract lightweight project structure
    project_structure = extract_project_structure(generated_files)
    
    # Create a summary of the project structure for the LLM
    structure_summary = {
        "total_files": len(generated_files),
        "components": len(project_structure["components"]),
        "types": len(project_structure["types"]),
        "hooks": len(project_structure["hooks"]),
        "contexts": len(project_structure["contexts"]),
        "utilities": len(project_structure["utilities"]),
        "files_with_routing": len(project_structure["routing"]),
        "files_with_styling": len(project_structure["styling"]),
        "file_categories": {}
    }
    
    # Add file categories with key exports
    for category, files in project_structure.items():
        if category != "files":
            structure_summary["file_categories"][category] = {
                file_path: {
                    "exports": file_info["exports"][:3],  # Limit to first 3 exports
                    "imports_count": len(file_info["imports"])
                }
                for file_path, file_info in files.items()
            }
    
    system_prompt = (
        "You are an expert React project architect and code reviewer. Your job is to analyze if the generated project code aligns well with the user's prompt requirements.\n\n"
        "ANALYSIS FOCUS:\n"
        "- Check if the project structure matches the prompt requirements\n"
        "- Verify that all required features/components are present\n"
        "- Ensure proper separation of concerns and file organization\n"
        "- Validate that the project follows React best practices\n"
        "- Check if the project has appropriate styling and modern design\n"
        "- Verify routing and navigation if required\n"
        "- Ensure proper TypeScript usage and type definitions\n\n"
        "OUTPUT FORMAT:\n"
        "Return exactly ONE JSON object with the following structure:\n\n"
        "{\n"
        "  \"alignment_score\": 85,\n"
        "  \"missing_features\": [\"feature1\", \"feature2\"],\n"
        "  \"structural_issues\": [\"issue1\", \"issue2\"],\n"
        "  \"recommendations\": [\"rec1\", \"rec2\"],\n"
        "  \"files_to_add\": [\"file1.tsx\", \"file2.tsx\"],\n"
        "  \"files_to_modify\": {\n"
        "    \"path/to/file.tsx\": {\n"
        "      \"add_props\": [\"prop1\", \"prop2\"],\n"
        "      \"add_imports\": [\"import1\", \"import2\"],\n"
        "      \"add_styling\": \"specific styling improvements\",\n"
        "      \"add_functionality\": \"specific features to implement\",\n"
        "      \"fix_types\": \"TypeScript type fixes\",\n"
        "      \"improve_structure\": \"structural improvements\"\n"
        "    }\n"
        "  }\n"
        "}\n\n"
        "IMPORTANT:\n"
        "- Return ONLY the JSON object, no additional text\n"
        "- Use empty arrays [] if no items in a list\n"
        "- Use empty objects {} if no files to modify\n"
        "- Ensure all JSON syntax is valid\n"
        "- Focus on high-level architecture and prompt alignment\n"
    )
    
    user_prompt = (
        f"PROJECT PROMPT:\n{project_prompt}\n\n"
        f"PROJECT STRUCTURE SUMMARY:\n{json.dumps(structure_summary, indent=2)}\n\n"
        f"FILE MANIFEST:\n{json.dumps(manifest, indent=2)}\n\n"
        f"KEY COMPONENTS AND THEIR EXPORTS:\n"
    )
    
    # Add key component information (limited to avoid context length issues)
    component_summary = {}
    for file_path, file_info in project_structure["components"].items():
        component_summary[file_path] = {
            "exports": file_info["exports"][:5],  # Limit to first 5 exports
            "imports": [imp["path"] for imp in file_info["imports"][:5]],  # Limit to first 5 imports
            "has_styling": file_info["has_styling"]
        }
    
    user_prompt += f"{json.dumps(component_summary, indent=2)}\n\n"
    user_prompt += "Please analyze if this project structure aligns with the prompt requirements and provide recommendations for improvement."

    if base_url:
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
    else:
        client = openai.OpenAI(api_key=api_key)
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        full_content = get_complete_llm_response(
            messages=messages, 
            model=model, 
            client=client, 
            max_attempts=5, 
            max_tokens=4096
        )
        analysis_result = extract_json_from_llm_output(full_content)
        
        logger.info(f"[Relationship Refactor Agent] Analysis completed. Alignment score: {analysis_result.get('alignment_score', 'N/A')}")
        logger.info(f"[Relationship Refactor Agent] Missing features: {analysis_result.get('missing_features', [])}")
        logger.info(f"[Relationship Refactor Agent] Structural issues: {analysis_result.get('structural_issues', [])}")
        
        # Apply any recommended file modifications in parallel
        files_to_modify = analysis_result.get('files_to_modify', {})
        if files_to_modify:
            logger.info(f"[Relationship Refactor Agent] Found {len(files_to_modify)} files to modify. Starting parallel LLM calls...")
            logger.info(f"[Relationship Refactor Agent] Files to modify: {list(files_to_modify.keys())}")
            fixed_files = await apply_code_fixes_parallel(files_to_modify, generated_files, project_prompt, model, client)
            
            # Update generated_files with the fixed versions
            for file_path, fixed_content in fixed_files.items():
                generated_files[file_path] = fixed_content
                logger.info(f"[Relationship Refactor Agent] Updated {file_path} with fixes")
        else:
            logger.info("[Relationship Refactor Agent] No files need modification")
        
        return generated_files
        
    except Exception as e:
        logger.error(f"[Relationship Refactor Agent] ERROR: {e}")
        return generated_files

def refactor_relationships(generated_files: Dict[str, str], manifest: List[str], project_prompt: str) -> Dict[str, str]:
    """
    Synchronous wrapper for the async relationship refactor function.
    """
    try:
        return asyncio.run(refactor_relationships_async(generated_files, manifest, project_prompt))
    except Exception as e:
        logger.error(f"[Relationship Refactor Agent] ERROR in sync wrapper: {e}")
        return generated_files 
