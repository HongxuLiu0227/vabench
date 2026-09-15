# Project Requirements

You are an expert React developer. Your task is to implement a dashboard based on the following specification.

# Project Overview
Recreate the Tableau dashboard "Synthetic Dashboard 451" using React, TypeScript, and Vite. The dashboard visualizes Superstore sales data using four distinct charts arranged in a 2x2 grid.

# Tech Stack
- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Visualization**: D3.js (v7 or later) using primitives (`d3-scale`, `d3-shape`, `d3-axis`, `d3-selection`, `d3-time`). Do not use high-level chart libraries like Recharts or Nivo.
- **Styling**: CSS Modules or Styled Components. No external UI component library (e.g., Ant Design) is required.

# Data Loading

The data is located at `/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv`.

You must implement a data loader utility that fetches this CSV and parses it. Use `d3-dsv` for parsing.

```typescript
// src/utils/dataLoader.ts
import { csv } from 'd3-dsv';

export interface SuperstoreRecord {
  "Category": string;
  "City": string;
  "Country": string;
  "Customer Name": string;
  "Manufacturer": string;
  "Order Date": string; // ISO date string
  "Order ID": string;
  "Postal Code": string;
  "Product Name": string;
  "Region": string;
  "Segment": string;
  "Ship Date": string;
  "Ship Mode": string;
  "State": string;
  "Sub-Category": string;
  "Discount": number;
  "Number of Records": number;
  "Profit": number;
  "Profit Ratio": number;
  "Quantity": number;
  "Sales": number;
}

export const loadData = async (): Promise<SuperstoreRecord[]> => {
  const response = await fetch('/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const csvText = await response.text();
  const data = csv<SuperstoreRecord>(csvText);
  
  // Convert date strings to Date objects for easier D3 processing
  return data.map(d => ({
    ...d,
    "Order Date": new Date(d["Order Date"]),
    "Ship Date": new Date(d["Ship Date"]),
    "Sales": +d.Sales,
    "Profit": +d.Profit,
    "Quantity": +d.Quantity,
    "Discount": +d.Discount,
    "Profit Ratio": +d["Profit Ratio"]
  }));
};
```

# Sample Data

Here is a sample of the data structure you will be working with:

