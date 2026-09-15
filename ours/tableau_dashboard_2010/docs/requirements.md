# Project Requirements

You are a senior React engineer tasked with recreating a specific Tableau dashboard ('Dashboard 1') using React, TypeScript, Vite, and D3.js.

## 1. Project Setup & Tech Stack
- **Framework:** React 18+ with TypeScript.
- **Build Tool:** Vite.
- **Visualization:** D3.js (v7+). Use `d3-scale`, `d3-axis`, `d3-array`, `d3-shape`, and `d3-dsv` for data handling and rendering. Do not use high-level chart libraries like Recharts or Nivo unless necessary for complex interactions; prefer building SVGs with D3 primitives.
- **Styling:** CSS Modules or Tailwind CSS (optional, but keep styling inline or modular). Ensure the layout matches the Tableau grid structure.

## 2. Data Loading & Transformation

### Data Source
- **File:** `a_b_testing_data.csv`
- **URL:** `/data/a_b_testing_data.csv`

### Implementation Instructions
1.  Create a utility function `useData` or `loadData` that fetches the CSV using `d3.csv()`.
2.  **Type Definitions:** Define a TypeScript interface `ABTestingData` matching the CSV columns:
    - `client_id`: number
    - `visitor_id`: string
    - `visit_id`: string
    - `process_step`: string ('start', 'step_1', 'step_2', 'step_3', 'confirm')
    - `date_time`: string (parse to Date object)
    - `clnt_tenure_yr`: number
    - `clnt_tenure_mnth`: number
    - `clnt_age`: number
    - `gendr`: string ('U', 'M', 'F', 'X')
    - `num_accts`: number
    - `bal`: number
    - `calls_6_mnth`: number
    - `logons_6_mnth`: number
    - `Variation`: string ('Control', 'Test', 'Unknown')

3.  **Data Transformation:** Upon loading, augment the data with a calculated field `age_group` based on `clnt_age`:
    - 17.0 - 30.5: "Age 17-30"
    - 31.0 - 40.5: "Age 31-40"
    - 41.0 - 55.5: "Age 41-55"
    - 56.0 - 70.5: "Age 56-70"
    - Else: "Age 71 and above"

4.  **Aggregation Logic:** Implement helper functions to aggregate data (e.g., `countBy`, `avgBy`) using `d3.rollup` or `Array.reduce` to prepare data for the charts.

