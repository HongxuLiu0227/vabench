# Project Requirements

You are an expert React developer. Your task is to implement a dashboard based on the following specification.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7): Use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-time-format`, `d3-hierarchy` (for pie charts).
- CSS: Use standard CSS modules or styled-components. Do not use UI component libraries like Ant Design or Material UI.

## Data Loading

The application must fetch data from the following URL:
`/data/federated_0r0vorq1eq42zb19jd94c0.csv`

Implement a `useData` hook that:
1. Uses `fetch()` to retrieve the CSV.
2. Uses `d3-dsv` (d3.csvParse) to parse the text.
3. Type the data using the interface below.
4. Returns the parsed array.

### Data Interface
```typescript
interface SuperstoreRow {
  "Row ID": number;
  "Order ID": string;
  "Order Date": string; // ISO date string
  "Ship Date": string;
  "Ship Mode": string;
  "Customer ID": string;
  "Customer Name": string;
  "Segment": string;
  "Country": string;
  "City": string;
  "State": string;
  "Postal Code": number;
  "Region": string;
  "Product ID": string;
  "Category": string;
  "Sub-Category": string;
  "Product Name": string;
  "Sales": number;
  "Quantity": number;
  "Discount": number;
  "Profit": number;
}
```

### Sample Data
```json
[
  {
    "﻿\"\"\"Row ID\"\"\"": 4300,
    "\"Order ID\"": "CA-2017-129021",
    "\"Order Date\"": "2017-08-23",
    "\"Ship Date\"": "2017-08-26",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "PO-18850",
    "\"Customer Name\"": "Patrick O'Brill",
    "\"Segment\"": "Consumer",
    "\"Country\"": "United States",
    "\"City\"": "Tallahassee",
    "\"State\"": "Florida",
    "\"Postal Code\"": 32303,
    "\"Region\"": "South",
    "\"Product ID\"": "OFF-AP-10003040",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Appliances",
    "\"Product Name\"": "Fellowes 8 Outlet Superior Workstation Surge Protector w/o Phone/Fax/Modem Protection",
    "\"Sales\"": 161.376,
    "\"Quantity\"": 6,
    "\"Discount\"": 0.2,
    "\"Profit\"": 12.103199999999994
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 6406,
    "\"Order ID\"": "CA-2017-154074",
    "\"Order Date\"": "2017-08-31",
    "\"Ship Date\"": "2017-09-02",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "BW-11110",
    "\"Customer Name\"": "Bart Watters",
    "\"Segment\"": "Corporate",
    "\"Country\"": "United States",
    "\"City\"": "Spokane",
    "\"State\"": "Washington",
    "\"Postal Code\"": 99207,
    "\"Region\"": "West",
    "\"Product ID\"": "FUR-CH-10002331",
    "\"Category\"": "Furniture",
    "\"Sub-Category\"": "Chairs",
    "\"Product Name\"": "Hon 4700 Series Mobuis Mid-Back Task Chairs with Adjustable Arms",
    "\"Sales\"": 569.5680000000001,
    "\"Quantity\"": 2,
    "\"Discount\"": 0.2,
    "\"Profit\"": 7.119599999999906
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 1114,
    "\"Order ID\"": "CA-2017-140585",
    "\"Order Date\"": "2017-12-18",
    "\"Ship Date\"": "2017-12-23",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "RA-19915",
    "\"Customer Name\"": "Russell Applegate",
    "\"Segment\"": "Consumer",
    "\"Country\"": "United States",
    "\"City\"": "Encinitas",
    "\"State\"": "California",
    "\"Postal Code\"": 92024,
    "\"Region\"": "West",
    "\"Product ID\"": "OFF-BI-10003364",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Binders",
    "\"Product Name\"": "Binding Machine Supplies",
    "\"Sales\"": 46.672000000000004,
    "\"Quantity\"": 2,
    "\"Discount\"": 0.2,
    "\"Profit\"": 16.3352
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 2641,
    "\"Order ID\"": "CA-2017-108441",
    "\"Order Date\"": "2017-06-12",
    "\"Ship Date\"": "2017-06-18",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "SB-20170",
    "\"Customer Name\"": "Sarah Bern",
    "\"Segment\"": "Consumer",
    "\"Country\"": "United States",
    "\"City\"": "New York City",
    "\"State\"": "New York",
    "\"Postal Code\"": 10035,
    "\"Region\"": "East",
    "\"Product ID\"": "FUR-CH-10000595",
    "\"Category\"": "Furniture",
    "\"Sub-Category\"": "Chairs",
    "\"Product Name\"": "Safco Contoured Stacking Chairs",
    "\"Sales\"": 858.24,
    "\"Quantity\"": 4,
    "\"Discount\"": 0.1,
    "\"Profit\"": 143.03999999999996
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 17,
    "\"Order ID\"": "CA-2014-105893",
    "\"Order Date\"": "2014-11-11",
    "\"Ship Date\"": "2014-11-18",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "PK-19075",
    "\"Customer Name\"": "Pete Kriz",
    "\"Segment\"": "Consumer",
    "\"Country\"": "United States",
    "\"City\"": "Madison",
    "\"State\"": "Wisconsin",
    "\"Postal Code\"": 53711,
    "\"Region\"": "Central",
    "\"Product ID\"": "OFF-ST-10004186",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Storage",
    "\"Product Name\"": "Stur-D-Stor Shelving, Vertical 5-Shelf: 72\"H x 36\"W x 18 1/2\"D",
    "\"Sales\"": 665.88,
    "\"Quantity\"": 6,
    "\"Discount\"": 0.0,
    "\"Profit\"": 13.317599999999999
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 382,
    "\"Order ID\"": "CA-2016-134775",
    "\"Order Date\"": "2016-10-28",
    "\"Ship Date\"": "2016-10-29",
    "\"Ship Mode\"": "First Class",
    "\"Customer ID\"": "AS-10285",
    "\"Customer Name\"": "Alejandro Savely",
    "\"Segment\"": "Corporate",
    "\"Country\"": "United States",
    "\"City\"": "San Francisco",
    "\"State\"": "California",
    "\"Postal Code\"": 94109,
    "\"Region\"": "West",
    "\"Product ID\"": "OFF-PA-10004734",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Paper",
    "\"Product Name\"": "Southworth Structures Collection",
    "\"Sales\"": 50.96,
    "\"Quantity\"": 7,
    "\"Discount\"": 0.0,
    "\"Profit\"": 25.48
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 5085,
    "\"Order ID\"": "CA-2016-108350",
    "\"Order Date\"": "2016-06-06",
    "\"Ship Date\"": "2016-06-09",
    "\"Ship Mode\"": "Second Class",
    "\"Customer ID\"": "SC-20230",
    "\"Customer Name\"": "Scot Coram",
    "\"Segment\"": "Corporate",
    "\"Country\"": "United States",
    "\"City\"": "Lowell",
    "\"State\"": "Massachusetts",
    "\"Postal Code\"": 1852,
    "\"Region\"": "East",
    "\"Product ID\"": "OFF-PA-10003656",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Paper",
    "\"Product Name\"": "Xerox 1935",
    "\"Sales\"": 105.52,
    "\"Quantity\"": 4,
    "\"Discount\"": 0.0,
    "\"Profit\"": 48.539199999999994
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 9772,
    "\"Order ID\"": "CA-2016-123533",
    "\"Order Date\"": "2016-11-24",
    "\"Ship Date\"": "2016-11-30",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "SC-20050",
    "\"Customer Name\"": "Sample Company A",
    "\"Segment\"": "Home Office",
    "\"Country\"": "United States",
    "\"City\"": "Hialeah",
    "\"State\"": "Florida",
    "\"Postal Code\"": 33012,
    "\"Region\"": "South",
    "\"Product ID\"": "OFF-AP-10002765",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Appliances",
    "\"Product Name\"": "Fellowes Advanced Computer Series Surge Protectors",
    "\"Sales\"": 42.384,
    "\"Quantity\"": 2,
    "\"Discount\"": 0.2,
    "\"Profit\"": 4.238400000000002
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 3889,
    "\"Order ID\"": "CA-2014-100895",
    "\"Order Date\"": "2014-06-02",
    "\"Ship Date\"": "2014-06-06",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "SV-20785",
    "\"Customer Name\"": "Stewart Visinsky",
    "\"Segment\"": "Consumer",
    "\"Country\"": "United States",
    "\"City\"": "Roswell",
    "\"State\"": "Georgia",
    "\"Postal Code\"": 30076,
    "\"Region\"": "South",
    "\"Product ID\"": "TEC-PH-10001425",
    "\"Category\"": "Technology",
    "\"Sub-Category\"": "Phones",
    "\"Product Name\"": "Mophie Juice Pack Helium for iPhone",
    "\"Sales\"": 239.96999999999997,
    "\"Quantity\"": 3,
    "\"Discount\"": 0.0,
    "\"Profit\"": 67.1916
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 1122,
    "\"Order ID\"": "US-2014-147627",
    "\"Order Date\"": "2014-01-20",
    "\"Ship Date\"": "2014-01-26",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "HL-15040",
    "\"Customer Name\"": "Hunter Lopez",
    "\"Segment\"": "Consumer",
    "\"Country\"": "United States",
    "\"City\"": "Jonesboro",
    "\"State\"": "Arkansas",
    "\"Postal Code\"": 72401,
    "\"Region\"": "South",
    "\"Product ID\"": "TEC-PH-10001061",
    "\"Category\"": "Technology",
    "\"Sub-Category\"": "Phones",
    "\"Product Name\"": "Apple iPhone 5C",
    "\"Sales\"": 699.93,
    "\"Quantity\"": 7,
    "\"Discount\"": 0.0,
    "\"Profit\"": 181.9818
  }
]
```

## Dashboard Architecture

### State Management
Create a global filter context or state object `DashboardFilters`:
```typescript
interface DashboardFilters {
  year?: number | 'All';
  month?: number | 'All'; // 1-12
  category?: string[];
  region?: string[];
  state?: string[];
  subCategory?: string[];
}
```

### Interaction Logic
- **Filter Actions:** Clicking on a visual element (bar, pie slice, text) in any worksheet should trigger a filter update.
- **Target:** All worksheets should react to these filters by re-aggregating the data based on the active filters.
- **Specific Mappings (derived from Tableau Actions):**
  - `Year` sheet: Filters `year`.
  - `Month` sheet: Filters `month`.
  - `Sales Quantity by Markets`: Filters `state`.
  - `Profit by Markets`: Filters `state`.
  - `Profit % by Category`: Filters `category`.
  - `Top 5 items by Sales`: Filters `Sub-Category` (inferred).
  - `Orders by Region & Category`: Filters `category` and `region`.
  - `Profit by Year`: Filters `year` and `month`.

## Component Specifications

### 1. Main Layout (`SuperstoreSalesInsightDashboard`)
- **Layout:** CSS Grid.
- **Structure:**
  - **Header:** Title "Superstore Sales Insight Dashboard".
  - **Top Row:** `Year` (Left), `Month` (Right).
  - **Middle Row:** `Sales Quantity` (KPI), `Profit by Year` (Line Chart), `Profit % by Category` (Pie Chart).
  - **Bottom Row:** `Orders by Region & Category`, `Profit by Markets`, `Sales Quantity by Markets`, `Top 5 items by Sales`.

### 2. Worksheet: `Year`
- **Type:** Horizontal List of Years (Text).
- **Data:** Extract unique years from `Order Date`.
- **Visuals:** List of years. Bold text. Active state styling.
- **Interaction:** Click to filter the dashboard by that year.

### 3. Worksheet: `Month`
- **Type:** Horizontal List of Months (Text).
- **Data:** Extract unique months (Jan, Feb, etc.) from `Order Date`.
- **Visuals:** List of 3-letter month abbreviations. Bold text. Active state styling.
- **Interaction:** Click to filter the dashboard by that month.

### 4. Worksheet: `Sales Quantity`
- **Type:** KPI / Big Number.
- **Measure:** Sum of `Quantity`.
- **Visuals:**
  - Label: "Sales Quantity" (Bold, smaller font).
  - Value: The aggregated sum (Bold, large font, Color: `#8138f7`).

