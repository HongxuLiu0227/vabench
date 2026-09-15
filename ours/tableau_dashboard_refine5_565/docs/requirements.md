# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_565/docs/syn_565_l2010_s121-1225.twb
Primary data URL: /data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv

## Sample Data (10 rows)
```json
[
  {
    "﻿Super Store Date set for the worldwide sales. ": 45684,
    "Unnamed: 1": "IZ-2012-1710",
    "Unnamed: 2": "2012-09-07 00:00:00",
    "Unnamed: 3": "2012-09-12 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "JM-6195",
    "Unnamed: 6": "Justin MacKendrick",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Baghdad, Baghdad",
    "Unnamed: 9": "Iraq",
    "Unnamed: 10": "",
    "Unnamed: 11": "EMEA",
    "Unnamed: 12": "EMEA",
    "Unnamed: 13": "FUR-BUS-10002040",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Bookcases",
    "Unnamed: 16": "Bush Library with Doors, Mobile",
    "Unnamed: 17": 366.84000000000003,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 117.35999999999999,
    "Unnamed: 21": 20.13,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 9555,
    "Unnamed: 1": "MX-2014-137141",
    "Unnamed: 2": "2014-03-13 00:00:00",
    "Unnamed: 3": "2014-03-15 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "SJ-20125",
    "Unnamed: 6": "Sanjit Jacobs",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Irapuato, Guanajuato",
    "Unnamed: 9": "Mexico",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "North",
    "Unnamed: 13": "FUR-CH-10001374",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Chairs",
    "Unnamed: 16": "Novimex Steel Folding Chair, Black",
    "Unnamed: 17": 127.67999999999998,
    "Unnamed: 18": 3,
    "Unnamed: 19": 0.2,
    "Unnamed: 20": 39.90000000000001,
    "Unnamed: 21": 26.767000000000003,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 21163,
    "Unnamed: 1": "IN-2013-42787",
    "Unnamed: 2": "2013-07-09 00:00:00",
    "Unnamed: 3": "2013-07-13 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "SS-20140",
    "Unnamed: 6": "Saphhira Shifley",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Hanoi, Thủ Dô Hà Nội",
    "Unnamed: 9": "Vietnam",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Southeast Asia",
    "Unnamed: 13": "OFF-PA-10003784",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Paper",
    "Unnamed: 16": "Eaton Note Cards, Premium",
    "Unnamed: 17": 46.4634,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0.17,
    "Unnamed: 20": 18.443399999999997,
    "Unnamed: 21": 2.75,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 38553,
    "Unnamed: 1": "CA-2013-152730",
    "Unnamed: 2": "2013-05-31 00:00:00",
    "Unnamed: 3": "2013-06-05 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "EM-14140",
    "Unnamed: 6": "Eugene Moren",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Superior, Wisconsin",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 54880,
    "Unnamed: 11": "US",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "OFF-AR-10003732",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Art",
    "Unnamed: 16": "Newell 333",
    "Unnamed: 17": 5.56,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 1.4455999999999998,
    "Unnamed: 21": 0.42,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 25109,
    "Unnamed: 1": "IN-2014-19673",
    "Unnamed: 2": "2014-03-21 00:00:00",
    "Unnamed: 3": "2014-03-24 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "NH-18610",
    "Unnamed: 6": "Nicole Hansen",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Thiruvananthapuram, Kerala",
    "Unnamed: 9": "India",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Central Asia",
    "Unnamed: 13": "OFF-EN-10002425",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Envelopes",
    "Unnamed: 16": "Ames Peel and Seal, Set of 50",
    "Unnamed: 17": 74.76,
    "Unnamed: 18": 4,
    "Unnamed: 19": 0,
    "Unnamed: 20": 2.16,
    "Unnamed: 21": 11.97,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 1556,
    "Unnamed: 1": "MX-2011-157679",
    "Unnamed: 2": "2011-10-20 00:00:00",
    "Unnamed: 3": "2011-10-24 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "BO-11350",
    "Unnamed: 6": "Bill Overfelt",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "San Salvador, San Salvador",
    "Unnamed: 9": "El Salvador",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "OFF-ST-10000718",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Storage",
    "Unnamed: 16": "Fellowes Folders, Single Width",
    "Unnamed: 17": 35.239999999999995,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 8.08,
    "Unnamed: 21": 2.977,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 30661,
    "Unnamed: 1": "IN-2012-81784",
    "Unnamed: 2": "2012-11-05 00:00:00",
    "Unnamed: 3": "2012-11-06 00:00:00",
    "Unnamed: 4": "Same Day",
    "Unnamed: 5": "MY-17380",
    "Unnamed: 6": "Maribeth Yedwab",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Waitakere, Auckland",
    "Unnamed: 9": "New Zealand",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "TEC-CO-10001864",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Copiers",
    "Unnamed: 16": "Brother Ink, High-Speed",
    "Unnamed: 17": 523.8,
    "Unnamed: 18": 6,
    "Unnamed: 19": 0.4,
    "Unnamed: 20": 34.91999999999996,
    "Unnamed: 21": 156.66,
    "Unnamed: 22": "Critical"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 23810,
    "Unnamed: 1": "IN-2012-75169",
    "Unnamed: 2": "2012-09-06 00:00:00",
    "Unnamed: 3": "2012-09-08 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "XP-21865",
    "Unnamed: 6": "Xylona Preis",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Mackay, Queensland",
    "Unnamed: 9": "Australia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "OFF-ST-10004871",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Storage",
    "Unnamed: 16": "Rogers Trays, Blue",
    "Unnamed: 17": 111.02399999999999,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0.1,
    "Unnamed: 20": 19.704,
    "Unnamed: 21": 11.98,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 38800,
    "Unnamed: 1": "US-2014-120117",
    "Unnamed: 2": "2014-03-31 00:00:00",
    "Unnamed: 3": "2014-03-31 00:00:00",
    "Unnamed: 4": "Same Day",
    "Unnamed: 5": "TB-21400",
    "Unnamed: 6": "Tom Boeckenhauer",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Los Angeles, California",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 90036,
    "Unnamed: 11": "US",
    "Unnamed: 12": "West",
    "Unnamed: 13": "TEC-PH-10002447",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Phones",
    "Unnamed: 16": "AT&T CL83451 4-Handset Telephone",
    "Unnamed: 17": 164.79200000000003,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0.2,
    "Unnamed: 20": 18.53909999999999,
    "Unnamed: 21": 28.8,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 30915,
    "Unnamed: 1": "IN-2013-80594",
    "Unnamed: 2": "2013-01-02 00:00:00",
    "Unnamed: 3": "2013-01-06 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "KA-16525",
    "Unnamed: 6": "Kelly Andreada",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Christchurch, Canterbury",
    "Unnamed: 9": "New Zealand",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "OFF-BI-10003768",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Binders",
    "Unnamed: 16": "Acco Index Tab, Clear",
    "Unnamed: 17": 32.16,
    "Unnamed: 18": 4,
    "Unnamed: 19": 0,
    "Unnamed: 20": 11.52,
    "Unnamed: 21": 1.9,
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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_565/docs/tableau_render_contract.json`
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
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[yr:Order Date:ok]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=50000, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__line
- chart_intent: `line_chart`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[tmn:Order Date:qk]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=800, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
