# Project Requirements

You are an expert React developer. Your task is to implement a dashboard application that exactly replicates the provided Tableau workbook definition.

## Tech Stack & Constraints
- **Framework:** React + TypeScript + Vite.
- **Visualization:** Use D3.js primitives (d3-scale, d3-shape, d3-axis, d3-array, d3-selection). Do not use high-level chart libraries like Recharts or Nivo.
- **Styling:** CSS Modules or Styled Components. Use CSS Grid for the main dashboard layout.
- **Data:** Load data from the public folder using fetch().

## Data Loading

The primary data source is located at `/data/federated_07pow0c0ytbl181cit8kw1.csv`.

Implement a utility function `loadData` that fetches this CSV and parses it. You can use `d3-dsv` for parsing.

```typescript
import { csv } from 'd3-dsv';

export interface SalesData {
  'Channel Type': string;
  'Pay Type': string;
  'Item Category': string;
  'Item ID': number;
  'Item code': string;
  'Item Name': string;
  'Employee ID': number;
  'Employee Code': string;
  'Employee Name': string;
  'Employee Locations': string;
  'Employee Country': string;
  'Manager': string;
  'Department': string;
  'Sales Date': string; // ISO date string
  'Sales_Cost': number;
  'Sales_Amt': number;
  'Sales_Qty': number;
  'Sales Type': string;
  'Customer ID': number;
  'Customer Name': string;
  'Customer Location': string;
  'Customer Country': string;
}

export const loadData = async (): Promise<SalesData[]> => {
  const response = await fetch('/data/federated_07pow0c0ytbl181cit8kw1.csv');
  const csvText = await response.text();
  const data = csv<SalesData>(csvText);
  // Convert numeric fields
  return data.map(d => ({
    ...d,
    'Item ID': +d['Item ID'],
    'Employee ID': +d['Employee ID'],
    'Sales_Cost': +d['Sales_Cost'],
    'Sales_Amt': +d['Sales_Amt'],
    'Sales_Qty': +d['Sales_Qty'],
    'Customer ID': +d['Customer ID']
  }));
};
```

## Sample Data

