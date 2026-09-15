# Project Requirements

You are an expert React and D3 developer. Your task is to implement a dashboard application based on the 'Informative Dashboard' concept using the provided Superstore dataset.

**Context:**
The provided Tableau XML was truncated and did not contain the specific worksheet or dashboard definitions. However, based on the filename '9517_dash_dashboard0_png_informative_dashboard' and the available columns in the datasource (Sales, Profit, Order Date, Category, Region, Product Name), you must recreate a standard, high-performance 'Informative Dashboard'.

**Tech Stack:**
- React 18+
- TypeScript
- Vite
- D3.js (v7) for visualizations (use primitives like d3-scale, d3-axis, d3-shape, d3-array). Do not use high-level chart libraries like Recharts or Nivo.
- CSS for styling (CSS Modules or standard CSS).

**Data Loading:**
1. The primary data source is located at: `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`.
2. Create a utility function `useData` that fetches this CSV using the native `fetch` API.
3. Parse the CSV text. You can use `d3-dsv` (d3.csvParse) or write a simple parser. Ensure types are inferred correctly (Sales/Profit as numbers, Order Date as Date object).
4. Handle loading and error states in the UI.

**Data Processing & Logic:**
- **Filtering:** The dashboard must support filtering by 'Region' and 'Category'. When a filter changes, all charts must update to reflect the filtered dataset.
- **Aggregations:**
  - **Total Sales:** Sum of the 'Sales' column.
  - **Total Profit:** Sum of the 'Profit' column.
  - **Profit Ratio:** Calculated as `(Total Profit / Total Sales)`. Format as a percentage (e.g., '12.5%').
  - **Top 10 Products:** Group data by 'Product Name', sum 'Sales' for each, sort descending, and take the top 10.

**Dashboard Layout:**
Use a CSS Grid layout for the main dashboard container.
- **Header:** Title 'Informative Dashboard' and a Filter Bar (Region: Multi-select or Dropdown, Category: Multi-select or Dropdown).
- **KPI Row:** Three cards displaying Total Sales, Total Profit, and Profit Ratio.
- **Main Charts Row:**
  - Left: 'Sales by Category' (Bar Chart).
  - Right: 'Sales over Time' (Line Chart - aggregated by Month or Year).
- **Bottom Row:**
  - Left: 'Profit by Region' (Bar Chart).
  - Right: 'Top 10 Products' (Table).

**Component Specifications:**

1.  `KPICard`
    - Props: `title` (string), `value` (string | number), `format` (optional, for currency/percent).
    - UI: Simple card with a bold value and a lighter title.

2.  `BarChart` (Generic)
    - Props: `data` (Array<{label: string, value: number}>), `xAxisLabel` (string), `yAxisLabel` (string), `color` (string).
    - Implementation:
      - Use `d3.scaleBand` for the X-axis (labels).
      - Use `d3.scaleLinear` for the Y-axis (values).
      - Use `d3.axisBottom` and `d3.axisLeft`.
      - Render SVG `rect` elements for bars.
      - Add tooltips on hover showing the exact value.

3.  `LineChart`
    - Props: `data` (Array<{date: Date, value: number}>).
    - Implementation:
      - Use `d3.scaleTime` for the X-axis.
      - Use `d3.scaleLinear` for the Y-axis.
      - Use `d3.line` to generate the `d` attribute for the path.
      - Render SVG `path` and circles for data points.
      - Add tooltips.

4.  `TopProductsTable`
    - Props: `data` (Array<{productName: string, sales: number}>).
    - UI: Standard HTML table with columns 'Product Name' and 'Sales'.

**Sample Data:**
Here is a sample of the data structure you will be working with:

