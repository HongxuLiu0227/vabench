# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_196/docs/syn_196_l121_s121-1225.twb
Primary data URL: /data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv

## Sample Data (10 rows)
```json
[
  {
    "﻿Super Store Date set for the worldwide sales. ": 25791,
    "Unnamed: 1": "IN-2012-11217",
    "Unnamed: 2": "2012-08-07 00:00:00",
    "Unnamed: 3": "2012-08-09 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "DK-12985",
    "Unnamed: 6": "Darren Koutras",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Medan, Sumatera Utara",
    "Unnamed: 9": "Indonesia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Southeast Asia",
    "Unnamed: 13": "TEC-PH-10001321",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Phones",
    "Unnamed: 16": "Cisco Speaker Phone, Full Size",
    "Unnamed: 17": 348.0272999999999,
    "Unnamed: 18": 3,
    "Unnamed: 19": 0.17,
    "Unnamed: 20": 16.737299999999976,
    "Unnamed: 21": 24.6,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 9695,
    "Unnamed: 1": "US-2012-117982",
    "Unnamed: 2": "2012-11-10 00:00:00",
    "Unnamed: 3": "2012-11-13 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "KH-16630",
    "Unnamed: 6": "Ken Heidel",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Tepic, Nayarit",
    "Unnamed: 9": "Mexico",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "North",
    "Unnamed: 13": "TEC-CO-10002113",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Copiers",
    "Unnamed: 16": "Canon Ink, Digital",
    "Unnamed: 17": 1171.97136,
    "Unnamed: 18": 12,
    "Unnamed: 19": 0.002,
    "Unnamed: 20": 361.49136,
    "Unnamed: 21": 16.369999999999997,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 38238,
    "Unnamed: 1": "CA-2014-107132",
    "Unnamed: 2": "2014-06-27 00:00:00",
    "Unnamed: 3": "2014-07-01 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "SC-20260",
    "Unnamed: 6": "Scott Cohen",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "New York City, New York",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 10009,
    "Unnamed: 11": "US",
    "Unnamed: 12": "East",
    "Unnamed: 13": "OFF-ST-10001490",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Storage",
    "Unnamed: 16": "Hot File 7-Pocket, Floor Stand",
    "Unnamed: 17": 713.88,
    "Unnamed: 18": 4,
    "Unnamed: 19": 0,
    "Unnamed: 20": 214.16399999999993,
    "Unnamed: 21": 26.44,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 46992,
    "Unnamed: 1": "CA-2011-8330",
    "Unnamed: 2": "2011-06-22 00:00:00",
    "Unnamed: 3": "2011-06-26 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "ML-7755",
    "Unnamed: 6": "Max Ludwig",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Calgary, Alberta",
    "Unnamed: 9": "Canada",
    "Unnamed: 10": "",
    "Unnamed: 11": "Canada",
    "Unnamed: 12": "Canada",
    "Unnamed: 13": "OFF-IBI-10000684",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Binders",
    "Unnamed: 16": "Ibico Binding Machine, Clear",
    "Unnamed: 17": 50.88,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 23.4,
    "Unnamed: 21": 1.87,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 20147,
    "Unnamed: 1": "ES-2012-2217716",
    "Unnamed: 2": "2012-10-24 00:00:00",
    "Unnamed: 3": "2012-10-26 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "JK-15325",
    "Unnamed: 6": "Jason Klamczynski",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Vittoria, Sicily",
    "Unnamed: 9": "Italy",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "South",
    "Unnamed: 13": "OFF-BI-10004446",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Binders",
    "Unnamed: 16": "Acco Binding Machine, Economy",
    "Unnamed: 17": 255.45000000000002,
    "Unnamed: 18": 5,
    "Unnamed: 19": 0,
    "Unnamed: 20": 73.94999999999999,
    "Unnamed: 21": 22.73,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 40888,
    "Unnamed: 1": "US-2013-105452",
    "Unnamed: 2": "2013-07-29 00:00:00",
    "Unnamed: 3": "2013-08-02 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "BF-11005",
    "Unnamed: 6": "Barry Franz",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Pasadena, Texas",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 77506,
    "Unnamed: 11": "US",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "FUR-FU-10003691",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Furnishings",
    "Unnamed: 16": "Eldon Image Series Desk Accessories, Ebony",
    "Unnamed: 17": 24.700000000000003,
    "Unnamed: 18": 5,
    "Unnamed: 19": 0.6,
    "Unnamed: 20": -9.879999999999995,
    "Unnamed: 21": 2.99,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 18961,
    "Unnamed: 1": "IT-2011-2668777",
    "Unnamed: 2": "2011-09-03 00:00:00",
    "Unnamed: 3": "2011-09-07 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "EM-13960",
    "Unnamed: 6": "Eric Murdock",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Gothenburg, Västra Götaland",
    "Unnamed: 9": "Sweden",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "North",
    "Unnamed: 13": "TEC-CO-10004976",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Copiers",
    "Unnamed: 16": "Brother Ink, High-Speed",
    "Unnamed: 17": 145.5,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0.5,
    "Unnamed: 20": -128.04,
    "Unnamed: 21": 22.36,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 31115,
    "Unnamed: 1": "IN-2013-82617",
    "Unnamed: 2": "2013-12-20 00:00:00",
    "Unnamed: 3": "2013-12-22 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "CM-12385",
    "Unnamed: 6": "Christopher Martinez",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Murray Bridge, South Australia",
    "Unnamed: 9": "Australia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "OFF-BI-10003342",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Binders",
    "Unnamed: 16": "Cardinal Binder, Economy",
    "Unnamed: 17": 55.31999999999999,
    "Unnamed: 18": 4,
    "Unnamed: 19": 0,
    "Unnamed: 20": 13.200000000000001,
    "Unnamed: 21": 15.54,
    "Unnamed: 22": "Critical"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 31601,
    "Unnamed: 1": "CA-2012-144253",
    "Unnamed: 2": "2012-05-04 00:00:00",
    "Unnamed: 3": "2012-05-09 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "AS-10225",
    "Unnamed: 6": "Alan Schoenberger",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "New York City, New York",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 10024,
    "Unnamed: 11": "US",
    "Unnamed: 12": "East",
    "Unnamed: 13": "FUR-FU-10002671",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Furnishings",
    "Unnamed: 16": "Electrix 20W Halogen Replacement Bulb for Zoom-In Desk Lamp",
    "Unnamed: 17": 26.8,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 12.863999999999999,
    "Unnamed: 21": 2.01,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 2973,
    "Unnamed: 1": "MX-2014-141229",
    "Unnamed: 2": "2014-11-20 00:00:00",
    "Unnamed: 3": "2014-11-21 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "HR-14770",
    "Unnamed: 6": "Hallie Redmond",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Orizaba, Veracruz",
    "Unnamed: 9": "Mexico",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "North",
    "Unnamed: 13": "OFF-BI-10002080",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Binders",
    "Unnamed: 16": "Acco Binder, Clear",
    "Unnamed: 17": 9.74,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 3.5,
    "Unnamed: 21": 1.782,
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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_196/docs/tableau_render_contract.json`
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
- zone: x=800, y=1000, w=49200, h=61748
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__line
- chart_intent: `line_chart`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[tmn:Order Date:qk]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=50000, y=1000, w=49200, h=61750
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[yr:Order Date:ok]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=800, y=62750, w=98400, h=36250
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
