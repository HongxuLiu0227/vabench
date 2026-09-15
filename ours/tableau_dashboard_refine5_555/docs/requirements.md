# Project Requirements

You are an expert React and TypeScript developer tasked with reverse-engineering a Tableau dashboard into a modern web application.

**Tech Stack:**
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (use primitives like `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`). Do not use high-level chart libraries like Recharts or Nivo.
- CSS for styling (CSS Modules or standard CSS).

**Objective:**
Recreate the "Synthetic Dashboard 555" from the provided Tableau workbook definition. The dashboard consists of a 2x2 grid layout containing four specific worksheets.

**Data Loading:**
The application must load data from the following URL: `/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv`.

Use the following logic to fetch and parse the data:

```typescript
import * as d3 from 'd3';

export interface OrderData {
  'Row ID': number;
  'Order ID': string;
  'Order Date': string; // ISO date string
  'Ship Date': string;  // ISO date string
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

export const useOrderData = () => {
  const [data, setData] = React.useState<OrderData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv');
        const csvText = await response.text();
        const parsedData = d3.csvParse<OrderData>(csvText, (d) => ({
          ...d,
          'Row ID': +d['Row ID'],
          'Order Date': d['Order Date'],
          'Ship Date': d['Ship Date'],
          'Postal Code': +d['Postal Code'],
          'Sales': +d['Sales'],
          'Quantity': +d['Quantity'],
          'Discount': +d['Discount'],
          'Profit': +d['Profit'],
          'Shipping Cost': +d['Shipping Cost'],
        }));
        setData(parsedData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
};
```

