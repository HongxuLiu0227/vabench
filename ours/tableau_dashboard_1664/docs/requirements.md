# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_1664/docs/mars_dashboard2.twb
Primary data URL: /data/mars_data.csv

## Sample Data (10 rows)
```json
[
  {
    "": 683,
    "earth_date": "2016-03-14",
    "sol": 1281,
    "ls": 122,
    "month": "Month 5",
    "min_temp": -83.0,
    "max_temp": -22.0,
    "pressure": 769.0,
    "Season": "Winter"
  },
  {
    "": 1472,
    "earth_date": "2013-12-06",
    "sol": 474,
    "ls": 58,
    "month": "Month 2",
    "min_temp": -84.0,
    "max_temp": -26.0,
    "pressure": 906.0,
    "Season": "Autumn"
  },
  {
    "": 1857,
    "earth_date": "2012-09-20",
    "sol": 44,
    "ls": 174,
    "month": "Month 6",
    "min_temp": -75.0,
    "max_temp": -10.0,
    "pressure": 757.0,
    "Season": "Winter"
  },
  {
    "": 1645,
    "earth_date": "2013-05-22",
    "sol": 282,
    "ls": 322,
    "month": "Month 11",
    "min_temp": -72.0,
    "max_temp": -2.0,
    "pressure": 856.0,
    "Season": "Summer"
  },
  {
    "": 1199,
    "earth_date": "2014-09-18",
    "sol": 753,
    "ls": 198,
    "month": "Month 7",
    "min_temp": -73.0,
    "max_temp": 8.0,
    "pressure": 800.0,
    "Season": "Spring"
  },
  {
    "": 1109,
    "earth_date": "2014-12-20",
    "sol": 843,
    "ls": 255,
    "month": "Month 9",
    "min_temp": -69.0,
    "max_temp": 1.0,
    "pressure": 916.0,
    "Season": "Spring"
  },
  {
    "": 1689,
    "earth_date": "2013-04-03",
    "sol": 234,
    "ls": 293,
    "month": "Month 10",
    "min_temp": -69.0,
    "max_temp": -4.0,
    "pressure": 890.0,
    "Season": "Summer"
  },
  {
    "": 245,
    "earth_date": "2017-06-19",
    "sol": 1731,
    "ls": 21,
    "month": "Month 1",
    "min_temp": -78.0,
    "max_temp": -24.0,
    "pressure": 857.0,
    "Season": "Autumn"
  },
  {
    "": 835,
    "earth_date": "2015-10-10",
    "sol": 1129,
    "ls": 52,
    "month": "Month 2",
    "min_temp": -80.0,
    "max_temp": -23.0,
    "pressure": 902.0,
    "Season": "Autumn"
  },
  {
    "": 1359,
    "earth_date": "2014-04-07",
    "sol": 593,
    "ls": 112,
    "month": "Month 4",
    "min_temp": -83.0,
    "max_temp": -23.0,
    "pressure": 795.0,
    "Season": "Winter"
  }
]
```

## Data Loading (Full Dataset)
Fetch the full dataset from the URLs under /data/... (Vite public folder) and parse it in the browser.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/mars_data.csv

Example (CSV via fetch):
```ts
async function loadCsv(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const csvText = await res.text();
  // Prefer a robust CSV parser (e.g. PapaParse) for production; keep a minimal parser if needed.
  const [headerLine, ...lines] = csvText.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",").map((h) => h.trim());
  return lines.map((line) => {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

// Default entrypoint
const rows = await loadCsv("/data/mars_data.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_1664/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Sheet 1
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[avg:max_temp:qk]`
- cols_field: `[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:sol:qk]`
- series_field: `[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:Calculation_1174595120371273730:nk]`
- axis_title_rows: Max Temp
- axis_title_cols: Sols Elapsed
- zone: x=425, y=12225, w=78268, h=48764
- highlight_fields: [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:Calculation_1174595120371273730:nk], [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:month:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 2
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[Multiple Values]`
- cols_field: `([federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:month:nk] / [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[:Measure Names])`
- series_field: `[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[:Measure Names]`
- axis_title_rows: Temperature (Celsius)
- zone: x=425, y=60989, w=78268, h=38033
- legend_required: true
- legend_field: `[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[:Measure Names]`
- legend_relative_position: overlay
- highlight_fields: [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[:Measure Names], [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:Calculation_1174595120362745857:qk], [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:month:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 3
- chart_intent: `vertical_ranked_bar`
- rows_field: `([federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[avg:min_temp:qk] + [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[avg:max_temp:qk])`
- cols_field: `[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:month:nk]`
- series_field: `[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[:Measure Names]`
- bar_orientation: `vertical`
- highlight_fields: [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:month:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 4
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[sum:sol:qk]`
- cols_field: `[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:Calculation_1174595120373465091:ok]`
- bar_orientation: `vertical`
- highlight_fields: [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:Calculation_1174595120373465091:ok], [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:Calculation_1174595120373465091:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 5
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[avg:pressure:qk]`
- cols_field: ``
- series_field: `[federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[Action (Month)]`
- axis_title_rows: Pressure (Pa)
- zone: x=78693, y=12225, w=20882, h=86797
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
## Dashboard Actions
- Highlight 1 (generated): kind=highlight_brush, source=Sheet 1, target=Sheet 1
  fields: Sol (group)
- Filter 1 (generated): kind=filter_action, source=Sheet 2, target=Mars: The Next Big Tourist Destination?
## Highlight Bindings
- Sheet 2: [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[:Measure Names]
- Sheet 1: [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:Calculation_1174595120371273730:nk], [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:month:nk]
- Sheet 2: [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[:Measure Names], [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:Calculation_1174595120362745857:qk], [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:month:nk]
- Sheet 3: [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:month:nk]
- Sheet 4: [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:Calculation_1174595120373465091:ok], [federated.0hbn5jb01pcjiv1fjiptj1ctfi58].[none:Calculation_1174595120373465091:qk]
