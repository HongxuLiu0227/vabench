# Project Requirements

You are an expert React developer. Your task is to implement a dashboard based on the Tableau workbook 'BeforFeedback' using the provided dataset.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7) for visualizations (d3-scale, d3-shape, d3-axis, d3-selection, d3-array)
- CSS Grid/Flexbox for layout
- No external UI component libraries (use standard HTML/CSS for controls).

## Data Loading

The primary data source is located at `/data/TEMP_1f9wqu912jthnc10j3mrn01585hz.csv`.

1.  **Fetch**: Use the native `fetch` API to retrieve the CSV file.
2.  **Parse**: Use `d3-dsv` (e.g., `d3.csvParse`) to parse the CSV string into an array of objects.
3.  **Type Definition**: Define a TypeScript interface `BaseballPlayer` matching the columns:
    ```typescript
    interface BaseballPlayer {
      name: string;
      handedness: string;
      height: number; // inches
      weight: number; // lbs
      avg: number;    // batting average
      HR: number;     // home runs
    }
    ```
4.  **Data Access**: Store the loaded data in a React state (e.g., `const [data, setData] = useState<BaseballPlayer[]>([])`).

## Sample Data

```json
[
  {
    "﻿\"\"\"name\"\"\"": "Jerry Reuss",
    "\"handedness\"": "L",
    "\"height\"": 77,
    "\"weight\"": 200,
    "\"avg\"": 0.167,
    "\"HR\"": 1,
    "\"Ht Wt ratio (bin)\"": 0.38,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Jose Cecena",
    "\"handedness\"": "R",
    "\"height\"": 71,
    "\"weight\"": 180,
    "\"avg\"": 0.0,
    "\"HR\"": 0,
    "\"Ht Wt ratio (bin)\"": 0.39,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Pedro Gonzalez",
    "\"handedness\"": "R",
    "\"height\"": 72,
    "\"weight\"": 176,
    "\"avg\"": 0.244,
    "\"HR\"": 8,
    "\"Ht Wt ratio (bin)\"": 0.4,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Steve Garvey",
    "\"handedness\"": "R",
    "\"height\"": 70,
    "\"weight\"": 192,
    "\"avg\"": 0.294,
    "\"HR\"": 272,
    "\"Ht Wt ratio (bin)\"": 0.36,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Bake McBride",
    "\"handedness\"": "L",
    "\"height\"": 74,
    "\"weight\"": 190,
    "\"avg\"": 0.299,
    "\"HR\"": 63,
    "\"Ht Wt ratio (bin)\"": 0.38,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Don Lock",
    "\"handedness\"": "R",
    "\"height\"": 74,
    "\"weight\"": 195,
    "\"avg\"": 0.238,
    "\"HR\"": 122,
    "\"Ht Wt ratio (bin)\"": 0.37,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "John Lowenstein",
    "\"handedness\"": "L",
    "\"height\"": 72,
    "\"weight\"": 175,
    "\"avg\"": 0.253,
    "\"HR\"": 116,
    "\"Ht Wt ratio (bin)\"": 0.41,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Mickey Rivers",
    "\"handedness\"": "L",
    "\"height\"": 70,
    "\"weight\"": 165,
    "\"avg\"": 0.295,
    "\"HR\"": 61,
    "\"Ht Wt ratio (bin)\"": 0.42,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Claudell Washington",
    "\"handedness\"": "L",
    "\"height\"": 72,
    "\"weight\"": 190,
    "\"avg\"": 0.278,
    "\"HR\"": 164,
    "\"Ht Wt ratio (bin)\"": 0.37,
    "\"Number of Records\"": 1
  },
  {
    "﻿\"\"\"name\"\"\"": "Jeff Holly",
    "\"handedness\"": "L",
    "\"height\"": 77,
    "\"weight\"": 210,
    "\"avg\"": 0.0,
    "\"HR\"": 0,
    "\"Ht Wt ratio (bin)\"": 0.36,
    "\"Number of Records\"": 1
  }
]
```

## Dashboard Layout & Components

The dashboard should be titled "Baseball Data". Use a CSS Grid layout with the following structure:

- **Container**: `display: grid; grid-template-columns: 250px 1fr; height: 100vh;`
- **Sidebar (Left)**: Contains the filter controls.
- **Main Content (Right)**: Contains the visualization charts stacked vertically.

