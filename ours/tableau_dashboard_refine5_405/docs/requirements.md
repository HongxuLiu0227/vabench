# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled "Synthetic Dashboard 405".

## Tech Stack
- React 18+ with TypeScript.
- Vite for build tooling.
- D3.js (v7+) for visualizations (use `d3-scale`, `d3-axis`, `d3-shape`, `d3-array`, `d3-selection`).
- PapaParse for parsing CSV data.
- CSS for styling (no external UI component libraries required).

## Data Loading
The application must load data from the following URL:
`/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv`

Implement a `useData` hook that:
1. Uses `fetch()` to retrieve the CSV.
2. Uses `PapaParse` to parse the CSV string into an array of objects.
3. Type the data strictly. The CSV columns are: `Category`, `City`, `Country`, `Customer Name`, `Manufacturer`, `Order Date`, `Order ID`, `Postal Code`, `Product Name`, `Region`, `Segment`, `Ship Date`, `Ship Mode`, `State`, `Sub-Category`, `Discount`, `Number of Records`, `Profit`, `Profit Ratio`, `Quantity`, `Sales`.
4. Converts numeric fields (`Sales`, `Profit`, `Quantity`, `Discount`) from strings to numbers.
5. Converts date fields (`Order Date`, `Ship Date`) to Date objects.
6. Returns the typed array.

