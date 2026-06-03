import os
import json
from dotenv import load_dotenv
import openai
from llm_output_utils import extract_json_from_llm_output, get_complete_llm_response
import re
import concurrent.futures
import threading
from logging_config import get_logger

logger = get_logger(__name__)

PLACEHOLDER_PATTERN = re.compile(
    r"(will\s+be\s+implemented|coming\s+soon|placeholder|under\s+development|todo)",
    re.IGNORECASE
)

def get_file_tree_from_manifest(file_structure_manifest):
    """
    Returns a string representation of the file/folder tree from the manifest.
    """
    if not file_structure_manifest:
        return ""
    tree = {}
    for path in file_structure_manifest:
        parts = path.strip('/').split('/')
        node = tree
        for i, part in enumerate(parts):
            if part == '':
                continue
            if i == len(parts) - 1 and not path.endswith('/'):
                node.setdefault('__files__', []).append(part)
            else:
                node = node.setdefault(part, {})
    def build_tree_str(node, indent=0):
        lines = []
        for k, v in node.items():
            if k == '__files__':
                for f in v:
                    lines.append('  ' * indent + f)
            else:
                lines.append('  ' * indent + k + '/')
                lines.extend(build_tree_str(v, indent + 1))
        return lines
    return '\n'.join(build_tree_str(tree))

def validate_component_output(content, component_name, props_spec):
    """
    Basic quality checks to ensure component implementations are not placeholders.
    """
    if not isinstance(content, str):
        return False, "generated content is not a string"

    # Obvious placeholders or non-JSX implementations
    if "React.createElement" in content:
        return False, "component used React.createElement instead of JSX"
    if PLACEHOLDER_PATTERN.search(content):
        return False, "component still renders placeholder text"

    props_spec = props_spec or {}
    if not props_spec:
        return True, ""

    prop_names = list(props_spec.keys())
    # Ensure at least one prop name appears in body
    referenced_props = [prop for prop in prop_names if re.search(rf"\b{prop}\b", content)]
    if not referenced_props:
        return False, f"component does not reference any props ({', '.join(prop_names)})"

    return True, ""

def validate_page_output(content, page_ctx, comp_lookup):
    """
    Ensure pages render their components with meaningful props and avoid placeholders.
    """
    if not isinstance(content, str):
        return False, "page content is not a string"

    if PLACEHOLDER_PATTERN.search(content):
        return False, "page still contains placeholder messaging"

    components = page_ctx.get('components', []) if page_ctx else []
    if not components:
        return True, ""

    missing_components = []
    missing_props = []
    empty_props = []
    missing_data_sources = []

    def has_array_definition(identifier: str) -> bool:
        # Direct array literal
        pattern_const = rf"(const|let|var)\s+{identifier}\s*=\s*\["
        if re.search(pattern_const, content):
            return True
        # React state initialization
        pattern_state = rf"\[\s*{identifier}\s*,\s*\w+\s*\]\s*=\s*useState\s*\(\s*\["
        if re.search(pattern_state, content):
            return True
        # Memoized array
        pattern_memo = rf"const\s+{identifier}\s*=\s*useMemo\s*\(\s*\(\)\s*=>\s*\["
        if re.search(pattern_memo, content):
            return True
        return False

    for component_name in components:
        component_info = comp_lookup.get(component_name, {})
        required_props = [
            prop_name
            for prop_name, spec in (component_info.get('props') or {}).items()
            if spec.get('required', False)
        ]

        # Build regex to capture opening tag attributes (self-closing or standard)
        pattern = rf"<{component_name}\b([^>/]*)(?:/?)>"
        matches = re.findall(pattern, content, flags=re.DOTALL)

        if not matches:
            missing_components.append(component_name)
            continue

        def prop_is_empty(attr_string: str, prop: str) -> bool:
            empty_patterns = [
                rf"{prop}\s*=\s*{{\s*\[\s*\]\s*}}",
                rf"{prop}\s*=\s*{{\s*{{\s*}}\s*}}",
                rf"{prop}\s*=\s*{{\s*}}",
                rf"{prop}\s*=\s*\"\"",
                rf"{prop}\s*=\s*''",
                rf"{prop}\s*=\s*{{\s*null\s*}}",
                rf"{prop}\s*=\s*{{\s*undefined\s*}}"
            ]
            return any(re.search(pattern, attr_string) for pattern in empty_patterns)

        def extract_prop_value(attr_string: str, prop: str) -> str:
            match = re.search(rf"{prop}\s*=\s*{{([^}}]+)}}", attr_string)
            if match:
                return match.group(1).strip()
            match = re.search(rf"{prop}\s*=\s*\"([^\"]+)\"", attr_string)
            if match:
                return match.group(1).strip()
            return ""

        usage_satisfied = False
        for attr_string in matches:
            missing_for_usage = [
                prop for prop in required_props
                if not re.search(rf"{prop}\s*=", attr_string)
            ]
            empty_for_usage = [
                prop for prop in required_props
                if re.search(rf"{prop}\s*=", attr_string) and prop_is_empty(attr_string, prop)
            ]

            if not missing_for_usage and not empty_for_usage:
                usage_satisfied = True
                break

        if not usage_satisfied:
            for attr_string in matches:
                for prop in required_props:
                    if not re.search(rf"{prop}\s*=", attr_string):
                        missing_props.append(f"{component_name}.{prop}")
                    elif prop_is_empty(attr_string, prop):
                        empty_props.append(f"{component_name}.{prop}")
                    else:
                        prop_value = extract_prop_value(attr_string, prop)
                        if prop_value:
                            if prop_value.startswith('['):
                                # ensure non-empty array with objects
                                if re.search(rf"{prop}\s*=\s*{{\s*\[\s*\]\s*}}", attr_string):
                                    empty_props.append(f"{component_name}.{prop}")
                                elif not re.search(r"\[\s*{", prop_value):
                                    missing_data_sources.append(f"{component_name}.{prop}")
                            elif re.match(r"^[A-Za-z_][\w]*$", prop_value):
                                if not has_array_definition(prop_value):
                                    missing_data_sources.append(f"{component_name}.{prop}")
                            # other expressions are assumed valid

    if missing_components:
        return False, f"page does not render required components: {', '.join(sorted(set(missing_components)))}"
    if missing_props:
        return False, f"page does not pass required props: {', '.join(sorted(set(missing_props)))}"
    if empty_props:
        return False, f"page passes empty values for required props: {', '.join(sorted(set(empty_props)))}"
    if missing_data_sources:
        return False, f"page must provide inline mock data for props: {', '.join(sorted(set(missing_data_sources)))}"

    # Ensure at least one inline mock dataset exists
    if not re.search(r"=\s*\[\s*{", content):
        return False, "page must include inline mock array data (e.g., const items = [{ ... }])"

    return True, ""

