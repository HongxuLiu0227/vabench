# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_204/docs/syn_204_l2010_s9517-1225-121.twb
Primary data URL: /data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv

## Sample Data (10 rows)
```json
[
  {
    "﻿Row ID": 3203,
    "Order ID": "CA-2015-158372",
    "Order Date": "2015-11-10",
    "Ship Date": "2015-11-16",
    "Ship Mode": "Standard Class",
    "Customer ID": "RD-19900",
    "Customer Name": "Ruben Dartt",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "San Diego",
    "State": "California",
    "Postal Code": 92037.0,
    "Region": "West",
    "Product ID": "TEC-PH-10002103",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Jabra SPEAK 410",
    "Sales": 601.536,
    "Quantity": 8,
    "Discount": 0.2,
    "Profit": 60.15360000000001
  },
  {
    "﻿Row ID": 2,
    "Order ID": "CA-2017-152156",
    "Order Date": "2017-11-08",
    "Ship Date": "2017-11-11",
    "Ship Mode": "Second Class",
    "Customer ID": "CG-12520",
    "Customer Name": "Claire Gute",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Henderson",
    "State": "Kentucky",
    "Postal Code": 42420.0,
    "Region": "South",
    "Product ID": "FUR-CH-10000454",
    "Category": "Furniture",
    "Sub-Category": "Chairs",
    "Product Name": "Hon Deluxe Fabric Upholstered Stacking Chairs, Rounded Back",
    "Sales": 731.9399999999999,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 219.58199999999997
  },
  {
    "﻿Row ID": 8353,
    "Order ID": "CA-2018-132199",
    "Order Date": "2018-05-03",
    "Ship Date": "2018-05-08",
    "Ship Mode": "Standard Class",
    "Customer ID": "BO-11350",
    "Customer Name": "Bill Overfelt",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Philadelphia",
    "State": "Pennsylvania",
    "Postal Code": 19134.0,
    "Region": "East",
    "Product ID": "OFF-BI-10003684",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Wilson Jones Legal Size Ring Binders",
    "Sales": 26.388,
    "Quantity": 4,
    "Discount": 0.7,
    "Profit": -17.59199999999999
  },
  {
    "﻿Row ID": 2439,
    "Order ID": "CA-2015-164210",
    "Order Date": "2015-11-18",
    "Ship Date": "2015-11-20",
    "Ship Mode": "Second Class",
    "Customer ID": "PW-19240",
    "Customer Name": "Pierre Wener",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Louisville",
    "State": "Colorado",
    "Postal Code": 80027.0,
    "Region": "West",
    "Product ID": "OFF-PA-10002259",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Geographics Note Cards, Blank, White, 8 1/2\" x 11\"\"\"",
    "Sales": 35.808,
    "Quantity": 4,
    "Discount": 0.2,
    "Profit": 12.5328
  },
  {
    "﻿Row ID": 6533,
    "Order ID": "US-2018-107384",
    "Order Date": "2018-12-04",
    "Ship Date": "2018-12-08",
    "Ship Mode": "Standard Class",
    "Customer ID": "TP-21130",
    "Customer Name": "Theone Pippenger",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Rochester",
    "State": "Minnesota",
    "Postal Code": 55901.0,
    "Region": "Central",
    "Product ID": "TEC-AC-10004595",
    "Category": "Technology",
    "Sub-Category": "Accessories",
    "Product Name": "First Data TMFD35 PIN Pad",
    "Sales": 142.8,
    "Quantity": 1,
    "Discount": 0.0,
    "Profit": 29.988
  },
  {
    "﻿Row ID": 3384,
    "Order ID": "CA-2016-130659",
    "Order Date": "2016-12-04",
    "Ship Date": "2016-12-09",
    "Ship Mode": "Second Class",
    "Customer ID": "MS-17365",
    "Customer Name": "Maribeth Schnelling",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10035.0,
    "Region": "East",
    "Product ID": "FUR-CH-10003535",
    "Category": "Furniture",
    "Sub-Category": "Chairs",
    "Product Name": "Global Armless Task Chair, Royal Blue",
    "Sales": 384.174,
    "Quantity": 7,
    "Discount": 0.1,
    "Profit": 29.88019999999998
  },
  {
    "﻿Row ID": 3799,
    "Order ID": "CA-2018-147760",
    "Order Date": "2018-11-04",
    "Ship Date": "2018-11-05",
    "Ship Mode": "First Class",
    "Customer ID": "KL-16555",
    "Customer Name": "Kelly Lampkin",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Greensboro",
    "State": "North Carolina",
    "Postal Code": 27405.0,
    "Region": "South",
    "Product ID": "FUR-TA-10004575",
    "Category": "Furniture",
    "Sub-Category": "Tables",
    "Product Name": "Hon 5100 Series Wood Tables",
    "Sales": 523.764,
    "Quantity": 3,
    "Discount": 0.4,
    "Profit": -192.04680000000008
  },
  {
    "﻿Row ID": 296,
    "Order ID": "CA-2015-111451",
    "Order Date": "2015-12-26",
    "Ship Date": "2015-12-28",
    "Ship Mode": "First Class",
    "Customer ID": "KL-16555",
    "Customer Name": "Kelly Lampkin",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Colorado Springs",
    "State": "Colorado",
    "Postal Code": 80906.0,
    "Region": "West",
    "Product ID": "FUR-FU-10002918",
    "Category": "Furniture",
    "Sub-Category": "Furnishings",
    "Product Name": "Eldon ClusterMat Chair Mat with Cordless Antistatic Protection",
    "Sales": 218.35200000000003,
    "Quantity": 3,
    "Discount": 0.2,
    "Profit": -24.5646
  },
  {
    "﻿Row ID": 2219,
    "Order ID": "CA-2018-130841",
    "Order Date": "2018-07-28",
    "Ship Date": "2018-08-01",
    "Ship Mode": "Standard Class",
    "Customer ID": "MH-17620",
    "Customer Name": "Matt Hagelstein",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "San Francisco",
    "State": "California",
    "Postal Code": 94110.0,
    "Region": "West",
    "Product ID": "OFF-BI-10000145",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Zipper Ring Binder Pockets",
    "Sales": 9.984000000000002,
    "Quantity": 4,
    "Discount": 0.2,
    "Profit": 3.6191999999999993
  },
  {
    "﻿Row ID": 8266,
    "Order ID": "CA-2015-131800",
    "Order Date": "2015-12-30",
    "Ship Date": "2016-01-04",
    "Ship Mode": "Standard Class",
    "Customer ID": "AJ-10960",
    "Customer Name": "Astrea Jones",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10035.0,
    "Region": "East",
    "Product ID": "OFF-BI-10003429",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Cardinal HOLDit! Binder Insert Strips,Extra Strips",
    "Sales": 35.448,
    "Quantity": 7,
    "Discount": 0.2,
    "Profit": 12.8499
  }
]
```

## Data Loading (Full Dataset)
Fetch the full dataset from the URLs under /data/... (Vite public folder) and parse it in the browser.

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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_204/docs/tableau_render_contract.json`
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
- zone: x=50000, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- cols_field: `[ds_p9517_sample_superstore].[yr:Order Date:ok]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=800, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__bar
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p9517_sample_superstore].[none:Category:nk] / [ds_p9517_sample_superstore].[none:Sub-Category:nk])`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=50000, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[sum:Profit:qk]`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=800, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
