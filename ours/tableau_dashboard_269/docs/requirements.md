# Project Requirements

You are an expert React developer. Your task is to implement a dashboard based on the following specification, which was reverse-engineered from a Tableau workbook.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7+) for visualizations (use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-selection`)
- CSS for layout (CSS Grid/Flexbox)

## Data Loading

The application must load data from the following URL:
`/data/Orders (Sample - Superstore).csv`

Implement a `useData` hook or similar utility to fetch and parse the CSV using `d3-dsv` (e.g., `d3.csvParse`).

The data schema is as follows:
- `Row ID`: number
- `Order ID`: string
- `Order Date`: Date string (parse to Date object)
- `Ship Date`: Date string
- `Ship Mode`: string
- `Customer ID`: string
- `Customer Name`: string
- `Segment`: string
- `Country/Region`: string
- `City`: string
- `State`: string
- `Postal Code`: number
- `Region`: string
- `Product ID`: string
- `Category`: string
- `Sub-Category`: string
- `Product Name`: string
- `Sales`: number
- `Quantity`: number
- `Discount`: number
- `Profit`: number

## State Management (Filters)

The dashboard relies on a central filter state. Create a context or state object `DashboardFilters` containing:
- `orderDateYear`: string | null (Derived from `Order Date`, formatted as 'YYYY')
- `category`: string | null
- `region`: string | null
- `state`: string | null
- `subCategory`: string | null

**Initial State:** All filters are `null` (showing all data).

**Global Filters (Sidebar):**
1. **Order Date (Year):** A multi-select or single-select filter. Defaults to all years available in the data.
2. **Category:** A multi-select filter (Furniture, Office Supplies, Technology).

**Interactive Filters (Actions):**
- Clicking a bar in "Sales by Region" sets the `region` filter.
- Clicking a bar in "Sales by States" sets the `state` filter.
- Clicking a bar in "Sales&Profit by Subcategory" sets the `category` and `subCategory` filters.
- Clicking an active filter element should clear that specific filter (toggle behavior).

## Layout Structure

The main dashboard layout should be a CSS Grid container.

**Grid Template:**
- Sidebar (Right): Fixed width (~250px)
- Main Content (Left): `1fr`

**Main Content Grid (2x2):**
- Top Left: Sales by Region
- Top Right: Sales&Profit by Subcategory
- Bottom Left: Sales&Profits by Product Name
- Bottom Right: Sales by States

**Sidebar:**
- Contains the "Order Date" and "Category" filter controls.

## Component Specifications

### 1. Sales by Region (Top Left)
- **Type:** Vertical Bar Chart
- **Data:** Group by `Region`, Sum of `Sales`.
- **Visual Encoding:**
  - X-Axis: `Region` (Categorical)
  - Y-Axis: `SUM(Sales)` (Quantitative)
  - Color: `SUM(Profit)` (Sequential Color Scale - Brown palette, e.g., `d3.interpolateBrBG` reversed or a custom brown scale). Higher profit = darker/intense color.
- **Labels:** Show Sales labels on bars.
- **Interaction:** Click bar -> Filter dashboard by `Region`.

### 2. Sales&Profit by Subcategory (Top Right)
- **Type:** Vertical Bar Chart
- **Data:** Group by `Category` and `Sub-Category`, Sum of `Sales`.
- **Visual Encoding:**
  - X-Axis: `Sub-Category` (Categorical, grouped by `Category`)
  - Y-Axis: `SUM(Sales)` (Quantitative)
  - Color: `SUM(Profit)` (Sequential Color Scale - Green palette, e.g., `d3.interpolateGreens`).
- **Labels:** Show Sales labels on bars.
- **Interaction:** Click bar -> Filter dashboard by `Category` AND `Sub-Category`.

### 3. Sales&Profits by Product Name (Bottom Left)
- **Type:** Text Table (Crosstab)
- **Data:** Group by `Product Name`, Sum of `Sales` and `Profit`.
- **Visual Encoding:**
  - Columns: `Product Name`, `Sales`, `Profit`.
  - Sorting: Descending by `Profit`.
- **Styling:** Standard HTML table with borders. Align numbers to the right.
- **Interaction:** None specific (passive view of filtered data).

### 4. Sales by States (Bottom Right)
- **Type:** Horizontal Bar Chart
- **Data:** Group by `State`, Sum of `Sales`.
- **Visual Encoding:**
  - Y-Axis: `State` (Categorical)
  - X-Axis: `SUM(Sales)` (Quantitative)
  - Color: `SUM(Profit)` (Sequential Color Scale - Blue palette, e.g., `d3.interpolateBlues`).
- **Labels:** Show Sales labels on bars.
- **Interaction:** Click bar -> Filter dashboard by `State`.

## Implementation Details

- **Filtering Logic:** Before passing data to charts, filter the raw dataset array based on the active `DashboardFilters` state.
- **D3 Integration:** Use `useRef` to select SVG elements and `useEffect` to render/update charts when data or filters change. Ensure charts clean up previous renders (`.selectAll('*').remove()`).
- **Responsiveness:** Use `viewBox` for SVGs to ensure they scale within their grid cells.
- **Styling:** Use standard CSS. No external UI library is required for the charts, but standard HTML inputs can be used for the sidebar filters.

## Sample Data

Here is a sample of the data structure to expect:

```json
[
  {
    "﻿\"\"\"Row ID\"\"\"": 3125,
    "\"Order ID\"": "CA-2017-121720",
    "\"Order Date\"": "2017-06-11",
    "\"Ship Date\"": "2017-06-12",
    "\"Ship Mode\"": "First Class",
    "\"Customer ID\"": "JE-15610",
    "\"Customer Name\"": "Jim Epp",
    "\"Segment\"": "Corporate",
    "\"Country/Region\"": "United States",
    "\"City\"": "Lakeland",
    "\"State\"": "Florida",
    "\"Postal Code\"": 33801.0,
    "\"Region\"": "South",
    "\"Product ID\"": "OFF-ST-10001780",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Storage",
    "\"Product Name\"": "Tennsco 16-Compartment Lockers with Coat Rack",
    "\"Sales\"": 1036.624,
    "\"Quantity\"": 2,
    "\"Discount\"": 0.2,
    "\"Profit\"": 51.831200000000024
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 7093,
    "\"Order ID\"": "CA-2017-119480",
    "\"Order Date\"": "2017-01-09",
    "\"Ship Date\"": "2017-01-13",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "CC-12685",
    "\"Customer Name\"": "Craig Carroll",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "Henderson",
    "\"State\"": "Kentucky",
    "\"Postal Code\"": 42420.0,
    "\"Region\"": "South",
    "\"Product ID\"": "OFF-AR-10004691",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Art",
    "\"Product Name\"": "Boston 1730 StandUp Electric Pencil Sharpener",
    "\"Sales\"": 42.76,
    "\"Quantity\"": 2,
    "\"Discount\"": 0.0,
    "\"Profit\"": 11.1176
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 8382,
    "\"Order ID\"": "CA-2018-134544",
    "\"Order Date\"": "2018-03-17",
    "\"Ship Date\"": "2018-03-19",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "AC-10660",
    "\"Customer Name\"": "Anna Chung",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "San Francisco",
    "\"State\"": "California",
    "\"Postal Code\"": 94109.0,
    "\"Region\"": "West",
    "\"Product ID\"": "TEC-PH-10003800",
    "\"Category\"": "Technology",
    "\"Sub-Category\"": "Phones",
    "\"Product Name\"": "i.Sound Portable Power - 8000 mAh",
    "\"Sales\"": 84.784,
    "\"Quantity\"": 2,
    "\"Discount\"": 0.2,
    "\"Profit\"": -20.136200000000006
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 6670,
    "\"Order ID\"": "CA-2019-122175",
    "\"Order Date\"": "2019-05-12",
    "\"Ship Date\"": "2019-05-14",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "CA-12775",
    "\"Customer Name\"": "Cynthia Arntzen",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "Vineland",
    "\"State\"": "New Jersey",
    "\"Postal Code\"": 8360.0,
    "\"Region\"": "East",
    "\"Product ID\"": "TEC-AC-10004859",
    "\"Category\"": "Technology",
    "\"Sub-Category\"": "Accessories",
    "\"Product Name\"": "Maxell Pro 80 Minute CD-R, 10/Pack",
    "\"Sales\"": 87.4,
    "\"Quantity\"": 5,
    "\"Discount\"": 0.0,
    "\"Profit\"": 34.96000000000001
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 2063,
    "\"Order ID\"": "CA-2016-106439",
    "\"Order Date\"": "2016-10-31",
    "\"Ship Date\"": "2016-11-04",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "GG-14650",
    "\"Customer Name\"": "Greg Guthrie",
    "\"Segment\"": "Corporate",
    "\"Country/Region\"": "United States",
    "\"City\"": "Los Angeles",
    "\"State\"": "California",
    "\"Postal Code\"": 90049.0,
    "\"Region\"": "West",
    "\"Product ID\"": "OFF-PA-10000477",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Paper",
    "\"Product Name\"": "Xerox 1952",
    "\"Sales\"": 64.74000000000001,
    "\"Quantity\"": 13,
    "\"Discount\"": 0.0,
    "\"Profit\"": 30.427800000000005
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 93,
    "\"Order ID\"": "CA-2017-149587",
    "\"Order Date\"": "2017-01-31",
    "\"Ship Date\"": "2017-02-05",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "KB-16315",
    "\"Customer Name\"": "Karl Braun",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "Minneapolis",
    "\"State\"": "Minnesota",
    "\"Postal Code\"": 55407.0,
    "\"Region\"": "Central",
    "\"Product ID\"": "OFF-PA-10003177",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Paper",
    "\"Product Name\"": "Xerox 1999",
    "\"Sales\"": 12.96,
    "\"Quantity\"": 2,
    "\"Discount\"": 0.0,
    "\"Profit\"": 6.2208000000000006
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 3250,
    "\"Order ID\"": "CA-2018-159730",
    "\"Order Date\"": "2018-09-17",
    "\"Ship Date\"": "2018-09-21",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "SJ-20125",
    "\"Customer Name\"": "Sanjit Jacobs",
    "\"Segment\"": "Home Office",
    "\"Country/Region\"": "United States",
    "\"City\"": "Seattle",
    "\"State\"": "Washington",
    "\"Postal Code\"": 98103.0,
    "\"Region\"": "West",
    "\"Product ID\"": "TEC-PH-10002085",
    "\"Category\"": "Technology",
    "\"Sub-Category\"": "Phones",
    "\"Product Name\"": "Clarity 53712",
    "\"Sales\"": 105.584,
    "\"Quantity\"": 2,
    "\"Discount\"": 0.2,
    "\"Profit\"": 7.9188000000000045
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 2515,
    "\"Order ID\"": "CA-2018-124506",
    "\"Order Date\"": "2018-11-11",
    "\"Ship Date\"": "2018-11-17",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "BB-11545",
    "\"Customer Name\"": "Brenda Bowman",
    "\"Segment\"": "Corporate",
    "\"Country/Region\"": "United States",
    "\"City\"": "Chicago",
    "\"State\"": "Illinois",
    "\"Postal Code\"": 60623.0,
    "\"Region\"": "Central",
    "\"Product ID\"": "FUR-CH-10004540",
    "\"Category\"": "Furniture",
    "\"Sub-Category\"": "Chairs",
    "\"Product Name\"": "Global Chrome Stack Chair",
    "\"Sales\"": 47.992,
    "\"Quantity\"": 2,
    "\"Discount\"": 0.3,
    "\"Profit\"": -2.056799999999999
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 7110,
    "\"Order ID\"": "CA-2018-109666",
    "\"Order Date\"": "2018-04-19",
    "\"Ship Date\"": "2018-04-26",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "KM-16720",
    "\"Customer Name\"": "Kunst Miller",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "New York City",
    "\"State\"": "New York",
    "\"Postal Code\"": 10035.0,
    "\"Region\"": "East",
    "\"Product ID\"": "OFF-ST-10000991",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Storage",
    "\"Product Name\"": "Space Solutions HD Industrial Steel Shelving.",
    "\"Sales\"": 459.88,
    "\"Quantity\"": 4,
    "\"Discount\"": 0.0,
    "\"Profit\"": 13.796400000000006
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 6276,
    "\"Order ID\"": "US-2018-139087",
    "\"Order Date\"": "2018-07-17",
    "\"Ship Date\"": "2018-07-22",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "DK-13375",
    "\"Customer Name\"": "Dennis Kane",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "Seattle",
    "\"State\"": "Washington",
    "\"Postal Code\"": 98105.0,
    "\"Region\"": "West",
    "\"Product ID\"": "FUR-FU-10004164",
    "\"Category\"": "Furniture",
    "\"Sub-Category\"": "Furnishings",
    "\"Product Name\"": "Eldon 300 Class Desk Accessories, Black",
    "\"Sales\"": 24.75,
    "\"Quantity\"": 5,
    "\"Discount\"": 0.0,
    "\"Profit\"": 10.890000000000002
  }
]
```

Please generate the complete React application code, including the main App component, individual chart components, and the data loading logic.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/Orders (Sample - Superstore).csv

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
const rows = await loadCsv("/data/Orders (Sample - Superstore).csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_269/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: CustomerName by Contex Filter
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([federated.14xopvj0hljvvr121wbdb1sj0phz].[none:City:nk] / [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Customer Name:nk])`
- cols_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Sales:qk]`
- series_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[none:City:nk]`
- bar_orientation: `horizontal`
- highlight_fields: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:City:nk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Customer Name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales by Category with Filter
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Sales:qk]`
- cols_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Category:nk]`
- series_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Profit:qk]`
- bar_orientation: `vertical`
- highlight_fields: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Category:nk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[yr:Order Date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales by Product Names with Filter
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Sales:qk]`
- cols_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Product Name:nk]`
- series_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Sales:qk]`
- bar_orientation: `vertical`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: Sales by Region
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Sales:qk]`
- cols_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Region:nk]`
- series_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Profit:qk]`
- bar_orientation: `vertical`
- zone: x=539, y=929, w=42959, h=49071
- legend_required: true
- legend_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Profit:qk]`
- legend_relative_position: overlay
- highlight_fields: [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Profit:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales by States
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[none:State:nk]`
- cols_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Sales:qk]`
- series_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Profit:qk]`
- bar_orientation: `horizontal`
- zone: x=43497, y=50000, w=42959, h=49071
- highlight_fields: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Country/Region:nk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:State:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales&Profit Crosstab
- chart_intent: `custom_tableau_view`
- rows_field: `([federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Category:nk] / [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Sub-Category:nk])`
- cols_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[:Measure Names]`
- series_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[:Measure Names]`
- series_order: [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Sales:qk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Profit:qk]
- expected_series_values: [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Sales:qk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Profit:qk]
- highlight_fields: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Category:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales&Profit by Subcategory
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Category:nk] / [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Sub-Category:nk])`
- cols_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Sales:qk]`
- series_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Profit:qk]`
- bar_orientation: `horizontal`
- zone: x=43498, y=929, w=42958, h=49071
- highlight_fields: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Category:nk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Sub-Category:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales&Profits by Product Name
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Product Name:nk]`
- cols_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[:Measure Names]`
- series_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[:Measure Names]`
- series_order: [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Sales:qk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Profit:qk]
- expected_series_values: [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Sales:qk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Profit:qk]
- zone: x=539, y=50000, w=42958, h=49071
- highlight_fields: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Product Name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales&Profits by Subcategory&Product Name
- chart_intent: `custom_tableau_view`
- rows_field: `([federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Sub-Category:nk] / [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Product Name:nk])`
- cols_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[:Measure Names]`
- series_field: `[federated.14xopvj0hljvvr121wbdb1sj0phz].[:Measure Names]`
- series_order: [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Sales:qk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Profit:qk]
- expected_series_values: [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Sales:qk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Profit:qk]
- highlight_fields: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Product Name:nk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Sub-Category:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Sales by Region, target=Dashboard 1
- Filter 2 (generated): kind=filter_action, source=Sales by States, target=Dashboard 1
- Filter 3 (generated): kind=filter_action, source=Sales&Profit by Subcategory, target=Dashboard 1
## Highlight Bindings
- Sales by Region: [federated.14xopvj0hljvvr121wbdb1sj0phz].[sum:Profit:qk]
- Sales&Profit by Subcategory: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Category:nk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Sub-Category:nk]
- Sales&Profit Crosstab: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Category:nk]
- Sales&Profits by Subcategory&Product Name: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Product Name:nk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Sub-Category:nk]
- Sales by Category with Filter: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Category:nk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[yr:Order Date:ok]
- CustomerName by Contex Filter: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:City:nk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Customer Name:nk]
- Sales&Profits by Product Name: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Product Name:nk]
- Sales by States: [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:Country/Region:nk], [federated.14xopvj0hljvvr121wbdb1sj0phz].[none:State:nk]
