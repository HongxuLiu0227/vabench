# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard named 'Informative Dashboard' using the 'Superstore' dataset.

**Tech Stack:**
- React + TypeScript + Vite
- D3.js (v7) for visualizations (use primitives: d3-scale, d3-shape, d3-axis, d3-array, d3-time-format)
- CSS for layout (CSS Grid/Flexbox)
- No external UI component libraries (e.g., Ant Design) unless necessary for basic inputs.

**Data Loading:**
The primary data source is located at `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`.

1.  Create a utility function `loadData` using `fetch()`.
2.  Parse the CSV text. You can use `d3-dsv` (d3.csvParse) or a similar lightweight parser.
3.  Define TypeScript interfaces for the data based on the following columns:
    - `Row ID` (number)
    - `Order ID` (string)
    - `Order Date` (Date)
    - `Ship Date` (Date)
    - `Ship Mode` (string)
    - `Customer ID` (string)
    - `Customer Name` (string)
    - `Segment` (string)
    - `Country` (string)
    - `City` (string)
    - `State` (string)
    - `Postal Code` (number)
    - `Region` (string)
    - `Product ID` (string)
    - `Category` (string)
    - `Sub-Category` (string)
    - `Product Name` (string)
    - `Sales` (number)
    - `Quantity` (number)
    - `Discount` (number)
    - `Profit` (number)

**Data Processing & Calculated Fields:**
Implement the following logic to transform the raw data:
1.  **Profit Ratio:** Calculate `SUM([Profit]) / SUM([Sales])` for the filtered dataset.
2.  **Manufacturer (Product Name Group):** The workbook groups specific 'Product Name' values into 'Manufacturer' categories (e.g., '3D Systems', '3M', 'Acco', 'Acme', 'Apple', etc.). Implement a mapping function that assigns a 'Manufacturer' property to each row based on the 'Product Name'. If a product name does not match the known groups, assign it to 'Other' or the original name.
3.  **Top 10 Products:** Identify the top 10 products based on total Sales.

**Layout & Components:**
Create a main `Dashboard` component using CSS Grid. The layout should be responsive.

1.  **Header:** Display the title "Informative Dashboard".
2.  **KPI Section:** A row of cards displaying:
    - Total Sales (formatted as currency)
    - Total Profit (formatted as currency)
    - Profit Ratio (formatted as percentage)
3.  **Filters:** A control panel allowing the user to filter by:
    - Region (West, East, Central, South)
    - Category (Furniture, Office Supplies, Technology)
    - Segment (Consumer, Corporate, Home Office)
    These filters should update all charts and KPIs.
4.  **Main Visualization Area:**
    - **Sales by Manufacturer (Bar Chart):** A horizontal bar chart showing total Sales per Manufacturer. Use `d3-scaleBand` for the y-axis and `d3-scaleLinear` for the x-axis.
    - **Top 10 Products (Bar Chart):** A horizontal bar chart showing the top 10 Products by Sales.
    - **Sales Trend (Line Chart):** A line chart showing Sales over `Order Date` (aggregated by Month or Year). Use `d3-scaleTime` for the x-axis.

**Implementation Details:**
- Use `d3-array` (e.g., `d3.rollup`, `d3.group`) to aggregate data for the charts.
- Ensure all charts have axes, labels, and tooltips on hover.
- Handle empty states or loading states.
- Preserve the exact text "Informative Dashboard" for the title.

**Sample Data:**
Here is a sample of the data structure you will be working with:

