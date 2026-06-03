# Metrics

This package evaluates generated dashboard projects against `samples/ours/*`, treating `ours` as ground truth.

It implements two metrics:

- `S_data`: compares per-view rendered DOM values and normalized SVG geometry between the candidate and the reference dashboard.
- `S_int`: compiles interaction episodes from the reference dashboard by finding click targets that actually change other views, then replays those episodes on the candidate dashboard and checks post-state similarity.

The runtime assumes each dashboard can be served from `dist/` or directly from the project root if `index.html` exists there. Evaluation is browser-based and currently expects Python Playwright to be installed.

Example:

```bash
python3 -m metrics.evaluate \
  --reference-project samples/ours/tableau_dashboard_646 \
  --candidate-project samples/qwen/tableau_dashboard_646
```

Batch evaluation:

```bash
python3 -m metrics.batch_evaluate
```

This discovers all dashboards under `samples/ours`, evaluates the sibling model folders against them, and writes:

- `metrics/output/batch_report.json`
- `metrics/output/batch_summary.csv`
