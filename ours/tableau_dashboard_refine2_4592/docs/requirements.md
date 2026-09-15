# Project Requirements

You are an expert React developer tasked with recreating a Tableau dashboard titled 'Dashboard 1' using React, TypeScript, and Vite. You must use D3.js (d3-scale, d3-shape, d3-axis, d3-array) for visualizations.

## 1. Data Loading

The primary data source is a CSV file located at `/data/OfficeSupplies (Office_Supplies data set (Class work module 1)).csv`.

Implement a data loader utility that:
1. Fetches the CSV using the native `fetch()` API.
2. Parses the CSV text into an array of objects. You may use `d3-dsv` or standard string manipulation.
3. Transforms the data:
   - Parse `Order_Date` strings into JavaScript `Date` objects.
   - Calculate a new field `Revenue` as `Unit Price * Units Sold`.
   - Extract `Year` and `Month` from `Order_Date` for the line chart.
4. Returns the typed array.

## 2. Data Model

Define a TypeScript interface `OfficeSupplyData` matching the following schema:
```typescript
interface OfficeSupplyData {
  Order_Date: Date;
  "Sales Region": string;
  "Sales representative": string;
  Item: string;
  "Units Sold": number;
  "Unit Price": number;
  Revenue: number; // Calculated
  Year: number;   // Derived
  Month: number;  // Derived (0-11)
}
```

## 3. State Management & Interactions

The dashboard uses a "Filter All" interaction model. Implement a React Context (`DashboardContext`) to manage the following filter states:
- `selectedSalesRep`: string | null
- `selectedItem`: string | null
- `selectedDate`: string | null (Format: "YYYY-MM")

**Interaction Logic (Action Filters):**
- **Sales rep vs Units**: Clicking a bar sets `selectedSalesRep`.
- **sales rep vs revenue**: Clicking a bar sets `selectedSalesRep`.
- **datatable**: Clicking a row sets `selectedItem`.
- **Line chart**: Clicking a point sets `selectedDate`.

When a filter is active, all charts must re-render showing only data matching the active filters. If multiple filters are active, data must match all (AND logic).

## 4. Layout Specification (Dashboard 1)

Recreate the layout using CSS Grid. The dashboard is a 2x2 grid with specific column proportions.

**Container:**
- `display: grid`
- `grid-template-rows: 1fr 1fr`
- `grid-template-columns: 1fr 1fr` (Note: The bottom row has a specific split, handled below)
- `gap: 8px`
- `height: 100vh` or `100vh - padding`

**Grid Areas / Placement:**
1. **Top-Left (Sales rep vs Units):** `grid-area: 1 / 1 / 2 / 2`
2. **Top-Right (sales rep vs revenue):** `grid-area: 1 / 2 / 1 / 3`
3. **Bottom-Left (datatable):** `grid-area: 2 / 1 / 3 / 2`. This cell should be narrower. Use a nested container or specific width constraint (approx 16-20% of total width).
4. **Bottom-Right (Line chart):** `grid-area: 2 / 2 / 3 / 3`. This cell takes the remaining width.

*Note: The XML defines specific pixel widths for the bottom row (Datatable ~16k, Line Chart ~83k). Ensure the visual weight reflects this ratio.*

## 5. Component Specifications

