# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_201/docs/syn_201_l2010_s9517-121-1225.twb
Primary data URL: /data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv

## Sample Data (10 rows)
```json
[
  {
    "﻿Super Store Date set for the worldwide sales. ": 18184,
    "Unnamed: 1": "ES-2012-3376474",
    "Unnamed: 2": "2012-06-06 00:00:00",
    "Unnamed: 3": "2012-06-11 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "PR-18880",
    "Unnamed: 6": "Patrick Ryan",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Heidelberg, Baden-Württemberg",
    "Unnamed: 9": "Germany",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "OFF-AR-10000475",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Art",
    "Unnamed: 16": "Sanford Canvas, Blue",
    "Unnamed: 17": 151.56,
    "Unnamed: 18": 3,
    "Unnamed: 19": 0,
    "Unnamed: 20": 43.92,
    "Unnamed: 21": 19.15,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 48608,
    "Unnamed: 1": "BN-2012-6200",
    "Unnamed: 2": "2012-06-29 00:00:00",
    "Unnamed: 3": "2012-07-03 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "CC-2670",
    "Unnamed: 6": "Craig Carreira",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Lokossa, Mono",
    "Unnamed: 9": "Benin",
    "Unnamed: 10": "",
    "Unnamed: 11": "Africa",
    "Unnamed: 12": "Africa",
    "Unnamed: 13": "OFF-AME-10002557",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Envelopes",
    "Unnamed: 16": "Ames Business Envelopes, Recycled",
    "Unnamed: 17": 17.040000000000003,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 4.26,
    "Unnamed: 21": 0.92,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 22148,
    "Unnamed: 1": "IN-2014-52846",
    "Unnamed: 2": "2014-04-18 00:00:00",
    "Unnamed: 3": "2014-04-22 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "DK-12985",
    "Unnamed: 6": "Darren Koutras",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Ho Chi Minh City, Ho Chí Minh City",
    "Unnamed: 9": "Vietnam",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Southeast Asia",
    "Unnamed: 13": "OFF-AP-10000904",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Appliances",
    "Unnamed: 16": "Cuisinart Coffee Grinder, Silver",
    "Unnamed: 17": 32.6688,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0.17,
    "Unnamed: 20": 1.9488000000000003,
    "Unnamed: 21": 1.99,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 40089,
    "Unnamed: 1": "CA-2011-162992",
    "Unnamed: 2": "2011-12-19 00:00:00",
    "Unnamed: 3": "2011-12-21 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "BP-11095",
    "Unnamed: 6": "Bart Pistole",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Los Angeles, California",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 90008,
    "Unnamed: 11": "US",
    "Unnamed: 12": "West",
    "Unnamed: 13": "OFF-LA-10001934",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Labels",
    "Unnamed: 16": "Avery 516",
    "Unnamed: 17": 14.62,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 6.8713999999999995,
    "Unnamed: 21": 1.2,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 47659,
    "Unnamed: 1": "CA-2013-7580",
    "Unnamed: 2": "2013-06-03 00:00:00",
    "Unnamed: 3": "2013-06-08 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "LP-7095",
    "Unnamed: 6": "Liz Preis",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "St. Catharines, Ontario",
    "Unnamed: 9": "Canada",
    "Unnamed: 10": "",
    "Unnamed: 11": "Canada",
    "Unnamed: 12": "Canada",
    "Unnamed: 13": "OFF-TEN-10003948",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Storage",
    "Unnamed: 16": "Tenex Box, Blue",
    "Unnamed: 17": 132,
    "Unnamed: 18": 8,
    "Unnamed: 19": 0,
    "Unnamed: 20": 32.88,
    "Unnamed: 21": 9.39,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 1184,
    "Unnamed: 1": "MX-2014-167493",
    "Unnamed: 2": "2014-11-13 00:00:00",
    "Unnamed: 3": "2014-11-17 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "MY-18295",
    "Unnamed: 6": "Muhammed Yedwab",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Poza Rica de Hidalgo, Veracruz",
    "Unnamed: 9": "Mexico",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "North",
    "Unnamed: 13": "OFF-LA-10000779",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Labels",
    "Unnamed: 16": "Hon Removable Labels, Laser Printer Compatible",
    "Unnamed: 17": 26.880000000000003,
    "Unnamed: 18": 4,
    "Unnamed: 19": 0,
    "Unnamed: 20": 4,
    "Unnamed: 21": 1.964,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 33334,
    "Unnamed: 1": "CA-2012-119214",
    "Unnamed: 2": "2012-01-23 00:00:00",
    "Unnamed: 3": "2012-01-27 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "CW-11905",
    "Unnamed: 6": "Carl Weiss",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Bozeman, Montana",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 59715,
    "Unnamed: 11": "US",
    "Unnamed: 12": "West",
    "Unnamed: 13": "OFF-LA-10003077",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Labels",
    "Unnamed: 16": "Avery 500",
    "Unnamed: 17": 14.62,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 6.8713999999999995,
    "Unnamed: 21": 0.37,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 34501,
    "Unnamed: 1": "CA-2011-158372",
    "Unnamed: 2": "2011-11-10 00:00:00",
    "Unnamed: 3": "2011-11-16 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "RD-19900",
    "Unnamed: 6": "Ruben Dartt",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "San Diego, California",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 92037,
    "Unnamed: 11": "US",
    "Unnamed: 12": "West",
    "Unnamed: 13": "FUR-FU-10000397",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Furnishings",
    "Unnamed: 16": "Luxo Economy Swing Arm Lamp",
    "Unnamed: 17": 39.88,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 11.166400000000003,
    "Unnamed: 21": 5.81,
    "Unnamed: 22": "Low"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 30314,
    "Unnamed: 1": "IN-2014-81154",
    "Unnamed: 2": "2014-09-19 00:00:00",
    "Unnamed: 3": "2014-09-19 00:00:00",
    "Unnamed: 4": "Same Day",
    "Unnamed: 5": "NL-18310",
    "Unnamed: 6": "Nancy Lomonaco",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Christchurch, Canterbury",
    "Unnamed: 9": "New Zealand",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "OFF-EN-10000975",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Envelopes",
    "Unnamed: 16": "Ames Manila Envelope, Set of 50",
    "Unnamed: 17": 148.14000000000001,
    "Unnamed: 18": 6,
    "Unnamed: 19": 0,
    "Unnamed: 20": 20.7,
    "Unnamed: 21": 33.62,
    "Unnamed: 22": "Critical"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 40338,
    "Unnamed: 1": "CA-2011-114335",
    "Unnamed: 2": "2011-09-28 00:00:00",
    "Unnamed: 3": "2011-10-03 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "XP-21865",
    "Unnamed: 6": "Xylona Preis",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Hollywood, Florida",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 33021,
    "Unnamed: 11": "US",
    "Unnamed: 12": "South",
    "Unnamed: 13": "FUR-FU-10000277",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Furnishings",
    "Unnamed: 16": "Deflect-o DuraMat Antistatic Studded Beveled Mat for Medium Pile Carpeting",
    "Unnamed: 17": 337.088,
    "Unnamed: 18": 4,
    "Unnamed: 19": 0.2,
    "Unnamed: 20": 16.854399999999984,
    "Unnamed: 21": 24.95,
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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_201/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Sub-Category:nk] / [ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Product Name:nk])`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=50000, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P121__bar
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Category:nk] / [ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Sub-Category:nk])`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=800, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Profit:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
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
