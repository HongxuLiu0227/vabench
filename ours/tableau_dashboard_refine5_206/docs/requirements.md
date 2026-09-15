# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_206/docs/syn_206_l1225_s121-9517-1225.twb
Primary data URL: /data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv

## Sample Data (10 rows)
```json
[
  {
    "﻿Super Store Date set for the worldwide sales. ": 37906,
    "Unnamed: 1": "US-2012-118906",
    "Unnamed: 2": "2012-03-10 00:00:00",
    "Unnamed: 3": "2012-03-10 00:00:00",
    "Unnamed: 4": "Same Day",
    "Unnamed: 5": "KB-16585",
    "Unnamed: 6": "Ken Black",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Clinton, Maryland",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 20735,
    "Unnamed: 11": "US",
    "Unnamed: 12": "East",
    "Unnamed: 13": "OFF-ST-10002406",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Storage",
    "Unnamed: 16": "Pizazz Global Quick File",
    "Unnamed: 17": 89.82000000000001,
    "Unnamed: 18": 6,
    "Unnamed: 19": 0,
    "Unnamed: 20": 25.149600000000007,
    "Unnamed: 21": 16.73,
    "Unnamed: 22": "Critical"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 32374,
    "Unnamed: 1": "CA-2014-132521",
    "Unnamed: 2": "2014-09-24 00:00:00",
    "Unnamed: 3": "2014-09-26 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "DW-13540",
    "Unnamed: 6": "Don Weiss",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Seattle, Washington",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 98105,
    "Unnamed: 11": "US",
    "Unnamed: 12": "West",
    "Unnamed: 13": "OFF-AP-10002191",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Appliances",
    "Unnamed: 16": "Belkin 8 Outlet SurgeMaster II Gold Surge Protector",
    "Unnamed: 17": 119.96,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 33.588800000000006,
    "Unnamed: 21": 29.5,
    "Unnamed: 22": "Critical"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 25591,
    "Unnamed: 1": "IN-2011-14983",
    "Unnamed: 2": "2011-10-10 00:00:00",
    "Unnamed: 3": "2011-10-16 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "GH-14485",
    "Unnamed: 6": "Gene Hale",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Visakhapatnam, Andhra Pradesh",
    "Unnamed: 9": "India",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Central Asia",
    "Unnamed: 13": "OFF-EN-10004173",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Envelopes",
    "Unnamed: 16": "Ames Peel and Seal, Recycled",
    "Unnamed: 17": 87.45000000000002,
    "Unnamed: 18": 5,
    "Unnamed: 19": 0,
    "Unnamed: 20": 19.2,
    "Unnamed: 21": 3.95,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 15133,
    "Unnamed: 1": "ES-2014-5345830",
    "Unnamed: 2": "2014-01-14 00:00:00",
    "Unnamed: 3": "2014-01-16 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "MG-17695",
    "Unnamed: 6": "Maureen Gnade",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Turin, Piedmont",
    "Unnamed: 9": "Italy",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "South",
    "Unnamed: 13": "OFF-PA-10001294",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Paper",
    "Unnamed: 16": "Enermax Cards & Envelopes, Multicolor",
    "Unnamed: 17": 97.02000000000001,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 13.559999999999999,
    "Unnamed: 21": 22.44,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 29269,
    "Unnamed: 1": "IN-2014-37320",
    "Unnamed: 2": "2014-11-11 00:00:00",
    "Unnamed: 3": "2014-11-15 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "BF-11005",
    "Unnamed: 6": "Barry Franz",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Gorakhpur, Haryana",
    "Unnamed: 9": "India",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Central Asia",
    "Unnamed: 13": "OFF-AP-10002244",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Appliances",
    "Unnamed: 16": "Breville Refrigerator, White",
    "Unnamed: 17": 3622.2899999999995,
    "Unnamed: 18": 7,
    "Unnamed: 19": 0,
    "Unnamed: 20": 1267.77,
    "Unnamed: 21": 438.89,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 34869,
    "Unnamed: 1": "US-2014-126081",
    "Unnamed: 2": "2014-06-30 00:00:00",
    "Unnamed: 3": "2014-07-05 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "FC-14335",
    "Unnamed: 6": "Fred Chung",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Mesquite, Texas",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 75150,
    "Unnamed: 11": "US",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "OFF-PA-10003953",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Paper",
    "Unnamed: 16": "Xerox 218",
    "Unnamed: 17": 5.184000000000001,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0.2,
    "Unnamed: 20": 1.8144,
    "Unnamed: 21": 0.22,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 21813,
    "Unnamed: 1": "ID-2014-54687",
    "Unnamed: 2": "2014-11-06 00:00:00",
    "Unnamed: 3": "2014-11-08 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "CS-12130",
    "Unnamed: 6": "Chad Sievert",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Geelong, Victoria",
    "Unnamed: 9": "Australia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "FUR-BO-10004161",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Bookcases",
    "Unnamed: 16": "Bush Corner Shelving, Mobile",
    "Unnamed: 17": 341.577,
    "Unnamed: 18": 3,
    "Unnamed: 19": 0.1,
    "Unnamed: 20": -30.393,
    "Unnamed: 21": 40.65,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 3541,
    "Unnamed: 1": "MX-2014-158946",
    "Unnamed: 2": "2014-09-01 00:00:00",
    "Unnamed: 3": "2014-09-03 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "DV-13045",
    "Unnamed: 6": "Darrin Van Huff",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Caxias do Sul, Rio Grande do Sul",
    "Unnamed: 9": "Brazil",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "South",
    "Unnamed: 13": "OFF-FA-10003058",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Fasteners",
    "Unnamed: 16": "Stockwell Rubber Bands, Assorted Sizes",
    "Unnamed: 17": 9.059999999999999,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 0.44000000000000006,
    "Unnamed: 21": 0.735,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 25470,
    "Unnamed: 1": "IN-2012-46903",
    "Unnamed: 2": "2012-06-22 00:00:00",
    "Unnamed: 3": "2012-06-27 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "JG-15310",
    "Unnamed: 6": "Jason Gross",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Bihar Sharif, Bihar",
    "Unnamed: 9": "India",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Central Asia",
    "Unnamed: 13": "TEC-PH-10002104",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Phones",
    "Unnamed: 16": "Cisco Speaker Phone, Cordless",
    "Unnamed: 17": 565.3199999999999,
    "Unnamed: 18": 4,
    "Unnamed: 19": 0,
    "Unnamed: 20": 163.92000000000002,
    "Unnamed: 21": 62.11,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 41641,
    "Unnamed: 1": "MO-2012-7520",
    "Unnamed: 2": "2012-03-23 00:00:00",
    "Unnamed: 3": "2012-03-27 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "NR-8550",
    "Unnamed: 6": "Nick Radford",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Tangier, Tanger-Tétouan",
    "Unnamed: 9": "Morocco",
    "Unnamed: 10": "",
    "Unnamed: 11": "Africa",
    "Unnamed: 12": "Africa",
    "Unnamed: 13": "OFF-JIF-10000890",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Envelopes",
    "Unnamed: 16": "Jiffy Peel and Seal, Security-Tint",
    "Unnamed: 17": 22.41,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 2.46,
    "Unnamed: 21": 1.8,
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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_206/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P121__line
- chart_intent: `line_chart`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[tmn:Order Date:qk]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=50000, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Sub-Category:nk] / [ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Product Name:nk])`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=593, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[yr:Order Date:ok]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=593, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Profit:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=50000, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
