import ast
import json
import re
import os
try:
    from dotenv import load_dotenv  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    def load_dotenv(*args, **kwargs):  # type: ignore
        return False
from ..logging_config import get_logger
from .code_validation_agent import check_typescript_errors_for_file, validate_code
from .render_agent import render_project

logger = get_logger(__name__)

USING_JSON_MODE = False
USING_PREFIX_MODE = True
PREFIX_KEY = "partial"

VERBOSE = True


def _normalize_json_text(candidate: str) -> str:
    candidate = candidate.strip()
    if not candidate:
        return candidate
    candidate = candidate.replace("\u201c", '"').replace("\u201d", '"')
    candidate = candidate.replace("\u2018", "'").replace("\u2019", "'")
    last_obj = candidate.rfind('}')
    last_arr = candidate.rfind(']')
    last_pos = max(last_obj, last_arr)
    if last_pos != -1:
        candidate = candidate[: last_pos + 1]
    candidate = re.sub(r",(\s*[}\]])", r"\1", candidate)
    candidate = _balance_brackets(candidate)
    return candidate


def _balance_brackets(candidate: str) -> str:
    def balance(s: str, opener: str, closer: str) -> str:
        diff = s.count(opener) - s.count(closer)
        if diff > 0:
            s += closer * diff
        return s

    candidate = balance(candidate, '{', '}')
    candidate = balance(candidate, '[', ']')
    return candidate


def _try_parse_json(candidate: str):
    candidate = candidate.strip()
    if not candidate:
        return None

    attempts = [candidate, _normalize_json_text(candidate)]

    for attempt in attempts:
        try:
            return json.loads(attempt)
        except Exception:
            continue

    for attempt in attempts:
        try:
            obj = ast.literal_eval(attempt)
            if isinstance(obj, (dict, list)):
                return obj
        except Exception:
            continue

    return None

def find_files(file_tree, path, string):
    result = []
    for file_path, file_content in file_tree.items():
        if file_path.startswith(path):
            if string in file_content:
                result.append(file_path)
    return result


def find_files_regex(file_tree, path, regex):
    result = []
    for file_path, file_content in file_tree.items():
        if file_path.startswith(path):
            if re.search(regex, file_content):
                result.append(file_path)
    return result

def extract_json_from_llm_output(text):
    """
    Extracts the first valid JSON object or array from LLM output.
    Handles Markdown code blocks, preambles, and direct JSON.
    """
    if USING_JSON_MODE:
        return json.loads(text)
    
    # 1. Try to extract from a Markdown code block
    md_json = re.search(r"```json\s*([\s\S]+?)\s*```", text, re.IGNORECASE)
    if md_json:
        candidate = md_json.group(1).strip()
        parsed = _try_parse_json(candidate)
        if parsed is not None:
            return parsed

    # 2. Try to extract any JSON object/array in the text
    # Find the first { ... } or [ ... ] block
    obj_match = re.search(r"({[\s\S]+})", text)
    arr_match = re.search(r"(\[[\s\S]+\])", text)
    for match in [obj_match, arr_match]:
        if match:
            candidate = match.group(1)
            parsed = _try_parse_json(candidate)
            if parsed is not None:
                return parsed

    # 3. Try to parse the whole text as JSON
    parsed = _try_parse_json(text)
    if parsed is not None:
        return parsed

    raise ValueError("No valid JSON found in LLM output.")


def is_json_complete(text):
    """
    Checks if the JSON or markdown block in the text is complete (balanced braces/brackets and closed code block).
    """
    if USING_JSON_MODE:
        try:
            json.loads(text)
            return True
        except Exception:
            return False
    
    # Check for markdown code block
    if '```json' in text:
        # If opened, must be closed
        if text.count('```json') > text.count('```') - text.count('```json'):
            return False
    # Check for balanced braces/brackets
    stack = []
    for c in text:
        if c in '{[':
            stack.append(c)
        elif c == '}':
            if not stack or stack[-1] != '{':
                return False
            stack.pop()
        elif c == ']':
            if not stack or stack[-1] != '[':
                return False
            stack.pop()
    return not stack


def last_n_words(text, n=15):
    """
    Returns the last n words of the given text as a string.
    """
    words = re.findall(r'\S+', text)
    return ' '.join(words[-n:]) if words else ''


def remove_overlap(prev, new, max_words=15):
    """
    Removes repeated/overlapping content when appending new LLM output.
    If both prev and new start with ```json, strip the code block markers, merge the content, and re-wrap in a single code block.
    Otherwise, use the original overlap logic.
    """
    prev_strip = prev.strip()
    new_strip = new.strip()
    if prev_strip.startswith('```json') and new_strip.startswith('```json'):
        # Remove code block markers
        prev_content = re.sub(r'^```json\s*', '', prev_strip, flags=re.IGNORECASE)
        prev_content = re.sub(r'```\s*$', '', prev_content)
        new_content = re.sub(r'^```json\s*', '', new_strip, flags=re.IGNORECASE)
        new_content = re.sub(r'```\s*$', '', new_content)
        # Remove overlap
        max_overlap = 0
        max_len = min(len(prev_content), len(new_content))
        for i in range(1, max_len + 1):
            if prev_content[-i:] == new_content[:i]:
                max_overlap = i
        merged = prev_content + new_content[max_overlap:]
        return f'```json\n{merged}\n```'
    else:
        # Original overlap logic
        max_overlap = 0
        max_len = min(len(prev), len(new))
        for i in range(1, max_len + 1):
            if prev[-i:] == new[:i]:
                max_overlap = i
        return prev + new[max_overlap:]


