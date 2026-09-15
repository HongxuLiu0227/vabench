# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled "Synthetic Dashboard 182".

## Tech Stack & Constraints
- **Framework:** React + TypeScript + Vite.
- **Visualization:** Use D3.js primitives (d3-scale, d3-shape, d3-axis, d3-array, d3-selection) for all charts. Do not use high-level chart libraries like Recharts or Nivo.
- **Styling:** Use CSS Modules or standard CSS. Use CSS Grid for the main dashboard layout.
- **Data:** Load data from the provided URL using the native Fetch API.

## Data Loading

The primary data source is a CSV file located at:
`/data/1968_dash_dashboard0_png_coursera_course_204_week_203_dashboard/p1968_TEMP_1u7hox51ox1io4183hb2v01q3nst.csv`

You must implement a `useData` hook or utility function that:
1. Fetches the CSV file using `fetch()`.
2. Parses the CSV content into an array of objects. You can use `d3-dsv` (d3.csvParse) or write a simple parser.
3. Type the data according to the schema below.
4. Handles loading and error states.

### Data Schema
The CSV contains the following columns. Create a TypeScript interface `SuperstoreData` reflecting these:
- `Row ID`: number
- `Order ID`: string
- `Order Date`: Date (parse from string)
- `Ship Date`: Date (parse from string)
- `Ship Mode`: string
- `Customer ID`: string
- `Customer Name`: string
- `Segment`: string
- `Country`: string
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

