# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_391/docs/syn_391_l1225_s1225-121-9517.twb
Primary data URL: /data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv

## Sample Data (10 rows)
```json
[
  {
    "﻿Super Store Date set for the worldwide sales. ": 41706,
    "Unnamed: 1": "TU-2014-8330",
    "Unnamed: 2": "2014-10-03 00:00:00",
    "Unnamed: 3": "2014-10-06 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "RR-9525",
    "Unnamed: 6": "Rick Reed",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Sivas, Sivas",
    "Unnamed: 9": "Turkey",
    "Unnamed: 10": "",
    "Unnamed: 11": "EMEA",
    "Unnamed: 12": "EMEA",
    "Unnamed: 13": "OFF-GRE-10001084",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Paper",
    "Unnamed: 16": "Green Bar Cards & Envelopes, Multicolor",
    "Unnamed: 17": 19.92,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0.6,
    "Unnamed: 20": -23.910000000000004,
    "Unnamed: 21": 2.25,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 48780,
    "Unnamed: 1": "IZ-2012-7440",
    "Unnamed: 2": "2012-08-17 00:00:00",
    "Unnamed: 3": "2012-08-18 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "AF-870",
    "Unnamed: 6": "Art Ferguson",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Basra, Al Basrah",
    "Unnamed: 9": "Iraq",
    "Unnamed: 10": "",
    "Unnamed: 11": "EMEA",
    "Unnamed: 12": "EMEA",
    "Unnamed: 13": "OFF-KRA-10004624",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Envelopes",
    "Unnamed: 16": "Kraft Peel and Seal, Set of 50",
    "Unnamed: 17": 20.490000000000002,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 3.66,
    "Unnamed: 21": 2.45,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 30484,
    "Unnamed: 1": "IN-2012-84955",
    "Unnamed: 2": "2012-09-14 00:00:00",
    "Unnamed: 3": "2012-09-17 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "CC-12145",
    "Unnamed: 6": "Charles Crestani",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Forster, New South Wales",
    "Unnamed: 9": "Australia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "OFF-ST-10004374",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Storage",
    "Unnamed: 16": "Smead File Cart, Single Width",
    "Unnamed: 17": 515.52,
    "Unnamed: 18": 4,
    "Unnamed: 19": 0,
    "Unnamed: 20": 108.24,
    "Unnamed: 21": 60.02,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 40466,
    "Unnamed: 1": "CA-2013-140571",
    "Unnamed: 2": "2013-03-16 00:00:00",
    "Unnamed: 3": "2013-03-20 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "SJ-20125",
    "Unnamed: 6": "Sanjit Jacobs",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Jackson, Mississippi",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 39212,
    "Unnamed: 11": "US",
    "Unnamed: 12": "South",
    "Unnamed: 13": "OFF-PA-10001954",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Paper",
    "Unnamed: 16": "Xerox 1964",
    "Unnamed: 17": 45.68,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 21.0128,
    "Unnamed: 21": 8.2,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 30177,
    "Unnamed: 1": "ID-2011-50144",
    "Unnamed: 2": "2011-03-01 00:00:00",
    "Unnamed: 3": "2011-03-05 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "LH-17155",
    "Unnamed: 6": "Logan Haushalter",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Hobart, Tasmania",
    "Unnamed: 9": "Australia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "OFF-PA-10000116",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Paper",
    "Unnamed: 16": "Xerox Parchment Paper, Premium",
    "Unnamed: 17": 23.868,
    "Unnamed: 18": 3,
    "Unnamed: 19": 0.4,
    "Unnamed: 20": -7.632,
    "Unnamed: 21": 3.9,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 29401,
    "Unnamed: 1": "ID-2012-59181",
    "Unnamed: 2": "2012-07-24 00:00:00",
    "Unnamed: 3": "2012-07-26 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "HA-14920",
    "Unnamed: 6": "Helen Andreada",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Depok, Jawa Barat",
    "Unnamed: 9": "Indonesia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Southeast Asia",
    "Unnamed: 13": "OFF-PA-10000453",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Paper",
    "Unnamed: 16": "Xerox Cards & Envelopes, 8.5 x 11",
    "Unnamed: 17": 52.0566,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0.47000000000000003,
    "Unnamed: 20": -11.843400000000003,
    "Unnamed: 21": 10.98,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 8148,
    "Unnamed: 1": "MX-2013-129469",
    "Unnamed: 2": "2013-11-18 00:00:00",
    "Unnamed: 3": "2013-11-20 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "DB-13210",
    "Unnamed: 6": "Dean Braden",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "La Romana, La Romana",
    "Unnamed: 9": "Dominican Republic",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "Caribbean",
    "Unnamed: 13": "OFF-PA-10000591",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Paper",
    "Unnamed: 16": "Green Bar Cards & Envelopes, Multicolor",
    "Unnamed: 17": 79.68000000000002,
    "Unnamed: 18": 3,
    "Unnamed: 19": 0.2,
    "Unnamed: 20": -6.000000000000005,
    "Unnamed: 21": 13.812000000000001,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 23065,
    "Unnamed: 1": "IN-2014-15333",
    "Unnamed: 2": "2014-12-15 00:00:00",
    "Unnamed: 3": "2014-12-20 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "CC-12610",
    "Unnamed: 6": "Corey Catlett",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Melbourne, Victoria",
    "Unnamed: 9": "Australia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "FUR-CH-10004584",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Chairs",
    "Unnamed: 16": "Office Star Steel Folding Chair, Set of Two",
    "Unnamed: 17": 591.9480000000001,
    "Unnamed: 18": 7,
    "Unnamed: 19": 0.1,
    "Unnamed: 20": 216.88800000000003,
    "Unnamed: 21": 100.22,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 5385,
    "Unnamed: 1": "MX-2011-126907",
    "Unnamed: 2": "2011-11-15 00:00:00",
    "Unnamed: 3": "2011-11-20 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "SB-20170",
    "Unnamed: 6": "Sarah Bern",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Contramaestre, Santiago de Cuba",
    "Unnamed: 9": "Cuba",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "Caribbean",
    "Unnamed: 13": "TEC-PH-10002218",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Phones",
    "Unnamed: 16": "Apple Speaker Phone, Cordless",
    "Unnamed: 17": 168.20000000000002,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 6.720000000000001,
    "Unnamed: 21": 10.254000000000001,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 37657,
    "Unnamed: 1": "CA-2012-115693",
    "Unnamed: 2": "2012-12-10 00:00:00",
    "Unnamed: 3": "2012-12-15 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "FC-14245",
    "Unnamed: 6": "Frank Carlisle",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Los Angeles, California",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 90032,
    "Unnamed: 11": "US",
    "Unnamed: 12": "West",
    "Unnamed: 13": "OFF-AR-10003582",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Art",
    "Unnamed: 16": "Boston Electric Pencil Sharpener, Model 1818, Charcoal Black",
    "Unnamed: 17": 56.3,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 15.764000000000003,
    "Unnamed: 21": 4.99,
    "Unnamed: 22": "Medium"
  }
]
```

## Data Loading (Full Dataset)
Fetch the full dataset from the URLs under /data/... (Vite public folder) and parse it in the browser.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv

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
const rows = await loadCsv("/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_391/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[yr:Order Date:ok]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=50000, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__line
- chart_intent: `line_chart`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[tmn:Order Date:qk]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=593, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Sub-Category:nk] / [ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Product Name:nk])`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=593, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Profit:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=50000, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
