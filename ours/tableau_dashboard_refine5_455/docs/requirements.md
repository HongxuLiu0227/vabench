# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard exactly as defined in the provided XML.

## Tech Stack & Constraints
- **Framework**: React + TypeScript + Vite.
- **Visualization**: Use D3.js primitives (d3-scale, d3-shape, d3-axis, d3-array, d3-selection). Do not use high-level chart libraries like Recharts or Nivo.
- **UI Components**: Use standard HTML/CSS. Do not use Ant Design or similar heavy component libraries.
- **Styling**: CSS Modules or Styled Components. Ensure the layout matches the Tableau dashboard dimensions (1000x800) and structure.

## Data Loading

The application must load data from the following URL:
`/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv`

**Implementation Steps:**
1. Create a utility function `loadData` using the native `fetch` API.
2. Parse the CSV text using `d3-dsv` (specifically `d3.csvParse`).
3. Type the parsed data using the interface below.

**TypeScript Interface:**
```typescript
interface OrderRecord {
  "Row ID": number;
  "Order ID": string;
  "Order Date": Date; // Parse from string
  "Ship Date": Date;  // Parse from string
  "Ship Mode": string;
  "Customer ID": string;
  "Customer Name": string;
  "Segment": string;
  "City, State": string;
  "Country": string;
  "Postal Code": number;
  "Market": string;
  "Region": string;
  "Product ID": string;
  "Category": string;
  "Sub-Category": string;
  "Product Name": string;
  "Sales": number;
  "Quantity": number;
  "Discount": number;
  "Profit": number;
  "Shipping Cost": number;
  "Order Priority": string;
}
```

**Data Transformation:**
You will need to aggregate the raw data for each visualization. Use `d3.rollup` or `Array.reduce`.

## Dashboard Layout

The dashboard is named "Synthetic Dashboard 455".
- **Container Size**: Fixed width of 1000px and height of 800px.
- **Grid Structure**: A 2x2 grid.
  - **Top Left**: Worksheet "Bar" (P121__bar)
  - **Top Right**: Worksheet "Scatterplot" (P121__scatterplot)
  - **Bottom Left**: Worksheet "Total Sales Each Year" (P1225__total_sales_each_year)
  - **Bottom Right**: Worksheet "Customer Overview" (P1968__customer_overview)
- **Margins**: Apply a margin of 8px around the outer container and 4px between the grid items.

## Component Specifications

### 1. Scatterplot (P121__scatterplot)
- **Title**: "Scatterplot"
- **Data Preparation**: Group by `Product Name`. Calculate `SUM(Sales)`, `SUM(Profit)`, and `SUM(Quantity)` for each product.
- **Visual Encoding**:
  - **X-Axis**: `SUM(Sales)` (Linear Scale).
  - **Y-Axis**: `SUM(Profit)` (Linear Scale).
  - **Mark**: Circle.
  - **Size**: `SUM(Quantity)` (Radius scale, likely square root scale).
  - **Color**: `SUM(Sales)` (Sequential color scale, default blue/teal range).
  - **Style**: Stroke color `#000000` (black), fill color based on Sales.
- **Interactions**: Standard D3 tooltips showing Product Name, Sales, Profit, and Quantity on hover.

### 2. Bar Chart - Category/Sub-Category (P121__bar)
- **Title**: "Bar"
- **Data Preparation**: Group by `Category` and `Sub-Category`. Calculate `SUM(Sales)`.
- **Visual Encoding**:
  - **X-Axis**: `SUM(Sales)` (Linear Scale).
  - **Y-Axis**: Hierarchy of `Category` and `Sub-Category` (Band Scale). The XML indicates a nested structure `Category / Sub-Category`.
  - **Mark**: Bar.
  - **Color**: `SUM(Sales)` (Interpolated palette "blue_teal_10_0").

### 3. Bar Chart - Total Sales Each Year (P1225__total_sales_each_year)
- **Title**: "Total Sales Each Year"
- **Data Preparation**: Group by `YEAR(Order Date)`. Calculate `SUM(Sales)`.
- **Visual Encoding**:
  - **X-Axis**: `YEAR(Order Date)` (Band Scale).
  - **Y-Axis**: `SUM(Sales)` (Linear Scale).
  - **Mark**: Bar.
  - **Color**: `SUM(Sales)` (Interpolated color).
  - **Labels**: Display the Sales value on top of (or inside) the bars.

