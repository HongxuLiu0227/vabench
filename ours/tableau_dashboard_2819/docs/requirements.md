# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled "Sales Dashboard".

**Tech Stack:**
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-dsv`)
- CSS Grid/Flexbox for layout (No UI component libraries like Ant Design unless necessary for basic inputs).

**Data Loading:**
The primary data source is `Superstore Sales Training_Orders.csv`.
1. Create a utility function `useData` that fetches `/data/Superstore Sales Training_Orders.csv`.
2. Use `d3.csvParse` (or `d3.csv`) to parse the CSV content.
3. Type the data: Define an interface `OrderData` with fields: `Order Date` (string), `Sales` (number), `Profit` (number), `Customer Segment` (string), `Region` (string), `Category` (string), `Country / Region` (string), `State` (string), `City` (string).
4. Ensure numeric fields (`Sales`, `Profit`) are parsed as numbers.

**Sample Data:**
```json
[
  {
    "﻿Row": 15792,
    "Order Priority": "Low",
    "Order Date": "2013-10-18",
    "Order": 86100,
    "Discount": 0.1,
    "Unit Price": 5,
    "Order Quantity": 10,
    "Sales": 45.0,
    "Profit": 12.0,
    "Shipping Cost": 1,
    "Product Base Margin": 0.36,
    "Department": "Office Supplies",
    "Container": "Small Box",
    "Category": "Labels",
    "Item": "Avery 508",
    "Customer Segment": "Home Office",
    "Customer": 2081,
    "Customer Name": "Matthew Conway",
    "Region": "North America",
    "State": "New York",
    "Country / Region": "United States of America",
    "City": "Ithaca",
    "Postal Code": 14853.0,
    "Ship Date": "2013-10-25",
    "Ship Mode": "Regular Air",
    "SubRegion": "East"
  },
  {
    "﻿Row": 1579,
    "Order Priority": "High",
    "Order Date": "2010-06-13",
    "Order": 37348,
    "Discount": 0.08,
    "Unit Price": 17,
    "Order Quantity": 50,
    "Sales": 782.0,
    "Profit": 420.0,
    "Shipping Cost": 5,
    "Product Base Margin": 0.58,
    "Department": "Office Supplies",
    "Container": "Small Box",
    "Category": "Storage & Organization",
    "Item": "Advantus Rolling Storage Box",
    "Customer Segment": "Home Office",
    "Customer": 2140,
    "Customer Name": "Catherine Bland",
    "Region": "AsiaPac",
    "State": "Jakarta",
    "Country / Region": "Indonesia",
    "City": "Jakarta",
    "Postal Code": "",
    "Ship Date": "2010-06-16",
    "Ship Mode": "Regular Air",
    "SubRegion": ""
  },
  {
    "﻿Row": 11916,
    "Order Priority": "Critical",
    "Order Date": "2013-02-11",
    "Order": 90520,
    "Discount": 0.08,
    "Unit Price": 61,
    "Order Quantity": 4,
    "Sales": 224.48,
    "Profit": 75.43999999999998,
    "Shipping Cost": 49,
    "Product Base Margin": 0.59,
    "Department": "Office Supplies",
    "Container": "Large Box",
    "Category": "Appliances",
    "Item": "Euro Pro Shark Stick Mini Vacuum",
    "Customer Segment": "Consumer",
    "Customer": 1368,
    "Customer Name": "Patsy Harmon",
    "Region": "North America",
    "State": "Texas",
    "Country / Region": "United States of America",
    "City": "Lufkin",
    "Postal Code": 75901.0,
    "Ship Date": "2013-02-12",
    "Ship Mode": "Regular Air",
    "SubRegion": "Central"
  },
  {
    "﻿Row": 9549,
    "Order Priority": "High",
    "Order Date": "2012-07-25",
    "Order": 87576,
    "Discount": 0.05,
    "Unit Price": 7,
    "Order Quantity": 5,
    "Sales": 33.25,
    "Profit": -4.95,
    "Shipping Cost": 6,
    "Product Base Margin": 0.08,
    "Department": "Office Supplies",
    "Container": "Small Box",
    "Category": "Binders and Binder Accessories",
    "Item": "Acco Four Pocket Poly Ring Binder with Label Holder, Smoke, 1\"\"",
    "Customer Segment": "Corporate",
    "Customer": 2075,
    "Customer Name": "Ronald Park",
    "Region": "North America",
    "State": "Missouri",
    "Country / Region": "United States of America",
    "City": "Columbia",
    "Postal Code": 65203.0,
    "Ship Date": "2012-07-27",
    "Ship Mode": "Regular Air",
    "SubRegion": "Central"
  },
  {
    "﻿Row": 1003,
    "Order Priority": "Not Specified",
    "Order Date": "2010-04-09",
    "Order": 85928,
    "Discount": 0.09,
    "Unit Price": 35,
    "Order Quantity": 1,
    "Sales": 31.85,
    "Profit": 9.5,
    "Shipping Cost": 8,
    "Product Base Margin": 0.59,
    "Department": "Office Supplies",
    "Container": "Small Box",
    "Category": "Pens & Art Supplies",
    "Item": "Hunt Boston® Vacuum Mount KS Pencil Sharpener",
    "Customer Segment": "Corporate",
    "Customer": 2847,
    "Customer Name": "Vanessa Day",
    "Region": "North America",
    "State": "Tennessee",
    "Country / Region": "United States of America",
    "City": "Collierville",
    "Postal Code": 38017.0,
    "Ship Date": "2010-04-11",
    "Ship Mode": "Regular Air",
    "SubRegion": "South"
  },
  {
    "﻿Row": 12929,
    "Order Priority": "Medium",
    "Order Date": "2013-04-19",
    "Order": 47078,
    "Discount": 0.06,
    "Unit Price": 5,
    "Order Quantity": 18,
    "Sales": 84.60000000000001,
    "Profit": 26.0,
    "Shipping Cost": 1,
    "Product Base Margin": 0.36,
    "Department": "Office Supplies",
    "Container": "Small Box",
    "Category": "Labels",
    "Item": "Avery 493",
    "Customer Segment": "Consumer",
    "Customer": 1848,
    "Customer Name": "Danielle Pearson",
    "Region": "EMEA",
    "State": "Praha",
    "Country / Region": "Czech Republic",
    "City": "Prague",
    "Postal Code": "",
    "Ship Date": "2013-04-19",
    "Ship Mode": "Regular Air",
    "SubRegion": ""
  },
  {
    "﻿Row": 6900,
    "Order Priority": "Medium",
    "Order Date": "2011-11-29",
    "Order": 90440,
    "Discount": 0.02,
    "Unit Price": 38,
    "Order Quantity": 9,
    "Sales": 335.16,
    "Profit": 208.3,
    "Shipping Cost": 14,
    "Product Base Margin": 0.67,
    "Department": "Furniture",
    "Container": "Wrap Bag",
    "Category": "Office Furnishings",
    "Item": "Eldon Delta Triangular Chair Mat, 52\" x 58\"\"",
    "Customer Segment": "Clear\"",
    "Customer": "Consumer",
    "Customer Name": 754,
    "Region": "Helen Lyons",
    "State": "North America",
    "Country / Region": "Arizona",
    "City": "United States of America",
    "Postal Code": "Prescott Valley",
    "Ship Date": 86314.0,
    "Ship Mode": "2011-12-01",
    "SubRegion": "Regular Air",
    "null": "['West                                                                                                                                                                                                                                                           ']"
  },
  {
    "﻿Row": 225,
    "Order Priority": "Medium",
    "Order Date": "2010-01-17",
    "Order": 90099,
    "Discount": 0.06,
    "Unit Price": 23,
    "Order Quantity": 7,
    "Sales": 151.34,
    "Profit": 45.13000000000001,
    "Shipping Cost": 8,
    "Product Base Margin": 0.39,
    "Department": "Office Supplies",
    "Container": "Small Box",
    "Category": "Paper",
    "Item": "Xerox 1991",
    "Customer Segment": "Corporate",
    "Customer": 1873,
    "Customer Name": "Lisa Kim",
    "Region": "North America",
    "State": "Florida",
    "Country / Region": "United States of America",
    "City": "Palm Beach Gardens",
    "Postal Code": 33403.0,
    "Ship Date": "2010-01-17",
    "Ship Mode": "Regular Air",
    "SubRegion": "South"
  },
  {
    "﻿Row": 4656,
    "Order Priority": "Low",
    "Order Date": "2011-05-06",
    "Order": 31392,
    "Discount": 0.1,
    "Unit Price": 79,
    "Order Quantity": 64,
    "Sales": 4550.4,
    "Profit": 3655.8799999999997,
    "Shipping Cost": 35,
    "Product Base Margin": 0.83,
    "Department": "Office Supplies",
    "Container": "Large Box",
    "Category": "Storage & Organization",
    "Item": "Space Solutions™ Industrial Galvanized Steel Shelving.",
    "Customer Segment": "Home Office",
    "Customer": 1373,
    "Customer Name": "Jeanette Yang",
    "Region": "EMEA",
    "State": "Lagos State",
    "Country / Region": "Nigeria",
    "City": "Lagos",
    "Postal Code": "",
    "Ship Date": "2011-05-10",
    "Ship Mode": "Regular Air",
    "SubRegion": ""
  },
  {
    "﻿Row": 13613,
    "Order Priority": "Low",
    "Order Date": "2013-05-30",
    "Order": 13537,
    "Discount": 0.03,
    "Unit Price": 7,
    "Order Quantity": 53,
    "Sales": 359.87,
    "Profit": 135.27,
    "Shipping Cost": 2,
    "Product Base Margin": 0.4,
    "Department": "Office Supplies",
    "Container": "Wrap Bag",
    "Category": "Paper",
    "Item": "It's Hot Message Books with Stickers, 2 3/4\" x 5\"\"\"",
    "Customer Segment": "Home Office",
    "Customer": 2016,
    "Customer Name": "Gail Lin",
    "Region": "EMEA",
    "State": "Île-de-France",
    "Country / Region": "France",
    "City": "Paris",
    "Postal Code": 75012.0,
    "Ship Date": "2013-06-01",
    "Ship Mode": "Regular Air",
    "SubRegion": ""
  }
]
```

**Application State:**
Create a top-level state object to manage:
- `data`: The full array of `OrderData`.
- `selectedRegion`: string | null (Default: null, meaning "All").
- `selectedSegment`: string | null (Default: null, meaning "All"). This is driven by the interaction on the Pie Chart.

**Layout Specification (Dashboard 1):**
Recreate the layout using CSS Grid.
- Container: Fixed size or responsive aspect ratio close to 1000x800.
- Grid Structure: 2 Columns.
  - **Left Column (Main Content):** Width ~82%.
    - **Top Row:** Height ~50%. Split into two cells.
      - Cell 1 (Left): "Sales by Segment" (Pie Chart).
      - Cell 2 (Right): "Plot of Sales" (Scatter Plot).
    - **Bottom Row:** Height ~50%.
      - Cell 3 (Full Width): "Sales by Region" (Bar Chart).
  - **Right Column (Sidebar):** Width ~16%. Contains Filters and Legends.
    - Item 1: Color Legend for "Sales by Segment".
    - Item 2: Filter Control for "Region".
    - Item 3: Color Legend for "Sales by Region".

**Component Specifications:**

1.  **SalesBySegment (Pie Chart)**
    - **Data:** Group data by `Customer Segment`. Calculate Sum of `Sales` for each segment.
    - **Visuals:**
      - Use `d3.pie()` and `d3.arc()`.
      - **Colors:** Map specific segments to these exact hex codes from the workbook:
        - "Consumer": `#1f77b4`
        - "Home Office": `#2ca02c`
        - "Small Business": `#d62728`
        - "Corporate": `#ff7f0e`
      - **Labels:** Display `Customer Segment` name on the slices.
    - **Interaction:**
      - **Clicking a slice** triggers the "Action Filter". It should update the global `selectedSegment` state to the clicked segment. Clicking again or the background should reset it to null.
      - Apply the global `selectedRegion` filter to the data before aggregating.

