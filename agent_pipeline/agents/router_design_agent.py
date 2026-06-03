import os
import json
import re
from typing import Dict, Any, List
from dotenv import load_dotenv
import openai
from ..logging_config import get_logger
from .llm_output_utils import extract_json_from_llm_output, get_complete_llm_response

logger = get_logger(__name__)


def _slugify(name: str) -> str:
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', name.strip()).strip('-')
    return slug.lower() or "page"


def _build_default_routes(component_manifest: Dict[str, Any]) -> Dict[str, Any]:
    pages = component_manifest.get("pages", [])
    if not pages:
        return {
            "routes": [],
            "navigation": [],
            "initialRoute": "/",
            "notFoundPage": None
        }

    routes = []
    navigation_items = []

    for index, page in enumerate(pages):
        page_name = page.get("name", f"Page{index+1}")
        path = "/" if index == 0 else f"/{_slugify(page_name)}"
        route_entry = {
            "name": page_name,
            "path": path,
            "page": page_name,
            "description": page.get("description", f"Auto-generated route for {page_name}"),
            "layout": "MainLayout",
            "guards": [],
            "children": []
        }
        routes.append(route_entry)
        navigation_items.append({
            "label": page_name,
            "path": path,
            "page": page_name
        })

    default_manifest = {
        "routes": routes,
        "navigation": [
            {
                "section": "Main",
                "items": navigation_items
            }
        ],
        "initialRoute": routes[0]["path"],
        "notFoundPage": None
    }
    return default_manifest


def _flatten_routes(routes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    result = []
    for route in routes or []:
        result.append(route)
        result.extend(_flatten_routes(route.get("children", [])))
    return result


def _validate_routing_manifest(routing_manifest: Dict[str, Any], component_manifest: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(routing_manifest, dict):
        raise ValueError("Routing manifest is not a dictionary")

    if "routes" not in routing_manifest or not isinstance(routing_manifest["routes"], list):
        raise ValueError("Routing manifest must include a 'routes' list")

    page_names = {page.get("name") for page in component_manifest.get("pages", []) if page.get("name")}
    invalid_pages = []

    for route in _flatten_routes(routing_manifest.get("routes", [])):
        if not isinstance(route, dict):
            raise ValueError("Each route must be an object")
        if "path" not in route or not isinstance(route["path"], str):
            raise ValueError("Each route must include a string 'path'")
        if "page" not in route or not isinstance(route["page"], str):
            raise ValueError("Each route must include a string 'page'")
        if route["page"] not in page_names:
            invalid_pages.append(route["page"])

        # normalise optional fields
        if "children" in route and not isinstance(route["children"], list):
            raise ValueError(f"Route '{route['path']}' has invalid children format")

    if invalid_pages:
        raise ValueError(f"Routes reference unknown pages: {', '.join(sorted(set(invalid_pages)))}")

    if "navigation" in routing_manifest and not isinstance(routing_manifest["navigation"], list):
        raise ValueError("Navigation must be a list when provided")

    return routing_manifest


def design_routes(project_dir: str, prompt: str, component_manifest: Dict[str, Any]) -> Dict[str, Any]:
    """
    Use LLM to design application routes based on the project prompt and component manifest.
    Returns a routing manifest describing route hierarchy and navigation structure.
    """
    load_dotenv()
    api_key = os.getenv("LLM_KEY")
    model = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
    base_url = os.getenv("LLM_BASE_URL", "")

    if not api_key:
        logger.error("[Router Design Agent] ERROR: LLM_KEY not found in .env")
        return _build_default_routes(component_manifest)

    if base_url:
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
    else:
        client = openai.OpenAI(api_key=api_key)

    page_descriptions = [
        {
            "name": page.get("name"),
            "sections": page.get("sections", []),
            "components": page.get("components", [])
        }
        for page in component_manifest.get("pages", [])
    ]

    system_prompt = (
        "You are a senior React architect responsible for designing routing hierarchy and navigation for a multi-page single-page application. "
        "Output ONLY a JSON object describing the route configuration. Do not include markdown or explanations.\n\n"
        "ROUTING REQUIREMENTS:\n"
        "- Provide a 'routes' array. Each route object must include: name, path (string starting with '/'), page (matching an existing page component), optional layout, description, guards (array), and children (nested routes array).\n"
        "- Provide meaningful paths derived from the page purpose (e.g., '/dashboard', '/products/:productId'). Include dynamic segments where appropriate.\n"
        "- Provide an 'initialRoute' string indicating the default route to render.\n"
        "- Provide a 'notFoundPage' referencing a page for 404 handling if applicable, otherwise null.\n"
        "- Provide a 'navigation' array describing grouped navigation items. "
        "Each group should include a 'section' label and an 'items' array with { label, path, page, icon } entries.\n"
        "- For admin or restricted areas, include guard metadata explaining the requirement (e.g., {\"type\":\"auth\",\"roles\":[\"admin\"]}).\n"
        "- Ensure every referenced page exists in the provided page list.\n"
        "- Use nested children for sub-routes belonging to specific layouts or sections.\n"
        "- Include comments field only if necessary; otherwise keep objects concise.\n"
        "Return JSON in the shape:\n"
        "{\n"
        "  \"routes\": [ ... ],\n"
        "  \"navigation\": [ ... ],\n"
        "  \"initialRoute\": \"/\",\n"
        "  \"notFoundPage\": \"NotFound\"\n"
        "}"
    )

    user_prompt = json.dumps({
        "project_prompt": prompt,
        "pages": page_descriptions
    }, indent=2)

    max_attempts = 3
    attempt = 0
    follow_up_instruction = ""
    last_error = ""

    while attempt < max_attempts:
        attempt += 1
        effective_system_prompt = system_prompt
        if follow_up_instruction:
            effective_system_prompt += f"\n\nThe previous answer was rejected because: {follow_up_instruction}\nPlease correct and try again."

        messages = [
            {"role": "system", "content": effective_system_prompt},
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
            routing_manifest = extract_json_from_llm_output(full_content)
            routing_manifest = _validate_routing_manifest(routing_manifest, component_manifest)
            logger.info(f"[Router Design Agent] Generated routing manifest with {len(routing_manifest.get('routes', []))} top-level routes")
            return routing_manifest
        except Exception as exc:
            last_error = str(exc)
            logger.warning(f"[Router Design Agent] Attempt {attempt} failed: {last_error}")
            follow_up_instruction = last_error

    logger.error(f"[Router Design Agent] ERROR: Failed to design routes after {max_attempts} attempts. Falling back to defaults.")
    return _build_default_routes(component_manifest)
