# Multi Agent View (Single-View Pipeline)

`multi_agent_view` is a single-view variant of the existing multi-agent pipeline.

## What it does

1. Enriches your prompt with strict single-view constraints.
2. Scaffolds a fresh empty Vite React + TypeScript project directly in your target output directory.
3. Uses Claude CLI stages to implement one high-quality view on top of that scaffold.
4. Runs bug-fix validation (`pnpm install`, `lint`, `build`, optional `test`).
5. Captures a render screenshot for `/`.

## Run

```bash
python -m multi_agent_view.cli run \
  --prompt "Build an operations command center single-view dashboard with advanced filters and drilldowns" \
  --output-dir generated-react-app/single-view-exp
```

Or with a prompt file:

```bash
python -m multi_agent_view.cli run \
  --prompt-file prompt1.log \
  --output-dir generated-react-app/single-view-exp
```

## Notes

- The output directory must be empty or non-existent. The scaffolder writes a brand-new Vite project into it.
- This pipeline is intentionally constrained to one primary view and should not generate a multi-page route structure.
