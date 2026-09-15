# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard exactly as defined in the provided workbook XML.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-time`)
- CSS for layout (CSS Grid/Flexbox)
- No external UI component libraries (e.g., no Ant Design, Material UI). Build custom components.

## Data Loading

The application must load data from the following URL:
`/data/1968_dash_dashboard0_png_coursera_course_204_week_203_dashboard/p1968_TEMP_1u7hox51ox1io4183hb2v01q3nst.csv`

Implement a `useData` hook or utility function that:
1. Uses `fetch()` to retrieve the CSV file.
2. Parses the CSV content into an array of objects. You can use `d3-dsv` or a simple string splitter.
3. Converts string values to appropriate types (numbers for Sales/Profit/Quantity, Date objects for Order Date).
4. Returns the typed data array.

## Data Schema
The CSV contains the following columns:
- `Row ID` (integer)
- `Order ID` (string)
- `Order Date` (date)
- `Ship Date` (date)
- `Ship Mode` (string)
- `Customer ID` (string)
- `Customer Name` (string)
- `Segment` (string)
- `Country` (string)
- `City` (string)
- `State` (string)
- `Postal Code` (integer)
- `Region` (string)
- `Product ID` (string)
- `Category` (string)
- `Sub-Category` (string)
- `Product Name` (string)
- `Sales` (number)
- `Quantity` (integer)
- `Discount` (number)
- `Profit` (number)

## Calculated Fields
You must derive these fields in your data processing logic:
1. `Profit Ratio`: `SUM(Profit) / SUM(Sales)`
2. `Sales per Customer`: `SUM(Sales) / COUNTD(Customer Name)`

## Dashboard Layout
The main dashboard is named "Synthetic Dashboard 216".
- **Layout**: A 2x2 CSS Grid.
- **Dimensions**: Fixed size of 1000px width by 800px height (or responsive equivalent maintaining aspect ratio).
- **Grid Areas**:
  - Top-Left: `Customer Overview`
  - Top-Right: `Total Sales Each Year`
  - Bottom-Left: `Bar` (Sales by Category/Sub-Category)
  - Bottom-Right: `Scatterplot`
- **Styling**: Use a white background, 8px outer margin, and 4px gap between grid items.

## Component Specifications

### 1. Total Sales Each Year (Top-Right)
- **Type**: Vertical Bar Chart.
- **Data Preparation**: Group data by `YEAR(Order Date)`. Aggregate `SUM(Sales)`.
- **Visual Encoding**:
  - X-Axis: Year (Order Date).
  - Y-Axis: Sales (Linear scale).
  - Marks: Bars.
  - Color: Encoded by Sales (Sequential color scale, e.g., Blue).
  - Labels: Display the Sales value on top of each bar.
- **Title**: "Total Sales Each Year"

### 2. Customer Overview (Top-Left)
- **Type**: Heatmap / Highlight Table.
- **Data Preparation**: Group data by `Region`. Calculate the following measures for each region:
  - `Sales per Customer`
  - `Sales`
  - `Quantity`
  - `Profit`
  - `Profit Ratio`
- **Visual Encoding**:
  - Rows: Region.
  - Columns: Measures (in this specific order: Sales per Customer, Sales, Quantity, Profit, Profit Ratio).
  - Cell Color: Encoded by `Profit Ratio`. Use a diverging color scale (e.g., Red-White-Green) centered at 0, with range -0.5 to 0.5.
  - Text: Display the measure value inside the cell.
- **Tooltip**: Custom tooltip showing:
  - Region (Bold)
  - Number of Customers (CountD)
  - The specific Measure Name and Value
  - Profit
  - Quantity
  - Sales
  - Profit Ratio
- **Title**: "Customer Overview"

### 3. Bar (Bottom-Left)
- **Type**: Horizontal Bar Chart.
- **Data Preparation**: Group data by `Category` and `Sub-Category` (Hierarchy). Aggregate `SUM(Sales)`.
- **Visual Encoding**:
  - Y-Axis: Category and Sub-Category (Hierarchical labels).
  - X-Axis: Sales.
  - Marks: Bars.
  - Color: Encoded by Sales using the "Blue-Teal 10" palette (or a similar blue-teal gradient).
