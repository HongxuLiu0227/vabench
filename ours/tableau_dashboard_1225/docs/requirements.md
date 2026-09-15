# Project Requirements

You are an expert React and D3.js developer. Your task is to implement a dashboard application that replicates the functionality and design of a specific Tableau workbook.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (use primitives like `d3-scale`, `d3-axis`, `d3-shape`, `d3-array`). Do not use high-level chart libraries like Recharts or Nivo.
- CSS for styling (CSS Modules or standard CSS).

## Data Loading

The application must load data from the following URL:
`/data/TEMP_0zzmslq10iuq6s16eyxoz0l4yeax.csv`

1.  Create a `useData` hook or a utility function to fetch the CSV.
2.  Use `d3-dsv` (specifically `d3.csvParse`) to parse the raw CSV text.
3.  Transform the data:
    - Parse `Order Date` strings into JavaScript `Date` objects.
    - Ensure `Sales`, `Profit`, `Quantity`, and `Discount` are parsed as numbers.
    - Extract the `Year` from `Order Date` for filtering and grouping.

## Data Structure

The CSV contains the following relevant columns:
- `Order Date` (Date)
- `Sales` (Number)
- `Profit` (Number)
- `Category` (String)
- `Sub-Category` (String)

## Application State

You must manage a global state for the dashboard:
- `selectedYear`: `number | null` (Defaults to `null`).

## Layout & Components

The main dashboard is named "Sales and Profits". It uses a 2x2 Grid layout.

### 1. Dashboard Container (`Dashboard.tsx`)
- Use CSS Grid with 2 columns and 2 rows.
- Grid Areas:
  - Top-Left: `SalesBySubCategory`
  - Top-Right: `ProfitByYear`
  - Bottom-Left: `ProfitBySubCategory`
  - Bottom-Right: `SalesByYear`
- Pass `data` and `selectedYear` to all child components.
- Pass a `setSelectedYear` callback specifically to `SalesByYear`.

### 2. Chart: Total Sales Each Year (`SalesByYear.tsx`)
- **Type:** Vertical Bar Chart.
- **Position:** Bottom-Right.
- **Data:** Group data by `YEAR(Order Date)`. Sum `Sales`.
- **Visual Encodings:**
  - X-Axis: Year (Ordinal/Time).
  - Y-Axis: Sum of Sales (Linear).
  - Color: Encoded by Sales (Use a Brown palette, e.g., `d3.interpolateYlOrBr` or a custom brown scale).
  - Marks: Bars.
- **Interactions:**
  - **Click Action:** Clicking a bar sets the `selectedYear` state to that bar's year. Clicking the same bar again should deselect it (set to `null`).
  - **Highlight:** Visually highlight the selected bar.
- **Labels:** Show data labels on bars.

### 3. Chart: Total Profits Each Year (`ProfitByYear.tsx`)
- **Type:** Vertical Bar Chart.
- **Position:** Top-Right.
- **Data:** Group data by `YEAR(Order Date)`. Sum `Profit`.
- **Visual Encodings:**
  - X-Axis: Year.
  - Y-Axis: Sum of Profit (Linear).
  - Color: Encoded by Profit (Use an Orange/Gold palette, e.g., `d3.interpolateOranges`).
  - Marks: Bars.
- **Interactions:**
  - **Filter:** If `selectedYear` is not null, filter data to show only that year. If null, show all years.
- **Labels:** Show data labels on bars.

### 4. Chart: Total Sales by Sub-Categories (`SalesBySubCategory.tsx`)
- **Type:** Horizontal Bar Chart.
- **Position:** Top-Left.
- **Data:** Group by `Sub-Category`. Sum `Sales`.
- **Sorting:** The bars must be sorted manually in this specific order:
  `['Phones', 'Chairs', 'Storage', 'Tables', 'Binders', 'Machines', 'Accessories', 'Copiers', 'Bookcases', 'Appliances', 'Furnishings', 'Paper', 'Supplies', 'Art', 'Envelopes', 'Labels', 'Fasteners']`
- **Visual Encodings:**
  - Y-Axis: Sub-Category (Band scale with the specific order above).
  - X-Axis: Sum of Sales.
  - Color: Encoded by Sales (Brown palette).
  - Marks: Bars.
