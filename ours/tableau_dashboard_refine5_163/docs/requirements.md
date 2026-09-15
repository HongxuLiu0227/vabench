# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled "Synthetic Dashboard 163".

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7): Use `d3-scale`, `d3-axis`, `d3-shape`, `d3-array`, `d3-time-format` for visualizations. Do not use high-level chart libraries.
- CSS: Use standard CSS modules or styled-components for layout.

## Data Loading

The application must fetch data from the following URL:
`/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv`

Implement a `useData` hook that:
1. Uses `fetch()` to retrieve the CSV.
2. Uses `d3.csvParse` to parse the text.
3. Transforms the raw strings into appropriate types (numbers for Sales, Profit, Quantity, Discount; Date objects for Order Date).
4. Returns the typed array.

## Data Schema
The CSV contains the following relevant columns:
- `Order Date` (Date)
- `Product Name` (String)
- `Region` (String)
- `Customer Name` (String)
- `Sales` (Number)
- `Profit` (Number)
- `Quantity` (Number)
- `Discount` (Number)

## Dashboard Layout
The dashboard uses a fixed-size layout (approx 1000x800) but should be responsive. Use CSS Grid to approximate the following structure:

- **Container**: White background, 8px padding.
- **Grid**: 2 Columns, 2 Rows.
  - **Row 1 (Top)**: Height ~62%.
    - **Cell 1 (Top-Left)**: Contains "Scatterplot". Background color: #e6e6e6 (Light Gray). Inner chart container: White with 4px margin.
    - **Cell 2 (Top-Right)**: Contains "Total Sales Each Year". Background color: #e6e6e6 (Light Gray). Inner chart container: White with 4px margin.
  - **Row 2 (Bottom)**: Height ~36%.
    - **Cell 3 (Bottom)**: Spans both columns. Contains "Customer Overview". Background color: #e6e6e6 (Light Gray). Inner chart container: White with 4px margin.

## Component Specifications

### 1. Scatterplot (Worksheet: P121__scatterplot)
- **Title**: "Scatterplot"
- **Data Transformation**: Group data by `Product Name`. For each product, calculate:
  - `sumSales`: SUM(Sales)
  - `sumProfit`: SUM(Profit)
  - `sumQuantity`: SUM(Quantity)
- **Visual Encoding**:
  - **X-Axis**: `sumSales` (Linear Scale). Label: "Sales".
  - **Y-Axis**: `sumProfit` (Linear Scale). Label: "Profit".
  - **Marks**: Circles.
  - **Size**: Encoded by `sumQuantity` (use `d3.scaleSqrt` for radius).
  - **Color**: Encoded by `sumSales` (Sequential Blue scale, e.g., `d3.interpolateBlues`).
  - **Style**: Stroke color #000000 (Black), Stroke width 1px.
- **Interactions**: Tooltip displaying Product Name, Sales, Profit, and Quantity on hover.

### 2. Total Sales Each Year (Worksheet: P1225__total_sales_each_year)
- **Title**: "Total Sales Each Year"
- **Data Transformation**: Group data by Year of `Order Date`. Calculate `sumSales` for each year.
- **Visual Encoding**:
  - **X-Axis**: Year (Band Scale).
  - **Y-Axis**: `sumSales` (Linear Scale). Label: "Sales".
  - **Marks**: Bars.
  - **Color**: Encoded by `sumSales` (Sequential Blue scale).
  - **Labels**: Display the value of `sumSales` on top of each bar.

### 3. Customer Overview (Worksheet: P1968__customer_overview)
- **Title**: "Customer Overview"
- **Data Transformation**: Group data by `Region`. For each region, calculate:
  - `countCustomers`: COUNTD(Customer Name)
  - `sumSales`: SUM(Sales)
  - `sumQuantity`: SUM(Quantity)
  - `sumProfit`: SUM(Profit)
  - `profitRatio`: `sumProfit` / `sumSales`
