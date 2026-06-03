# multi-agent-react-gen

This module implements a multi-agent system to generate a complete, runnable React project based on a user prompt.

## Overview
- **Scaffold Agent:** Uses Vite to generate the base React project structure (package.json, src/, public/, etc.).
- **Requirement Analysis Agent:** Analyzes and enriches user prompts with detailed requirements, clarifications, and design specifications.
- **File Structure Agent:** Designs and organizes the file/folder structure based on the enriched prompt.
- **Config Agent:** Optimizes and customizes configuration files (e.g., vite.config.ts, tsconfig.json).
- **Package Validator Agent:** Validates packages using npm API, detects deprecated/invalid packages, and fixes them.
- **Structure Planner Agent:** Plans the project/component structure and relationships from the enriched prompt.
- **Component Generator Agent:** Generates code for each page/component based on the planned structure and allowed libraries, including modern CSS styling.
- **Relationship Refactor Agent:** Ensures imports, props, and routing are consistent across all generated files while preserving CSS styling.
- **Import Resolver Agent:** Fixes import paths, resolves missing files, and creates missing components with modern CSS styling.
- **Code Fixer Agent:** Fixes validation issues and dependency problems based on analysis results while preserving CSS styling.
- **Validation Agent:** Runs static analysis (ESLint, TypeScript) on generated code and reports issues.
- **Dependency Checker Agent:** Scans for forbidden libraries and enforces allowed dependencies in generated code.
- **Orchestrator:** Coordinates the workflow and passes context/artifacts between agents.
- **Iterative Validation Loop:** Continuously validates, fixes, and refactors code until all issues are resolved or maximum attempts reached.
- **Robust LLM Output Handling:** Multi-turn completion, overlap removal, markdown code block handling, and logging of failed outputs ensure reliable parsing and recovery from LLM quirks.

## Usage
1. Run the orchestrator (main.py) with your project prompt.
2. The system will scaffold a new Vite-based React project, optimize configs, design the file structure, and generate code for each page/component.
3. The output is a complete, runnable React project in a new directory.

## Note
- The `gen-react-workflow` submodule is used as-is and should not be modified directly.
- This system is extensible: you can add more agents for further optimization or customization. 