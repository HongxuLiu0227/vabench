# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard as a React + TypeScript application using Vite.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7): Use `d3-scale`, `d3-axis`, `d3-shape`, `d3-selection`, `d3-array`, `d3-dsv` for visualizations. Do not use high-level chart libraries.
- CSS: Use standard CSS modules or styled-components for layout.

## Data Loading
The application must fetch data from the following URL:
`/data/TEMP_1gmu7581ajjigv161l39r0mgmvpl.csv`

Implement a `useData` hook that:
1. Uses `fetch` to retrieve the CSV.
2. Uses `d3.csvParse` (or similar) to parse the text into an array of objects.
3. Transforms the data to match the TypeScript interface defined below.
4. Calculates the derived field `Weight (kg)` using the formula: `0.453592 * weight`.
5. Returns the transformed data array.

## Data Schema
Define a TypeScript interface `BaseballPlayer` with the following properties:
- `name`: string
- `handedness`: string
- `height`: number
- `weight`: number (lbs)
- `avg`: number (Batting Average)
- `HR`: number (Home Runs)
- `weight_kg`: number (Calculated)

## Dashboard Layout
The dashboard consists of a single main view containing a Scatter Plot and a Filter/Control panel.

**Layout Structure:**
- **Container**: A flex container or CSS Grid.
- **Header**: Title "MadeWithUdacity" (derived from workbook ID) or "Baseball Data Analysis".
- **Main Content**:
  - **Left/Center**: The Scatter Plot visualization.
  - **Right/Bottom**: Controls for filtering specific data subsets (defined below).

## Visualization: Scatter Plot
Create a component `ScatterPlot` that accepts the `data` prop.

**Visual Encodings:**
- **Mark Type**: Circle.
- **X-Axis**: `height` (Height in inches). Range: Dynamic based on data min/max.
- **Y-Axis**: `weight` (Weight in lbs). Range: Dynamic based on data min/max.
- **Color**: Encoded by `name`.
  - **CRITICAL**: The Tableau workbook defines a specific color palette for specific player names. You must implement a color scale that maps specific player names to the hex codes provided in the workbook XML.
  - Example mappings from XML:
    - "Al Luplow": "#499894"
    - "Adolfo Phillips": "#4e79a7"
    - "Al Ferrara": "#59a14f"
    - "Alan Ashby": "#79706e"
    - "Al Oliver": "#86bcb6"
    - "Al Gallagher": "#8cd17d"
    - "Albert Williams": "#9d7660"
    - "Al Bumbry": "#a0cbe8"
    - "Alan Wirth": "#b07aa1"
    - "Al Jones": "#b6992d"
    - "Alan Bannister": "#bab0ac"
    - "Alan Knicely": "#d37295"
    - "Albert Hall": "#d4a6c8"
  - (Note: The XML contains many more mappings. Implement a lookup object for these specific names. If a name is not in the list, assign a default neutral color like `#ccc`).
- **Size**: Constant radius (e.g., 5px).

**Interactions:**
- **Tooltip**: On hover, display a tooltip showing:
  - Name
  - Handedness
  - Height
  - Weight
  - Batting Avg
  - HR
- **Filters**: The chart should react to the filter state passed from the parent component.

## Filters / Logic
The workbook defines specific groups/filters:
1. **"Bad Height"**: Filter logic `AVG([height]) > 73`. (Note: In the context of individual player data, this likely implies filtering for players taller than 73 inches).
2. **"Bad Weight"**: Filter logic `AVG([weight]) > 184`. (Filter for players heavier than 184 lbs).

Implement a control panel (checkboxes or buttons) to toggle these filters:
- "Show Tall Players (>73 inches)"
- "Show Heavy Players (>184 lbs)"

When active, the Scatter Plot should only render points matching the criteria.

## Implementation Details
1. **Scales**: Use `d3.scaleLinear` for X and Y axes. Use `d3.scaleOrdinal` or a custom function for the color mapping.
2. **Axes**: Render axes using `d3.axisBottom` and `d3.axisLeft`. Include labels "Height (inches)" and "Weight (lbs)".
3. **Responsiveness**: The chart should resize with the window. Use `ResizeObserver` or `window.addEventListener('resize')` to update the SVG dimensions.

