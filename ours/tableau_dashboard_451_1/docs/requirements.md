# Project Requirements

You are a senior React engineer tasked with rebuilding a Tableau dashboard exactly as defined in the provided XML.

## Tech Stack
- React 18+ with TypeScript.
- Vite for build tooling.
- D3.js (v7+) for visualizations (use `d3-scale`, `d3-shape`, `d3-axis`, `d3-geo`, `d3-array`).
- CSS for styling (CSS Modules or Tailwind is acceptable, but standard CSS is preferred for exact layout matching).
- No UI component libraries (e.g., Ant Design) unless necessary for basic inputs.

## Data Loading

The primary data source is a CSV file located at `/data/TEMP_0nc2r4718q3tv71etu3qn12v6eqk.csv`.

1.  **Fetch**: Use `fetch()` to load the CSV.
2.  **Parse**: Use `d3.csvParse` to parse the raw text.
3.  **Type Conversion**: Ensure `Order Date` and `Ship Date` are parsed into JavaScript Date objects. Convert `Sales`, `Profit`, `Quantity`, and `Discount` to numbers.
4.  **Calculated Fields**:
    -   Create a new field `ProfitRatio` calculated as `Profit / Sales`.
    -   Create a `Year` field derived from `Order Date` (e.g., `date.getFullYear()`).
5.  **Filtering**: The dashboard defaults to filtering data where `Year === 2017`.

## Sample Data

