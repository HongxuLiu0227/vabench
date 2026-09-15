# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled "Synthetic Dashboard 225".

## Tech Stack
- React 18+ with TypeScript.
- Vite for build tooling.
- D3.js (v7+) for visualizations (use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-time`, `d3-dsv`).
- CSS Grid for the main dashboard layout.
- No external UI component libraries (e.g., Ant Design) unless necessary for basic inputs (none needed here).

## Data Loading

The application must load data from the following URL:
`/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv`

Implement a `useData` hook or similar utility to fetch and parse the CSV.

```typescript
import { csv } from 'd3-fetch';
import { timeParse } from 'd3-time-format';

// Define the TypeScript interface for the raw data
interface SuperstoreRow {
  "Category": string;
  "City": string;
  "Country": string;
  "Customer Name": string;
  "Manufacturer": string;
  "Order Date": string; // YYYY-MM-DD format in CSV
  "Order ID": string;
  "Postal Code": string;
  "Product Name": string;
  "Region": string;
  "Segment": string;
  "Ship Date": string;
  "Ship Mode": string;
  "State": string;
  "Sub-Category": string;
  "Discount": number;
  "Number of Records": number;
  "Profit": number;
  "Profit Ratio": number;
  "Quantity": number;
  "Sales": number;
}

export const useData = (csvUrl: string) => {
  const [data, setData] = React.useState<SuperstoreRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const parseDate = timeParse('%Y-%m-%d');
    
    csv(csvUrl, (d) => {
      const row = d as any;
      return {
        ...row,
        "Order Date": parseDate(row['Order Date']),
        "Ship Date": parseDate(row['Ship Date']),
        "Sales": +row['Sales'],
        "Profit": +row['Profit'],
        "Quantity": +row['Quantity'],
        "Discount": +row['Discount'],
      };
    }).then((data) => {
      setData(data);
      setLoading(false);
    }).catch((err) => {
      setError(err);
      setLoading(false);
    });
  }, [csvUrl]);

  return { data, loading, error };
};
```

## Data Processing & Aggregation

The raw CSV is transactional. The charts require aggregated data. Use `d3.rollup` to prepare data for each chart before rendering.

1.  **Line Chart (P121__line):** Group by `Order Date` (Month). Sum `Sales`.
2.  **Scatterplot (P121__scatterplot):** Group by `Product Name`. Sum `Sales`, `Profit`, and `Quantity`.
3.  **Yearly Sales (P1225__total_sales_each_year):** Group by `Order Date` (Year). Sum `Sales`.
4.  **Sales by Sub-Category (P9517__sales_by_sub_category):** Group by `Sub-Category`. Sum `Sales`.

## Layout Specification

The dashboard uses a 2x2 Grid layout.

- **Container:** Fixed size or responsive aspect ratio approximating 1000x800.
- **Grid Template:** 2 columns, 2 rows.
- **Gap:** 8px (outer), 4px (inner).
- **Zone Mapping:**
    - **Top Left:** `P121__scatterplot` (Scatterplot)
    - **Top Right:** `P121__line` (Line)
    - **Bottom Left:** `P9517__sales_by_sub_category` (Bar Chart)
    - **Bottom Right:** `P1225__total_sales_each_year` (Bar Chart)

## Component Specifications

### 1. Scatterplot Component (`P121__scatterplot`)
- **Title:** "Scatterplot"
- **Mark Type:** Circle
- **Encodings:**
    - **X-Axis:** `Sales` (Sum, Linear Scale)
    - **Y-Axis:** `Profit` (Sum, Linear Scale)
    - **Size:** `Quantity` (Sum, Sqrt Scale)
    - **Color:** `Sales` (Sum, Sequential/Diverging Scale - use `d3.interpolateBlues` or similar)
    - **Detail:** `Product Name` (Each circle represents a product)
- **Style:** Stroke color `#000000`, Opacity ~0.7.

### 2. Line Chart Component (`P121__line`)
- **Title:** "Line"
- **Mark Type:** Line (Area optional, but Line is specified)
- **Encodings:**
    - **X-Axis:** `Order Date` (Month-Trunc, Time Scale)
    - **Y-Axis:** `Sales` (Sum, Linear Scale)
    - **Color:** `Sales` (Sum, Diverging Scale - use `d3.interpolateRdYlGn` or similar)

