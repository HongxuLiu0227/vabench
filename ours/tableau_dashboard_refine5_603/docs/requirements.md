# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled 'Informative Dashboard' based on the 'Superstore' dataset.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7) for visualizations (use d3-scale, d3-shape, d3-axis, d3-array, d3-time-format)
- CSS for styling (CSS Modules or standard CSS)

## Data Loading
The primary data source is located at `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`.

You must implement a `useData` hook or utility function to:
1. Fetch the CSV file using the native `fetch()` API.
2. Parse the CSV content using `d3-dsv` (d3.csvParse).
3. Type the parsed data according to the `SuperstoreOrder` interface defined below.
4. Perform necessary data transformations (date parsing, calculated fields).

## Data Interface
Define the following TypeScript interface for the raw data:

```typescript
interface SuperstoreOrder {
  'Row ID': number;
  'Order ID': string;
  'Order Date': string; // Raw string from CSV
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  'Segment': string;
  'Country': string;
  'City': string;
  'State': string;
  'Postal Code': number;
  'Region': string;
  'Product ID': string;
  'Category': string;
  'Sub-Category': string;
  'Product Name': string;
  'Sales': number;
  'Quantity': number;
  'Discount': number;
  'Profit': number;
}
```

## Data Transformations & Calculated Fields
The Tableau workbook defines specific calculated fields that must be replicated in the data processing layer:

1.  **Date Parsing**: Convert 'Order Date' and 'Ship Date' strings into JavaScript `Date` objects.
2.  **Profit Ratio**: Calculate as `SUM([Profit]) / SUM([Sales])`. This should be calculated at the aggregation level (e.g., for the whole dataset or per category).
3.  **Product Name (group) [Manufacturer]**: The workbook contains a massive grouping logic mapping specific 'Product Name' strings to 'Manufacturer' names (e.g., "3D Systems", "3M", "Acco", "Apple").
    -   **Implementation**: Create a utility function `getManufacturer(productName: string): string`.
    -   **Logic**: This function should check the product name against a predefined map derived from the workbook's bin definitions. If a match is found, return the Manufacturer name. If no match is found, return 'Other' or the original Product Name.
    -   **Note**: The map includes thousands of entries. For the purpose of this implementation, implement a robust subset of the mapping (e.g., for '3D Systems', '3M', 'Acco', 'Apple', 'Canon', 'HP', 'Logitech', 'Microsoft') and a fallback for others.
4.  **Top 10 Product**: The workbook logic implies filtering for top products. Implement a logic to identify the Top 10 Products by `Sales`.

## Dashboard Layout
The dashboard should use a CSS Grid layout to mimic the Tableau dashboard structure.

- **Container**: A centered container with a max-width (e.g., 1200px) and a light gray background.
- **Header**: Title "Informative Dashboard".
- **Grid Structure**:
    - **Row 1 (KPIs)**: 3 columns.
        -   Card 1: Total Sales (Formatted as Currency).
        -   Card 2: Total Profit (Formatted as Currency).
        -   Card 3: Profit Ratio (Formatted as Percentage).
    - **Row 2 (Main Chart)**: 1 column spanning full width.
        -   Chart: Sales over Time (Line Chart).
    - **Row 3 (Breakdowns)**: 2 columns (50% width each).
        -   Left: Sales by Category (Bar Chart).
        -   Right: Sales by Manufacturer (Bar Chart using the `Product Name (group)` field).

## Component Specifications

### 1. KPICard
- **Props**: `title: string`, `value: number | string`, `format?: 'currency' | 'percent' | 'number'`.
- **Visuals**: White card, subtle shadow, bold value, gray label.

