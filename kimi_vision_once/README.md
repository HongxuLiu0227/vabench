# Single-Pass Vision Pipeline (Kimi CLI)

This package implements a simplified pipeline that generates a React project in one LLM pass from a GT dashboard project.

A GT project is expected to contain:

1. `docs/image.png`
2. `docs/interaction_contract.json`
3. One or more CSV files under `public/data`

It uses **Kimi Code CLI** as the agent runtime. Model backend is configured via `~/.kimi/config.toml` (supports OpenAI, Anthropic, Google GenAI, and custom providers).

## Prerequisites

Install Kimi Code CLI and configure a model provider:

```bash
curl -LsSf https://code.kimi.com/install.sh | bash
```

Configure `~/.kimi/config.toml` with your model provider. Example using OpenAI compatible endpoint:

```toml
[providers.my-gpt]
type = "openai"
base_url = "https://api.openai.com/v1"
api_key = "sk-your-key"

[models.my-model]
provider = "my-gpt"
model = "gpt-4o"
max_context_size = 200000
capabilities = ["image_in", "tool_use"]

default_model = "my-model"
```

## Run One GT Project

```bash
python -m kimi_vision_once.cli \
  --gt-dir generated-react-app/tableau_dashboard_1473_2 \
  --force
```

## Batch Run Many GT Projects

```bash
python -m kimi_vision_once.batch_cli \
  --gt-root generated-react-app \
  --pattern "tableau_dashboard_*" \
  --force
```

## Outputs

For each generated project:

- Generated React project in the resolved output directory
- `docs/input_manifest.json`
- `docs/data_profile.json`
- `pipeline_logs/first_generation_instruction.txt`
- `pipeline_logs/first_generation.log`
- `pipeline_logs/pipeline_run_summary.json`