```json
[
  {
    "﻿\"\"\"Row ID\"\"\"": 7191,
    "\"Order ID\"": "CA-2018-164399",
    "\"Order Date\"": "2018-11-12",
    "\"Ship Date\"": "2018-11-15",
    "\"Ship Mode\"": "First Class",
    "\"Customer ID\"": "DW-13480",
    "\"Customer Name\"": "Dianna Wilson",
    "\"Segment\"": "Home Office",
    "\"Country/Region\"": "United States",
    "\"City\"": "San Diego",
    "\"State\"": "California",
    "\"Postal Code\"": 92024.0,
    "\"Region\"": "West",
    "\"Product ID\"": "FUR-TA-10003392",
    "\"Category\"": "Furniture",
    "\"Sub-Category\"": "Tables",
    "\"Product Name\"": "Global Adaptabilities Conference Tables",
    "\"Sales\"": 674.3520000000001,
    "\"Quantity\"": 3,
    "\"Discount\"": 0.2,
    "\"Profit\"": -8.429400000000015
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 7479,
    "\"Order ID\"": "CA-2016-167199",
    "\"Order Date\"": "2016-01-06",
    "\"Ship Date\"": "2016-01-10",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "ME-17320",
    "\"Customer Name\"": "Maria Etezadi",
    "\"Segment\"": "Home Office",
    "\"Country/Region\"": "United States",
    "\"City\"": "Henderson",
    "\"State\"": "Kentucky",
    "\"Postal Code\"": 42420.0,
    "\"Region\"": "South",
    "\"Product ID\"": "TEC-PH-10004539",
    "\"Category\"": "Technology",
    "\"Sub-Category\"": "Phones",
    "\"Product Name\"": "Wireless Extenders zBoost YX545 SOHO Signal Booster",
    "\"Sales\"": 755.96,
    "\"Quantity\"": 4,
    "\"Discount\"": 0.0,
    "\"Profit\"": 204.1092
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 6571,
    "\"Order ID\"": "CA-2016-100678",
    "\"Order Date\"": "2016-04-18",
    "\"Ship Date\"": "2016-04-22",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "KM-16720",
    "\"Customer Name\"": "Kunst Miller",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "Houston",
    "\"State\"": "Texas",
    "\"Postal Code\"": 77095.0,
    "\"Region\"": "Central",
    "\"Product ID\"": "OFF-EN-10000056",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Envelopes",
    "\"Product Name\"": "Cameo Buff Policy Envelopes",
    "\"Sales\"": 149.352,
    "\"Quantity\"": 3,
    "\"Discount\"": 0.2,
    "\"Profit\"": 50.40629999999998
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 2890,
    "\"Order ID\"": "CA-2019-164049",
    "\"Order Date\"": "2019-11-02",
    "\"Ship Date\"": "2019-11-06",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "KH-16630",
    "\"Customer Name\"": "Ken Heidel",
    "\"Segment\"": "Corporate",
    "\"Country/Region\"": "United States",
    "\"City\"": "Seattle",
    "\"State\"": "Washington",
    "\"Postal Code\"": 98105.0,
    "\"Region\"": "West",
    "\"Product ID\"": "OFF-PA-10000791",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Paper",
    "\"Product Name\"": "Wirebound Message Books, Four 2 3/4 x 5 Forms per Page, 200 Sets per Book",
    "\"Sales\"": 23.849999999999998,
    "\"Quantity\"": 5,
    "\"Discount\"": 0.0,
    "\"Profit\"": 10.732499999999998
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 3686,
    "\"Order ID\"": "CA-2017-132626",
    "\"Order Date\"": "2017-07-09",
    "\"Ship Date\"": "2017-07-14",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "BT-11680",
    "\"Customer Name\"": "Brian Thompson",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "Clinton",
    "\"State\"": "Maryland",
    "\"Postal Code\"": 20735.0,
    "\"Region\"": "East",
    "\"Product ID\"": "OFF-ST-10003722",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Storage",
    "\"Product Name\"": "Project Tote Personal File",
    "\"Sales\"": 98.21,
    "\"Quantity\"": 7,
    "\"Discount\"": 0.0,
    "\"Profit\"": 28.480899999999984
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 5909,
    "\"Order ID\"": "US-2018-113985",
    "\"Order Date\"": "2018-12-02",
    "\"Ship Date\"": "2018-12-07",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "KD-16495",
    "\"Customer Name\"": "Keith Dawkins",
    "\"Segment\"": "Corporate",
    "\"Country/Region\"": "United States",
    "\"City\"": "San Jose",
    "\"State\"": "California",
    "\"Postal Code\"": 95123.0,
    "\"Region\"": "West",
    "\"Product ID\"": "OFF-AP-10001303",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Appliances",
    "\"Product Name\"": "Holmes Cool Mist Humidifier for the Whole House with 8-Gallon Output per Day, Extended Life Filter",
    "\"Sales\"": 59.699999999999996,
    "\"Quantity\"": 3,
    "\"Discount\"": 0.0,
    "\"Profit\"": 26.864999999999995
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 1221,
    "\"Order ID\"": "CA-2016-110184",
    "\"Order Date\"": "2016-07-12",
    "\"Ship Date\"": "2016-07-16",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "BF-11170",
    "\"Customer Name\"": "Ben Ferrer",
    "\"Segment\"": "Home Office",
    "\"Country/Region\"": "United States",
    "\"City\"": "Los Angeles",
    "\"State\"": "California",
    "\"Postal Code\"": 90036.0,
    "\"Region\"": "West",
    "\"Product ID\"": "OFF-ST-10000107",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Storage",
    "\"Product Name\"": "Fellowes Super Stor/Drawer",
    "\"Sales\"": 249.75,
    "\"Quantity\"": 9,
    "\"Discount\"": 0.0,
    "\"Profit\"": 44.95499999999998
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 7780,
    "\"Order ID\"": "CA-2018-139381",
    "\"Order Date\"": "2018-04-18",
    "\"Ship Date\"": "2018-04-22",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "RF-19840",
    "\"Customer Name\"": "Roy Französisch",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "Chesapeake",
    "\"State\"": "Virginia",
    "\"Postal Code\"": 23320.0,
    "\"Region\"": "South",
    "\"Product ID\"": "OFF-AP-10001271",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Appliances",
    "\"Product Name\"": "Eureka The Boss Cordless Rechargeable Stick Vac",
    "\"Sales\"": 203.92,
    "\"Quantity\"": 4,
    "\"Discount\"": 0.0,
    "\"Profit\"": 55.058400000000006
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 5890,
    "\"Order ID\"": "CA-2018-166625",
    "\"Order Date\"": "2018-04-14",
    "\"Ship Date\"": "2018-04-17",
    "\"Ship Mode\"": "First Class",
    "\"Customer ID\"": "JM-15580",
    "\"Customer Name\"": "Jill Matthias",
    "\"Segment\"": "Consumer",
    "\"Country/Region\"": "United States",
    "\"City\"": "Baltimore",
    "\"State\"": "Maryland",
    "\"Postal Code\"": 21215.0,
    "\"Region\"": "East",
    "\"Product ID\"": "OFF-BI-10002414",
    "\"Category\"": "Office Supplies",
    "\"Sub-Category\"": "Binders",
    "\"Product Name\"": "GBC ProClick Spines for 32-Hole Punch",
    "\"Sales\"": 25.06,
    "\"Quantity\"": 2,
    "\"Discount\"": 0.0,
    "\"Profit\"": 11.778199999999998
  },
  {
    "﻿\"\"\"Row ID\"\"\"": 9214,
    "\"Order ID\"": "CA-2016-144071",
    "\"Order Date\"": "2016-12-08",
    "\"Ship Date\"": "2016-12-15",
    "\"Ship Mode\"": "Standard Class",
    "\"Customer ID\"": "DJ-13420",
    "\"Customer Name\"": "Denny Joy",
    "\"Segment\"": "Corporate",
    "\"Country/Region\"": "United States",
    "\"City\"": "San Francisco",
    "\"State\"": "California",
    "\"Postal Code\"": 94110.0,
    "\"Region\"": "West",
    "\"Product ID\"": "FUR-FU-10000758",
    "\"Category\"": "Furniture",
    "\"Sub-Category\"": "Furnishings",
    "\"Product Name\"": "DAX Natural Wood-Tone Poster Frame",
    "\"Sales\"": 79.44,
    "\"Quantity\"": 3,
    "\"Discount\"": 0.0,
    "\"Profit\"": 28.598399999999994
  }
]
```

