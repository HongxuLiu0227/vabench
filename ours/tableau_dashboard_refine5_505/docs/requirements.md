# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_505/docs/syn_505_l1225_s1225-121-9517.twb
Primary data URL: /data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv

## Sample Data (10 rows)
```json
[
  {
    "﻿Category": "Office Supplies",
    "City": "Las Vegas",
    "Country": "United States",
    "Customer Name": "John Murray",
    "Manufacturer": "Xerox",
    "Order Date": "2012-11-30",
    "Order ID": "CA-2012-107685",
    "Postal Code": 89115,
    "Product Name": "Xerox 1997",
    "Region": "West",
    "Segment": "Consumer",
    "Ship Date": "2012-12-02",
    "Ship Mode": "Second Class",
    "State": "Nevada",
    "Sub-Category": "Paper",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 12,
    "Profit Ratio": 0.48,
    "Quantity": 4,
    "Sales": 26
  },
  {
    "﻿Category": "Furniture",
    "City": "Bellingham",
    "Country": "United States",
    "Customer Name": "Sarah Foster",
    "Manufacturer": "Hon",
    "Order Date": "2014-11-02",
    "Order ID": "CA-2014-123967",
    "Postal Code": 98226,
    "Product Name": "Hon 94000 Series Round Tables",
    "Region": "West",
    "Segment": "Consumer",
    "Ship Date": "2014-11-04",
    "Ship Mode": "Second Class",
    "State": "Washington",
    "Sub-Category": "Tables",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 240,
    "Profit Ratio": 0.09,
    "Quantity": 9,
    "Sales": 2666
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Chester",
    "Country": "United States",
    "Customer Name": "Jesus Ocampo",
    "Manufacturer": "Avery",
    "Order Date": "2012-05-14",
    "Order ID": "CA-2012-119291",
    "Postal Code": 19013,
    "Product Name": "Avery 4027 File Folder Labels for Dot Matrix Printers, 5000 Labels per Box, White",
    "Region": "East",
    "Segment": "Home Office",
    "Ship Date": "2012-05-17",
    "Ship Mode": "First Class",
    "State": "Pennsylvania",
    "Sub-Category": "Labels",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 32,
    "Profit Ratio": 0.33,
    "Quantity": 4,
    "Sales": 98
  },
  {
    "﻿Category": "Technology",
    "City": "San Francisco",
    "Country": "United States",
    "Customer Name": "Matt Hagelstein",
    "Manufacturer": "Other",
    "Order Date": "2014-07-29",
    "Order ID": "CA-2014-130841",
    "Postal Code": 94110,
    "Product Name": "Wilson Electronics DB Pro Signal Booster",
    "Region": "West",
    "Segment": "Corporate",
    "Ship Date": "2014-08-02",
    "Ship Mode": "Standard Class",
    "State": "California",
    "Sub-Category": "Phones",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 100,
    "Profit Ratio": 0.09,
    "Quantity": 4,
    "Sales": 1146
  },
  {
    "﻿Category": "Technology",
    "City": "Charlotte",
    "Country": "United States",
    "Customer Name": "Larry Hughes",
    "Manufacturer": "Nortel",
    "Order Date": "2014-08-02",
    "Order ID": "CA-2014-133235",
    "Postal Code": 28205,
    "Product Name": "Nortel Networks T7316 E Nt8 B27",
    "Region": "South",
    "Segment": "Consumer",
    "Ship Date": "2014-08-05",
    "Ship Mode": "First Class",
    "State": "North Carolina",
    "Sub-Category": "Phones",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 17,
    "Profit Ratio": 0.06,
    "Quantity": 5,
    "Sales": 272
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Columbus",
    "Country": "United States",
    "Customer Name": "Barbara Fisher",
    "Manufacturer": "Pressboard",
    "Order Date": "2013-11-21",
    "Order ID": "CA-2013-100041",
    "Postal Code": 47201,
    "Product Name": "Pressboard Covers with Storage Hooks, 9 1/2\" x 11\", Light Blue",
    "Region": "Central",
    "Segment": "Corporate",
    "Ship Date": "2013-11-26",
    "Ship Mode": "Standard Class",
    "State": "Indiana",
    "Sub-Category": "Binders",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 2,
    "Profit Ratio": 0.47,
    "Quantity": 1,
    "Sales": 5
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Oklahoma City",
    "Country": "United States",
    "Customer Name": "Charles Crestani",
    "Manufacturer": "Xerox",
    "Order Date": "2013-08-09",
    "Order ID": "CA-2013-130078",
    "Postal Code": 73120,
    "Product Name": "Xerox 1954",
    "Region": "Central",
    "Segment": "Consumer",
    "Ship Date": "2013-08-15",
    "Ship Mode": "Standard Class",
    "State": "Oklahoma",
    "Sub-Category": "Paper",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 5,
    "Profit Ratio": 0.45,
    "Quantity": 2,
    "Sales": 11
  },
  {
    "﻿Category": "Technology",
    "City": "New York City",
    "Country": "United States",
    "Customer Name": "Stephanie Ulpright",
    "Manufacturer": "KeyTronic",
    "Order Date": "2013-07-02",
    "Order ID": "US-2013-126431",
    "Postal Code": 10009,
    "Product Name": "KeyTronic KT400U2 - Keyboard - Black",
    "Region": "East",
    "Segment": "Home Office",
    "Ship Date": "2013-07-02",
    "Ship Mode": "Same Day",
    "State": "New York",
    "Sub-Category": "Accessories",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 6,
    "Profit Ratio": 0.2,
    "Quantity": 3,
    "Sales": 31
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Dallas",
    "Country": "United States",
    "Customer Name": "Sanjit Jacobs",
    "Manufacturer": "Tyvek",
    "Order Date": "2013-03-09",
    "Order ID": "CA-2013-130400",
    "Postal Code": 75217,
    "Product Name": "Tyvek Interoffice Envelopes, 9 1/2\" x 12 1/2\", 100/Box",
    "Region": "Central",
    "Segment": "Home Office",
    "Ship Date": "2013-03-13",
    "Ship Mode": "Standard Class",
    "State": "Texas",
    "Sub-Category": "Envelopes",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 49,
    "Profit Ratio": 0.34,
    "Quantity": 3,
    "Sales": 146
  },
  {
    "﻿Category": "Technology",
    "City": "Henderson",
    "Country": "United States",
    "Customer Name": "Thomas Boland",
    "Manufacturer": "Logitech",
    "Order Date": "2014-11-03",
    "Order ID": "CA-2014-143567",
    "Postal Code": 42420,
    "Product Name": "Logitech diNovo Edge Keyboard",
    "Region": "South",
    "Segment": "Corporate",
    "Ship Date": "2014-11-06",
    "Ship Mode": "Second Class",
    "State": "Kentucky",
    "Sub-Category": "Accessories",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 517,
    "Profit Ratio": 0.23,
    "Quantity": 9,
    "Sales": 2250
  }
]
```

## Data Loading (Full Dataset)
Fetch the full dataset from the URLs under /data/... (Vite public folder) and parse it in the browser.

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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_505/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[yr:Order Date:ok]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=50000, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__line
- chart_intent: `line_chart`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[tmn:Order Date:qk]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=593, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Profit:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=593, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Sub-Category:nk] / [ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Product Name:nk])`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=50000, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