```json
[
  {
    "﻿\"\"\"Channel Type\"\"\"": "Post",
    "\"Pay Type\"": "DHL",
    "\"Item Category\"": "Cellular",
    "\"Item ID\"": 38,
    "\"Item code\"": "P6",
    "\"Item Name\"": "Verizon",
    "\"Employee ID\"": 29,
    "\"Employee Code\"": "E29",
    "\"Employee Name\"": "Kaushik",
    "\"Employee Locations\"": "TX",
    "\"Employee Country\"": "USA",
    "\"Manager\"": "Manager 9",
    "\"Department\"": "Audit",
    "\"Sales Date\"": "2013-03-07",
    "\"Sales_Cost\"": 988,
    "\"Sales_Amt\"": 1600,
    "\"Sales_Qty\"": 38,
    "\"Sales Type\"": "International",
    "\"Customer ID\"": 101,
    "\"Customer Name\"": "Ramesh",
    "\"Customer Location\"": "New York",
    "\"Customer Country\"": "US"
  },
  {
    "﻿\"\"\"Channel Type\"\"\"": "Direct",
    "\"Pay Type\"": "Cheque",
    "\"Item Category\"": "Cosmetics",
    "\"Item ID\"": 24,
    "\"Item code\"": "P4",
    "\"Item Name\"": "Soap",
    "\"Employee ID\"": 18,
    "\"Employee Code\"": "E18",
    "\"Employee Name\"": "Tim",
    "\"Employee Locations\"": "NY",
    "\"Employee Country\"": "USA",
    "\"Manager\"": "Manager 5",
    "\"Department\"": "Accounting",
    "\"Sales Date\"": "2015-03-08",
    "\"Sales_Cost\"": 876,
    "\"Sales_Amt\"": 600,
    "\"Sales_Qty\"": 27,
    "\"Sales Type\"": "Domestic",
    "\"Customer ID\"": 108,
    "\"Customer Name\"": "Prasad",
    "\"Customer Location\"": "Bristol",
    "\"Customer Country\"": "UK"
  },
  {
    "﻿\"\"\"Channel Type\"\"\"": "Direct",
    "\"Pay Type\"": "Cheque",
    "\"Item Category\"": "Cosmetics",
    "\"Item ID\"": 24,
    "\"Item code\"": "P4",
    "\"Item Name\"": "Soap",
    "\"Employee ID\"": 19,
    "\"Employee Code\"": "E19",
    "\"Employee Name\"": "Kenny",
    "\"Employee Locations\"": "TX",
    "\"Employee Country\"": "USA",
    "\"Manager\"": "Manager 3",
    "\"Department\"": "Finance",
    "\"Sales Date\"": "2013-03-09",
    "\"Sales_Cost\"": 1020,
    "\"Sales_Amt\"": 700,
    "\"Sales_Qty\"": 28,
    "\"Sales Type\"": "Domestic",
    "\"Customer ID\"": 109,
    "\"Customer Name\"": "Arvind",
    "\"Customer Location\"": "AP",
    "\"Customer Country\"": "IN"
  },
  {
    "﻿\"\"\"Channel Type\"\"\"": "Direct",
    "\"Pay Type\"": "Cheque",
    "\"Item Category\"": "Cosmetics",
    "\"Item ID\"": 24,
    "\"Item code\"": "P4",
    "\"Item Name\"": "Soap",
    "\"Employee ID\"": 16,
    "\"Employee Code\"": "E16",
    "\"Employee Name\"": "Mark Waugh",
    "\"Employee Locations\"": "VA",
    "\"Employee Country\"": "USA",
    "\"Manager\"": "Manager 5",
    "\"Department\"": "Accounting",
    "\"Sales Date\"": "2013-03-06",
    "\"Sales_Cost\"": 700,
    "\"Sales_Amt\"": 400,
    "\"Sales_Qty\"": 25,
    "\"Sales Type\"": "International",
    "\"Customer ID\"": 106,
    "\"Customer Name\"": "Pawan",
    "\"Customer Location\"": "Mumbai",
    "\"Customer Country\"": "IN"
  },
  {
    "﻿\"\"\"Channel Type\"\"\"": "Online",
    "\"Pay Type\"": "Credit",
    "\"Item Category\"": "Electronics",
    "\"Item ID\"": 14,
    "\"Item code\"": "P2",
    "\"Item Name\"": "DVD",
    "\"Employee ID\"": 5,
    "\"Employee Code\"": "E5",
    "\"Employee Name\"": "Rahul Gandhi",
    "\"Employee Locations\"": "HR",
    "\"Employee Country\"": "India",
    "\"Manager\"": "Manager 2",
    "\"Department\"": "Sales",
    "\"Sales Date\"": "2012-01-05",
    "\"Sales_Cost\"": 400,
    "\"Sales_Amt\"": 500,
    "\"Sales_Qty\"": 14,
    "\"Sales Type\"": "International",
    "\"Customer ID\"": 104,
    "\"Customer Name\"": "Mahesh",
    "\"Customer Location\"": "New York",
    "\"Customer Country\"": "US"
  },
  {
    "﻿\"\"\"Channel Type\"\"\"": "Post",
    "\"Pay Type\"": "DHL",
    "\"Item Category\"": "Cellular",
    "\"Item ID\"": 38,
    "\"Item code\"": "P6",
    "\"Item Name\"": "Verizon",
    "\"Employee ID\"": 28,
    "\"Employee Code\"": "E28",
    "\"Employee Name\"": "Mustaq Ahmed",
    "\"Employee Locations\"": "WA",
    "\"Employee Country\"": "USA",
    "\"Manager\"": "Manager 8",
    "\"Department\"": "Audit",
    "\"Sales Date\"": "2015-03-06",
    "\"Sales_Cost\"": 1020,
    "\"Sales_Amt\"": 1500,
    "\"Sales_Qty\"": 37,
    "\"Sales Type\"": "Domestic",
    "\"Customer ID\"": 100,
    "\"Customer Name\"": "Ram",
    "\"Customer Location\"": "Mumbai",
    "\"Customer Country\"": "IN"
  },
  {
    "﻿\"\"\"Channel Type\"\"\"": "Post",
    "\"Pay Type\"": "FedeX",
    "\"Item Category\"": "Cellular",
    "\"Item ID\"": 30,
    "\"Item code\"": "P5",
    "\"Item Name\"": "ATT",
    "\"Employee ID\"": 23,
    "\"Employee Code\"": "E23",
    "\"Employee Name\"": "Geoff",
    "\"Employee Locations\"": "WA",
    "\"Employee Country\"": "USA",
    "\"Manager\"": "Manager 3",
    "\"Department\"": "Finance",
    "\"Sales Date\"": "2013-03-03",
    "\"Sales_Cost\"": 550,
    "\"Sales_Amt\"": 1100,
    "\"Sales_Qty\"": 32,
    "\"Sales Type\"": "International",
    "\"Customer ID\"": 106,
    "\"Customer Name\"": "Pawan",
    "\"Customer Location\"": "Mumbai",
    "\"Customer Country\"": "IN"
  },
  {
    "﻿\"\"\"Channel Type\"\"\"": "Post",
    "\"Pay Type\"": "DHL",
    "\"Item Category\"": "Cellular",
    "\"Item ID\"": 38,
    "\"Item code\"": "P6",
    "\"Item Name\"": "Verizon",
    "\"Employee ID\"": 26,
    "\"Employee Code\"": "E26",
    "\"Employee Name\"": "Javed",
    "\"Employee Locations\"": "IL",
    "\"Employee Country\"": "USA",
    "\"Manager\"": "Manager 6",
    "\"Department\"": "Audit",
    "\"Sales Date\"": "2014-01-05",
    "\"Sales_Cost\"": 1400,
    "\"Sales_Amt\"": 1400,
    "\"Sales_Qty\"": 35,
    "\"Sales Type\"": "Domestic",
    "\"Customer ID\"": 103,
    "\"Customer Name\"": "Naresh",
    "\"Customer Location\"": "Mumbai",
    "\"Customer Country\"": "IN"
  },
  {
    "﻿\"\"\"Channel Type\"\"\"": "Post",
    "\"Pay Type\"": "DHL",
    "\"Item Category\"": "Cellular",
    "\"Item ID\"": 38,
    "\"Item code\"": "P6",
    "\"Item Name\"": "Verizon",
    "\"Employee ID\"": 26,
    "\"Employee Code\"": "E26",
    "\"Employee Name\"": "Javed",
    "\"Employee Locations\"": "IL",
    "\"Employee Country\"": "USA",
    "\"Manager\"": "Manager 6",
    "\"Department\"": "Audit",
    "\"Sales Date\"": "2013-03-04",
    "\"Sales_Cost\"": 798,
    "\"Sales_Amt\"": 1400,
    "\"Sales_Qty\"": 35,
    "\"Sales Type\"": "International",
    "\"Customer ID\"": 109,
    "\"Customer Name\"": "Arvind",
    "\"Customer Location\"": "AP",
    "\"Customer Country\"": "IN"
  },
  {
    "﻿\"\"\"Channel Type\"\"\"": "Post",
    "\"Pay Type\"": "FedeX",
    "\"Item Category\"": "Cellular",
    "\"Item ID\"": 30,
    "\"Item code\"": "P5",
    "\"Item Name\"": "ATT",
    "\"Employee ID\"": 23,
    "\"Employee Code\"": "E23",
    "\"Employee Name\"": "Geoff",
    "\"Employee Locations\"": "WA",
    "\"Employee Country\"": "USA",
    "\"Manager\"": "Manager 3",
    "\"Department\"": "Finance",
    "\"Sales Date\"": "2015-03-03",
    "\"Sales_Cost\"": 550,
    "\"Sales_Amt\"": 1100,
    "\"Sales_Qty\"": 32,
    "\"Sales Type\"": "International",
    "\"Customer ID\"": 106,
    "\"Customer Name\"": "Pawan",
    "\"Customer Location\"": "Mumbai",
    "\"Customer Country\"": "IN"
  }
]
```

