# Project Requirements

You are an expert React engineer. Your task is to implement a dashboard application that replicates the provided Tableau workbook ('HR Dashboard') using React, TypeScript, and Vite.

## Tech Stack & Constraints
- **Core**: React 18+, TypeScript, Vite.
- **Visualization**: Use D3.js primitives (d3-scale, d3-shape, d3-axis, d3-array, d3-dsv). Do not use high-level chart libraries like Recharts or Nivo.
- **Styling**: Use CSS Modules or standard CSS. No UI component libraries (e.g., Ant Design) unless necessary for basic layout.
- **Data**: Load data from `/data/HR Data.csv`.

## Data Loading

Fetch the dataset using the browser's `fetch` API and parse it using `d3-dsv`.

```typescript
import * as d3 from 'd3';

export interface HRData {
  'Average Montly Hours': number;
  'Last Evaluation': number;
  'Left': number; // 0 or 1
  'Number Project': number;
  'Promotion Last 5Years': number;
  'Salary': string;
  'Sales': string; // Department
  'Satisfaction Level': number;
  'Time Spend Company': number;
  'Work accident': number;
}

export const loadData = async (): Promise<HRData[]> => {
  const response = await fetch('/data/HR Data.csv');
  const csvText = await response.text();
  const data = d3.csvParse<HRData>(csvText, (d) => ({
    ...d,
    'Average Montly Hours': +d['Average Montly Hours'],
    'Last Evaluation': +d['Last Evaluation'],
    'Left': +d['Left'],
    'Number Project': +d['Number Project'],
    'Promotion Last 5Years': +d['Promotion Last 5Years'],
    'Satisfaction Level': +d['Satisfaction Level'],
    'Time Spend Company': +d['Time Spend Company'],
    'Work accident': +d['Work accident'],
  }));
  return data;
};
```

## Sample Data

