# Project Requirements

You are an expert React developer. Your task is to implement a dashboard that exactly replicates the provided Tableau workbook.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (use `d3-scale`, `d3-axis`, `d3-shape`, `d3-selection`)
- CSS for styling (CSS Modules or standard CSS)

## Data Loading

The primary data source is located at `/data/TEMP_0ufyovf1yz1z5e10183zt00hd8o2.csv`.

1.  **Fetch the data** using the native `fetch` API inside a `useEffect` hook in your main App component.
2.  **Parse the CSV**. The file is a standard CSV. Based on the workbook definition, the columns map as follows (0-indexed):
    - Index 0: `F1` (Sepal Length, number)
    - Index 1: `F2` (Sepal Width, number)
    - Index 2: `F3` (Petal Length, number)
    - Index 3: `F4` (Petal Width, number)
    - Index 4: `F5` (Class, string)

3.  **Data Transformation**: After parsing, you must augment the data with two calculated fields to match the Tableau logic:
    - **`manualCluster`**: This replicates the "Petal Length & Petal Width (clusters)" calculation from the workbook. It is a lookup based on specific (F3, F4) pairs.
        - If (F3, F4) matches one of the pairs in the "Iris-setosa" list (e.g., 1.0, 0.2), value is "Iris-setosa".
        - If (F3, F4) matches one of the pairs in the "Iris-versicolor" list (e.g., 3.0, 1.1), value is "Iris-versicolor".
        - If (F3, F4) matches one of the pairs in the "Iris-virginica" list (e.g., 4.8, 1.8), value is "Iris-virginica".
        - Else, value is "Not Clustered".
    - **`calculation1`**: Boolean field. Formula: `manualCluster === F5`.
    - **`tableauCluster`**: This replicates the K-Means clustering (k=3) performed by Tableau on fields F3 and F4.
        - Implement a standard K-Means algorithm (or use a lightweight library like `ml-kmeans`) on the `F3` and `F4` values.
        - Assign cluster IDs (1, 2, 3) to each data point.

## Sample Data

```json
[
  {
    "﻿\"\"\"F1\"\"\"": 6.7,
    "\"F2\"": 3.0,
    "\"F3\"": 5.2,
    "\"F4\"": 2.3,
    "\"F5\"": "Iris-virginica"
  },
  {
    "﻿\"\"\"F1\"\"\"": 5.5,
    "\"F2\"": 2.5,
    "\"F3\"": 4.0,
    "\"F4\"": 1.3,
    "\"F5\"": "Iris-versicolor"
  },
  {
    "﻿\"\"\"F1\"\"\"": 5.7,
    "\"F2\"": 2.8,
    "\"F3\"": 4.1,
    "\"F4\"": 1.3,
    "\"F5\"": "Iris-versicolor"
  },
  {
    "﻿\"\"\"F1\"\"\"": 4.8,
    "\"F2\"": 3.4,
    "\"F3\"": 1.9,
    "\"F4\"": 0.2,
    "\"F5\"": "Iris-setosa"
  },
  {
    "﻿\"\"\"F1\"\"\"": 6.9,
    "\"F2\"": 3.1,
    "\"F3\"": 4.9,
    "\"F4\"": 1.5,
    "\"F5\"": "Iris-versicolor"
  },
  {
    "﻿\"\"\"F1\"\"\"": 7.3,
    "\"F2\"": 2.9,
    "\"F3\"": 6.3,
    "\"F4\"": 1.8,
    "\"F5\"": "Iris-virginica"
  },
  {
    "﻿\"\"\"F1\"\"\"": 5.5,
    "\"F2\"": 2.4,
    "\"F3\"": 3.8,
    "\"F4\"": 1.1,
    "\"F5\"": "Iris-versicolor"
  },
  {
    "﻿\"\"\"F1\"\"\"": 5.5,
    "\"F2\"": 4.2,
    "\"F3\"": 1.4,
    "\"F4\"": 0.2,
    "\"F5\"": "Iris-setosa"
  },
  {
    "﻿\"\"\"F1\"\"\"": 5.9,
    "\"F2\"": 3.0,
    "\"F3\"": 4.2,
    "\"F4\"": 1.5,
    "\"F5\"": "Iris-versicolor"
  },
  {
    "﻿\"\"\"F1\"\"\"": 5.4,
    "\"F2\"": 3.7,
    "\"F3\"": 1.5,
    "\"F4\"": 0.2,
    "\"F5\"": "Iris-setosa"
  }
]
```

## Dashboard Layout (Dashboard 1)

The dashboard uses a horizontal layout with a vertical legend strip on the right.

**Container Structure:**
- Use a CSS Grid container.
- Columns: `1fr 1fr 1fr 150px` (The last column is for the legends).
- Rows: `1fr`.
- Gap: `8px` (approximate based on margins in XML).

**Zones:**
1.  **Zone 1 (Left):** "Sheet 1" - Original Cluster
2.  **Zone 2 (Middle):** "Sheet 2" - Tableau Generated Cluster
3.  **Zone 3 (Right):** "Sheet 3" - Original vs Tableau Cluster
4.  **Zone 4 (Far Right):** Vertical container for Color Legends.

## Component Specifications

### 1. Sheet 1: "Original Cluster"
- **Type:** Scatter Plot
- **Data:** Full dataset (filtered by global selection state).
- **Visual Encodings:**
    - X-Axis: `F4` (Petal Width). Scale: Linear.
    - Y-Axis: `F3` (Petal Length). Scale: Linear.
    - Mark: Circle.
    - Color: Encoded by `F5` (Class).
        - "Iris-setosa": `#4e79a7`
        - "Iris-virginica": `#e15759`
        - "Iris-versicolor": `#edc948`