### Sample Data
```json
[
  {
    "client_id": 1115525,
    "visitor_id": 33355571838122003793,
    "visit_id": 31867781560281784530446198,
    "process_step": "step_2",
    "date_time": "5/6/17 14:30",
    "clnt_tenure_yr": 16,
    "clnt_tenure_mnth": 202,
    "clnt_age": 46,
    "gendr": "M",
    "num_accts": 2,
    "bal": 110332.95,
    "calls_6_mnth": 3,
    "logons_6_mnth": 6,
    "Variation": "Test"
  },
  {
    "client_id": 2309549,
    "visitor_id": 98124544440394749144,
    "visit_id": 7335192665931281615499737,
    "process_step": "start",
    "date_time": "3/31/17 19:19",
    "clnt_tenure_yr": 5,
    "clnt_tenure_mnth": 67,
    "clnt_age": 52,
    "gendr": "M",
    "num_accts": 3,
    "bal": 44529.04,
    "calls_6_mnth": 6,
    "logons_6_mnth": 9,
    "Variation": "Test"
  },
  {
    "client_id": 7576316,
    "visitor_id": 49869306099638058386,
    "visit_id": 42599888049814029300652106,
    "process_step": "step_3",
    "date_time": "4/2/17 16:43",
    "clnt_tenure_yr": 14,
    "clnt_tenure_mnth": 176,
    "clnt_age": 73.5,
    "gendr": "F",
    "num_accts": 2,
    "bal": 118186.95,
    "calls_6_mnth": 2,
    "logons_6_mnth": 5,
    "Variation": "Control"
  },
  {
    "client_id": 2667550,
    "visitor_id": 87784973340255061893,
    "visit_id": 3180206086854158179955537,
    "process_step": "confirm",
    "date_time": "4/13/17 11:09",
    "clnt_tenure_yr": 8,
    "clnt_tenure_mnth": 105,
    "clnt_age": 54.5,
    "gendr": "F",
    "num_accts": 2,
    "bal": 46920.46,
    "calls_6_mnth": 1,
    "logons_6_mnth": 4,
    "Variation": "Test"
  },
  {
    "client_id": 2118118,
    "visitor_id": 23466939983082736894,
    "visit_id": 45673053127900231859302752,
    "process_step": "start",
    "date_time": "4/12/17 19:19",
    "clnt_tenure_yr": 8,
    "clnt_tenure_mnth": 97,
    "clnt_age": 25,
    "gendr": "U",
    "num_accts": 2,
    "bal": 33199.46,
    "calls_6_mnth": 6,
    "logons_6_mnth": 9,
    "Variation": "Test"
  },
  {
    "client_id": 8684880,
    "visitor_id": 8304116526216433314,
    "visit_id": 19794574614386000220954049,
    "process_step": "start",
    "date_time": "4/9/17 11:01",
    "clnt_tenure_yr": 9,
    "clnt_tenure_mnth": 118,
    "clnt_age": 63.5,
    "gendr": "M",
    "num_accts": 2,
    "bal": 54259.91,
    "calls_6_mnth": 5,
    "logons_6_mnth": 8,
    "Variation": "Control"
  },
  {
    "client_id": 9664478,
    "visitor_id": 57846913855620610094,
    "visit_id": 267251551590298280883509,
    "process_step": "start",
    "date_time": "4/2/17 23:17",
    "clnt_tenure_yr": 9,
    "clnt_tenure_mnth": 114,
    "clnt_age": 61,
    "gendr": "F",
    "num_accts": 2,
    "bal": 49245.3,
    "calls_6_mnth": 2,
    "logons_6_mnth": 5,
    "Variation": "Control"
  },
  {
    "client_id": 3667191,
    "visitor_id": 44864130686518071439,
    "visit_id": 29127711573274009978907118,
    "process_step": "step_2",
    "date_time": "4/9/17 12:01",
    "clnt_tenure_yr": 11,
    "clnt_tenure_mnth": 140,
    "clnt_age": 44.5,
    "gendr": "F",
    "num_accts": 3,
    "bal": 282886.28,
    "calls_6_mnth": 2,
    "logons_6_mnth": 5,
    "Variation": "Test"
  },
  {
    "client_id": 86877,
    "visitor_id": 81683433874160924176,
    "visit_id": 3761854792916428039619239,
    "process_step": "step_3",
    "date_time": "5/4/17 13:57",
    "clnt_tenure_yr": 4,
    "clnt_tenure_mnth": 58,
    "clnt_age": 28,
    "gendr": "U",
    "num_accts": 2,
    "bal": 40308.74,
    "calls_6_mnth": 1,
    "logons_6_mnth": 4,
    "Variation": "Test"
  },
  {
    "client_id": 8199837,
    "visitor_id": 84014494137437689248,
    "visit_id": 4921161443314286433820641,
    "process_step": "step_1",
    "date_time": "4/5/17 11:26",
    "clnt_tenure_yr": 7,
    "clnt_tenure_mnth": 94,
    "clnt_age": 22.5,
    "gendr": "M",
    "num_accts": 4,
    "bal": 69973.11,
    "calls_6_mnth": 5,
    "logons_6_mnth": 8,
    "Variation": "Control"
  }
]
```

## 3. Dashboard Layout

**Container:** `Dashboard 1`
- **Size:** Fixed aspect ratio or responsive container approximating 1000x800px.
- **Grid Structure:** CSS Grid with 2 columns and 2 rows.
    - **Top-Left:** Sheet ` Number of participants` (Title: "Participants at Each Stage: Control vs Test")
    - **Top-Right:** Sheet `total number of participants` (Title: "Total Number of Participants: Control vs Test")
    - **Bottom-Left:** Sheet `balance vs age (2)` (Title: "Group 1 Age: Balance Filter Above Average")
    - **Bottom-Right:** Sheet `gender %` (Title: "Total Number of Participants per Gender: Control vs Test")

