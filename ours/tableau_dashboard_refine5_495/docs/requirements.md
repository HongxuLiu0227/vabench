# Project Requirements

You are a Senior React Engineer and expert in D3.js. Your task is to implement a dashboard application based on the 'Superstore' dataset and the Tableau workbook logic provided.

The workbook XML provided was truncated and did not contain the explicit `<dashboard>` layout definitions. However, it contained critical calculated fields and data groupings. You must implement a dashboard that utilizes these specific fields to recreate the intended analysis.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array` directly, do not use high-level chart libraries).
- CSS Grid/Flexbox for layout.

## Data Loading

The primary data source is located at: `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`

Implement a data loader utility that fetches this CSV and parses it. Use `d3-dsv` or standard string parsing.

```typescript
// src/utils/dataLoader.ts
import { csvParse } from 'd3-dsv';

export interface SuperstoreOrder {
  'Row ID': number;
  'Order ID': string;
  'Order Date': string; // ISO date string
  'Ship Date': string;  // ISO date string
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

export const loadData = async (): Promise<SuperstoreOrder[]> => {
  const response = await fetch('/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const csvText = await response.text();
  const data = csvParse(csvText) as unknown as SuperstoreOrder[];
  
  // Convert numeric fields
  return data.map(d => ({
    ...d,
    'Row ID': +d['Row ID'],
    'Sales': +d['Sales'],
    'Quantity': +d['Quantity'],
    'Discount': +d['Discount'],
    'Profit': +d['Profit'],
    'Postal Code': +d['Postal Code'],
    'Order Date': new Date(d['Order Date']).toISOString(),
    'Ship Date': new Date(d['Ship Date']).toISOString()
  }));
};
```

## Data Processing & Calculated Fields

The Tableau workbook defines specific calculated fields. You must replicate this logic in the React application.

1.  **Profit Ratio**: `SUM([Profit]) / SUM([Sales])`
2.  **Top 10 Product**: The workbook logic implies filtering for top products. Implement a function that aggregates Sales by `Product Name`, sorts descending, and returns the top 10.
3.  **Product Name (group) [Manufacturer]**: The workbook contains a massive grouping of `Product Name` into Manufacturers (e.g., "3D Systems", "3M", "Acco").
    *   Create a utility function `getManufacturer(productName: string)` that checks the product name against a lookup map derived from the XML bin definitions.
    *   *Example Logic:* If `productName` includes "3D Systems Cube Printer", return "3D Systems".
    *   *Note:* The XML contains hundreds of these mappings. Implement a robust mapping object covering the major manufacturers found in the dataset (3D Systems, 3M, Acco, Acme, etc.).

## Component Architecture

### 1. `DashboardLayout`
A CSS Grid container.
- **Header**: Title "Informative Dashboard".
- **KPI Row**: 3 Cards (Total Sales, Total Profit, Profit Ratio).
- **Main Content**:
    - **Left Column (2/3 width)**: Sales over Time (Line Chart).
    - **Right Column (1/3 width)**:
        - Sales by Category (Bar Chart).
        - Top 10 Products (Bar Chart).

### 2. `KPICard`
Props: `title` (string), `value` (number | string), `format` (optional, e.g., currency or percentage).
Display the metric prominently.

### 3. `SalesOverTimeChart`
- **Type**: Line Chart.
- **X-Axis**: `Order Date` (truncated to Month or Year).
- **Y-Axis**: Sum of `Sales`.
- **D3 Implementation**: Use `d3.scaleTime`, `d3.scaleLinear`, `d3.line`, `d3.axisBottom`, `d3.axisLeft`.
- **Interaction**: Tooltip showing Date and Sales amount on hover.

### 4. `CategorySalesChart`
- **Type**: Horizontal Bar Chart.
- **Y-Axis**: `Category`.
- **X-Axis**: Sum of `Sales`.
- **Color**: Encode by `Category`.
- **D3 Implementation**: `d3.scaleBand`, `d3.scaleLinear`, `d3.axisLeft`, `d3.axisBottom`.

### 5. `TopProductsChart`
- **Type**: Horizontal Bar Chart.
- **Data**: Top 10 `Product Name`s by `Sales`.
- **Y-Axis**: `Product Name`.
- **X-Axis**: `Sales`.
- **D3 Implementation**: `d3.scaleBand`, `d3.scaleLinear`.

### 6. `ManufacturerChart` (Optional but recommended based on XML)
- **Type**: Bar Chart.
- **Data**: Aggregated Sales by the calculated `Manufacturer` group.

## Interactions

- **Global Filters**: Add a filter control for `Region` and `Segment`.
- **Wiring**: When a filter changes, filter the raw data array, then re-calculate aggregates for all charts.

## Styling
- Use standard CSS modules or styled-components.
- Maintain a clean, professional look similar to Tableau defaults (white background, standard sans-serif fonts, distinct axis lines).

## Sample Data

```json
[
  {
    "﻿Row ID": 1129,
    "Order ID": "CA-2016-105970",
    "Order Date": "2016-03-02",
    "Ship Date": "2016-03-07",
    "Ship Mode": "Standard Class",
    "Customer ID": "PA-19060",
    "Customer Name": "Pete Armstrong",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "Richmond",
    "State": "Indiana",
    "Postal Code": 47374.0,
    "Region": "Central",
    "Product ID": "OFF-EN-10001532",
    "Category": "Office Supplies",
    "Sub-Category": "Envelopes",
    "Product Name": "Brown Kraft Recycled Envelopes",
    "Sales": 101.88,
    "Quantity": 6,
    "Discount": 0.0,
    "Profit": 50.94
  },
  {
    "﻿Row ID": 3942,
    "Order ID": "CA-2018-117863",
    "Order Date": "2018-05-18",
    "Ship Date": "2018-05-23",
    "Ship Mode": "Standard Class",
    "Customer ID": "TS-21340",
    "Customer Name": "Toby Swindell",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10024.0,
    "Region": "East",
    "Product ID": "OFF-BI-10000605",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Acco Pressboard Covers with Storage Hooks, 9 1/2\" x 11\"\"",
    "Sales": "Executive Red\"",
    "Quantity": 3.048,
    "Discount": 1,
    "Profit": 0.2,
    "null": "['1.0286999999999997']"
  },
  {
    "﻿Row ID": 3537,
    "Order ID": "CA-2017-145842",
    "Order Date": "2017-06-17",
    "Ship Date": "2017-06-20",
    "Ship Mode": "Second Class",
    "Customer ID": "FM-14380",
    "Customer Name": "Fred McMath",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10024.0,
    "Region": "East",
    "Product ID": "OFF-ST-10000419",
    "Category": "Office Supplies",
    "Sub-Category": "Storage",
    "Product Name": "Rogers Jumbo File, Granite",
    "Sales": 40.74,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 0.4073999999999991
  },
  {
    "﻿Row ID": 3120,
    "Order ID": "CA-2016-121720",
    "Order Date": "2016-06-11",
    "Ship Date": "2016-06-12",
    "Ship Mode": "First Class",
    "Customer ID": "JE-15610",
    "Customer Name": "Jim Epp",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Lakeland",
    "State": "Florida",
    "Postal Code": 33801.0,
    "Region": "South",
    "Product ID": "TEC-PH-10002496",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Cisco SPA301",
    "Sales": 249.58400000000003,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 31.197999999999986
  },
  {
    "﻿Row ID": 2408,
    "Order ID": "CA-2018-144589",
    "Order Date": "2018-01-20",
    "Ship Date": "2018-01-25",
    "Ship Mode": "Standard Class",
    "Customer ID": "TM-21010",
    "Customer Name": "Tamara Manning",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "San Francisco",
    "State": "California",
    "Postal Code": 94122.0,
    "Region": "West",
    "Product ID": "OFF-AR-10003631",
    "Category": "Office Supplies",
    "Sub-Category": "Art",
    "Product Name": "Staples in misc. colors",
    "Sales": 24.2,
    "Quantity": 5,
    "Discount": 0.0,
    "Profit": 7.986
  },
  {
    "﻿Row ID": 4473,
    "Order ID": "CA-2018-121300",
    "Order Date": "2018-09-29",
    "Ship Date": "2018-09-29",
    "Ship Mode": "Same Day",
    "Customer ID": "MG-17680",
    "Customer Name": "Maureen Gastineau",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "Mentor",
    "State": "Ohio",
    "Postal Code": 44060.0,
    "Region": "East",
    "Product ID": "TEC-AC-10004571",
    "Category": "Technology",
    "Sub-Category": "Accessories",
    "Product Name": "Logitech G700s Rechargeable Gaming Mouse",
    "Sales": 239.976,
    "Quantity": 3,
    "Discount": 0.2,
    "Profit": 65.99340000000001
  },
  {
    "﻿Row ID": 6788,
    "Order ID": "CA-2016-118843",
    "Order Date": "2016-09-13",
    "Ship Date": "2016-09-20",
    "Ship Mode": "Standard Class",
    "Customer ID": "JH-15910",
    "Customer Name": "Jonathan Howell",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Atlanta",
    "State": "Georgia",
    "Postal Code": 30318.0,
    "Region": "South",
    "Product ID": "FUR-FU-10003975",
    "Category": "Furniture",
    "Sub-Category": "Furnishings",
    "Product Name": "Eldon Advantage Chair Mats for Low to Medium Pile Carpets",
    "Sales": 129.93,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 12.992999999999988
  },
  {
    "﻿Row ID": 8362,
    "Order ID": "CA-2018-147207",
    "Order Date": "2018-01-02",
    "Ship Date": "2018-01-04",
    "Ship Mode": "Second Class",
    "Customer ID": "TS-21655",
    "Customer Name": "Trudy Schmidt",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "El Paso",
    "State": "Texas",
    "Postal Code": 79907.0,
    "Region": "Central",
    "Product ID": "OFF-AP-10000027",
    "Category": "Office Supplies",
    "Sub-Category": "Appliances",
    "Product Name": "Hoover Commercial SteamVac",
    "Sales": 5.431999999999999,
    "Quantity": 2,
    "Discount": 0.8,
    "Profit": -13.580000000000002
  },
  {
    "﻿Row ID": 8440,
    "Order ID": "CA-2018-114370",
    "Order Date": "2018-03-14",
    "Ship Date": "2018-03-17",
    "Ship Mode": "Second Class",
    "Customer ID": "BN-11470",
    "Customer Name": "Brad Norvell",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Chicago",
    "State": "Illinois",
    "Postal Code": 60623.0,
    "Region": "Central",
    "Product ID": "TEC-PH-10000213",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Seidio BD2-HK3IPH5-BK DILEX Case and Holster Combo for Apple iPhone 5/5s - Black",
    "Sales": 49.61600000000001,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 4.961599999999999
  },
  {
    "﻿Row ID": 5516,
    "Order ID": "CA-2016-103177",
    "Order Date": "2016-05-30",
    "Ship Date": "2016-06-01",
    "Ship Mode": "First Class",
    "Customer ID": "EN-13780",
    "Customer Name": "Edward Nazzal",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10009.0,
    "Region": "East",
    "Product ID": "TEC-PH-10001527",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Plantronics MX500i Earset",
    "Sales": 128.85000000000002,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 3.8654999999999973
  }
]
```

## Implementation Steps
1.  Setup Vite + React + TypeScript.
2.  Install D3 (`npm install d3` and `@types/d3`).
3.  Create the `loadData` function and fetch the CSV.
4.  Implement the calculated field logic (Profit Ratio, Manufacturer mapping).
5.  Build the `KPICard` component.
6.  Build the `SalesOverTimeChart` using D3 primitives.
7.  Build the `CategorySalesChart` using D3 primitives.
8.  Assemble in `DashboardLayout` with CSS Grid.
9.  Add Filter controls and wire them to state.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_495/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[sum:Profit:qk]`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=800, y=1000, w=49200, h=61748
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p9517_sample_superstore].[none:Sub-Category:nk] / [ds_p9517_sample_superstore].[none:Calculation_317222333014716416:nk])`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=50000, y=1000, w=49200, h=61750
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P121__bar
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p9517_sample_superstore].[none:Category:nk] / [ds_p9517_sample_superstore].[none:Sub-Category:nk])`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=800, y=62750, w=98400, h=36250
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