- **Interactions:**
    - Clicking a point triggers the "Filter1" action.
    - This should update a global state `selectedPoints` (or `filterState`) in the App component.
    - The filter applies to the entire dashboard (Sheet 2 and Sheet 3 update).

### 2. Sheet 2: "Tableau Generated Cluster"
- **Type:** Scatter Plot
- **Data:** Full dataset (filtered by global selection state from Sheet 1).
- **Visual Encodings:**
    - X-Axis: `F4` (Petal Width). Scale: Linear.
    - Y-Axis: `F3` (Petal Length). Scale: Linear.
    - Mark: Circle.
    - Color: Encoded by `tableauCluster` (result of K-Means).
        - Map the resulting cluster IDs to the colors defined in the workbook:
            - Cluster 1: `#4e79a7`
            - Cluster 2: `#f28e2b`
            - Cluster 3: `#e15759`
            - (Note: If your K-Means produces different IDs, map them visually to these 3 distinct colors to match the Tableau output).

### 3. Sheet 3: "Original vs Tableau Cluster"
- **Type:** Bar Chart
- **Data:** Full dataset (filtered by global selection state from Sheet 1).
- **Visual Encodings:**
    - X-Axis: `calculation1` (Boolean: True/False).
    - Y-Axis: Count of Records (`SUM(Number of Records)`). Scale: Linear.
    - Mark: Bar (Automatic).
    - Color: Default (or single color).
- **Interactions:** None specific, but reacts to Sheet 1 filter.

### 4. Legends (Right Strip)
- **Legend 1:** Corresponds to Sheet 1 (F5 - Class). Shows colors for Setosa, Virginica, Versicolor.
- **Legend 2:** Corresponds to Sheet 2 (Clusters). Shows colors for Cluster 1, 2, 3.
- Layout: Stacked vertically.

## Implementation Details

- **State Management:** Use React `useState` to hold the raw data and the `activeFilter` (list of selected indices or data points). Pass `activeFilter` down to Sheet 2 and Sheet 3.
- **D3 Integration:** Use `useRef` to select SVG elements. Use `useEffect` to render/update charts when data or filters change.
- **Responsiveness:** The dashboard should fill the available width/height. Use `viewBox` for SVGs to ensure they scale correctly within their grid cells.
- **Styling:** Keep it clean. Use white backgrounds. Ensure axis labels are visible (F3, F4, Class, etc.).

## Summary of Interactions (Filter1)
- **Source:** Sheet 1 (Select marks).
- **Target:** Dashboard 1 (All sheets).
- **Behavior:** When user selects points in Sheet 1, Sheet 2 and Sheet 3 must filter to show only those selected points. If nothing is selected, show all.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/TEMP_0ufyovf1yz1z5e10183zt00hd8o2.csv

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
const rows = await loadCsv("/data/TEMP_0ufyovf1yz1z5e10183zt00hd8o2.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_357/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Sheet 1
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0ndya6j1vn9phi17zlkad0uxvijy].[sum:F3:qk]`
- cols_field: `[federated.0ndya6j1vn9phi17zlkad0uxvijy].[sum:F4:qk]`
- series_field: `[federated.0ndya6j1vn9phi17zlkad0uxvijy].[none:F5:nk]`
- zone: x=21883, y=1351, w=33875, h=97298
- legend_required: true
- legend_field: `[federated.0ndya6j1vn9phi17zlkad0uxvijy].[none:F5:nk]`
- legend_relative_position: right
- highlight_fields: [federated.0ndya6j1vn9phi17zlkad0uxvijy].[none:F5:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 2
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0ndya6j1vn9phi17zlkad0uxvijy].[sum:F3:qk]`
- cols_field: `[federated.0ndya6j1vn9phi17zlkad0uxvijy].[sum:F4:qk]`
- series_field: `[federated.0ndya6j1vn9phi17zlkad0uxvijy].[none:AdhocCluster:1:ok]`
- zone: x=55758, y=1351, w=29696, h=97298
- legend_required: true
- legend_field: `[federated.0ndya6j1vn9phi17zlkad0uxvijy].[none:AdhocCluster:1:ok]`
- legend_relative_position: right
- highlight_fields: [federated.0ndya6j1vn9phi17zlkad0uxvijy].[none:AdhocCluster:1:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 3
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0ndya6j1vn9phi17zlkad0uxvijy].[sum:Number of Records:qk]`
- cols_field: `[federated.0ndya6j1vn9phi17zlkad0uxvijy].[none:Calculation_539869044126969857:nk]`
- bar_orientation: `vertical`
- zone: x=693, y=1351, w=21190, h=97298
- highlight_fields: [federated.0ndya6j1vn9phi17zlkad0uxvijy].[none:Calculation_539869044126969857:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter1: kind=filter_action, source=Dashboard 1, target=Dashboard 1
## Highlight Bindings
- Sheet 1: [federated.0ndya6j1vn9phi17zlkad0uxvijy].[none:F5:nk]
- Sheet 2: [federated.0ndya6j1vn9phi17zlkad0uxvijy].[none:AdhocCluster:1:ok]
- Sheet 3: [federated.0ndya6j1vn9phi17zlkad0uxvijy].[none:Calculation_539869044126969857:nk]
- Sheet 1: [federated.0ndya6j1vn9phi17zlkad0uxvijy].[none:F5:nk]
- Sheet 2: [federated.0ndya6j1vn9phi17zlkad0uxvijy].[none:AdhocCluster:1:ok]