- **Visual Encoding**:
  - **Layout**: A table (HTML `<table>` or CSS Grid).
  - **Rows**: Regions.
  - **Columns**: Sales, Quantity, Profit, Profit Ratio (in this specific order).
  - **Color Encoding**: The background color of the "Profit Ratio" cell should be a diverging color scale (e.g., Red to Blue or Orange to Blue) centered at 0. Range: -0.5 to 0.5.
  - **Text**: Display the calculated values. Format currency for Sales/Profit, integers for Quantity, percentage for Profit Ratio.
- **Tooltip**: Custom tooltip matching the Tableau definition:
  - Region (Bold)
  - Number of Customers: [Value]
  - [Measure Name]: [Value]
  - Profit: [Value]
  - Quantity: [Value]
  - Sales: [Value]
  - Profit Ratio: [Value]

## Sample Data
```json
[
  {
    "﻿Category": "Office Supplies",
    "City": "Fresno",
    "Country": "United States",
    "Customer Name": "Luke Schmidt",
    "Manufacturer": "Other",
    "Order Date": "2011-11-26",
    "Order ID": "CA-2011-141110",
    "Postal Code": 93727,
    "Product Name": "SpineVue Locking Slant-D Ring Binders by Cardinal",
    "Region": "West",
    "Segment": "Corporate",
    "Ship Date": "2011-12-01",
    "Ship Mode": "Standard Class",
    "State": "California",
    "Sub-Category": "Binders",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 3,
    "Profit Ratio": 0.35,
    "Quantity": 1,
    "Sales": 7
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Toledo",
    "Country": "United States",
    "Customer Name": "Theresa Swint",
    "Manufacturer": "Crayola",
    "Order Date": "2012-04-16",
    "Order ID": "CA-2012-161263",
    "Postal Code": 43615,
    "Product Name": "Crayola Colored Pencils",
    "Region": "East",
    "Segment": "Corporate",
    "Ship Date": "2012-04-21",
    "Ship Mode": "Standard Class",
    "State": "Ohio",
    "Sub-Category": "Art",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 1,
    "Profit Ratio": 0.16,
    "Quantity": 3,
    "Sales": 8
  },
  {
    "﻿Category": "Furniture",
    "City": "Virginia Beach",
    "Country": "United States",
    "Customer Name": "Liz Willingham",
    "Manufacturer": "3M",
    "Order Date": "2013-11-06",
    "Order ID": "CA-2013-157280",
    "Postal Code": 23464,
    "Product Name": "3M Polarizing Task Lamp with Clamp Arm, Light Gray",
    "Region": "South",
    "Segment": "Consumer",
    "Ship Date": "2013-11-08",
    "Ship Mode": "First Class",
    "State": "Virginia",
    "Sub-Category": "Furnishings",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 71,
    "Profit Ratio": 0.26,
    "Quantity": 2,
    "Sales": 274
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Superior",
    "Country": "United States",
    "Customer Name": "Eugene Moren",
    "Manufacturer": "Acco",
    "Order Date": "2013-05-31",
    "Order ID": "CA-2013-152730",
    "Postal Code": 54880,
    "Product Name": "Acco 7-Outlet Masterpiece Power Center, Wihtout Fax/Phone Line Protection",
    "Region": "Central",
    "Segment": "Home Office",
    "Ship Date": "2013-06-05",
    "Ship Mode": "Standard Class",
    "State": "Wisconsin",
    "Sub-Category": "Appliances",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 109,
    "Profit Ratio": 0.3,
    "Quantity": 3,
    "Sales": 365
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Louisville",
    "Country": "United States",
    "Customer Name": "Sung Chung",
    "Manufacturer": "Southworth",
    "Order Date": "2014-08-22",
    "Order ID": "CA-2014-117646",
    "Postal Code": 80027,
    "Product Name": "Southworth 25% Cotton Antique Laid Paper & Envelopes",
    "Region": "West",
    "Segment": "Consumer",
    "Ship Date": "2014-08-26",
    "Ship Mode": "Standard Class",
    "State": "Colorado",
    "Sub-Category": "Paper",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 2,
    "Profit Ratio": 0.31,
    "Quantity": 1,
    "Sales": 7
  },
  {
    "﻿Category": "Office Supplies",
    "City": "New York City",
    "Country": "United States",
    "Customer Name": "Michelle Moray",
    "Manufacturer": "Ampad",
    "Order Date": "2012-06-29",
    "Order ID": "US-2012-141684",
    "Postal Code": 10011,
    "Product Name": "Ampad Phone Message Book, Recycled, 400 Message Capacity, 5 ¾” x 11”",
    "Region": "East",
    "Segment": "Consumer",
    "Ship Date": "2012-07-04",
    "Ship Mode": "Standard Class",
    "State": "New York",
    "Sub-Category": "Paper",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 11,
    "Profit Ratio": 0.45,
    "Quantity": 4,
    "Sales": 25
  },
  {
    "﻿Category": "Office Supplies",
    "City": "San Francisco",
    "Country": "United States",
    "Customer Name": "Eugene Hildebrand",
    "Manufacturer": "Crayola",
    "Order Date": "2014-01-31",
    "Order ID": "CA-2014-112725",
    "Postal Code": 94110,
    "Product Name": "Crayola Anti Dust Chalk, 12/Pack",
    "Region": "West",
    "Segment": "Home Office",
    "Ship Date": "2014-02-07",
    "Ship Mode": "Standard Class",
    "State": "California",
    "Sub-Category": "Art",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 6,
    "Profit Ratio": 0.45,
    "Quantity": 7,
    "Sales": 13
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Bedford",
    "Country": "United States",
    "Customer Name": "Sylvia Foulston",
    "Manufacturer": "Wirebound",
    "Order Date": "2014-08-12",
    "Order ID": "CA-2014-139311",
    "Postal Code": 76021,
    "Product Name": "Wirebound Message Books, Four 2 3/4\" x 5\" Forms per Page, 600 Sets per Book",
    "Region": "Central",
    "Segment": "Corporate",
    "Ship Date": "2014-08-14",
    "Ship Mode": "First Class",
    "State": "Texas",
    "Sub-Category": "Paper",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 10,
    "Profit Ratio": 0.34,
    "Quantity": 4,
    "Sales": 30
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Los Angeles",
    "Country": "United States",
    "Customer Name": "Bart Pistole",
    "Manufacturer": "Advantus",
    "Order Date": "2011-12-19",
    "Order ID": "CA-2011-162992",
    "Postal Code": 90008,
    "Product Name": "Advantus T-Pin Paper Clips",
    "Region": "West",
    "Segment": "Corporate",
    "Ship Date": "2011-12-21",
    "Ship Mode": "First Class",
    "State": "California",
    "Sub-Category": "Fasteners",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 9,
    "Profit Ratio": 0.39,
    "Quantity": 5,
    "Sales": 23
  },
  {
    "﻿Category": "Technology",
    "City": "New York City",
    "Country": "United States",
    "Customer Name": "Peter Fuller",
    "Manufacturer": "Plantronics",
    "Order Date": "2012-09-17",
    "Order ID": "US-2012-126977",
    "Postal Code": 10035,
    "Product Name": "Plantronics CS510 - Over-the-Head monaural Wireless Headset System",
    "Region": "East",
    "Segment": "Consumer",
    "Ship Date": "2012-09-23",
    "Ship Mode": "Standard Class",
    "State": "New York",
    "Sub-Category": "Accessories",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 218,
    "Profit Ratio": 0.33,
    "Quantity": 2,
    "Sales": 660
  }
]
```

## Implementation Notes
- Ensure all text labels (titles, axis labels, tooltips) match the Tableau workbook exactly.
- Use `d3.format` for number formatting (e.g., currency, percentages).
- The dashboard should handle the loading state while fetching the CSV.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_163/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Profit:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=800, y=1000, w=49200, h=61748
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[yr:Order Date:ok]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=50000, y=1000, w=49200, h=61750
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1968__customer_overview
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Region:nk]`
- cols_field: `([ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[:Measure Names] * [ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[Multiple Values])`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[usr:Profit Ratio:qk]`
- zone: x=800, y=62750, w=98400, h=36250
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