## Sample Data
```json
[
  {
    "﻿Category": "Office Supplies",
    "City": "Delray Beach",
    "Country": "United States",
    "Customer Name": "Bruce Geld",
    "Manufacturer": "Avery",
    "Order Date": "2011-03-23",
    "Order ID": "CA-2011-164749",
    "Postal Code": 33445,
    "Product Name": "Avery 476",
    "Region": "South",
    "Segment": "Consumer",
    "Ship Date": "2011-03-26",
    "Ship Mode": "First Class",
    "State": "Florida",
    "Sub-Category": "Labels",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 3,
    "Profit Ratio": 0.33,
    "Quantity": 3,
    "Sales": 10
  },
  {
    "﻿Category": "Office Supplies",
    "City": "New York City",
    "Country": "United States",
    "Customer Name": "Andy Reiter",
    "Manufacturer": "Acco",
    "Order Date": "2014-12-25",
    "Order ID": "CA-2014-154935",
    "Postal Code": 10024,
    "Product Name": "Acco Four Pocket Poly Ring Binder with Label Holder, Smoke, 1\"",
    "Region": "East",
    "Segment": "Consumer",
    "Ship Date": "2014-12-30",
    "Ship Mode": "Standard Class",
    "State": "New York",
    "Sub-Category": "Binders",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 6,
    "Profit Ratio": 0.31,
    "Quantity": 3,
    "Sales": 18
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Aurora",
    "Country": "United States",
    "Customer Name": "Tony Chapman",
    "Manufacturer": "Belkin",
    "Order Date": "2012-04-27",
    "Order ID": "CA-2012-151841",
    "Postal Code": 80013,
    "Product Name": "Belkin 6 Outlet Metallic Surge Strip",
    "Region": "West",
    "Segment": "Home Office",
    "Ship Date": "2012-05-02",
    "Ship Mode": "Standard Class",
    "State": "Colorado",
    "Sub-Category": "Appliances",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 3,
    "Profit Ratio": 0.08,
    "Quantity": 5,
    "Sales": 44
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Sacramento",
    "Country": "United States",
    "Customer Name": "Jane Waco",
    "Manufacturer": "Fellowes",
    "Order Date": "2014-10-14",
    "Order ID": "CA-2014-135909",
    "Postal Code": 95823,
    "Product Name": "Fellowes PB500 Electric Punch Plastic Comb Binding Machine with Manual Bind",
    "Region": "West",
    "Segment": "Corporate",
    "Ship Date": "2014-10-21",
    "Ship Mode": "Standard Class",
    "State": "California",
    "Sub-Category": "Binders",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 1906,
    "Profit Ratio": 0.38,
    "Quantity": 5,
    "Sales": 5084
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Jacksonville",
    "Country": "United States",
    "Customer Name": "Sung Pak",
    "Manufacturer": "Xerox",
    "Order Date": "2014-09-29",
    "Order ID": "CA-2014-160017",
    "Postal Code": 32216,
    "Product Name": "Xerox 220",
    "Region": "South",
    "Segment": "Corporate",
    "Ship Date": "2014-10-03",
    "Ship Mode": "Standard Class",
    "State": "Florida",
    "Sub-Category": "Paper",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 4,
    "Profit Ratio": 0.35,
    "Quantity": 2,
    "Sales": 10
  },
  {
    "﻿Category": "Technology",
    "City": "Lorain",
    "Country": "United States",
    "Customer Name": "Alejandro Ballentine",
    "Manufacturer": "Other",
    "Order Date": "2014-06-03",
    "Order ID": "CA-2014-127705",
    "Postal Code": 44052,
    "Product Name": "Cush Cases Heavy Duty Rugged Cover Case for Samsung Galaxy S5 - Purple",
    "Region": "East",
    "Segment": "Home Office",
    "Ship Date": "2014-06-07",
    "Ship Mode": "Standard Class",
    "State": "Ohio",
    "Sub-Category": "Phones",
    "Discount": 0.4,
    "Number of Records": 1,
    "Profit": -1,
    "Profit Ratio": -0.22,
    "Quantity": 1,
    "Sales": 3
  },
  {
    "﻿Category": "Furniture",
    "City": "Arlington",
    "Country": "United States",
    "Customer Name": "Lindsay Castell",
    "Manufacturer": "Other",
    "Order Date": "2013-10-21",
    "Order ID": "CA-2013-105753",
    "Postal Code": 22204,
    "Product Name": "Aluminum Document Frame",
    "Region": "South",
    "Segment": "Home Office",
    "Ship Date": "2013-10-27",
    "Ship Mode": "Standard Class",
    "State": "Virginia",
    "Sub-Category": "Furnishings",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 18,
    "Profit Ratio": 0.3,
    "Quantity": 5,
    "Sales": 61
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Houston",
    "Country": "United States",
    "Customer Name": "Steve Chapman",
    "Manufacturer": "Fellowes",
    "Order Date": "2014-10-03",
    "Order ID": "CA-2014-152926",
    "Postal Code": 77041,
    "Product Name": "Fellowes Superior 10 Outlet Split Surge Protector",
    "Region": "Central",
    "Segment": "Corporate",
    "Ship Date": "2014-10-05",
    "Ship Mode": "Second Class",
    "State": "Texas",
    "Sub-Category": "Appliances",
    "Discount": 0.8,
    "Number of Records": 1,
    "Profit": -39,
    "Profit Ratio": -2.55,
    "Quantity": 2,
    "Sales": 15
  },
  {
    "﻿Category": "Technology",
    "City": "Houston",
    "Country": "United States",
    "Customer Name": "Sean Braxton",
    "Manufacturer": "Other",
    "Order Date": "2011-09-19",
    "Order ID": "US-2011-106992",
    "Postal Code": 77036,
    "Product Name": "Lexmark MX611dhe Monochrome Laser Printer",
    "Region": "Central",
    "Segment": "Corporate",
    "Ship Date": "2011-09-21",
    "Ship Mode": "Second Class",
    "State": "Texas",
    "Sub-Category": "Machines",
    "Discount": 0.4,
    "Number of Records": 1,
    "Profit": -510,
    "Profit Ratio": -0.17,
    "Quantity": 3,
    "Sales": 3060
  },
  {
    "﻿Category": "Furniture",
    "City": "Apopka",
    "Country": "United States",
    "Customer Name": "Chloris Kastensmidt",
    "Manufacturer": "Other",
    "Order Date": "2011-07-28",
    "Order ID": "CA-2011-131541",
    "Postal Code": 32712,
    "Product Name": "DataProducts Ampli Magnifier Task Lamp, Black,",
    "Region": "South",
    "Segment": "Consumer",
    "Ship Date": "2011-07-28",
    "Ship Mode": "Same Day",
    "State": "Florida",
    "Sub-Category": "Furnishings",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 13,
    "Profit Ratio": 0.1,
    "Quantity": 6,
    "Sales": 130
  }
]
```