- **Title**: "Bar"

### 4. Scatterplot (Bottom-Right)
- **Type**: Scatterplot.
- **Data Preparation**: Group data by `Product Name`. Aggregate `SUM(Sales)`, `SUM(Profit)`, `SUM(Quantity)`.
- **Visual Encoding**:
  - X-Axis: Sales.
  - Y-Axis: Profit.
  - Marks: Circles.
  - Size: Encoded by Quantity.
  - Color: Encoded by Sales (Sequential color scale).
  - Style: Circles should have a black stroke (`#000000`).
- **Title**: "Scatterplot"

## Sample Data

```json
[
  {
    "﻿Row ID": 1727,
    "Order ID": "CA-2012-127453",
    "Order Date": "2012-12-19",
    "Ship Date": "2012-12-20",
    "Ship Mode": "First Class",
    "Customer ID": "JK-15370",
    "Customer Name": "Jay Kimmel",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Philadelphia",
    "State": "Pennsylvania",
    "Postal Code": 19143,
    "Region": "East",
    "Product ID": "OFF-AP-10003860",
    "Category": "Office Supplies",
    "Sub-Category": "Appliances",
    "Product Name": "Fellowes Advanced 8 Outlet Surge Suppressor with Phone/Fax Protection",
    "Sales": 88.83200000000001,
    "Quantity": 4,
    "Discount": 0.2,
    "Profit": 7.7728
  },
  {
    "﻿Row ID": 4909,
    "Order ID": "CA-2011-133809",
    "Order Date": "2011-11-18",
    "Ship Date": "2011-11-23",
    "Ship Mode": "Second Class",
    "Customer ID": "MS-17530",
    "Customer Name": "MaryBeth Skach",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Fairfield",
    "State": "Ohio",
    "Postal Code": 45014,
    "Region": "East",
    "Product ID": "TEC-PH-10004875",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "PNY Rapid USB Car Charger - Black",
    "Sales": 9.588,
    "Quantity": 2,
    "Discount": 0.4,
    "Profit": -2.0774
  },
  {
    "﻿Row ID": 303,
    "Order ID": "CA-2013-142545",
    "Order Date": "2013-10-29",
    "Ship Date": "2013-11-04",
    "Ship Mode": "Standard Class",
    "Customer ID": "JD-15895",
    "Customer Name": "Jonathan Doherty",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Belleville",
    "State": "New Jersey",
    "Postal Code": 7109,
    "Region": "East",
    "Product ID": "OFF-BI-10002706",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Avery Premier Heavy-Duty Binder with Round Locking Rings",
    "Sales": 14.28,
    "Quantity": 1,
    "Discount": 0.0,
    "Profit": 6.5687999999999995
  },
  {
    "﻿Row ID": 1691,
    "Order ID": "CA-2014-129833",
    "Order Date": "2014-12-10",
    "Ship Date": "2014-12-16",
    "Ship Mode": "Standard Class",
    "Customer ID": "HF-14995",
    "Customer Name": "Herbert Flentye",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Indianapolis",
    "State": "Indiana",
    "Postal Code": 46203,
    "Region": "Central",
    "Product ID": "OFF-PA-10000575",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Wirebound Message Books, Four 2 3/4 x 5 White Forms per Page",
    "Sales": 33.45,
    "Quantity": 5,
    "Discount": 0.0,
    "Profit": 15.387
  },
  {
    "﻿Row ID": 9834,
    "Order ID": "CA-2014-130302",
    "Order Date": "2014-09-15",
    "Ship Date": "2014-09-20",
    "Ship Mode": "Standard Class",
    "Customer ID": "CY-12745",
    "Customer Name": "Craig Yedwab",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Springfield",
    "State": "Ohio",
    "Postal Code": 45503,
    "Region": "East",
    "Product ID": "TEC-AC-10002001",
    "Category": "Technology",
    "Sub-Category": "Accessories",
    "Product Name": "Logitech Wireless Gaming Headset G930",
    "Sales": 895.9440000000002,
    "Quantity": 7,
    "Discount": 0.2,
    "Profit": 190.3881
  },
  {
    "﻿Row ID": 4145,
    "Order ID": "CA-2014-112725",
    "Order Date": "2014-01-31",
    "Ship Date": "2014-02-07",
    "Ship Mode": "Standard Class",
    "Customer ID": "EH-14125",
    "Customer Name": "Eugene Hildebrand",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "San Francisco",
    "State": "California",
    "Postal Code": 94110,
    "Region": "West",
    "Product ID": "OFF-AR-10001227",
    "Category": "Office Supplies",
    "Sub-Category": "Art",
    "Product Name": "Newell 338",
    "Sales": 8.82,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 2.3814
  },
  {
    "﻿Row ID": 6638,
    "Order ID": "CA-2014-103352",
    "Order Date": "2014-11-28",
    "Ship Date": "2014-12-01",
    "Ship Mode": "Second Class",
    "Customer ID": "RP-19390",
    "Customer Name": "Resi Pölking",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10011,
    "Region": "East",
    "Product ID": "OFF-AR-10001573",
    "Category": "Office Supplies",
    "Sub-Category": "Art",
    "Product Name": "American Pencil",
    "Sales": 6.99,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 2.027099999999999
  },
  {
    "﻿Row ID": 2872,
    "Order ID": "CA-2011-148040",
    "Order Date": "2011-03-22",
    "Ship Date": "2011-03-26",
    "Ship Mode": "Standard Class",
    "Customer ID": "BF-11275",
    "Customer Name": "Beth Fritzler",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Tucson",
    "State": "Arizona",
    "Postal Code": 85705,
    "Region": "West",
    "Product ID": "FUR-CH-10001482",
    "Category": "Furniture",
    "Sub-Category": "Chairs",
    "Product Name": "Office Star - Mesh Screen back chair with Vinyl seat",
    "Sales": 314.352,
    "Quantity": 3,
    "Discount": 0.2,
    "Profit": -35.36460000000001
  },
  {
    "﻿Row ID": 2355,
    "Order ID": "CA-2012-111514",
    "Order Date": "2012-08-31",
    "Ship Date": "2012-09-02",
    "Ship Mode": "First Class",
    "Customer ID": "SC-20260",
    "Customer Name": "Scott Cohen",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "San Francisco",
    "State": "California",
    "Postal Code": 94122,
    "Region": "West",
    "Product ID": "OFF-BI-10002735",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "GBC Prestige Therm-A-Bind Covers",
    "Sales": 137.24,
    "Quantity": 5,
    "Discount": 0.2,
    "Profit": 46.3185
  },
  {
    "﻿Row ID": 8358,
    "Order ID": "CA-2011-110555",
    "Order Date": "2011-04-11",
    "Ship Date": "2011-04-18",
    "Ship Mode": "Standard Class",
    "Customer ID": "MM-18055",
    "Customer Name": "Michelle Moray",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Great Falls",
    "State": "Montana",
    "Postal Code": 59405,
    "Region": "West",
    "Product ID": "OFF-ST-10000876",
    "Category": "Office Supplies",
    "Sub-Category": "Storage",
    "Product Name": "Eldon Simplefile Box Office",
    "Sales": 87.08,
    "Quantity": 7,
    "Discount": 0.0,
    "Profit": 24.3824
  }
]
```

## Implementation Notes
- Ensure all charts handle empty states or loading states gracefully.
- Use D3 scales for all axes and color encodings to ensure accuracy.
- The `Customer Overview` component should be implemented as an HTML Table where the `td` background color is calculated based on the `Profit Ratio`.
- Preserve the exact text for titles and tooltips as listed above.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_216/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- cols_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[yr:Order Date:ok]`
- series_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- zone: x=50000, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1968__customer_overview
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[none:Region:nk]`
- cols_field: `([ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[:Measure Names] * [ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[Multiple Values])`
- series_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[usr:Calculation_345932813618278400:qk]`
- zone: x=800, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Profit:qk]`
- cols_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- series_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- zone: x=50000, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__bar
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[none:Category:nk] / [ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[none:Sub-Category:nk])`
- cols_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- series_field: `[ds_p1968_federated_11oeaww0axzaij1b29ohm0h7pnml].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=800, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
