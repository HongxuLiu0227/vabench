import os
import json
from dotenv import load_dotenv
import openai
from llm_output_utils import extract_json_from_llm_output, get_complete_llm_response
from logging_config import get_logger

logger = get_logger(__name__)

MAX_PAGES = 8
MAX_COMPONENTS = 30
MAX_SECTIONS_PER_PAGE = 6
MAX_COMPONENT_PROPS = 8


def enforce_manifest_limits(manifest):
    """
    Trim excessively large manifests to stay within model context limits.
    Keeps the first MAX_PAGES pages and the components they reference.
    Limits section counts and number of props per component.
    """
    if not isinstance(manifest, dict):
        return manifest

    pages = manifest.get("pages", [])
    components = manifest.get("components", [])

    if len(pages) > MAX_PAGES:
        logger.warning(f"[Structure Planner Agent] Trimming pages from {len(pages)} to {MAX_PAGES} to respect limits")
        pages = pages[:MAX_PAGES]

    # Ensure sections aren't excessive
    for page in pages:
        sections = page.get("sections", [])
        if isinstance(sections, list) and len(sections) > MAX_SECTIONS_PER_PAGE:
            logger.warning(f"[Structure Planner Agent] Page '{page.get('name')}' sections trimmed to {MAX_SECTIONS_PER_PAGE}")
            page["sections"] = sections[:MAX_SECTIONS_PER_PAGE]

    # Determine which components are actually used by the retained pages
    referenced_component_names = []
    for page in pages:
        for comp_name in page.get("components", []):
            if comp_name not in referenced_component_names:
                referenced_component_names.append(comp_name)

    # Build lookup of components
    component_lookup = {comp.get("name"): comp for comp in components if isinstance(comp, dict) and comp.get("name")}

    # Preserve order while filtering
    filtered_components = []
    for name in referenced_component_names:
        comp = component_lookup.get(name)
        if comp:
            filtered_components.append(comp)

    # If still too many components, keep the first MAX_COMPONENTS
    if len(filtered_components) > MAX_COMPONENTS:
        logger.warning(f"[Structure Planner Agent] Trimming components from {len(filtered_components)} to {MAX_COMPONENTS}")
        filtered_components = filtered_components[:MAX_COMPONENTS]
        # Update pages to drop references to removed components
        allowed_names = {comp.get("name") for comp in filtered_components}
        for page in pages:
            page_components = page.get("components", [])
            page["components"] = [name for name in page_components if name in allowed_names]

    # Limit number of props per component and drop overly verbose descriptions
    for comp in filtered_components:
        props = comp.get("props", {})
        if isinstance(props, dict) and len(props) > MAX_COMPONENT_PROPS:
            logger.warning(f"[Structure Planner Agent] Component '{comp.get('name')}' props trimmed to {MAX_COMPONENT_PROPS}")
            trimmed_props = {}
            for idx, (prop_name, spec) in enumerate(props.items()):
                if idx >= MAX_COMPONENT_PROPS:
                    break
                trimmed_props[prop_name] = spec
            comp["props"] = trimmed_props

    manifest["pages"] = pages
    manifest["components"] = filtered_components
    return manifest