### 5. Worksheet: `Profit by Year`
- **Type:** Line Chart (or Area Chart).
- **X-Axis:** `Order Date` (Month/Year hierarchy).
- **Y-Axis:** Sum of `Profit`.
- **Color:** Fixed `#8138f7`.
- **Tooltips:** Show Month, Year, and Profit value.
- **Interaction:** Click on a data point to filter by that specific Year and Month.

### 6. Worksheet: `Profit % by Category`
- **Type:** Pie Chart.
- **Measure:** Sum of `Profit` (determines angle).
- **Dimension:** `Category` (determines slice).
- **Labels:** Percentage of Total Profit.
- **Colors:**
  - Furniture: `#4e79a7`
  - Technology: `#e15759`
  - Office Supplies: `#f28e2b`
- **Interaction:** Click a slice to filter by that Category.

### 7. Worksheet: `Orders by Region & Category`
- **Type:** Horizontal Bar Chart (Stacked or Grouped, likely Stacked based on standard Superstore viz).
- **X-Axis:** Count of `Order ID`.
- **Y-Axis:** `Region`.
- **Color:** `Category` (Use colors defined above).
- **Labels:** Show count on bars.
- **Interaction:** Click a bar segment to filter by that Region and Category.

### 8. Worksheet: `Profit by Markets`
- **Type:** Horizontal Bar Chart.
- **X-Axis:** Sum of `Profit`.
- **Y-Axis:** `State`.
- **Sort:** Descending by Profit.
- **Color:** Fixed `#8138f7`.
- **Tooltips:** State Name and Profit value.
- **Interaction:** Click a bar to filter by that State.