## Dashboard Layout

The dashboard title is "DIY BDC SALES".

The layout is a 2x2 grid structure (approximate proportions based on the workbook zones):

1.  **Top Left:** "Sales types" (Bubble Chart)
2.  **Top Right:** "Products Sales" (Bar Chart)
3.  **Bottom Left:** "Items with Category" (Bar Chart)
4.  **Bottom Right:** "Years with Product sales" (Bar Chart)

Use a CSS Grid container with 2 columns and 2 rows to arrange these components.

## Worksheet Specifications

### 1. Sales types (Bubble Chart)
- **Title:** "Sales types"
- **Type:** Packed Bubble Chart (Circle marks).
- **Data Preparation:** Group data by `Sales Type`. Calculate `Sum(Sales_Amt)` for each type.
- **Visual Encodings:**
  - **Size:** Radius proportional to `Sum(Sales_Amt)`.
  - **Color:** Encoded by `Sales Type` (Use a categorical color scale, e.g., d3.scaleOrdinal(d3.schemeCategory10)).
  - **Labels:** Display `Sales Type` text inside or near the bubbles. The XML also includes `Channel Type` in text encodings, but `Sales Type` is the primary grouping.
- **Implementation:** Use `d3.pack` to layout the circles.

### 2. Products Sales (Bar Chart)
- **Title:** "Products Sales"
- **Type:** Vertical Bar Chart.
- **Data Preparation:** Group by `Item Category` (and potentially `Department` as a hierarchy, but `Item Category` is the primary color encoding). Calculate `Sum(Sales_Qty)`.
- **Visual Encodings:**
  - **X-Axis:** `Item Category`.
  - **Y-Axis:** `Sum(Sales_Qty)`.
  - **Color:** Encoded by `Item Category`.
    - **Specific Colors:**
      - "Electronics": `#59a14f`
      - "Cosmetics": `#9c755f`
      - "Cellular": `#edc948`
  - **Labels:** Show `Sum(Sales_Qty)` value on top of or inside the bars.