- **Interactions:**
  - **Filter:** If `selectedYear` is not null, filter data to show only that year.
- **Labels:** Show data labels on bars.

### 5. Chart: Total Profits by Sub-Categories (`ProfitBySubCategory.tsx`)
- **Type:** Horizontal Bar Chart.
- **Position:** Bottom-Left.
- **Data:** Group by `Sub-Category`. Sum `Profit`.
- **Sorting:** The bars must be sorted manually in this specific order:
  `['Copiers', 'Phones', 'Accessories', 'Paper', 'Binders', 'Chairs', 'Storage', 'Appliances', 'Furnishings', 'Envelopes', 'Art', 'Labels', 'Machines', 'Fasteners', 'Supplies', 'Bookcases', 'Tables']`
- **Visual Encodings:**
  - Y-Axis: Sub-Category (Band scale with the specific order above).
  - X-Axis: Sum of Profit.
  - Color: Encoded by Profit (Orange/Gold palette).
  - Marks: Bars.
- **Interactions:**
  - **Filter:** If `selectedYear` is not null, filter data to show only that year.
- **Labels:** Show data labels on bars.

## Implementation Details

- **D3 Scales:** Use `scaleBand` for categorical axes and `scaleLinear` for quantitative axes. Use `scaleSequential` or `scaleLinear` with interpolators for color encoding.
- **Responsiveness:** Charts should resize to fit their grid container. Use `ResizeObserver` or the `useRef` + `useEffect` pattern to handle container resizing.
- **Margins:** Define standard margins for axes (e.g., `{ top: 20, right: 20, bottom: 40, left: 60 }`).
- **Tooltips:** Implement a simple tooltip that appears on hover over bars, displaying the Dimension name and the Measure value.

## Sample Data

