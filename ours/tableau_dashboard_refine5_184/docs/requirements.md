# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard exactly as defined in the provided workbook XML.

## Tech Stack & Constraints
- **Framework:** React + TypeScript + Vite.
- **Visualization:** Use D3.js primitives (d3-scale, d3-shape, d3-axis, d3-array, d3-selection). Do not use high-level chart libraries like Recharts or Nivo.
- **Styling:** CSS Modules or Styled Components. Use CSS Grid for the main dashboard layout.
- **Data:** Fetch data from the provided URL. Use `d3-dsv` (or similar) to parse the CSV.

## Data Loading
The primary data source is located at: `/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv`

Implement a `useData` hook or similar utility to fetch and parse this CSV.

```typescript
// Example implementation logic
import { csv } from 'd3-fetch';
import { rollup, sum } from 'd3-array';

interface OrderRow {
  'Row ID': number;
  'Order ID': string;
  'Order Date': string;
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  'Segment': string;
  'City, State': string;
  'Country': string;
  'Postal Code': number;
  'Market': string;
  'Region': string;
  'Product ID': string;
  'Category': string;
  'Sub-Category': string;
  'Product Name': string;
  'Sales': number;
  'Quantity': number;
  'Discount': number;
  'Profit': number;
  'Shipping Cost': number;
  'Order Priority': string;
}

export const useData = () => {
  const [data, setData] = useState<OrderRow[] | null>(null);
  useEffect(() => {
    csv<OrderRow>('/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv').then(setData);
  }, []);
  return data;
};
```

## Dashboard Layout
The dashboard is named "Synthetic Dashboard 184".
- **Container:** Fixed aspect ratio or responsive container approximating 1000x800 units.
- **Grid Structure:** 2 Rows, 2 Columns.
  - **Row 1 (Top, ~62% height):**
    - **Col 1 (Left, ~50% width):** Worksheet `P121__scatterplot` (Scatterplot).
    - **Col 2 (Right, ~50% width):** Worksheet `P121__bar` (Bar).
  - **Row 2 (Bottom, ~38% height):**
    - **Col 1 (Spanning full width):** Worksheet `P2648__discount_overview_by_region` (Discount Overview by Region).
- **Styling:** White backgrounds, 4px-8px margins between zones.

## Component Specifications

### 1. Scatterplot (`P121__scatterplot`)
- **Title:** "Scatterplot"
- **Data Transformation:** Group raw data by `Product Name`. Aggregate `Sales` (Sum), `Profit` (Sum), `Quantity` (Sum).
- **Visual Encoding:**
  - **X-Axis:** `SUM(Sales)` (Linear scale).
  - **Y-Axis:** `SUM(Profit)` (Linear scale).
  - **Mark:** Circle.
  - **Size:** `SUM(Quantity)` (Radius scale).
  - **Color:** `SUM(Sales)` (Sequential color, Blue `#75a1c7`).
  - **Stroke:** Black (`#000000`).
- **Interactions:** Standard D3 tooltips showing Product Name, Sales, Profit, Quantity.

### 2. Bar Chart (`P121__bar`)
- **Title:** "Bar"
- **Data Transformation:** Group by `Category` and `Sub-Category`. Aggregate `Sales` (Sum).
- **Visual Encoding:**
  - **Y-Axis:** `Category` and `Sub-Category` (Hierarchical/Band scale). Sub-categories nested under Categories.
  - **X-Axis:** `SUM(Sales)` (Linear scale).
  - **Mark:** Bar (Horizontal).
  - **Color:** `SUM(Sales)` (Interpolated palette `blue_teal_10_0`).

### 3. Discount Overview by Region (`P2648__discount_overview_by_region`)
- **Title:** "Discount Overview by Region"
- **Data Transformation:** Group by `Region`. Calculate the following measures:
  - `AVG(Discount)`
  - `SUM(Profit)`
  - `SUM(Shipping Cost)`
  - `SUM(Quantity)`
  - `SUM(Sales)`
  - `COUNTD(Customer Name)` (Distinct count of customers)