### 3. Items with Category (Bar Chart)
- **Title:** "Items with Category"
- **Type:** Horizontal Bar Chart (implied by the row structure in XML, though vertical is acceptable if space permits. The XML suggests a complex axis, but a standard bar chart is the target).
- **Data Preparation:** Group by `Item Name`. Calculate `Sum(Sales_Qty)`. Stack or color by `Pay Type`.
- **Visual Encodings:**
  - **X-Axis:** `Sum(Sales_Qty)`.
  - **Y-Axis:** `Item Name`.
  - **Color:** Encoded by `Pay Type`.
    - **Specific Colors:**
      - "Debit": `#5c6068`
      - "Cheque": `#a2ceaa`
      - "Cash": `#bab0ac`
      - "DHL": `#eec9e5`
      - "Credit": `#f47942`
      - "FedeX": `#f4d166`

### 4. Years with Product sales (Bar Chart)
- **Title:** "Years with Product sales"
- **Type:** Vertical Bar Chart.
- **Data Preparation:** Extract Year from `Sales Date`. Group by Year. Calculate `Sum(Sales_Qty)`.
- **Visual Encodings:**
  - **X-Axis:** Year (derived from `Sales Date`).
  - **Y-Axis:** `Sum(Sales_Qty)`.
  - **Color:** Fixed color `#a0cbe8` (Light Blue).

## Interactions

- **Highlight Action:** The workbook defines a "Highlight" action on the field `Pay Type`.
- **Behavior:** When a user interacts with the "Items with Category" chart (specifically hovering or clicking a segment associated with a `Pay Type`), highlight that specific `Pay Type` across all other charts if they contain that dimension.
- **Implementation:** Use a React Context or state management to track the `activePayType`. Pass this state to all chart components. When `activePayType` is set, reduce the opacity of non-matching elements in the charts.

