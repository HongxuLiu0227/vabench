import os
import json
from typing import Dict, Any
try:
    from dotenv import load_dotenv  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    def load_dotenv(*args, **kwargs):  # type: ignore
        return False

try:
    import openai  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    openai = None
from .llm_output_utils import extract_json_from_llm_output, get_complete_llm_response
from ..logging_config import get_logger

logger = get_logger(__name__)


def analyze_requirements(prompt: str) -> Dict[str, str]:
    """
    Analyze the user prompt and enrich it with detailed requirements, clarifications, and design specifications.
    Returns a JSON object with the enriched prompt.
    """
    logger.info(f"[Requirement Analysis Agent] Analyzing requirements for prompt: {prompt[:100]}...")
    
    # Load LLM credentials from .env
    load_dotenv()
    api_key = os.getenv("LLM_KEY")
    model = os.getenv("MODEL_NAME")
    base_url = os.getenv("LLM_BASE_URL")
    
    if not api_key:
        logger.error("[Requirement Analysis Agent] ERROR: LLM_KEY not found in .env")
        return {"enriched_prompt": prompt}

    if openai is None:
        logger.error("[Requirement Analysis Agent] ERROR: openai package not installed; cannot call LLM.")
        return {"enriched_prompt": prompt}
    
    # Create OpenAI client
    if base_url:
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
    else:
        client = openai.OpenAI(api_key=api_key)
    
    # System prompt for requirement analysis
    system_prompt = """You are an expert software requirements analyst specializing in React SINGLE PAGE APPLICATIONS (SPAs). Your job is to analyze user prompts and create EXTREMELY DETAILED, comprehensive requirements for a COMPLETE SINGLE PAGE APPLICATION that contains only one page.

IMPORTANT: You MUST focus on creating requirements for a COMPLETE SINGLE PAGE APPLICATION. This means:
1. The entire application consists of ONE PAGE only
2. All functionality, components, and features are contained within this single page
3. No navigation between different pages - everything happens on one page
4. Focus all your analysis on making this single page application feature-complete and production-ready
5. If the user prompt mentions multiple pages, you should consolidate all the functionality into ONE comprehensive page

Your analysis must be MUCH MORE DETAILED than the original prompt and should include:

1. **Single Page Application Overview**: Comprehensive description of what this single page application does, its purpose, target users, and core value proposition. This is the ENTIRE application, not just one page within a larger app.

2. **Complete Application Functional Requirements**: 
   - Every feature with specific functionality for the entire application
   - All user interactions and workflows within this single page
   - Complete business logic requirements for the application
   - All data validation rules for the application
   - Comprehensive error handling scenarios for the application

3. **Complete Page Layout and UI/UX Specifications**:
   - Detailed single page layout structure that contains ALL application functionality
   - Component placement and hierarchy for the entire application
   - Responsive design breakpoints for the complete application
   - Color schemes and styling requirements for the entire application
   - Typography and spacing guidelines for the complete application
   - Interactive elements and animations for the entire application

4. **Complete Component Architecture and Relationships**:
   - Detailed component hierarchy for the entire single page application
   - All parent-child component relationships within this single page
   - Component props and interfaces for all components
   - Shared state management for the entire application
   - Component communication patterns for all components
   - Reusable component identification for the complete application

5. **Complete Mock Data Structures and Relationships**:
   - Complete data models with all fields needed for the entire application
   - All data relationships and associations for the application
   - Sample data for all entities used in the application
   - Data validation schemas for the complete application
   - API response structures for the entire application
   - Local state data structures for the complete application

6. **Complete Technical Implementation Details**:
   - State management architecture for the entire application
   - No routing needed (single page application)
   - All API integration points for the application
   - Comprehensive error handling strategies for the application
   - Performance optimization requirements for the application
   - Security considerations for the application

7. **Complete User Interface Specifications**:
   - Detailed single page layout that contains ALL application functionality
   - Component specifications for the entire application
   - Form designs and validation for all forms in the application
   - Table structures and data display for all data in the application
   - Modal and dialog requirements for the complete application
   - Loading states and error states for the entire application

8. **Technical Stack and Dependencies for the Complete Application**:
   - Required libraries with specific versions
   - UI component libraries (optional; do not hard-require a specific one unless the user explicitly asks)
   - State management solutions for the entire application
   - Utility libraries for the complete application
   - Visualization libraries (for charting/visual analytics, prefer D3 modules)
   - Development tools

IMPORTANT REQUIREMENTS:
- The enriched prompt should be MUCH LONGER and MORE DETAILED than the original prompt
- Focus on creating a COMPLETE SINGLE PAGE APPLICATION - not one page within a multi-page project
- Fill in ALL missing specifications that would be needed to build a complete single page React application
- Include specific layout requirements, component relationships, mock data structures, and technical details for the ENTIRE application
- Provide realistic sample data and complete data models for the complete application
- Specify detailed component hierarchies and communication patterns for the entire application
- Include comprehensive UI/UX specifications with specific design details for the complete application
- Define complete technical architecture and implementation details for the entire application
- Do NOT mandate a specific UI component library unless explicitly required by the user
- For visualization-heavy requirements, prefer D3-based implementation guidance
- Use modern React patterns with TypeScript
- Include proper state management (Context API or Redux) for the entire application
- Focus on making this single page application feature-complete and production-ready

CRITICAL: You MUST output ONLY a valid JSON object with the following structure:
{{
  "enriched_prompt": "A comprehensive, detailed prompt that includes ALL the specifications above for a COMPLETE SINGLE PAGE APPLICATION in a natural, flowing narrative that can be used by subsequent agents to generate the complete single page application"
}}

The enriched_prompt should be MUCH LONGER and MORE DETAILED than the original prompt. It should include:
- Specific layout requirements for the complete single page application
- Detailed component specifications for the entire application
- Complete mock data structures for the entire application
- Component relationships and hierarchies for the complete application
- UI/UX design details for the entire application
- Technical implementation specifics for the complete application
- All missing requirements that would be needed to build a complete single page React application

Be extremely thorough and detailed. Fill in every missing piece of information that would be needed to build a production-ready single page React application.

DO NOT include any text before or after the JSON object. Only the JSON object itself."""

    # User prompt with the original requirement
    user_prompt = f"""Please analyze the following project requirement and create an EXTREMELY DETAILED requirements document for a COMPLETE SINGLE PAGE APPLICATION:

{prompt}

IMPORTANT REQUIREMENTS:
1. Focus on creating a COMPLETE SINGLE PAGE APPLICATION - not one page within a multi-page project
2. The enriched prompt must be MUCH LONGER and MORE DETAILED than the original prompt
3. Fill in ALL missing specifications that would be needed to build a complete single page React application
4. Include specific layout requirements, component relationships, mock data structures, and technical details for the ENTIRE application
5. Provide realistic sample data and complete data models for the complete application
6. Specify detailed component hierarchies and communication patterns for the entire application
7. Include comprehensive UI/UX specifications with specific design details for the complete application
8. Define complete technical architecture and implementation details for the entire application
9. Do NOT force a specific UI component library unless explicitly requested by the user
10. For visualization requirements, prefer D3-based implementation guidance
11. Use modern React patterns with TypeScript
12. Include proper state management for the entire single page application

The goal is to transform a brief user request into a comprehensive specification for a COMPLETE SINGLE PAGE APPLICATION that contains everything needed to build a production-ready single page React application."""

    # Call LLM
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        response_content = get_complete_llm_response(messages, model, client, max_attempts=3, max_tokens=8192)
        
        # Extract JSON from the response
        try:
            analysis = extract_json_from_llm_output(response_content)
        except Exception as json_error:
            logger.error(f"[Requirement Analysis Agent] ERROR: Failed to parse JSON response: {json_error}")
            logger.error(f"[Requirement Analysis Agent] Raw response preview: {response_content[:500]}...")
            return {"enriched_prompt": prompt}
        
        # Validate response format
        if not isinstance(analysis, dict):
            logger.error(f"[Requirement Analysis Agent] ERROR: Response is not a dictionary, got {type(analysis).__name__}")
            logger.error(f"[Requirement Analysis Agent] Response preview: {str(analysis)[:200]}...")
            return {"enriched_prompt": prompt}
            
        if "enriched_prompt" not in analysis:
            logger.error(f"[Requirement Analysis Agent] ERROR: Response missing 'enriched_prompt' key")
            logger.error(f"[Requirement Analysis Agent] Response keys: {list(analysis.keys()) if isinstance(analysis, dict) else 'N/A'}")
            # Try to extract any text content as fallback
            if isinstance(analysis, dict) and len(analysis) == 1:
                fallback_key = list(analysis.keys())[0]
                logger.info(f"[Requirement Analysis Agent] Using fallback key '{fallback_key}' as enriched_prompt")
                return {"enriched_prompt": str(analysis[fallback_key])}
            return {"enriched_prompt": prompt}
        
        enriched_prompt = analysis["enriched_prompt"]
        
        logger.info(f"[Requirement Analysis Agent] Successfully analyzed requirements")
        
        # Log the level of detail achieved
        original_length = len(prompt)
        enriched_length = len(enriched_prompt)
        detail_ratio = enriched_length / original_length if original_length > 0 else 0
        
        logger.info(f"[Requirement Analysis Agent] Original prompt length: {original_length} characters")
        logger.info(f"[Requirement Analysis Agent] Enriched prompt length: {enriched_length} characters")
        logger.info(f"[Requirement Analysis Agent] Detail expansion ratio: {detail_ratio:.1f}x")
        
        if detail_ratio < 3:
            logger.warning(f"[Requirement Analysis Agent] WARNING: Enriched prompt may not be detailed enough (ratio: {detail_ratio:.1f}x)")
        else:
            logger.info(f"[Requirement Analysis Agent] SUCCESS: Generated comprehensive requirements (ratio: {detail_ratio:.1f}x)")
        
        return {"enriched_prompt": enriched_prompt}
        
    except Exception as e:
        logger.error(f"[Requirement Analysis Agent] ERROR: Failed to analyze requirements: {e}")
        # Return fallback with original prompt
        return {"enriched_prompt": prompt}


def get_enriched_prompt(prompt: str) -> str:
    """
    Convenience function to get just the enriched prompt string.
    """
    result = analyze_requirements(prompt)
    return result["enriched_prompt"] 