### 3. Yearly Sales Bar Chart (`P1225__total_sales_each_year`)
- **Title:** "Total Sales Each Year"
- **Mark Type:** Bar
- **Encodings:**
    - **X-Axis:** `Order Date` (Year, Band Scale)
    - **Y-Axis:** `Sales` (Sum, Linear Scale)
    - **Color:** `Sales` (Sum)
    - **Labels:** Show data labels on top of bars.

### 4. Sales by Sub-Category Bar Chart (`P9517__sales_by_sub_category`)
- **Title:** "Sales by Sub Category"
- **Mark Type:** Bar (Horizontal)
- **Encodings:**
    - **Y-Axis:** `Sub-Category` (Band Scale)
    - **X-Axis:** `Sales` (Sum, Linear Scale)
    - **Color:** Automatic (Single color or distinct per category)

## Sample Data

```json
[
  {
    "﻿Category": "Office Supplies",
    "City": "New York City",
    "Country": "United States",
    "Customer Name": "Dave Hallsten",
    "Manufacturer": "Tennsco",
    "Order Date": "2012-03-20",
    "Order ID": "CA-2012-159534",
    "Postal Code": 10035,
    "Product Name": "Tennsco Lockers, Sand",
    "Region": "East",
    "Segment": "Corporate",
    "Ship Date": "2012-03-23",
    "Ship Mode": "First Class",
    "State": "New York",
    "Sub-Category": "Storage",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 20,
    "Profit Ratio": 0.24,
    "Quantity": 4,
    "Sales": 84
  },
  {
    "﻿Category": "Office Supplies",
    "City": "New York City",
    "Country": "United States",
    "Customer Name": "Cindy Chapman",
    "Manufacturer": "Other",
    "Order Date": "2013-05-03",
    "Order ID": "CA-2013-146836",
    "Postal Code": 10024,
    "Product Name": "Super Decoflex Portable Personal File",
    "Region": "East",
    "Segment": "Consumer",
    "Ship Date": "2013-05-03",
    "Ship Mode": "Same Day",
    "State": "New York",
    "Sub-Category": "Storage",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 13,
    "Profit Ratio": 0.28,
    "Quantity": 3,
    "Sales": 45
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Pensacola",
    "Country": "United States",
    "Customer Name": "Pierre Wener",
    "Manufacturer": "Avery",
    "Order Date": "2013-07-30",
    "Order ID": "US-2013-131891",
    "Postal Code": 32503,
    "Product Name": "Avery Triangle Shaped Sheet Lifters, Black, 2/Pack",
    "Region": "South",
    "Segment": "Consumer",
    "Ship Date": "2013-08-01",
    "Ship Mode": "First Class",
    "State": "Florida",
    "Sub-Category": "Binders",
    "Discount": 0.7,
    "Number of Records": 1,
    "Profit": -1,
    "Profit Ratio": -0.67,
    "Quantity": 3,
    "Sales": 2
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Tempe",
    "Country": "United States",
    "Customer Name": "Eric Hoffmann",
    "Manufacturer": "ACCOHIDE",
    "Order Date": "2012-07-10",
    "Order ID": "CA-2012-149384",
    "Postal Code": 85281,
    "Product Name": "Accohide Poly Flexible Ring Binders",
    "Region": "West",
    "Segment": "Consumer",
    "Ship Date": "2012-07-10",
    "Ship Mode": "Same Day",
    "State": "Arizona",
    "Sub-Category": "Binders",
    "Discount": 0.7,
    "Number of Records": 1,
    "Profit": -2,
    "Profit Ratio": -0.67,
    "Quantity": 3,
    "Sales": 3
  },
  {
    "﻿Category": "Furniture",
    "City": "Concord",
    "Country": "United States",
    "Customer Name": "Nathan Mautz",
    "Manufacturer": "Bevis",
    "Order Date": "2011-04-08",
    "Order ID": "CA-2011-150581",
    "Postal Code": 94521,
    "Product Name": "Bevis 36 x 72 Conference Tables",
    "Region": "West",
    "Segment": "Home Office",
    "Ship Date": "2011-04-12",
    "Ship Mode": "Standard Class",
    "State": "California",
    "Sub-Category": "Tables",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 2,
    "Profit Ratio": 0.03,
    "Quantity": 1,
    "Sales": 100
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Providence",
    "Country": "United States",
    "Customer Name": "Thea Hudgings",
    "Manufacturer": "Xerox",
    "Order Date": "2013-07-09",
    "Order ID": "CA-2013-152520",
    "Postal Code": 2908,
    "Product Name": "Xerox 213",
    "Region": "East",
    "Segment": "Corporate",
    "Ship Date": "2013-07-13",
    "Ship Mode": "Standard Class",
    "State": "Rhode Island",
    "Sub-Category": "Paper",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 6,
    "Profit Ratio": 0.48,
    "Quantity": 2,
    "Sales": 13
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Springfield",
    "Country": "United States",
    "Customer Name": "Adam Shillingsburg",
    "Manufacturer": "Other",
    "Order Date": "2014-04-02",
    "Order ID": "CA-2014-145877",
    "Postal Code": 65807,
    "Product Name": "Hanging Personal Folder File",
    "Region": "Central",
    "Segment": "Consumer",
    "Ship Date": "2014-04-05",
    "Ship Mode": "Second Class",
    "State": "Missouri",
    "Sub-Category": "Storage",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 24,
    "Profit Ratio": 0.25,
    "Quantity": 6,
    "Sales": 94
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Memphis",
    "Country": "United States",
    "Customer Name": "Maribeth Yedwab",
    "Manufacturer": "Other",
    "Order Date": "2014-11-25",
    "Order ID": "US-2014-128118",
    "Postal Code": 38109,
    "Product Name": "Mead 1st Gear 2\" Zipper Binder, Asst. Colors",
    "Region": "South",
    "Segment": "Corporate",
    "Ship Date": "2014-12-02",
    "Ship Mode": "Standard Class",
    "State": "Tennessee",
    "Sub-Category": "Binders",
    "Discount": 0.7,
    "Number of Records": 1,
    "Profit": -8,
    "Profit Ratio": -0.67,
    "Quantity": 3,
    "Sales": 12
  },
  {
    "﻿Category": "Furniture",
    "City": "Huntsville",
    "Country": "United States",
    "Customer Name": "Victoria Wilson",
    "Manufacturer": "Hon",
    "Order Date": "2011-05-11",
    "Order ID": "CA-2011-152100",
    "Postal Code": 77340,
    "Product Name": "Hon Multipurpose Stacking Arm Chairs",
    "Region": "Central",
    "Segment": "Corporate",
    "Ship Date": "2011-05-16",
    "Ship Mode": "Standard Class",
    "State": "Texas",
    "Sub-Category": "Chairs",
    "Discount": 0.3,
    "Number of Records": 1,
    "Profit": -69,
    "Profit Ratio": -0.06,
    "Quantity": 8,
    "Sales": 1213
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Santa Ana",
    "Country": "United States",
    "Customer Name": "Eileen Kiefer",
    "Manufacturer": "Boston",
    "Order Date": "2012-11-29",
    "Order ID": "CA-2012-154340",
    "Postal Code": 92704,
    "Product Name": "Boston Electric Pencil Sharpener, Model 1818, Charcoal Black",
    "Region": "West",
    "Segment": "Home Office",
    "Ship Date": "2012-11-30",
    "Ship Mode": "First Class",
    "State": "California",
    "Sub-Category": "Art",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 16,
    "Profit Ratio": 0.28,
    "Quantity": 2,
    "Sales": 56
  }
]
```

## Implementation Notes
- Ensure all charts handle empty states or loading states gracefully.
- Use CSS Modules or Styled Components to isolate styles.
- The D3 charts should be wrapped in React components that utilize `useRef` for the SVG container and `useEffect` to render/update the visualization when data changes.
- Do not implement interactivity (filters/parameters) beyond basic tooltips, as none are defined in the workbook actions.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv

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
const rows = await loadCsv("/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_225/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P121__line
- chart_intent: `line_chart`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[tmn:Order Date:qk]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=50000, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Profit:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=800, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[yr:Order Date:ok]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=50000, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Sub-Category:nk] / [ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Product Name:nk])`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=800, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