```json
[
  {
    "﻿Category": "Furniture",
    "City": "San Antonio",
    "Country": "United States",
    "Customer Name": "Pamela Stobb",
    "Manufacturer": "Novimex",
    "Order Date": "2012-05-26",
    "Order ID": "CA-2012-143147",
    "Postal Code": 78207,
    "Product Name": "Novimex Swivel Fabric Task Chair",
    "Region": "Central",
    "Segment": "Consumer",
    "Ship Date": "2012-05-28",
    "Ship Mode": "Second Class",
    "State": "Texas",
    "Sub-Category": "Chairs",
    "Discount": 0.3,
    "Number of Records": 1,
    "Profit": -29,
    "Profit Ratio": -0.27,
    "Quantity": 1,
    "Sales": 106
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Plainfield",
    "Country": "United States",
    "Customer Name": "Todd Boyes",
    "Manufacturer": "Other",
    "Order Date": "2013-01-25",
    "Order ID": "CA-2013-153346",
    "Postal Code": 7060,
    "Product Name": "Telephone Message Books with Fax/Mobile Section, 4 1/4\" x 6\"",
    "Region": "East",
    "Segment": "Corporate",
    "Ship Date": "2013-01-27",
    "Ship Mode": "First Class",
    "State": "New Jersey",
    "Sub-Category": "Paper",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 8,
    "Profit Ratio": 0.46,
    "Quantity": 5,
    "Sales": 18
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Cary",
    "Country": "United States",
    "Customer Name": "Odella Nelson",
    "Manufacturer": "Acco",
    "Order Date": "2011-11-04",
    "Order ID": "CA-2011-121286",
    "Postal Code": 27511,
    "Product Name": "Acco 6 Outlet Guardian Premium Surge Suppressor",
    "Region": "South",
    "Segment": "Corporate",
    "Ship Date": "2011-11-08",
    "Ship Mode": "Second Class",
    "State": "North Carolina",
    "Sub-Category": "Appliances",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 5,
    "Profit Ratio": 0.09,
    "Quantity": 5,
    "Sales": 58
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Detroit",
    "Country": "United States",
    "Customer Name": "Dean Braden",
    "Manufacturer": "SAFCO",
    "Order Date": "2014-10-08",
    "Order ID": "CA-2014-152709",
    "Postal Code": 48234,
    "Product Name": "SAFCO Mobile Desk Side File, Wire Frame",
    "Region": "Central",
    "Segment": "Consumer",
    "Ship Date": "2014-10-13",
    "Ship Mode": "Standard Class",
    "State": "Michigan",
    "Sub-Category": "Storage",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 22,
    "Profit Ratio": 0.26,
    "Quantity": 2,
    "Sales": 86
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Los Angeles",
    "Country": "United States",
    "Customer Name": "Sarah Bern",
    "Manufacturer": "Other",
    "Order Date": "2014-02-10",
    "Order ID": "CA-2014-145807",
    "Postal Code": 90032,
    "Product Name": "Sensible Storage WireTech Storage Systems",
    "Region": "West",
    "Segment": "Consumer",
    "Ship Date": "2014-02-14",
    "Ship Mode": "Standard Class",
    "State": "California",
    "Sub-Category": "Storage",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 18,
    "Profit Ratio": 0.05,
    "Quantity": 5,
    "Sales": 355
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Richmond",
    "Country": "United States",
    "Customer Name": "Jonathan Doherty",
    "Manufacturer": "Honeywell",
    "Order Date": "2013-12-02",
    "Order ID": "CA-2013-143805",
    "Postal Code": 23223,
    "Product Name": "Honeywell Enviracaire Portable HEPA Air Cleaner for 17' x 22' Room",
    "Region": "South",
    "Segment": "Corporate",
    "Ship Date": "2013-12-04",
    "Ship Mode": "Second Class",
    "State": "Virginia",
    "Sub-Category": "Appliances",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 695,
    "Profit Ratio": 0.33,
    "Quantity": 7,
    "Sales": 2105
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Decatur",
    "Country": "United States",
    "Customer Name": "Dave Hallsten",
    "Manufacturer": "Newell",
    "Order Date": "2012-06-13",
    "Order ID": "CA-2012-104941",
    "Postal Code": 35601,
    "Product Name": "Newell 31",
    "Region": "South",
    "Segment": "Corporate",
    "Ship Date": "2012-06-19",
    "Ship Mode": "Standard Class",
    "State": "Alabama",
    "Sub-Category": "Art",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 7,
    "Profit Ratio": 0.28,
    "Quantity": 6,
    "Sales": 25
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Seattle",
    "Country": "United States",
    "Customer Name": "Deirdre Greer",
    "Manufacturer": "Xerox",
    "Order Date": "2013-08-23",
    "Order ID": "US-2013-106313",
    "Postal Code": 98105,
    "Product Name": "Xerox 202",
    "Region": "West",
    "Segment": "Corporate",
    "Ship Date": "2013-08-27",
    "Ship Mode": "Standard Class",
    "State": "Washington",
    "Sub-Category": "Paper",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 9,
    "Profit Ratio": 0.48,
    "Quantity": 3,
    "Sales": 19
  },
  {
    "﻿Category": "Office Supplies",
    "City": "New York City",
    "Country": "United States",
    "Customer Name": "Naresj Patel",
    "Manufacturer": "GBC",
    "Order Date": "2012-08-09",
    "Order ID": "CA-2012-131338",
    "Postal Code": 10024,
    "Product Name": "GBC Ibimaster 500 Manual ProClick Binding System",
    "Region": "East",
    "Segment": "Consumer",
    "Ship Date": "2012-08-12",
    "Ship Mode": "First Class",
    "State": "New York",
    "Sub-Category": "Binders",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 457,
    "Profit Ratio": 0.38,
    "Quantity": 2,
    "Sales": 1218
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Asheville",
    "Country": "United States",
    "Customer Name": "Doug Bickford",
    "Manufacturer": "Belkin",
    "Order Date": "2014-11-28",
    "Order ID": "CA-2014-132185",
    "Postal Code": 28806,
    "Product Name": "Belkin 5 Outlet SurgeMaster Power Centers",
    "Region": "South",
    "Segment": "Consumer",
    "Ship Date": "2014-12-03",
    "Ship Mode": "Standard Class",
    "State": "North Carolina",
    "Sub-Category": "Appliances",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 4,
    "Profit Ratio": 0.1,
    "Quantity": 1,
    "Sales": 44
  }
]
```

# Dashboard Layout

The main dashboard component should use CSS Grid to create a responsive 2x2 layout.

- **Container**: `display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8px; height: 100vh; padding: 8px;`
- **Grid Areas**:
  - Top-Left: `P9517__sales_by_sub_category` (Sales by Sub Category)
  - Top-Right: `P121__scatterplot` (Scatterplot)
  - Bottom-Left: `P1225__total_sales_each_year` (Total Sales Each Year)
  - Bottom-Right: `P121__line` (Line)

Each chart container should have a title matching the worksheet titles below.

