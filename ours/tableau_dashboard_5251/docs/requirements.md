# Project Requirements

You are an expert React and D3 developer. Your task is to implement a dashboard that exactly replicates the provided Tableau workbook 'ACTION'.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or higher) for visualizations (use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-selection`, `d3-transition`, `d3-dsv`).
- CSS for layout (CSS Grid/Flexbox).

## Data Loading
The application must load data from `/data/NewMostMovie5.csv`.

1.  **Fetch**: Use the native `fetch` API to retrieve the CSV content.
2.  **Parse**: Use `d3.csvParse` to convert the CSV string into an array of objects.
3.  **Type Conversion**: Ensure the following columns are parsed correctly:
    - `ranks`: number
    - `gross`: number
    - `years`: Date object (parse using `d3.timeParse('%Y')` or similar)
    - `studios`: string
    - `titles`: string

## Data Structure
The raw data rows look like this:
```json
{
  "ranks": 1,
  "titles": "Movie Title",
  "studios": "Disney",
  "gross": 500000000,
  "years": "2015-01-01" // or similar Date string
}
```

## Dashboard Layout (Dashboard: 'ACTION')
- **Title**: "Average Gross for the Past 5 Years by Top 10 Highest-Output Movie Distributors (+Disney)"
- **Grid Layout**: Use CSS Grid.
  - The dashboard is divided into two main columns: Left (50%) and Right (50%).
  - **Left Column**: Split vertically into two equal height sections.
    - Top Left: Worksheet `AvgMoviePie`.
    - Bottom Left: Worksheet `DMovie`.
  - **Right Column**: Single section spanning full height.
    - Right: Worksheet `DMovieYear`.

## Color Palette
Use the following exact color mapping for the 'studios' dimension:
```javascript
const colorScale = {
  "Uni.": "#4e79a7",
  "SPC": "#59a14f",
  "Sony": "#76b7b2",
  "KL": "#9c755f",
  "Disney": "#b07aa1",
  "Strand": "#bab0ac",
  "Magn.": "#d37295",
  "Fox": "#e15759",
  "IFC": "#edc948",
  "WB": "#f28e2b",
  "WGUSA": "#ff9da7"
};
```

## Component Specifications

### 1. AvgMoviePie (Top Left)
- **Type**: Pie Chart.
- **Title**: "Average by Studio".
- **Data Logic**:
  - Filter data where `years` is between 2014 and 2018 (inclusive).
  - Group by `studios`.
  - Calculate `AVG(gross)` for each studio.
- **Visual Encoding**:
  - **Angle**: Proportional to `AVG(gross)`.
  - **Color**: Mapped to `studios` using the palette above.
- **Interaction**:
  - **Clicking a slice**: Triggers a global filter action. It should update the application state to set the `selectedStudios` to the clicked studio's name.
  - **Default State**: All studios selected (or null/empty filter).

### 2. DMovie (Bottom Left)
- **Type**: Horizontal Bar Chart.
- **Title**: "Average by Studio".
- **Data Logic**:
  - Filter data based on `selectedStudios` state (from Pie interaction). If empty, show all.
  - Group by `studios`.
  - Calculate `AVG(gross)`.
- **Visual Encoding**:
  - **Y-Axis**: `studios` (Categorical).
  - **X-Axis**: `AVG(gross)` (Quantitative).
  - **Color**: Bars colored by `studios` using the palette.
  - **Sorting**: Sort bars in descending order based on `AVG(gross)`.
  - **Labels**: Display the `AVG(gross)` value at the end of each bar.

### 3. DMovieYear (Right)
- **Type**: Horizontal Bar Chart (Grouped/Nested).
- **Title**: "Average by Studio and Year".
- **Data Logic**:
  - Filter data based on `selectedStudios` state (from Pie interaction). If empty, show all.
  - Group by `studios` and `years` (extract year from date).
  - Calculate `AVG(gross)` for each Studio/Year combination.
- **Visual Encoding**:
  - **X-Axis**: `AVG(gross)` (Quantitative).
  - **Y-Axis**: A combined axis of `studios` and `years`.
    - Primary grouping: `studios`.
    - Secondary grouping (nested inside studio): `years` (2014, 2015, 2016, 2017, 2018).
  - **Color**: Bars colored by `studios` using the palette.
  - **Sorting**: Sort the `studios` groups in descending order based on their overall `AVG(gross)` (consistent with DMovie).
  - **Labels**: Display the `AVG(gross)` value at the end of each bar.

## State Management
- Use React state (e.g., `useState` or Context) to hold the list of `selectedStudios`.
- Initial state should be `null` or `[]` (meaning no filter applied).
- When a slice in `AvgMoviePie` is clicked, update `selectedStudios` to `[clickedStudio]`.
- Pass this filter down to `DMovie` and `DMovieYear` as props.

## Sample Data
```json
[
  {
    "﻿\"\"\"ranks\"\"\"": 406,
    "\"titles\"": "Ready Player One",
    "\"studios\"": "WB",
    "\"gross\"": 137018455,
    "\"years\"": "2018-01-01"
  },
  {
    "﻿\"\"\"ranks\"\"\"": 138,
    "\"titles\"": "Fantastic Beasts and Where To Find Them",
    "\"studios\"": "WB",
    "\"gross\"": 234037575,
    "\"years\"": "2016-01-01"
  },
  {
    "﻿\"\"\"ranks\"\"\"": 4715,
    "\"titles\"": "Thank You for Your Service (2017)",
    "\"studios\"": "Uni.",
    "\"gross\"": 9536300,
    "\"years\"": "2017-01-01"
  },
  {
    "﻿\"\"\"ranks\"\"\"": 3675,
    "\"titles\"": "Seventh Son",
    "\"studios\"": "Uni.",
    "\"gross\"": 17223265,
    "\"years\"": "2015-01-01"
  },
  {
    "﻿\"\"\"ranks\"\"\"": 3638,
    "\"titles\"": "Father Figures",
    "\"studios\"": "WB",
    "\"gross\"": 17501244,
    "\"years\"": "2017-01-01"
  },
  {
    "﻿\"\"\"ranks\"\"\"": 7120,
    "\"titles\"": "The Square",
    "\"studios\"": "Magn.",
    "\"gross\"": 1502347,
    "\"years\"": "2017-01-01"
  },
  {
    "﻿\"\"\"ranks\"\"\"": 10864,
    "\"titles\"": "Results",
    "\"studios\"": "Magn.",
    "\"gross\"": 104507,
    "\"years\"": "2015-01-01"
  },
  {
    "﻿\"\"\"ranks\"\"\"": 8642,
    "\"titles\"": "A Girl Walks Home Alone at Night",
    "\"studios\"": "KL",
    "\"gross\"": 491910,
    "\"years\"": "2014-01-01"
  },
  {
    "﻿\"\"\"ranks\"\"\"": 10914,
    "\"titles\"": "Walking Out",
    "\"studios\"": "IFC",
    "\"gross\"": 101947,
    "\"years\"": "2017-01-01"
  },
  {
    "﻿\"\"\"ranks\"\"\"": 6851,
    "\"titles\"": "Legend",
    "\"studios\"": "Uni.",
    "\"gross\"": 1872994,
    "\"years\"": "2015-01-01"
  }
]
```

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/NewMostMovie5.csv

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
const rows = await loadCsv("/data/NewMostMovie5.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_5251/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: AvgMoviePie
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0mx0qbt16kjcpf139uqn317i6u38].[none:studios:nk]`
- zone: x=800, y=10250, w=49200, h=44375
- legend_required: true
- legend_field: `[federated.0mx0qbt16kjcpf139uqn317i6u38].[none:studios:nk]`
- legend_relative_position: overlay
- highlight_fields: [federated.0mx0qbt16kjcpf139uqn317i6u38].[none:studios:nk], [federated.0mx0qbt16kjcpf139uqn317i6u38].[yr:years:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: DMovie
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0mx0qbt16kjcpf139uqn317i6u38].[avg:gross:qk]`
- cols_field: `[federated.0mx0qbt16kjcpf139uqn317i6u38].[none:studios:nk]`
- series_field: `[federated.0mx0qbt16kjcpf139uqn317i6u38].[none:studios:nk]`
- bar_orientation: `vertical`
- zone: x=800, y=54625, w=49200, h=44375
- highlight_fields: [federated.0mx0qbt16kjcpf139uqn317i6u38].[none:studios:nk], [federated.0mx0qbt16kjcpf139uqn317i6u38].[tyr:years:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: DMovieYear
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0mx0qbt16kjcpf139uqn317i6u38].[avg:gross:qk]`
- cols_field: `([federated.0mx0qbt16kjcpf139uqn317i6u38].[none:studios:nk] * [federated.0mx0qbt16kjcpf139uqn317i6u38].[tyr:years:qk])`
- series_field: `[federated.0mx0qbt16kjcpf139uqn317i6u38].[none:studios:nk]`
- bar_orientation: `vertical`
- axis_title_cols: Years
- zone: x=50000, y=10250, w=49200, h=88750
- highlight_fields: [federated.0mx0qbt16kjcpf139uqn317i6u38].[none:studios:nk], [federated.0mx0qbt16kjcpf139uqn317i6u38].[tyr:years:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter1: kind=filter_action, source=AvgMoviePie, target=ACTION
## Highlight Bindings
- AvgMoviePie: [federated.0mx0qbt16kjcpf139uqn317i6u38].[none:studios:nk]
- AvgMoviePie: [federated.0mx0qbt16kjcpf139uqn317i6u38].[none:studios:nk], [federated.0mx0qbt16kjcpf139uqn317i6u38].[yr:years:ok]
- DMovie: [federated.0mx0qbt16kjcpf139uqn317i6u38].[none:studios:nk], [federated.0mx0qbt16kjcpf139uqn317i6u38].[tyr:years:qk]
- DMovieYear: [federated.0mx0qbt16kjcpf139uqn317i6u38].[none:studios:nk], [federated.0mx0qbt16kjcpf139uqn317i6u38].[tyr:years:qk]