def estimate_tokens_for_file(path, file_ctx, prompt_base_len=800):
    # Simple estimation: base prompt + expected output size
    # You can tune these numbers as needed
    if path.endswith('.tsx'):
        return prompt_base_len + 800  # pages/components are bigger
    elif path.endswith('.ts') or path.endswith('.js'):
        return prompt_base_len + 400
    else:
        return prompt_base_len + 200

def batch_files_by_token_estimate(file_list, file_ctx_lookup, max_tokens_per_batch=6000):
    batches = []
    current_batch = []
    current_tokens = 0
    for path in file_list:
        ctx = file_ctx_lookup.get(path, None)
        est = estimate_tokens_for_file(path, ctx)
        if current_tokens + est > max_tokens_per_batch and current_batch:
            batches.append(current_batch)
            current_batch = []
            current_tokens = 0
        current_batch.append(path)
        current_tokens += est
    if current_batch:
        batches.append(current_batch)
    return batches

def generate_single_file(path, file_ctx, file_type, name, file_tree_str, project_prompt, allowed_libraries, comp_lookup, manifest_set, base_url, api_key, model):
    """
    Generate a single file content using LLM.
    Returns a tuple of (path, content) or (path, None) if failed.
    """
    try:
        if file_type == 'page':
            components = file_ctx.get('components', [])
            sections = file_ctx.get('sections', [])
            routes = file_ctx.get('routes', [])
            
            # Get component props information for all components used in this page
            components_props_info = ""
            if components:
                components_props_info = "\nCOMPONENT PROPS SPECIFICATIONS:\n"
                for component_name in components:
                    component_info = comp_lookup.get(component_name, {})
                    component_props = component_info.get('props', {})
                    
                    if component_props:
                        components_props_info += f"\n{component_name} component props:\n"
                        for prop_name, prop_spec in component_props.items():
                            prop_type = prop_spec.get('type', 'any')
                            required = prop_spec.get('required', False)
                            default = prop_spec.get('default', '')
                            description = prop_spec.get('description', '')
                            
                            components_props_info += f"  - {prop_name}: {prop_type}"
                            if required:
                                components_props_info += " (required)"
                            else:
                                components_props_info += " (optional)"
                            if default:
                                components_props_info += f", default: {default}"
                            components_props_info += f" - {description}\n"
                    else:
                        components_props_info += f"\n{component_name} component: No specific props defined\n"
            route_details = ""
            if routes:
                route_lines = ["\nROUTING INFORMATION:"]
                for route in routes:
                    path = route.get('path')
                    layout = route.get('layout', 'MainLayout')
                    description = route.get('description', '')
                    guards = route.get('guards', [])
                    guard_text = ""
                    if guards:
                        guard_text = f" Guards: {guards}."
                    route_lines.append(f"- Path '{path}' uses layout {layout}. {description}{guard_text}")
                    if route.get('children'):
                        child_paths = [child.get('path') for child in route['children']]
                        route_lines.append(f"  Nested children: {child_paths}")
                route_details = "\n".join(route_lines)
            
            system_prompt = (
                "You are an expert React developer specializing in page layouts and user interface design. Output ONLY a valid JSON object with the file path as the key and the file content as the value. "
                "Do NOT include explanations, markdown, or code blocks. If you output anything other than a JSON object, your answer will be discarded.\n\n"
                "EXPORT/IMPORT REQUIREMENTS:\n"
                "- All exports must be named exports (e.g., `export const MyComponent = ...`).\n"
                "- Do NOT use `export default` or default imports.\n"
                "- Only use `import { MyComponent } from ...` syntax for imports.\n"
                "CSS STYLING REQUIREMENTS:\n"
                "- EVERY page MUST include modern, clean CSS styles\n"
                "- Use CSS modules, styled-components, or inline styles with proper CSS-in-JS\n"
                "- Implement modern design principles: clean lines, proper spacing, subtle shadows, smooth transitions\n"
                "- Use a consistent color palette with primary, secondary, and accent colors\n"
                "- Include hover states, focus states, and interactive animations\n"
                "- Ensure responsive design with mobile-first approach\n"
                "- Use modern CSS features: CSS Grid, Flexbox, CSS Custom Properties, transitions\n"
                "- Apply proper typography with readable fonts and appropriate font sizes\n"
                "- Include subtle animations and micro-interactions where appropriate\n"
                "- Use modern spacing units (rem, em) and consistent spacing scale\n"
                "- Implement proper border-radius, shadows, and visual depth\n\n"
                "LAYOUT REQUIREMENTS:\n"
                "- Create a well-structured, responsive page layout using CSS Grid, Flexbox, or appropriate layout techniques\n"
                "- Include proper semantic HTML structure with header, main, section, and footer elements where appropriate\n"
                "- Ensure the layout is mobile-first and responsive across different screen sizes\n"
                "- Use proper spacing, padding, and margins for visual hierarchy\n"
                "- Implement a logical content flow that guides users through the page\n"
                "- Include proper container elements and layout wrappers\n\n"
                "SECTION-BASED LAYOUT:\n"
                "- Use the provided sections to organize components into logical layout groups\n"
                "- Each section should be visually distinct and properly spaced\n"
                "- Group related components together within their designated sections\n"
                "- Use appropriate layout containers (Grid, Flex, Stack, etc.) for each section\n"
                "- Ensure proper visual hierarchy between sections\n"
                "- Consider the flow and user experience when arranging sections\n\n"
                "COMPONENT INTEGRATION:\n"
                "- Organize components according to the provided sections\n"
                "- Use appropriate layout containers (Grid, Flex, Stack, etc.) to position components within sections\n"
                "- Ensure components have proper spacing and alignment within their sections\n"
                "- Consider the visual hierarchy and user flow when arranging components\n"
                "- Use responsive breakpoints to adapt component layouts for different screen sizes\n"
                "- IMPORTANT: When using components, provide appropriate props based on the component specifications below\n"
                "- Create meaningful data and handlers for component props\n"
                "- Ensure all required props are provided for each component\n"
                "- Use appropriate default values for optional props when needed\n"
                "- Create realistic mock data that demonstrates the component's functionality\n\n"
                "DATA AND HANDLER REQUIREMENTS:\n"
                "- Define inline mock data within the page (e.g., const mockProducts = [{ ... }]) for every array/object prop you pass to child components\n"
                "- Each mock array should contain at least three representative entries with realistic fields\n"
                "- Do NOT rely on undefined stores, hooks, or external data loaders—keep the mock data self-contained in this file\n"
                "- Provide actual implementations for callback props (e.g., const handleAddToCart = (productId: string) => { ... })\n\n"
                "PAGE DESIGN PRINCIPLES:\n"
                "- Create visually appealing, modern-looking pages\n"
                "- Use clean, minimalist design with proper visual hierarchy\n"
                "- Ensure pages are responsive and mobile-friendly\n"
                "- Include proper loading states and error handling\n"
                "- Follow accessibility best practices (ARIA labels, keyboard navigation)\n"
                "- Implement smooth page transitions and animations\n\n"
                "Here is the current file/folder structure of the project:\n"
                f"{file_tree_str}\n"
                "Your job is to generate the content for the file: {path}.\n"
                f"Project requirements: {project_prompt}\n"
                f"Allowed libraries: {allowed_libraries}.\n"
                f"The page name is: {name}.\n"
                f"The page should use these components: {', '.join(components)}.\n"
                f"The page sections are: {sections}{components_props_info}{route_details}\n"
                f"Example: {{ \"{path}\": \"...file content...\" }}"
            )
            route_prompt = ""
            if routes:
                route_prompt = f"\nRoutes: {json.dumps(routes, indent=2)}"
            user_prompt = (
                f"Page: {name}\nComponents: {components}\nSections: {sections}{route_prompt}\n\n"
                "Create a modern, well-styled page with clean CSS styling, proper responsive design, and visual hierarchy that effectively integrates all the specified components organized according to the provided sections. "
                "Honor the routing information for this page by providing navigation hooks, links, and nested route outlets where appropriate. "
                "Make sure to provide appropriate props for each component based on their specifications."
            )
        elif file_type == 'component':
            used_in = file_ctx.get('used_in', [])
            props = file_ctx.get('props', {})
            
            # Format props information for the prompt
            props_info = ""
            if props:
                props_info = "\nCOMPONENT PROPS SPECIFICATION:\n"
                for prop_name, prop_spec in props.items():
                    prop_type = prop_spec.get('type', 'any')
                    required = prop_spec.get('required', False)
                    default = prop_spec.get('default', '')
                    description = prop_spec.get('description', '')
                    
                    props_info += f"- {prop_name}: {prop_type}"
                    if required:
                        props_info += " (required)"
                    else:
                        props_info += " (optional)"
                    if default:
                        props_info += f", default: {default}"
                    props_info += f" - {description}\n"
            
            system_prompt = (
                "You are an expert React developer specializing in modern, well-styled components. Output ONLY a valid JSON object with the file path as the key and the file content as the value. "
                "Do NOT include explanations, markdown, or code blocks. If you output anything other than a JSON object, your answer will be discarded.\n\n"
                "EXPORT/IMPORT REQUIREMENTS:\n"
                "- All exports must be named exports (e.g., `export const MyComponent = ...`).\n"
                "- Do NOT use `export default` or default imports.\n"
                "- Only use `import { MyComponent } from ...` syntax for imports.\n"
                "CSS STYLING REQUIREMENTS:\n"
                "- EVERY component MUST include modern, clean CSS styles\n"
                "- Use CSS modules, styled-components, or inline styles with proper CSS-in-JS\n"
                "- Implement modern design principles: clean lines, proper spacing, subtle shadows, smooth transitions\n"
                "- Use a consistent color palette with primary, secondary, and accent colors\n"
                "- Include hover states, focus states, and interactive animations\n"
                "- Ensure responsive design with mobile-first approach\n"
                "- Use modern CSS features: CSS Grid, Flexbox, CSS Custom Properties, transitions\n"
                "- Apply proper typography with readable fonts and appropriate font sizes\n"
                "- Include subtle animations and micro-interactions where appropriate\n"
                "- Use modern spacing units (rem, em) and consistent spacing scale\n"
                "- Implement proper border-radius, shadows, and visual depth\n\n"
                "COMPONENT DESIGN PRINCIPLES:\n"
                "- Create visually appealing, modern-looking components\n"
                "- Use clean, minimalist design with proper visual hierarchy\n"
                "- Ensure components are reusable and well-structured\n"
                "- Include proper TypeScript interfaces and prop validation\n"
                "- Follow accessibility best practices (ARIA labels, keyboard navigation)\n"
                "- Make components responsive and mobile-friendly\n"
                "- If a component's prop/param is an array type or a custom object type, always attach a mock data value as the default value for that prop/param.\n"
                "- IMPORTANT: The component MUST accept exactly the props specified in the props specification below\n"
                "- Create proper TypeScript interfaces that match the specified prop types\n"
                "- Implement proper prop validation and default values as specified\n"
                "- Ensure the component functionality aligns with the prop descriptions\n"
                "STYLING EXAMPLES:\n"
                "- Buttons: Modern styling with hover effects, proper padding, border-radius\n"
                "- Cards: Subtle shadows, rounded corners, proper spacing\n"
                "- Forms: Clean input styling, focus states, validation styling\n"
                "- Tables: Modern table design with proper spacing and hover effects\n"
                "- Navigation: Clean, accessible navigation with proper spacing\n\n"
                "Here is the current file/folder structure of the project:\n"
                f"{file_tree_str}\n"
                "Your job is to generate the content for the file: {path}.\n"
                f"Project requirements: {project_prompt}\n"
                f"Allowed libraries: {allowed_libraries}.\n"
                f"The component name is: {name}.\n"
                f"The component will be used in: {', '.join(used_in)}.{props_info}\n"
                f"Example: {{ \"{path}\": \"...file content...\" }}"
            )
            user_prompt = f"Component: {name}\nUsed in: {used_in}\nProps: {props}\n\nCreate a modern, well-styled component with clean CSS styling, proper TypeScript interfaces that match the specified props, and responsive design."
        else:
            system_prompt = (
                "You are an expert React developer. Output ONLY a valid JSON object with the file path as the key and the file content as the value. "
                "Do NOT include explanations, markdown, or code blocks. If you output anything other than a JSON object, your answer will be discarded.\n\n"
                "EXPORT/IMPORT REQUIREMENTS:\n"
                "- All exports must be named exports (e.g., `export const MyComponent = ...`).\n"
                "- Do NOT use `export default` or default imports.\n"
                "- Only use `import { MyComponent } from ...` syntax for imports.\n"
                "Here is the current file/folder structure of the project:\n"
                f"{file_tree_str}\n"
                "Your job is to generate the content for the file: {path}.\n"
                f"Project requirements: {project_prompt}\n"
                f"Allowed libraries: {allowed_libraries}.\n"
                f"If the file is a config, utility, or layout, use best practices.\n"
                f"Example: {{ \"{path}\": \"...file content...\" }}"
            )
            user_prompt = f"File: {path}"
        
        if base_url:
            client = openai.OpenAI(api_key=api_key, base_url=base_url)
        else:
            client = openai.OpenAI(api_key=api_key)

        max_attempts = 3
        follow_up_instruction = ""
        attempt = 0

        while attempt < max_attempts:
            attempt += 1

            effective_system_prompt = system_prompt
            if follow_up_instruction:
                effective_system_prompt += (
                    "\n\nADDITIONAL REQUIRED CORRECTIONS:\n"
                    f"{follow_up_instruction}"
                )

            messages = [
                {"role": "system", "content": effective_system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            full_content = get_complete_llm_response(messages, model, client, max_attempts=5, max_tokens=8192)
            file_dict = extract_json_from_llm_output(full_content)
            if not isinstance(file_dict, dict):
                raise ValueError("LLM did not return a JSON object.")
            
            selected_content = None

            for k, v in file_dict.items():
                if 'src/' not in k:
                    logger.warning(f"[Component Generator Agent] WARNING: Skipping file not in src directory: {k}")
                    continue
                if manifest_set is not None and k not in manifest_set:
                    logger.warning(f"[Component Generator Agent] WARNING: Skipping file not in manifest: {k}")
                    continue

                if file_type == 'component':
                    props_spec = comp_lookup.get(name, {}).get('props', {})
                    is_valid, reason = validate_component_output(v, name, props_spec)
                    if not is_valid:
                        logger.warning(f"[Component Generator Agent] Validation failed for {k} (attempt {attempt}): {reason}")
                        detailed_props = ", ".join([f"{prop}: {spec.get('type', 'unknown')}" for prop, spec in props_spec.items()]) if props_spec else "none"
                        follow_up_instruction = (
                            f"The previous attempt was rejected because {reason}. "
                            "Regenerate the component using proper JSX, TypeScript typings/interfaces, responsive layout, and show realistic data wired through props. "
                            f"Remember to use these props: {detailed_props}."
                        )
                        selected_content = None
                        break
                elif file_type == 'page':
                    is_valid, reason = validate_page_output(v, file_ctx, comp_lookup)
                    if not is_valid:
                        logger.warning(f"[Component Generator Agent] Page validation failed for {k} (attempt {attempt}): {reason}")
                        follow_up_instruction = (
                            f"The previous attempt was rejected because {reason}. "
                            "Regenerate the page with meaningful mock data, state management, and by passing complete props to child components."
                        )
                        selected_content = None
                        break
                selected_content = (k, v)

            if selected_content:
                return selected_content

            if not follow_up_instruction:
                # No files passed filtering; add a generic instruction for the next attempt
                follow_up_instruction = "Return the requested file with a complete implementation that follows the prompt requirements."

        logger.error(f"[Component Generator Agent] ERROR: Failed to produce valid output for {path} after {max_attempts} attempts")
        return (path, None)
    except Exception as e:
        logger.warning(f"[Component Generator Agent] WARNING: Failed to generate {path}: {e}")
        return (path, None)

def generate_index_ts_content(folder_path, files_dict):
    """
    Generate index.ts content that exports all named exports from files in the folder.
    Returns the index.ts content as a string.
    """
    try:
        # Extract named exports from each file
        exports_by_file = {}
        
        for file_path, content in files_dict.items():
            if not file_path.startswith(folder_path) or file_path.endswith('/index.ts') or file_path.endswith('/index.tsx'):
                continue
                
            # Get the filename without extension for import path
            filename = os.path.basename(file_path)
            name_without_ext = os.path.splitext(filename)[0]
            
            # Extract named exports using regex
            named_exports = []
            
            # Pattern for named exports: export const/function/interface/type/class Name
            export_patterns = [
                r'export\s+(?:const|function|interface|type|class|enum)\s+(\w+)',
                r'export\s*{\s*([^}]+)\s*}',
                r'export\s+(\w+)\s*[=:]',
                r'export\s+(\w+)\s*;',
                r'export\s+(?:const|let|var)\s+(\w+)\s*=',
                r'export\s+type\s+(\w+)',
                r'export\s+interface\s+(\w+)'
            ]
            
            for pattern in export_patterns:
                matches = re.findall(pattern, content, re.MULTILINE)
                for match in matches:
                    if '{' in match:
                        # Handle export { a, b, c } syntax
                        items = re.findall(r'\b(\w+)\b', match)
                        named_exports.extend(items)
                    else:
                        named_exports.append(match.strip())
            
            # Remove duplicates and filter out common non-export names
            named_exports = list(set([exp for exp in named_exports if exp and exp not in ['default', 'export', 'type', 'interface', 'const', 'function', 'class', 'enum']]))
            
            if named_exports:
                exports_by_file[name_without_ext] = named_exports
        
        # Generate index.ts content
        if not exports_by_file:
            return None
            
        index_lines = []
        index_lines.append("// Auto-generated index file - exports all named exports from this folder")
        index_lines.append("")
        
        for filename, exports in exports_by_file.items():
            if exports:
                exports_str = ", ".join(exports)
                index_lines.append(f"export {{ {exports_str} }} from './{filename}';")
        
        return "\n".join(index_lines)
        
    except Exception as e:
        logger.warning(f"[Component Generator Agent] WARNING: Failed to generate index.ts content for {folder_path}: {e}")
        return None

def generate_empty_folder_files(folder_path, file_tree_str, project_prompt, allowed_libraries, manifest_set, base_url, api_key, model):
    """
    Generate files for an empty folder using LLM.
    Returns a dict of {file_path: file_content} or empty dict if failed.
    """
    try:
        system_prompt = (
            "You are an expert React project architect specializing in modern, well-styled components. Output ONLY a valid JSON object with the file path as the key and the file content as the value. "
            "Do NOT include explanations, markdown, or code blocks. If you output anything other than a JSON object, your answer will be discarded.\n\n"
            "EXPORT/IMPORT REQUIREMENTS:\n"
            "- All exports must be named exports (e.g., `export const MyComponent = ...`).\n"
            "- Do NOT use `export default` or default imports.\n"
            "- Only use `import { MyComponent } from ...` syntax for imports.\n"
            "CSS STYLING REQUIREMENTS:\n"
            "- EVERY component/file MUST include modern, clean CSS styles\n"
            "- Use CSS modules, styled-components, or inline styles with proper CSS-in-JS\n"
            "- Implement modern design principles: clean lines, proper spacing, subtle shadows, smooth transitions\n"
            "- Use a consistent color palette with primary, secondary, and accent colors\n"
            "- Include hover states, focus states, and interactive animations\n"
            "- Ensure responsive design with mobile-first approach\n"
            "- Use modern CSS features: CSS Grid, Flexbox, CSS Custom Properties, transitions\n"
            "- Apply proper typography with readable fonts and appropriate font sizes\n"
            "- Include subtle animations and micro-interactions where appropriate\n"
            "- Use modern spacing units (rem, em) and consistent spacing scale\n"
            "- Implement proper border-radius, shadows, and visual depth\n\n"
            "INDEX.TS REQUIREMENT:\n"
            "- You MUST ALWAYS generate an index.ts file for the folder that exports all named exports from all other files in the folder\n"
            "- The index.ts should re-export all components, functions, types, and other named exports from the files in this folder\n"
            "- Use the pattern: export { ComponentName, functionName, typeName } from './filename';\n"
            "- Do NOT use default exports or default imports in the index.ts\n"
            "- The index.ts should be the first file listed in your JSON response\n\n"
            "Here is the current file/folder structure of the project:\n"
            f"{file_tree_str}\n"
            f"The folder {folder_path} is empty (except for .gitkeep).\n"
            f"Project requirements: {project_prompt}\n"
            "Based on the project, what files (if any) should be created in this folder? "
            "For each file, generate its content with modern CSS styling. "
            "IMPORTANT: Always include an index.ts file that exports all named exports from the other files in this folder. "
            "Output a JSON object: { \"file_path\": \"file content\", ... }"
        )
        user_prompt = f"Empty folder: {folder_path}\n\nGenerate files for this folder, including an index.ts that exports all named exports from the other files."
        
        if base_url:
            client = openai.OpenAI(api_key=api_key, base_url=base_url)
        else:
            client = openai.OpenAI(api_key=api_key)
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        full_content = get_complete_llm_response(messages, model, client, max_attempts=5, max_tokens=8192)
        file_dict = extract_json_from_llm_output(full_content)
        if not isinstance(file_dict, dict):
            raise ValueError("LLM did not return a JSON object.")
        
        # Filter files based on manifest if needed
        filtered_dict = {}
        for k, v in file_dict.items():
            if manifest_set is not None and k not in manifest_set:
                logger.warning(f"[Component Generator Agent] WARNING: Skipping LLM-suggested file not in manifest: {k}")
                continue
            filtered_dict[k] = v
        
        # Ensure index.ts exists and exports all named exports from other files
        # index_path = f"{folder_path}/index.ts"
        # if index_path not in filtered_dict:
        #     # Generate index.ts content by analyzing other files
        #     index_content = generate_index_ts_content(folder_path, filtered_dict)
        #     if index_content:
        #         filtered_dict[index_path] = index_content
        #         logger.info(f"[Component Generator Agent] Auto-generated index.ts for {folder_path}")
        
        return filtered_dict
    except Exception as e:
        logger.warning(f"[Component Generator Agent] WARNING: Failed to generate files for empty folder {folder_path}: {e}")
        return {}

def generate_components(project_dir, manifest, allowed_libraries, file_structure_manifest=None, project_prompt=None, routing_manifest=None, restrict_to_manifest=True, max_tokens_per_batch=6000, max_workers=20):
    """
    Generate code for each file in the file_structure_manifest, using manifest, routing_manifest, and project_prompt for context.
    For each empty folder, prompt LLM to suggest and generate files for that folder.
    If restrict_to_manifest is True, only accept files in the manifest. Otherwise, accept any file.
    Only considers files/folders inside the src directory.
    Returns a dict: {relative_path: file_content}
    """
    load_dotenv()
    api_key = os.getenv("LLM_KEY")
    model = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    base_url = os.getenv("LLM_BASE_URL", "")
    if not api_key:
        logger.error("[Component Generator Agent] ERROR: LLM_KEY not found in .env")
        return {}

    # Only consider files/folders inside src/
    if file_structure_manifest:
        file_structure_manifest = [p for p in file_structure_manifest if p.startswith('src/')]

    file_tree_str = get_file_tree_from_manifest(file_structure_manifest)
    manifest_set = set(file_structure_manifest) if (file_structure_manifest and restrict_to_manifest) else None
    generated_files = {}
    # Build lookup for page/component context
    page_lookup = {p['name']: p for p in manifest.get('pages', [])}
    comp_lookup = {c['name']: c for c in manifest.get('components', [])}

    # Helper: is a folder?
    def is_folder(path):
        return path.endswith('/')

    # Helper: is a .tsx file?
    def is_tsx_file(path):
        return path.endswith('.tsx')

    # Helper: get base name without extension
    def base_name(path):
        return os.path.splitext(os.path.basename(path))[0]

    # Helper: get files in a folder from manifest
    def files_in_folder(folder):
        prefix = folder
        if not prefix.endswith('/'):
            prefix += '/'
        return [p for p in file_structure_manifest or [] if p.startswith(prefix) and not is_folder(p)]

    # Build file context lookup for batching
    file_ctx_lookup = {}
    route_lookup = {}
    if routing_manifest:
        def collect_routes(route_list):
            for route in route_list or []:
                page_name = route.get("page")
                if page_name:
                    route_lookup.setdefault(page_name, []).append(route)
                collect_routes(route.get("children", []))
        collect_routes(routing_manifest.get("routes", []))

    if file_structure_manifest:
        for path in file_structure_manifest:
            if is_folder(path):
                continue
            name = base_name(path)
            if name in page_lookup and re.match(r'src/pages/', path):
                ctx = dict(page_lookup[name])
                if route_lookup.get(name):
                    ctx = ctx.copy()
                    ctx['routes'] = route_lookup[name]
                file_ctx_lookup[path] = ctx
            elif name in comp_lookup and re.match(r'src/components/', path):
                file_ctx_lookup[path] = comp_lookup[name]
            else:
                file_ctx_lookup[path] = None

    # 1. Handle files in manifest (parallel execution)
    if file_structure_manifest:
        non_folder_files = [p for p in file_structure_manifest if not is_folder(p)]
        
        # Prepare tasks for parallel execution
        tasks = []
        for path in non_folder_files:
            file_ctx = file_ctx_lookup.get(path, None)
            file_type = None
            name = base_name(path)
            if name in page_lookup and re.match(r'src/pages/', path):
                file_type = 'page'
                file_ctx = file_ctx_lookup.get(path, page_lookup.get(name))
            elif name in comp_lookup and re.match(r'src/components/', path):
                file_type = 'component'
                file_ctx = file_ctx_lookup.get(path, comp_lookup.get(name))
            else:
                file_type = 'other'
            
            tasks.append((path, file_ctx, file_type, name))
        
        logger.info(f"[Component Generator Agent] Starting parallel generation of {len(tasks)} files with {max_workers} workers...")
        
        # Execute tasks in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks
            future_to_task = {}
            for path, file_ctx, file_type, name in tasks:
                future = executor.submit(
                    generate_single_file,
                    path, file_ctx, file_type, name, file_tree_str, project_prompt, 
                    allowed_libraries, comp_lookup, manifest_set, base_url, api_key, model
                )
                future_to_task[future] = (path, file_type)
            
            # Collect results as they complete
            for future in concurrent.futures.as_completed(future_to_task):
                path, file_type = future_to_task[future]
                try:
                    result_path, content = future.result()
                    if content is not None:
                        generated_files[result_path] = content
                        logger.info(f"[Component Generator Agent] Successfully generated {file_type}: {result_path}")
                    else:
                        logger.info(f"[Component Generator Agent] Failed to generate {file_type}: {path}")
                except Exception as e:
                    logger.info(f"[Component Generator Agent] Exception while generating {file_type} {path}: {e}")
        
        logger.info(f"[Component Generator Agent] Completed parallel generation. Generated {len(generated_files)} files.")

    # 2. Handle empty folders (parallel execution)
    if file_structure_manifest:
        empty_folders = []
        for path in file_structure_manifest:
            if not is_folder(path):
                continue
            folder_files = files_in_folder(path)
            if len([f for f in folder_files if not f.endswith('.gitkeep')]) == 0:
                empty_folders.append(path)
        
        if empty_folders:
            logger.info(f"[Component Generator Agent] Starting parallel generation for {len(empty_folders)} empty folders with {max_workers} workers...")
            
            # Execute empty folder tasks in parallel
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
                # Submit all empty folder tasks
                future_to_folder = {}
                for folder_path in empty_folders:
                    future = executor.submit(
                        generate_empty_folder_files,
                        folder_path, file_tree_str, project_prompt, allowed_libraries, 
                        manifest_set, base_url, api_key, model
                    )
                    future_to_folder[future] = folder_path
                
                # Collect results as they complete
                for future in concurrent.futures.as_completed(future_to_folder):
                    folder_path = future_to_folder[future]
                    try:
                        folder_files = future.result()
                        if folder_files:
                            generated_files.update(folder_files)
                            logger.info(f"[Component Generator Agent] Successfully generated {len(folder_files)} files for empty folder: {folder_path}")
                        else:
                            logger.info(f"[Component Generator Agent] No files generated for empty folder: {folder_path}")
                    except Exception as e:
                        logger.info(f"[Component Generator Agent] Exception while processing empty folder {folder_path}: {e}")
            
            logger.info(f"[Component Generator Agent] Completed empty folder processing. Total files generated: {len(generated_files)}.")
    
    # 3. Post-process: Generate index.ts files for folders with multiple files
    if generated_files and file_structure_manifest:
        logger.info("[Component Generator Agent] Post-processing: Generating index.ts files for folders with multiple files...")
        
        # Group files by folder
        folders_with_files = {}
        for file_path in generated_files.keys():
            folder_path = os.path.dirname(file_path)
            if folder_path not in folders_with_files:
                folders_with_files[folder_path] = []
            folders_with_files[folder_path].append(file_path)
        
        # Generate index.ts for folders with multiple files (excluding index.ts itself)
        # for folder_path, file_paths in folders_with_files.items():
        #     # Skip if folder already has an index.ts
        #     index_path = f"{folder_path}/index.ts"
        #     if index_path in generated_files:
        #         continue
                
        #     # Only generate index.ts if there are multiple files (excluding index.ts)
        #     non_index_files = [f for f in file_paths if not f.endswith('/index.ts')]
        #     if len(non_index_files) > 1:
        #         # Create a subset of generated_files for this folder
        #         folder_files_dict = {f: generated_files[f] for f in non_index_files}
        #         index_content = generate_index_ts_content(folder_path, folder_files_dict)
        #         if index_content:
        #             generated_files[index_path] = index_content
        #             logger.info(f"[Component Generator Agent] Auto-generated index.ts for folder with multiple files: {folder_path}")
        
        logger.info(f"[Component Generator Agent] Post-processing completed. Total files generated: {len(generated_files)}.")
    
    return generated_files 
