# Project Requirements

You are a Senior React Engineer tasked with recreating a Tableau dashboard using React, TypeScript, and Vite.

## Project Overview
The goal is to build an "Informative Dashboard" analyzing Superstore sales data. The dashboard must visualize key performance indicators (Sales, Profit, Profit Ratio) and break down performance by Category, Manufacturer (grouped), and Top Products.

## Tech Stack
- **Framework:** React 18+
- **Language:** TypeScript
- **Build Tool:** Vite
- **Visualization:** D3.js (v7 or later) for primitives (`d3-scale`, `d3-shape`, `d3-axis`, `d3-array`). Do not use high-level chart libraries like Recharts or Nivo unless necessary for complex interactions; prefer raw D3 for control.
- **Styling:** CSS Modules or Tailwind CSS (optional, but keep styling inline or modular).

## Data Loading

The primary data source is a CSV file located at `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`.

Implement a `useData` hook to fetch and parse this data.

```typescript
// src/hooks/useData.ts
import { useState, useEffect } from 'react';
import { csv } from 'd3-fetch';
import { timeParse } from 'd3-time-format';

// Define the shape of a row from the CSV
export interface SuperstoreOrder {
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

export const useData = () => {
  const [data, setData] = useState<SuperstoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const parseDate = timeParse('%m/%d/%Y'); // Adjust format based on actual CSV content
        
        const rawData = await csv<SuperstoreOrder>(
          '/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv',
          (d) => {
            // Type coercion and parsing
            return {
              ...d,
              'Row ID': +d['Row ID'],
              'Order Date': d['Order Date'], // Keep as string or parse to Date object here
              'Ship Date': d['Ship Date'],
              'Postal Code': +d['Postal Code'],
              'Sales': +d['Sales'],
              'Quantity': +d['Quantity'],
              'Discount': +d['Discount'],
              'Profit': +d['Profit'],
            } as SuperstoreOrder;
          }
        );
        setData(rawData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
```

## Data Transformations & Calculated Fields

The Tableau workbook defines specific calculated fields. You must implement these logic functions in TypeScript.

### 1. Profit Ratio
Formula: `SUM([Profit]) / SUM([Sales])`

### 2. Product Name (group)
The workbook contains a massive grouping mapping specific `Product Name` strings to `Manufacturer` groups (e.g., "3D Systems", "3M", "Acco").

*Implementation Strategy:* Create a utility function `getManufacturer(productName: string)`. Since the full mapping is extensive, implement a helper that checks the start of the string or specific keywords found in the XML (e.g., if product starts with "3D", return "3D Systems"). For the purpose of this implementation, create a mapping object for the top 20 manufacturers visible in the XML and default to "Other" for the rest.

### 3. Top 10 Product
Formula logic: Identify the top 10 products by Sales.

*Implementation Strategy:* Aggregate data by `Product Name`, sum `Sales`, sort descending, take top 10.

## Dashboard Layout

Use a CSS Grid layout to mimic the Tableau dashboard structure.

- **Container:** `display: grid; grid-template-columns: 250px 1fr; grid-template-rows: auto 1fr; height: 100vh;`
- **Sidebar (Filters):** Left column. Contains filters for Region, Segment, and Category.
- **Main Content:** Right column. Contains the visualizations.

### Main Content Grid
- **Row 1 (KPIs):** 3 Cards (Total Sales, Total Profit, Profit Ratio).
- **Row 2 (Charts):**
  - **Left:** Sales by Category (Bar Chart).
  - **Right:** Sales by Manufacturer (Bar Chart using `Product Name (group)`).
- **Row 3 (Details):**
  - **Full Width:** Top 10 Products Table or Bar Chart.

## Component Specifications

### 1. `KPICard`
- **Props:** `title` (string), `value` (number | string), `format` (optional, e.g., currency or percentage).
- **Visuals:** Simple card with a bold value and a lighter title.

### 2. `SalesByCategoryChart`
- **Type:** Horizontal Bar Chart.
- **Data:** Group by `Category`, Sum of `Sales`.
- **D3 Implementation:** Use `scaleBand` for Y-axis (Category) and `scaleLinear` for X-axis (Sales). Color bars by Category.