```json
[
  {
    "﻿Average Montly Hours (bin)": 127,
    "Last Evaluation (bin)": 0.46,
    "Number of Records": 1,
    "Satisfaction Level (bin)": 0.35,
    "Time Spend Company (group)": 3,
    "Work accident": 0,
    "Average Montly Hours": 135,
    "Last Evaluation": 0.5,
    "Left": 1,
    "Number Project": 2,
    "Promotion Last 5Years": 0,
    "Salary": "low",
    "Sales": "support",
    "Satisfaction Level": 0.39
  },
  {
    "﻿Average Montly Hours (bin)": 148,
    "Last Evaluation (bin)": 0.56,
    "Number of Records": 1,
    "Satisfaction Level (bin)": 0.46,
    "Time Spend Company (group)": 3,
    "Work accident": 0,
    "Average Montly Hours": 155,
    "Last Evaluation": 0.58,
    "Left": 0,
    "Number Project": 3,
    "Promotion Last 5Years": 0,
    "Salary": "low",
    "Sales": "sales",
    "Satisfaction Level": 0.51
  },
  {
    "﻿Average Montly Hours (bin)": 148,
    "Last Evaluation (bin)": 0.56,
    "Number of Records": 1,
    "Satisfaction Level (bin)": 0.46,
    "Time Spend Company (group)": 3,
    "Work accident": 0,
    "Average Montly Hours": 150,
    "Last Evaluation": 0.57,
    "Left": 0,
    "Number Project": 3,
    "Promotion Last 5Years": 0,
    "Salary": "low",
    "Sales": "sales",
    "Satisfaction Level": 0.52
  },
  {
    "﻿Average Montly Hours (bin)": 223,
    "Last Evaluation (bin)": 0.69,
    "Number of Records": 1,
    "Satisfaction Level (bin)": 0.46,
    "Time Spend Company (group)": 2,
    "Work accident": 0,
    "Average Montly Hours": 231,
    "Last Evaluation": 0.71,
    "Left": 0,
    "Number Project": 2,
    "Promotion Last 5Years": 0,
    "Salary": "low",
    "Sales": "sales",
    "Satisfaction Level": 0.52
  },
  {
    "﻿Average Montly Hours (bin)": 138,
    "Last Evaluation (bin)": 0.46,
    "Number of Records": 1,
    "Satisfaction Level (bin)": 0.4,
    "Time Spend Company (group)": 3,
    "Work accident": 0,
    "Average Montly Hours": 148,
    "Last Evaluation": 0.5,
    "Left": 1,
    "Number Project": 2,
    "Promotion Last 5Years": 0,
    "Salary": "medium",
    "Sales": "accounting",
    "Satisfaction Level": 0.44
  },
  {
    "﻿Average Montly Hours (bin)": 159,
    "Last Evaluation (bin)": 0.65,
    "Number of Records": 1,
    "Satisfaction Level (bin)": 0.87,
    "Time Spend Company (group)": 2,
    "Work accident": 0,
    "Average Montly Hours": 165,
    "Last Evaluation": 0.67,
    "Left": 0,
    "Number Project": 3,
    "Promotion Last 5Years": 0,
    "Salary": "high",
    "Sales": "IT",
    "Satisfaction Level": 0.9
  },
  {
    "﻿Average Montly Hours (bin)": 233,
    "Last Evaluation (bin)": 0.56,
    "Number of Records": 1,
    "Satisfaction Level (bin)": 0.92,
    "Time Spend Company (group)": 3,
    "Work accident": 0,
    "Average Montly Hours": 241,
    "Last Evaluation": 0.59,
    "Left": 0,
    "Number Project": 3,
    "Promotion Last 5Years": 0,
    "Salary": "low",
    "Sales": "product_mng",
    "Satisfaction Level": 0.96
  },
  {
    "﻿Average Montly Hours (bin)": 170,
    "Last Evaluation (bin)": 0.79,
    "Number of Records": 1,
    "Satisfaction Level (bin)": 0.98,
    "Time Spend Company (group)": 5,
    "Work accident": 0,
    "Average Montly Hours": 171,
    "Last Evaluation": 0.79,
    "Left": 0,
    "Number Project": 5,
    "Promotion Last 5Years": 0,
    "Salary": "medium",
    "Sales": "IT",
    "Satisfaction Level": 1
  },
  {
    "﻿Average Montly Hours (bin)": 212,
    "Last Evaluation (bin)": 0.93,
    "Number of Records": 1,
    "Satisfaction Level (bin)": 0.81,
    "Time Spend Company (group)": 6,
    "Work accident": 0,
    "Average Montly Hours": 222,
    "Last Evaluation": 0.94,
    "Left": 1,
    "Number Project": 5,
    "Promotion Last 5Years": 0,
    "Salary": "low",
    "Sales": "product_mng",
    "Satisfaction Level": 0.84
  },
  {
    "﻿Average Montly Hours (bin)": 180,
    "Last Evaluation (bin)": 0.83,
    "Number of Records": 1,
    "Satisfaction Level (bin)": 0.75,
    "Time Spend Company (group)": 4,
    "Work accident": 0,
    "Average Montly Hours": 183,
    "Last Evaluation": 0.87,
    "Left": 0,
    "Number Project": 3,
    "Promotion Last 5Years": 0,
    "Salary": "low",
    "Sales": "RandD",
    "Satisfaction Level": 0.78
  }
]
```

## Dashboard Layout

The dashboard uses a CSS Grid layout. The container should be responsive but maintain the relative proportions of the Tableau layout.

**Grid Structure:**
- **Row 1**: Two equal-width columns.
  - Left: `Histogram to find the Employee Statisfaction level`
  - Right: ` Histogram to find the Employee Monthly Hours Distribution Level`
- **Row 2**: One wide column (spanning full width or ~90%) and a narrow legend column.
  - Wide: `Employee Project Count Turnover Distribution`
  - Narrow: Color Legend for the Project Count chart.
- **Row 3**: Two equal-width columns.
  - Left: `Department Wise Distribution`
  - Right: `Employee turnover depending on years worked distribution`

## Component Specifications

