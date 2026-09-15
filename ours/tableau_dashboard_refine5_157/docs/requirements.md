# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled 'Informative Dashboard' based on the 'Superstore' dataset.

The Tableau workbook XML provided was truncated, but the datasource definition and metadata records are complete. Based on the available fields (Sales, Profit, Quantity, Discount, Order Date, Ship Date, Category, Sub-Category, Region, State, City, Segment) and the calculated field 'Profit Ratio' (SUM([Profit])/SUM([Sales])), you must implement a standard executive overview dashboard.

## Tech Stack
- React 18+ with TypeScript.
- Vite for build tooling.
- D3.js (v7) for visualizations (use d3-scale, d3-axis, d3-shape, d3-array, d3-time-format).
- CSS Modules or standard CSS for styling (no external UI component libraries).

## Data Loading

The primary data source is located at: `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`

Implement a `useData` hook or utility function to fetch and parse this data.

```typescript
import { csv } from 'd3-fetch';
import { timeParse } from 'd3-time-format';

// Define the shape of a raw row from the CSV
interface RawSuperstoreRow {
  'Row ID': string;
  'Order ID': string;
  'Order Date': string;
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  Segment: string;
  Country: string;
  City: string;
  State: string;
  'Postal Code': string;
  Region: string;
  'Product ID': string;
  Category: string;
  'Sub-Category': string;
  'Product Name': string;
  Sales: string;
  Quantity: string;
  Discount: string;
  Profit: string;
}

// Define the typed interface for application use
export interface SuperstoreOrder {
  rowId: number;
  orderId: string;
  orderDate: Date;
  shipDate: Date;
  shipMode: string;
  customerId: string;
  customerName: string;
  segment: string;
  country: string;
  city: string;
  state: string;
  postalCode: number;
  region: string;
  productId: string;
  category: string;
  subCategory: string;
  productName: string;
  sales: number;
  quantity: number;
  discount: number;
  profit: number;
}

const parseDate = timeParse('%m/%d/%Y'); // Adjust format based on CSV inspection, usually US format in Superstore

export const loadData = async (): Promise<SuperstoreOrder[]> => {
  const data = await csv<RawSuperstoreRow>('/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv');
  
  return data.map((d) => ({
    rowId: +d['Row ID'],
    orderId: d['Order ID'],
    orderDate: parseDate(d['Order Date']) || new Date(),
    shipDate: parseDate(d['Ship Date']) || new Date(),
    shipMode: d['Ship Mode'],
    customerId: d['Customer ID'],
    customerName: d['Customer Name'],
    segment: d.Segment,
    country: d.Country,
    city: d.City,
    state: d.State,
    postalCode: +d['Postal Code'],
    region: d.Region,
    productId: d['Product ID'],
    category: d.Category,
    subCategory: d['Sub-Category'],
    productName: d['Product Name'],
    sales: +d.Sales,
    quantity: +d.Quantity,
    discount: +d.Discount,
    profit: +d.Profit,
  }));
};
```

## Dashboard Layout

The dashboard should use a CSS Grid layout with the following structure:

- **Header**: Title "Informative Dashboard".
- **KPI Row**: Three cards displaying Total Sales, Total Profit, and Profit Ratio.
- **Middle Row**: Two charts side-by-side.
    - Left: Sales by Category (Bar Chart).
    - Right: Sales by Region (Bar Chart).
- **Bottom Row**: One wide chart.
    - Sales over Time (Line Chart).

## Component Specifications

### 1. KPICard Component
- **Props**: `title` (string), `value` (number), `format` (string: 'currency' | 'number' | 'percent').
- **Behavior**: Displays the title and the formatted value. Large font for the value.
- **Logic**:
    - Total Sales: Sum of `sales`.
    - Total Profit: Sum of `profit`.
    - Profit Ratio: `Total Profit / Total Sales`.

### 2. BarChart Component (Generic)
- **Props**: `data` (Array<{label: string, value: number}>), `xLabel` (string), `yLabel` (string), `color` (string).
- **Implementation**:
    - Use `d3-scale-band` for the X-axis (Categories/Regions).
    - Use `d3-scale-linear` for the Y-axis (Sales).
    - Use `d3-axis-bottom` and `d3-axis-left`.
    - Render SVG `rect` elements for bars.
    - Add tooltips on hover showing the exact value.

