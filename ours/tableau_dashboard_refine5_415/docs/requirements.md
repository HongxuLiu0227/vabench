# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_415/docs/syn_415_l2010_s121-1225-1968.twb
Primary data URL: /data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv

## Sample Data (10 rows)
```json
[
  {
    "﻿Row ID": 9043,
    "Order ID": "CA-2016-168760",
    "Order Date": "2016-09-22",
    "Ship Date": "2016-09-26",
    "Ship Mode": "Second Class",
    "Customer ID": "MM-18280",
    "Customer Name": "Muhammed MacIntyre",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Los Angeles",
    "State": "California",
    "Postal Code": 90049.0,
    "Region": "West",
    "Product ID": "OFF-AP-10004532",
    "Category": "Office Supplies",
    "Sub-Category": "Appliances",
    "Product Name": "Kensington 6 Outlet Guardian Standard Surge Protector",
    "Sales": 61.44,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 16.5888
  },
  {
    "﻿Row ID": 8235,
    "Order ID": "CA-2018-102204",
    "Order Date": "2018-05-01",
    "Ship Date": "2018-05-06",
    "Ship Mode": "Standard Class",
    "Customer ID": "CJ-12010",
    "Customer Name": "Caroline Jumper",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Jacksonville",
    "State": "Florida",
    "Postal Code": 32216.0,
    "Region": "South",
    "Product ID": "OFF-SU-10001212",
    "Category": "Office Supplies",
    "Sub-Category": "Supplies",
    "Product Name": "Kleencut Forged Office Shears by Acme United Corporation",
    "Sales": 3.3280000000000003,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 0.4159999999999997
  },
  {
    "﻿Row ID": 6044,
    "Order ID": "CA-2018-145702",
    "Order Date": "2018-05-19",
    "Ship Date": "2018-05-24",
    "Ship Mode": "Second Class",
    "Customer ID": "AH-10075",
    "Customer Name": "Adam Hart",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Knoxville",
    "State": "Tennessee",
    "Postal Code": 37918.0,
    "Region": "South",
    "Product ID": "FUR-CH-10001482",
    "Category": "Furniture",
    "Sub-Category": "Chairs",
    "Product Name": "Office Star - Mesh Screen back chair with Vinyl seat",
    "Sales": 314.352,
    "Quantity": 3,
    "Discount": 0.2,
    "Profit": -35.36460000000001
  },
  {
    "﻿Row ID": 462,
    "Order ID": "CA-2016-109638",
    "Order Date": "2016-12-15",
    "Ship Date": "2016-12-22",
    "Ship Mode": "Standard Class",
    "Customer ID": "JH-15985",
    "Customer Name": "Joseph Holt",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Seattle",
    "State": "Washington",
    "Postal Code": 98115.0,
    "Region": "West",
    "Product ID": "OFF-BI-10001098",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Acco D-Ring Binder w/DublLock",
    "Sales": 51.312,
    "Quantity": 3,
    "Discount": 0.2,
    "Profit": 18.600599999999996
  },
  {
    "﻿Row ID": 4986,
    "Order ID": "CA-2015-125171",
    "Order Date": "2015-09-03",
    "Ship Date": "2015-09-03",
    "Ship Mode": "Same Day",
    "Customer ID": "AG-10390",
    "Customer Name": "Allen Goldenen",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "New York City",
    "State": "New York",
    "Postal Code": 10009.0,
    "Region": "East",
    "Product ID": "OFF-LA-10001175",
    "Category": "Office Supplies",
    "Sub-Category": "Labels",
    "Product Name": "Avery 514",
    "Sales": 14.399999999999999,
    "Quantity": 5,
    "Discount": 0.0,
    "Profit": 7.056
  },
  {
    "﻿Row ID": 1829,
    "Order ID": "US-2016-140851",
    "Order Date": "2016-07-13",
    "Ship Date": "2016-07-15",
    "Ship Mode": "Second Class",
    "Customer ID": "ND-18460",
    "Customer Name": "Neil Ducich",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Macon",
    "State": "Georgia",
    "Postal Code": 31204.0,
    "Region": "South",
    "Product ID": "OFF-PA-10000019",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Xerox 1931",
    "Sales": 38.88,
    "Quantity": 6,
    "Discount": 0.0,
    "Profit": 18.6624
  },
  {
    "﻿Row ID": 1640,
    "Order ID": "CA-2017-157266",
    "Order Date": "2017-05-26",
    "Ship Date": "2017-06-01",
    "Ship Mode": "Standard Class",
    "Customer ID": "TB-21280",
    "Customer Name": "Toby Braunhardt",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Washington",
    "State": "District of Columbia",
    "Postal Code": 20016.0,
    "Region": "East",
    "Product ID": "OFF-BI-10004728",
    "Category": "Office Supplies",
    "Sub-Category": "Binders",
    "Product Name": "Wilson Jones Turn Tabs Binder Tool for Ring Binders",
    "Sales": 9.64,
    "Quantity": 2,
    "Discount": 0.0,
    "Profit": 4.4344
  },
  {
    "﻿Row ID": 4705,
    "Order ID": "CA-2017-158435",
    "Order Date": "2017-05-17",
    "Ship Date": "2017-05-18",
    "Ship Mode": "First Class",
    "Customer ID": "AG-10900",
    "Customer Name": "Arthur Gainer",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Waterbury",
    "State": "Connecticut",
    "Postal Code": 6708.0,
    "Region": "East",
    "Product ID": "OFF-SU-10000381",
    "Category": "Office Supplies",
    "Sub-Category": "Supplies",
    "Product Name": "Acme Forged Steel Scissors with Black Enamel Handles",
    "Sales": 65.17,
    "Quantity": 7,
    "Discount": 0.0,
    "Profit": 18.899299999999997
  },
  {
    "﻿Row ID": 581,
    "Order ID": "CA-2016-132906",
    "Order Date": "2016-09-10",
    "Ship Date": "2016-09-14",
    "Ship Mode": "Standard Class",
    "Customer ID": "CC-12145",
    "Customer Name": "Charles Crestani",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Los Angeles",
    "State": "California",
    "Postal Code": 90004.0,
    "Region": "West",
    "Product ID": "OFF-SU-10004498",
    "Category": "Office Supplies",
    "Sub-Category": "Supplies",
    "Product Name": "Martin-Yale Premier Letter Opener",
    "Sales": 51.52,
    "Quantity": 4,
    "Discount": 0.0,
    "Profit": 1.5456000000000003
  },
  {
    "﻿Row ID": 1730,
    "Order ID": "CA-2017-106894",
    "Order Date": "2017-02-07",
    "Ship Date": "2017-02-07",
    "Ship Mode": "Same Day",
    "Customer ID": "CA-12265",
    "Customer Name": "Christina Anderson",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Springfield",
    "State": "Virginia",
    "Postal Code": 22153.0,
    "Region": "South",
    "Product ID": "OFF-LA-10001045",
    "Category": "Office Supplies",
    "Sub-Category": "Labels",
    "Product Name": "Permanent Self-Adhesive File Folder Labels for Typewriters by Universal",
    "Sales": 7.83,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 3.6018
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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_415/docs/tableau_render_contract.json`
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
- zone: x=50000, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[sum:Profit:qk]`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=800, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- cols_field: `[ds_p9517_sample_superstore].[yr:Order Date:ok]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=50000, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1968__customer_overview
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[none:Region:nk]`
- cols_field: `([ds_p9517_sample_superstore].[:Measure Names] * [ds_p9517_sample_superstore].[Multiple Values])`
- series_field: `[ds_p9517_sample_superstore].[usr:Calculation_5571209093911105:qk]`
- zone: x=800, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
