# Run Pipeline

## Batch: Single-dashboard projects (2 parallel)

```bash
conda run -n img2code python run_batch_single.py --processes 2
```

## Single project

```bash
conda run -n img2code python -m agent_pipeline.cli run \
  --tableau "output/dashboard/output_twbx_single/121_dash_dashboard0.png__Dashboard_201" \
  --output-dir "generated-react-app/tableau_dashboard_121"
```

## Generate .twb Variants

```bash
conda run -n img2code python twb_variant_generator.py \
  -i output/dashboard/output_twbx_single/19_dash_dashboard0.png__Nihad_dashboard/Book3.twb \
  -n 3 \
  -o output/twb_variants
```

## Run Pipeline on Variant

```bash
conda run -n img2code python -m agent_pipeline.cli run \
  --tableau "output/twb_variants/19_var01_warm_sunset_palette" \
  --output-dir "generated-react-app/tableau_dashboard_19_var01"
```
