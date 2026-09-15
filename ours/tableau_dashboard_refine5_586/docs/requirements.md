# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_586/docs/syn_586_l121_s121-9517.twb
Primary data URL: /data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv

## Sample Data (10 rows)
```json
[
  {
    "﻿Category": "Office Supplies",
    "City": "Wichita",
    "Country": "United States",
    "Customer Name": "Sonia Sunley",
    "Manufacturer": "Avery",
    "Order Date": "2013-06-14",
    "Order ID": "CA-2013-136287",
    "Postal Code": 67212,
    "Product Name": "Avery 51",
    "Region": "Central",
    "Segment": "Consumer",
    "Ship Date": "2013-06-18",
    "Ship Mode": "Standard Class",
    "State": "Kansas",
    "Sub-Category": "Labels",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 9,
    "Profit Ratio": 0.46,
    "Quantity": 3,
    "Sales": 19
  },
  {
    "﻿Category": "Technology",
    "City": "Chesapeake",
    "Country": "United States",
    "Customer Name": "Natalie Fritzler",
    "Manufacturer": "Enermax",
    "Order Date": "2011-02-12",
    "Order ID": "CA-2011-127614",
    "Postal Code": 23320,
    "Product Name": "Enermax Aurora Lite Keyboard",
    "Region": "South",
    "Segment": "Consumer",
    "Ship Date": "2011-02-16",
    "Ship Mode": "Standard Class",
    "State": "Virginia",
    "Sub-Category": "Accessories",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 103,
    "Profit Ratio": 0.44,
    "Quantity": 3,
    "Sales": 234
  },
  {
    "﻿Category": "Office Supplies",
    "City": "San Francisco",
    "Country": "United States",
    "Customer Name": "Neil Knudson",
    "Manufacturer": "Acme",
    "Order Date": "2014-09-25",
    "Order ID": "CA-2014-130148",
    "Postal Code": 94110,
    "Product Name": "Acme Value Line Scissors",
    "Region": "West",
    "Segment": "Home Office",
    "Ship Date": "2014-09-29",
    "Ship Mode": "Second Class",
    "State": "California",
    "Sub-Category": "Supplies",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 2,
    "Profit Ratio": 0.3,
    "Quantity": 2,
    "Sales": 7
  },
  {
    "﻿Category": "Furniture",
    "City": "Los Angeles",
    "Country": "United States",
    "Customer Name": "Sung Pak",
    "Manufacturer": "Global",
    "Order Date": "2013-11-25",
    "Order ID": "US-2013-163881",
    "Postal Code": 90036,
    "Product Name": "Global Leather Executive Chair",
    "Region": "West",
    "Segment": "Corporate",
    "Ship Date": "2013-12-01",
    "Ship Mode": "Standard Class",
    "State": "California",
    "Sub-Category": "Chairs",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 211,
    "Profit Ratio": 0.13,
    "Quantity": 6,
    "Sales": 1685
  },
  {
    "﻿Category": "Furniture",
    "City": "Seattle",
    "Country": "United States",
    "Customer Name": "Tamara Willingham",
    "Manufacturer": "Bush",
    "Order Date": "2012-12-01",
    "Order ID": "CA-2012-137113",
    "Postal Code": 98105,
    "Product Name": "Bush Advantage Collection Round Conference Table",
    "Region": "West",
    "Segment": "Home Office",
    "Ship Date": "2012-12-05",
    "Ship Mode": "Second Class",
    "State": "Washington",
    "Sub-Category": "Tables",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 402,
    "Profit Ratio": 0.21,
    "Quantity": 9,
    "Sales": 1913
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Providence",
    "Country": "United States",
    "Customer Name": "Jason Gross",
    "Manufacturer": "Premier",
    "Order Date": "2014-12-23",
    "Order ID": "CA-2014-119578",
    "Postal Code": 2908,
    "Product Name": "Premier Electric Letter Opener",
    "Region": "East",
    "Segment": "Corporate",
    "Ship Date": "2014-12-28",
    "Ship Mode": "Second Class",
    "State": "Rhode Island",
    "Sub-Category": "Supplies",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 35,
    "Profit Ratio": 0.05,
    "Quantity": 6,
    "Sales": 695
  },
  {
    "﻿Category": "Furniture",
    "City": "Columbus",
    "Country": "United States",
    "Customer Name": "Troy Blackwell",
    "Manufacturer": "GE",
    "Order Date": "2014-03-21",
    "Order ID": "CA-2014-154214",
    "Postal Code": 47201,
    "Product Name": "GE General Purpose, Extra Long Life, Showcase & Floodlight Incandescent Bulbs",
    "Region": "Central",
    "Segment": "Consumer",
    "Ship Date": "2014-03-26",
    "Ship Mode": "Second Class",
    "State": "Indiana",
    "Sub-Category": "Furnishings",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 1,
    "Profit Ratio": 0.47,
    "Quantity": 1,
    "Sales": 3
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Kent",
    "Country": "United States",
    "Customer Name": "John Huston",
    "Manufacturer": "Newell",
    "Order Date": "2014-01-28",
    "Order ID": "CA-2014-117870",
    "Postal Code": 44240,
    "Product Name": "Newell 312",
    "Region": "East",
    "Segment": "Consumer",
    "Ship Date": "2014-01-31",
    "Ship Mode": "Second Class",
    "State": "Ohio",
    "Sub-Category": "Art",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 2,
    "Profit Ratio": 0.13,
    "Quantity": 3,
    "Sales": 14
  },
  {
    "﻿Category": "Furniture",
    "City": "Houston",
    "Country": "United States",
    "Customer Name": "Andrew Gjertsen",
    "Manufacturer": "KI",
    "Order Date": "2012-10-24",
    "Order ID": "CA-2012-118738",
    "Postal Code": 77041,
    "Product Name": "KI Conference Tables",
    "Region": "Central",
    "Segment": "Corporate",
    "Ship Date": "2012-10-30",
    "Ship Mode": "Standard Class",
    "State": "Texas",
    "Sub-Category": "Tables",
    "Discount": 0.3,
    "Number of Records": 1,
    "Profit": -69,
    "Profit Ratio": -0.2,
    "Quantity": 7,
    "Sales": 347
  },
  {
    "﻿Category": "Technology",
    "City": "Seattle",
    "Country": "United States",
    "Customer Name": "Emily Ducich",
    "Manufacturer": "Texas Instruments",
    "Order Date": "2013-12-23",
    "Order ID": "CA-2013-149916",
    "Postal Code": 98115,
    "Product Name": "Texas Instrument TI-15 Fraction Calculator",
    "Region": "West",
    "Segment": "Home Office",
    "Ship Date": "2013-12-25",
    "Ship Mode": "Second Class",
    "State": "Washington",
    "Sub-Category": "Machines",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 4,
    "Profit Ratio": 0.33,
    "Quantity": 1,
    "Sales": 12
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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_586/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Profit:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=800, y=1000, w=49200, h=61748
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__bar
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Category:nk] / [ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Sub-Category:nk])`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=50000, y=1000, w=49200, h=61750
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Sub-Category:nk] / [ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Product Name:nk])`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=800, y=62750, w=98400, h=36250
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
