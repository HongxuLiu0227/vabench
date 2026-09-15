# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard exactly as defined in the provided workbook XML.

## Tech Stack
- React 18+ with TypeScript.
- Vite for build tooling.
- D3.js (v7+) for visualizations (use `d3-scale`, `d3-axis`, `d3-array`, `d3-selection`, `d3-shape`). Do not use high-level chart libraries like Recharts or Nivo.
- CSS for styling (CSS Modules or Tailwind CSS is acceptable, but keep it simple).

## Data Loading
The primary data source is a CSV file located at `/data/TEMP_1u7hox51ox1io4183hb2v01q3nst.csv`.

You must implement a data loading hook or utility that:
1. Fetches the CSV using the native `fetch` API.
2. Parses the CSV content into an array of objects. You can use `d3-dsv` (d3.csvParse) for robust parsing.
3. Infers TypeScript types for the rows based on the columns found in the file.

Example implementation logic:
```typescript
import { csvParse } from 'd3-dsv';

const loadData = async () => {
  const response = await fetch('/data/TEMP_1u7hox51ox1io4183hb2v01q3nst.csv');
  const csvText = await response.text();
  const data = csvParse(csvText);
  return data;
};
```

## Sample Data
Here is a sample of the data structure you will encounter:

```json
[
  {
    "﻿\"\"\"Row ID\"\"\"": 4173,
    "\"Order ID\"": "CA-2013-152163",
    "\"Order Date\"": "2013-07-02",
    "\"Ship Date\"": "2013-07-02",
    "\"Ship Mode\"": "Same Day",
    "\"Customer ID\"": "JF-15355",
    "\"Customer Name\"": "Jay Fein",
    "\"Segment\"": "Consumer",
    "\"Country\"": "United States",
    "\"City\"": "Columbia",
    "\"State\"": "South Carolina",
    "\"Postal Code\"": 29203,
    "\"Region\"": "South",
    "\"Product ID\"": "OFF-BI-10002215",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Binders",
    "\"Product Name\"": "Wilson Jones Hanging View Binder, White, 1\"",
    "\"Sales\"": 14.2,
    "\"Quantity\"": 2,
    "\"Discount\"": 0.0,
    "\"Profit\"": 6.531999999999999
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 7661,
    "\"Order ID\"": "CA-2011-105417",
    "\"Order Date\"": "2011-01-08",
    "\"Ship Date\"": "2011-01-13",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "VS-21820",
    "\"Customer Name\"": "Vivek Sundaresam",
    "\"Segment\"": "Consumer",
    "\"Country\"": "United States",
    "\"City\"": "Huntsville",
    "\"State\"": "Texas",
    "\"Postal Code\"": 77340,
    "\"Region\"": "Central",
    "\"Product ID\"": "FUR-FU-10004864",
    "\"Category\"": "Furniture",
    "\"Sub-Category\"": "Furnishings",
    "\"Product Name\"": "Howard Miller 14-1/2\" Diameter Chrome Round Wall Clock",
    "\"Sales\"": 76.72800000000001,
    "\"Quantity\"": 3,
    "\"Discount\"": 0.6,
    "\"Profit\"": -53.70959999999999
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 1011,
    "\"Order ID\"": "CA-2011-158540",
    "\"Order Date\"": "2011-11-24",
    "\"Ship Date\"": "2011-11-26",
    "\"Ship Mode\"": "First Class",
    "\"Customer ID\"": "VG-21790",
    "\"Customer Name\"": "Vivek Gonzalez",
    "\"Segment\"": "Consumer",
    "\"Country\"": "United States",
    "\"City\"": "San Diego",
    "\"State\"": "California",
    "\"Postal Code\"": 92037,
    "\"Region\"": "West",
    "\"Product ID\"": "FUR-FU-10001602",
    "\"Category\"": "Furniture",
    "\"Sub-Category\"": "Furnishings",
    "\"Product Name\"": "Eldon Delta Triangular Chair Mat, 52\" x 58\", Clear",
    "\"Sales\"": 151.72,
    "\"Quantity\"": 4,
    "\"Discount\"": 0.0,
    "\"Profit\"": 27.30959999999999
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 4054,
    "\"Order ID\"": "CA-2011-122931",
    "\"Order Date\"": "2011-09-29",
    "\"Ship Date\"": "2011-10-03",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "SM-20950",
    "\"Customer Name\"": "Suzanne McNair",
    "\"Segment\"": "Corporate",
    "\"Country\"": "United States",
    "\"City\"": "Philadelphia",
    "\"State\"": "Pennsylvania",
    "\"Postal Code\"": 19134,
    "\"Region\"": "East",
    "\"Product ID\"": "OFF-LA-10002945",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Labels",
    "\"Product Name\"": "Permanent Self-Adhesive File Folder Labels for Typewriters, 1 1/8 x 3 1/2, White",
    "\"Sales\"": 55.44,
    "\"Quantity\"": 11,
    "\"Discount\"": 0.2,
    "\"Profit\"": 18.017999999999997
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 2908,
    "\"Order ID\"": "CA-2014-121615",
    "\"Order Date\"": "2014-11-04",
    "\"Ship Date\"": "2014-11-10",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "DL-12925",
    "\"Customer Name\"": "Daniel Lacy",
    "\"Segment\"": "Consumer",
    "\"Country\"": "United States",
    "\"City\"": "Eagan",
    "\"State\"": "Minnesota",
    "\"Postal Code\"": 55122,
    "\"Region\"": "Central",
    "\"Product ID\"": "OFF-ST-10001325",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Storage",
    "\"Product Name\"": "Sterilite Officeware Hinged File Box",
    "\"Sales\"": 52.400000000000006,
    "\"Quantity\"": 5,
    "\"Discount\"": 0.0,
    "\"Profit\"": 14.148
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 3312,
    "\"Order ID\"": "CA-2013-162747",
    "\"Order Date\"": "2013-03-21",
    "\"Ship Date\"": "2013-03-26",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "AH-10030",
    "\"Customer Name\"": "Aaron Hawkins",
    "\"Segment\"": "Corporate",
    "\"Country\"": "United States",
    "\"City\"": "Gulfport",
    "\"State\"": "Mississippi",
    "\"Postal Code\"": 39503,
    "\"Region\"": "South",
    "\"Product ID\"": "FUR-FU-10003691",
    "\"Category\"": "Furniture",
    "\"Sub-Category\"": "Furnishings",
    "\"Product Name\"": "Eldon Image Series Desk Accessories, Ebony",
    "\"Sales\"": 86.45,
    "\"Quantity\"": 7,
    "\"Discount\"": 0.0,
    "\"Profit\"": 38.038000000000004
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 782,
    "\"Order ID\"": "US-2012-157014",
    "\"Order Date\"": "2012-10-03",
    "\"Ship Date\"": "2012-10-06",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "BM-11785",
    "\"Customer Name\"": "Bryan Mills",
    "\"Segment\"": "Consumer",
    "\"Country\"": "United States",
    "\"City\"": "Columbus",
    "\"State\"": "Ohio",
    "\"Postal Code\"": 43229,
    "\"Region\"": "East",
    "\"Product ID\"": "OFF-BI-10001098",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Binders",
    "\"Product Name\"": "Acco D-Ring Binder w/DublLock",
    "\"Sales\"": 32.07,
    "\"Quantity\"": 5,
    "\"Discount\"": 0.7,
    "\"Profit\"": -22.44899999999999
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 4607,
    "\"Order ID\"": "CA-2012-135020",
    "\"Order Date\"": "2012-05-28",
    "\"Ship Date\"": "2012-06-02",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "MS-17770",
    "\"Customer Name\"": "Maxwell Schwartz",
    "\"Segment\"": "Consumer",
    "\"Country\"": "United States",
    "\"City\"": "Rochester",
    "\"State\"": "New York",
    "\"Postal Code\"": 14609,
    "\"Region\"": "East",
    "\"Product ID\"": "TEC-PH-10004093",
    "\"Category\"": "Technology",
    "\"Sub-Category\"": "Phones",
    "\"Product Name\"": "Panasonic Kx-TS550",
    "\"Sales\"": 45.99,
    "\"Quantity\"": 1,
    "\"Discount\"": 0.0,
    "\"Profit\"": 13.3371
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 1610,
    "\"Order ID\"": "US-2013-115819",
    "\"Order Date\"": "2013-04-20",
    "\"Ship Date\"": "2013-04-25",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "JO-15280",
    "\"Customer Name\"": "Jas O'Carroll",
    "\"Segment\"": "Consumer",
    "\"Country\"": "United States",
    "\"City\"": "Los Angeles",
    "\"State\"": "California",
    "\"Postal Code\"": 90049,
    "\"Region\"": "West",
    "\"Product ID\"": "OFF-BI-10000591",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Binders",
    "\"Product Name\"": "Avery Binder Labels",
    "\"Sales\"": 9.336,
    "\"Quantity\"": 3,
    "\"Discount\"": 0.2,
    "\"Profit\"": 3.2675999999999994
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 4251,
    "\"Order ID\"": "CA-2011-168130",
    "\"Order Date\"": "2011-09-19",
    "\"Ship Date\"": "2011-09-19",
    "\"Ship Mode\"": "Same Day",
    "\"Customer ID\"": "BS-11365",
    "\"Customer Name\"": "Bill Shonely",
    "\"Segment\"": "Corporate",
    "\"Country\"": "United States",
    "\"City\"": "New York City",
    "\"State\"": "New York",
    "\"Postal Code\"": 10011,
    "\"Region\"": "East",
    "\"Product ID\"": "FUR-CH-10000988",
    "\"Category\"": "Furniture",
    "\"Sub-Category\"": "Chairs",
    "\"Product Name\"": "Hon Olson Stacker Stools",
    "\"Sales\"": 887.103,
    "\"Quantity\"": 7,
    "\"Discount\"": 0.1,
    "\"Profit\"": 177.42059999999998
  }
]
```

