# Run Pipeline

> 目录说明：批处理脚本在 `scripts/` 下（`build/` 构造、`augment/` 增强、`eval/` 评测、`preprocess/` 预处理）；`agent_pipeline`（构造管道）与 `kimi_vision_once`（单趟评测）为根目录包，均从仓库根目录运行。

## Batch: Single-dashboard projects (serial)

```bash
rm -rf .pipeline_cache/requirement_cache && python scripts/build/run_batch_single.py --output-root generated-react-app

# Run specific ids, force rerun, stop on first failure
python scripts/build/run_batch_single.py --ids 10005 19 --force --stop-on-error
```

## Single project

```bash
rm -rf .pipeline_cache/requirement_cache && python -m agent_pipeline.cli run \
  --tableau "output/dashboard/output_twbx_single/10005_dash_dashboard0.png__dashboard" \
  --output-dir "generated-react-app/tableau_dashboard_10005" \
  --force
```

## Generate .twb Variants

```bash
python scripts/augment/twb_variant_generator.py \
  -i output/dashboard/output_twbx_single/19_dash_dashboard0.png__Nihad_dashboard/Book3.twb \
  -n 3 \
  -o output/twb_variants
```

## Kimi CLI: 单次生成（Gemini 3.1 Pro Preview）

```bash
caffeinate -i python scripts/eval/run_batch_kimi.py --input-root ours --output-root generated-react-app-v2-gemini --model gemini --timeout 1800 --ids 160 1225 --force
```

## Kimi CLI: 带修复链（kimi_loop，⚠️ 该模块尚不存在）

注意：`--pipeline kimi_loop` 当前不可用——`kimi_loop` 模块从未落盘，修复链只有 Claude SDK 版本（`loop/` 包）。
如需要"kimi 驱动 + 修复链"，需先将 `loop/fix_stages.py` 移植到 kimi 驱动。

```bash
caffeinate -i python scripts/eval/run_batch_kimi.py \
  --input-root input_bench/ours \
  --output-root generated-react-app-v2-gemini-3.5-flash-loop \
  --ids 10115 \
  --model gemini \
  --pipeline kimi_loop \
  --timeout 7200 \
  --force
```

## Kimi CLI: 带修复链（kimi_loop）批量运行

```bash
caffeinate -i python scripts/eval/run_batch_kimi.py \
  --input-root input_bench/ours \
  --output-root generated-react-app-v2-gemini-3.5-flash-loop \
  --model gemini \
  --pipeline kimi_loop \
  --timeout 7200
```

## Kimi CLI: Gemini 3.1 Pro Preview 测试（全量 dict 修复）

```bash
python -m kimi_vision_once.cli --gt-dir ours/tableau_dashboard_160 --output-dir generated-react-app-v2-gemini/tableau_dashboard_160 --model gemini --timeout 1800 --force
```
