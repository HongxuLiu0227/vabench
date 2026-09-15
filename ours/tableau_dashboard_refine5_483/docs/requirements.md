# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard.

**Tech Stack:**
- React 18+
- TypeScript
- Vite
- D3.js (v7 or higher) for visualizations (use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`)
- CSS Grid/Flexbox for layout (no UI component libraries like AntD)

**Data Source:**
- Primary File: `p9517_Sample_-_Superstore_Orders.csv`
- URL: `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`

**Data Loading:**
1. Create a utility function `useData` that fetches the CSV using the native `fetch` API.
2. Parse the CSV text using `d3-dsv` (e.g., `d3.csvParse`).
3. Type the raw data rows. The columns are: `Row ID`, `Order ID`, `Order Date`, `Ship Date`, `Ship Mode`, `Customer ID`, `Customer Name`, `Segment`, `Country`, `City`, `State`, `Postal Code`, `Region`, `Product ID`, `Category`, `Sub-Category`, `Product Name`, `Sales`, `Quantity`, `Discount`, `Profit`.
4. Convert date strings (`Order Date`, `Ship Date`) into JavaScript `Date` objects.
5. Convert numeric strings (`Sales`, `Profit`, `Discount`, `Quantity`) into numbers.

**Data Transformation (Calculated Fields):**
Based on the Tableau workbook definition, you must implement the following logic:

1.  **Profit Ratio**:
    - Formula: `SUM([Profit]) / SUM([Sales])`
    - Implementation: Create a function that takes an array of data and returns the ratio. Use `d3.sum`.

2.  **Top 10 Product**:
    - Logic: The workbook implies a set logic for top products. Implement a calculation that identifies the top 10 products by `Sales`.
    - Implementation: Group data by `Product Name`, sum `Sales`, sort descending, take top 10.

3.  **Product Name (group) / Manufacturer**:
    - Logic: The workbook contains a grouping of `Product Name` into Manufacturers (e.g., "3D Systems", "3M", "Acco", "Avery", "Canon", etc.).
    - Implementation: Create a helper function `getManufacturer(productName: string): string` that maps specific product names to their manufacturer based on the bin definitions found in the workbook (e.g., if name contains "3D Systems", return "3D Systems"). If no match is found, return "Other" or the original name.

**Dashboard Layout:**
- Use a CSS Grid container.
- **Header**: Title "Informative Dashboard".
- **Row 1 (KPIs)**: Three cards displaying Total Sales, Total Profit, and Overall Profit Ratio.
- **Row 2 (Main Charts)**:
    - Left (60% width): Bar chart showing Sales by Category.
    - Right (40% width): Bar chart showing the Top 10 Products by Sales (using the Top 10 logic).
- **Row 3 (Secondary Charts)**:
    - Left: Bar chart showing Profit Ratio by Segment.
    - Right: Bar chart showing Sales by Manufacturer (using the Product Name group logic).

**Component Specifications:**

1.  **KPICard**:
    - Props: `title` (string), `value` (number | string), `format` (optional, e.g., currency or percentage).
    - Style: Simple card with a bold value and a lighter label.

2.  **BarChart** (Generic D3 Component):
    - Props: `data` (array), `x` (accessor), `y` (accessor), `width`, `height`, `color` (optional).
    - Implementation:
        - Use `d3.scaleBand` for the x-axis (dimensions).
        - Use `d3.scaleLinear` for the y-axis (measures).
        - Use `d3.axisBottom` and `d3.axisLeft`.
        - Render SVG `rect` elements for bars.
        - Add tooltips on hover showing the exact value.

**Visual Encodings:**
- **Colors**: Use a standard palette (e.g., Tableau 10 equivalent: `#4E79A7`, `#F28E2B`, `#E15759`, `#76B7B2`, `#59A14F`, `#EDC948`, `#B07AA1`, `#FF9DA7`, `#9C755F`, `#BAB0AC`).
- **Fonts**: Sans-serif (system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial).

**Interactions:**
- Implement a global filter state (e.g., `selectedRegion`).
- When a Region is selected (via a dropdown or filter component), filter the dataset and update all charts.

**Sample Data:**
Here is a sample of the data structure to expect:

```json
[
  {
    "﻿Row ID": 6703,
    "Order ID": "CA-2016-153535",
    "Order Date": "2016-05-20",
    "Ship Date": "2016-05-24",
    "Ship Mode": "Standard Class",
    "Customer ID": "SG-20470",
    "Customer Name": "Sheri Gordon",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Wilson",
    "State": "North Carolina",
    "Postal Code": 27893.0,
    "Region": "South",
    "Product ID": "OFF-BI-10001031",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Pressboard Data Binders by Wilson Jones",
    "Sales": 6.408,
    "Quantity": 4,
    "Discount": 0.7,
    "Profit": -4.912799999999999
  },
  {
    "﻿Row ID": 3235,
    "Order ID": "CA-2017-138933",
    "Order Date": "2017-04-24",
    "Ship Date": "2017-04-27",
    "Ship Mode": "First Class",
    "Customer ID": "JL-15130",
    "Customer Name": "Jack Lebron",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Riverside",
    "State": "California",
    "Postal Code": 92503.0,
    "Region": "West",
    "Product ID": "OFF-BI-10003355",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Cardinal Holdit Business Card Pockets",
    "Sales": 3.9840000000000004,
    "Quantity": 1,
    "Discount": 0.2,
    "Profit": 1.3944
  },
  {
    "﻿Row ID": 2122,
    "Order ID": "CA-2018-158246",
    "Order Date": "2018-11-09",
    "Ship Date": "2018-11-11",
    "Ship Mode": "First Class",
    "Customer ID": "JB-15400",
    "Customer Name": "Jennifer Braxton",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Sunnyvale",
    "State": "California",
    "Postal Code": 94086.0,
    "Region": "West",
    "Product ID": "FUR-CH-10003061",
    "Category": "Furniture",
    "Sub-Category": "Chairs",
    "Product Name": "Global Leather Task Chair, Black",
    "Sales": 215.976,
    "Quantity": 3,
    "Discount": 0.2,
    "Profit": -2.6997000000000355
  },
  {
    "﻿Row ID": 9580,
    "Order ID": "CA-2018-152975",
    "Order Date": "2018-09-14",
    "Ship Date": "2018-09-16",
    "Ship Mode": "First Class",
    "Customer ID": "RB-19705",
    "Customer Name": "Roger Barcio",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10035.0,
    "Region": "East",
    "Product ID": "OFF-ST-10001370",
    "Category": "Office Supplies",
    "Sub-Category": "Storage",
    "Product Name": "Sensible Storage WireTech Storage Systems",
    "Sales": 70.98,
    "Quantity": 1,
    "Discount": 0.0,
    "Profit": 3.5489999999999924
  },
  {
    "﻿Row ID": 5099,
    "Order ID": "US-2015-140452",
    "Order Date": "2015-12-06",
    "Ship Date": "2015-12-10",
    "Ship Mode": "Standard Class",
    "Customer ID": "BK-11260",
    "Customer Name": "Berenike Kampe",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Chicago",
    "State": "Illinois",
    "Postal Code": 60610.0,
    "Region": "Central",
    "Product ID": "OFF-ST-10002485",
    "Category": "Office Supplies",
    "Sub-Category": "Storage",
    "Product Name": "Rogers Deluxe File Chest",
    "Sales": 35.168,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": -8.352400000000001
  },
  {
    "﻿Row ID": 9278,
    "Order ID": "CA-2018-122539",
    "Order Date": "2018-12-01",
    "Ship Date": "2018-12-05",
    "Ship Mode": "Standard Class",
    "Customer ID": "SC-20305",
    "Customer Name": "Sean Christensen",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Philadelphia",
    "State": "Pennsylvania",
    "Postal Code": 19140.0,
    "Region": "East",
    "Product ID": "OFF-LA-10004853",
    "Category": "Office Supplies",
    "Sub-Category": "Labels",
    "Product Name": "Avery 483",
    "Sales": 15.936000000000002,
    "Quantity": 4,
    "Discount": 0.2,
    "Profit": 5.1792
  },
  {
    "﻿Row ID": 3734,
    "Order ID": "CA-2016-109575",
    "Order Date": "2016-09-18",
    "Ship Date": "2016-09-23",
    "Ship Mode": "Standard Class",
    "Customer ID": "KH-16630",
    "Customer Name": "Ken Heidel",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Clinton",
    "State": "Maryland",
    "Postal Code": 20735.0,
    "Region": "East",
    "Product ID": "OFF-BI-10000962",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Acco Flexible ACCOHIDE Square Ring Data Binder, Dark Blue, 11 1/2\" X 14\"\" 7/8\"\"\"",
    "Sales": 65.08,
    "Quantity": 4,
    "Discount": 0.0,
    "Profit": 31.889199999999995
  },
  {
    "﻿Row ID": 9841,
    "Order ID": "US-2017-125402",
    "Order Date": "2017-09-25",
    "Ship Date": "2017-10-01",
    "Ship Mode": "Standard Class",
    "Customer ID": "DL-12865",
    "Customer Name": "Dan Lawera",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Long Beach",
    "State": "California",
    "Postal Code": 90805.0,
    "Region": "West",
    "Product ID": "TEC-PH-10003356",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "SmartStand Mobile Device Holder, Assorted Colors",
    "Sales": 44.736000000000004,
    "Quantity": 8,
    "Discount": 0.2,
    "Profit": 4.473600000000001
  },
  {
    "﻿Row ID": 6758,
    "Order ID": "CA-2018-124205",
    "Order Date": "2018-09-15",
    "Ship Date": "2018-09-19",
    "Ship Mode": "Standard Class",
    "Customer ID": "TC-21145",
    "Customer Name": "Theresa Coyne",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Lakewood",
    "State": "New Jersey",
    "Postal Code": 8701.0,
    "Region": "East",
    "Product ID": "TEC-PH-10002115",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Plantronics 81402",
    "Sales": 395.93999999999994,
    "Quantity": 6,
    "Discount": 0.0,
    "Profit": 102.94440000000002
  },
  {
    "﻿Row ID": 9439,
    "Order ID": "CA-2018-126144",
    "Order Date": "2018-07-31",
    "Ship Date": "2018-08-05",
    "Ship Mode": "Standard Class",
    "Customer ID": "GM-14680",
    "Customer Name": "Greg Matthias",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Philadelphia",
    "State": "Pennsylvania",
    "Postal Code": 19134.0,
    "Region": "East",
    "Product ID": "TEC-PH-10001079",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Polycom SoundPoint Pro SE-225 Corded phone",
    "Sales": 285.57599999999996,
    "Quantity": 4,
    "Discount": 0.4,
    "Profit": -57.115200000000016
  }
]
```

**Implementation Steps:**
1.  Setup Vite + React + TS.
2.  Install dependencies: `d3`, `d3-dsv`, `@types/d3`.
3.  Create `types.ts` for the Superstore data interface.
4.  Create `utils.ts` for data fetching and parsing.
5.  Create `hooks/useSuperstoreData.ts` to manage data state.
6.  Create `components/KPICard.tsx`.
7.  Create `components/BarChart.tsx`.
8.  Create `App.tsx` to orchestrate layout and data flow.
9.  Apply CSS for the grid layout.

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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_483/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p9517_sample_superstore].[none:Sub-Category:nk] / [ds_p9517_sample_superstore].[none:Calculation_317222333014716416:nk])`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=800, y=1000, w=49200, h=61748
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- cols_field: `[ds_p9517_sample_superstore].[yr:Order Date:ok]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=50000, y=1000, w=49200, h=61750
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__line
- chart_intent: `line_chart`
- rows_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- cols_field: `[ds_p9517_sample_superstore].[tmn:Order Date:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=800, y=62750, w=98400, h=36250
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