### 3. LineChart Component
- **Props**: `data` (Array<{date: Date, value: number}>).
- **Implementation**:
    - Use `d3-scale-time` for the X-axis (Order Date).
    - Use `d3-scale-linear` for the Y-axis (Sales).
    - Use `d3-line` to generate the `d` attribute for the path.
    - Use `d3-axis-bottom` and `d3-axis-left`.
    - Add a simple circle for each data point (optional, depending on density).
    - Add tooltips on hover.

## Data Aggregation Logic

Before passing data to charts, aggregate the raw `SuperstoreOrder[]` array.

- **For Sales by Category**:
    ```typescript
    const salesByCategory = d3.rollup(
      data,
      v => d3.sum(v, d => d.sales),
      d => d.category
    );
    // Convert to array: [{ label: 'Furniture', value: 1000 }, ...]
    ```

- **For Sales by Region**:
    ```typescript
    const salesByRegion = d3.rollup(
      data,
      v => d3.sum(v, d => d.sales),
      d => d.region
    );
    ```

- **For Sales over Time**:
    ```typescript
    const salesByDate = d3.rollup(
      data,
      v => d3.sum(v, d => d.sales),
      d => d3.timeMonth(d.orderDate) // Aggregate by month
    );
    // Sort by date
    ```

## Interactions

- **Filtering**: Implement a global state `filters` object.
- **Interaction**: Clicking a bar in "Sales by Category" should filter the "Sales over Time" chart to show only the trend for that category.
- **Reset**: A "Reset Filters" button in the header to clear selections.

## Sample Data