## Global State & Filters
The dashboard relies on a shared state for filtering. You should implement a Context API or a state management solution to handle:

1.  **Global Filters**:
    -   `year`: string (derived from `Order Date`, formatted as 'YYYY'). Default: All.
    -   `segment`: string. Default: All.
    -   `region`: string. Default: All.
    -   `category`: string. Default: All.

2.  **Interactions (Actions)**:
    -   `selectedRegion`: string | null. (Triggered by selecting a Region in the 'Customer Overview' sheet).
    -   `selectedCustomer`: string | null. (Triggered by selecting a mark in the 'Sales and Profit by Customers' sheet).
    -   `hoveredCustomer`: string | null. (Triggered by hovering marks in 'Sales and Profit by Customers' or 'Customer Rank').

## Layout Specification
The main dashboard layout should use CSS Grid to replicate the Tableau 'Dashboard' layout.

- **Grid Structure**:
  - Top Row: `Customer Overview` (Spans full width).
  - Bottom Row: Split into three columns.
    - Left: `Sales and Profit by Customers` (Scatter Plot).
    - Middle: `Customer Rank` (Bar Chart).
    - Right: `Filter Controls` (Year, Segment, Region) and `Color Legend`.

## Component Specifications

### 1. Customer Overview (Top)
- **Type**: Heatmap / Text Table.
- **Data Logic**:
  - Group data by `Region`.
  - Calculate the following measures per Region:
    - `Sales per Customer`: `SUM(Sales) / COUNTD(Customer Name)`
    - `Sales`: `SUM(Sales)`
    - `Quantity`: `SUM(Quantity)`
    - `Profit`: `SUM(Profit)`
    - `Profit Ratio`: `SUM(Profit) / SUM(Sales)`