### 3. `ManufacturerChart`
- **Type:** Vertical Bar Chart.
- **Data:** Group by `Product Name (group)` (Manufacturer), Sum of `Sales`.
- **D3 Implementation:** Use `scaleBand` for X-axis and `scaleLinear` for Y-axis.

### 4. `TopProductsChart`
- **Type:** Horizontal Bar Chart.
- **Data:** Top 10 `Product Name` by `Sales`.
- **D3 Implementation:** Similar to `SalesByCategoryChart` but limited to top 10.

### 5. `FilterSidebar`
- **Controls:**
  - Region (Multi-select or Single-select dropdown).
  - Segment (Multi-select checkboxes).
  - Category (Multi-select checkboxes).
- **Interaction:** Selecting a filter updates the global state, which re-filters the data passed to all charts.

## Interactions

- **Filtering:** All charts must react to the filters in the sidebar.
- **Tooltips:** Hovering over bars in D3 charts should display the exact value and the dimension name.

## Sample Data

Here is a sample of the data structure you will be working with:

```json
[
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
    "﻿Row ID": 1581,
    "Order ID": "CA-2016-131338",
    "Order Date": "2016-08-09",
    "Ship Date": "2016-08-12",
    "Ship Mode": "First Class",
    "Customer ID": "NP-18325",
    "Customer Name": "Naresj Patel",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10024.0,
    "Region": "East",
    "Product ID": "FUR-TA-10002607",
    "Category": "Furniture",
    "Sub-Category": "Tables",
    "Product Name": "KI Conference Tables",
    "Sales": 382.806,
    "Quantity": 9,
    "Discount": 0.4,
    "Profit": -153.12239999999997
  },
  {
    "﻿Row ID": 8503,
    "Order ID": "CA-2016-102316",
    "Order Date": "2016-03-01",
    "Ship Date": "2016-03-03",
    "Ship Mode": "Second Class",
    "Customer ID": "DH-13075",
    "Customer Name": "Dave Hallsten",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Los Angeles",
    "State": "California",
    "Postal Code": 90045.0,
    "Region": "West",
    "Product ID": "FUR-CH-10003396",
    "Category": "Furniture",
    "Sub-Category": "Chairs",
    "Product Name": "Global Deluxe Steno Chair",
    "Sales": 184.752,
    "Quantity": 3,
    "Discount": 0.2,
    "Profit": -20.78460000000001
  },
  {
    "﻿Row ID": 957,
    "Order ID": "CA-2018-102414",
    "Order Date": "2018-05-15",
    "Ship Date": "2018-05-18",
    "Ship Mode": "Second Class",
    "Customer ID": "JA-15970",
    "Customer Name": "Joseph Airdo",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Phoenix",
    "State": "Arizona",
    "Postal Code": 85023.0,
    "Region": "West",
    "Product ID": "TEC-PH-10002923",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Logitech B530 USB Headset - headset - Full size, Binaural",
    "Sales": 29.592000000000002,
    "Quantity": 1,
    "Discount": 0.2,
    "Profit": 2.5893000000000006
  },
  {
    "﻿Row ID": 9013,
    "Order ID": "CA-2017-121447",
    "Order Date": "2017-02-21",
    "Ship Date": "2017-02-22",
    "Ship Mode": "First Class",
    "Customer ID": "EA-14035",
    "Customer Name": "Erin Ashbrook",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10011.0,
    "Region": "East",
    "Product ID": "FUR-FU-10001861",
    "Category": "Furniture",
    "Sub-Category": "Furnishings",
    "Product Name": "Floodlight Indoor Halogen Bulbs, 1 Bulb per Pack, 60 Watts",
    "Sales": 135.79999999999998,
    "Quantity": 7,
    "Discount": 0.0,
    "Profit": 66.54199999999999
  },
  {
    "﻿Row ID": 8342,
    "Order ID": "CA-2018-141481",
    "Order Date": "2018-06-11",
    "Ship Date": "2018-06-14",
    "Ship Mode": "First Class",
    "Customer ID": "ZD-21925",
    "Customer Name": "Zuschuss Donatelli",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Los Angeles",
    "State": "California",
    "Postal Code": 90036.0,
    "Region": "West",
    "Product ID": "OFF-AP-10004532",
    "Category": "Office Supplies",
    "Sub-Category": "Appliances",
    "Product Name": "Kensington 6 Outlet Guardian Standard Surge Protector",
    "Sales": 61.44,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 16.5888
  },
  {
    "﻿Row ID": 5340,
    "Order ID": "CA-2016-146486",
    "Order Date": "2016-11-09",
    "Ship Date": "2016-11-14",
    "Ship Mode": "Second Class",
    "Customer ID": "DV-13465",
    "Customer Name": "Dianna Vittorini",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Oceanside",
    "State": "New York",
    "Postal Code": 11572.0,
    "Region": "East",
    "Product ID": "OFF-EN-10001509",
    "Category": "Office Supplies",
    "Sub-Category": "Envelopes",
    "Product Name": "Poly String Tie Envelopes",
    "Sales": 12.24,
    "Quantity": 6,
    "Discount": 0.0,
    "Profit": 5.752799999999999
  },
  {
    "﻿Row ID": 7796,
    "Order ID": "CA-2016-112711",
    "Order Date": "2016-07-12",
    "Ship Date": "2016-07-18",
    "Ship Mode": "Standard Class",
    "Customer ID": "FM-14380",
    "Customer Name": "Fred McMath",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Amarillo",
    "State": "Texas",
    "Postal Code": 79109.0,
    "Region": "Central",
    "Product ID": "TEC-PH-10000526",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Vtech CS6719",
    "Sales": 307.168,
    "Quantity": 4,
    "Discount": 0.2,
    "Profit": 30.716800000000006
  },
  {
    "﻿Row ID": 3835,
    "Order ID": "CA-2015-105984",
    "Order Date": "2015-11-24",
    "Ship Date": "2015-11-24",
    "Ship Mode": "Same Day",
    "Customer ID": "MY-18295",
    "Customer Name": "Muhammed Yedwab",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Columbus",
    "State": "Ohio",
    "Postal Code": 43229.0,
    "Region": "East",
    "Product ID": "FUR-CH-10000847",
    "Category": "Furniture",
    "Sub-Category": "Chairs",
    "Product Name": "Global Executive Mid-Back Manager's Chair",
    "Sales": 611.058,
    "Quantity": 3,
    "Discount": 0.3,
    "Profit": -34.91760000000002
  },
  {
    "﻿Row ID": 5515,
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
    "Product ID": "OFF-AP-10004540",
    "Category": "Office Supplies",
    "Sub-Category": "Appliances",
    "Product Name": "Eureka The Boss Lite 10-Amp Upright Vacuum, Blue",
    "Sales": 160.32,
    "Quantity": 2,
    "Discount": 0.0,
    "Profit": 44.8896
  }
]
```

