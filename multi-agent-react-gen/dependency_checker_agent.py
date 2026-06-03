# dependency_checker_agent.py

import re

def check_dependencies(generated_files, allowed_libraries):
    """
    Scan all generated code for forbidden libraries.
    Returns a list of forbidden imports found.
    """
    forbidden = []
    allowed_set = set(allowed_libraries)
    import_re = re.compile(r"import\s+.*?from\s+['\"]([^'\"]+)['\"]")
    for path, content in generated_files.items():
        for match in import_re.finditer(content):
            lib = match.group(1)
            # Ignore relative imports
            if lib.startswith("."):
                continue
            if lib.split("/")[0] not in allowed_set:
                forbidden.append({"file": path, "library": lib})
    return forbidden 