- **Visual Encoding:**
  - **Y-Axis:** `Region` (Band scale).
  - **X-Axis:** Measure Values (Linear scale). This is a grouped bar chart where each Region has a cluster of bars, one for each measure listed above.
  - **Color:** `AVG(Discount)` (Diverging palette `orange_blue_diverging_10_0`, reversed, range 0.0 to 0.4). Note: The color is determined by the Discount value for that region, applied to all bars in that region's cluster.
  - **Labels:** Show data labels on bars (cull/hide if overlapping).
  - **Tooltip:** Custom tooltip showing "Region: <Region>" and "<Measure Name>: <Value>".

## Sample Data
```json
[
  {
    "﻿Super Store Date set for the worldwide sales. ": 24200,
    "Unnamed: 1": "IN-2011-61176",
    "Unnamed: 2": "2011-11-23 00:00:00",
    "Unnamed: 3": "2011-11-25 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "SC-20770",
    "Unnamed: 6": "Stewart Carmichael",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Kota, Chhattisgarh",
    "Unnamed: 9": "India",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Central Asia",
    "Unnamed: 13": "OFF-EN-10000383",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Envelopes",
    "Unnamed: 16": "Ames Clasp Envelope, Recycled",
    "Unnamed: 17": 30,
    "Unnamed: 18": 5,
    "Unnamed: 19": 0,
    "Unnamed: 20": 6.3,
    "Unnamed: 21": 3.46,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 19179,
    "Unnamed: 1": "ES-2011-3876549",
    "Unnamed: 2": "2011-06-06 00:00:00",
    "Unnamed: 3": "2011-06-08 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "SB-20185",
    "Unnamed: 6": "Sarah Brown",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Cologne, North Rhine-Westphalia",
    "Unnamed: 9": "Germany",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "OFF-LA-10003827",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Labels",
    "Unnamed: 16": "Avery Color Coded Labels, 5000 Label Set",
    "Unnamed: 17": 13.68,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 4.7700000000000005,
    "Unnamed: 21": 3.65,
    "Unnamed: 22": "Critical"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 39299,
    "Unnamed: 1": "CA-2012-110870",
    "Unnamed: 2": "2012-12-12 00:00:00",
    "Unnamed: 3": "2012-12-15 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "KD-16270",
    "Unnamed: 6": "Karen Daniels",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Los Angeles, California",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 90032,
    "Unnamed: 11": "US",
    "Unnamed: 12": "West",
    "Unnamed: 13": "OFF-SU-10001225",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Supplies",
    "Unnamed: 16": "Staples",
    "Unnamed: 17": 25.76,
    "Unnamed: 18": 7,
    "Unnamed: 19": 0,
    "Unnamed: 20": 0.5151999999999992,
    "Unnamed: 21": 4.91,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 48265,
    "Unnamed: 1": "EG-2014-2170",
    "Unnamed: 2": "2014-09-28 00:00:00",
    "Unnamed: 3": "2014-10-04 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "VF-11715",
    "Unnamed: 6": "Vicky Freymann",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Cairo, Al Qahirah",
    "Unnamed: 9": "Egypt",
    "Unnamed: 10": "",
    "Unnamed: 11": "Africa",
    "Unnamed: 12": "Africa",
    "Unnamed: 13": "OFF-SAN-10003318",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Paper",
    "Unnamed: 16": "SanDisk Memo Slips, Premium",
    "Unnamed: 17": 33.96,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 12.899999999999999,
    "Unnamed: 21": 2.16,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 43809,
    "Unnamed: 1": "EG-2013-8810",
    "Unnamed: 2": "2013-03-29 00:00:00",
    "Unnamed: 3": "2013-04-03 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "JK-6120",
    "Unnamed: 6": "Julie Kriz",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Cairo, Al Qahirah",
    "Unnamed: 9": "Egypt",
    "Unnamed: 10": "",
    "Unnamed: 11": "Africa",
    "Unnamed: 12": "Africa",
    "Unnamed: 13": "OFF-GRE-10002738",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Paper",
    "Unnamed: 16": "Green Bar Cards & Envelopes, Premium",
    "Unnamed: 17": 193.56000000000003,
    "Unnamed: 18": 4,
    "Unnamed: 19": 0,
    "Unnamed: 20": 60,
    "Unnamed: 21": 10.11,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 48245,
    "Unnamed: 1": "MO-2014-3260",
    "Unnamed: 2": "2014-01-08 00:00:00",
    "Unnamed: 3": "2014-01-13 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "AW-930",
    "Unnamed: 6": "Arthur Wiediger",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Agadir, Souss-Massa-Draâ",
    "Unnamed: 9": "Morocco",
    "Unnamed: 10": "",
    "Unnamed: 11": "Africa",
    "Unnamed: 12": "Africa",
    "Unnamed: 13": "OFF-WIL-10001889",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Binders",
    "Unnamed: 16": "Wilson Jones Hole Reinforcements, Economy",
    "Unnamed: 17": 4.530000000000001,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 2.25,
    "Unnamed: 21": 0.49,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 606,
    "Unnamed: 1": "MX-2014-125164",
    "Unnamed: 2": "2014-12-01 00:00:00",
    "Unnamed: 3": "2014-12-07 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "HA-14920",
    "Unnamed: 6": "Helen Andreada",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Villa Nueva, Guatemala",
    "Unnamed: 9": "Guatemala",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "OFF-SU-10004658",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Supplies",
    "Unnamed: 16": "Stiletto Letter Opener, Easy Grip",
    "Unnamed: 17": 40,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 9.6,
    "Unnamed: 21": 4.4479999999999995,
    "Unnamed: 22": "Low"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 45161,
    "Unnamed: 1": "CA-2012-2420",
    "Unnamed: 2": "2012-06-02 00:00:00",
    "Unnamed: 3": "2012-06-06 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "JL-5130",
    "Unnamed: 6": "Jack Lebron",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Oshawa, Ontario",
    "Unnamed: 9": "Canada",
    "Unnamed: 10": "",
    "Unnamed: 11": "Canada",
    "Unnamed: 12": "Canada",
    "Unnamed: 13": "OFF-BOS-10002073",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Art",
    "Unnamed: 16": "Boston Canvas, Water Color",
    "Unnamed: 17": 56.82000000000001,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 8.52,
    "Unnamed: 21": 7.44,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 16193,
    "Unnamed: 1": "ES-2012-4192199",
    "Unnamed: 2": "2012-06-26 00:00:00",
    "Unnamed: 3": "2012-06-26 00:00:00",
    "Unnamed: 4": "Same Day",
    "Unnamed: 5": "MC-17275",
    "Unnamed: 6": "Marc Crier",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Villiers-le-Bel, Ile-de-France",
    "Unnamed: 9": "France",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "OFF-LA-10000039",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Labels",
    "Unnamed: 16": "Smead Legal Exhibit Labels, Adjustable",
    "Unnamed: 17": 27,
    "Unnamed: 18": 3,
    "Unnamed: 19": 0,
    "Unnamed: 20": 3.7800000000000002,
    "Unnamed: 21": 8.74,
    "Unnamed: 22": "Critical"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 18649,
    "Unnamed: 1": "ES-2014-2379227",
    "Unnamed: 2": "2014-08-25 00:00:00",
    "Unnamed: 3": "2014-08-28 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "JB-15400",
    "Unnamed: 6": "Jennifer Braxton",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Dewsbury, England",
    "Unnamed: 9": "United Kingdom",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "North",
    "Unnamed: 13": "TEC-CO-10000270",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Copiers",
    "Unnamed: 16": "Hewlett Fax Machine, High-Speed",
    "Unnamed: 17": 954.36,
    "Unnamed: 18": 3,
    "Unnamed: 19": 0,
    "Unnamed: 20": 95.39999999999999,
    "Unnamed: 21": 73.57,
    "Unnamed: 22": "Medium"
  }
]
```

## Implementation Notes
- Ensure strict type safety for the data rows.
- Handle window resizing for the D3 charts (use `ResizeObserver` or `window.addEventListener('resize')`).
- Replicate the exact text for titles and axis labels found in the XML.
- Do not add extra filters or parameters not present in the workbook definition.

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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_184/docs/tableau_render_contract.json`
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
### Worksheet: P121__bar
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Category:nk] / [ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Sub-Category:nk])`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=50000, y=1000, w=49200, h=61750
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P2648__discount_overview_by_region
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Region:nk]`
- cols_field: `([ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[:Measure Names] * [ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[Multiple Values])`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[avg:Discount:qk]`
- zone: x=800, y=62750, w=98400, h=36250
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