## 4. Component Specifications

### Component: `ParticipantsStageChart` (Top-Left)
- **Type:** Grouped Bar Chart.
- **Data Source:** Full dataset, filtered by `process_step` (all steps) and `Variation` (via Action Filter).
- **Dimensions:**
    - X-Axis: `process_step` (Manual Sort Order: 'start', 'step_1', 'step_2', 'step_3', 'confirm').
    - Color/Group: `Variation`.
- **Measures:**
    - Y-Axis: Count of `client_id`.
- **Visuals:**
    - Bars for 'Control' and 'Test' side-by-side.
    - Labels: Show count on top of bars.
- **Interactions:** Updates when the global `Variation` filter changes (triggered by Top-Right chart).

### Component: `TotalParticipantsChart` (Top-Right)
- **Type:** Bar Chart.
- **Data Source:** Full dataset, filtered by `process_step` = 'start'.
- **Dimensions:**
    - X-Axis: `Variation`.
- **Measures:**
    - Y-Axis: Count of `client_id`.
- **Visuals:**
    - Simple bars.
    - Labels: Show count on top of bars.
- **Interactions:**
    - **Click Action:** Clicking a bar (e.g., 'Test') sets a global state `selectedVariation`. This state filters the `ParticipantsStageChart` (Top-Left) and `GenderPercentChart` (Bottom-Right). Clicking the background or the same bar again should reset the filter (show all).

### Component: `BalanceAgeTable` (Bottom-Left)
- **Type:** Data Table (Text Table).
- **Title:** "Group 1 Age: Balance Filter Above Average"
- **Data Source:** Full dataset.
- **Hard Filters (Applied in data preparation):**
    - `Variation` = 'Test'
    - `age_group` = 'Age 17-30'
    - `process_step` = 'start'
    - `gendr` in ('F', 'M')
    - **Calculated Filter:** `Delta` >= 0.
        - Logic: Calculate `AvgGroupBalance` = Average of `bal` for the specific `age_group` (17-30). Then `Delta` = `bal` - `AvgGroupBalance`. Filter rows where `Delta` >= 0.
- **Columns:**
    - `client_id`
    - `AVG(bal)` (Individual Balance)
    - `Avg. Group Balance` (The calculated group average)
    - `Delta` (Individual - Group Average)
- **Visuals:** Standard HTML table or SVG text grid. Show headers.

### Component: `GenderPercentChart` (Bottom-Right)
- **Type:** Stacked Bar Chart (or 100% Stacked Bar).
- **Title:** "Total Number of Participants per Gender: Control vs Test"
- **Data Source:** Full dataset, filtered by `process_step` = 'start' and `gendr` in ('F', 'M').
- **Dimensions:**
    - X-Axis: `Variation`.
    - Color/Stack: `gendr`.
- **Measures:**
    - Y-Axis: Percentage of Total Count (Table Calculation: Percent of Total within `Variation`).
- **Visuals:**
    - Bars split by Gender (F/M).
    - Labels: Show percentage inside the bar segments.
- **Interactions:** Updates when the global `Variation` filter changes (triggered by Top-Right chart).

## 5. Interaction Logic (State Management)
- Use a React Context or simple parent state in `Dashboard.tsx` to hold `selectedVariation: string | null`.
- **Default:** `null` (Show all).
- **Event:** `TotalParticipantsChart` `onClick` -> updates `selectedVariation`.
- **Effect:** `ParticipantsStageChart` and `GenderPercentChart` listen to `selectedVariation`. If not null, they filter their data to match that variation. If null, they show all variations.
- **Note:** `BalanceAgeTable` is explicitly excluded from this interaction in the Tableau definition, so it remains static (always showing 'Test' data as per its hard filters).

