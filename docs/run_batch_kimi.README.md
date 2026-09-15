# run_batch_kimi.py

批量运行 `kimi_vision_once` pipeline，将 Tableau dashboard 截图转为 React 代码。

## 基本用法

```bash
# 跑所有项目（串行）
python scripts/eval/run_batch_kimi.py

# 指定输入/输出目录
python scripts/eval/run_batch_kimi.py --input-root input_bench/ours --output-root generated-react-app-v2-gpt

# 只跑指定 id
python scripts/eval/run_batch_kimi.py --ids 121 160 203

# 只跑前 5 个
python scripts/eval/run_batch_kimi.py --limit 5

# 预览将要执行的命令（不实际运行）
python scripts/eval/run_batch_kimi.py --dry-run
```

## 并行执行

```bash
# 4 路并发
python scripts/eval/run_batch_kimi.py --concurrency 4

# 搭配 limit 做小批量测试
python scripts/eval/run_batch_kimi.py --concurrency 3 --limit 9
```

## 失败重试

```bash
# 每个项目失败后最多重试 2 次（backoff: 5s → 10s）
python scripts/eval/run_batch_kimi.py --retries 2

# 并行 + 重试
python scripts/eval/run_batch_kimi.py --concurrency 4 --retries 1
```

## 续跑 & 跳过

脚本用 `_done` 标记文件判断项目是否已完成：
- 成功的项目：输出目录下会写入 `_done` 文件，下次运行自动跳过
- 失败的项目（有部分输出但无 `_done`）：下次运行会自动重跑

```bash
# 默认行为：跳过已完成的项目，重跑失败的项目
python scripts/eval/run_batch_kimi.py

# 强制重跑所有项目（忽略 _done 标记）
python scripts/eval/run_batch_kimi.py --force

# 跳过所有已存在输出目录的项目（不管有没有 _done）
python scripts/eval/run_batch_kimi.py --no-skip-existing
```

## Conda 环境

```bash
# 默认使用 conda env "img2code"
python scripts/eval/run_batch_kimi.py

# 指定其他 conda 环境
python scripts/eval/run_batch_kimi.py --conda-env myenv

# 直接指定 python 路径，绕过 conda run（启动更快）
python scripts/eval/run_batch_kimi.py --conda-python ~/miniconda3/envs/img2code/bin/python

# 不用 conda，直接用当前 python
python scripts/eval/run_batch_kimi.py --no-conda
```

## 错误处理

```bash
# 遇到第一个失败就停止
python scripts/eval/run_batch_kimi.py --stop-on-error

# 调整单项目超时（默认 7200s = 2h）
python scripts/eval/run_batch_kimi.py --timeout 3600
```

## 输出文件

运行后在 `--output-root` 目录下会生成：

| 文件 | 说明 |
|------|------|
| `tableau_dashboard_XXX/` | 每个项目的生成结果 |
| `tableau_dashboard_XXX/_done` | 完成标记（存在即表示该项目跑成功了） |
| `tableau_dashboard_XXX_run.log` | 每个项目的运行日志 |
| `progress.json` | 本次批跑的汇总（状态统计、失败 id 列表、每个项目的详细记录） |

## 信号处理

运行过程中按 `Ctrl+C` 会触发优雅退出：
- 等待当前正在跑的项目完成
- 跳过剩余未开始的项目
- 写入 `progress.json` 后退出

## 全部参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--input-root` | `input_bench/ours` | GT 项目目录 |
| `--output-root` | `generated-react-app-v2-gpt` | 输出目录 |
| `--ids` | 全部 | 只跑指定 id |
| `--limit` | 0 (不限) | 限制项目数量 |
| `--concurrency` | 1 (串行) | 并发数 |
| `--retries` | 0 | 失败重试次数 |
| `--timeout` | 7200 | 单项目超时（秒） |
| `--force` | false | 强制重跑 |
| `--no-skip-existing` | false | 不跳过已存在的输出 |
| `--stop-on-error` | false | 首个失败即停止 |
| `--conda-env` | `img2code` | conda 环境名 |
| `--conda-python` | 空 | conda python 路径（设了就不走 conda run） |
| `--no-conda` | false | 不用 conda |
| `--dry-run` | false | 只打印命令不执行 |
