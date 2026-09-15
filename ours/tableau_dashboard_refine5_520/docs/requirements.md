# Project Requirements

You are an expert React and D3.js developer. Your task is to implement a dashboard that exactly replicates the layout and functionality of a specific Tableau workbook.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7): Use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-time-format`, `d3-scale-chromatic`.
- No UI component libraries (e.g., Ant Design, Material UI). Use standard HTML/CSS.

## Data Loading

The data is located at: `/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv`

You must implement a data loader utility that fetches this CSV and parses it using `d3.csvParse`.

Example:
```typescript
import { csv } from 'd3-fetch';

export type DataRow = {
  'Category': string;
  'City': string;
  'Country': string;
  'Customer Name': string;
  'Manufacturer': string;
  'Order Date': string; // ISO date string
  'Order ID': string;
  'Postal Code': string;
  'Product Name': string;
  'Region': string;
  'Segment': string;
  'Ship Date': string;
  'Ship Mode': string;
  'State': string;
  'Sub-Category': string;
  'Discount': number;
  'Number of Records': number;
  'Profit': number;
  'Profit Ratio': number;
  'Quantity': number;
  'Sales': number;
};

export const loadData = async (): Promise<DataRow[]> => {
  const response = await fetch('/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv');
  const csvText = await response.text();
  const data = csv(csvText);
  // Parse dates and numbers here if necessary, or handle in components
  return data.map(d => ({
    ...d,
    'Order Date': new Date(d['Order Date']),
    'Sales': +d['Sales'],
    'Profit': +d['Profit'],
    'Quantity': +d['Quantity'],
    'Discount': +d['Discount'],
    'Profit Ratio': +d['Profit Ratio']
  })) as DataRow[];
};
```

## Sample Data
```json
[
  {
    "﻿Category": "Office Supplies",
    "City": "Denver",
    "Country": "United States",
    "Customer Name": "Dianna Vittorini",
    "Manufacturer": "Other",
    "Order Date": "2014-12-02",
    "Order ID": "CA-2014-145233",
    "Postal Code": 80219,
    "Product Name": "Recycled Pressboard Report Cover with Reinforced Top Hinge",
    "Region": "West",
    "Segment": "Consumer",
    "Ship Date": "2014-12-06",
    "Ship Mode": "Standard Class",
    "State": "Colorado",
    "Sub-Category": "Binders",
    "Discount": 0.7,
    "Number of Records": 1,
    "Profit": -5,
    "Profit Ratio": -0.7,
    "Quantity": 7,
    "Sales": 7
  },
  {
    "﻿Category": "Office Supplies",
    "City": "New York City",
    "Country": "United States",
    "Customer Name": "Paul Stevenson",
    "Manufacturer": "Sanford",
    "Order Date": "2013-05-10",
    "Order ID": "CA-2013-161158",
    "Postal Code": 10024,
    "Product Name": "Sanford Pocket Accent Highlighters",
    "Region": "East",
    "Segment": "Home Office",
    "Ship Date": "2013-05-14",
    "Ship Mode": "Standard Class",
    "State": "New York",
    "Sub-Category": "Art",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 3,
    "Profit Ratio": 0.43,
    "Quantity": 5,
    "Sales": 8
  },
  {
    "﻿Category": "Furniture",
    "City": "Long Beach",
    "Country": "United States",
    "Customer Name": "Fred Hopkins",
    "Manufacturer": "Office Star",
    "Order Date": "2012-11-03",
    "Order ID": "CA-2012-162047",
    "Postal Code": 11561,
    "Product Name": "Office Star - Mid Back Dual function Ergonomic High Back Chair with 2-Way Adjustable Arms",
    "Region": "East",
    "Segment": "Corporate",
    "Ship Date": "2012-11-05",
    "Ship Mode": "First Class",
    "State": "New York",
    "Sub-Category": "Chairs",
    "Discount": 0.1,
    "Number of Records": 1,
    "Profit": 209,
    "Profit Ratio": 0.14,
    "Quantity": 10,
    "Sales": 1449
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Arlington",
    "Country": "United States",
    "Customer Name": "Sample Company A",
    "Manufacturer": "GBC",
    "Order Date": "2014-10-01",
    "Order ID": "US-2014-130603",
    "Postal Code": 76017,
    "Product Name": "GBC Instant Report Kit",
    "Region": "Central",
    "Segment": "Home Office",
    "Ship Date": "2014-10-07",
    "Ship Mode": "Standard Class",
    "State": "Texas",
    "Sub-Category": "Binders",
    "Discount": 0.8,
    "Number of Records": 1,
    "Profit": -17,
    "Profit Ratio": -1.5,
    "Quantity": 9,
    "Sales": 12
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Los Angeles",
    "Country": "United States",
    "Customer Name": "Ted Trevino",
    "Manufacturer": "Xerox",
    "Order Date": "2013-05-12",
    "Order ID": "CA-2013-162733",
    "Postal Code": 90045,
    "Product Name": "Xerox 1920",
    "Region": "West",
    "Segment": "Consumer",
    "Ship Date": "2013-05-13",
    "Ship Mode": "First Class",
    "State": "California",
    "Sub-Category": "Paper",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 3,
    "Profit Ratio": 0.45,
    "Quantity": 1,
    "Sales": 6
  },
  {
    "﻿Category": "Office Supplies",
    "City": "New York City",
    "Country": "United States",
    "Customer Name": "Julie Kriz",
    "Manufacturer": "Tennsco",
    "Order Date": "2013-12-19",
    "Order ID": "CA-2013-150945",
    "Postal Code": 10009,
    "Product Name": "Tennsco Double-Tier Lockers",
    "Region": "East",
    "Segment": "Home Office",
    "Ship Date": "2013-12-21",
    "Ship Mode": "Second Class",
    "State": "New York",
    "Sub-Category": "Storage",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 117,
    "Profit Ratio": 0.13,
    "Quantity": 4,
    "Sales": 900
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Seattle",
    "Country": "United States",
    "Customer Name": "Maxwell Schwartz",
    "Manufacturer": "Xerox",
    "Order Date": "2013-08-24",
    "Order ID": "CA-2013-150350",
    "Postal Code": 98105,
    "Product Name": "Xerox 1978",
    "Region": "West",
    "Segment": "Consumer",
    "Ship Date": "2013-08-31",
    "Ship Mode": "Standard Class",
    "State": "Washington",
    "Sub-Category": "Paper",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 17,
    "Profit Ratio": 0.49,
    "Quantity": 6,
    "Sales": 35
  },
  {
    "﻿Category": "Furniture",
    "City": "Seattle",
    "Country": "United States",
    "Customer Name": "Joni Wasserman",
    "Manufacturer": "Eldon",
    "Order Date": "2014-04-22",
    "Order ID": "CA-2014-166198",
    "Postal Code": 98103,
    "Product Name": "Eldon Advantage Foldable Chair Mats for Low Pile Carpets",
    "Region": "West",
    "Segment": "Consumer",
    "Ship Date": "2014-04-25",
    "Ship Mode": "First Class",
    "State": "Washington",
    "Sub-Category": "Furnishings",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 34,
    "Profit Ratio": 0.21,
    "Quantity": 3,
    "Sales": 163
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Los Angeles",
    "Country": "United States",
    "Customer Name": "Susan Pistek",
    "Manufacturer": "Xerox",
    "Order Date": "2011-11-22",
    "Order ID": "CA-2011-135090",
    "Postal Code": 90036,
    "Product Name": "Xerox 1895",
    "Region": "West",
    "Segment": "Consumer",
    "Ship Date": "2011-11-26",
    "Ship Mode": "Standard Class",
    "State": "California",
    "Sub-Category": "Paper",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 24,
    "Profit Ratio": 0.45,
    "Quantity": 9,
    "Sales": 54
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Madison",
    "Country": "United States",
    "Customer Name": "Jeremy Pistek",
    "Manufacturer": "Adams",
    "Order Date": "2014-12-09",
    "Order ID": "CA-2014-117324",
    "Postal Code": 53711,
    "Product Name": "Adams Phone Message Book, 200 Message Capacity, 8 1/16” x 11”",
    "Region": "Central",
    "Segment": "Consumer",
    "Ship Date": "2014-12-14",
    "Ship Mode": "Standard Class",
    "State": "Wisconsin",
    "Sub-Category": "Paper",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 13,
    "Profit Ratio": 0.46,
    "Quantity": 4,
    "Sales": 28
  }
]
```

## Dashboard Layout

The main dashboard (`Synthetic Dashboard 520`) uses a 2x2 Grid Layout.

- **Container**: CSS Grid with `grid-template-columns: 1fr 1fr` and `grid-template-rows: 1fr 1fr`.
- **Gap**: Small gap (approx 8px) between items.
- **Item 1 (Top-Left)**: `CustomerOverview` component.
- **Item 2 (Top-Right)**: `Scatterplot` component.
- **Item 3 (Bottom-Left)**: `TotalSalesEachYear` component.
- **Item 4 (Bottom-Right)**: `LineChart` component.

## Component Specifications

### 1. CustomerOverview (Top-Left)

**Title**: "Customer Overview"

**Type**: Heatmap / Text Table.

**Data Logic**:
- Group data by `Region`.
- Calculate metrics for each region:
  - `Sales`: SUM(Sales)
  - `Quantity`: SUM(Quantity)
  - `Profit`: SUM(Profit)
  - `Profit Ratio`: SUM(Profit) / SUM(Sales)
  - `Number of Customers`: COUNTD(Customer Name)
- **Filter**: Include a dropdown or slider to filter by `Year` of `Order Date`. Default to all years.

**Visual Encoding**:
- **Rows**: Region names.
- **Columns**: Sales, Quantity, Profit, Profit Ratio.
- **Color**: The background color of the cells (or text color) should be determined by `Profit Ratio`.
  - Use a diverging scale (e.g., `d3.interpolateRdBu` or similar) centered at 0.
  - Range: -0.5 to 0.5 (as per XML).
- **Labels**: Show values inside the cells.

**Tooltip**: Custom tooltip showing:
- Region (Bold)
- Number of Customers
- The specific Measure Name and Value
- Profit
- Quantity
- Sales
- Profit Ratio

### 2. Scatterplot (Top-Right)

**Title**: "Scatterplot"

**Type**: Scatter Plot.

**Data Logic**:
- Group data by `Product Name`.
- Calculate SUM(Sales), SUM(Profit), SUM(Quantity) for each product.

**Visual Encoding**:
- **X-Axis**: SUM(Sales)
- **Y-Axis**: SUM(Profit)
- **Size**: SUM(Quantity)
- **Color**: SUM(Sales) (Sequential color scale, e.g., Blues). Note: XML specifies a base color `#75a1c7`, but also encodes Sales to color. Implement a sequential scale based on Sales for better visualization.
- **Mark**: Circle.
- **Style**: Stroke color `#000000` (black), Stroke width 1px.