- **Visual Encoding**:
  - Rows: `Region`.
  - Columns: The 5 measures listed above.
  - Color: The background color of the cells (or text color) should be encoded by `Profit Ratio`.
  - Color Scale: Diverging scale (e.g., Red to Green), range `[-0.5, 0.5]`. Center at 0.
- **Interactions**:
  - **Click on a Region Row**: Triggers `Action1`. Sets the `selectedRegion` state, which filters the bottom two charts (`Sales and Profit by Customers` and `Customer Rank`).
  - **Tooltip**: Show Region, Number of Customers, and the specific measure values.

### 2. Sales and Profit by Customers (Bottom Left)
- **Type**: Scatter Plot.
- **Data Logic**:
  - Group data by `Customer Name`.
  - X-Axis: `SUM(Sales)`.
  - Y-Axis: `SUM(Profit)`.
  - Color: `Profit Ratio` (Same diverging scale as above).
- **Visual Encoding**:
  - Marks: Circles.
  - Axes: Standard numeric axes with currency formatting ($).
- **Interactions**:
  - **Click on a Circle**: Triggers `Action3`. Sets the `selectedCustomer` state, which filters the `Customer Rank` chart.
  - **Hover on a Circle**: Triggers `Action2`. Sets `hoveredCustomer` state to highlight the specific customer in the `Customer Rank` chart (reduce opacity of non-hovered items).
  - **Tooltip**: Customer Name, Region, Profit, Sales, Profit Ratio.

### 3. Customer Rank (Bottom Middle)
- **Type**: Horizontal Bar Chart.
- **Data Logic**:
  - Group data by `Customer Name`.
  - Measure: `SUM(Sales)`.
  - Sorting: Descending by Sales.
- **Visual Encoding**:
  - Y-Axis: `Customer Name`.
  - X-Axis: `SUM(Sales)`.
  - Color: `Profit Ratio` (Same diverging scale).