# Worksheet Specifications

## 1. Worksheet: P9517__sales_by_sub_category
**Title**: "Sales by Sub Category"
**Type**: Horizontal Bar Chart

**Visual Encodings**:
- **Y-Axis**: `[Sub-Category]` (Dimension). Use `d3.scaleBand`.
- **X-Axis**: `SUM([Sales])` (Measure). Use `d3.scaleLinear`.
- **Color**: Default automatic color (e.g., a standard blue like `#4e79a7` or similar Tableau default).

**Implementation Details**:
- Aggregate data by `Sub-Category`, summing `Sales`.
- Sort bars by Sales descending (standard Tableau behavior).
- Render axes with D3.

## 2. Worksheet: P121__scatterplot
**Title**: "Scatterplot"
**Type**: Scatter Plot

**Visual Encodings**:
- **X-Axis**: `SUM([Sales])` (Measure). Use `d3.scaleLinear`.
- **Y-Axis**: `SUM([Profit])` (Measure). Use `d3.scaleLinear`.
- **Color**: `SUM([Sales])` (Measure). Use a sequential color scale (e.g., `d3.interpolateBlues` or similar to the "sunrise_sunset" palette mentioned in the workbook). Darker/Lighter colors indicate higher/lower sales.
- **Size**: `SUM([Quantity])` (Measure). Map quantity to circle radius (area scaling preferred, `d3.scaleSqrt`).
- **Detail/Level of Detail**: `[Product Name]`. This means you must aggregate the data by `Product Name` before plotting. Each circle represents a unique Product.

**Implementation Details**:
- Group data by `Product Name`, calculating `sum(Sales)`, `sum(Profit)`, and `sum(Quantity)` for each product.
- Render circles using `d3.symbolCircle` or SVG `<circle>`.
- Add a stroke to circles (color `#000000`) as specified in the workbook style.
- Tooltips should show Product Name, Sales, Profit, and Quantity on hover.

## 3. Worksheet: P1225__total_sales_each_year
**Title**: "Total Sales Each Year"
**Type**: Vertical Bar Chart

**Visual Encodings**:
- **X-Axis**: `YEAR([Order Date])` (Dimension). Use `d3.scaleBand`.
- **Y-Axis**: `SUM([Sales])` (Measure). Use `d3.scaleLinear`.
- **Color**: `SUM([Sales])` (Measure). Use a sequential color scale.
- **Labels**: Show data labels (the Sales value) on the bars.

**Implementation Details**:
- Aggregate data by Year of `Order Date`, summing `Sales`.
- Render bars.
- Place text labels on top of or inside the bars showing the formatted Sales value (e.g., "$1,000").

## 4. Worksheet: P121__line
**Title**: "Line"
**Type**: Line Chart

**Visual Encodings**:
- **X-Axis**: `MONTH([Order Date])` (Dimension). Use `d3.scaleTime`.
- **Y-Axis**: `SUM([Sales])` (Measure). Use `d3.scaleLinear`.
- **Color**: `SUM([Sales])` (Measure). Use an interpolated color scale (e.g., `d3.interpolateTurbo` or `d3.interpolateSpectral`) mapped to the Y-value or a gradient along the line. The workbook specifies "sunrise_sunset_diverging_10_0".

**Implementation Details**:
- Aggregate data by Month (truncating date to month), summing `Sales`.
- Generate a line path using `d3.line()`.
- Apply a stroke color based on the Sales value (this might require a gradient definition in SVG or coloring segments, but a single color representing the trend or a gradient stroke is acceptable). Given the "interpolated" type in Tableau, a gradient stroke is the most faithful representation.

# General Requirements

1.  **Responsiveness**: Charts should resize to fit their grid cells. Use `ResizeObserver` or `viewBox` logic to handle window resizing.
2.  **Tooltips**: Implement a custom tooltip component that follows the mouse cursor and displays relevant data for the hovered element (mark, bar, circle).
3.  **Formatting**: Format currency values (Sales, Profit) as USD (e.g., `$1,234`). Format dates appropriately.
4.  **Code Structure**: Separate data processing logic from rendering logic. Use React hooks (`useEffect`, `useRef`, `useState`) to manage D3 lifecycle.
5.  **Styling**: Keep the visual style clean. Use white backgrounds, grey axis lines, and legible fonts (sans-serif, e.g., Arial, Helvetica, system-ui).

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_451/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P121__line
- chart_intent: `line_chart`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[tmn:Order Date:qk]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=50000, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Sub-Category:nk] / [ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Product Name:nk])`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=593, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[yr:Order Date:ok]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=593, y=49996, w=49407, h=48950
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Profit:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=50000, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