## Dashboard Layout & Architecture

The dashboard is named "Dashboard 1" and uses a fixed size of 1000x800 pixels.

**Layout Structure (CSS Grid/Flex):**
- **Container**: Fixed size 1000px x 800px. Background color should be neutral (white or very light gray).
- **Grid Areas**:
    - `map-sale`: Occupies the top-left large area.
    - `sale-region`: Occupies the bottom-left area.
    - `sidebar`: Occupies the right side.

**Zone Mapping (approximate coordinates from XML):**
1.  **Map Sale (Top Left)**:
    -   Component: `MapSale`
    -   Position: Top-Left.
    -   Size: Large, dominant area.
2.  **Sale Region (Bottom Left)**:
    -   Component: `SaleRegion`
    -   Position: Below Map Sale.
    -   Size: Horizontal strip.
3.  **Filter (Right Side)**:
    -   Component: `YearFilter`
    -   Position: Right side, vertically centered relative to the map.
    -   Type: Radio list (Single select).
    -   Field: `Order Date` (Year).
4.  **Navigation Button (Bottom Right)**:
    -   Component: `NavButton`
    -   Position: Bottom Right corner.
    -   Text: "Go to dashboard 2"

## Component Specifications

### 1. MapSale (`MapSale.tsx`)
- **Type**: Filled Map (Choropleth) of the United States.
- **Data Source**: You will need a GeoJSON file of US States. Since it is not in the provided CSV, fetch a standard US States GeoJSON (e.g., from `https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json`) to render the map geometry.
- **Visual Encodings**:
    -   **Color**: Encoded by `SUM([Sales])`. Use a sequential color scale (e.g., Blue or Green). The XML suggests a specific palette, but a standard D3 sequential scale (interpolateBlues) is acceptable if the exact hex codes aren't available in the palette definition. *Correction*: The XML defines specific colors for measures in the datasource style, but for the map, it uses `SUM([Sales])`. Use a diverging or sequential scale that fits the data range.
    -   **Labels**: Display the following text on the map marks (States):
        -   State Name (e.g., "California")
        -   Sales (formatted as currency)
        -   Profit (formatted as currency)
        -   ProfitRatio (formatted as percentage)
    -   **Tooltip**: Show State, Sales, Profit, and ProfitRatio on hover.
- **Interactions**:
    -   **Filter**: This sheet is the *target* of the "Filter 1" action. It should react to the `hoveredRegion` state passed down from the parent. When a region is hovered in the `SaleRegion` table, the map should filter to show only that region's states (or highlight them).

### 2. SaleRegion (`SaleRegion.tsx`)
- **Type**: Text Table / Crosstab.
- **Dimensions**: Rows = `Region`. Columns = `Measure Names` (Sales, Profit, ProfitRatio).
- **Visual Encodings**:
    -   **Text Color**: `#72b966` (Greenish).
    -   **Font Size**: 12px.
    -   **Gridlines**: **CRITICAL**. The XML specifies gridlines must be `solid`, `3px` width, and color `#00ffc7` (Bright Cyan). This is a very specific styling requirement.
    -   **Header**: Standard table header.