## Sample Data
```json
[
  {
    "﻿\"\"\"name\"\"\"": "Luis Tiant",
    "\"handedness\"": "R",
    "\"height\"": 72,
    "\"weight\"": 180,
    "\"avg\"": 0.164,
    "\"HR\"": 5,
    "\"Ht Wt ratio (bin)\"": 0.4,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Paul Boris",
    "\"handedness\"": "R",
    "\"height\"": 74,
    "\"weight\"": 200,
    "\"avg\"": 0.0,
    "\"HR\"": 0,
    "\"Ht Wt ratio (bin)\"": 0.37,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Bobby Mitchell",
    "\"handedness\"": "L",
    "\"height\"": 70,
    "\"weight\"": 170,
    "\"avg\"": 0.243,
    "\"HR\"": 3,
    "\"Ht Wt ratio (bin)\"": 0.4,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Jeff Rineer",
    "\"handedness\"": "L",
    "\"height\"": 76,
    "\"weight\"": 205,
    "\"avg\"": 0.0,
    "\"HR\"": 0,
    "\"Ht Wt ratio (bin)\"": 0.37,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Mario Mendoza",
    "\"handedness\"": "R",
    "\"height\"": 71,
    "\"weight\"": 170,
    "\"avg\"": 0.215,
    "\"HR\"": 4,
    "\"Ht Wt ratio (bin)\"": 0.41,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Wes Parker",
    "\"handedness\"": "B",
    "\"height\"": 73,
    "\"weight\"": 180,
    "\"avg\"": 0.267,
    "\"HR\"": 64,
    "\"Ht Wt ratio (bin)\"": 0.4,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Craig Eaton",
    "\"handedness\"": "R",
    "\"height\"": 71,
    "\"weight\"": 175,
    "\"avg\"": 0.0,
    "\"HR\"": 0,
    "\"Ht Wt ratio (bin)\"": 0.4,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Pat Putnam",
    "\"handedness\"": "L",
    "\"height\"": 72,
    "\"weight\"": 205,
    "\"avg\"": 0.255,
    "\"HR\"": 63,
    "\"Ht Wt ratio (bin)\"": 0.35,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Bob Coluccio",
    "\"handedness\"": "R",
    "\"height\"": 71,
    "\"weight\"": 183,
    "\"avg\"": 0.22,
    "\"HR\"": 26,
    "\"Ht Wt ratio (bin)\"": 0.38,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Don Gordon",
    "\"handedness\"": "R",
    "\"height\"": 73,
    "\"weight\"": 175,
    "\"avg\"": 0.0,
    "\"HR\"": 0,
    "\"Ht Wt ratio (bin)\"": 0.41,
    "\"Number of Records\"": 1
  }
]
```

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/TEMP_1gmu7581ajjigv161l39r0mgmvpl.csv

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
const rows = await loadCsv("/data/TEMP_1gmu7581ajjigv161l39r0mgmvpl.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_1229/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Avg. Home Run with Height & Weight 
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[avg:HR:qk]`
- cols_field: `([federated.0cm6yct0ncco8t141ckgf003l5lm].[none:height:ok] / [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:weight:ok])`
- series_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[Action (Handedness,Name)]`
- bar_orientation: `vertical`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Bad/Good Height
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[io:Bad Hight:nk]`
- highlight_fields: [federated.0cm6yct0ncco8t141ckgf003l5lm].[Bad Hight], [federated.0cm6yct0ncco8t141ckgf003l5lm].[io:Bad Hight:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Bad/Good Weight
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[io:Bad Weight:nk]`
- highlight_fields: [federated.0cm6yct0ncco8t141ckgf003l5lm].[io:Bad Weight:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Batting Avg
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[sum:avg:qk]`
- cols_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]`
- series_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk]`
- bar_orientation: `vertical`
- highlight_fields: [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: OverView
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[Multiple Values]`
- cols_field: `([federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk] / [federated.0cm6yct0ncco8t141ckgf003l5lm].[:Measure Names])`
- series_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[:Measure Names]`
- series_order: [federated.0cm6yct0ncco8t141ckgf003l5lm].[sum:avg:qk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[sum:height:qk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[sum:HR:qk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[sum:Number of Records:qk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[sum:Calculation_41447206859923456:qk]
- expected_series_values: [federated.0cm6yct0ncco8t141ckgf003l5lm].[sum:avg:qk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[sum:height:qk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[sum:HR:qk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[sum:Number of Records:qk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[sum:Calculation_41447206859923456:qk]
- highlight_fields: [federated.0cm6yct0ncco8t141ckgf003l5lm].[:Measure Names], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Relation btw Weight and Height
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[io:Bad Weight:nk]`
- highlight_fields: [federated.0cm6yct0ncco8t141ckgf003l5lm].[Bad Hight], [federated.0cm6yct0ncco8t141ckgf003l5lm].[Bad Weight], [federated.0cm6yct0ncco8t141ckgf003l5lm].[io:Bad Weight:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Relation btw Weight and Height with respect to the Handedness
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk]`
- highlight_fields: [federated.0cm6yct0ncco8t141ckgf003l5lm].[io:Bad Weight:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 3
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[Multiple Values]`
- cols_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk]`
- series_field: `[federated.0cm6yct0ncco8t141ckgf003l5lm].[:Measure Names]`
- highlight_fields: [federated.0cm6yct0ncco8t141ckgf003l5lm].[:Measure Names], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Avg. Home Run with Height & Weight , target=Result Of Final Analysis
- Filter 2 (generated): kind=filter_action, source=Relation btw Weight and Height with respect to the Handedness, target=Result Of Final Analysis
## Highlight Bindings
- OverView: [federated.0cm6yct0ncco8t141ckgf003l5lm].[:Measure Names], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]
- Sheet 3: [federated.0cm6yct0ncco8t141ckgf003l5lm].[:Measure Names], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk]
- Batting Avg: [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk]
- Bad/Good Height: [federated.0cm6yct0ncco8t141ckgf003l5lm].[Bad Hight], [federated.0cm6yct0ncco8t141ckgf003l5lm].[io:Bad Hight:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]
- Bad/Good Weight: [federated.0cm6yct0ncco8t141ckgf003l5lm].[io:Bad Weight:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]
- Relation btw Weight and Height: [federated.0cm6yct0ncco8t141ckgf003l5lm].[Bad Hight], [federated.0cm6yct0ncco8t141ckgf003l5lm].[Bad Weight], [federated.0cm6yct0ncco8t141ckgf003l5lm].[io:Bad Weight:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]
- Relation btw Weight and Height with respect to the Handedness: [federated.0cm6yct0ncco8t141ckgf003l5lm].[io:Bad Weight:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]
- Avg. Home Run with Height & Weight : [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:height:ok], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:weight:ok]
- OverView: [federated.0cm6yct0ncco8t141ckgf003l5lm].[:Measure Names]