### 4. Customer Overview (P1968__customer_overview)
- **Title**: "Customer Overview"
- **Data Preparation**: Group by `Region`. Calculate:
  - `CountD(Customer Name)` -> "Number of Customers"
  - `SUM(Sales)`
  - `SUM(Quantity)`
  - `SUM(Profit)`
  - `Profit Ratio` = `SUM(Profit) / SUM(Sales)` (Handle division by zero).
- **Visual Encoding**:
  - **Layout**: A table (HTML `<table>` or SVG text).
  - **Rows**: `Region`.
  - **Columns**: The metrics listed above.
  - **Color Encoding**: The background color (or text color) of the cells should correspond to the "Profit Ratio".
    - **Scale**: Diverging color scale (e.g., Red to Green or Orange to Blue) centered at 0.
    - **Domain**: -0.5 to 0.5 (as specified in XML `min="-0.5" max="0.5"`).
- **Tooltip**: Custom tooltip matching the XML definition:
  - Region (Bold)
  - Number of Customers
  - Measure Name / Value
  - Profit
  - Quantity
  - Sales
  - Profit Ratio

## Sample Data

```json
[
  {
    "﻿Super Store Date set for the worldwide sales. ": 10194,
    "Unnamed: 1": "US-2013-165785",
    "Unnamed: 2": "2013-11-15 00:00:00",
    "Unnamed: 3": "2013-11-19 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "RS-19870",
    "Unnamed: 6": "Roy Skaria",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "São Miguel dos Campos, Alagoas",
    "Unnamed: 9": "Brazil",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "South",
    "Unnamed: 13": "OFF-SU-10004799",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Supplies",
    "Unnamed: 16": "Elite Ruler, Steel",
    "Unnamed: 17": 31.68,
    "Unnamed: 18": 9,
    "Unnamed: 19": 0.6,
    "Unnamed: 20": -30.24,
    "Unnamed: 21": 1.2289999999999999,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 39266,
    "Unnamed: 1": "CA-2013-157707",
    "Unnamed: 2": "2013-10-11 00:00:00",
    "Unnamed: 3": "2013-10-13 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "CC-12610",
    "Unnamed: 6": "Corey Catlett",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Denver, Colorado",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 80219,
    "Unnamed: 11": "US",
    "Unnamed: 12": "West",
    "Unnamed: 13": "FUR-CH-10004853",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Chairs",
    "Unnamed: 16": "Global Manager's Adjustable Task Chair, Storm",
    "Unnamed: 17": 120.78399999999999,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0.2,
    "Unnamed: 20": 13.588199999999986,
    "Unnamed: 21": 15.39,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 21131,
    "Unnamed: 1": "IN-2013-22648",
    "Unnamed: 2": "2013-05-14 00:00:00",
    "Unnamed: 3": "2013-05-20 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "SF-20065",
    "Unnamed: 6": "Sandra Flanagan",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Ratlam, Madhya Pradesh",
    "Unnamed: 9": "India",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Central Asia",
    "Unnamed: 13": "OFF-ST-10000327",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Storage",
    "Unnamed: 16": "Smead Folders, Wire Frame",
    "Unnamed: 17": 33.12,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 4.62,
    "Unnamed: 21": 0.91,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 21474,
    "Unnamed: 1": "IN-2013-79831",
    "Unnamed: 2": "2013-11-30 00:00:00",
    "Unnamed: 3": "2013-12-06 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "CS-12175",
    "Unnamed: 6": "Charles Sheldon",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Quanzhou, Fujian",
    "Unnamed: 9": "China",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "North Asia",
    "Unnamed: 13": "OFF-BI-10000340",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Binders",
    "Unnamed: 16": "Avery Binding Machine, Clear",
    "Unnamed: 17": 96.60000000000001,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 9.66,
    "Unnamed: 21": 6.2,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 14680,
    "Unnamed: 1": "IT-2012-2308326",
    "Unnamed: 2": "2012-09-28 00:00:00",
    "Unnamed: 3": "2012-09-28 00:00:00",
    "Unnamed: 4": "Same Day",
    "Unnamed: 5": "SJ-20500",
    "Unnamed: 6": "Shirley Jackson",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Neuilly-Plaisance, Ile-de-France",
    "Unnamed: 9": "France",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "OFF-SU-10000776",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Supplies",
    "Unnamed: 16": "Elite Letter Opener, Steel",
    "Unnamed: 17": 71.99999999999999,
    "Unnamed: 18": 3,
    "Unnamed: 19": 0,
    "Unnamed: 20": 10.080000000000002,
    "Unnamed: 21": 9.61,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 25737,
    "Unnamed: 1": "IN-2014-34450",
    "Unnamed: 2": "2014-10-31 00:00:00",
    "Unnamed: 3": "2014-11-04 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "HG-14965",
    "Unnamed: 6": "Henry Goldwyn",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Liaoyang, Liaoning",
    "Unnamed: 9": "China",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "North Asia",
    "Unnamed: 13": "FUR-CH-10002631",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Chairs",
    "Unnamed: 16": "Office Star Bag Chairs, Black",
    "Unnamed: 17": 371.06999999999994,
    "Unnamed: 18": 7,
    "Unnamed: 19": 0,
    "Unnamed: 20": 33.39,
    "Unnamed: 21": 55.12,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 30119,
    "Unnamed: 1": "ID-2013-67693",
    "Unnamed: 2": "2013-10-31 00:00:00",
    "Unnamed: 3": "2013-11-05 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "CS-11950",
    "Unnamed: 6": "Carlos Soltero",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Xianning, Hubei",
    "Unnamed: 9": "China",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "North Asia",
    "Unnamed: 13": "TEC-AC-10001312",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Accessories",
    "Unnamed: 16": "Logitech Numeric Keypad, Erganomic",
    "Unnamed: 17": 220.65,
    "Unnamed: 18": 5,
    "Unnamed: 19": 0,
    "Unnamed: 20": 70.5,
    "Unnamed: 21": 26.2,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 19859,
    "Unnamed: 1": "IT-2013-1083916",
    "Unnamed: 2": "2013-02-27 00:00:00",
    "Unnamed: 3": "2013-03-04 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "TS-21655",
    "Unnamed: 6": "Trudy Schmidt",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Stuttgart, Baden-Württemberg",
    "Unnamed: 9": "Germany",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "OFF-ST-10004046",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Storage",
    "Unnamed: 16": "Fellowes Box, Single Width",
    "Unnamed: 17": 35.478,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0.1,
    "Unnamed: 20": -1.6020000000000003,
    "Unnamed: 21": 2.31,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 11953,
    "Unnamed: 1": "IT-2011-4685233",
    "Unnamed: 2": "2011-07-28 00:00:00",
    "Unnamed: 3": "2011-08-01 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "SG-20605",
    "Unnamed: 6": "Speros Goranitis",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "The Hague, South Holland",
    "Unnamed: 9": "Netherlands",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "FUR-BO-10000684",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Bookcases",
    "Unnamed: 16": "Sauder Corner Shelving, Traditional",
    "Unnamed: 17": 73.65,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0.5,
    "Unnamed: 20": -63.36000000000001,
    "Unnamed: 21": 8.35,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 22730,
    "Unnamed: 1": "IN-2013-42360",
    "Unnamed: 2": "2013-06-28 00:00:00",
    "Unnamed: 3": "2013-07-01 00:00:00",
    "Unnamed: 4": "Second Class",
    "Unnamed: 5": "JM-15655",
    "Unnamed: 6": "Jim Mitchum",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Sydney, New South Wales",
    "Unnamed: 9": "Australia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "OFF-BI-10004666",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Binders",
    "Unnamed: 16": "Wilson Jones Binding Machine, Durable",
    "Unnamed: 17": 90.828,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0.1,
    "Unnamed: 20": 35.268,
    "Unnamed: 21": 17.5,
    "Unnamed: 22": "Critical"
  }
]
```

## Final Instructions

1.  Initialize the Vite project with TypeScript.
2.  Install dependencies: `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-selection`, `d3-time-format`, `d3-dsv`.
3.  Create a main `Dashboard` component that fetches the data and renders the 4 child components in the specified grid layout.
4.  Ensure strict adherence to the visual properties (colors, axes, titles) defined in the XML.

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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_455/docs/tableau_render_contract.json`
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
### Worksheet: P1968__customer_overview
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Region:nk]`
- cols_field: `([ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[:Measure Names] * [ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[Multiple Values])`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[usr:Profit:qk]`
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