### 9. Worksheet: `Sales Quantity by Markets`
- **Type:** Horizontal Bar Chart.
- **X-Axis:** Sum of `Quantity`.
- **Y-Axis:** `State`.
- **Sort:** Descending by Quantity.
- **Color:** Fixed `#8138f7`.
- **Interaction:** Click a bar to filter by that State.

### 10. Worksheet: `Top 5 items by Sales` (Inferred)
- **Type:** Horizontal Bar Chart.
- **X-Axis:** Sum of `Sales`.
- **Y-Axis:** `Product Name` (or `Sub-Category` if Product Name is too granular, but usually Product Name for this specific viz).
- **Filter:** Limit to Top 5 by Sales.
- **Color:** Fixed `#8138f7`.
- **Interaction:** Click a bar to filter by that Product/Sub-Category.

## Implementation Details

- **Aggregation:** Since the source data is transactional, you must aggregate data inside the components or a utility function before rendering. Use `d3.rollup` or `Array.reduce`.
- **Date Handling:** Parse `Order Date` strings into Date objects to extract Year and Month.
- **Responsiveness:** Use `viewBox` for SVG charts to ensure they scale correctly within their grid cells.
- **Styling:** Keep the background transparent (`#00000000` as per workbook). Use standard sans-serif fonts (Arial, Helvetica, sans-serif).

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_8239/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Month
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[mn:Order Date:ok]`
- series_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[Action (Blank,YEAR(Order Date))]`
- zone: x=5781, y=3472, w=85469, h=3750
- highlight_fields: [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Calculation_6943002545466433537:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Orders by Region & Category
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[cnt:Order ID:qk]`
- cols_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Region:nk]`
- series_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Category:nk]`
- bar_orientation: `vertical`
- zone: x=57734, y=67917, w=32031, h=31806
- highlight_fields: [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Category:nk], [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Order ID:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Profit % by Category
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Category:nk]`
- zone: x=54375, y=35972, w=18281, h=34028
- legend_required: true
- legend_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Category:nk]`
- legend_relative_position: overlay
- highlight_fields: [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Category:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Profit by Markets
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:State:nk]`
- cols_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[sum:Profit:qk]`
- series_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[Action (Blank,YEAR(Order Date))]`
- bar_orientation: `horizontal`
- zone: x=156, y=30000, w=25156, h=69722
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Profit by Year
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[sum:Profit:qk]`
- cols_field: `([federated.0r0vorq1eq42zb19jd94c0imcrwu].[yr:Order Date:ok] / [federated.0r0vorq1eq42zb19jd94c0imcrwu].[mn:Order Date:ok])`
- series_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[Action (Blank,YEAR(Order Date))]`
- bar_orientation: `vertical`
- zone: x=50547, y=6944, w=45391, h=27500
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sales Quantity
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[Action (Blank,YEAR(Order Date))]`
- zone: x=29453, y=19028, w=16250, h=11250
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: Sales Quantity by Markets
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:State:nk]`
- cols_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[sum:Quantity:qk]`
- series_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[Action (Blank,YEAR(Order Date))]`
- bar_orientation: `horizontal`
- zone: x=27266, y=30139, w=25078, h=69722
- highlight_fields: [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:State:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Top 5 items by Sales
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Sub-Category:nk]`
- zone: x=77109, y=36250, w=18594, h=33750
- highlight_fields: [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Sub-Category:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Total Profit
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[Action (Blank,YEAR(Order Date))]`
- zone: x=6875, y=19306, w=13984, h=11667
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: Year
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[yr:Order Date:ok]`
- series_field: `[federated.0r0vorq1eq42zb19jd94c0imcrwu].[Action (Blank,MONTH(Order Date))]`
- zone: x=40234, y=-417, w=17891, h=3889
- highlight_fields: [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Calculation_6943002545466433537:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=781, y=8056, w=26094, h=10278): Sales Insights Dashboard
- zone(x=25313, y=9028, w=24922, h=8889): Data Viz. for Tableau Dataset: Sample - Superstore
- zone(x=85703, y=7500, w=9141, h=4167): © Sagar Tanna
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Year, target=Superstore Sales Insight Dashboard
- Filter 2 (generated): kind=filter_action, source=Month, target=Superstore Sales Insight Dashboard
- Filter 3 (generated): kind=filter_action, source=Sales Quantity by Markets, target=Superstore Sales Insight Dashboard
- Filter 4 (generated): kind=filter_action, source=Profit by Markets, target=Superstore Sales Insight Dashboard
- Filter 5 (generated): kind=filter_action, source=Profit % by Category, target=Superstore Sales Insight Dashboard
- Filter 6 (generated): kind=filter_action, source=Top 5 items by Sales, target=Superstore Sales Insight Dashboard
- Filter 7 (generated): kind=filter_action, source=Orders by Region & Category, target=Superstore Sales Insight Dashboard
- Filter 8 (generated): kind=filter_action, source=Profit by Year, target=Superstore Sales Insight Dashboard
## Highlight Bindings
- Sales Quantity by Markets: [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:State:nk]
- Top 5 items by Sales: [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Sub-Category:nk]
- Orders by Region & Category: [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Category:nk], [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Order ID:nk]
- Profit % by Category: [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Category:nk]
- Year: [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Calculation_6943002545466433537:nk]
- Month: [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Calculation_6943002545466433537:nk]
- Profit % by Category: [federated.0r0vorq1eq42zb19jd94c0imcrwu].[none:Category:nk]