### 1. Histogram to find the Employee Statisfaction level
- **Type**: Histogram.
- **Data**: `Satisfaction Level`.
- **Binning**: Use `d3.bin()` with a threshold step of `0.0576` (as defined in the workbook).
- **Visuals**:
  - X-Axis: Linear scale representing the Satisfaction Level bins.
  - Y-Axis: Linear scale representing the Count of Records (`Number of Records`).
  - Marks: Bars.
  - Color: Fixed color `#59a14f` (Green).
  - Labels: Display the count on top of each bar.

### 2. Histogram to find the Employee Monthly Hours Distribution Level
- **Type**: Histogram.
- **Data**: `Average Montly Hours`.
- **Binning**: Use `d3.bin()` with a threshold step of `10.2`.
- **Visuals**:
  - X-Axis: Linear scale representing the Hours bins.
  - Y-Axis: Linear scale representing the Count of Records.
  - Marks: Bars.
  - Color: Default Tableau blue or similar.
  - Labels: Display the count on top of each bar.

### 3. Employee Project Count Turnover Distribution
- **Type**: Stacked Bar Chart.
- **Dimensions**:
  - X-Axis: `Number Project` (Ordinal/Band scale).
  - Color: `Left` (0 = Stayed, 1 = Left).
- **Measures**:
  - Y-Axis: `Count of Records` (Linear scale).
- **Visuals**:
  - Bars stacked by `Left` status.
  - Color Scale: Use a categorical scale (e.g., Blue for 0, Orange/Red for 1).
  - Labels: Display the count for each segment.
- **Interaction**: Clicking a bar segment triggers a global filter on `Number Project` and `Left`.

### 4. Department Wise Distribution
- **Type**: Bar Chart.
- **Dimensions**:
  - X-Axis: `Sales` (Department) (Band scale).
  - Color: `Sales`.
- **Measures**:
  - Y-Axis: `Count of Records` (Linear scale).
- **Visuals**:
  - Bars colored by Department.
  - Color Scale: Categorical scale (e.g., Tableau 10).
  - Labels: Display the count on top of bars.
- **Interaction**: Clicking a bar triggers a global filter on `Sales` (Department).

### 5. Employee turnover depending on years worked distribution
- **Type**: Bar Chart.
- **Calculated Field**: The X-axis represents the calculation `Left / Time Spend Company`.
  - Logic: If `Left` is 0, value is 0. If `Left` is 1, value is `1 / Time Spend Company`.
- **Dimensions**:
  - X-Axis: The calculated value (Linear scale).
  - Color: `Time Spend Company` (Group).
- **Measures**:
  - Y-Axis: `Count of Records` (Linear scale).
- **Visuals**:
  - Bars colored by `Time Spend Company`.
  - Color Scale: Use the specific colors from the workbook if possible, or a categorical scale.
    - 2: #4e79a7, 3: #f28e2b, 4: #e15759, 5: #76b7b2, 6: #59a14f, 7: #edc948, 8: #b07aa1, 10: #ff9da7.
  - Labels: Display the count.
- **Interaction**: Clicking a bar triggers a global filter on `Time Spend Company`.

## Interactions & State Management

- **Global State**: Maintain a `filters` state object in the main `Dashboard` component.
- **Filter Logic**:
  - `Department Wise Distribution`: Updates `filters.sales`.
  - `Employee turnover depending on years worked distribution`: Updates `filters.timeSpendCompany`.
  - `Employee Project Count Turnover Distribution`: Updates `filters.numberProject` and `filters.left`.
- **Propagation**: Pass the active filters down to each chart component. Each chart should filter its input data before rendering.
- **Reset**: Provide a mechanism (e.g., clicking the background or a reset button) to clear filters.

## Implementation Details