### 3. TotalSalesEachYear (Bottom-Left)

**Title**: "Total Sales Each Year"

**Type**: Bar Chart.

**Data Logic**:
- Group data by `Year` of `Order Date`.
- Calculate SUM(Sales) for each year.

**Visual Encoding**:
- **X-Axis**: Year (Ordinal/Time).
- **Y-Axis**: SUM(Sales).
- **Color**: SUM(Sales) (Sequential color scale).
- **Labels**: Show Sales values on top of bars.

### 4. LineChart (Bottom-Right)

**Title**: "Line"

**Type**: Line Chart.

**Data Logic**:
- Group data by `Month` of `Order Date` (Truncate to Month).
- Calculate SUM(Sales) for each month.

**Visual Encoding**:
- **X-Axis**: Month (Time scale).
- **Y-Axis**: SUM(Sales).
- **Color**: SUM(Sales) (Interpolated color along the line, or a gradient stroke). The XML specifies `palette="sunrise_sunset_diverging_10_0"`. Use a D3 diverging scale for the line color.
- **Mark**: Line (Automatic).

## Implementation Details

1.  **Shared State**: Create a context or simply lift state to the main `App` component to hold the loaded data. Pass the data down to each chart component.
2.  **Responsiveness**: Use `viewBox` and `preserveAspectRatio` in SVGs to ensure charts resize correctly within their grid cells.
3.  **Formatting**:
    - Currency: Use `d3.format("$,.0f")` for Sales and Profit.
    - Percentage: Use `d3.format(".0%")` for Profit Ratio.
4.  **Styling**: Use a clean, sans-serif font (e.g., Inter, system-ui). Ensure titles are bold and clearly visible.

Please generate the complete React application code, including the main `App.tsx`, the data loader, and the four chart components.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_520/docs/tableau_render_contract.json`
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
### Worksheet: P1968__customer_overview
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Region:nk]`
- cols_field: `([ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[:Measure Names] * [ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[Multiple Values])`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[usr:Profit Ratio:qk]`
- zone: x=593, y=1054, w=49407, h=48942
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
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
