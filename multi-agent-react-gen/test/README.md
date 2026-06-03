# Code Validation Test

This folder contains test scripts for the code validation step of the multi-agent React generator.

## Test Scripts

### 1. `test_code_validation.py` - Single Project Validation

This script validates an existing React project by treating all files in the `src/` folder as generated files and running the same validation checks used in the main pipeline.

### Usage

```bash
# Basic usage - validate a project
python test_code_validation.py /path/to/react/project

# Save results to JSON file
python test_code_validation.py /path/to/react/project --output results.json

# Enable verbose output
python test_code_validation.py /path/to/react/project --verbose
```

### What it does

1. **Reads project files**: Scans the `src/` directory and loads all files as "generated files"
2. **Extracts allowed libraries**: Reads `package.json` to get the list of allowed dependencies
3. **Runs code validation**: Executes ESLint and TypeScript compiler checks
4. **Checks dependencies**: Scans for forbidden library imports
5. **Reports results**: Displays all issues found and saves detailed results

### Example Output

```
=== Code Validation Test for: /path/to/react/project ===

1. Reading project files from src/ directory...
   Loaded: src/App.tsx
   Loaded: src/main.tsx
   Loaded: src/components/Button.tsx
   Loaded 15 files

2. Extracting allowed libraries from package.json...
   Found 12 allowed libraries from package.json

3. Running code validation (ESLint + TypeScript)...
   [Code Validation Agent] Validating 15 files...
   [Code Validation Agent] Running ESLint...
   [Code Validation Agent] Running TypeScript compiler...

4. Checking for forbidden dependencies...

=== VALIDATION RESULTS ===

✅ No validation issues found!
✅ No forbidden dependencies found!

🎉 SUCCESS: All validation checks passed!
```

### Exit Codes

- `0`: All validation checks passed
- `1`: Issues found or errors occurred

### Requirements

- The project must have a `src/` directory
- The project should have a `package.json` file (optional, but recommended)
- ESLint and TypeScript should be available via `npx` (the script will install them if needed)

### 2. `batch_test.py` - Multiple Projects Validation

This script can test multiple React projects at once and generate a summary report.

```bash
# Test all React projects in a directory
python batch_test.py /path/to/projects/directory

# Save batch results to JSON file
python batch_test.py /path/to/projects/directory --output batch_results.json
```

### 3. `example_usage.py` - Programmatic Usage Example

This script demonstrates how to use the validation functions programmatically in your own code.

```bash
# Run the example
python example_usage.py
```

## Quick Start

1. **Test a single project:**
   ```bash
   python test_code_validation.py /path/to/react/project
   ```

2. **Test multiple projects:**
   ```bash
   python batch_test.py /path/to/projects/directory
   ```

3. **View example usage:**
   ```bash
   python example_usage.py
   ``` 