## 6. Styling & Polish
- **Fonts:** Use a clean sans-serif font (Inter, Roboto, or system-ui).
- **Colors:** Map 'Control' and 'Test' to distinct colors (e.g., Blue and Orange). Map 'F' and 'M' to distinct colors (e.g., Teal and Purple).
- **Axes:** Style axes to look like Tableau (grey lines, readable ticks).
- **Tooltips:** Implement simple HTML tooltips on hover for bars showing exact values.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/a_b_testing_data.csv

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
const rows = await loadCsv("/data/a_b_testing_data.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_2010/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet:  Number of participants
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[cnt:client_id:qk]`
- cols_field: `([federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk] / [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk])`
- series_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[Action (Variation)]`
- bar_orientation: `vertical`
- category_order: start, step_1, step_2, step_3, confirm, %all%
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: balance vs age
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[avg:bal:qk]`
- cols_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[Clnt Age (group)]`
- series_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]`
- highlight_fields: [federated.0rs4ltd193x5a718ruzc40qfpfhz].[Clnt Age (group)], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[ctd:client_id:qk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:client_id:ok], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:gendr:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: balance vs age (2)
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:client_id:ok]`
- cols_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[:Measure Names]`
- series_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]`
- zone: x=50000, y=50000, w=49200, h=49000
- highlight_fields: [federated.0rs4ltd193x5a718ruzc40qfpfhz].[Clnt Age (group)], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[ctd:client_id:qk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Calculation_503488417541140484:qk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:client_id:ok], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:gendr:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: gender
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[cnt:client_id:qk]`
- cols_field: `([federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk] / [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:gendr:nk])`
- series_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:gendr:nk]`
- bar_orientation: `vertical`
- highlight_fields: [federated.0rs4ltd193x5a718ruzc40qfpfhz].[ctd:client_id:qk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:client_id:ok], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:gendr:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: gender %
- chart_intent: `vertical_stacked_percentage_bar`
- rows_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[pcto:cnt:client_id:qk:11]`
- cols_field: `([federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk] / [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:gendr:nk])`
- series_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:gendr:nk]`
- bar_orientation: `vertical`
- stacking_normalized_to_percent: true
- aggregate_by_series_field: true
- zone: x=800, y=50000, w=49200, h=49000
- highlight_fields: [federated.0rs4ltd193x5a718ruzc40qfpfhz].[ctd:client_id:qk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:client_id:ok], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:gendr:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render one vertical stacked bar per category.
- rule: Normalize each category bar to 100%.
- rule: Aggregate by series_field so each category has one segment per series category.
- rule: Do not reinterpret stacked-percentage bars as heatmap/table matrices or grouped bars.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: total number of participants
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[cnt:client_id:qk]`
- cols_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk]`
- series_field: `[federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]`
- bar_orientation: `vertical`
- zone: x=800, y=1000, w=49200, h=49000
- highlight_fields: [federated.0rs4ltd193x5a718ruzc40qfpfhz].[ctd:client_id:qk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:client_id:ok], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=total number of participants, target=Dashboard 1
## Highlight Bindings
-  Number of participants: [federated.0rs4ltd193x5a718ruzc40qfpfhz].[ctd:client_id:qk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:client_id:ok], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]
- total number of participants: [federated.0rs4ltd193x5a718ruzc40qfpfhz].[ctd:client_id:qk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:client_id:ok], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]
- gender: [federated.0rs4ltd193x5a718ruzc40qfpfhz].[ctd:client_id:qk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:client_id:ok], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:gendr:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]
- gender %: [federated.0rs4ltd193x5a718ruzc40qfpfhz].[ctd:client_id:qk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:client_id:ok], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:gendr:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]
- balance vs age: [federated.0rs4ltd193x5a718ruzc40qfpfhz].[Clnt Age (group)], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[ctd:client_id:qk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:client_id:ok], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:gendr:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]
- balance vs age (2): [federated.0rs4ltd193x5a718ruzc40qfpfhz].[Clnt Age (group)], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[ctd:client_id:qk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Calculation_503488417541140484:qk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:Variation:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:client_id:ok], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:gendr:nk], [federated.0rs4ltd193x5a718ruzc40qfpfhz].[none:process_step:nk]
