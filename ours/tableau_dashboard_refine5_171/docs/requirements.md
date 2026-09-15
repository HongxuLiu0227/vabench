# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_171/docs/syn_171_l2010_s121-9517-1225.twb
Primary data URL: /data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv

## Sample Data (10 rows)
```json
[
  {
    "﻿Super Store Date set for the worldwide sales. ": 31338,
    "Unnamed: 1": "CA-2014-120999",
    "Unnamed: 2": "2014-09-11 00:00:00",
    "Unnamed: 3": "2014-09-16 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "LC-16930",
    "Unnamed: 6": "Linda Cazamias",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Naperville, Illinois",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 60540,
    "Unnamed: 11": "US",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "TEC-PH-10004093",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Phones",
    "Unnamed: 16": "Panasonic Kx-TS550",
    "Unnamed: 17": 147.168,
    "Unnamed: 18": 4,
    "Unnamed: 19": 0.2,
    "Unnamed: 20": 16.556399999999996,
    "Unnamed: 21": 11.93,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 45976,
    "Unnamed: 1": "IZ-2011-7430",
    "Unnamed: 2": "2011-09-14 00:00:00",
    "Unnamed: 3": "2011-09-18 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "SC-10770",
    "Unnamed: 6": "Stewart Carmichael",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Basra, Al Basrah",
    "Unnamed: 9": "Iraq",
    "Unnamed: 10": "",
    "Unnamed: 11": "EMEA",
    "Unnamed: 12": "EMEA",
    "Unnamed: 13": "TEC-SHA-10003039",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Copiers",
    "Unnamed: 16": "Sharp Fax and Copier, Digital",
    "Unnamed: 17": 168.24,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 57.17999999999999,
    "Unnamed: 21": 27.33,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 26079,
    "Unnamed: 1": "IN-2013-18497",
    "Unnamed: 2": "2013-05-17 00:00:00",
    "Unnamed: 3": "2013-05-20 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "SH-19975",
    "Unnamed: 6": "Sally Hughsby",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Rockhampton, Queensland",
    "Unnamed: 9": "Australia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "OFF-SU-10003863",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Supplies",
    "Unnamed: 16": "Kleencut Letter Opener, High Speed",
    "Unnamed: 17": 190.512,
    "Unnamed: 18": 8,
    "Unnamed: 19": 0.1,
    "Unnamed: 20": 46.511999999999986,
    "Unnamed: 21": 41.21,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 30590,
    "Unnamed: 1": "ID-2012-82960",
    "Unnamed: 2": "2012-05-18 00:00:00",
    "Unnamed: 3": "2012-05-23 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "SC-20230",
    "Unnamed: 6": "Scot Coram",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Traralgon, Victoria",
    "Unnamed: 9": "Australia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "OFF-LA-10000959",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Labels",
    "Unnamed: 16": "Harbour Creations Round Labels, Alphabetical",
    "Unnamed: 17": 7.884,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0.4,
    "Unnamed: 20": -3.9960000000000004,
    "Unnamed: 21": 0.42,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 46190,
    "Unnamed: 1": "ZA-2014-7560",
    "Unnamed: 2": "2014-03-14 00:00:00",
    "Unnamed: 3": "2014-03-16 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "LS-6975",
    "Unnamed: 6": "Lindsay Shagiari",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Kitwe, Copperbelt",
    "Unnamed: 9": "Zambia",
    "Unnamed: 10": "",
    "Unnamed: 11": "Africa",
    "Unnamed: 12": "Africa",
    "Unnamed: 13": "OFF-WIL-10000390",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Binders",
    "Unnamed: 16": "Wilson Jones Binder, Durable",
    "Unnamed: 17": 29.04,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 1.1400000000000001,
    "Unnamed: 21": 4.49,
    "Unnamed: 22": "Critical"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 34630,
    "Unnamed: 1": "CA-2014-122595",
    "Unnamed: 2": "2014-12-15 00:00:00",
    "Unnamed: 3": "2014-12-21 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "GM-14455",
    "Unnamed: 6": "Gary Mitchum",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Chicago, Illinois",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 60653,
    "Unnamed: 11": "US",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "FUR-FU-10002963",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Furnishings",
    "Unnamed: 16": "Master Caster Door Stop, Gray",
    "Unnamed: 17": 2.032,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0.6,
    "Unnamed: 20": -1.3208000000000002,
    "Unnamed: 21": 0.1,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 2539,
    "Unnamed: 1": "MX-2013-168228",
    "Unnamed: 2": "2013-05-07 00:00:00",
    "Unnamed: 3": "2013-05-14 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "RD-19480",
    "Unnamed: 6": "Rick Duston",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Santiago, Santiago",
    "Unnamed: 9": "Chile",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "South",
    "Unnamed: 13": "TEC-MA-10002722",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Machines",
    "Unnamed: 16": "Epson Receipt Printer, Wireless",
    "Unnamed: 17": 156.04000000000002,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 57.720000000000006,
    "Unnamed: 21": 12.601,
    "Unnamed: 22": "Low"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 1589,
    "Unnamed: 1": "MX-2011-108875",
    "Unnamed: 2": "2011-12-28 00:00:00",
    "Unnamed: 3": "2011-12-30 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "BF-11005",
    "Unnamed: 6": "Barry Franz",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Diadema, São Paulo",
    "Unnamed: 9": "Brazil",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "South",
    "Unnamed: 13": "TEC-AC-10002170",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Accessories",
    "Unnamed: 16": "Enermax Numeric Keypad, USB",
    "Unnamed: 17": 73.52000000000001,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 13.2,
    "Unnamed: 21": 18.853,
    "Unnamed: 22": "Critical"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 12195,
    "Unnamed: 1": "ES-2012-3349892",
    "Unnamed: 2": "2012-09-01 00:00:00",
    "Unnamed: 3": "2012-09-05 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "KM-16375",
    "Unnamed: 6": "Katherine Murray",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Paris, Ile-de-France",
    "Unnamed: 9": "France",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "OFF-EN-10001852",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Envelopes",
    "Unnamed: 16": "Cameo Manila Envelope, with clear poly window",
    "Unnamed: 17": 61.08,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 29.880000000000003,
    "Unnamed: 21": 6.77,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 26523,
    "Unnamed: 1": "IN-2014-65243",
    "Unnamed: 2": "2014-12-04 00:00:00",
    "Unnamed: 3": "2014-12-06 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "BE-11455",
    "Unnamed: 6": "Brad Eason",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Moradabad, Uttar Pradesh",
    "Unnamed: 9": "India",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Central Asia",
    "Unnamed: 13": "FUR-CH-10001695",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Chairs",
    "Unnamed: 16": "Harbour Creations Chairmat, Set of Two",
    "Unnamed: 17": 148.50000000000003,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 1.44,
    "Unnamed: 21": 25.44,
    "Unnamed: 22": "High"
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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_171/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Profit:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=50000, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Sub-Category:nk] / [ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Product Name:nk])`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=800, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P121__line
- chart_intent: `line_chart`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[tmn:Order Date:qk]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=50000, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[yr:Order Date:ok]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=800, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