def plan_structure(project_dir, prompt):
    """
    Analyze the prompt and current file structure.
    Output a manifest (JSON/dict) of all pages/components and their relationships.
    """
    load_dotenv()
    api_key = os.getenv("LLM_KEY")
    model = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    base_url = os.getenv("LLM_BASE_URL", "")
    if not api_key:
        logger.error("[Structure Planner Agent] ERROR: LLM_KEY not found in .env")
        return {"pages": [], "components": []}

    base_system_prompt = (
        "You are an expert React project architect. Given a project description, output a JSON manifest listing all pages and all components, and their relationships. "
        "The manifest must have two keys: 'pages' (list of objects with 'name', 'components', and 'sections' fields) and 'components' (list of objects with 'name', 'used_in', and 'props' fields). "
        "Each page object must include: "
        "- 'name': the page name "
        "- 'components': array of component names used in the page "
        "- 'sections': array of string arrays, where each inner array represents a logical layout section containing related components "
        "  (example: [['Header'], ['SidebarNavigation'], ['DataTable', 'ChartVisualization'], ['ComplexForm'], ['CardSystem'], ['Footer']]). "
        "Each component object must include: "
        "- 'name': the component name "
        "- 'used_in': array of page names where this component appears "
        "- 'props': object describing the component's props with the following structure: "
        "  { "
        "    'propName': { "
        "      'type': 'string|number|boolean|array|object|function', "
        "      'required': true|false, "
        "      'default': 'default value if any', "
        "      'description': 'brief description of what this prop does' "
        "    } "
        "  }. "
        f"Include at least one meaningful prop for every component. Props should reflect realistic data shapes (arrays for collections, objects for structured data, etc.) so that downstream generators can produce rich mock data. "
        f"Keep the plan concise: never output more than {MAX_PAGES} pages or {MAX_COMPONENTS} components in total. "
        f"For each page, limit sections to at most {MAX_SECTIONS_PER_PAGE} groups. "
        f"For each component, list only the {MAX_COMPONENT_PROPS} most important props. "
        "Combine related features instead of creating separate components when possible. "
        "Do not output anything except the JSON object."
    )

    if base_url:
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
    else:
        client = openai.OpenAI(api_key=api_key)

    max_attempts = 3
    attempt = 0
    follow_up_instruction = ""
    last_error = ""
    
    while attempt < max_attempts:
        attempt += 1
        system_prompt = base_system_prompt
        if follow_up_instruction:
            system_prompt += (
                "\n\nADDITIONAL REQUIRED CORRECTIONS:\n"
                f"{follow_up_instruction}"
            )

        user_prompt = f"Project prompt:\n{prompt}"
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        try:
            full_content = get_complete_llm_response(messages, model, client, max_attempts=5, max_tokens=4096)
            manifest = extract_json_from_llm_output(full_content)
            assert isinstance(manifest, dict)
            if 'pages' not in manifest or 'components' not in manifest:
                raise ValueError('Missing keys in manifest')
            
            # Validate that each page has the required fields
            for page in manifest.get('pages', []):
                if not isinstance(page, dict):
                    raise ValueError('Page must be an object')
                if 'name' not in page or 'components' not in page or 'sections' not in page:
                    raise ValueError('Page must have name, components, and sections fields')
                if not isinstance(page['sections'], list):
                    raise ValueError('Sections must be an array')
                for section in page['sections']:
                    if not isinstance(section, list):
                        raise ValueError('Each section must be an array of component names')
            
            missing_props = []
            invalid_props = []

            # Validate that each component has the required fields including props
            for component in manifest.get('components', []):
                if not isinstance(component, dict):
                    invalid_props.append(f"Component entry is not an object: {component}")
                    continue
                if 'name' not in component or 'used_in' not in component or 'props' not in component:
                    missing_props.append(component.get('name', '<unknown>'))
                    continue
                if not isinstance(component['props'], dict) or len(component['props']) == 0:
                    missing_props.append(component['name'])
                    continue
                
                # Validate props structure
                for prop_name, prop_spec in component['props'].items():
                    if not isinstance(prop_spec, dict):
                        invalid_props.append(f"{component['name']} -> {prop_name}: spec must be an object")
                        continue
                    if 'type' not in prop_spec:
                        invalid_props.append(f"{component['name']} -> {prop_name}: missing 'type'")
                    if 'required' not in prop_spec:
                        invalid_props.append(f"{component['name']} -> {prop_name}: missing 'required'")
                    if 'description' not in prop_spec:
                        invalid_props.append(f"{component['name']} -> {prop_name}: missing 'description'")

            if missing_props or invalid_props:
                problems = []
                if missing_props:
                    problems.append(
                        "Missing prop definitions for components: "
                        + ", ".join(sorted(set(missing_props)))
                    )
                if invalid_props:
                    problems.append(
                        "Invalid prop specs: "
                        + "; ".join(invalid_props)
                    )
                follow_up_instruction = (
                    "The previous answer was rejected because:\n"
                    f"- {'; '.join(problems)}.\n"
                    "Re-issue the manifest and ensure every component includes a non-empty 'props' map "
                    "with realistic data-oriented fields (strings, numbers, arrays, objects, functions) and descriptions."
                )
                last_error = "; ".join(problems)
                logger.warning(f"[Structure Planner Agent] Attempt {attempt} missing details: {last_error}")
                continue
            
            manifest = enforce_manifest_limits(manifest)
            return manifest
        except Exception as e:
            last_error = str(e)
            follow_up_instruction = (
                "The previous answer failed to parse because of this error:\n"
                f"- {last_error}\n"
                "Please try again and ensure the response is a valid JSON object that satisfies all requirements."
            )
            logger.warning(f"[Structure Planner Agent] Attempt {attempt} failed: {e}")
    
    logger.error(f"[Structure Planner Agent] ERROR: Failed to obtain valid manifest after {max_attempts} attempts. Last issue: {last_error}\nOutput: {locals().get('full_content', '')}")
    return {"pages": [], "components": []}