- Use `useRef` for D3 selections to ensure DOM elements are manipulated correctly without conflicting with React's Virtual DOM (or use React to render SVG elements directly, which is preferred for React apps). Given the "D3 primitives" constraint, prefer calculating geometries with D3 and rendering with React (SVG `rect`, `path`, etc.) or using `useEffect` to append D3 elements to a container. The latter is often easier for complex axes, but the former is more "React". I recommend using React to render the SVG structure and D3 for scales/math.
- Ensure all text labels match the Tableau workbook exactly (e.g., "Average Montly Hours", "Satisfaction Level").
- Handle window resizing to update chart dimensions (use `ResizeObserver` or `window.addEventListener`).

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_3572/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet:  Histogram to find the Employee Monthly Hours Distribution Level
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.076m9lh1sw1llm1h35vp214914rz].[cnt:Average Montly Hours (bin):qk]`
- cols_field: `[federated.076m9lh1sw1llm1h35vp214914rz].[none:Average Montly Hours (bin) 1:qk]`
- bar_orientation: `vertical`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: Department Wise Distribution
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.076m9lh1sw1llm1h35vp214914rz].[sum:Number of Records:qk]`
- cols_field: `[federated.076m9lh1sw1llm1h35vp214914rz].[none:Sales:nk]`
- series_field: `[federated.076m9lh1sw1llm1h35vp214914rz].[none:Sales:nk]`
- bar_orientation: `vertical`
- zone: x=499, y=66341, w=49500, h=32681
- highlight_fields: [federated.076m9lh1sw1llm1h35vp214914rz].[none:Sales:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Employee Project Count Turnover Distribution
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.076m9lh1sw1llm1h35vp214914rz].[sum:Number of Records:qk]`
- cols_field: `[federated.076m9lh1sw1llm1h35vp214914rz].[none:Number Project:ok]`
- series_field: `[federated.076m9lh1sw1llm1h35vp214914rz].[none:Left:ok]`
- bar_orientation: `vertical`
- zone: x=499, y=33658, w=87909, h=32683
- legend_required: true
- legend_field: `[federated.076m9lh1sw1llm1h35vp214914rz].[none:Left:ok]`
- legend_relative_position: right
- highlight_fields: [federated.076m9lh1sw1llm1h35vp214914rz].[none:Left:ok], [federated.076m9lh1sw1llm1h35vp214914rz].[none:Number Project:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Employee turnover depending on years worked distribution
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.076m9lh1sw1llm1h35vp214914rz].[sum:Number of Records:qk]`
- cols_field: `([federated.076m9lh1sw1llm1h35vp214914rz].[none:Left:ok] / [federated.076m9lh1sw1llm1h35vp214914rz].[none:Time Spend Company (group):ok])`
- series_field: `[federated.076m9lh1sw1llm1h35vp214914rz].[none:Time Spend Company (group):ok]`
- bar_orientation: `vertical`
- zone: x=49999, y=66341, w=49502, h=32681
- highlight_fields: [federated.076m9lh1sw1llm1h35vp214914rz].[none:Time Spend Company (group):ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Histogram to find the Employee Statisfaction level
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.076m9lh1sw1llm1h35vp214914rz].[cnt:Satisfaction Level:qk]`
- cols_field: `[federated.076m9lh1sw1llm1h35vp214914rz].[none:Satisfaction Level (bin) 1:qk]`
- bar_orientation: `vertical`
- zone: x=499, y=978, w=49500, h=32680
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Department Wise Distribution, target=HR Dashboard
- Filter 2 (generated): kind=filter_action, source=Employee turnover depending on years worked distribution, target=HR Dashboard
- Filter 3 (generated): kind=filter_action, source=Employee Project Count Turnover Distribution, target=HR Dashboard
## Highlight Bindings
- Department Wise Distribution: [federated.076m9lh1sw1llm1h35vp214914rz].[none:Sales:nk]
- Employee Project Count Turnover Distribution: [federated.076m9lh1sw1llm1h35vp214914rz].[none:Left:ok], [federated.076m9lh1sw1llm1h35vp214914rz].[none:Number Project:ok]
- Employee turnover depending on years worked distribution: [federated.076m9lh1sw1llm1h35vp214914rz].[none:Time Spend Company (group):ok]
- Department Wise Distribution: [federated.076m9lh1sw1llm1h35vp214914rz].[none:Sales:nk]
- Employee Project Count Turnover Distribution: [federated.076m9lh1sw1llm1h35vp214914rz].[none:Left:ok]
- Employee turnover depending on years worked distribution: [federated.076m9lh1sw1llm1h35vp214914rz].[none:Time Spend Company (group):ok]
