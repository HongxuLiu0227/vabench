# Multi-Agent React Dataset Pipeline (Next Generation)

This package contains a redesigned pipeline aimed at consistently producing high-complexity, production-quality React projects that showcase Ant Design patterns. The workflow is structured as a gated assembly line where every stage produces explicit artifacts, records metrics, and can be retried or rolled back in isolation.

All heavy lifting now happens through the Claude Code CLI (pointed at DeepSeek's API) so each stage can perform real edits/test runs directly inside your workspace. The orchestrator simply wires those commands together, tracks telemetry, and enforces quality gates.

## Guiding Principles
- **Quality first:** Requirements, UX flows, data models, and component code go through quality gates that reject vague specs, placeholder content, or insufficient complexity.
- **Deterministic handoffs:** Each stage emits strongly typed artifacts (YAML/JSON/TOML) so downstream agents never guess or re-derive context.
- **Runtime budgets:** Per-stage timeouts and concurrency controls keep total runtime inside a predictable envelope, typically 45–60 minutes for a complex app.
- **Scaffold & prompt caching:** The pipeline seeds a cached Vite template and reuses previous requirement analyses so repeat runs are dramatically faster.
- **Rich AntD usage:** The knowledge library seeds every stage with curated Ant Design idioms, ensuring charts, tables, forms, and layout primitives are used idiomatically.
- **Reusable snippets:** Drop your favourite patterns into `snippets/` and the generator will adapt them when building new components and pages.
- **Observability & recovery:** Fine-grained checkpoints, telemetry, and scorecards make it easy to diagnose failure points or regenerate only the affected stage.

## Pipeline Overview

| Stage | Purpose | Key Outputs | Powered By |
| ----- | ------- | ----------- | ---------- |
| Requirement Enrichment | Expand the raw prompt into a full requirements dossier | `docs/requirements.md`, summary log | Built-in requirement analysis agent (direct LLM call) |
| Project Scaffolder | Copy a cached Vite + React + AntD template for the new project | Baseline project tree | Local scaffold agent + cached template |
| First Generation | Implement initial features on top of scaffolded project | Working project tree with deps installed | Claude CLI executing shell edits/tests |
| Placeholder Fix | Sweep the source tree for TODOs/placeholder UI and replace with realistic data | Updated source files, placeholder report | Claude CLI placeholder remediation workflow |
| Bug Fix | Run lint/tests/build and resolve remaining issues | Lint/test/build logs, final status report | Claude CLI validation + fixes |

Every gate produces actionable diagnostics so agents can regenerate precise segments instead of rerunning the full pipeline.

## Package Layout

```
agent_pipeline/
├── README.md
├── __init__.py
├── config.py
├── logging_config.py
├── cli_runner.py
├── agents/
│   ├── __init__.py
│   ├── code_fixer_agent.py
│   ├── code_validation_agent.py
│   ├── component_generator_agent.py
│   ├── file_structure_agent.py
│   ├── import_resolver_agent.py
│   ├── llm_output_utils.py
│   ├── relationship_refactor_agent.py
│   ├── render_agent.py
│   ├── requirement_analysis_agent.py
│   ├── router_design_agent.py
│   ├── scaffold_agent.py
│   └── structure_planner_agent.py
├── snippets/
│   └── antd-components.tsx
├── pipeline/
│   ├── __init__.py
│   ├── context.py
│   ├── stage.py
│   ├── orchestrator.py
│   ├── gating.py
│   ├── knowledge_base.py
│   ├── metrics.py
│   ├── scheduler.py
│   ├── utils.py
│   └── stages/
│       ├── __init__.py
│       └── claude_cli_stages.py
├── resources/
│   ├── ant_patterns.md
│   └── sample_specs/
│       └── complex_dashboard.json
└── tests/
    ├── __init__.py
    └── test_pipeline_smoke.py
```

> NOTE: Only a subset of these files exist initially. The orchestrator and stage skeletons are implemented so that future agents can focus on business logic without reworking infrastructure.

## Quick Start

```bash
python3 -m agent_pipeline.cli run \
  --prompt "Complex Ant Design operations control center dashboard" \
  --output-dir generated-react-apps/complex-spa
```

### Tableau Mode

If you have a Tableau export directory that contains a `.twb` workbook (and optionally a `data/` folder with CSV/JSON files), you can run the pipeline in Tableau replication mode:

```bash
python3 -m agent_pipeline.cli run \
  --tableau output/dashboard/output_twbx/19_dash_dashboard0.png__Nihad_dashboard \
  --output-dir generated-react-apps/tableau-dashboard
```

In `--tableau` mode, the pipeline uses a Tableau-specific requirement generation agent. It will:
- Read the `.twb` workbook as the seed input.
- Copy full data files from `<tableau-dir>/data` into `<output-dir>/public/data` and describe how to fetch them via `/data/...`.
- Enforce that runtime dashboard data is loaded from `public/data` with `fetch('/data/...')` (not from `src/data` / `src/mocks` mock files).
- Inject 10 randomly sampled rows into the final English prompt to give downstream agents schema awareness without bloating context.

The CLI:
1. Loads `.env` credentials (LLM key, base URL, model name) and runtime configuration.
2. Spins up the orchestrator with telemetry hooks.
3. Executes each stage with enforced timeouts while delegating real editing/testing work to the Claude CLI.
4. Emits a run summary with per-stage metrics and writes packaging metadata to `dataset_bundle/`.

> **Prerequisites:** Node.js (`npm`), access to the shared `shared-package/node_modules`, the `claude` CLI installed locally, a valid LLM credential set in `.env` (`LLM_KEY`, optional `LLM_BASE_URL`, `MODEL_NAME`), and (optionally) a writable cache root (`PIPELINE_CACHE_ROOT`, default `.pipeline_cache`) for template/spec caching.

## Extending the System

- **Adding stages:** Subclass `PipelineStage` and register it in `pipeline/orchestrator.py`.
- **Custom gates:** Implement `BaseGate` and attach it to a stage to enforce new quality metrics (accessibility, performance budgets, etc.).
- **Knowledge updates:** Store curated snippets in `resources/` and expose them via `KnowledgeBase`.
- **Parallel branches:** Use `PipelineScheduler` to run independent stages concurrently (e.g., styling vs. logic).
- **Snippet library:** Place `.tsx`, `.ts`, `.jsx`, `.js`, `.md`, or `.txt` files inside `snippets/` (configurable via `PIPELINE_SNIPPET_ROOT`). Relevant excerpts are fed to the LLM so it can reuse and evolve your hand-crafted components.

## Roadmap

- Connect to the existing Vite renderer for deterministic snapshots.
- Integrate a Playwright-based visual diff runner.
- Support cloud artifact storage for dataset curation.
- Add synthetic journey generators to populate integration tests automatically.

This new architecture is designed to shorten build times drastically while producing richer, production-ready outputs suitable for training or evaluation datasets.