**Sample Data:**
```json
[
  {
    "﻿Super Store Date set for the worldwide sales. ": 7489,
    "Unnamed: 1": "US-2014-142706",
    "Unnamed: 2": "2014-09-27 00:00:00",
    "Unnamed: 3": "2014-10-02 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "SM-20950",
    "Unnamed: 6": "Suzanne McNair",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Tepic, Nayarit",
    "Unnamed: 9": "Mexico",
    "Unnamed: 10": "",
    "Unnamed: 11": "LATAM",
    "Unnamed: 12": "North",
    "Unnamed: 13": "FUR-BO-10002981",
    "Unnamed: 14": "Furniture",
    "Unnamed: 15": "Bookcases",
    "Unnamed: 16": "Sauder Stackable Bookrack, Traditional",
    "Unnamed: 17": 390.08000000000004,
    "Unnamed: 18": 5,
    "Unnamed: 19": 0.2,
    "Unnamed: 20": -92.72,
    "Unnamed: 21": 47.717,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 18407,
    "Unnamed: 1": "ES-2014-3931503",
    "Unnamed: 2": "2014-06-18 00:00:00",
    "Unnamed: 3": "2014-06-24 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "MW-18235",
    "Unnamed: 6": "Mitch Willingham",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Redditch, England",
    "Unnamed: 9": "United Kingdom",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "North",
    "Unnamed: 13": "TEC-PH-10000037",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Phones",
    "Unnamed: 16": "Cisco Signal Booster, Cordless",
    "Unnamed: 17": 618.72,
    "Unnamed: 18": 4,
    "Unnamed: 19": 0,
    "Unnamed: 20": 37.08,
    "Unnamed: 21": 61.39,
    "Unnamed: 22": "Low"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 21604,
    "Unnamed: 1": "IN-2011-78781",
    "Unnamed: 2": "2011-02-21 00:00:00",
    "Unnamed: 3": "2011-02-25 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "JL-15850",
    "Unnamed: 6": "John Lucas",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Adelaide, South Australia",
    "Unnamed: 9": "Australia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "OFF-ST-10000107",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Storage",
    "Unnamed: 16": "Eldon File Cart, Industrial",
    "Unnamed: 17": 805.7070000000001,
    "Unnamed: 18": 7,
    "Unnamed: 19": 0.1,
    "Unnamed: 20": -62.85300000000001,
    "Unnamed: 21": 54.17,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 11871,
    "Unnamed: 1": "ES-2014-3513084",
    "Unnamed: 2": "2014-07-22 00:00:00",
    "Unnamed: 3": "2014-07-24 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "PO-18850",
    "Unnamed: 6": "Patrick O'Brill",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Waterlooville, England",
    "Unnamed: 9": "United Kingdom",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "North",
    "Unnamed: 13": "OFF-ST-10002175",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Storage",
    "Unnamed: 16": "Fellowes Lockers, Single Width",
    "Unnamed: 17": 207.35999999999996,
    "Unnamed: 18": 1,
    "Unnamed: 19": 0,
    "Unnamed: 20": 35.25,
    "Unnamed: 21": 71.08,
    "Unnamed: 22": "Critical"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 34776,
    "Unnamed: 1": "CA-2013-131289",
    "Unnamed: 2": "2013-12-09 00:00:00",
    "Unnamed: 3": "2013-12-15 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "SP-20620",
    "Unnamed: 6": "Stefania Perrino",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "San Francisco, California",
    "Unnamed: 9": "United States",
    "Unnamed: 10": 94110,
    "Unnamed: 11": "US",
    "Unnamed: 12": "West",
    "Unnamed: 13": "OFF-PA-10003363",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Paper",
    "Unnamed: 16": "Xerox 204",
    "Unnamed: 17": 45.36,
    "Unnamed: 18": 7,
    "Unnamed: 19": 0,
    "Unnamed: 20": 21.772800000000004,
    "Unnamed: 21": 1.97,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 45126,
    "Unnamed: 1": "TU-2013-7240",
    "Unnamed: 2": "2013-06-10 00:00:00",
    "Unnamed: 3": "2013-06-13 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "AJ-795",
    "Unnamed: 6": "Anthony Johnson",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Eskisehir, Eskisehir",
    "Unnamed: 9": "Turkey",
    "Unnamed: 10": "",
    "Unnamed: 11": "EMEA",
    "Unnamed: 12": "EMEA",
    "Unnamed: 13": "OFF-KIT-10000624",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Appliances",
    "Unnamed: 16": "KitchenAid Blender, Black",
    "Unnamed: 17": 78.62400000000001,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0.6,
    "Unnamed: 20": -57.03599999999999,
    "Unnamed: 21": 6.3,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 49091,
    "Unnamed: 1": "IR-2013-2430",
    "Unnamed: 2": "2013-09-17 00:00:00",
    "Unnamed: 3": "2013-09-21 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "JO-5145",
    "Unnamed: 6": "Jack O'Briant",
    "Unnamed: 7": "Corporate",
    "Unnamed: 8": "Borazjan, Bushehr",
    "Unnamed: 9": "Iran",
    "Unnamed: 10": "",
    "Unnamed: 11": "EMEA",
    "Unnamed: 12": "EMEA",
    "Unnamed: 13": "OFF-SME-10001745",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Storage",
    "Unnamed: 16": "Smead Shelving, Blue",
    "Unnamed: 17": 97.85999999999999,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 29.339999999999996,
    "Unnamed: 21": 5.72,
    "Unnamed: 22": "High"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 10346,
    "Unnamed: 1": "ES-2014-4777800",
    "Unnamed: 2": "2014-11-26 00:00:00",
    "Unnamed: 3": "2014-11-29 00:00:00",
    "Unnamed: 4": "First Class",
    "Unnamed: 5": "RB-19330",
    "Unnamed: 6": "Randy Bradley",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Manchester, England",
    "Unnamed: 9": "United Kingdom",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "North",
    "Unnamed: 13": "OFF-AR-10003629",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Art",
    "Unnamed: 16": "Boston Canvas, Water Color",
    "Unnamed: 17": 227.28000000000003,
    "Unnamed: 18": 4,
    "Unnamed: 19": 0,
    "Unnamed: 20": 34.08,
    "Unnamed: 21": 76.66,
    "Unnamed: 22": "Critical"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 13545,
    "Unnamed: 1": "ES-2011-3305419",
    "Unnamed: 2": "2011-09-24 00:00:00",
    "Unnamed: 3": "2011-09-28 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "NF-18595",
    "Unnamed: 6": "Nicole Fjeld",
    "Unnamed: 7": "Home Office",
    "Unnamed: 8": "Marseille, Provence-Alpes-Côte d'Azur",
    "Unnamed: 9": "France",
    "Unnamed: 10": "",
    "Unnamed: 11": "EU",
    "Unnamed: 12": "Central",
    "Unnamed: 13": "OFF-AR-10002816",
    "Unnamed: 14": "Office Supplies",
    "Unnamed: 15": "Art",
    "Unnamed: 16": "Boston Canvas, Blue",
    "Unnamed: 17": 107.28,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0,
    "Unnamed: 20": 26.82,
    "Unnamed: 21": 11.55,
    "Unnamed: 22": "Medium"
  },
  {
    "﻿Super Store Date set for the worldwide sales. ": 26103,
    "Unnamed: 1": "IN-2013-70948",
    "Unnamed: 2": "2013-09-05 00:00:00",
    "Unnamed: 3": "2013-09-09 00:00:00",
    "Unnamed: 4": "Standard Class",
    "Unnamed: 5": "PJ-19015",
    "Unnamed: 6": "Pauline Johnson",
    "Unnamed: 7": "Consumer",
    "Unnamed: 8": "Palmerston, Northern Territory",
    "Unnamed: 9": "Australia",
    "Unnamed: 10": "",
    "Unnamed: 11": "APAC",
    "Unnamed: 12": "Oceania",
    "Unnamed: 13": "TEC-AC-10003413",
    "Unnamed: 14": "Technology",
    "Unnamed: 15": "Accessories",
    "Unnamed: 16": "Logitech Router, Programmable",
    "Unnamed: 17": 447.876,
    "Unnamed: 18": 2,
    "Unnamed: 19": 0.1,
    "Unnamed: 20": 129.336,
    "Unnamed: 21": 52.32,
    "Unnamed: 22": "High"
  }
]
```

