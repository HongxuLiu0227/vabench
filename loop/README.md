# Single-Pass Vision Pipeline

This package implements a simplified pipeline that generates a React project in one LLM pass from a GT dashboard project, then runs a fix chain to clean placeholders, validate the build, and capture render screenshots.

A GT project is expected to contain:

1. `docs/image.png`
2. `docs/interaction_contract.json`
3. One or more CSV files under `public/data`

It uses the existing Claude Code SDK driver and does not modify the original `multi-agent-new` code.

## Run One GT Project

```bash
python -m multi_agent_vision_once.cli \
  --gt-dir d:/tableau/generated-react-app/tableau_dashboard_1473_2 \
  --force
```

If `--output-dir` is omitted, the generated project defaults to:

```text
d:/tableau/generation-app/tableau_dashboard_1473_2
```

You can still use the explicit legacy inputs if needed:

```bash
python -m multi_agent_vision_once.cli \
  --image d:/tableau/generated-react-app/tableau_dashboard_1473_2/docs/image.png \
  --interaction d:/tableau/generated-react-app/tableau_dashboard_1473_2/docs/interaction_contract.json \
  --data-dir d:/tableau/generated-react-app/tableau_dashboard_1473_2/public/data \
  --force
```

## Batch Run Many GT Projects

```bash
python -m multi_agent_vision_once.batch_cli \
  --gt-root d:/tableau/generated-react-app \
  --pattern "tableau_dashboard_*" \
  --force
```

With the default settings above, generated projects will be written under:

```text
d:/tableau/generation-app/
```

Optional batch flags:

- `--output-root`: write all generated projects under a dedicated directory
- `--summary-path`: choose where the batch JSON summary is saved
- `--limit`: only run the first N matched GT projects
- `--fail-fast`: stop on the first failure

## Outputs

For each generated project:

- Generated React project in the resolved output directory
- `docs/input_manifest.json`
- `docs/data_profile.json`
- `pipeline_logs/first_generation_instruction.txt`
- `pipeline_logs/first_generation.log`
- `pipeline_logs/fix_stage_run_context.json`
- `pipeline_logs/placeholder_fix_attempts.json`
- `pipeline_logs/bug_fix_validation.json`
- `pipeline_logs/render_validation.json`
- `pipeline_logs/pipeline_run_summary.json`
- `screenshots/*.png` when render validation succeeds

For batch runs:

- `batch_singlepass_summary.json` under `--gt-root` by default

python -m multi_agent_vision_once.cli \
  --gt-dir generated-react-app/tableau_dashboard_refine5_603 \
  --force

python -m multi_agent_vision_once.batch_cli --gt-root generated-react-app --pattern "tableau_dashboard_*" --force

screen -dmS vision_batch bash -lc 'python -m multi_agent_vision_once.batch_cli --gt-root generated-react-app --pattern "tableau_dashboard_*" --force > vision_batch.log 2>&1'
