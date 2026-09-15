# Project Requirements

You are a senior React engineer tasked with reverse-engineering a Tableau dashboard into a React + TypeScript + Vite application.

## Project Overview
Recreate the "Exploring data patterns" dashboard from the provided Tableau workbook. The dashboard visualizes stock market data (Open/Close prices) for a specific entity (DIS), focusing on monthly averages and historical maximums.

## Tech Stack
- **Framework:** React 18+
- **Language:** TypeScript
- **Build Tool:** Vite
- **Visualization:** D3.js (v7+)
- **Styling:** CSS Modules or Styled Components (No UI component libraries like AntD).
- **Data Parsing:** d3-dsv (d3.csvParse)

## Data Loading

### 1. Data Source
The primary data source is located at `/data/prices-split-adjusted.csv`.

### 2. Fetching and Parsing
Implement a utility function `useStockData` that:
1.  Fetches the CSV file using `fetch('/data/prices-split-adjusted.csv')`.
2.  Parses the CSV text using `d3.csvParse`.
3.  Transforms the raw data:
    - Parse the `date` column (format YYYY-MM-DD) into JavaScript `Date` objects.
    - Convert `open`, `close`, `high`, `low`, `volume` to numbers.
4.  Returns the cleaned array of objects.

### 3. Data Transformation (Aggregations)
Create derived data for the charts:
- **Monthly Averages:** Group data by Year-Month. Calculate the average `open` and average `close` for each month.
- **Global Maxima:** Calculate the maximum `open` price (and its date) and maximum `close` price (and its date) from the *entire* dataset (or currently filtered dataset).

## Component Architecture

### 1. `App` (Root)
- Manages the global state for the `activeDashboard` (though only "Exploring data patterns" is detailed, handle navigation state).
- Fetches data using `useStockData`.
- Passes data and interaction callbacks down to dashboard components.

### 2. `DashboardExploringPatterns`
- **Layout:** CSS Grid container.
- **Background:** `#000000` (Black).
- **Grid Structure:**
  - Header Row (Title + Nav)
  - Content Row 1: Max Open (Left) | Open Chart (Right)
  - Content Row 2: Max Close (Left) | Close Chart (Right)

### 3. `DashboardHeader`
- **Background:** `#b4b4b4` (Light Gray).
- **Text:** "Exploring data patterns" (Color: `#000000`, Font: Calibri, Size: 15px, Alignment: Left).
- **Navigation:** A button/link in the top right corner labeled "<Home>" (Color: `#000000`, Font: Calibri, Size: 15px).

### 4. `BigNumberCard`
- **Props:** `label` (string), `value` (number), `date` (Date).
- **Style:**
  - Background: `#000000`.
  - Text Color: `#b4b4b4`.
  - Font: Calibri.
  - Layout: Vertical stack.
