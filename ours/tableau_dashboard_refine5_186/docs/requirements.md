# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard exactly as defined in the provided workbook XML.

## Tech Stack
- React 18+ with TypeScript.
- Vite for build tooling.
- D3.js (v7+) for visualizations (use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-time`, `d3-time-format`, `d3-selection`, `d3-transition`).
- No UI component libraries (e.g., Ant Design) unless necessary for basic layout containers (prefer CSS Grid/Flexbox).

## Data Loading

The application must load data from the following URL:
`/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv`

Implement a `useData` hook that:
1. Uses `fetch()` to retrieve the CSV data.
2. Parses the CSV string using `d3.csvParse`.
3. Transforms the data:
   - Convert 'Order Date' strings to JavaScript Date objects.
   - Convert 'Sales', 'Profit', 'Quantity', 'Discount' to numbers.
   - Handle any parsing errors gracefully.
4. Returns the parsed array of objects.

## Sample Data
```json
[
  {
    "﻿Category": "Office Supplies",
    "City": "Clinton",
    "Country": "United States",
    "Customer Name": "Brian Thompson",
    "Manufacturer": "Other",
    "Order Date": "2012-07-09",
    "Order ID": "CA-2012-132626",
    "Postal Code": 20735,
    "Product Name": "Performers Binder/Pad Holder, Black",
    "Region": "East",
    "Segment": "Consumer",
    "Ship Date": "2012-07-14",
    "Ship Mode": "Standard Class",
    "State": "Maryland",
    "Sub-Category": "Binders",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 42,
    "Profit Ratio": 0.5,
    "Quantity": 3,
    "Sales": 84
  },
  {
    "﻿Category": "Technology",
    "City": "Westminster",
    "Country": "United States",
    "Customer Name": "Katherine Ducich",
    "Manufacturer": "Square",
    "Order Date": "2014-11-20",
    "Order ID": "CA-2014-121468",
    "Postal Code": 92683,
    "Product Name": "Square Credit Card Reader",
    "Region": "West",
    "Segment": "Consumer",
    "Ship Date": "2014-11-21",
    "Ship Mode": "First Class",
    "State": "California",
    "Sub-Category": "Phones",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 2,
    "Profit Ratio": 0.08,
    "Quantity": 4,
    "Sales": 32
  },
  {
    "﻿Category": "Technology",
    "City": "Baltimore",
    "Country": "United States",
    "Customer Name": "Jay Fein",
    "Manufacturer": "Other",
    "Order Date": "2014-07-31",
    "Order ID": "CA-2014-141103",
    "Postal Code": 21215,
    "Product Name": "invisibleSHIELD by ZAGG Smudge-Free Screen Protector",
    "Region": "East",
    "Segment": "Consumer",
    "Ship Date": "2014-08-07",
    "Ship Mode": "Standard Class",
    "State": "Maryland",
    "Sub-Category": "Phones",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 43,
    "Profit Ratio": 0.48,
    "Quantity": 5,
    "Sales": 90
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Omaha",
    "Country": "United States",
    "Customer Name": "Alejandro Grove",
    "Manufacturer": "Things To Do",
    "Order Date": "2013-09-14",
    "Order ID": "CA-2013-105732",
    "Postal Code": 68104,
    "Product Name": "Things To Do Today Pad",
    "Region": "Central",
    "Segment": "Consumer",
    "Ship Date": "2013-09-19",
    "Ship Mode": "Standard Class",
    "State": "Nebraska",
    "Sub-Category": "Paper",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 8,
    "Profit Ratio": 0.48,
    "Quantity": 3,
    "Sales": 18
  },
  {
    "﻿Category": "Furniture",
    "City": "San Diego",
    "Country": "United States",
    "Customer Name": "Jane Waco",
    "Manufacturer": "Global",
    "Order Date": "2013-09-19",
    "Order ID": "CA-2013-133935",
    "Postal Code": 92105,
    "Product Name": "Global High-Back Leather Tilter, Burgundy",
    "Region": "West",
    "Segment": "Corporate",
    "Ship Date": "2013-09-23",
    "Ship Mode": "Standard Class",
    "State": "California",
    "Sub-Category": "Chairs",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": -100,
    "Profit Ratio": -0.11,
    "Quantity": 9,
    "Sales": 886
  },
  {
    "﻿Category": "Furniture",
    "City": "San Francisco",
    "Country": "United States",
    "Customer Name": "Gary McGarr",
    "Manufacturer": "Eldon",
    "Order Date": "2014-04-23",
    "Order ID": "CA-2014-135783",
    "Postal Code": 94122,
    "Product Name": "Eldon Stackable Tray, Side-Load, Legal, Smoke",
    "Region": "West",
    "Segment": "Consumer",
    "Ship Date": "2014-04-25",
    "Ship Mode": "First Class",
    "State": "California",
    "Sub-Category": "Furnishings",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 6,
    "Profit Ratio": 0.34,
    "Quantity": 2,
    "Sales": 18
  },
  {
    "﻿Category": "Furniture",
    "City": "Dover",
    "Country": "United States",
    "Customer Name": "George Bell",
    "Manufacturer": "Tenex",
    "Order Date": "2013-05-09",
    "Order ID": "CA-2013-164672",
    "Postal Code": 19901,
    "Product Name": "Tenex 46\" x 60\" Computer Anti-Static Chairmat, Rectangular Shaped",
    "Region": "East",
    "Segment": "Corporate",
    "Ship Date": "2013-05-14",
    "Ship Mode": "Second Class",
    "State": "Delaware",
    "Sub-Category": "Furnishings",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 42,
    "Profit Ratio": 0.2,
    "Quantity": 2,
    "Sales": 212
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Atlanta",
    "Country": "United States",
    "Customer Name": "John Stevenson",
    "Manufacturer": "Avery",
    "Order Date": "2013-02-12",
    "Order ID": "CA-2013-110492",
    "Postal Code": 30318,
    "Product Name": "Avery Durable Slant Ring Binders, No Labels",
    "Region": "South",
    "Segment": "Consumer",
    "Ship Date": "2013-02-14",
    "Ship Mode": "First Class",
    "State": "Georgia",
    "Sub-Category": "Binders",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 7,
    "Profit Ratio": 0.47,
    "Quantity": 4,
    "Sales": 16
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Dallas",
    "Country": "United States",
    "Customer Name": "Lindsay Shagiari",
    "Manufacturer": "Other",
    "Order Date": "2014-11-13",
    "Order ID": "CA-2014-164168",
    "Postal Code": 75081,
    "Product Name": "#10- 4 1/8\" x 9 1/2\" Security-Tint Envelopes",
    "Region": "Central",
    "Segment": "Home Office",
    "Ship Date": "2014-11-19",
    "Ship Mode": "Standard Class",
    "State": "Texas",
    "Sub-Category": "Envelopes",
    "Discount": 0.2,
    "Number of Records": 1,
    "Profit": 4,
    "Profit Ratio": 0.36,
    "Quantity": 2,
    "Sales": 12
  },
  {
    "﻿Category": "Office Supplies",
    "City": "Jackson",
    "Country": "United States",
    "Customer Name": "Nat Gilpin",
    "Manufacturer": "Other",
    "Order Date": "2011-11-24",
    "Order ID": "CA-2011-100762",
    "Postal Code": 49201,
    "Product Name": "Dot Matrix Printer Tape Reel Labels, White, 5000/Box",
    "Region": "Central",
    "Segment": "Corporate",
    "Ship Date": "2011-11-29",
    "Ship Mode": "Standard Class",
    "State": "Michigan",
    "Sub-Category": "Labels",
    "Discount": 0.0,
    "Number of Records": 1,
    "Profit": 96,
    "Profit Ratio": 0.49,
    "Quantity": 2,
    "Sales": 197
  }
]
```

## Dashboard Specification: "Synthetic Dashboard 186"

### Layout
- **Container Size**: Fixed size of 1000px width by 800px height. Center this container in the viewport.
- **Grid Structure**: A 2x2 grid layout using CSS Grid.
- **Margins**: 8px outer margin, 4px gap between grid items.
- **Zones**:
  - **Top-Left**: Worksheet "Bar" (P121__bar)
  - **Top-Right**: Worksheet "Sales by Sub Category" (P9517__sales_by_sub_category)
  - **Bottom-Left**: Worksheet "Total Sales Each Year" (P1225__total_sales_each_year)
  - **Bottom-Right**: Worksheet "Scatterplot" (P121__scatterplot)

### Component Implementation Details

#### 1. Worksheet: "Bar" (P121__bar)
- **Type**: Horizontal Bar Chart.
- **Title**: "Bar"
- **Data Preparation**: Aggregate data by `Category` (Level 1) and `Sub-Category` (Level 2). Sum `Sales`.
- **Visual Encodings**:
  - **X-Axis**: `SUM(Sales)` (Linear Scale). Format as Currency ($#,##0).
  - **Y-Axis**: Hierarchy of `Category` -> `Sub-Category`.
  - **Color**: Encoded by `SUM(Sales)` using a sequential color scale (approximate Tableau's 'blue_teal' palette, e.g., `d3.interpolateBlues` or a custom teal range).
- **Interactions**: Implement a click handler on bars to drill down from Category to Sub-Category.

#### 2. Worksheet: "Sales by Sub Category" (P9517__sales_by_sub_category)
- **Type**: Horizontal Bar Chart.
- **Title**: "Sales by Sub Category"
- **Data Preparation**: Aggregate data by `Sub-Category` (Level 1) and `Product Name` (Level 2). Sum `Sales`.
- **Visual Encodings**:
  - **X-Axis**: `SUM(Sales)` (Linear Scale). Format as Currency ($#,##0).
  - **Y-Axis**: Hierarchy of `Sub-Category` -> `Product Name`.
  - **Color**: Default Tableau Blue (e.g., `#1f77b4`) or similar solid color, as no specific color encoding is defined in the XML for this sheet.
- **Interactions**: Implement a click handler on bars to drill down from Sub-Category to Product Name.

#### 3. Worksheet: "Total Sales Each Year" (P1225__total_sales_each_year)
- **Type**: Vertical Bar Chart (Column Chart).
- **Title**: "Total Sales Each Year"
- **Data Preparation**: Aggregate data by `YEAR(Order Date)`. Sum `Sales`.
- **Visual Encodings**:
  - **X-Axis**: `YEAR(Order Date)` (Ordinal/Band Scale).
  - **Y-Axis**: `SUM(Sales)` (Linear Scale). Format as Currency ($#,##0).
  - **Color**: Encoded by `SUM(Sales)` (Sequential scale, similar to the "Bar" chart).
  - **Labels**: Display the Sales value on top of each bar.

#### 4. Worksheet: "Scatterplot" (P121__scatterplot)
- **Type**: Scatterplot.
- **Title**: "Scatterplot"
- **Data Preparation**: Aggregate data by `Product Name`. Sum `Sales`, `Profit`, and `Quantity`.
- **Visual Encodings**:
  - **X-Axis**: `SUM(Sales)` (Linear Scale). Format as Currency.
  - **Y-Axis**: `SUM(Profit)` (Linear Scale). Format as Currency.
  - **Size**: `SUM(Quantity)` (Radius Scale).
  - **Color**: Encoded by `SUM(Sales)` (Sequential scale).
  - **Shape**: Circle.
  - **Opacity**: ~0.7 to handle overlapping.
- **Interactions**: Tooltip on hover showing Product Name, Sales, Profit, and Quantity.

### General Styling
- **Fonts**: Use a sans-serif font family (e.g., Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif).
- **Titles**: Bold, centered or left-aligned above the chart area, matching Tableau default styling.
- **Axes**: Standard D3 axis styling with grey axis lines and ticks.
- **Tooltips**: Create a custom HTML/CSS tooltip that follows the mouse cursor when hovering over data marks.

### Implementation Steps
1. Set up the Vite + React + TypeScript project.
2. Install D3 dependencies.
3. Create the `useData` hook to fetch and parse the CSV.
4. Create the main `Dashboard` component with the 2x2 CSS Grid layout.
5. Implement each chart as a separate functional component receiving the full dataset and filtering/aggregating internally (or via utility functions).
6. Ensure the dashboard matches the 1000x800 dimension constraint.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_refine5_186/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: P9517__sales_by_sub_category
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Sub-Category:nk] / [ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Product Name:nk])`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=50000, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P121__bar
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Category:nk] / [ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[none:Sub-Category:nk])`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- bar_orientation: `horizontal`
- zone: x=800, y=1000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: P121__scatterplot
- chart_intent: `custom_tableau_view`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Profit:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=50000, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: P1225__total_sales_each_year
- chart_intent: `line_chart`
- rows_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- cols_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[yr:Order Date:ok]`
- series_field: `[ds_p2648_federated_17b79zd17x1dqo12u5yju1corl31].[sum:Sales:qk]`
- zone: x=800, y=50000, w=49200, h=49000
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