2.  **PlotOfSales (Scatter Plot)**
    - **Data:** Group data by `Category` and `Customer Segment`. Calculate Sum of `Sales` (X-axis) and Sum of `Profit` (Y-axis).
    - **Visuals:**
      - **X-Axis:** `SUM(Sales)` (Linear scale).
      - **Y-Axis:** `SUM(Profit)` (Linear scale).
      - **Marks:** Circles.
      - **Color:** Encoded by `Customer Segment` (Use the same color palette as the Pie Chart).
      - **Size:** Fixed size (approx 1.2 relative scale in Tableau, map to a reasonable pixel radius like 6-8px).
    - **Interaction:**
      - Filter data based on global `selectedSegment` and `selectedRegion`.
      - Tooltip: Show `Category`, `Customer Segment`, `Sales`, and `Profit` on hover.

3.  **SalesByRegion (Bar Chart)**
    - **Data:** Group data by `Country / Region`. Calculate Sum of `Sales` (Bar length) and Sum of `Profit` (Color).
    - **Visuals:**
      - **X-Axis:** `SUM(Sales)` (Linear scale, horizontal bars).
      - **Y-Axis:** `Country / Region` (Band scale). Sort Descending by Sales.
      - **Color:** Encoded by `SUM(Profit)`. Use a sequential or diverging color scale (e.g., `d3.interpolateRdYlGn` or similar) to represent profit magnitude.
    - **Interaction:**
      - Filter data based on global `selectedSegment` and `selectedRegion`.
      - Tooltip: Show `Country / Region`, `Sales`, and `Profit`.