## General Styling
- **Fonts:** Use a sans-serif font (e.g., Arial, Helvetica, system-ui).
- **Borders:** The dashboard zones have 1px solid black borders in the XML. Apply a subtle border to the chart containers to mimic the Tableau layout.
- **Background:** White background.

## Implementation Steps
1.  Setup Vite + React + TypeScript.
2.  Install dependencies: `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-selection`, `d3-dsv`, `d3-hierarchy` (for bubble chart).
3.  Create the `loadData` utility.
4.  Create the 4 chart components as functional components accepting `data` and `width`/`height` props.
5.  Create the `Dashboard` component that fetches data and lays out the charts.
6.  Implement the color scales exactly as specified.
7.  Implement the highlight interaction.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_1497/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Items with Category
- chart_intent: `vertical_ranked_bar`
- rows_field: `(([federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Name:nk] / [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Pay Type:nk]) * [federated.07pow0c0ytbl181cit8kw1rpmhic].[sum:Sales_Qty:qk])`
- cols_field: `([federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Category:nk] / [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Sales Type:nk])`
- series_field: `[federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Pay Type:nk]`
- bar_orientation: `vertical`
- zone: x=1600, y=52625, w=39600, h=45250
- legend_required: true
- legend_field: `[federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Pay Type:nk]`
- legend_relative_position: right
- highlight_fields: [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Customer Location:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Category:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Name:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Manager:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Pay Type:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Sales Type:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[sum:Sales_Qty:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Pay type with year
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Sales Type:nk] / ([federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Customer Country:nk] / [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Category:nk]))`
- cols_field: `([federated.07pow0c0ytbl181cit8kw1rpmhic].[tyr:Sales Date:ok] * [federated.07pow0c0ytbl181cit8kw1rpmhic].[sum:Sales_Qty:qk])`
- bar_orientation: `horizontal`
- zone: x=49000, y=52750, w=49400, h=45250
- highlight_fields: [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Customer Country:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Employee Country:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Category:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Pay Type:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Sales Type:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[yr:Sales Date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales Type
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Sales Type:nk]`
- zone: x=1300, y=7375, w=41800, h=43125
- legend_required: true
- legend_field: `[federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Sales Type:nk]`
- legend_relative_position: overlay
- highlight_fields: [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Channel Type:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Sales Type:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[sum:Sales_Amt:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales with Items
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.07pow0c0ytbl181cit8kw1rpmhic].[sum:Sales_Qty:qk]`
- cols_field: `([federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Category:nk] / [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Department:nk])`
- series_field: `[federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Category:nk]`
- bar_orientation: `vertical`
- zone: x=45800, y=7375, w=43200, h=43250
- legend_required: true
- legend_field: `[federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Category:nk]`
- legend_relative_position: right
- highlight_fields: [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Department:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Category:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[sum:Sales_Qty:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Highlight 1 (generated): kind=highlight_brush, source=Dashboard 1, target=Dashboard 1
  fields: Pay Type
## Highlight Bindings
- Sales Type: [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Channel Type:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Sales Type:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[sum:Sales_Amt:qk]
- Sales with Items: [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Department:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Category:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[sum:Sales_Qty:qk]
- Items with Category: [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Customer Location:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Category:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Name:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Manager:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Pay Type:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Sales Type:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[sum:Sales_Qty:qk]
- Pay type with year: [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Customer Country:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Employee Country:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Category:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Pay Type:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Sales Type:nk], [federated.07pow0c0ytbl181cit8kw1rpmhic].[yr:Sales Date:ok]
- Items with Category: [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Pay Type:nk]
- Sales Type: [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Sales Type:nk]
- Sales with Items: [federated.07pow0c0ytbl181cit8kw1rpmhic].[none:Item Category:nk]