## Implementation Steps

1.  **Setup:** Initialize Vite project with React + TypeScript. Install `d3`, `d3-fetch`, `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-time-format`.
2.  **Data Layer:** Create `types.ts` and `useData.ts`.
3.  **Logic:** Create `utils/calculations.ts` for `Profit Ratio` and `Manufacturer Grouping`.
4.  **Components:** Build `KPICard`, `SalesByCategoryChart`, `ManufacturerChart`, `TopProductsChart`, `FilterSidebar`.
5.  **Layout:** Assemble in `App.tsx` using CSS Grid.
6.  **Styling:** Apply basic styling to ensure the dashboard looks professional (clean fonts, spacing, colors).

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv

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
const rows = await loadCsv("/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_155/docs/tableau_render_contract.json`
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
- zone: x=50000, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__bar
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p9517_sample_superstore].[none:Category:nk] / [ds_p9517_sample_superstore].[none:Sub-Category:nk])`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=593, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- cols_field: `[ds_p9517_sample_superstore].[yr:Order Date:ok]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=593, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1968__customer_overview
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[none:Region:nk]`
- cols_field: `([ds_p9517_sample_superstore].[:Measure Names] * [ds_p9517_sample_superstore].[Multiple Values])`
- series_field: `[ds_p9517_sample_superstore].[usr:Calculation_5571209093911105:qk]`
- zone: x=50000, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