```json
[
  {
    "﻿Row ID": 2831,
    "Order ID": "CA-2017-124149",
    "Order Date": "2017-04-23",
    "Ship Date": "2017-04-26",
    "Ship Mode": "First Class",
    "Customer ID": "MJ-17740",
    "Customer Name": "Max Jones",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Lancaster",
    "State": "Ohio",
    "Postal Code": 43130.0,
    "Region": "East",
    "Product ID": "OFF-PA-10002923",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Xerox 1942",
    "Sales": 78.304,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 29.363999999999997
  },
  {
    "﻿Row ID": 2596,
    "Order ID": "CA-2018-149048",
    "Order Date": "2018-05-13",
    "Ship Date": "2018-05-17",
    "Ship Mode": "Standard Class",
    "Customer ID": "BM-11650",
    "Customer Name": "Brian Moss",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Columbus",
    "State": "Indiana",
    "Postal Code": 47201.0,
    "Region": "Central",
    "Product ID": "OFF-BI-10004632",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Ibico Hi-Tech Manual Binding System",
    "Sales": 914.97,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 411.7365
  },
  {
    "﻿Row ID": 5333,
    "Order ID": "CA-2017-123120",
    "Order Date": "2017-09-04",
    "Ship Date": "2017-09-08",
    "Ship Mode": "Standard Class",
    "Customer ID": "CV-12295",
    "Customer Name": "Christina VanderZanden",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10011.0,
    "Region": "East",
    "Product ID": "OFF-SU-10002503",
    "Category": "Office Supplies",
    "Sub-Category": "Supplies",
    "Product Name": "Acme Preferred Stainless Steel Scissors",
    "Sales": 22.72,
    "Quantity": 4,
    "Discount": 0.0,
    "Profit": 6.588799999999999
  },
  {
    "﻿Row ID": 6164,
    "Order ID": "CA-2015-103989",
    "Order Date": "2015-03-19",
    "Ship Date": "2015-03-21",
    "Ship Mode": "First Class",
    "Customer ID": "MC-17605",
    "Customer Name": "Matt Connell",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Lakeland",
    "State": "Florida",
    "Postal Code": 33801.0,
    "Region": "South",
    "Product ID": "OFF-BI-10001196",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Avery Flip-Chart Easel Binder, Black",
    "Sales": 33.57,
    "Quantity": 5,
    "Discount": 0.7,
    "Profit": -25.737000000000002
  },
  {
    "﻿Row ID": 9512,
    "Order ID": "CA-2015-130575",
    "Order Date": "2015-12-14",
    "Ship Date": "2015-12-16",
    "Ship Mode": "First Class",
    "Customer ID": "CS-11845",
    "Customer Name": "Cari Sayre",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Chicago",
    "State": "Illinois",
    "Postal Code": 60623.0,
    "Region": "Central",
    "Product ID": "OFF-BI-10002353",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "GBC VeloBind Cover Sets",
    "Sales": 9.263999999999998,
    "Quantity": 3,
    "Discount": 0.8,
    "Profit": -13.895999999999997
  },
  {
    "﻿Row ID": 2712,
    "Order ID": "CA-2018-132430",
    "Order Date": "2018-10-09",
    "Ship Date": "2018-10-11",
    "Ship Mode": "First Class",
    "Customer ID": "CP-12085",
    "Customer Name": "Cathy Prescott",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Lakewood",
    "State": "Ohio",
    "Postal Code": 44107.0,
    "Region": "East",
    "Product ID": "FUR-FU-10003577",
    "Category": "Furniture",
    "Sub-Category": "Furnishings",
    "Product Name": "Nu-Dell Leatherette Frames",
    "Sales": 45.888000000000005,
    "Quantity": 4,
    "Discount": 0.2,
    "Profit": 9.177599999999998
  },
  {
    "﻿Row ID": 7603,
    "Order ID": "CA-2015-131947",
    "Order Date": "2015-09-17",
    "Ship Date": "2015-09-22",
    "Ship Mode": "Standard Class",
    "Customer ID": "JA-15970",
    "Customer Name": "Joseph Airdo",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Springfield",
    "State": "Oregon",
    "Postal Code": 97477.0,
    "Region": "West",
    "Product ID": "TEC-AC-10004633",
    "Category": "Technology",
    "Sub-Category": "Accessories",
    "Product Name": "Verbatim 25 GB 6x Blu-ray Single Layer Recordable Disc, 3/Pack",
    "Sales": 55.92,
    "Quantity": 10,
    "Discount": 0.2,
    "Profit": 16.776000000000007
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
    "﻿Row ID": 3019,
    "Order ID": "US-2017-160528",
    "Order Date": "2017-08-23",
    "Ship Date": "2017-08-30",
    "Ship Mode": "Standard Class",
    "Customer ID": "MH-18115",
    "Customer Name": "Mick Hernandez",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "Pharr",
    "State": "Texas",
    "Postal Code": 78577.0,
    "Region": "Central",
    "Product ID": "TEC-AC-10002842",
    "Category": "Technology",
    "Sub-Category": "Accessories",
    "Product Name": "WD My Passport Ultra 2TB Portable External Hard Drive",
    "Sales": 666.4,
    "Quantity": 7,
    "Discount": 0.2,
    "Profit": -33.319999999999965
  },
  {
    "﻿Row ID": 1236,
    "Order ID": "CA-2017-144344",
    "Order Date": "2017-10-28",
    "Ship Date": "2017-10-28",
    "Ship Mode": "Same Day",
    "Customer ID": "PG-18820",
    "Customer Name": "Patrick Gardner",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Boynton Beach",
    "State": "Florida",
    "Postal Code": 33437.0,
    "Region": "South",
    "Product ID": "OFF-BI-10003719",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Large Capacity Hanging Post Binders",
    "Sales": 37.425000000000004,
    "Quantity": 5,
    "Discount": 0.7,
    "Profit": -29.940000000000012
  }
]
```

## Styling

- Use a clean, sans-serif font (Inter, Roboto, or system-ui).
- Background color: `#f4f4f4`.
- Card background: `#ffffff` with subtle shadow.
- Text color: `#333333`.
- Ensure charts are responsive (use `viewBox` in SVG and percentage widths in CSS).

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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_157/docs/tableau_render_contract.json`
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
### Worksheet: P121__bar
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p9517_sample_superstore].[none:Category:nk] / [ds_p9517_sample_superstore].[none:Sub-Category:nk])`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=50000, y=1000, w=49200, h=61750
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- cols_field: `[ds_p9517_sample_superstore].[yr:Order Date:ok]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=800, y=62750, w=98400, h=36250
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