def has_open_json_block(text):
    """
    Returns True if there's an unclosed ```json block in the text.
    """
    opens = [m.start() for m in re.finditer(r'```json', text)]
    closes = [m.start() for m in re.finditer(r'```', text)]
    return len(opens) > len(closes)
    
    
def get_complete_llm_response_with_mcp_v2(messages, model, client, file_tree, max_attempts=3, max_tokens=2048, log_on_failure=True, overlap_words=15):
    """
    Calls the LLM with MCP (Model Context Protocol) support for file reading.
    If the LLM cannot complete the task in one turn, it can request to read files.
    The function handles tool calls and continues the conversation until completion.
    Uses get_complete_llm_response for robust JSON handling.
    
    Args:
        messages: List of message dictionaries
        model: LLM model name
        client: OpenAI client instance
        file_tree: List of available file paths for validation
        max_attempts: Maximum number of conversation turns
        max_tokens: Maximum tokens per response
        log_on_failure: Whether to log failed attempts
        overlap_words: Number of words to consider for overlap removal
    
    Returns:
        str: Complete LLM response
    """
    # Ensure we have a system prompt for MCP functionality
    if not messages or messages[0]["role"] != "system":
        system_prompt = """You are an AI assistant that can read files to help complete tasks. 

If you cannot complete the current task in one response, you can request to use a tool by returning a JSON object in this exact format. Here are the tools you can use:
- read: Read a file
{"response": "tool_call", "tool": "read", "path": "path/to/file"}
- delete: Delete a file
{"response": "tool_call", "tool": "delete", "path": "path/to/file"}
- write: Write to a file
{"response": "tool_call", "tool": "write", "path": "path/to/file", "content": "content_to_write"}
- move: Move a file (can be used for renaming)
{"response": "tool_call", "tool": "move", "path": "path/to/file", "new_path": "path/to/new/file"}
- check_file: Check for TypeScript errors in a file
{"response": "tool_call", "tool": "check_file", "path": "path/to/file"}
- check_project: Check for TypeScript errors in the project
{"response": "tool_call", "tool": "check_project"}
- render: Try render the project and get the feedback
{"response": "tool_call", "tool": "render"}
- nested: Use multiple tools in a single response, tools will be executed in the order they are listed (this tool doesn't allow to nest tools)
{"response": "tool_call", "tool": "nested", "tools": [{"tool": "read", "path": "path/to/file"}, {"tool": "delete", "path": "path/to/file"}]}

Only use this when you need to read a file to continue with the task. Otherwise, provide your complete response as usual.
"""
        messages.insert(0, {"role": "system", "content": system_prompt})
    else:
        # If there's already a system prompt, ensure it includes MCP instructions
        existing_system = messages[0]["content"]
        mcp_instruction = """

IMPORTANT: If you cannot complete the current task in one response, you can request to use a tool by returning a JSON object in this exact format. Here are the tools you can use:
- read: Read a file
{"response": "tool_call", "tool": "read", "path": "path/to/file"}
- delete: Delete a file
{"response": "tool_call", "tool": "delete", "path": "path/to/file"}
- write: Write to a file
{"response": "tool_call", "tool": "write", "path": "path/to/file", "content": "content_to_write"}
- move: Move a file (can be used for renaming)
{"response": "tool_call", "tool": "move", "path": "path/to/file", "new_path": "path/to/new/file"}
- check_file: Check for TypeScript errors in a file
{"response": "tool_call", "tool": "check_file", "path": "path/to/file"}
- check_project: Check for TypeScript errors in the project
{"response": "tool_call", "tool": "check_project"}
- render: Try render the project and get the feedback
{"response": "tool_call", "tool": "render"}
- nested: Use multiple tools in a single response, tools will be executed in the order they are listed (this tool doesn't allow to nest tools)
{"response": "tool_call", "tool": "nested", "tools": [{"tool": "read", "path": "path/to/file"}, {"tool": "delete", "path": "path/to/file"}]}

Only use this when you need to read a file to continue with the task. Otherwise, provide your complete response as usual.
"""
        messages[0]["content"] = mcp_instruction + existing_system
    
    conversation_attempts = 0
    consecutive_read_attempts = 0
    max_consecutive_reads = 5  # Limit consecutive read calls
    
    while conversation_attempts < max_attempts:
        # Use get_complete_llm_response for robust JSON handling
        response_content = get_complete_llm_response(
            messages=messages,
            model=model,
            client=client,
            max_tokens=max_tokens,
        )
        # If we get here, get_complete_llm_response succeeded
        # Check if the response is a tool call
        try:
            tool_call = extract_json_from_llm_output(response_content)
            if isinstance(tool_call, dict) and tool_call.get("response") == "tool_call":
                logger.info(f"[LLM Helper] Tool call: {tool_call}")
                if tool_call.get("tool") == "read":
                    file_path = tool_call.get("path")
                    
                    # Check for too many consecutive read attempts
                    consecutive_read_attempts += 1
                    if consecutive_read_attempts > max_consecutive_reads:
                        logger.warning(f"[LLM Helper] Too many consecutive read attempts ({consecutive_read_attempts}). Breaking infinite loop.")
                        messages.append({
                            "role": "assistant",
                            "content": response_content
                        })
                        messages.append({
                            "role": "user", 
                            "content": f"You have made {consecutive_read_attempts} consecutive read calls. Please proceed to write or check operations instead of reading more files. If you have enough information, apply the fixes directly."
                        })
                        conversation_attempts += 1
                        consecutive_read_attempts = 0  # Reset counter
                        continue
                    
                    # Validate file path
                    if not file_path:
                        messages.append({
                            "role": "assistant",
                            "content": response_content
                        })
                        messages.append({
                            "role": "user", 
                            "content": "Invalid tool call: missing file path. Please provide a valid file path."
                        })
                        conversation_attempts += 1
                        continue
                    
                    # Check if file exists in file_tree
                    if file_tree and file_path not in file_tree:
                        messages.append({
                            "role": "assistant",
                            "content": response_content
                        })
                        messages.append({
                            "role": "user", 
                            "content": f"File '{file_path}' not found in available files."
                        })
                        conversation_attempts += 1
                        continue
                    
                    # Read the file content
                    file_content = file_tree[file_path]
                        
                    messages.append({
                        "role": "user",
                        "content": f"File '{file_path}' content:\n\n{file_content}"
                    })
                    conversation_attempts += 1
                    continue
                elif tool_call.get("tool") == "delete":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    file_path = tool_call.get("path")
                    if file_path:
                        # Delete the file
                        del file_tree[file_path]
                        messages.append({
                            "role": "assistant",
                            "content": response_content
                        })
                        messages.append({
                            "role": "user",
                            "content": f"File '{file_path}' deleted."
                        })
                        conversation_attempts += 1
                        continue
                elif tool_call.get("tool") == "write":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    file_path = tool_call.get("path")
                    content = tool_call.get("content")
                    if file_path and content:
                        file_tree[file_path] = content
                        messages.append({
                            "role": "assistant",
                            "content": response_content
                        })
                        messages.append({
                            "role": "user",
                            "content": f"File '{file_path}' written."
                        })
                        conversation_attempts += 1
                        continue
                elif tool_call.get("tool") == "move":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    file_path = tool_call.get("path")
                    new_path = tool_call.get("new_path")
                    if file_path and new_path:
                        if file_path not in file_tree:
                            messages.append({
                                "role": "assistant",
                                "content": response_content
                            })
                            messages.append({
                                "role": "user",
                                "content": f"File '{file_path}' not found in available files."
                            })
                            conversation_attempts += 1
                            continue
                        if new_path in file_tree:
                            messages.append({
                                "role": "assistant",
                                "content": response_content
                            })
                            messages.append({
                                "role": "user",
                                "content": f"File '{new_path}' already exists in available files."
                            })
                            conversation_attempts += 1
                            continue
                        # Move the file
                        file_tree[new_path] = file_tree.pop(file_path)
                        messages.append({
                            "role": "assistant",
                            "content": response_content
                        })
                        messages.append({
                            "role": "user",
                            "content": f"File '{file_path}' moved to '{new_path}'."
                        })
                        conversation_attempts += 1
                        continue
                elif tool_call.get("tool") == "check_file":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    file_path = tool_call.get("path")
                    if file_path:   
                        # Check for TypeScript errors in the file
                        errors = check_typescript_errors_for_file(file_tree, file_path)
                        messages.append({
                            "role": "assistant",
                            "content": response_content
                        })
                        if errors:
                            messages.append({
                                "role": "user",
                                "content": f"TypeScript errors in '{file_path}':\n{errors}"
                            })
                        else:
                            messages.append({
                                "role": "user",
                                "content": f"No TypeScript errors in '{file_path}'"
                            })
                        conversation_attempts += 1
                        continue
                elif tool_call.get("tool") == "check_project":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    errors = validate_code(None, file_tree)
                    messages.append({
                        "role": "assistant",
                        "content": response_content
                    })
                    if errors:
                        messages.append({
                            "role": "user",
                            "content": f"TypeScript errors in the project:\n{errors}"
                        })
                    else:
                        messages.append({
                            "role": "user",
                            "content": "No TypeScript errors in the project"
                        })
                    conversation_attempts += 1
                    continue
                elif tool_call.get("tool") == "render":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    render_result = render_project(file_tree)
                    messages.append({
                        "role": "assistant",
                        "content": response_content
                    })
                    messages.append({
                        "role": "user",
                        "content": f"Render result:\n{render_result}"
                    })
                    conversation_attempts += 1
                    continue
                elif tool_call.get("tool") == "nested":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    tools = tool_call.get("tools")
                    if tools:
                        messages.append({
                            "role": "assistant",
                            "content": response_content
                        })
                        for tool in tools:
                            if tool.get("tool") == "read":
                                file_path = tool.get("path")
                                if file_path:
                                    # Read the file content
                                    file_content = file_tree[file_path]
                                    messages.append({
                                        "role": "user",
                                        "content": f"File '{file_path}' content:\n\n{file_content}\n\n"
                                    })
                                    continue
                            elif tool.get("tool") == "delete":
                                file_path = tool.get("path")
                                if file_path:
                                    del file_tree[file_path]
                                    messages.append({
                                        "role": "user",
                                        "content": f"File '{file_path}' deleted."
                                    })
                                    continue
                            elif tool.get("tool") == "write":
                                file_path = tool.get("path")
                                content = tool.get("content")
                                if file_path and content:
                                    file_tree[file_path] = content
                                    messages.append({
                                        "role": "user",
                                        "content": f"File '{file_path}' written."
                                    })
                                    continue
                            elif tool.get("tool") == "move":
                                file_path = tool.get("path")
                                new_path = tool.get("new_path")
                                if file_path and new_path:
                                    file_tree[new_path] = file_tree.pop(file_path)
                                    messages.append({
                                        "role": "user",
                                        "content": f"File '{file_path}' moved to '{new_path}'."
                                    })
                                    continue
                            elif tool.get("tool") == "check_file":
                                file_path = tool.get("path")
                                if file_path:
                                    errors = check_typescript_errors_for_file(file_tree, file_path)
                                    if errors:
                                        messages.append({
                                            "role": "user",
                                            "content": f"TypeScript errors in '{file_path}':\n{errors}"
                                        })
                                    else:
                                        messages.append({
                                            "role": "user",
                                            "content": f"No TypeScript errors in '{file_path}'"
                                        })
                                    continue
                            elif tool.get("tool") == "check_project":
                                errors = validate_code(None, file_tree)
                                if errors:
                                    messages.append({
                                        "role": "user",
                                        "content": f"TypeScript errors in the project:\n{errors}"
                                    })
                                else:
                                    messages.append({
                                        "role": "user",
                                        "content": "No TypeScript errors in the project"
                                    })
                                continue
                            elif tool.get("tool") == "render":
                                render_result = render_project(file_tree)
                                messages.append({
                                    "role": "user",
                                    "content": f"Render result:\n{render_result}"
                                })
                                continue
                            else:
                                messages.append({
                                    "role": "assistant",
                                    "content": response_content
                                })
                                messages.append({
                                    "role": "user",
                                    "content": f"Unknown tool: {tool.get('tool')}"
                                })
                                continue
                        conversation_attempts += 1
                        continue
            else:
                return response_content
                    
        except (json.JSONDecodeError, KeyError, TypeError):
            # Not a tool call, this is a complete response
            return response_content
    
    # If we get here, we've exceeded max attempts
    if log_on_failure:
        logger.info("[LLM Helper] LLM output incomplete after max attempts. Final response logged below:")
        try:
            with open("llm_failed_output.json", "w", encoding="utf-8") as f:
                f.write(str(messages))
        except Exception as e:
            logger.info(f"[LLM Helper] Failed to write llm_failed_output.json: {e}")
    
    raise ValueError("LLM output incomplete after max attempts.")
    