### 5.1 Sales rep vs Units (Bar Chart)
- **Type:** Vertical Bar Chart.
- **X-Axis:** `Sales representative` (Dimension). Sort bars DESC by `SUM(Units Sold)`.
- **Y-Axis:** `SUM(Units Sold)` (Measure).
- **Color:** Use a neutral color (e.g., #4e79a7) or match the Item color if stacked (XML implies simple bars, but color is mapped to Item in other views. Here, stick to a single color or color by Item if the data supports it. The XML shows `mark class='Automatic'` without explicit color encoding for this specific sheet in the pane, but the datasource has a color style. Use a standard blue for clarity unless specific Item breakdown is visible). *Correction*: The XML `window` for this sheet highlights `Item` and `Sales representative`. Use the specific Item colors if the bars are stacked, otherwise use a default color.
- **Labels:** Show data labels for the sum of units.
- **Interaction:** Click bar -> Filter by `Sales representative`.

### 5.2 sales rep vs revenue (Bar Chart)
- **Type:** Vertical Bar Chart.
- **X-Axis:** `Sales representative` (Dimension). Sort bars DESC by `SUM(Revenue)`.
- **Y-Axis:** `SUM(Revenue)` (Measure).
- **Color:** Encoded by `Item` (Stacked or Grouped). Use the specific color palette:
  - Binder: #4e79a7
  - Pencil: #59a14f
  - Pen Set: #76b7b2
  - Pen: #e15759
  - Desk: #f28e2b
- **Labels:** Show data labels.
- **Interaction:** Click bar -> Filter by `Sales representative`.

### 5.3 datatable (Table)
- **Type:** Data Table.
- **Columns:** `Item` (Rows), `SUM(Revenue)`, `SUM(Units Sold)` (Columns/Measures).
- **Headers:** "Item", "Revenue", "Units Sold".
- **Interaction:** Click row -> Filter by `Item`.

### 5.4 Line chart (Line Chart)
- **Type:** Line Chart.
- **X-Axis:** `Order_Date` (Truncated to Month granularity: YEAR-Month).
- **Y-Axis:** `SUM(Revenue)`.
- **Marks:** Lines connecting monthly points.
- **Labels:** Show labels on points.
- **Interaction:** Click point/line segment -> Filter by `Year-Month`.

## 6. Sample Data

```json
[
  {
    "﻿\"\"\"Order_Date\"\"\"": "2017-01-06",
    "\"Sales Region\"": "East",
    "\"Sales representative\"": "Richard",
    "\"Item\"": "Pencil",
    "\"Units Sold\"": 95,
    "\"Unit Price\"": 1.99
  },
  {
    "﻿\"\"\"Order_Date\"\"\"": "2017-07-29",
    "\"Sales Region\"": "East",
    "\"Sales representative\"": "Susan",
    "\"Item\"": "Binder",
    "\"Units Sold\"": 81,
    "\"Unit Price\"": 19.99
  },
  {
    "﻿\"\"\"Order_Date\"\"\"": "2017-01-23",
    "\"Sales Region\"": "Central",
    "\"Sales representative\"": "Matthew",
    "\"Item\"": "Binder",
    "\"Units Sold\"": 50,
    "\"Unit Price\"": 19.99
  },
  {
    "﻿\"\"\"Order_Date\"\"\"": "2017-06-17",
    "\"Sales Region\"": "Central",
    "\"Sales representative\"": "Matthew",
    "\"Item\"": "Desk",
    "\"Units Sold\"": 5,
    "\"Unit Price\"": 125.0
  },
  {
    "﻿\"\"\"Order_Date\"\"\"": "2017-02-09",
    "\"Sales Region\"": "Central",
    "\"Sales representative\"": "Alex",
    "\"Item\"": "Pencil",
    "\"Units Sold\"": 36,
    "\"Unit Price\"": 4.99
  },
  {
    "﻿\"\"\"Order_Date\"\"\"": "2017-09-01",
    "\"Sales Region\"": "Central",
    "\"Sales representative\"": "Smith",
    "\"Item\"": "Desk",
    "\"Units Sold\"": 2,
    "\"Unit Price\"": 125.0
  },
  {
    "﻿\"\"\"Order_Date\"\"\"": "2017-11-08",
    "\"Sales Region\"": "East",
    "\"Sales representative\"": "Susan",
    "\"Item\"": "Pen",
    "\"Units Sold\"": 15,
    "\"Unit Price\"": 19.99
  },
  {
    "﻿\"\"\"Order_Date\"\"\"": "2017-09-27",
    "\"Sales Region\"": "West",
    "\"Sales representative\"": "James",
    "\"Item\"": "Pen",
    "\"Units Sold\"": 76,
    "\"Unit Price\"": 1.99
  },
  {
    "﻿\"\"\"Order_Date\"\"\"": "2017-07-21",
    "\"Sales Region\"": "Central",
    "\"Sales representative\"": "Morgan",
    "\"Item\"": "Pen Set",
    "\"Units Sold\"": 55,
    "\"Unit Price\"": 12.49
  },
  {
    "﻿\"\"\"Order_Date\"\"\"": "2017-04-10",
    "\"Sales Region\"": "Central",
    "\"Sales representative\"": "Rachel",
    "\"Item\"": "Pencil",
    "\"Units Sold\"": 66,
    "\"Unit Price\"": 1.99
  }
]
```

## 7. Implementation Notes

- Use `d3-scale` for all axis scales (`scaleBand`, `scaleLinear`, `scaleTime`).
- Use `d3-shape` for generating the line path (`line()`).
- Use `d3-axis` for rendering axes.
- Ensure the app is responsive; the grid should stack on mobile (though the XML has a specific phone layout, a standard stack is acceptable for the web implementation).
- Do not use high-level chart libraries (like Recharts or Nivo). Build the SVGs using D3 primitives within React components.
- Preserve the exact text for titles and labels as found in the XML (e.g., "Sales rep vs Units", "sales rep vs revenue").

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_refine2_4592/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Line chart
- chart_intent: `line_chart`
- rows_field: `[federated.0rvcsld1bk0txg17inoxj0v7uuv9].[sum:Calculation_1414411819444039680:qk]`
- cols_field: `([federated.0rvcsld1bk0txg17inoxj0v7uuv9].[yr:Order_Date:ok] / [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[mn:Order_Date:ok])`
- series_field: `[federated.0rvcsld1bk0txg17inoxj0v7uuv9].[Action (Sales representative)]`
- zone: x=16464, y=49942, w=83053, h=49129
- highlight_fields: [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[yr:Order_Date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales rep vs Units
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0rvcsld1bk0txg17inoxj0v7uuv9].[sum:Units Sold:qk]`
- cols_field: `[federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Sales representative:nk]`
- series_field: `[federated.0rvcsld1bk0txg17inoxj0v7uuv9].[Action (Item)]`
- bar_orientation: `vertical`
- zone: x=483, y=929, w=49517, h=49013
- legend_required: true
- legend_field: `[federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Item:nk]`
- legend_relative_position: below
- highlight_fields: [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Item:nk], [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Sales representative:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored below the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: datatable
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Item:nk]`
- cols_field: `[federated.0rvcsld1bk0txg17inoxj0v7uuv9].[:Measure Names]`
- series_field: `[federated.0rvcsld1bk0txg17inoxj0v7uuv9].[:Measure Names]`
- zone: x=483, y=49942, w=15981, h=49129
- highlight_fields: [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[:Measure Names]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: sales rep vs revenue
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0rvcsld1bk0txg17inoxj0v7uuv9].[sum:Calculation_1414411819444039680:qk]`
- cols_field: `[federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Sales representative:nk]`
- series_field: `[federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Item:nk]`
- bar_orientation: `vertical`
- zone: x=50000, y=929, w=49517, h=49013
- legend_required: true
- legend_field: `[federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Item:nk]`
- legend_relative_position: below
- highlight_fields: [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Item:nk], [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Sales representative:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored below the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Sales rep vs Units, target=Dashboard 1
- Filter 2 (generated): kind=filter_action, source=sales rep vs revenue, target=Dashboard 1
- Filter 3 (generated): kind=filter_action, source=datatable, target=Dashboard 1
- Filter 4 (generated): kind=filter_action, source=Line chart, target=Dashboard 1
## Highlight Bindings
- Sales rep vs Units: [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Item:nk], [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Sales representative:nk]
- sales rep vs revenue: [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Item:nk], [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Sales representative:nk]
- Sales region vs Revenue: [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Item:nk], [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Sales Region:nk], [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Sales representative:nk]
- datatable: [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[:Measure Names]
- Sales rep vs Units: [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Item:nk]
- sales rep vs revenue: [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Item:nk]
- Line chart: [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[yr:Order_Date:ok]
- Treemap: [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Item:nk], [federated.0rvcsld1bk0txg17inoxj0v7uuv9].[none:Sales Region:nk]