```json
[
  {
    "﻿Row ID": 2630,
    "Order ID": "US-2018-165344",
    "Order Date": "2018-11-13",
    "Ship Date": "2018-11-15",
    "Ship Mode": "First Class",
    "Customer ID": "SB-20290",
    "Customer Name": "Sean Braxton",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Springfield",
    "State": "Ohio",
    "Postal Code": 45503.0,
    "Region": "East",
    "Product ID": "OFF-BI-10003196",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Accohide Poly Flexible Ring Binders",
    "Sales": 11.220000000000002,
    "Quantity": 10,
    "Discount": 0.7,
    "Profit": -7.479999999999997
  },
  {
    "﻿Row ID": 23,
    "Order ID": "CA-2017-137330",
    "Order Date": "2017-12-09",
    "Ship Date": "2017-12-13",
    "Ship Mode": "Standard Class",
    "Customer ID": "KB-16585",
    "Customer Name": "Ken Black",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Fremont",
    "State": "Nebraska",
    "Postal Code": 68025.0,
    "Region": "Central",
    "Product ID": "OFF-AP-10001492",
    "Category": "Office Supplies",
    "Sub-Category": "Appliances",
    "Product Name": "Acco Six-Outlet Power Strip, 4' Cord Length",
    "Sales": 60.339999999999996,
    "Quantity": 7,
    "Discount": 0.0,
    "Profit": 15.688400000000001
  },
  {
    "﻿Row ID": 1337,
    "Order ID": "US-2018-123281",
    "Order Date": "2018-04-02",
    "Ship Date": "2018-04-07",
    "Ship Mode": "Standard Class",
    "Customer ID": "JF-15190",
    "Customer Name": "Jamie Frazer",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Los Angeles",
    "State": "California",
    "Postal Code": 90008.0,
    "Region": "West",
    "Product ID": "FUR-FU-10003724",
    "Category": "Furniture",
    "Sub-Category": "Furnishings",
    "Product Name": "Westinghouse Clip-On Gooseneck Lamps",
    "Sales": 25.11,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 6.528599999999999
  },
  {
    "﻿Row ID": 319,
    "Order ID": "CA-2015-164973",
    "Order Date": "2015-11-04",
    "Ship Date": "2015-11-09",
    "Ship Mode": "Standard Class",
    "Customer ID": "NM-18445",
    "Customer Name": "Nathan Mautz",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10024.0,
    "Region": "East",
    "Product ID": "TEC-MA-10002927",
    "Category": "Technology",
    "Sub-Category": "Machines",
    "Product Name": "Canon imageCLASS MF7460 Monochrome Digital Laser Multifunction Copier",
    "Sales": 3991.98,
    "Quantity": 2,
    "Discount": 0.0,
    "Profit": 1995.99
  },
  {
    "﻿Row ID": 4169,
    "Order ID": "CA-2015-157924",
    "Order Date": "2015-10-11",
    "Ship Date": "2015-10-13",
    "Ship Mode": "First Class",
    "Customer ID": "HA-14920",
    "Customer Name": "Helen Andreada",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Pasadena",
    "State": "California",
    "Postal Code": 91104.0,
    "Region": "West",
    "Product ID": "FUR-CH-10000229",
    "Category": "Furniture",
    "Sub-Category": "Chairs",
    "Product Name": "Global Enterprise Series Seating High-Back Swivel/Tilt Chairs",
    "Sales": 433.56800000000004,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": -65.03520000000005
  },
  {
    "﻿Row ID": 4207,
    "Order ID": "CA-2015-145387",
    "Order Date": "2015-10-31",
    "Ship Date": "2015-11-02",
    "Ship Mode": "Second Class",
    "Customer ID": "AM-10705",
    "Customer Name": "Anne McFarland",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Cranston",
    "State": "Rhode Island",
    "Postal Code": 2920.0,
    "Region": "East",
    "Product ID": "OFF-BI-10004001",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "GBC Recycled VeloBinder Covers",
    "Sales": 34.08,
    "Quantity": 2,
    "Discount": 0.0,
    "Profit": 15.676799999999997
  },
  {
    "﻿Row ID": 4193,
    "Order ID": "CA-2016-150875",
    "Order Date": "2016-11-16",
    "Ship Date": "2016-11-20",
    "Ship Mode": "Standard Class",
    "Customer ID": "HK-14890",
    "Customer Name": "Heather Kirkland",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Boise",
    "State": "Idaho",
    "Postal Code": 83704.0,
    "Region": "West",
    "Product ID": "FUR-TA-10000577",
    "Category": "Furniture",
    "Sub-Category": "Tables",
    "Product Name": "Bretford CR4500 Series Slim Rectangular Table",
    "Sales": 696.42,
    "Quantity": 2,
    "Discount": 0.0,
    "Profit": 160.1766
  },
  {
    "﻿Row ID": 2999,
    "Order ID": "CA-2015-138317",
    "Order Date": "2015-06-21",
    "Ship Date": "2015-06-25",
    "Ship Mode": "Standard Class",
    "Customer ID": "NW-18400",
    "Customer Name": "Natalie Webber",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Philadelphia",
    "State": "Pennsylvania",
    "Postal Code": 19120.0,
    "Region": "East",
    "Product ID": "TEC-AC-10003628",
    "Category": "Technology",
    "Sub-Category": "Accessories",
    "Product Name": "Logitech 910-002974 M325 Wireless Mouse for Web Scrolling",
    "Sales": 95.968,
    "Quantity": 4,
    "Discount": 0.2,
    "Profit": 28.79040000000001
  },
  {
    "﻿Row ID": 4782,
    "Order ID": "CA-2015-159310",
    "Order Date": "2015-11-07",
    "Ship Date": "2015-11-12",
    "Ship Mode": "Standard Class",
    "Customer ID": "SC-20725",
    "Customer Name": "Steven Cartwright",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Houston",
    "State": "Texas",
    "Postal Code": 77070.0,
    "Region": "Central",
    "Product ID": "OFF-BI-10000201",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Avery Triangle Shaped Sheet Lifters, Black, 2/Pack",
    "Sales": 1.4759999999999995,
    "Quantity": 3,
    "Discount": 0.8,
    "Profit": -2.214
  },
  {
    "﻿Row ID": 9354,
    "Order ID": "CA-2018-148411",
    "Order Date": "2018-09-24",
    "Ship Date": "2018-09-26",
    "Ship Mode": "First Class",
    "Customer ID": "RO-19780",
    "Customer Name": "Rose O'Brian",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Chicago",
    "State": "Illinois",
    "Postal Code": 60623.0,
    "Region": "Central",
    "Product ID": "OFF-PA-10002109",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Wirebound Voice Message Log Book",
    "Sales": 11.424,
    "Quantity": 3,
    "Discount": 0.2,
    "Profit": 3.7127999999999988
  }
]
```

**Implementation Steps:**
1. Initialize the Vite + React + TypeScript project.
2. Install D3 dependencies: `npm install d3 d3-scale d3-axis d3-shape d3-array d3-time d3-time-format`.
3. Create the `useData` hook to fetch and parse the CSV.
4. Create the layout components.
5. Implement the D3 charts ensuring they are responsive (listen to window resize or use `viewBox`).
6. Wire up the filters to update the state and re-render charts.
7. Ensure strict TypeScript typing for all props and data structures.

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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_460/docs/tableau_render_contract.json`
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
- zone: x=50000, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p9517_sample_superstore].[none:Sub-Category:nk] / [ds_p9517_sample_superstore].[none:Calculation_317222333014716416:nk])`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=593, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[sum:Profit:qk]`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=593, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- cols_field: `[ds_p9517_sample_superstore].[yr:Order Date:ok]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=50000, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