**Dashboard Layout:**
- Container: A CSS Grid container with 2 columns and 2 rows.
- Grid Areas:
  - Top-Left: "Bar" (Worksheet: P121__bar)
  - Top-Right: "Line" (Worksheet: P121__line)
  - Bottom-Left: "Total Sales Each Year" (Worksheet: P1225__total_sales_each_year)
  - Bottom-Right: "Scatterplot" (Worksheet: P121__scatterplot)
- Styling: Use a light background, standard sans-serif font (Inter or system-ui), and ensure charts fill their grid cells with a small margin (approx 4px-8px).

**Component Specifications:**

1.  **Scatterplot (Bottom-Right)**
    - **Title:** "Scatterplot"
    - **Data Transformation:** Aggregate the raw data by `Product Name`. For each product, calculate `SUM(Sales)`, `SUM(Profit)`, and `SUM(Quantity)`.
    - **Visual Encoding:**
      - X-Axis: `SUM(Sales)` (Linear scale)
      - Y-Axis: `SUM(Profit)` (Linear scale)
      - Mark: Circle
      - Size: `SUM(Quantity)` (Radius scale)
      - Color: `SUM(Sales)` (Sequential color scale, e.g., Blue). Base color #75a1c7.
      - Stroke: Black (#000000)
    - **Interactions:** Add a simple tooltip showing Product Name, Sales, Profit, and Quantity on hover.

2.  **Bar Chart (Top-Left)**
    - **Title:** "Bar"
    - **Data Transformation:** Aggregate data by `Category` and `Sub-Category`. Calculate `SUM(Sales)` for each.
    - **Visual Encoding:**
      - X-Axis: `SUM(Sales)` (Linear scale)
      - Y-Axis: `Sub-Category` (Band scale). Note: The Tableau sheet groups by Category/Sub-Category. You can display Sub-Categories on the axis and optionally group or color by Category.
      - Mark: Bar (Horizontal)
      - Color: `SUM(Sales)` (Interpolated palette "blue_teal_10_0").

3.  **Total Sales Each Year (Bottom-Left)**
    - **Title:** "Total Sales Each Year"
    - **Data Transformation:** Aggregate data by `YEAR(Order Date)`. Calculate `SUM(Sales)`.
    - **Visual Encoding:**
      - X-Axis: `YEAR(Order Date)` (Band scale)
      - Y-Axis: `SUM(Sales)` (Linear scale)
      - Mark: Bar (Vertical)
      - Color: `SUM(Sales)` (Sequential)
      - Labels: Display the value of `SUM(Sales)` at the top of each bar.

4.  **Line Chart (Top-Right)**
    - **Title:** "Line"
    - **Data Transformation:** Aggregate data by `MONTH(Order Date)` (Truncated to month). Calculate `SUM(Sales)`.
    - **Visual Encoding:**
      - X-Axis: `MONTH(Order Date)` (Time scale)
      - Y-Axis: `SUM(Sales)` (Linear scale)
      - Mark: Line (or Area)
      - Color: `SUM(Sales)` (Interpolated palette "sunrise_sunset_diverging_10_0").

**Implementation Notes:**
- Use `d3-scaleLinear`, `d3-scaleBand`, `d3-scaleTime`, `d3-scaleSequential` for scales.
- Use `d3-axisBottom`, `d3-axisLeft` for axes.
- Use `d3.line` or `d3.area` for the line chart.
- Ensure all charts are responsive within their grid containers.
- Handle date parsing carefully using `d3.timeParse`.
- Do not implement any filters or parameters not explicitly defined in the workbook (none are active in the provided XML).

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_555/docs/tableau_render_contract.json`
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
- zone: x=50000, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__bar
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Category:nk] / [ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[none:Sub-Category:nk])`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
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
### Worksheet: P121__line
- chart_intent: `line_chart`
- rows_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- cols_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[tmn:Order Date:qk]`
- series_field: `[ds_p121_federated_0azm2i115epm0e12562z51akj8sy].[sum:Sales:qk]`
- zone: x=50000, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