def get_complete_llm_response_with_mcp(messages, model, client, file_tree, max_attempts=3, max_tokens=2048, log_on_failure=True, overlap_words=15):
    """
    Calls the LLM with MCP (Model Context Protocol) support for file reading.
    If the LLM cannot complete the task in one turn, it can request to read files.
    The function handles tool calls and continues the conversation until completion.
    Uses get_complete_llm_response for robust JSON handling.
    
    Args:
        messages: List of message dictionaries
        model: LLM model name
        client: OpenAI client instance
        file_tree: List of available file paths for validation
        max_attempts: Maximum number of conversation turns
        max_tokens: Maximum tokens per response
        log_on_failure: Whether to log failed attempts
        overlap_words: Number of words to consider for overlap removal
    
    Returns:
        str: Complete LLM response
    """
    # Ensure we have a system prompt for MCP functionality
    if not messages or messages[0]["role"] != "system":
        system_prompt = """You are an AI assistant with access to file system tools. When you need to interact with files to complete a task, use the appropriate tool by returning a JSON object in the exact format shown below.

AVAILABLE TOOLS:
- read: Read file contents (required properties: response, tool, path)
  {"response": "tool_call", "tool": "read", "path": "path/to/file"}
  
- find: Find files that include the given string in the given path (required properties: response, tool, path, string)
  {"response": "tool_call", "tool": "find", "path": "path/to/folder", "string": "string_to_find"}
  
- find_regex: Find files that match the given regex in the given path (required properties: response, tool, path, regex)
  {"response": "tool_call", "tool": "find_regex", "path": "path/to/folder", "regex": "regex_to_match"}

- write: Write content to a file (required properties: response, tool, path, content)
  {"response": "tool_call", "tool": "write", "path": "path/to/file", "content": "content_to_write"}

- delete: Delete a file (required properties: response, tool, path)
  {"response": "tool_call", "tool": "delete", "path": "path/to/file"}

- move: Move or rename a file (required properties: response, tool, path, new_path)
  {"response": "tool_call", "tool": "move", "path": "path/to/file", "new_path": "path/to/new/file"}

- check: Validate TypeScript syntax in a file (required properties: response, tool, path)
  {"response": "tool_call", "tool": "check", "path": "path/to/file"}

- nested: Execute multiple tools in sequence (required properties: response, tool, tools)
  {"response": "tool_call", "tool": "nested", "tools": [
    {"response": "tool_call", "tool": "read", "path": "path/to/file"},
    {"response": "tool_call", "tool": "write", "path": "path/to/file", "content": "updated_content"}
  ]}

WORKFLOW:
1. Use tools as needed to gather information or make changes
2. When writing files, always use the check tool afterward to validate syntax
3. Provide your final answer following the specific requirements provided later

IMPORTANT: Only the first tool call in response will be handled by the MCP, any other tool calls will be ignored. If you want to execute multiple tools, please use the nested tool. Wrap your output with the markdown JSON code block. Always use the exact JSON format shown above for tool calls. You are allowed to add an optional `plan` field to the tool call to explain your plan after receiving the response from the MCP. """+f"You MUST finish the task in {max_attempts} turns or less."
        messages.insert(0, {"role": "system", "content": system_prompt})
    else:
        # If there's already a system prompt, ensure it includes MCP instructions
        existing_system = messages[0]["content"]
        mcp_instruction = """

AVAILABLE TOOLS:
- read: Read file contents (required properties: response, tool, path)
  {"response": "tool_call", "tool": "read", "path": "path/to/file"}
  
- find: Find files that include the given string in the given path (required properties: response, tool, path, string)
  {"response": "tool_call", "tool": "find", "path": "path/to/find", "string": "string_to_find"}
  
- find_regex: Find files that match the given regex in the given path (required properties: response, tool, path, regex)
  {"response": "tool_call", "tool": "find_regex", "path": "path/to/find", "regex": "regex_to_match"}

- write: Write content to a file (required properties: response, tool, path, content)
  {"response": "tool_call", "tool": "write", "path": "path/to/file", "content": "content_to_write"}

- delete: Delete a file (required properties: response, tool, path)
  {"response": "tool_call", "tool": "delete", "path": "path/to/file"}

- move: Move or rename a file (required properties: response, tool, path, new_path)
  {"response": "tool_call", "tool": "move", "path": "path/to/file", "new_path": "path/to/new/file"}

- check: Validate TypeScript syntax in a file (required properties: response, tool, path)
  {"response": "tool_call", "tool": "check", "path": "path/to/file"}

- nested: Execute multiple tools in sequence (required properties: response, tool, tools)
  {"response": "tool_call", "tool": "nested", "tools": [
    {"response": "tool_call", "tool": "read", "path": "path/to/file"},
    {"response": "tool_call", "tool": "write", "path": "path/to/file", "content": "updated_content"}
  ]}

WORKFLOW:
1. Use tools as needed to gather information or make changes
2. When writing files, always use the check tool afterward to validate syntax
3. Provide your final answer following the specific requirements provided later

IMPORTANT: Only the first tool call in response will be handled by the MCP, any other tool calls will be ignored. If you want to execute multiple tools, please use the nested tool. Wrap your output with the markdown JSON code block. Always use the exact JSON format shown above for tool calls. You are allowed to add an optional `plan` field to the tool call to explain your plan after receiving the response from the MCP. """+f"You MUST finish the task in {max_attempts} turns or less."
        messages[0]["content"] = mcp_instruction + existing_system
    
    conversation_attempts = 0
    consecutive_read_attempts = 0
    max_consecutive_reads = 5  # Limit consecutive read calls
    
    extra_file_updates = {}
    
    while conversation_attempts < max_attempts:
        
        try:
            # Use get_complete_llm_response for robust JSON handling
            response_content = get_complete_llm_response(
                messages=messages,
                model=model,
                client=client,
                max_tokens=max_tokens,
            )
            # If we get here, get_complete_llm_response succeeded
            # Check if the response is a tool call
            tool_call = extract_json_from_llm_output(response_content)
            if isinstance(tool_call, dict) and tool_call.get("response") == "tool_call":
                logger.info(f"[LLM Helper] Tool call: {tool_call}")
                if tool_call.get("tool") == "read":
                    file_path = tool_call.get("path")
                    
                    # Check for too many consecutive read attempts
                    consecutive_read_attempts += 1
                    if consecutive_read_attempts > max_consecutive_reads:
                        logger.warning(f"[LLM Helper] Too many consecutive read attempts ({consecutive_read_attempts}). Breaking infinite loop.")
                        messages.append({
                            "role": "assistant",
                            "content": json.dumps(tool_call)
                        })
                        messages.append({
                            "role": "user", 
                            "content": f"You have made {consecutive_read_attempts} consecutive read calls. Please proceed to write or check operations instead of reading more files. If you have enough information, apply the fixes directly."
                        })
                        conversation_attempts += 1
                        consecutive_read_attempts = 0  # Reset counter
                        continue
                    
                    # Validate file path
                    if not file_path:
                        messages.append({
                            "role": "assistant",
                            "content": json.dumps(tool_call)
                        })
                        messages.append({
                            "role": "user", 
                            "content": "Invalid tool call: missing file path. Please provide a valid file path."
                        })
                        conversation_attempts += 1
                        continue
                    
                    # Check if file exists in file_tree
                    if file_tree and file_path not in file_tree:
                        messages.append({
                            "role": "assistant",
                            "content": json.dumps(tool_call)
                        })
                        messages.append({
                            "role": "user", 
                            "content": f"File '{file_path}' not found in available files."
                        })
                        conversation_attempts += 1
                        continue
                    
                    # Read the file content
                    file_content = file_tree[file_path]
                        
                    messages.append({
                        "role": "user",
                        "content": f"File '{file_path}' content:\n\n{file_content}"
                    })
                    conversation_attempts += 1
                    continue
                elif tool_call.get("tool") == "find":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    path = tool_call.get("path", "")
                    string = tool_call.get("string")
                    if path == "/":
                        path = ""
                    if path and string:
                        files = find_files(file_tree, path, string)
                        messages.append({
                            "role": "assistant",
                            "content": json.dumps(tool_call)
                        })
                        if files:
                            messages.append({
                                "role": "user",
                                "content": f"Files found:\n{files}"
                            })
                        else:
                            messages.append({
                                "role": "user",
                                "content": "No files found"
                            })
                        conversation_attempts += 1
                        continue
                elif tool_call.get("tool") == "find_regex":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    path = tool_call.get("path", "")
                    regex = tool_call.get("regex")
                    if path == "/":
                        path = ""
                    if path and regex:
                        files = find_files_regex(file_tree, path, regex)
                        messages.append({
                            "role": "assistant",
                            "content": json.dumps(tool_call)
                        })
                        if files:
                            messages.append({
                                "role": "user",
                                "content": f"Files found:\n{files}"
                            })
                        else:
                            messages.append({
                                "role": "user",
                                "content": "No files found"
                            })
                        conversation_attempts += 1
                        continue
                elif tool_call.get("tool") == "delete":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    file_path = tool_call.get("path")
                    if file_path:
                        # Delete the file
                        del file_tree[file_path]
                        extra_file_updates[file_path] = ""
                        messages.append({
                            "role": "assistant",
                            "content": json.dumps(tool_call)
                        })
                        messages.append({
                            "role": "user",
                            "content": f"File '{file_path}' deleted."
                        })
                        conversation_attempts += 1
                        continue
                elif tool_call.get("tool") == "write":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    file_path = tool_call.get("path")
                    content = tool_call.get("content")
                    if file_path and content:
                        if not file_path.startswith('src/'):
                            messages.append({
                                "role": "assistant",
                                "content": json.dumps(tool_call)
                            })
                            messages.append({
                                "role": "user",
                                "content": f"Only files in src/ directory can be written."
                            })
                            conversation_attempts += 1
                        else:
                            file_tree[file_path] = content
                            extra_file_updates[file_path] = content
                            messages.append({
                                "role": "assistant",
                                "content": json.dumps(tool_call)
                            })
                            messages.append({
                                "role": "user",
                                "content": f"File '{file_path}' written."
                            })
                            conversation_attempts += 1
                        continue
                elif tool_call.get("tool") == "move":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    file_path = tool_call.get("path")
                    new_path = tool_call.get("new_path")
                    if file_path and new_path:
                        if file_path not in file_tree:
                            messages.append({
                                "role": "assistant",
                                "content": json.dumps(tool_call)
                            })
                            messages.append({
                                "role": "user",
                                "content": f"File '{file_path}' not found in available files."
                            })
                            conversation_attempts += 1
                            continue
                        if new_path in file_tree:
                            messages.append({
                                "role": "assistant",
                                "content": json.dumps(tool_call)
                            })
                            messages.append({
                                "role": "user",
                                "content": f"File '{new_path}' already exists in available files."
                            })
                            conversation_attempts += 1
                            continue
                        # Move the file
                        file_tree[new_path] = file_tree.pop(file_path)
                        extra_file_updates[new_path] = file_tree[new_path]
                        extra_file_updates[file_path] = ""
                        messages.append({
                            "role": "assistant",
                            "content": json.dumps(tool_call)
                        })
                        messages.append({
                            "role": "user",
                            "content": f"File '{file_path}' moved to '{new_path}'."
                        })
                        conversation_attempts += 1
                        continue
                elif tool_call.get("tool") == "check":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    file_path = tool_call.get("path")
                    if file_path:   
                        # Check for TypeScript errors in the file
                        errors = check_typescript_errors_for_file(file_tree, file_path)
                        messages.append({
                            "role": "assistant",
                            "content": json.dumps(tool_call)
                        })
                        messages.append({
                            "role": "user",
                            "content": f"TypeScript errors in '{file_path}':\n{errors}"
                        })
                        conversation_attempts += 1
                        continue
                elif tool_call.get("tool") == "nested":
                    consecutive_read_attempts = 0  # Reset read counter for non-read operations
                    tools = tool_call.get("tools")
                    if tools:
                        messages.append({
                            "role": "assistant",
                            "content": json.dumps(tool_call)
                        })
                        for tool in tools:
                            if tool.get("tool") == "read":
                                file_path = tool.get("path")
                                if file_path:
                                    # Read the file content
                                    file_content = file_tree[file_path]
                                    messages.append({
                                        "role": "user",
                                        "content": f"File '{file_path}' content:\n\n{file_content}\n\n"
                                    })
                                    continue
                            elif tool.get("tool") == "find":
                                path = tool.get("path", "")
                                string = tool.get("string")
                                if path == "/":
                                    path = ""
                                if path and string:
                                    files = find_files(file_tree, path, string)
                                    if files:
                                        messages.append({
                                            "role": "user",
                                            "content": f"Files found:\n{files}"
                                        })
                                    else:
                                        messages.append({
                                            "role": "user",
                                            "content": "No files found"
                                        })
                                    continue
                            elif tool.get("tool") == "find_regex":
                                path = tool.get("path", "")
                                regex = tool.get("regex")
                                if path == "/":
                                    path = ""
                                if path and regex:
                                    files = find_files_regex(file_tree, path, regex)
                                    if files:
                                        messages.append({
                                            "role": "user",
                                            "content": f"Files found:\n{files}"
                                        })
                                    else:
                                        messages.append({
                                            "role": "user",
                                            "content": "No files found"
                                        })
                                    continue
                            elif tool.get("tool") == "delete":
                                file_path = tool.get("path")
                                extra_file_updates[file_path] = ""
                                if file_path:
                                    del file_tree[file_path]
                                    messages.append({
                                        "role": "user",
                                        "content": f"File '{file_path}' deleted."
                                    })
                                    continue
                            elif tool.get("tool") == "write":
                                file_path = tool.get("path")
                                content = tool.get("content")
                                if file_path and content:
                                    if not file_path.startswith('src/'):
                                        messages.append({
                                            "role": "user",
                                            "content": f"Only files in src/ directory can be written."
                                        })
                                        continue
                                    file_tree[file_path] = content
                                    extra_file_updates[file_path] = content
                                    messages.append({
                                        "role": "user",
                                        "content": f"File '{file_path}' written."
                                    })
                                    continue
                            elif tool.get("tool") == "move":
                                file_path = tool.get("path")
                                new_path = tool.get("new_path")
                                if file_path and new_path:
                                    file_tree[new_path] = file_tree.pop(file_path)
                                    extra_file_updates[new_path] = file_tree[new_path]
                                    extra_file_updates[file_path] = ""
                                    messages.append({
                                        "role": "user",
                                        "content": f"File '{file_path}' moved to '{new_path}'."
                                    })
                                    continue
                            elif tool.get("tool") == "check":
                                file_path = tool.get("path")
                                if file_path:
                                    errors = check_typescript_errors_for_file(file_tree, file_path)
                                    messages.append({
                                        "role": "user",
                                        "content": f"TypeScript errors in '{file_path}':\n{errors}"
                                    })
                                    continue
                            else:
                                messages.append({
                                    "role": "assistant",
                                    "content": json.dumps(tool_call)
                                })
                                messages.append({
                                    "role": "user",
                                    "content": f"Unknown tool: {tool.get('tool')}"
                                })
                                continue
                        conversation_attempts += 1
                        continue
            else:
                # Check if this looks like a malformed tool call
                if "tool" in tool_call or "path" in tool_call:
                    logger.warning(f"[LLM Helper] Detected malformed tool call: {tool_call}")
                    
                    # Try to fix common malformed tool call patterns
                    fixed_tool_call = tool_call.copy()
                    
                    # Add missing "response": "tool_call" if it's missing
                    if "response" not in fixed_tool_call:
                        fixed_tool_call["response"] = "tool_call"
                        
                    if "file" in fixed_tool_call and "content" in fixed_tool_call:
                        fixed_tool_call["path"] = fixed_tool_call["file"]
                        del fixed_tool_call["file"]
                    
                    # Handle case where we have path but no tool
                    if "path" in fixed_tool_call and "tool" not in fixed_tool_call:
                        if "content" in fixed_tool_call:
                            fixed_tool_call["tool"] = "write"
                            logger.info(f"[LLM Helper] Assuming malformed tool call is 'write' operation")
                        else:
                            fixed_tool_call["tool"] = "read"
                            logger.info(f"[LLM Helper] Assuming malformed tool call is 'read' operation")
                        
                    
                    # Try to process the fixed tool call
                    if fixed_tool_call.get("response") == "tool_call" and "tool" in fixed_tool_call:
                        logger.info(f"[LLM Helper] Attempting to process fixed tool call: {fixed_tool_call}")
                        
                        # Process the fixed tool call by re-adding it to the conversation
                        if fixed_tool_call.get("tool") == "read":
                            file_path = fixed_tool_call.get("path")
                            if file_path and file_path in file_tree:
                                file_content = file_tree[file_path]
                                messages.append({
                                    "role": "assistant",
                                    "content": json.dumps(fixed_tool_call)
                                })
                                messages.append({
                                    "role": "user",
                                    "content": f"File '{file_path}' content:\n\n{file_content}"
                                })
                                conversation_attempts += 1
                                continue
                            else:
                                messages.append({
                                    "role": "assistant", 
                                    "content": json.dumps(fixed_tool_call)
                                })
                                messages.append({
                                    "role": "user",
                                    "content": f"File '{file_path}' not found in available files."
                                })
                                conversation_attempts += 1
                                continue
                        
                        # For other tool types, let the normal processing handle it
                        # by continuing with the fixed tool_call
                        tool_call = fixed_tool_call
                    else:
                        logger.warning(f"[LLM Helper] Could not fix malformed tool call: {tool_call}")
                        extra_file_updates.update(tool_call)
                        return json.dumps(extra_file_updates)
                else:
                    # Not a tool call, treat as file updates
                    extra_file_updates.update(tool_call)
                    return json.dumps(extra_file_updates)
                    
        except (json.JSONDecodeError, KeyError, TypeError, ValueError):
            # Not a tool call, this is a complete response
            return json.dumps(extra_file_updates)
    
    if extra_file_updates:
        logger.info(f"[LLM Helper] Returning {len(extra_file_updates)} file updates after max attempts")
        return json.dumps(extra_file_updates)
    
    logger.info(f"[LLM Helper] No extra file updates after max attempts. Final response logged below:")
    logger.info(json.dumps(extra_file_updates))
    
    # If we get here, we've exceeded max attempts
    if log_on_failure:
        logger.info("[LLM Helper] LLM output incomplete after max attempts. Final response logged below:")
        try:
            with open("llm_failed_output.json", "w", encoding="utf-8") as f:
                f.write(str(messages))
        except Exception as e:
            logger.info(f"[LLM Helper] Failed to write llm_failed_output.json: {e}")
    
    raise ValueError("LLM output incomplete after max attempts.")
    


