# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_167/docs/syn_167_l1225_s121-9517-1225.twb
Primary data URL: /data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv

## Sample Data (10 rows)
```json
[
  {
    "﻿Row ID": 8578,
    "Order ID": "CA-2018-146164",
    "Order Date": "2018-12-22",
    "Ship Date": "2018-12-26",
    "Ship Mode": "Standard Class",
    "Customer ID": "CM-12190",
    "Customer Name": "Charlotte Melton",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Rochester",
    "State": "Minnesota",
    "Postal Code": 55901.0,
    "Region": "Central",
    "Product ID": "FUR-TA-10004915",
    "Category": "Furniture",
    "Sub-Category": "Tables",
    "Product Name": "Office Impressions End Table, 20-1/2\"H x 24\"\"W x 20\"\"D\"",
    "Sales": 607.52,
    "Quantity": 2,
    "Discount": 0.0,
    "Profit": 97.20320000000004
  },
  {
    "﻿Row ID": 5945,
    "Order ID": "CA-2015-104178",
    "Order Date": "2015-08-25",
    "Ship Date": "2015-08-29",
    "Ship Mode": "Standard Class",
    "Customer ID": "JM-15265",
    "Customer Name": "Janet Molinari",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Los Angeles",
    "State": "California",
    "Postal Code": 90036.0,
    "Region": "West",
    "Product ID": "TEC-AC-10002399",
    "Category": "Technology",
    "Sub-Category": "Accessories",
    "Product Name": "SanDisk Cruzer 32 GB USB Flash Drive",
    "Sales": 95.1,
    "Quantity": 5,
    "Discount": 0.0,
    "Profit": 30.431999999999995
  },
  {
    "﻿Row ID": 7425,
    "Order ID": "CA-2018-135069",
    "Order Date": "2018-04-10",
    "Ship Date": "2018-04-14",
    "Ship Mode": "Standard Class",
    "Customer ID": "BS-11755",
    "Customer Name": "Bruce Stewart",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Philadelphia",
    "State": "Pennsylvania",
    "Postal Code": 19143.0,
    "Region": "East",
    "Product ID": "FUR-FU-10003878",
    "Category": "Furniture",
    "Sub-Category": "Furnishings",
    "Product Name": "Linden 10\" Round Wall Clock",
    "Sales": "Black\"",
    "Quantity": 36.672,
    "Discount": 3,
    "Profit": 0.2,
    "null": "['6.4176']"
  },
  {
    "﻿Row ID": 6141,
    "Order ID": "CA-2018-121083",
    "Order Date": "2018-07-09",
    "Ship Date": "2018-07-15",
    "Ship Mode": "Standard Class",
    "Customer ID": "JF-15190",
    "Customer Name": "Jamie Frazer",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Manchester",
    "State": "Connecticut",
    "Postal Code": 6040.0,
    "Region": "East",
    "Product ID": "OFF-PA-10001497",
    "Category": "Office Supplies",
    "Sub-Category": "Paper",
    "Product Name": "Xerox 1914",
    "Sales": 274.8,
    "Quantity": 5,
    "Discount": 0.0,
    "Profit": 134.652
  },
  {
    "﻿Row ID": 984,
    "Order ID": "CA-2015-163419",
    "Order Date": "2015-11-11",
    "Ship Date": "2015-11-14",
    "Ship Mode": "Second Class",
    "Customer ID": "TZ-21580",
    "Customer Name": "Tracy Zic",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Louisville",
    "State": "Colorado",
    "Postal Code": 80027.0,
    "Region": "West",
    "Product ID": "FUR-CH-10000665",
    "Category": "Furniture",
    "Sub-Category": "Chairs",
    "Product Name": "Global Airflow Leather Mesh Back Chair, Black",
    "Sales": 603.92,
    "Quantity": 5,
    "Discount": 0.2,
    "Profit": 75.48999999999992
  },
  {
    "﻿Row ID": 3733,
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
    "Product ID": "TEC-PH-10000895",
    "Category": "Technology",
    "Sub-Category": "Phones",
    "Product Name": "Polycom VVX 310 VoIP phone",
    "Sales": 1259.93,
    "Quantity": 7,
    "Discount": 0.0,
    "Profit": 327.58180000000004
  },
  {
    "﻿Row ID": 2665,
    "Order ID": "CA-2017-164784",
    "Order Date": "2017-05-01",
    "Ship Date": "2017-05-04",
    "Ship Mode": "First Class",
    "Customer ID": "HF-14995",
    "Customer Name": "Herbert Flentye",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Memphis",
    "State": "Tennessee",
    "Postal Code": 38109.0,
    "Region": "South",
    "Product ID": "FUR-TA-10004534",
    "Category": "Furniture",
    "Sub-Category": "Tables",
    "Product Name": "Bevis 44 x 96 Conference Tables",
    "Sales": 370.62,
    "Quantity": 3,
    "Discount": 0.4,
    "Profit": -142.07100000000008
  },
  {
    "﻿Row ID": 4638,
    "Order ID": "CA-2018-168228",
    "Order Date": "2018-04-27",
    "Ship Date": "2018-04-29",
    "Ship Mode": "First Class",
    "Customer ID": "AP-10915",
    "Customer Name": "Arthur Prichep",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Los Angeles",
    "State": "California",
    "Postal Code": 90045.0,
    "Region": "West",
    "Product ID": "OFF-AR-10000390",
    "Category": "Office Supplies",
    "Sub-Category": "Art",
    "Product Name": "Newell Chalk Holder",
    "Sales": 12.39,
    "Quantity": 3,
    "Discount": 0.0,
    "Profit": 5.6994
  },
  {
    "﻿Row ID": 8643,
    "Order ID": "CA-2016-108259",
    "Order Date": "2016-11-08",
    "Ship Date": "2016-11-15",
    "Ship Mode": "Standard Class",
    "Customer ID": "NS-18640",
    "Customer Name": "Noel Staavos",
    "Segment": "Corporate",
    "Country": "United States",
    "City": "Jacksonville",
    "State": "North Carolina",
    "Postal Code": 28540.0,
    "Region": "South",
    "Product ID": "OFF-FA-10000624",
    "Category": "Office Supplies",
    "Sub-Category": "Fasteners",
    "Product Name": "OIC Binder Clips",
    "Sales": 31.504000000000005,
    "Quantity": 11,
    "Discount": 0.2,
    "Profit": 11.814
  },
  {
    "﻿Row ID": 8573,
    "Order ID": "CA-2015-121629",
    "Order Date": "2015-11-28",
    "Ship Date": "2015-12-02",
    "Ship Mode": "Standard Class",
    "Customer ID": "BT-11680",
    "Customer Name": "Brian Thompson",
    "Segment": "Consumer",
    "Country": "United States",
    "City": "Houston",
    "State": "Texas",
    "Postal Code": 77041.0,
    "Region": "Central",
    "Product ID": "TEC-MA-10004679",
    "Category": "Technology",
    "Sub-Category": "Machines",
    "Product Name": "StarTech.com 10/100 VDSL2 Ethernet Extender Kit",
    "Sales": 998.8499999999999,
    "Quantity": 5,
    "Discount": 0.4,
    "Profit": -199.7700000000001
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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_167/docs/tableau_render_contract.json`
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
- zone: x=50000, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p9517_sample_superstore].[none:Sub-Category:nk] / [ds_p9517_sample_superstore].[none:Calculation_317222333014716416:nk])`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=593, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- cols_field: `[ds_p9517_sample_superstore].[yr:Order Date:ok]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=593, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p9517_sample_superstore].[sum:Profit:qk]`
- cols_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- series_field: `[ds_p9517_sample_superstore].[sum:Sales:qk]`
- zone: x=50000, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