- **Interactions**:
    -   **Action Source**: This sheet is the *source* of the "Filter 1 (generated)" action.
    -   **Event**: `onHover` over a table row (Region).
    -   **Effect**: Dispatch an event/update state to filter the `MapSale` component to the specific Region being hovered.

### 3. YearFilter (`YearFilter.tsx`)
- **Type**: Radio List.
- **Data**: Unique years from the `Order Date` field.
- **Default Selection**: 2017.
- **Behavior**: Changing the selection filters both `MapSale` and `SaleRegion` to the selected year.

### 4. NavButton (`NavButton.tsx`)
- **Type**: Button.
- **Text**: "Go to dashboard 2"
- **Styling**:
    -   Background Color: `#f28e2b` (Orange).
    -   Text Color: `#f1ce63` (Yellow).
    -   Border: `1px dashed #000000` (Black dashed).
    -   Font Size: 11px.

## Global Styles
- **Font Family**: Arial.
- **Title Styling**: If titles are visible, they should be `#ff9d9a`, Bold, Underline, 16px.
- **Tooltip Styling**: Text color `#00ffc7`.

## Implementation Steps
1.  Set up the Vite + React + TypeScript project.
2.  Install D3 dependencies (`d3`, `d3-geo`, `d3-array`, etc.).
3.  Create the data loading utility in `App.tsx` or a custom hook.
4.  Implement the `MapSale` component using D3 GeoPath.
5.  Implement the `SaleRegion` component as an HTML table with the specific gridline styling.
6.  Implement the `YearFilter` component.
7.  Implement the `NavButton` component.
8.  Assemble in `Dashboard.tsx` using CSS Grid to match the layout zones.
9.  Wire up the interactions: Hovering a row in `SaleRegion` filters `MapSale`.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_451_1/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Map Sale
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.1xne2po0ilkfwt1feprz80g0671q].[Latitude (generated)]`
- cols_field: `[federated.1xne2po0ilkfwt1feprz80g0671q].[Longitude (generated)]`
- series_field: `[federated.1xne2po0ilkfwt1feprz80g0671q].[sum:Sales:qk]`
- zone: x=1500, y=1500, w=97800, h=63375
- highlight_fields: [federated.1xne2po0ilkfwt1feprz80g0671q].[none:City:nk], [federated.1xne2po0ilkfwt1feprz80g0671q].[none:Country/Region:nk], [federated.1xne2po0ilkfwt1feprz80g0671q].[none:State:nk], [federated.1xne2po0ilkfwt1feprz80g0671q].[yr:Order Date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sale Region
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.1xne2po0ilkfwt1feprz80g0671q].[none:Region:nk]`
- cols_field: `[federated.1xne2po0ilkfwt1feprz80g0671q].[:Measure Names]`
- series_field: `[federated.1xne2po0ilkfwt1feprz80g0671q].[:Measure Names]`
- series_order: [federated.1xne2po0ilkfwt1feprz80g0671q].[sum:Sales:qk], [federated.1xne2po0ilkfwt1feprz80g0671q].[sum:Profit:qk], [federated.1xne2po0ilkfwt1feprz80g0671q].[usr:Calculation_536209883642138625:qk]
- expected_series_values: [federated.1xne2po0ilkfwt1feprz80g0671q].[sum:Sales:qk], [federated.1xne2po0ilkfwt1feprz80g0671q].[sum:Profit:qk], [federated.1xne2po0ilkfwt1feprz80g0671q].[usr:Calculation_536209883642138625:qk]
- zone: x=1600, y=65375, w=50700, h=15875
- highlight_fields: [federated.1xne2po0ilkfwt1feprz80g0671q].[:Measure Names], [federated.1xne2po0ilkfwt1feprz80g0671q].[none:Region:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Sale Region, target=Dashboard 1
## Highlight Bindings
- Map Sale: [federated.1xne2po0ilkfwt1feprz80g0671q].[none:City:nk], [federated.1xne2po0ilkfwt1feprz80g0671q].[none:Country/Region:nk], [federated.1xne2po0ilkfwt1feprz80g0671q].[none:State:nk], [federated.1xne2po0ilkfwt1feprz80g0671q].[yr:Order Date:ok]
- Sale Region: [federated.1xne2po0ilkfwt1feprz80g0671q].[:Measure Names], [federated.1xne2po0ilkfwt1feprz80g0671q].[none:Region:nk]