def sanitize_message_content(content):
    """
    Sanitize message content to prevent JSON serialization issues.
    """
    if not isinstance(content, str):
        content = str(content)
    
    # Truncate extremely long content
    max_length = 100000  # 100K characters max
    if len(content) > max_length:
        content = content[:max_length] + "\n\n[Content truncated due to length]"
    
    # Replace problematic characters that might break JSON
    # Replace null bytes and other control characters
    content = content.replace('\x00', '').replace('\x08', '').replace('\x0c', '')
    
    return content

def get_complete_llm_response(messages, model, client, max_attempts=3, max_tokens=2048, log_on_failure=True, overlap_words=15, max_retry=1):
    """
    Calls the LLM, checks for completeness, and continues the conversation if needed until output is valid and complete.
    Removes repeated/overlapping content in continuations (by words, up to overlap_words).
    Logs the final response if incomplete after max attempts.
    Returns the full valid output as a string.
    """
    load_dotenv()
    CONTEXT_MULTIPLIER = int(os.getenv("CONTEXT_MULTIPLIER", 1))
    CONTEXT_BASE = int(os.getenv("CONTEXT_BASE", 0))
    
    # Sanitize all message content before sending
    sanitized_messages = []
    for msg in messages:
        sanitized_msg = msg.copy()
        if 'content' in sanitized_msg:
            sanitized_msg['content'] = sanitize_message_content(sanitized_msg['content'])
        sanitized_messages.append(sanitized_msg)
    
    full_content = ''
    for retry in range(max_retry):
        for attempt in range(max_attempts):
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=sanitized_messages,
                    temperature=0,
                    max_tokens=max_tokens * CONTEXT_MULTIPLIER + CONTEXT_BASE,
                    presence_penalty=0.5,
                    **(
                        {
                            'response_format': {
                                'type': 'json_object'
                            }
                        } if USING_JSON_MODE else {}
                    )
                )
            except Exception as e:
                logger.error(f"[LLM Helper] Error calling LLM: {e}")
                # Log only message structure, not full content to avoid huge logs
                message_info = []
                for i, msg in enumerate(messages):
                    content_preview = str(msg.get('content', ''))[:200] + ('...' if len(str(msg.get('content', ''))) > 200 else '')
                    message_info.append(f"Message {i}: role={msg.get('role')}, content_length={len(str(msg.get('content', '')))}, preview={content_preview}")
                logger.error(f"[LLM Helper] Messages info: {message_info}")
                continue
            content = response.choices[0].message.content
            # # If previous output ends with open code block and new starts with ```json, close the previous block
            # if attempt > 0 and has_open_json_block(full_content) and content.strip().startswith('```json'):
            #     full_content += '\n```'  # Close the previous block
            if attempt == 0:
                full_content = content
            else:
                if USING_PREFIX_MODE:
                    full_content = full_content + content
                else:
                    # Use word-based overlap removal
                    full_content = remove_overlap(full_content, content, max_words=overlap_words)
            # Try to extract and parse JSON
            try:
                _ = extract_json_from_llm_output(full_content)
                if VERBOSE:
                    logger.info(f"[LLM Helper] VERBOSE: LLM output: {full_content}")
                return full_content
            except Exception:
                # Check for incomplete markdown or unbalanced braces
                if not is_json_complete(full_content):
                    logger.info(f"[LLM Helper] Output incomplete, requesting continuation (attempt {attempt+1})...")
                    if USING_PREFIX_MODE:
                        # Remove prefix=True from any previous assistant messages
                        for msg in sanitized_messages:
                            if msg.get("role") == "assistant" and PREFIX_KEY in msg:
                                del msg[PREFIX_KEY]
                        
                        # Add new assistant message with prefix=True (only the final one should have it)
                        sanitized_messages.append({"role": "assistant", "content": sanitize_message_content(content), PREFIX_KEY: True})
                    else:
                        # Add a user message to instruct minimal repeat
                        last_words = last_n_words(full_content, n=overlap_words)
                        sanitized_messages.append({"role": "assistant", "content": sanitize_message_content(content)})
                        sanitized_messages.append({
                            "role": "user",
                            "content": sanitize_message_content((
                                f"Continue the value for the current key. Previous output ended with:\n{last_words}\n"
                                f"Only repeat at most the last {overlap_words} words for context. Do not repeat large blocks of code. "
                                f"Output only the remaining content for this value, not the whole file or key."
                            ))
                        })
                    continue
                else:
                    break
        logger.info(f"[LLM Helper] LLM output incomplete after max attempts. Retrying... (attempt {retry+1})")
    if log_on_failure:
        logger.info("[LLM Helper] LLM output incomplete after max attempts. Final response logged below:")
        logger.info(full_content)
        try:
            with open("llm_failed_output.json", "w", encoding="utf-8") as f:
                f.write(full_content)
        except Exception as e:
            logger.info(f"[LLM Helper] Failed to write llm_failed_output.json: {e}")
    raise ValueError("LLM output incomplete after max attempts.") 


