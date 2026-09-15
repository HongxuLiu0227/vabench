# Kimi CLI 批量运行命令

## 单个样例测试

```bash
caffeinate -i python run_batch_kimi.py \
  --input-root input_bench/ours \
  --output-root generated-react-app-v2-gemini-3.5-flash \
  --ids 10115 \
  --model gemini \
  --timeout 7200 \
  --force
```

## 批量运行（2 并行）

```bash
caffeinate -i python run_batch_kimi.py \
  --input-root input_bench/ours \
  --output-root generated-react-app-v2-gemini-3.5-flash \
  --model gemini \
  --concurrency 2 \
  --timeout 7200
```

## 批量运行 GPT-5（2 并行）

```bash
caffeinate -i python run_batch_kimi.py \
  --input-root input_bench/ours \
  --output-root generated-react-app-v2-gpt \
  --model gpt5 \
  --concurrency 2 \
  --timeout 7200
```

## 带修复链（kimi_loop）单个测试

```bash
caffeinate -i python run_batch_kimi.py \
  --input-root input_bench/ours \
  --output-root generated-react-app-v2-gemini-3.5-flash-loop \
  --ids 10115 \
  --model gemini \
  --pipeline kimi_loop \
  --timeout 7200 \
  --force
```

## 带修复链（kimi_loop）批量运行

```bash
caffeinate -i python run_batch_kimi.py \
  --input-root input_bench/ours \
  --output-root generated-react-app-v2-gemini-3.5-flash-loop \
  --model gemini \
  --pipeline kimi_loop \
  --timeout 7200
```

## 常用参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--input-root` | GT 项目目录 | `input_bench/ours` |
| `--output-root` | 输出目录 | `generated-react-app-v2-gpt` |
| `--model` | 模型名（对应 `~/.kimi/config.toml`） | `gpt5` |
| `--concurrency` | 并行数 | `1` |
| `--ids` | 指定项目 ID（空格分隔） | 全部 |
| `--limit` | 限制项目数量 | `0`（不限） |
| `--force` | 清空已有输出重跑 | 否 |
| `--retries` | 失败重试次数 | `0` |
| `--timeout` | 单项目超时（秒） | `7200` |
| `--conda-python` | 直接指定 python 路径，跳过 conda run | 空 |
| `--no-conda` | 不使用 conda | 否 |
| `--stop-on-error` | 首个失败即停止 | 否 |
| `--dry-run` | 只打印命令不执行 | 否 |
| `--pipeline` | 选择 pipeline 模块 | `kimi_vision_once` |

`--pipeline` 可选值：
- `kimi_vision_once`：单次生成，无修复链
- `kimi_loop`：生成 + placeholder fix + bug fix 修复链

## 优雅退出

按一次 `Ctrl+C`，等待当前运行中的项目结束后停止，不会启动新项目。

## 模型配置

模型定义在 `~/.kimi/config.toml`，当前可用：

- `gpt5` → GPT-5（通过 4sapi.com 中转）
- `gemini` → Gemini 3.5 Flash（通过 4sapi.com 中转）