### Sample Data
```json
[
  {
    "﻿Row ID": 8276,
    "Order ID": "CA-2012-143882",
    "Order Date": "2012-06-26",
    "Ship Date": "2012-06-30",
    "Ship Mode": "Standard Class",
    "Customer ID": "DB-13360",
    "Customer Name": "Dennis Bolton",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "Lakewood",
    "State": "Ohio",
    "Postal Code": 44107,
    "Region": "East",
    "Product ID": "OFF-PA-10004040",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Universal Premium White Copier/Laser Paper (20Lb. and 87 Bright)",
    "Sales": 43.056000000000004,
    "Quantity": 9,
    "Discount": 0.2,
    "Profit": 15.6078
  },
  {
    "﻿Row ID": 9822,
    "Order ID": "CA-2012-162201",
    "Order Date": "2012-06-08",
    "Ship Date": "2012-06-12",
    "Ship Mode": "Standard Class",
    "Customer ID": "AG-10495",
    "Customer Name": "Andrew Gjertsen",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Saint Petersburg",
    "State": "Florida",
    "Postal Code": 33710,
    "Region": "South",
    "Product ID": "OFF-BI-10002429",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Premier Elliptical Ring Binder, Black",
    "Sales": 18.264000000000003,
    "Quantity": 2,
    "Discount": 0.7,
    "Profit": -13.3936
  },
  {
    "﻿Row ID": 589,
    "Order ID": "US-2013-156986",
    "Order Date": "2013-03-21",
    "Ship Date": "2013-03-25",
    "Ship Mode": "Standard Class",
    "Customer ID": "ZC-21910",
    "Customer Name": "Zuschuss Carroll",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Salem",
    "State": "Oregon",
    "Postal Code": 97301,
    "Region": "West",
    "Product ID": "TEC-PH-10003800",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "i.Sound Portable Power - 8000 mAh",
    "Sales": 84.784,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": -20.136200000000006
  },
  {
    "﻿Row ID": 2256,
    "Order ID": "CA-2013-164091",
    "Order Date": "2013-09-18",
    "Ship Date": "2013-09-23",
    "Ship Mode": "Standard Class",
    "Customer ID": "LA-16780",
    "Customer Name": "Laura Armstrong",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Bangor",
    "State": "Maine",
    "Postal Code": 4401,
    "Region": "East",
    "Product ID": "TEC-PH-10001944",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Wi-Ex zBoost YX540 Cellular Phone Signal Booster",
    "Sales": 437.84999999999997,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 131.35499999999996
  },
  {
    "﻿Row ID": 6329,
    "Order ID": "CA-2011-167927",
    "Order Date": "2011-01-21",
    "Ship Date": "2011-01-27",
    "Ship Mode": "Standard Class",
    "Customer ID": "XP-21865",
    "Customer Name": "Xylona Preis",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Westland",
    "State": "Michigan",
    "Postal Code": 48185,
    "Region": "Central",
    "Product ID": "OFF-BI-10000605",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Acco Pressboard Covers with Storage Hooks, 9 1/2\" x 11\"\"",
    "Sales": "Executive Red\"",
    "Quantity": 19.05,
    "Discount": 5,
    "Profit": 0.0,
    "null": "['8.953499999999998']"
  },
  {
    "﻿Row ID": 855,
    "Order ID": "CA-2013-123274",
    "Order Date": "2013-02-19",
    "Ship Date": "2013-02-24",
    "Ship Mode": "Standard Class",
    "Customer ID": "GT-14710",
    "Customer Name": "Greg Tran",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10035,
    "Region": "East",
    "Product ID": "OFF-ST-10000736",
    "Category": "Office Supplies",
    "Sub-Category": "Storage",
    "Product Name": "Carina Double Wide Media Storage Towers in Natural & Black",
    "Sales": 242.94,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 9.71759999999999
  },
  {
    "﻿Row ID": 315,
    "Order ID": "CA-2011-167850",
    "Order Date": "2011-08-09",
    "Ship Date": "2011-08-16",
    "Ship Mode": "Standard Class",
    "Customer ID": "AG-10525",
    "Customer Name": "Andy Gerbode",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Saint Petersburg",
    "State": "Florida",
    "Postal Code": 33710,
    "Region": "South",
    "Product ID": "TEC-PH-10002398",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "AT&T 1070 Corded Phone",
    "Sales": 178.38400000000001,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 22.297999999999973
  },
  {
    "﻿Row ID": 2358,
    "Order ID": "US-2011-148838",
    "Order Date": "2011-03-17",
    "Ship Date": "2011-03-21",
    "Ship Mode": "Standard Class",
    "Customer ID": "CP-12340",
    "Customer Name": "Christine Phan",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10024,
    "Region": "East",
    "Product ID": "FUR-TA-10003473",
    "Category": "Furniture",
    "Sub-Category": "Tables",
    "Product Name": "Bretford Rectangular Conference Table Tops",
    "Sales": 1579.746,
    "Quantity": 7,
    "Discount": 0.4,
    "Profit": -447.5946999999999
  },
  {
    "﻿Row ID": 8750,
    "Order ID": "US-2012-163825",
    "Order Date": "2012-06-16",
    "Ship Date": "2012-06-19",
    "Ship Mode": "First Class",
    "Customer ID": "LC-16885",
    "Customer Name": "Lena Creighton",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10009,
    "Region": "East",
    "Product ID": "OFF-BI-10003527",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Fellowes PB500 Electric Punch Plastic Comb Binding Machine with Manual Bind",
    "Sales": 3050.376,
    "Quantity": 3,
    "Discount": 0.2,
    "Profit": 1143.891
  },
  {
    "﻿Row ID": 7218,
    "Order ID": "CA-2012-150770",
    "Order Date": "2012-05-03",
    "Ship Date": "2012-05-06",
    "Ship Mode": "First Class",
    "Customer ID": "LC-16870",
    "Customer Name": "Lena Cacioppo",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "San Francisco",
    "State": "California",
    "Postal Code": 94109,
    "Region": "West",
    "Product ID": "OFF-BI-10002026",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Ibico Recycled Linen-Style Covers",
    "Sales": 62.49600000000001,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 21.873599999999996
  }
]
```

## Dashboard Layout

The dashboard "Synthetic Dashboard 182" uses a 2x2 Grid layout.

**Container:** A CSS Grid container with 2 columns and 2 rows.
- Grid Template Columns: `1fr 1fr`
- Grid Template Rows: `1fr 1fr`
- Gap: `8px` (derived from outer margin) or `4px` (derived from zone margin). Use `8px` for consistency.

**Grid Item Placement:**
1. **Top-Left:** Worksheet "Discount Overview by Region" (`P2648__discount_overview_by_region`)
2. **Top-Right:** Worksheet "Total Sales Each Year" (`P1225__total_sales_each_year`)
3. **Bottom-Left:** Worksheet "Line" (`P121__line`)
4. **Bottom-Right:** Worksheet "Scatterplot" (`P121__scatterplot`)

## Component Specifications

### 1. Scatterplot ("Scatterplot")
- **Data Transformation:** Group data by `Product Name`. For each product, calculate `SUM(Sales)`, `SUM(Profit)`, and `SUM(Quantity)`.
- **Visual Encoding:**
  - **Mark:** Circle.
  - **X-Axis:** `SUM(Sales)` (Linear Scale).
  - **Y-Axis:** `SUM(Profit)` (Linear Scale).
  - **Size:** `SUM(Quantity)` (Root Scale or Sqrt Scale to handle area correctly).
  - **Color:** `SUM(Sales)` (Sequential Color Scale). Default color `#75a1c7` (light blue). Stroke color `#000000`.