```json
[
  {
    "﻿\"\"\"Row ID\"\"\"": 5041,
    "\"Order ID\"": "CA-2017-136469",
    "\"Order Date\"": "2017-07-11",
    "\"Ship Date\"": "2017-07-12",
    "\"Ship Mode\"": "First Class",
    "\"Customer ID\"": "TS-21370",
    "\"Customer Name\"": "Todd Sumrall",
    "\"Segment\"": "Corporate",
    "\"Country/Region\"": "United States",
    "\"City\"": "Wilmington",
    "\"State\"": "Delaware",
    "\"Postal Code\"": 19805.0,
    "\"Region\"": "East",
    "\"Product ID\"": "OFF-BI-10004492",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Binders",
    "\"Product Name\"": "Tuf-Vin Binders",
    "\"Sales\"": 221.06,
    "\"Quantity\"": 7,
    "\"Discount\"": 0.0,
    "\"Profit\"": 103.89819999999997
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 7465,
    "\"Order ID\"": "CA-2018-103709",
    "\"Order Date\"": "2018-09-08",
    "\"Ship Date\"": "2018-09-15",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "LP-17095",
    "\"Customer Name\"": "Liz Preis",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "Visalia",
    "\"State\"": "California",
    "\"Postal Code\"": 93277.0,
    "\"Region\"": "West",
    "\"Product ID\"": "OFF-PA-10004610",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Paper",
    "\"Product Name\"": "Xerox 1900",
    "\"Sales\"": 34.24,
    "\"Quantity\"": 8,
    "\"Discount\"": 0.0,
    "\"Profit\"": 15.407999999999998
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 9679,
    "\"Order ID\"": "CA-2018-144785",
    "\"Order Date\"": "2018-04-18",
    "\"Ship Date\"": "2018-04-23",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "CS-12490",
    "\"Customer Name\"": "Cindy Schnelling",
    "\"Segment\"": "Corporate",
    "\"Country/Region\"": "United States",
    "\"City\"": "New York City",
    "\"State\"": "New York",
    "\"Postal Code\"": 10009.0,
    "\"Region\"": "East",
    "\"Product ID\"": "OFF-SU-10004290",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Supplies",
    "\"Product Name\"": "Acme Design Line 8\" Stainless Steel Bent Scissors w/Champagne Handles, 3-1/8\" Cut",
    "\"Sales\"": 6.84,
    "\"Quantity\"": 1,
    "\"Discount\"": 0.0,
    "\"Profit\"": 1.8468
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 8695,
    "\"Order ID\"": "US-2016-112795",
    "\"Order Date\"": "2016-08-23",
    "\"Ship Date\"": "2016-08-28",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "CR-12625",
    "\"Customer Name\"": "Corey Roper",
    "\"Segment\"": "Home Office",
    "\"Country/Region\"": "United States",
    "\"City\"": "Grand Rapids",
    "\"State\"": "Michigan",
    "\"Postal Code\"": 49505.0,
    "\"Region\"": "Central",
    "\"Product ID\"": "OFF-PA-10001934",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Paper",
    "\"Product Name\"": "Xerox 1993",
    "\"Sales\"": 19.44,
    "\"Quantity\"": 3,
    "\"Discount\"": 0.0,
    "\"Profit\"": 9.5256
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 8817,
    "\"Order ID\"": "CA-2017-144274",
    "\"Order Date\"": "2017-11-23",
    "\"Ship Date\"": "2017-11-25",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "PW-19240",
    "\"Customer Name\"": "Pierre Wener",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "Wilmington",
    "\"State\"": "Delaware",
    "\"Postal Code\"": 19805.0,
    "\"Region\"": "East",
    "\"Product ID\"": "OFF-AR-10001940",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Art",
    "\"Product Name\"": "Sanford Colorific Eraseable Coloring Pencils, 12 Count",
    "\"Sales\"": 13.12,
    "\"Quantity\"": 4,
    "\"Discount\"": 0.0,
    "\"Profit\"": 5.6416
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 6873,
    "\"Order ID\"": "CA-2017-162544",
    "\"Order Date\"": "2017-12-16",
    "\"Ship Date\"": "2017-12-19",
    "\"Ship Mode\"": "First Class",
    "\"Customer ID\"": "SG-20080",
    "\"Customer Name\"": "Sandra Glassco",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "Seattle",
    "\"State\"": "Washington",
    "\"Postal Code\"": 98105.0,
    "\"Region\"": "West",
    "\"Product ID\"": "OFF-PA-10004948",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Paper",
    "\"Product Name\"": "Xerox 190",
    "\"Sales\"": 4.98,
    "\"Quantity\"": 1,
    "\"Discount\"": 0.0,
    "\"Profit\"": 2.3406000000000002
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 7399,
    "\"Order ID\"": "CA-2016-124807",
    "\"Order Date\"": "2016-07-12",
    "\"Ship Date\"": "2016-07-15",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "ME-17725",
    "\"Customer Name\"": "Max Engle",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "Chicago",
    "\"State\"": "Illinois",
    "\"Postal Code\"": 60610.0,
    "\"Region\"": "Central",
    "\"Product ID\"": "OFF-PA-10001526",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Paper",
    "\"Product Name\"": "Xerox 1949",
    "\"Sales\"": 35.856,
    "\"Quantity\"": 9,
    "\"Discount\"": 0.2,
    "\"Profit\"": 12.997800000000003
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 3526,
    "\"Order ID\"": "CA-2019-148922",
    "\"Order Date\"": "2019-12-10",
    "\"Ship Date\"": "2019-12-15",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "SU-20665",
    "\"Customer Name\"": "Stephanie Ulpright",
    "\"Segment\"": "Home Office",
    "\"Country/Region\"": "United States",
    "\"City\"": "Jackson",
    "\"State\"": "Mississippi",
    "\"Postal Code\"": 39212.0,
    "\"Region\"": "South",
    "\"Product ID\"": "TEC-AC-10001838",
    "\"Category\"": "Technology",
    "\"Sub-Category\"": "Accessories",
    "\"Product Name\"": "Razer Tiamat Over Ear 7.1 Surround Sound PC Gaming Headset",
    "\"Sales\"": 599.97,
    "\"Quantity\"": 3,
    "\"Discount\"": 0.0,
    "\"Profit\"": 257.98710000000005
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 2586,
    "\"Order ID\"": "CA-2017-121041",
    "\"Order Date\"": "2017-11-03",
    "\"Ship Date\"": "2017-11-10",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "CS-12250",
    "\"Customer Name\"": "Chris Selesnick",
    "\"Segment\"": "Corporate",
    "\"Country/Region\"": "United States",
    "\"City\"": "Haltom City",
    "\"State\"": "Texas",
    "\"Postal Code\"": 76117.0,
    "\"Region\"": "Central",
    "\"Product ID\"": "OFF-EN-10001137",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Envelopes",
    "\"Product Name\"": "#10 Gummed Flap White Envelopes, 100/Box",
    "\"Sales\"": 6.6080000000000005,
    "\"Quantity\"": 2,
    "\"Discount\"": 0.2,
    "\"Profit\"": 2.1475999999999997
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 2631,
    "\"Order ID\"": "CA-2017-168186",
    "\"Order Date\"": "2017-09-10",
    "\"Ship Date\"": "2017-09-15",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "AB-10150",
    "\"Customer Name\"": "Aimee Bixby",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "Tulsa",
    "\"State\"": "Oklahoma",
    "\"Postal Code\"": 74133.0,
    "\"Region\"": "Central",
    "\"Product ID\"": "OFF-PA-10000477",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Paper",
    "\"Product Name\"": "Xerox 1952",
    "\"Sales\"": 14.940000000000001,
    "\"Quantity\"": 3,
    "\"Discount\"": 0.0,
    "\"Profit\"": 7.021800000000001
  }
]
```

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/TEMP_0zzmslq10iuq6s16eyxoz0l4yeax.csv

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
const rows = await loadCsv("/data/TEMP_0zzmslq10iuq6s16eyxoz0l4yeax.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_1225/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Total Profits Each Year
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1y5sksx1v7xong1ajck090hysarw].[sum:Profit:qk]`
- cols_field: `[federated.1y5sksx1v7xong1ajck090hysarw].[yr:Order Date:ok]`
- series_field: `[federated.1y5sksx1v7xong1ajck090hysarw].[sum:Profit:qk]`
- bar_orientation: `vertical`
- zone: x=50000, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: Total Profits by Sub-Categories
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([federated.1y5sksx1v7xong1ajck090hysarw].[none:Category:nk] / [federated.1y5sksx1v7xong1ajck090hysarw].[none:Sub-Category:nk])`
- cols_field: `[federated.1y5sksx1v7xong1ajck090hysarw].[sum:Profit:qk]`
- series_field: `[federated.1y5sksx1v7xong1ajck090hysarw].[sum:Profit:qk]`
- bar_orientation: `horizontal`
- category_order: Copiers, Phones, Accessories, Paper, Binders, Chairs, Storage, Appliances, Furnishings, Envelopes, Art, Labels, Machines, Fasteners, Supplies, Bookcases, Tables, %all%
- zone: x=593, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: Total Sales Each Year
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1y5sksx1v7xong1ajck090hysarw].[sum:Sales:qk]`
- cols_field: `[federated.1y5sksx1v7xong1ajck090hysarw].[yr:Order Date:ok]`
- series_field: `[federated.1y5sksx1v7xong1ajck090hysarw].[sum:Sales:qk]`
- bar_orientation: `vertical`
- zone: x=50000, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Total Sales by Sub-Categories
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([federated.1y5sksx1v7xong1ajck090hysarw].[none:Category:nk] / [federated.1y5sksx1v7xong1ajck090hysarw].[none:Sub-Category:nk])`
- cols_field: `[federated.1y5sksx1v7xong1ajck090hysarw].[sum:Sales:qk]`
- series_field: `[federated.1y5sksx1v7xong1ajck090hysarw].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- category_order: Phones, Chairs, Storage, Tables, Binders, Machines, Accessories, Copiers, Bookcases, Appliances, Furnishings, Paper, Supplies, Art, Envelopes, Labels, Fasteners, %all%
- zone: x=593, y=1054, w=49407, h=48942
- highlight_fields: [federated.1y5sksx1v7xong1ajck090hysarw].[none:Category:nk], [federated.1y5sksx1v7xong1ajck090hysarw].[none:Sub-Category:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Total Sales Each Year, target=Sales and Profits
## Highlight Bindings
- Total Sales by Sub-Categories: [federated.1y5sksx1v7xong1ajck090hysarw].[none:Category:nk], [federated.1y5sksx1v7xong1ajck090hysarw].[none:Sub-Category:nk]