4.  **Sidebar Components**
    - **Region Filter:** A list of unique `Region` values (e.g., "West", "East", "Central", "South"). Allow multi-select or single-select to update `selectedRegion`.
    - **Legends:** Simple color swatches matching the encodings used in the charts.

**Implementation Details:**
- Use `React.memo` for chart components to prevent unnecessary re-renders.
- Use `useEffect` or `useMemo` to process data (grouping and aggregating) whenever the raw data or filter state changes.
- Ensure the dashboard title "Sales Dashboard" is displayed at the top.
- Handle loading states (show a spinner or text while fetching data).
- Handle empty states (if filters result in no data).

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/Superstore Sales Training_Orders.csv
- /data/Superstore Sales Training_Returns.csv
- /data/Superstore Sales Training_Users.csv

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
const rows = await loadCsv("/data/Superstore Sales Training_Orders.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_2819/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Plot of Sales
- chart_intent: `custom_tableau_view`
- rows_field: `[excel.41612.552811354166].[sum:Profit:qk]`
- cols_field: `[excel.41612.552811354166].[sum:Sales:qk]`
- series_field: `[excel.41612.552811354166].[none:Customer Segment:nk]`
- zone: x=33300, y=6000, w=49600, h=46500
- highlight_fields: [excel.41359.464717638890].[none:Category:nk], [excel.41612.552811354166].[none:Customer Segment:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales by Region
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[excel.41612.552811354166].[none:Country / Region:nk]`
- cols_field: `[excel.41612.552811354166].[sum:Sales:qk]`
- series_field: `[excel.41612.552811354166].[sum:Profit:qk]`
- bar_orientation: `horizontal`
- zone: x=800, y=52500, w=82100, h=46500
- legend_required: true
- legend_field: `[excel.41612.552811354166].[sum:Profit:qk]`
- legend_relative_position: above
- highlight_fields: [excel.41359.464717638890].[none:Continent:nk], [excel.41359.464717638890].[none:Country / Region:nk], [excel.41612.552811354166].[none:Country / Region:nk], [excel.41612.552811354166].[none:Region:nk], [excel.41612.552811354166].[none:SubRegion:nk], [excel.41612.552811354166].[sum:Profit:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored above the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales by Segment
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[excel.41612.552811354166].[none:Customer Segment:nk]`
- zone: x=800, y=6000, w=32500, h=46500
- legend_required: true
- legend_field: `[excel.41612.552811354166].[none:Customer Segment:nk]`
- legend_relative_position: right
- highlight_fields: [excel.41612.552811354166].[none:Customer Segment:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Sales by Segment, target=Dashboard 1
## Highlight Bindings
- Sales by Segment: [excel.41612.552811354166].[none:Customer Segment:nk]
- Sales by Region: [excel.41359.464717638890].[none:Continent:nk], [excel.41359.464717638890].[none:Country / Region:nk], [excel.41612.552811354166].[none:Country / Region:nk], [excel.41612.552811354166].[none:Region:nk], [excel.41612.552811354166].[none:SubRegion:nk], [excel.41612.552811354166].[sum:Profit:qk]
- Plot of Sales: [excel.41359.464717638890].[none:Category:nk], [excel.41612.552811354166].[none:Customer Segment:nk]