- **Implementation Details:**
  - Use `d3.scaleLinear` for X and Y.
  - Use `d3.scaleSqrt` for radius.
  - Render axes using `d3.axisBottom` and `d3.axisLeft`.
  - Render circles using SVG `<circle>` elements.
  - Include a tooltip showing Product Name, Sales, Profit, and Quantity on hover.

### 2. Discount Overview by Region ("Discount Overview by Region")
- **Data Transformation:** Group data by `Region`. For each region, calculate:
  - `AVG(Discount)`
  - `SUM(Profit)`
  - `SUM(Quantity)`
  - `SUM(Sales)`
  - `Profit Ratio` = `SUM(Profit) / SUM(Sales)`
- **Visual Encoding:**
  - **Type:** Heatmap / Text Table.
  - **Rows:** `Region`.
  - **Columns:** Measure Names (Discount, Profit, Quantity, Sales, Profit Ratio).
  - **Color:** The background color of the cells is determined by `AVG(Discount)`.
    - **Palette:** Diverging palette (Orange to Blue). `orange_blue_diverging_10_0`.
    - **Range:** Min 0.0, Max 0.4.
    - **Reverse:** True (High discount = Orange, Low discount = Blue, or vice versa based on standard Tableau diverging defaults, usually Blue is low/negative, Orange is high/positive. Since discount is positive 0-0.4, map 0 to Blue, 0.4 to Orange).
  - **Labels:** Show the calculated values inside the cells.
- **Implementation Details:**
  - Render an HTML `<table>`.
  - Use `d3.scaleDiverging` or `d3.scaleLinear` with an interpolator for the background color style.
  - Format numbers: Discount as percentage (e.g., "10%"), Currency fields as currency (e.g., "$1,000").

### 3. Line Chart ("Line")
- **Data Transformation:** Group data by `Order Date` truncated to Month. Calculate `SUM(Sales)` per month.
- **Visual Encoding:**
  - **Mark:** Line (Automatic).
  - **X-Axis:** `MONTH(Order Date)` (Time Scale).
  - **Y-Axis:** `SUM(Sales)` (Linear Scale).
  - **Color:** `SUM(Sales)` (Sequential Color). Use the `sunrise_sunset_diverging_10_0` palette logic. Since it is a single line, pick a representative color from the scale (e.g., a warm orange or distinct color) or apply a gradient stroke if feasible. A solid color matching the theme is acceptable.
- **Implementation Details:**
  - Use `d3.scaleTime` for X.
  - Use `d3.scaleLinear` for Y.
  - Use `d3.line()` to generate the `d` attribute for the `<path>`.
  - Render axes.
  - Include a tooltip showing Date and Sales on hover (using a voronoi overlay or nearest point finding).

### 4. Total Sales Each Year ("Total Sales Each Year")
- **Data Transformation:** Group data by `YEAR(Order Date)`. Calculate `SUM(Sales)` per year.
- **Visual Encoding:**
  - **Mark:** Bar.
  - **X-Axis:** `YEAR(Order Date)` (Band Scale).
  - **Y-Axis:** `SUM(Sales)` (Linear Scale).
  - **Color:** `SUM(Sales)` (Sequential Color). The bars should be colored based on their height (Sales value).
- **Implementation Details:**
  - Use `d3.scaleBand` for X.
  - Use `d3.scaleLinear` for Y.
  - Render bars using SVG `<rect>`.
  - Render axes.
  - Show labels on top of bars (Sales value).

## Interactions
- The workbook XML does not define any cross-sheet filter actions (the `<actions>` section is empty). Therefore, charts do not need to filter each other.
- Implement standard tooltips for all charts (Scatterplot, Line, Bar) showing relevant dimension and measure values.

## General Requirements
- Ensure the application is responsive. The dashboard grid should stack vertically on smaller screens (mobile view), though the XML defines a specific desktop layout.
- Handle empty states or loading states gracefully.
- Use TypeScript strictly for all props and state.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_182/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Profit:qk]`
- cols_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- series_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- zone: x=50000, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P2648__discount_overview_by_region
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[none:Region:nk]`
- cols_field: `([ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[:Measure Names] * [ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[Multiple Values])`
- series_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[avg:Discount:qk]`
- zone: x=593, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__line
- chart_intent: `line_chart`
- rows_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- cols_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[tmn:Order Date:qk]`
- series_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- zone: x=593, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- cols_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[yr:Order Date:ok]`
- series_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- zone: x=50000, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
