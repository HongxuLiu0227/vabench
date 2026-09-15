# Project Requirements

You are an expert React engineer. Your task is to implement a dashboard application based on the provided Tableau workbook definition and data manifest.

**Context:**
The provided Tableau XML defines a datasource 'Sample - Superstore' and two parameters ('Top Customers', 'Profit Bin Size'). It also defines a calculated field 'Product Name (group)' which maps specific products to Manufacturers (e.g., '3D Systems', '3M', 'Acco'). The XML snippet provided was truncated and did not contain the explicit `<dashboard>` layout definition. Therefore, you must infer a standard, logical dashboard layout that utilizes the specific parameters and calculated fields found in the XML.

**Tech Stack:**
- React 18+
- TypeScript
- Vite
- D3.js (v7): Use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-time-format`, `d3-dsv` for visualizations. Do not use high-level chart libraries.
- CSS: Use standard CSS or CSS Modules. No external UI component libraries (like Ant Design) unless necessary for basic inputs.

**Data Loading:**
1. The primary data source is `/data/Sample - Superstore_Orders.csv`.
2. You must implement a `useData` hook or similar utility to fetch and parse this CSV using `d3-dsv`.
3. The data must be typed. Create a `SuperstoreOrder` interface matching the columns: Row ID, Order ID, Order Date, Ship Date, Ship Mode, Customer ID, Customer Name, Segment, Country, City, State, Postal Code, Region, Product ID, Category, Sub-Category, Product Name, Sales, Quantity, Discount, Profit.
4. Parse dates (Order Date, Ship Date) and numbers (Sales, Profit, Quantity, Discount) correctly.

**State Management (Parameters):**
Implement a global state or context to manage the following parameters defined in the workbook:
1. `topCustomersParam`: Integer. Range: 5 to 20. Step: 5. Default: 5.
2. `profitBinSizeParam`: Integer. Range: 50 to 200. Step: 50. Default: 200.

**Dashboard Layout & Components:**
Create a main `Dashboard` component with the following layout (CSS Grid recommended):

1.  **Header:** Title of the dashboard.
2.  **Controls Area:** Display sliders or inputs for `topCustomersParam` and `profitBinSizeParam`. Changing these should update the relevant charts immediately.
3.  **KPI Cards (Top Row):** Display three cards:
    -   Total Sales (Sum of Sales)
    -   Total Profit (Sum of Profit)
    -   Profit Ratio (Calculated as `SUM(Profit) / SUM(Sales)` formatted as a percentage).
4.  **Main Charts Area (Grid Layout):**
    -   **Sales Over Time (Line Chart):**
        -   X-Axis: Order Date (aggregated by Month or Year).
        -   Y-Axis: Sum of Sales.
        -   Mark: Line.
    -   **Profit Distribution (Histogram):**
        -   Logic: Bin the 'Profit' field using the `profitBinSizeParam` state.
        -   X-Axis: Profit Bins.
        -   Y-Axis: Count of Records or Sum of Profit (Count is standard for histograms, but Sum is often used in Tableau; stick to Count for standard distribution visualization unless specific context implies otherwise, but given the parameter name 'Profit Bin Size', a distribution of profit is implied).
    -   **Top Customers (Bar Chart):**
        -   Logic: Filter to the top N customers based on Sum of Sales, where N is `topCustomersParam`.
        -   X-Axis: Customer Name.
        -   Y-Axis: Sum of Sales.
        -   Sort: Descending by Sales.
    -   **Sales by Manufacturer (Bar Chart):**
        -   Logic: Use the 'Product Name (group)' logic defined in the XML. Map specific 'Product Name' strings to their 'Manufacturer' (e.g., '3D Systems Cube Printer...' -> '3D Systems'). If a product is not in the explicit list, group it as 'Other' or use the raw Product Name.
        -   X-Axis: Manufacturer.
        -   Y-Axis: Sum of Sales.

**Implementation Details:**
-   **Data Processing:** Perform data aggregation (grouping by date, customer, etc.) using `d3-array` (e.g., `d3.rollup`) inside `useMemo` hooks to ensure performance.
-   **Styling:** Keep it clean and professional. Use a sans-serif font. Ensure charts have axes and labels.
-   **Responsiveness:** The grid should stack on smaller screens.

**Sample Data:**
Below is a sample of the data structure expected. Use this to verify your types and parsing logic.

```json
[
  {
    "﻿Row ID": 9296,
    "Order ID": "CA-2018-161340",
    "Order Date": "2018-05-28",
    "Ship Date": "2018-06-01",
    "Ship Mode": "Standard Class",
    "Customer ID": "AM-10360",
    "Customer Name": "Alice McCarthy",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Cleveland",
    "State": "Ohio",
    "Postal Code": 44105.0,
    "Region": "East",
    "Product ID": "FUR-BO-10004709",
    "Category": "Furniture",
    "Sub-Category": "Bookcases",
    "Product Name": "Bush Westfield Collection Bookcases, Medium Cherry Finish",
    "Sales": 115.96,
    "Quantity": 4,
    "Discount": 0.5,
    "Profit": -64.93759999999999
  },
  {
    "﻿Row ID": 4732,
    "Order ID": "US-2016-103996",
    "Order Date": "2016-03-29",
    "Ship Date": "2016-03-31",
    "Ship Mode": "Second Class",
    "Customer ID": "RB-19435",
    "Customer Name": "Richard Bierner",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "San Diego",
    "State": "California",
    "Postal Code": 92105.0,
    "Region": "West",
    "Product ID": "OFF-PA-10001609",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Tops Wirebound Message Log Books",
    "Sales": 9.870000000000001,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 4.5402
  },
  {
    "﻿Row ID": 6840,
    "Order ID": "CA-2018-107517",
    "Order Date": "2018-02-05",
    "Ship Date": "2018-02-09",
    "Ship Mode": "Standard Class",
    "Customer ID": "FC-14335",
    "Customer Name": "Fred Chung",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Torrance",
    "State": "California",
    "Postal Code": 90503.0,
    "Region": "West",
    "Product ID": "TEC-PH-10003505",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Geemarc AmpliPOWER60",
    "Sales": 371.2,
    "Quantity": 5,
    "Discount": 0.2,
    "Profit": 41.75999999999995
  },
  {
    "﻿Row ID": 70,
    "Order ID": "CA-2017-119823",
    "Order Date": "2017-06-04",
    "Ship Date": "2017-06-06",
    "Ship Mode": "First Class",
    "Customer ID": "KD-16270",
    "Customer Name": "Karen Daniels",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Springfield",
    "State": "Virginia",
    "Postal Code": 22153.0,
    "Region": "South",
    "Product ID": "OFF-PA-10000482",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Snap-A-Way Black Print Carbonless Ruled Speed Letter, Triplicate",
    "Sales": 75.88,
    "Quantity": 2,
    "Discount": 0.0,
    "Profit": 35.663599999999995
  },
  {
    "﻿Row ID": 3146,
    "Order ID": "CA-2018-131828",
    "Order Date": "2018-02-11",
    "Ship Date": "2018-02-13",
    "Ship Mode": "Second Class",
    "Customer ID": "CS-11845",
    "Customer Name": "Cari Sayre",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Seattle",
    "State": "Washington",
    "Postal Code": 98105.0,
    "Region": "West",
    "Product ID": "FUR-CH-10004495",
    "Category": "Furniture",
    "Sub-Category": "Chairs",
    "Product Name": "Global Leather and Oak Executive Chair, Black",
    "Sales": 963.1360000000001,
    "Quantity": 4,
    "Discount": 0.2,
    "Profit": 108.35279999999986
  },
  {
    "﻿Row ID": 2810,
    "Order ID": "CA-2016-148635",
    "Order Date": "2016-07-25",
    "Ship Date": "2016-07-27",
    "Ship Mode": "Second Class",
    "Customer ID": "MH-18025",
    "Customer Name": "Michelle Huthwaite",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Seattle",
    "State": "Washington",
    "Postal Code": 98115.0,
    "Region": "West",
    "Product ID": "FUR-CH-10001854",
    "Category": "Furniture",
    "Sub-Category": "Chairs",
    "Product Name": "Office Star - Professional Matrix Back Chair with 2-to-1 Synchro Tilt and Mesh Fabric Seat",
    "Sales": 561.5680000000001,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 28.078400000000016
  },
  {
    "﻿Row ID": 4397,
    "Order ID": "CA-2017-148740",
    "Order Date": "2017-11-15",
    "Ship Date": "2017-11-19",
    "Ship Mode": "Standard Class",
    "Customer ID": "AH-10690",
    "Customer Name": "Anna Häberlin",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "San Diego",
    "State": "California",
    "Postal Code": 92024.0,
    "Region": "West",
    "Product ID": "TEC-PH-10002549",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Polycom SoundPoint IP 450 VoIP phone",
    "Sales": 361.37600000000003,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 27.1032
  },
  {
    "﻿Row ID": 5849,
    "Order ID": "CA-2016-121783",
    "Order Date": "2016-11-10",
    "Ship Date": "2016-11-14",
    "Ship Mode": "Standard Class",
    "Customer ID": "PO-19180",
    "Customer Name": "Philisse Overcash",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "Roseville",
    "State": "Minnesota",
    "Postal Code": 55113.0,
    "Region": "Central",
    "Product ID": "OFF-AP-10003849",
    "Category": "Office Supplies",
    "Sub-Category": "Appliances",
    "Product Name": "Hoover Shoulder Vac Commercial Portable Vacuum",
    "Sales": 715.64,
    "Quantity": 2,
    "Discount": 0.0,
    "Profit": 178.90999999999997
  },
  {
    "﻿Row ID": 5567,
    "Order ID": "CA-2018-157966",
    "Order Date": "2018-03-13",
    "Ship Date": "2018-03-13",
    "Ship Mode": "Same Day",
    "Customer ID": "SU-20665",
    "Customer Name": "Stephanie Ulpright",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "Chicago",
    "State": "Illinois",
    "Postal Code": 60610.0,
    "Region": "Central",
    "Product ID": "OFF-AR-10003338",
    "Category": "Office Supplies",
    "Sub-Category": "Art",
    "Product Name": "Eberhard Faber 3 1/2\" Golf Pencils\"",
    "Sales": 29.760000000000005,
    "Quantity": 5,
    "Discount": 0.2,
    "Profit": 1.8599999999999994
  },
  {
    "﻿Row ID": 9790,
    "Order ID": "CA-2018-144491",
    "Order Date": "2018-03-27",
    "Ship Date": "2018-04-01",
    "Ship Mode": "Standard Class",
    "Customer ID": "CJ-12010",
    "Customer Name": "Caroline Jumper",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Houston",
    "State": "Texas",
    "Postal Code": 77070.0,
    "Region": "Central",
    "Product ID": "TEC-AC-10004901",
    "Category": "Technology",
    "Sub-Category": "Accessories",
    "Product Name": "Kensington SlimBlade Notebook Wireless Mouse with Nano Receiver",
    "Sales": 39.992000000000004,
    "Quantity": 1,
    "Discount": 0.2,
    "Profit": 6.9986
  }
]
```

**Deliverable:**
Provide the complete code for the React application, including `main.tsx`, `App.tsx`, `Dashboard.tsx`, and individual chart components.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/Sample - Superstore_Orders.csv
- /data/Sample - Superstore_People.csv
- /data/Sample - Superstore_Returns.csv

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
const rows = await loadCsv("/data/Sample - Superstore_Orders.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_refine_9517/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Bottom 10 Customers
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[Sample - Superstore].[none:Customer Name:nk]`
- cols_field: `[Sample - Superstore].[sum:Sales:qk]`
- series_field: `[Sample - Superstore].[yr:Order Date:ok]`
- bar_orientation: `horizontal`
- highlight_fields: [Sample - Superstore].[none:Category:nk], [Sample - Superstore].[none:Customer Name:nk], [Sample - Superstore].[none:Profit (bin):ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Customer Sales & Profits
- chart_intent: `custom_tableau_view`
- rows_field: `[Sample - Superstore].[sum:Profit:qk]`
- cols_field: `[Sample - Superstore].[sum:Sales:qk]`
- series_field: `[Sample - Superstore].[sum:Profit:qk]`
- zone: x=50000, y=50000, w=49414, h=48958
- highlight_fields: [Sample - Superstore].[none:Category:nk], [Sample - Superstore].[none:Customer Name:nk], [Sample - Superstore].[none:Product Name:nk], [Sample - Superstore].[none:Sub-Category:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales Map
- chart_intent: `custom_tableau_view`
- rows_field: `[Sample - Superstore].[Latitude (generated)]`
- cols_field: `[Sample - Superstore].[Longitude (generated)]`
- series_field: `[Sample - Superstore].[sum:Sales:qk]`
- highlight_fields: [Sample - Superstore].[none:Category:nk], [Sample - Superstore].[none:City:nk], [Sample - Superstore].[none:Country:nk], [Sample - Superstore].[none:Order Date:qk], [Sample - Superstore].[none:Segment:nk], [Sample - Superstore].[none:State:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales by Sub Category 
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([Sample - Superstore].[none:Sub-Category:nk] / [Sample - Superstore].[none:Calculation_317222333014716416:nk])`
- cols_field: `[Sample - Superstore].[sum:Sales:qk]`
- series_field: `[Sample - Superstore].[yr:Order Date:ok]`
- bar_orientation: `horizontal`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales by city
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[Sample - Superstore].[none:City:nk]`
- cols_field: `[Sample - Superstore].[sum:Sales:qk]`
- series_field: `[Sample - Superstore].[yr:Order Date:ok]`
- bar_orientation: `horizontal`
- zone: x=586, y=1042, w=49414, h=97916
- highlight_fields: [Sample - Superstore].[none:Category:nk], [Sample - Superstore].[none:City:nk], [Sample - Superstore].[none:Sub-Category:nk], [Sample - Superstore].[yr:Order Date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Top 10 Customers
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[Sample - Superstore].[none:Customer Name:nk]`
- cols_field: `[Sample - Superstore].[sum:Sales:qk]`
- series_field: `[Sample - Superstore].[yr:Order Date:ok]`
- bar_orientation: `horizontal`
- highlight_fields: [Sample - Superstore].[none:Category:nk], [Sample - Superstore].[none:Customer Name:nk], [Sample - Superstore].[none:Region:nk], [Sample - Superstore].[none:State:nk], [Sample - Superstore].[none:Sub-Category:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: info
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[Sample - Superstore].[yr:Order Date:ok]`
- highlight_fields: [Sample - Superstore].[none:Calculation_1941051468927434752:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Sales by Sub Category , target=Informative dashboard
- Filter 2 (generated): kind=filter_action, source=Sales by city, target=Informative dashboard
- Filter 3 (generated): kind=filter_action, source=Customer Sales & Profits, target=Informative dashboard
## Highlight Bindings
- Sales Map: [Sample - Superstore].[none:Category:nk], [Sample - Superstore].[none:City:nk], [Sample - Superstore].[none:Country:nk], [Sample - Superstore].[none:Order Date:qk], [Sample - Superstore].[none:Segment:nk], [Sample - Superstore].[none:State:nk]
- Sales by city: [Sample - Superstore].[none:Category:nk], [Sample - Superstore].[none:City:nk], [Sample - Superstore].[none:Sub-Category:nk], [Sample - Superstore].[yr:Order Date:ok]
- Sales by Sub Category : [Sample - Superstore].[none:Calculation_317222333014716416:nk], [Sample - Superstore].[none:Category:nk], [Sample - Superstore].[none:State:nk], [Sample - Superstore].[none:Sub-Category:nk], [Sample - Superstore].[yr:Order Date:ok]
- Top 10 Customers: [Sample - Superstore].[none:Category:nk], [Sample - Superstore].[none:Customer Name:nk], [Sample - Superstore].[none:Region:nk], [Sample - Superstore].[none:State:nk], [Sample - Superstore].[none:Sub-Category:nk]
- Bottom 10 Customers: [Sample - Superstore].[none:Category:nk], [Sample - Superstore].[none:Customer Name:nk], [Sample - Superstore].[none:Profit (bin):ok]
- Customer Sales & Profits: [Sample - Superstore].[none:Category:nk], [Sample - Superstore].[none:Customer Name:nk], [Sample - Superstore].[none:Product Name:nk], [Sample - Superstore].[none:Sub-Category:nk]
- Sales by city: [Sample - Superstore].[none:Category:nk]
- info: [Sample - Superstore].[none:Calculation_1941051468927434752:nk]