### 2. SalesOverTimeChart (Line Chart)
- **Data**: Aggregated Sales by `Order Date` (Month-Year).
- **Visual Encoding**:
    -   X-Axis: Time (Month-Year).
    -   Y-Axis: Sum of Sales.
    -   Mark: Line (`d3.line`), stroke color blue (#1f77b4).
    -   Tooltip: Show Date and Sales amount on hover.

### 3. SalesByCategoryChart (Bar Chart)
- **Data**: Aggregated Sales by `Category`.
- **Visual Encoding**:
    -   X-Axis: Category names.
    -   Y-Axis: Sum of Sales.
    -   Mark: Bars (`d3.rect`), color based on Category (distinct colors for Furniture, Office Supplies, Technology).
    -   Tooltip: Show Category and Sales amount.

### 4. SalesByManufacturerChart (Bar Chart)
- **Data**: Aggregated Sales by the calculated `Manufacturer` field.
- **Visual Encoding**:
    -   X-Axis: Manufacturer names.
    -   Y-Axis: Sum of Sales.
    -   Mark: Bars, color teal (#2ca02c).
    -   Tooltip: Show Manufacturer and Sales amount.

## Sample Data
Here is a sample of the data structure you will be working with:

```json
[
  {
    "﻿Row ID": 1744,
    "Order ID": "CA-2018-152807",
    "Order Date": "2018-10-30",
    "Ship Date": "2018-11-03",
    "Ship Mode": "Standard Class",
    "Customer ID": "MC-18100",
    "Customer Name": "Mick Crebagga",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Philadelphia",
    "State": "Pennsylvania",
    "Postal Code": 19140.0,
    "Region": "East",
    "Product ID": "OFF-ST-10002486",
    "Category": "Office Supplies",
    "Sub-Category": "Storage",
    "Product Name": "Eldon Shelf Savers Cubes and Bins",
    "Sales": 11.168000000000001,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": -2.512800000000001
  },
  {
    "﻿Row ID": 7237,
    "Order ID": "CA-2015-138737",
    "Order Date": "2015-12-07",
    "Ship Date": "2015-12-10",
    "Ship Mode": "First Class",
    "Customer ID": "FP-14320",
    "Customer Name": "Frank Preis",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Los Angeles",
    "State": "California",
    "Postal Code": 90049.0,
    "Region": "West",
    "Product ID": "OFF-AR-10003190",
    "Category": "Office Supplies",
    "Sub-Category": "Art",
    "Product Name": "Newell 32",
    "Sales": 8.64,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 2.4192
  },
  {
    "﻿Row ID": 8426,
    "Order ID": "CA-2017-137652",
    "Order Date": "2017-08-28",
    "Ship Date": "2017-08-30",
    "Ship Mode": "First Class",
    "Customer ID": "EB-13750",
    "Customer Name": "Edward Becker",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Cincinnati",
    "State": "Ohio",
    "Postal Code": 45231.0,
    "Region": "East",
    "Product ID": "OFF-BI-10004099",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "GBC VeloBinder Strips",
    "Sales": 18.432000000000002,
    "Quantity": 8,
    "Discount": 0.7,
    "Profit": -12.287999999999997
  },
  {
    "﻿Row ID": 1209,
    "Order ID": "CA-2017-137050",
    "Order Date": "2017-07-14",
    "Ship Date": "2017-07-18",
    "Ship Mode": "Second Class",
    "Customer ID": "SW-20755",
    "Customer Name": "Steven Ward",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10009.0,
    "Region": "East",
    "Product ID": "OFF-FA-10002988",
    "Category": "Office Supplies",
    "Sub-Category": "Fasteners",
    "Product Name": "Ideal Clamps",
    "Sales": 14.069999999999999,
    "Quantity": 7,
    "Discount": 0.0,
    "Profit": 6.894299999999999
  },
  {
    "﻿Row ID": 7918,
    "Order ID": "CA-2018-100783",
    "Order Date": "2018-09-04",
    "Ship Date": "2018-09-08",
    "Ship Mode": "Second Class",
    "Customer ID": "JK-16120",
    "Customer Name": "Julie Kriz",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "Garland",
    "State": "Texas",
    "Postal Code": 75043.0,
    "Region": "Central",
    "Product ID": "OFF-AR-10000380",
    "Category": "Office Supplies",
    "Sub-Category": "Art",
    "Product Name": "Hunt PowerHouse Electric Pencil Sharpener, Blue",
    "Sales": 30.384,
    "Quantity": 1,
    "Discount": 0.2,
    "Profit": 3.7979999999999947
  },
  {
    "﻿Row ID": 7833,
    "Order ID": "CA-2017-112382",
    "Order Date": "2017-05-09",
    "Ship Date": "2017-05-13",
    "Ship Mode": "Standard Class",
    "Customer ID": "MB-18085",
    "Customer Name": "Mick Brown",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Houston",
    "State": "Texas",
    "Postal Code": 77036.0,
    "Region": "Central",
    "Product ID": "TEC-PH-10001552",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "I Need's 3d Hello Kitty Hybrid Silicone Case Cover for HTC One X 4g with 3d Hello Kitty Stylus Pen Green/pink",
    "Sales": 19.136000000000003,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 1.9136000000000006
  },
  {
    "﻿Row ID": 7412,
    "Order ID": "CA-2018-121125",
    "Order Date": "2018-05-30",
    "Ship Date": "2018-06-03",
    "Ship Mode": "Standard Class",
    "Customer ID": "MG-17890",
    "Customer Name": "Michael Granlund",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "Tigard",
    "State": "Oregon",
    "Postal Code": 97224.0,
    "Region": "West",
    "Product ID": "TEC-PH-10001619",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "LG G3",
    "Sales": 156.79200000000003,
    "Quantity": 1,
    "Discount": 0.2,
    "Profit": 17.639099999999985
  },
  {
    "﻿Row ID": 4377,
    "Order ID": "CA-2015-166954",
    "Order Date": "2015-04-25",
    "Ship Date": "2015-04-30",
    "Ship Mode": "Standard Class",
    "Customer ID": "BT-11305",
    "Customer Name": "Beth Thompson",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "San Gabriel",
    "State": "California",
    "Postal Code": 91776.0,
    "Region": "West",
    "Product ID": "OFF-AP-10001391",
    "Category": "Office Supplies",
    "Sub-Category": "Appliances",
    "Product Name": "Kensington 6 Outlet MasterPiece HOMEOFFICE Power Control Center",
    "Sales": 270.71999999999997,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 78.50879999999997
  },
  {
    "﻿Row ID": 6733,
    "Order ID": "CA-2015-120096",
    "Order Date": "2015-07-04",
    "Ship Date": "2015-07-07",
    "Ship Mode": "First Class",
    "Customer ID": "KE-16420",
    "Customer Name": "Katrina Edelman",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Aurora",
    "State": "Colorado",
    "Postal Code": 80013.0,
    "Region": "West",
    "Product ID": "OFF-PA-10001977",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Xerox 194",
    "Sales": 177.536,
    "Quantity": 4,
    "Discount": 0.2,
    "Profit": 62.13759999999999
  },
  {
    "﻿Row ID": 2920,
    "Order ID": "CA-2017-160129",
    "Order Date": "2017-11-23",
    "Ship Date": "2017-11-23",
    "Ship Mode": "Same Day",
    "Customer ID": "LS-17200",
    "Customer Name": "Luke Schmidt",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Philadelphia",
    "State": "Pennsylvania",
    "Postal Code": 19140.0,
    "Region": "East",
    "Product ID": "FUR-FU-10002088",
    "Category": "Furniture",
    "Sub-Category": "Furnishings",
    "Product Name": "Nu-Dell Float Frame 11 x 14 1/2",
    "Sales": 14.368000000000002,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 3.9512
  }
]
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_603/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- cols_field: `[ds_p9517_sample_superstore].[yr:Order Date:ok]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=50000, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P2648__discount_overview_by_region
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[none:Region:nk]`
- cols_field: `([ds_p9517_sample_superstore].[:Measure Names] * [ds_p9517_sample_superstore].[Multiple Values])`
- series_field: `[ds_p9517_sample_superstore].[avg:Discount:qk]`
- zone: x=593, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__line
- chart_intent: `line_chart`
- rows_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- cols_field: `[ds_p9517_sample_superstore].[tmn:Order Date:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=593, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[sum:Profit:qk]`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=50000, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
