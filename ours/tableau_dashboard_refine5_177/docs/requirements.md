# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_177/docs/syn_177_l2010_s121-1968-1225.twb
Primary data URL: /data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv

## Sample Data (10 rows)
```json
[
  {
    "﻿Row ID": 247,
    "Order ID": "CA-2015-131926",
    "Order Date": "2015-06-01",
    "Ship Date": "2015-06-06",
    "Ship Mode": "Second Class",
    "Customer ID": "DW-13480",
    "Customer Name": "Dianna Wilson",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "Lakeville",
    "State": "Minnesota",
    "Postal Code": 55044.0,
    "Region": "Central",
    "Product ID": "OFF-PA-10004082",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Adams Telephone Message Book w/Frequently-Called Numbers Space, 400 Messages per Book",
    "Sales": 47.88,
    "Quantity": 6,
    "Discount": 0.0,
    "Profit": 23.94
  },
  {
    "﻿Row ID": 839,
    "Order ID": "US-2017-137547",
    "Order Date": "2017-03-07",
    "Ship Date": "2017-03-12",
    "Ship Mode": "Standard Class",
    "Customer ID": "EB-13705",
    "Customer Name": "Ed Braxton",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Fort Worth",
    "State": "Texas",
    "Postal Code": 76106.0,
    "Region": "Central",
    "Product ID": "TEC-PH-10002365",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Belkin Grip Candy Sheer Case / Cover for iPhone 5 and 5S",
    "Sales": 21.072,
    "Quantity": 3,
    "Discount": 0.2,
    "Profit": 1.5804
  },
  {
    "﻿Row ID": 4775,
    "Order ID": "CA-2018-119746",
    "Order Date": "2018-11-23",
    "Ship Date": "2018-11-27",
    "Ship Mode": "Standard Class",
    "Customer ID": "CM-12385",
    "Customer Name": "Christopher Martinez",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Chicago",
    "State": "Illinois",
    "Postal Code": 60610.0,
    "Region": "Central",
    "Product ID": "TEC-PH-10004447",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Toshiba IPT2010-SD IP Telephone",
    "Sales": 222.38400000000001,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 16.678799999999995
  },
  {
    "﻿Row ID": 4252,
    "Order ID": "CA-2016-155068",
    "Order Date": "2016-10-23",
    "Ship Date": "2016-10-23",
    "Ship Mode": "Same Day",
    "Customer ID": "RA-19285",
    "Customer Name": "Ralph Arnett",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Lakeland",
    "State": "Florida",
    "Postal Code": 33801.0,
    "Region": "South",
    "Product ID": "TEC-PH-10004897",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Mediabridge Sport Armband iPhone 5s",
    "Sales": 55.944,
    "Quantity": 7,
    "Discount": 0.2,
    "Profit": -13.286700000000002
  },
  {
    "﻿Row ID": 6844,
    "Order ID": "CA-2017-123946",
    "Order Date": "2017-09-12",
    "Ship Date": "2017-09-17",
    "Ship Mode": "Standard Class",
    "Customer ID": "AJ-10795",
    "Customer Name": "Anthony Johnson",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Springfield",
    "State": "Virginia",
    "Postal Code": 22153.0,
    "Region": "South",
    "Product ID": "OFF-ST-10000419",
    "Category": "Office Supplies",
    "Sub-Category": "Storage",
    "Product Name": "Rogers Jumbo File, Granite",
    "Sales": 67.9,
    "Quantity": 5,
    "Discount": 0.0,
    "Profit": 0.6789999999999985
  },
  {
    "﻿Row ID": 6964,
    "Order ID": "CA-2017-157161",
    "Order Date": "2017-07-16",
    "Ship Date": "2017-07-20",
    "Ship Mode": "Second Class",
    "Customer ID": "JD-15895",
    "Customer Name": "Jonathan Doherty",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Columbia",
    "State": "South Carolina",
    "Postal Code": 29203.0,
    "Region": "South",
    "Product ID": "OFF-AR-10003338",
    "Category": "Office Supplies",
    "Sub-Category": "Art",
    "Product Name": "Eberhard Faber 3 1/2\" Golf Pencils\"",
    "Sales": 22.32,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 5.580000000000001
  },
  {
    "﻿Row ID": 3544,
    "Order ID": "CA-2017-157511",
    "Order Date": "2017-09-18",
    "Ship Date": "2017-09-20",
    "Ship Mode": "First Class",
    "Customer ID": "SV-20365",
    "Customer Name": "Seth Vernon",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Columbus",
    "State": "Ohio",
    "Postal Code": 43229.0,
    "Region": "East",
    "Product ID": "OFF-AR-10002257",
    "Category": "Office Supplies",
    "Sub-Category": "Art",
    "Product Name": "Eldon Spacemaker Box, Quick-Snap Lid, Clear",
    "Sales": 2.672,
    "Quantity": 1,
    "Discount": 0.2,
    "Profit": 0.3673999999999996
  },
  {
    "﻿Row ID": 5606,
    "Order ID": "CA-2017-134516",
    "Order Date": "2017-09-20",
    "Ship Date": "2017-09-25",
    "Ship Mode": "Standard Class",
    "Customer ID": "FM-14215",
    "Customer Name": "Filia McAdams",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Greensboro",
    "State": "North Carolina",
    "Postal Code": 27405.0,
    "Region": "South",
    "Product ID": "FUR-FU-10001546",
    "Category": "Furniture",
    "Sub-Category": "Furnishings",
    "Product Name": "Dana Swing-Arm Lamps",
    "Sales": 17.088,
    "Quantity": 2,
    "Discount": 0.2,
    "Profit": 1.0679999999999996
  },
  {
    "﻿Row ID": 6980,
    "Order ID": "CA-2018-149076",
    "Order Date": "2018-01-14",
    "Ship Date": "2018-01-19",
    "Ship Mode": "Standard Class",
    "Customer ID": "SO-20335",
    "Customer Name": "Sean O'Donnell",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Los Angeles",
    "State": "California",
    "Postal Code": 90036.0,
    "Region": "West",
    "Product ID": "OFF-PA-10000483",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Xerox 19",
    "Sales": 154.9,
    "Quantity": 5,
    "Discount": 0.0,
    "Profit": 69.705
  },
  {
    "﻿Row ID": 463,
    "Order ID": "CA-2017-109869",
    "Order Date": "2017-04-22",
    "Ship Date": "2017-04-29",
    "Ship Mode": "Standard Class",
    "Customer ID": "TN-21040",
    "Customer Name": "Tanja Norvell",
    "Segment": "Home Office",
    "Country": "United States",
    "City": "Phoenix",
    "State": "Arizona",
    "Postal Code": 85023.0,
    "Region": "West",
    "Product ID": "FUR-FU-10000023",
    "Category": "Furniture",
    "Sub-Category": "Furnishings",
    "Product Name": "Eldon Wave Desk Accessories",
    "Sales": 23.56,
    "Quantity": 5,
    "Discount": 0.2,
    "Profit": 7.0680000000000005
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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_177/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P121__bar
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p9517_sample_superstore].[none:Category:nk] / [ds_p9517_sample_superstore].[none:Sub-Category:nk])`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=50000, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P1968__customer_overview
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[none:Region:nk]`
- cols_field: `([ds_p9517_sample_superstore].[:Measure Names] * [ds_p9517_sample_superstore].[Multiple Values])`
- series_field: `[ds_p9517_sample_superstore].[usr:Calculation_5571209093911105:qk]`
- zone: x=800, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[sum:Profit:qk]`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=50000, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- cols_field: `[ds_p9517_sample_superstore].[yr:Order Date:ok]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=800, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
