# CHI26 Image-to-Code Examination

## JSONL Viewer

```bash
cd refactor/diff-viewer
yarn
yarn dev
```

## Dataset Augmentation

### Environment Setup

```bash
cd Flame-Code-VLM
conda env create -n img2code -f environment.yml
conda activate img2code
```

### Dataset Augmentation

Execute from the project root directory.

```bash
PYTHONPATH=$(pwd)/Flame-Code-VLM python3 -B -u Flame-Code-VLM/data_collect/component_collector/variater/variation_waterfall_with_init_code.py \
  --jsonl_path=refactor/samples/output_data_50thread.jsonl \
  --variation_path=output/augmented_jsonl \
  --iter_num=3 \
  --max_system_infer=3
```

### Generate Images

```bash
cd Flame-Code-VLM
yarn
node evaluator/prepareTest/renderTest.js
```

## Complex Project Dataset Sythesizer

### Init

```bash
cd shared-package
npm install
```

### Generate Project



```bash
python multi-agent-react-gen/main.py --prompt-file multi-agent-react-gen/gen-prompt-template/prompt-file-name.txt --output generated-react-app/app-name
```

or

```bash
python multi-agent-react-gen/main.py --prompt "Here is a simple Prompt" --output generated-react-app/app-name
```

### Generate Images

```bash
cd project-renderer
yarn
node render-project.js --project ../generated-react-app/project-name --output ../generated-react-app/images/project-name.png
```

## 新Agent批量生成流程

### 1. 环境变量

`multi-agent-react-gen` 与 `multi-agent-new` 都通过 `.env` 读取 LLM 相关配置，至少需要设置 `LLM_KEY`、`MODEL_NAME` 与 `LLM_BASE_URL`。

### 2. 批量生成需求 Prompt

`generator.py` 默认使用迭代模式，可以通过 `--mode grid` 覆盖用户提供的 Domain×Functionality×Style×Device 组合，并输出到 JSONL 文件：

```bash
python3 multi-agent-react-gen/requirement-gen/generator.py \
  --mode grid \
  --output multi-agent-react-gen/requirement-gen/generated_requirement_grid.jsonl \
  --start-index 0 \
  --end-index 200   # start-index 和 end-index 可选，方便分片
```

### 3. 配置并行批处理（可选）

`multi_agent_batch_runner.py` 能直接读取上一步的 JSONL 文件，并利用 `--processes` 控制并发。建议先 dry-run 确认指令：

```bash
python3 multi_agent_batch_runner.py \
  --requirements-file multi-agent-react-gen/requirement-gen/generated_requirement_grid.jsonl \
  --start-index 0 \
  --limit 5 \
  --processes 4 \
  --output-root generated-react-app/requirements-batch \
  --dry-run
```

### 4. 执行并生成项目

确认无误后去掉 `--dry-run`，脚本会并行调用 `python -m multi_agent_new.cli run`，将每条需求写入独立的输出目录：

```bash
python3 multi_agent_batch_runner.py \
  --requirements-file multi-agent-react-gen/requirement-gen/generated_requirement_grid.jsonl \
  --start-index 0 \
  --limit 5 \
  --processes 4 \
  --output-root generated-react-app/requirements-batch
```

如果需要继续后续批次，可调整 `--start-index`/`--limit` 或在第 2 步就分段生成。所有输出的项目都可以复用前述 `project-renderer` 流程生成截图。