- **Content:**
  - Label (e.g., "Maximum open stock price and day of occurance"). Font size: 11px.
  - Value: Formatted as currency (e.g., "$152.30"). Font size: Large (approx 24px-30px equivalent to Tableau's automatic sizing).
  - Date: Formatted date string below the value.

### 5. `StockLineChart`
- **Props:** `data` (array of {date, value}), `title` (string), `color` (string), `onFilter` (function).
- **Style:**
  - Background: `#000000`.
  - Text Color: `#b4b4b4`.
  - Font: Calibri.
  - Axis Titles: "Date" (X-axis).
- **D3 Implementation:**
  - Use `d3.scaleTime` for the X-axis (Monthly ticks).
  - Use `d3.scaleLinear` for the Y-axis (Price).
  - Use `d3.line` to draw the line path.
  - **Line Color:** `#b4b4b4`.
  - **Gridlines:** None (visibility off).
  - **Interactions:** Implement a brush or click interaction. When a user selects a time range (or clicks a point), trigger `onFilter` with the selected date range.

## Layout Specification (CSS Grid)

The `DashboardExploringPatterns` container should use the following grid template:

```css
.dashboard-container {
  display: grid;
  grid-template-columns: 200px 1fr; /* Narrow left column for Big Numbers, Wide right for Charts */
  grid-template-rows: auto 1fr 1fr; /* Header, Top Section, Bottom Section */
  background-color: #000000;
  color: #b4b4b4;
  font-family: 'Calibri', sans-serif;
  height: 100vh;
  gap: 20px;
  padding: 20px;
}

/* Header spans full width */
.header {
  grid-column: 1 / -1;
  background-color: #b4b4b4;
  color: #000000;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Chart Titles (Floating text above charts) */
.chart-title {
  font-size: 11px;
  color: #b4b4b4;
  margin-bottom: 10px;
  text-align: center;
}
```

## Visual Encodings Details

1.  **Colors:**
    - Background: `#000000`
    - Text/Axis/Line: `#b4b4b4`
    - Header Background: `#b4b4b4`
    - Header Text: `#000000`

2.  **Typography:**
    - Font Family: Calibri (fallback to sans-serif).
    - Chart Labels: 11px.
    - Header Text: 15px.

3.  **Charts:**
    - **Open Chart:** Displays AVG(Open) per Month.
    - **Close Chart:** Displays AVG(Close) per Month.

## Interactions

1.  **Filtering:**
    - The Tableau workbook defines "Filter 1" and "Filter 2" which trigger on selection in the "Open" and "Close" worksheets.
    - **Implementation:** When a user interacts (brushes/clicks) with the "Open" chart, update the global filter state. This filter state should:
        - Highlight/Filter the "Close" chart to the same time range.
        - Update the "Max Open" and "Max Close" cards to reflect the maxima *within the selected time range*.

2.  **Navigation:**
    - The "<Home>" button should reset the view (conceptually, though only one dashboard is implemented here, it should reset any active filters).

## Sample Data

```json
[
  {
    "﻿\"\"\"date\"\"\"": "2010-07-15",
    "\"open\"": 34.15,
    "\"high\"": 34.42,
    "\"low\"": 33.6,
    "\"close\"": 34.05,
    "\"volume\"": 10656300
  },
  {
    "﻿\"\"\"date\"\"\"": "1989-10-25",
    "\"open\"": 10.3642,
    "\"high\"": 10.5833,
    "\"low\"": 10.3642,
    "\"close\"": 10.4375,
    "\"volume\"": 6682596
  },
  {
    "﻿\"\"\"date\"\"\"": "1977-11-07",
    "\"open\"": 0.7414,
    "\"high\"": 0.7492,
    "\"low\"": 0.7414,
    "\"close\"": 0.7414,
    "\"volume\"": 2112304
  },
  {
    "﻿\"\"\"date\"\"\"": "1971-04-22",
    "\"open\"": 1.1263,
    "\"high\"": 1.1559,
    "\"low\"": 1.1224,
    "\"close\"": 1.1456,
    "\"volume\"": 2813190
  },
  {
    "﻿\"\"\"date\"\"\"": "1977-06-28",
    "\"open\"": 0.7722,
    "\"high\"": 0.7722,
    "\"low\"": 0.7568,
    "\"close\"": 0.7568,
    "\"volume\"": 3066291
  },
  {
    "﻿\"\"\"date\"\"\"": "2010-06-11",
    "\"open\"": 33.85,
    "\"high\"": 34.26,
    "\"low\"": 33.58,
    "\"close\"": 34.24,
    "\"volume\"": 8799700
  },
  {
    "﻿\"\"\"date\"\"\"": "1998-02-24",
    "\"open\"": 37.9,
    "\"high\"": 37.9667,
    "\"low\"": 37.2,
    "\"close\"": 37.3,
    "\"volume\"": 5078001
  },
  {
    "﻿\"\"\"date\"\"\"": "2019-08-26",
    "\"open\"": 134.19,
    "\"high\"": 134.64,
    "\"low\"": 132.55,
    "\"close\"": 134.61,
    "\"volume\"": 8094069
  },
  {
    "﻿\"\"\"date\"\"\"": "1977-08-30",
    "\"open\"": 0.8339,
    "\"high\"": 0.8364,
    "\"low\"": 0.8159,
    "\"close\"": 0.8186,
    "\"volume\"": 1396802
  },
  {
    "﻿\"\"\"date\"\"\"": "1992-06-18",
    "\"open\"": 12.0433,
    "\"high\"": 12.1667,
    "\"low\"": 12.0,
    "\"close\"": 12.0,
    "\"volume\"": 4106301
  }
]
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_696_1/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Close
- chart_intent: `line_chart`
- rows_field: `[federated.1av1a3o0myrsjb18ja7fa0yd1qya].[avg:close:qk]`
- cols_field: `[federated.1av1a3o0myrsjb18ja7fa0yd1qya].[tmn:date:qk]`
- series_field: `[federated.1av1a3o0myrsjb18ja7fa0yd1qya].[Action (MONTH(Date))]`
- axis_title_cols: Date
- zone: x=21820, y=63447, w=76309, h=36797
- highlight_fields: [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[none:symbol:nk], [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[yr:date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Go to home
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- zone: x=91910, y=1222, w=6596, h=7090
- highlight_fields: [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[none:Calculation_1169247112986927108:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Max close
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.1av1a3o0myrsjb18ja7fa0yd1qya].[usr:Calculation_1729663792037629953:qk]`
- zone: x=125, y=65159, w=17207, h=21149
- highlight_fields: [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[none:symbol:nk], [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[tmn:date:qk], [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[yr:date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Max open
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.1av1a3o0myrsjb18ja7fa0yd1qya].[usr:Calculation_509469767997857792:qk]`
- zone: x=1683, y=23227, w=16459, h=14425
- highlight_fields: [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[none:symbol:nk], [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[tmn:date:qk], [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[yr:date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Open
- chart_intent: `line_chart`
- rows_field: `[federated.1av1a3o0myrsjb18ja7fa0yd1qya].[avg:open:qk]`
- cols_field: `[federated.1av1a3o0myrsjb18ja7fa0yd1qya].[tmn:date:qk]`
- axis_title_cols: Date
- zone: x=22007, y=19560, w=76060, h=35086
- highlight_fields: [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[none:symbol:nk], [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[yr:date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=62, y=-122, w=100187, h=9413): Exploring data patterns
- zone(x=56172, y=12592, w=20075, h=4645): Average monthly open stock prices
- zone(x=2120, y=12225, w=17768, h=6601): Maximum open stock price and day of occurance
- zone(x=57170, y=58680, w=20012, h=3667): Average monthly close stock prices
- zone(x=3928, y=56846, w=15960, h=6479): Maximum close stock price and day of occurance
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Open, target=Exploring data patterns
- Filter 2 (generated): kind=filter_action, source=Close, target=Exploring data patterns
## Highlight Bindings
- Close: [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[none:symbol:nk], [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[yr:date:ok]
- Go to home: [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[none:Calculation_1169247112986927108:nk]
- Max close: [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[none:symbol:nk], [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[tmn:date:qk], [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[yr:date:ok]
- Max open: [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[none:symbol:nk], [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[tmn:date:qk], [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[yr:date:ok]
- Open: [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[none:symbol:nk], [federated.1av1a3o0myrsjb18ja7fa0yd1qya].[yr:date:ok]