## Dashboard Layout
The main dashboard component should use CSS Grid to replicate the layout defined in the workbook.
- **Container**: Fixed aspect ratio or responsive container approximating 1000x800 units.
- **Grid Template**: 2 rows, 2 columns.
  - **Row 1**: Height ~62%.
    - **Column 1**: "Discount Overview by Region" (Width 50%).
    - **Column 2**: "Sales by Sub Category" (Width 50%).
  - **Row 2**: Height ~38%.
    - **Column 1 & 2 (Span)**: "Scatterplot" (Full Width).
- **Styling**:
  - Dashboard background: `#e6e6e6`.
  - Sheet containers: White background, 4px margin, 8px padding.
  - Font: Sans-serif (e.g., Arial, Helvetica).

## Component Specifications

### 1. Discount Overview by Region (`DiscountOverview`)
- **Type**: Highlight Table (Heatmap-style text table).
- **Data Preparation**:
  - Group data by `Region`.
  - Calculate metrics per region:
    - `Avg Discount`: Average of `Discount`.
    - `Sum Profit`: Sum of `Profit`.
    - `Profit Ratio`: `Sum Profit` / `Sum Sales`.
    - `Sum Quantity`: Sum of `Quantity`.
    - `Sum Sales`: Sum of `Sales`.
- **Visual Encoding**:
  - **Rows**: Region names.
  - **Columns**: 5 columns corresponding to the metrics above (Order: Discount, Profit, Profit Ratio, Quantity, Sales).
  - **Color**: The background color of the cells (or the text color) should be determined by the `Avg Discount` value.
    - Use a D3 diverging scale (e.g., `d3.scaleDiverging` with `d3.interpolateRdBu` or similar orange-blue palette).
    - Domain: [0.0, 0.4].
    - Logic: Lower discounts (0.0) tend towards one color, higher discounts (0.4) towards the other. The workbook specifies "orange_blue_diverging_10_0" reversed.
  - **Labels**: Show the calculated values formatted appropriately (Currency for Sales/Profit, Percentage for Discount/Ratio, Integer for Quantity).
- **Tooltip**: Display Region and the specific Measure Name/Value on hover.

### 2. Sales by Sub Category (`SalesBySubCategory`)
- **Type**: Horizontal Bar Chart.
- **Data Preparation**:
  - Group data by `Sub-Category`.
  - Calculate `Sum Sales` per `Sub-Category`.
  - Sort by `Sum Sales` descending.
- **Visual Encoding**:
  - **X-Axis**: `Sum Sales` (Linear scale).
  - **Y-Axis**: `Sub-Category` (Band scale).
  - **Marks**: Bars.
  - **Color**: Standard blue (e.g., `#1f77b4`) or similar Tableau default blue.
- **Labels**: Display Sales value at the end of the bar.

### 3. Scatterplot (`Scatterplot`)
- **Type**: Scatter Plot.
- **Data Preparation**:
  - Group data by `Product Name` (Level of Detail).
  - Calculate `Sum Sales`, `Sum Profit`, and `Sum Quantity` per `Product Name`.
- **Visual Encoding**:
  - **X-Axis**: `Sum Sales` (Linear scale).
  - **Y-Axis**: `Sum Profit` (Linear scale).
  - **Size**: `Sum Quantity` (Radius scale).
  - **Color**: Fixed color `#75a1c7` (Tableau Blue) with a black stroke (`#000000`).
  - **Marks**: Circles.
- **Tooltip**: Display Product Name, Sales, Profit, and Quantity on hover.

## Implementation Details
- Use `useRef` and `useEffect` to integrate D3 with React.
- Ensure charts handle window resizing (listen to resize events and update D3 scales/renders).
- Format numbers:
  - Currency: `$#,##0` (e.g., $1,200).
  - Percentage: `0%` (e.g., 15%).
  - Integer: `#,##0`.
- Do not use any high-level charting libraries (like Recharts or Nivo). Use D3 primitives directly.
- Ensure the layout matches the "Synthetic Dashboard 405" structure exactly.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_405/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P2648__discount_overview_by_region
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Region:nk]`
- cols_field: `([ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[:Measure Names] * [ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[Multiple Values])`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[avg:Discount:qk]`
- zone: x=800, y=1000, w=49200, h=61748
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Sub-Category:nk] / [ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Product Name:nk])`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=50000, y=1000, w=49200, h=61750
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Profit:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=800, y=62750, w=98400, h=36250
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