- **Interactions**:
  - **Hover on a Bar**: Triggers `Action2`. Sets `hoveredCustomer` state to highlight the specific customer in the Scatter Plot.
  - **Tooltip**: Customer Name, Rank of Sales, Profit, Sales, Profit Ratio.

### 4. Filter Controls (Bottom Right)
- **Year Filter**: Dropdown (Select). Extracts year from `Order Date`. Defaults to 'All'.
- **Segment Filter**: Radio List (Consumer, Corporate, Home Office). Defaults to 'All'.
- **Region Filter**: Radio List (West, East, Central, South). Defaults to 'All'.
- **Color Legend**: A gradient bar showing the `Profit Ratio` scale (-0.5 to 0.5).

## Implementation Details

### Calculations
You must implement the following helper functions to match Tableau's logic:
- `sum(array, accessor)`
- `countDistinct(array, accessor)` (e.g., use a `Set` to count unique Customer Names).
- `profitRatio(profit, sales)`

### Styling
- Use a clean, sans-serif font (e.g., Arial, Helvetica, system-ui).
- Ensure the layout is responsive. On smaller screens, the bottom row should stack vertically.
- Match the color palette for the `Profit Ratio`:
  - Negative values: Red/Orange tones.
  - Positive values: Green/Blue tones.
  - Zero: Neutral/White.

### D3 Integration
- Use `useRef` to select SVG or HTML container elements.
- Use `useEffect` to render charts when data or filter dependencies change.
- Use `d3.scaleLinear`, `d3.scaleBand`, `d3.scaleSequential` (or `d3.scaleDiverging`) for mapping data to visual attributes.
- Use `d3.axisBottom`, `d3.axisLeft` for axes.

### Wiring Interactions
1.  **Filter Region**: When a user clicks a row in `Customer Overview`, update the global `region` filter. Re-run the data aggregation for `Sales and Profit by Customers` and `Customer Rank` using this filter.
2.  **Filter Customer**: When a user clicks a circle in `Sales and Profit by Customers`, update the global `customerName` filter. Re-run data aggregation for `Customer Rank`.
3.  **Highlight**: When `hoveredCustomer` is set, apply a CSS class (e.g., `opacity: 0.3`) to all marks in the target chart that do *not* match the hovered customer name.

Please generate the complete React + TypeScript code to implement this dashboard.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_1968/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Customer Overview
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Region:nk]`
- cols_field: `([federated.11oeaww0axzaij1b29ohm0h7pnml].[:Measure Names] * [federated.11oeaww0axzaij1b29ohm0h7pnml].[Multiple Values])`
- series_field: `[federated.11oeaww0axzaij1b29ohm0h7pnml].[usr:Calculation_345932813618278400:qk]`
- zone: x=693, y=1351, w=98614, h=26690
- highlight_fields: [federated.11oeaww0axzaij1b29ohm0h7pnml].[:Measure Names], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Category:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Customer Name:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Region:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Segment:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Customer Rank
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Customer Name:nk]`
- cols_field: `[federated.11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- series_field: `[federated.11oeaww0axzaij1b29ohm0h7pnml].[usr:Calculation_345932813618278400:qk]`
- bar_orientation: `horizontal`
- zone: x=42338, y=28041, w=44588, h=70608
- highlight_fields: [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Customer Name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales and Profit by Customers
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.11oeaww0axzaij1b29ohm0h7pnml].[sum:Profit:qk]`
- cols_field: `[federated.11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- series_field: `[federated.11oeaww0axzaij1b29ohm0h7pnml].[usr:Calculation_345932813618278400:qk]`
- zone: x=693, y=28041, w=41645, h=70608
- legend_required: true
- legend_field: `[federated.11oeaww0axzaij1b29ohm0h7pnml].[usr:Calculation_345932813618278400:qk]`
- legend_relative_position: right
- highlight_fields: [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Category:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Customer Name:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Region:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Segment:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[yr:Order Date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter Region: kind=filter_action, source=Customer Overview, target=Dashboard
- Highlight Customer: kind=highlight_brush, source=Dashboard, target=Dashboard
  fields: Customer Name
- Filter Lower: kind=filter_action, source=Sales and Profit by Customers, target=Dashboard
## Highlight Bindings
- Sales and Profit by Customers: [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Category:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Customer Name:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Region:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Segment:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[yr:Order Date:ok]
- Customer Rank: [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Customer Name:nk]
- Customer Overview: [federated.11oeaww0axzaij1b29ohm0h7pnml].[:Measure Names], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Category:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Customer Name:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Region:nk], [federated.11oeaww0axzaij1b29ohm0h7pnml].[none:Segment:nk]
