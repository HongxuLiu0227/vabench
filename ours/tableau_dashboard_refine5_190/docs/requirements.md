# Project Requirements

You are a Senior React Engineer tasked with recreating a Tableau dashboard titled 'Informative Dashboard'. The dashboard relies on the 'Sample - Superstore' dataset.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7): Use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-time-format`.
- CSS: Use CSS Modules or Tailwind CSS (if preferred, but standard CSS is fine). No heavy UI component libraries (e.g., Ant Design) unless necessary for basic layout containers.

## Data Loading

The primary data source is located at: `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`

You must implement a `useData` hook or similar utility to fetch and parse this CSV.

1.  **Fetch**: Use `fetch()` to retrieve the CSV file.
2.  **Parse**: Use `d3-dsv` (`d3.csvParse`) to convert the raw CSV text into an array of objects.
3.  **Type Coercion**: Ensure 'Order Date' and 'Ship Date' are parsed into JavaScript `Date` objects. Ensure 'Sales', 'Profit', 'Discount', and 'Quantity' are parsed into `number`.

## Data Processing & Calculated Fields

The Tableau workbook defines specific calculated fields and groupings that must be replicated in the data transformation layer:

1.  **Manufacturer Grouping (`[Product Name (group)]`)**:
    - The workbook groups specific `Product Name` strings into Manufacturers (e.g., "3D Systems", "3M", "Acco", "Apple").
    - **Implementation**: Create a mapping function or a large lookup object (Map) that takes a `Product Name` and returns the Manufacturer. If a product is not in the specific list defined in the workbook XML, fallback to a generic value or the original name.
    - *Note*: The XML contains a specific list of mappings (e.g., "3D Systems Cube Printer..." -> "3D Systems"). You should include a representative subset of these mappings in your code to demonstrate functionality, specifically handling the major brands listed (Apple, Canon, Cisco, etc.).

2.  **Profit Ratio (`[Profit Ratio]`)**:
    - Formula: `SUM([Profit]) / SUM([Sales])`
    - **Implementation**: When aggregating data for charts, calculate this ratio. Format as a percentage (e.g., "15%").

3.  **Top 10 Product (`[Top 10 Product]`)**:
    - Formula logic: `if [Sub-Category Set] then [Product Name] else '' end`
    - **Implementation**: Since the Set definition isn't fully exposed in the snippet, implement a standard "Top 10 Products by Sales" logic. Filter the dataset to find the top 10 products based on total Sales, then filter the main dataset to include only these products for the specific chart requiring this dimension.

## Dashboard Layout

The dashboard should use a responsive CSS Grid layout.

- **Container**: A main container with a max-width (e.g., 1200px) and centered margin.
- **Header**: Title "Informative Dashboard".
- **Grid Areas**:
    - `kpi`: Top row, spanning full width or split into 3 columns (Sales, Profit, Profit Ratio).
    - `main`: Middle row, left side (approx 60-70% width). Contains the "Sales by Manufacturer" chart.
    - `secondary`: Middle row, right side (approx 30-40% width). Contains the "Top 10 Products" chart.
    - `trend`: Bottom row, spanning full width. Contains the "Profit Ratio Trend" chart.

## Component Specifications

### 1. KPI Cards (`KPICard`)
- **Props**: `title` (string), `value` (string | number), `format` (optional, e.g., currency).
- **Visuals**: Simple card with a bold value and a lighter label.
- **Data**:
    - Card 1: Total Sales (Sum of Sales).
    - Card 2: Total Profit (Sum of Profit).
    - Card 3: Overall Profit Ratio (Total Profit / Total Sales).

### 2. Sales by Manufacturer Chart (`SalesByManufacturerChart`)
- **Type**: Horizontal Bar Chart.
- **Data**: Group data by `Manufacturer` (derived from `Product Name (group)`). Aggregate `SUM(Sales)`. Sort descending by Sales.
- **Encodings**:
    - X-Axis: Sales (Linear scale).
    - Y-Axis: Manufacturer (Band scale).
    - Color: Encode by `Category` (Furniture, Office Supplies, Technology) to distinguish segments within manufacturers.
- **Interactions**: Tooltip showing Manufacturer, Category, and Sales on hover.

### 3. Top 10 Products Chart (`Top10ProductsChart`)
- **Type**: Vertical Bar Chart.
- **Data**: Filter data to the Top 10 Products by Sales. Aggregate `SUM(Sales)`.
- **Encodings**:
    - X-Axis: Product Name (Band scale, rotated labels if necessary).
    - Y-Axis: Sales (Linear scale).
    - Color: A distinct color (e.g., Tableau Blue) or mapped to Category.
- **Interactions**: Tooltip showing Product Name and Sales.

### 4. Profit Ratio Trend (`ProfitRatioTrendChart`)
- **Type**: Line Chart.
- **Data**: Aggregate `SUM(Profit)` and `SUM(Sales)` by `Order Date` (truncated to Month). Calculate Ratio per month.
- **Encodings**:
    - X-Axis: Order Date (Time scale).
    - Y-Axis: Profit Ratio (Linear scale, formatted as %).
    - Mark: Line with dots at data points.
- **Interactions**: Tooltip showing Date and Ratio.

## Sample Data

```json
[
  {
    "﻿Row ID": 2368,
    "Order ID": "CA-2018-123659",
    "Order Date": "2018-02-10",
    "Ship Date": "2018-02-13",
    "Ship Mode": "First Class",
    "Customer ID": "MN-17935",
    "Customer Name": "Michael Nguyen",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Clinton",
    "State": "Maryland",
    "Postal Code": 20735.0,
    "Region": "East",
    "Product ID": "OFF-PA-10002464",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "HP Office Recycled Paper (20Lb. and 87 Bright)",
    "Sales": 23.12,
    "Quantity": 4,
    "Discount": 0.0,
    "Profit": 11.328800000000001
  },
  {
    "﻿Row ID": 6522,
    "Order ID": "CA-2018-138289",
    "Order Date": "2018-01-16",
    "Ship Date": "2018-01-18",
    "Ship Mode": "Second Class",
    "Customer ID": "AR-10540",
    "Customer Name": "Andy Reiter",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Jackson",
    "State": "Michigan",
    "Postal Code": 49201.0,
    "Region": "Central",
    "Product ID": "FUR-CH-10004626",
    "Category": "Furniture",
    "Sub-Category": "Chairs",
    "Product Name": "Office Star Flex Back Scooter Chair with Aluminum Finish Frame",
    "Sales": 302.67,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 72.6408
  },
  {
    "﻿Row ID": 3846,
    "Order ID": "CA-2015-101931",
    "Order Date": "2015-10-28",
    "Ship Date": "2015-10-31",
    "Ship Mode": "First Class",
    "Customer ID": "TS-21370",
    "Customer Name": "Todd Sumrall",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Los Angeles",
    "State": "California",
    "Postal Code": 90049.0,
    "Region": "West",
    "Product ID": "FUR-BO-10001337",
    "Category": "Furniture",
    "Sub-Category": "Bookcases",
    "Product Name": "O'Sullivan Living Dimensions 2-Shelf Bookcases",
    "Sales": 616.998,
    "Quantity": 6,
    "Discount": 0.15,
    "Profit": -36.294
  },
  {
    "﻿Row ID": 480,
    "Order ID": "CA-2017-100790",
    "Order Date": "2017-06-26",
    "Ship Date": "2017-07-02",
    "Ship Mode": "Standard Class",
    "Customer ID": "JG-15805",
    "Customer Name": "John Grady",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10024.0,
    "Region": "East",
    "Product ID": "OFF-AR-10003045",
    "Category": "Office Supplies",
    "Sub-Category": "Art",
    "Product Name": "Prang Colored Pencils",
    "Sales": 14.7,
    "Quantity": 5,
    "Discount": 0.0,
    "Profit": 6.615
  },
  {
    "﻿Row ID": 7855,
    "Order ID": "CA-2018-135587",
    "Order Date": "2018-12-07",
    "Ship Date": "2018-12-12",
    "Ship Mode": "Standard Class",
    "Customer ID": "BH-11710",
    "Customer Name": "Brosina Hoffman",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Hattiesburg",
    "State": "Mississippi",
    "Postal Code": 39401.0,
    "Region": "South",
    "Product ID": "OFF-AP-10004540",
    "Category": "Office Supplies",
    "Sub-Category": "Appliances",
    "Product Name": "Eureka The Boss Lite 10-Amp Upright Vacuum, Blue",
    "Sales": 320.64,
    "Quantity": 4,
    "Discount": 0.0,
    "Profit": 89.7792
  },
  {
    "﻿Row ID": 3904,
    "Order ID": "CA-2016-167010",
    "Order Date": "2016-04-05",
    "Ship Date": "2016-04-10",
    "Ship Mode": "Standard Class",
    "Customer ID": "VT-21700",
    "Customer Name": "Valerie Takahito",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "Philadelphia",
    "State": "Pennsylvania",
    "Postal Code": 19143.0,
    "Region": "East",
    "Product ID": "OFF-AP-10004036",
    "Category": "Office Supplies",
    "Sub-Category": "Appliances",
    "Product Name": "Bionaire 99.97% HEPA Air Cleaner",
    "Sales": 98.112,
    "Quantity": 7,
    "Discount": 0.2,
    "Profit": 18.396
  },
  {
    "﻿Row ID": 3599,
    "Order ID": "CA-2015-102869",
    "Order Date": "2015-09-09",
    "Ship Date": "2015-09-14",
    "Ship Mode": "Second Class",
    "Customer ID": "LC-17140",
    "Customer Name": "Logan Currie",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Philadelphia",
    "State": "Pennsylvania",
    "Postal Code": 19140.0,
    "Region": "East",
    "Product ID": "FUR-FU-10002456",
    "Category": "Furniture",
    "Sub-Category": "Furnishings",
    "Product Name": "Master Caster Door Stop, Large Neon Orange",
    "Sales": 17.472,
    "Quantity": 3,
    "Discount": 0.2,
    "Profit": 5.023200000000001
  },
  {
    "﻿Row ID": 5348,
    "Order ID": "CA-2018-108539",
    "Order Date": "2018-03-21",
    "Ship Date": "2018-03-23",
    "Ship Mode": "Second Class",
    "Customer ID": "SC-20725",
    "Customer Name": "Steven Cartwright",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Los Angeles",
    "State": "California",
    "Postal Code": 90045.0,
    "Region": "West",
    "Product ID": "OFF-BI-10001031",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Pressboard Data Binders by Wilson Jones",
    "Sales": 8.544,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 2.8835999999999995
  },
  {
    "﻿Row ID": 8581,
    "Order ID": "CA-2015-130673",
    "Order Date": "2015-05-20",
    "Ship Date": "2015-05-22",
    "Ship Mode": "Second Class",
    "Customer ID": "MC-17590",
    "Customer Name": "Matt Collister",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "San Marcos",
    "State": "Texas",
    "Postal Code": 78666.0,
    "Region": "Central",
    "Product ID": "FUR-FU-10003489",
    "Category": "Furniture",
    "Sub-Category": "Furnishings",
    "Product Name": "Contemporary Borderless Frame",
    "Sales": 10.332,
    "Quantity": 3,
    "Discount": 0.6,
    "Profit": -5.940899999999999
  },
  {
    "﻿Row ID": 1832,
    "Order ID": "CA-2018-145884",
    "Order Date": "2018-10-21",
    "Ship Date": "2018-10-21",
    "Ship Mode": "Same Day",
    "Customer ID": "SL-20155",
    "Customer Name": "Sara Luxemburg",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "Muskogee",
    "State": "Oklahoma",
    "Postal Code": 74403.0,
    "Region": "Central",
    "Product ID": "FUR-TA-10002356",
    "Category": "Furniture",
    "Sub-Category": "Tables",
    "Product Name": "Bevis Boat-Shaped Conference Table",
    "Sales": 262.11,
    "Quantity": 1,
    "Discount": 0.0,
    "Profit": 62.90639999999999
  }
]
```

## Implementation Notes

- Ensure the app handles the loading state gracefully while fetching the CSV.
- Use D3 selections within `useEffect` to render SVG elements into React `ref` containers.
- Ensure the layout is responsive; charts should resize based on their container width (use `ResizeObserver` or `window.addEventListener('resize')`).
- Preserve the exact naming conventions found in the XML for dimensions (e.g., "Product Name (group)", "Profit Ratio") in your internal logic or comments.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_190/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P1968__customer_overview
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[none:Region:nk]`
- cols_field: `([ds_p9517_sample_superstore].[:Measure Names] * [ds_p9517_sample_superstore].[Multiple Values])`
- series_field: `[ds_p9517_sample_superstore].[usr:Calculation_5571209093911105:qk]`
- zone: x=800, y=1000, w=49200, h=61748
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[sum:Profit:qk]`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
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