```json
[
  {
    "﻿Row ID": 4912,
    "Order ID": "CA-2018-127306",
    "Order Date": "2018-01-14",
    "Ship Date": "2018-01-18",
    "Ship Mode": "Standard Class",
    "Customer ID": "BH-11710",
    "Customer Name": "Brosina Hoffman",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Johnson City",
    "State": "Tennessee",
    "Postal Code": 37604.0,
    "Region": "South",
    "Product ID": "TEC-PH-10001924",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "iHome FM Clock Radio with Lightning Dock",
    "Sales": 111.984,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 6.999000000000006
  },
  {
    "﻿Row ID": 8023,
    "Order ID": "CA-2015-129189",
    "Order Date": "2015-07-21",
    "Ship Date": "2015-07-25",
    "Ship Mode": "Standard Class",
    "Customer ID": "HM-14860",
    "Customer Name": "Harry Marie",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Dallas",
    "State": "Texas",
    "Postal Code": 75217.0,
    "Region": "Central",
    "Product ID": "OFF-EN-10003567",
    "Category": "Office Supplies",
    "Sub-Category": "Envelopes",
    "Product Name": "Inter-Office Recycled Envelopes, Brown Kraft, Button-String,10\" x 13\"\"",
    "Sales": "100/Box\"",
    "Quantity": 87.92,
    "Discount": 5,
    "Profit": 0.2,
    "null": "['29.673000000000005']"
  },
  {
    "﻿Row ID": 1110,
    "Order ID": "US-2017-110156",
    "Order Date": "2017-11-19",
    "Ship Date": "2017-11-24",
    "Ship Mode": "Standard Class",
    "Customer ID": "EH-13945",
    "Customer Name": "Eric Hoffmann",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Houston",
    "State": "Texas",
    "Postal Code": 77041.0,
    "Region": "Central",
    "Product ID": "OFF-EN-10003798",
    "Category": "Office Supplies",
    "Sub-Category": "Envelopes",
    "Product Name": "Recycled Interoffice Envelopes with Re-Use-A-Seal Closure, 10 x 13",
    "Sales": 40.968,
    "Quantity": 3,
    "Discount": 0.2,
    "Profit": 13.826699999999999
  },
  {
    "﻿Row ID": 6879,
    "Order ID": "US-2016-123918",
    "Order Date": "2016-10-15",
    "Ship Date": "2016-10-15",
    "Ship Mode": "Same Day",
    "Customer ID": "CG-12520",
    "Customer Name": "Claire Gute",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Dallas",
    "State": "Texas",
    "Postal Code": 75217.0,
    "Region": "Central",
    "Product ID": "OFF-PA-10003001",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Xerox 1986",
    "Sales": 5.344,
    "Quantity": 1,
    "Discount": 0.2,
    "Profit": 1.8703999999999998
  },
  {
    "﻿Row ID": 7390,
    "Order ID": "CA-2018-108035",
    "Order Date": "2018-11-29",
    "Ship Date": "2018-12-03",
    "Ship Mode": "Standard Class",
    "Customer ID": "TT-21070",
    "Customer Name": "Ted Trevino",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Chattanooga",
    "State": "Tennessee",
    "Postal Code": 37421.0,
    "Region": "South",
    "Product ID": "FUR-CH-10000454",
    "Category": "Furniture",
    "Sub-Category": "Chairs",
    "Product Name": "Hon Deluxe Fabric Upholstered Stacking Chairs, Rounded Back",
    "Sales": 390.368,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 48.79599999999998
  },
  {
    "﻿Row ID": 4873,
    "Order ID": "CA-2018-164042",
    "Order Date": "2018-05-23",
    "Ship Date": "2018-05-27",
    "Ship Mode": "Standard Class",
    "Customer ID": "KL-16645",
    "Customer Name": "Ken Lonsdale",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Houston",
    "State": "Texas",
    "Postal Code": 77095.0,
    "Region": "Central",
    "Product ID": "OFF-AP-10001947",
    "Category": "Office Supplies",
    "Sub-Category": "Appliances",
    "Product Name": "Acco 6 Outlet Guardian Premium Plus Surge Suppressor",
    "Sales": 18.319999999999997,
    "Quantity": 5,
    "Discount": 0.8,
    "Profit": -46.71600000000001
  },
  {
    "﻿Row ID": 2729,
    "Order ID": "CA-2018-119193",
    "Order Date": "2018-12-22",
    "Ship Date": "2018-12-24",
    "Ship Mode": "First Class",
    "Customer ID": "SK-19990",
    "Customer Name": "Sally Knutson",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Toledo",
    "State": "Ohio",
    "Postal Code": 43615.0,
    "Region": "East",
    "Product ID": "TEC-PH-10003072",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Panasonic KX-TG9541B DECT 6.0 Digital 2-Line Expandable Cordless Phone With Digital Answering System",
    "Sales": 629.958,
    "Quantity": 7,
    "Discount": 0.4,
    "Profit": 94.49369999999999
  },
  {
    "﻿Row ID": 3567,
    "Order ID": "CA-2018-103877",
    "Order Date": "2018-09-07",
    "Ship Date": "2018-09-14",
    "Ship Mode": "Standard Class",
    "Customer ID": "RD-19660",
    "Customer Name": "Robert Dilbeck",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "Independence",
    "State": "Missouri",
    "Postal Code": 64055.0,
    "Region": "Central",
    "Product ID": "OFF-BI-10003650",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "GBC DocuBind 300 Electric Binding Machine",
    "Sales": 1577.94,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 757.4112
  },
  {
    "﻿Row ID": 8226,
    "Order ID": "CA-2018-104136",
    "Order Date": "2018-11-01",
    "Ship Date": "2018-11-04",
    "Ship Mode": "Second Class",
    "Customer ID": "SF-20065",
    "Customer Name": "Sandra Flanagan",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Everett",
    "State": "Massachusetts",
    "Postal Code": 2149.0,
    "Region": "East",
    "Product ID": "OFF-PA-10004243",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Xerox 1939",
    "Sales": 189.7,
    "Quantity": 10,
    "Discount": 0.0,
    "Profit": 91.05599999999998
  },
  {
    "﻿Row ID": 8458,
    "Order ID": "US-2018-118556",
    "Order Date": "2018-05-28",
    "Ship Date": "2018-06-02",
    "Ship Mode": "Second Class",
    "Customer ID": "TH-21235",
    "Customer Name": "Tiffany House",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Chicago",
    "State": "Illinois",
    "Postal Code": 60653.0,
    "Region": "Central",
    "Product ID": "OFF-BI-10004364",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Storex Dura Pro Binders",
    "Sales": 3.563999999999999,
    "Quantity": 3,
    "Discount": 0.8,
    "Profit": -6.237000000000002
  }
]
```

Please generate the complete React + TypeScript code for this application.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_425/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P121__line
- chart_intent: `line_chart`
- rows_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- cols_field: `[ds_p9517_sample_superstore].[tmn:Order Date:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=800, y=1000, w=49200, h=61748
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- cols_field: `[ds_p9517_sample_superstore].[yr:Order Date:ok]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=50000, y=1000, w=49200, h=61750
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P2648__discount_overview_by_region
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[none:Region:nk]`
- cols_field: `([ds_p9517_sample_superstore].[:Measure Names] * [ds_p9517_sample_superstore].[Multiple Values])`
- series_field: `[ds_p9517_sample_superstore].[avg:Discount:qk]`
- zone: x=800, y=62750, w=98400, h=36250
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