def get_complete_llm_response_for_text(messages, model, client, max_attempts=3, max_tokens=2048, log_on_failure=True, overlap_words=15):
    """
    Calls the LLM, checks for completeness, and continues the conversation if needed until output is valid and complete.
    Removes repeated/overlapping content in continuations (by words, up to overlap_words).
    Logs the final response if incomplete after max attempts.
    Returns the full valid output as a string.
    """
    load_dotenv()
    CONTEXT_MULTIPLIER = int(os.getenv("CONTEXT_MULTIPLIER", 1))
    CONTEXT_BASE = int(os.getenv("CONTEXT_BASE", 0))
    
    full_content = ''
    for attempt in range(max_attempts):
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0,
            max_tokens=max_tokens * CONTEXT_MULTIPLIER + CONTEXT_BASE,
            presence_penalty=0.5,
        )
        content = response.choices[0].message.content
        # If previous output ends with open code block and new starts with ```json, close the previous block
        if attempt > 0 and has_open_json_block(full_content) and content.strip().startswith('```json'):
            full_content += '\n```'  # Close the previous block
        if attempt == 0:
            full_content = content
        else:
            # Use word-based overlap removal
            full_content = full_content + content

        if len(content) >= max_tokens:
            if USING_PREFIX_MODE:
                # Remove prefix=True from any previous assistant messages
                for msg in messages:
                    if msg.get("role") == "assistant" and PREFIX_KEY in msg:
                        del msg[PREFIX_KEY]
                
                # Add new assistant message with prefix=True (only the final one should have it)
                messages.append({"role": "assistant", "content": content, PREFIX_KEY: True})
            else:
                messages.append({"role": "assistant", "content": content})
                messages.append({"role": "user", "content": "Continue the text. Do not repeat the same text. Do not output any other text."})
            continue
        else:
            if VERBOSE:
                logger.info(f"[LLM Helper] VERBOSE: LLM output: {content}")
            return full_content

    if log_on_failure:
        logger.info("[LLM Helper] LLM output incomplete after max attempts. Final response logged below:")
        logger.info(full_content)
        try:
            with open("llm_failed_output.json", "w", encoding="utf-8") as f:
                f.write(full_content)
        except Exception as e:
            logger.info(f"[LLM Helper] Failed to write llm_failed_output.json: {e}")
    raise ValueError("LLM output incomplete after max attempts.") 