### 1. Filter Component (`HandednessFilter`)
- **Location**: Sidebar.
- **Type**: Checkbox group or Radio buttons.
- **Data Source**: Unique values of the `handedness` field (e.g., 'L', 'R', 'B').
- **Behavior**: Selecting a value filters the data displayed in both charts. Default to all selected.

### 2. Chart 1: Height vs Weight (`HeightWeightScatter`)
- **Type**: Scatter Plot.
- **Dimensions**:
    - X-Axis: `height` (Range: approx 65-80 inches). Label: "Height".
    - Y-Axis: `weight` (Range: approx 150-250 lbs). Label: "Weight".
- **Marks**: Circles.
- **Color Encoding**: **CRITICAL** - The color of the mark is determined by the `name` field. You must implement a specific color scale that maps specific player names to specific hex codes found in the workbook definition. If a name is not in the map, use a default color (e.g., '#ccc').
    - *Example mappings from source:* "Al Luplow": "#499894", "Adolfo Phillips": "#4e79a7", "Al Ferrara": "#59a14f", "Alan Ashby": "#79706e", "Al Oliver": "#86bcb6", "Al Gallagher": "#8cd17d", "Albert Williams": "#9d7660", "Al Bumbry": "#a0cbe8", "Alan Wirth": "#b07aa1", "Al Jones": "#b6992d", "Alan Bannister": "#bab0ac", "Alan Knicely": "#d37295", "Albert Hall": "#d4a6c8". (Include the full mapping logic based on the XML style section).
- **Tooltip**: Display `name`, `handedness`, `height`, `weight`.

### 3. Chart 2: Batting Avg vs Home Runs (`AvgHRScatter`)
- **Type**: Scatter Plot.
- **Dimensions**:
    - X-Axis: `avg` (Range: approx 0.1 - 0.4). Label: "Batting Avg".
    - Y-Axis: `HR` (Range: approx 0 - 50+). Label: "Home Runs".
- **Marks**: Circles.
- **Color Encoding**: Color by `handedness` (e.g., 'L' = Blue, 'R' = Orange, 'B' = Green).
- **Tooltip**: Display `name`, `avg`, `HR`.

## Implementation Details

- **D3 Integration**: Use `useRef` to select SVG elements and `useEffect` to render/update charts when data or filters change.
- **Responsiveness**: Charts should resize to fit their container. Use `ResizeObserver` or `viewBox` for scaling.
- **Styling**: Use clean, sans-serif fonts. Ensure axes have ticks and gridlines for readability.
- **Interactions**:
    - Hovering over a point in one chart should highlight the corresponding point in the other chart (if the player exists in both).
    - Filtering by `handedness` should update both charts immediately.

## Calculated Fields (Optional but Recommended)

- **Weight (kg)**: `weight * 0.453592`. (You may display this in the tooltip if desired, but the chart axes should likely stick to the raw units `height` and `weight` as per the primary dimensions).

## Constraints

- Do not use high-level chart libraries (like Recharts or Nivo). Use D3 primitives.
- Ensure the color mapping for the 'name' field in the Height vs Weight chart is implemented as a lookup object.
- The layout must match the sidebar + main content area description.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/TEMP_1f9wqu912jthnc10j3mrn01585hz.csv

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
const rows = await loadCsv("/data/TEMP_1f9wqu912jthnc10j3mrn01585hz.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_1230/docs/tableau_render_contract.json`
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
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Avg. Home Run with Height & Weight , target=Result Of Final Analysis
- Filter 2 (generated): kind=filter_action, source=Relation btw Weight and Height with respect to the Handedness, target=Result Of Final Analysis
## Highlight Bindings
- OverView: [federated.0cm6yct0ncco8t141ckgf003l5lm].[:Measure Names]
- Avg. Home Run with Height & Weight : [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:height:ok], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:weight:ok]
- OverView: [federated.0cm6yct0ncco8t141ckgf003l5lm].[:Measure Names], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]
- Relation btw Weight and Height: [federated.0cm6yct0ncco8t141ckgf003l5lm].[Bad Hight], [federated.0cm6yct0ncco8t141ckgf003l5lm].[Bad Weight], [federated.0cm6yct0ncco8t141ckgf003l5lm].[io:Bad Weight:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]
- Relation btw Weight and Height with respect to the Handedness: [federated.0cm6yct0ncco8t141ckgf003l5lm].[io:Bad Weight:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:handedness:nk], [federated.0cm6yct0ncco8t141ckgf003l5lm].[none:name:nk]
