# Project Requirements

You are a Senior React Engineer tasked with recreating a Tableau dashboard titled "Tourism In Canada - Provinicial Tourism Demand Growth Rates (2014-17) & Tourist Demand Origins".

The application must be built using React, TypeScript, and Vite. Use D3.js (d3-scale, d3-shape, d3-axis, d3-array) for all visualizations. Do not use high-level chart libraries like Recharts or Nivo unless necessary for complex interactions, but prefer D3 primitives.

## Data Loading

The primary data source is a CSV file located at `/data/df.csv`.

1.  **Fetch & Parse**: Use `d3-dsv` (or native fetch + string parsing) to load the CSV.
2.  **Type Definition**: Define a TypeScript interface `DataRow` matching the CSV columns:
    - `F1`: number
    - `Year`: string (format 'yyyy', parse to Date object)
    - `Location`: string
    - `Indicators`: string
    - `Products`: string
    - `UOM`: string
    - `Scalar Factor`: string
    - `Value`: number
3.  **Data Transformation**:
    - **Location Grouping**: Create a calculated field `LocationGroup`.
        - Map "Alberta" -> "Alberta"
        - Map "British Columbia" -> "British Columbia"
        - Map "Ontario" -> "Ontario"
        - Map "Quebec" -> "Quebec"
        - All others -> "Other"
    - **Filtering**:
        - For the "Breakdown" (Pie) chart: Filter `Indicators` to include ONLY: "Domestic demand", "International demand (exports)", "Interprovincial demand (exports)", "Total demand". Exclude "Other" locations.
        - For "Total Demand" and "Growth Rates": Filter `Indicators` to "Total demand".
    - **Calculations**:
        - **Percent of Total (for Pie)**: For each Location, calculate `Value / Sum(Value)` for the filtered Indicators.
        - **Growth Rate (for Line Chart)**: Calculate the year-over-year percentage difference for `Value`. Formula: `(CurrentYearValue - PreviousYearValue) / PreviousYearValue`.

## Sample Data

```json
[
  {
    "": 2873,
    "Year": 2014,
    "Location": "Saskatchewan",
    "Indicators": "Tourism product ratio",
    "Products": "Convention fees",
    "UOM": "Percentage",
    "Scalar Factor": "millions",
    "Value": 63.7
  },
  {
    "": 3770,
    "Year": 2014,
    "Location": "Yukon",
    "Indicators": "Interprovincial imports",
    "Products": "Pre-trip expenses",
    "UOM": "Dollars",
    "Scalar Factor": "millions",
    "Value": 0.0
  },
  {
    "": 6861,
    "Year": 2017,
    "Location": "Manitoba",
    "Indicators": "Interprovincial demand (exports)",
    "Products": "Motels",
    "UOM": "Dollars",
    "Scalar Factor": "millions",
    "Value": 5.8
  },
  {
    "": 256,
    "Year": 2014,
    "Location": "Canada",
    "Indicators": "International imports",
    "Products": "Total tourism expenditures",
    "UOM": "Dollars",
    "Scalar Factor": "millions",
    "Value": 47595.2
  },
  {
    "": 559,
    "Year": 2014,
    "Location": "Newfoundland and Labrador",
    "Indicators": "Interprovincial imports",
    "Products": "Other accommodation",
    "UOM": "Dollars",
    "Scalar Factor": "millions",
    "Value": 2.4
  },
  {
    "": 2727,
    "Year": 2014,
    "Location": "Saskatchewan",
    "Indicators": "International demand (exports)",
    "Products": "Taxis",
    "UOM": "Dollars",
    "Scalar Factor": "millions",
    "Value": 0.4
  },
  {
    "": 381,
    "Year": 2014,
    "Location": "Newfoundland and Labrador",
    "Indicators": "Total demand",
    "Products": "Beer, wine, and liquor from stores",
    "UOM": "Dollars",
    "Scalar Factor": "millions",
    "Value": 18.4
  },
  {
    "": 6701,
    "Year": 2017,
    "Location": "Ontario",
    "Indicators": "Tourism product ratio",
    "Products": "Motels",
    "UOM": "Percentage",
    "Scalar Factor": "millions",
    "Value": 86.1
  },
  {
    "": 6462,
    "Year": 2017,
    "Location": "Ontario",
    "Indicators": "Total demand",
    "Products": "Urban transit and parking",
    "UOM": "Dollars",
    "Scalar Factor": "millions",
    "Value": 87.0
  },
  {
    "": 3448,
    "Year": 2014,
    "Location": "British Columbia",
    "Indicators": "Interprovincial imports",
    "Products": "Travel services",
    "UOM": "Dollars",
    "Scalar Factor": "millions",
    "Value": 215.1
  }
]
```

## Dashboard Layout & Components

The dashboard layout should use CSS Grid to approximate the Tableau "Tiled" layout.

**Global Styles**:
- Font: Sans-serif (Arial, Helvetica, sans-serif).
- Background Color: `#f7faf0` (Light greenish tint).
- Title Color: `#59a14f` (Green).
- Text Color: `#333`.

**Main Container**:
- Header: Title "Tourism In Canada - Provinicial Tourism Demand Growth Rates (2014-17) & Tourist Demand Origins".
- Grid Layout: 2 Columns (Main Content ~75%, Sidebar ~25%).

### Main Content Area (Left Column)

**1. Top Row**:
- **Left: Total Tourism Demand (2014-17)**
    - **Type**: Small Multiples Bar Chart (Trellis).
    - **Layout**: Grid of Bar Charts. Rows = Locations, Columns = Years (2014, 2015, 2016, 2017).
    - **Encoding**:
        - X-Axis: `Value` (Total Tourism Demand).
        - Y-Axis: `Location` (Label).
        - Color: `LocationGroup` (See Color Palette below).
        - Title: "Total Tourism Demand (2014-17)".
    - **Interactions**: Hovering a bar highlights the corresponding Location Group in other charts.

- **Right: Provincial Tourism Growth Rates (2014-17)**
    - **Type**: Line Chart.
    - **Encoding**:
        - X-Axis: `Year` (2014-2017).
        - Y-Axis: `GrowthRate` (Percentage).
        - Color: `LocationGroup` (Lines colored by group).
        - Title: "Provinicial Tourism Growth Rates" (Note: Preserve typo).
    - **Interactions**: Hovering a line highlights the corresponding Location Group.

**2. Bottom Row**:
- **Left: Breakdown of Where Tourism Demand Comes From -**
    - **Type**: Small Multiples Pie Chart.
    - **Layout**: One Pie Chart per selected `LocationGroup` (arranged horizontally).
    - **Encoding**:
        - Slices: `Indicators` (Domestic, International, Interprovincial, Total).
        - Angle: `PercentOfTotal`.
        - Color: `Indicators` (See Color Palette below).
        - Labels: Show percentage or label if space permits.
    - **Interactions**: Hovering a slice highlights the specific Indicator.

- **Right: Conclusion Text**
    - **Type**: Static Text Component.
    - **Content**:
        "Conclusion:
        Q#1 Highest Growth: Of the selected high demand provinces highlighted British Columbia has the highest tourism demand growth rate of 25% from 2014-2017. *note: Although technically the smaller greyed out provinces show a higher growth rate, their total demand compared to my chosen coloured privinces are so small I chose not to focus on them*
        Q#2 Where are majority of tourist origins: Using BC as an example, most of the tourists come from within the province (domestic) or internationally. About 41% and 38% each respectively and BC only has about 20% of tourist demand from other canadian provinces."
    - **Style**: Bold text for "Conclusion:", "Q#1...", "Q#2...". Color `#59a14f` for headers.

### Sidebar Area (Right Column)

**1. Top: Interaction Instructions**
- **Type**: Static Text Component.
- **Content**:
  "HOW TO INTERACT WITH DASHBOARD:
  Hover mouse for certain stats
  or
  Use these Legends below to interact
  -
  reset by double clicking (all)"
- **Style**: Bold, Italic, Color `#59a14f`.

**2. Middle: Image**
- **Type**: Image Component.
- **Source**: Use a placeholder image (e.g., `https://via.placeholder.com/300x200?text=Banff+Canoes`) or a local asset if available. The original references `red-canoes-of-lake-louise...`.

**3. Bottom: Filters & Legends**
- **Filter**: `Location (group) 1` Filter.
    - **Type**: Multi-select Checkbox List or Dropdown.
    - **Options**: Alberta, British Columbia, Ontario, Quebec, Other.
    - **Behavior**: Selecting/Deselecting updates all charts in the Main Content Area.
- **Legend 1**: Location (most demand).
    - **Type**: Color Legend.
    - **Items**: Alberta (#9467bd), British Columbia (#e377c2), Ontario (#2ca02c), Quebec (#17becf), Other (#c7c7c7).
- **Legend 2**: Indicators (for Pie Chart).
    - **Type**: Color Legend.
    - **Items**: Domestic demand (#87d180), International demand (exports) (#4e9f50), Interprovincial demand (exports) (#3ca8bc), Total demand (#26897e).

## Color Palette

Strictly adhere to these hex codes derived from the Tableau XML:

**Location Groups**:
- Quebec: `#17becf`
- Ontario: `#2ca02c`
- Alberta: `#9467bd`
- British Columbia: `#e377c2`
- Other: `#c7c7c7`

**Indicators (Pie Chart)**:
- Interprovincial imports: `#26897e`
- Interprovincial demand (exports): `#3ca8bc`
- Total demand: `#3ca8bc`
- International demand (exports): `#4e9f50`
- Domestic demand: `#87d180`

## Implementation Details

- **State Management**: Use React `useState` to hold the `rawData`, `filteredData`, and `selectedLocationGroups`.
- **Responsiveness**: Ensure the grid collapses to a single column on smaller screens (Tableau "Phone" layout behavior).
- **D3 Integration**: Use `useRef` to select SVG elements and `useEffect` to render/update charts when data or state changes.
- **Tooltip**: Implement a custom tooltip component that follows the mouse cursor to display values (Location, Year, Value, Growth Rate, Indicator, etc.).

Your task is to generate the complete code structure for this dashboard, including the data loading logic, the main layout component, and the individual chart components using D3.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/df.csv

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
const rows = await loadCsv("/data/df.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_1979/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Breakdown of Where Tourism Demand Comes From - 
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.1jxzz030pj39fl1gdog6e0w941ap].[Location (group) 1]`
- cols_field: ``
- series_field: `[federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Indicators:nk]`
- category_order: British Columbia, Ontario, Alberta, Quebec
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: Provinces with Highest Demand (2017)
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.1jxzz030pj39fl1gdog6e0w941ap].[Latitude (generated)]`
- cols_field: `[federated.1jxzz030pj39fl1gdog6e0w941ap].[Longitude (generated)]`
- series_field: `[federated.1jxzz030pj39fl1gdog6e0w941ap].[max:Value:qk]`
- highlight_fields: [federated.1jxzz030pj39fl1gdog6e0w941ap].[max:Value:qk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Indicators:nk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Location:nk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[tyr:Year:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Provincial Tourism Growth Rates (2014-17)
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Indicators:nk] * [federated.1jxzz030pj39fl1gdog6e0w941ap].[pcdf:max:Value:qk:1])`
- cols_field: `[federated.1jxzz030pj39fl1gdog6e0w941ap].[tyr:Year:qk]`
- series_field: `[federated.1jxzz030pj39fl1gdog6e0w941ap].[Location (group) 1]`
- bar_orientation: `horizontal`
- axis_title_rows: Tourism Demand Growth Rates
- axis_title_cols: Year (2014 - 2017)
- zone: x=36478, y=10845, w=37272, h=46723
- highlight_fields: [federated.1jxzz030pj39fl1gdog6e0w941ap].[Location (group) 1], [federated.1jxzz030pj39fl1gdog6e0w941ap].[tyr:Year:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Total Tourism Demand (2014-17)
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Location:nk] / [federated.1jxzz030pj39fl1gdog6e0w941ap].[yr:Year:ok])`
- cols_field: `([federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Indicators:nk] * [federated.1jxzz030pj39fl1gdog6e0w941ap].[max:Value:qk])`
- series_field: `[federated.1jxzz030pj39fl1gdog6e0w941ap].[Location (group) 1]`
- bar_orientation: `horizontal`
- axis_title_cols: Total Tourism Demand (In Millions)
- zone: x=667, y=10845, w=35811, h=46723
- legend_required: true
- legend_field: `[federated.1jxzz030pj39fl1gdog6e0w941ap].[Location (group) 1]`
- legend_relative_position: below
- highlight_fields: [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Indicators:nk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Location:nk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Products:nk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Year:qk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[Location (group) 1]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored below the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Text Zones
- zone(x=37202, y=57568, w=36548, h=41156): Conclusion: Q#1 Highest Growth: Of the selected high demand provinces highlighted British Columbia has the highest tourism demand growth rate of 25% from 2014-2017. *note: Although technically the smaller greyed out provinces show a higher growth rate, their total demand compared to my chosen coloured privinces are so small I chose not to focus on them* Q#2 Where are majority of tourist origins: Using BC as an example, most of the tourists come from within the province (domestic) or internationally. About 41% and 38% each respectively and BC only has about 20% of tourist demand from other canadian provinces.
- zone(x=73750, y=10845, w=25583, h=21691): HOW TO INTERACT WITH DASHBOARD: Hover mouse for certain stats or Use these Legends below to interact - reset by double clicking (all)
## Dashboard Actions
- Highlight 1 (generated): kind=highlight_brush, source=Tourism In Canada - What Provinces have the highest growth rates from 2014-17? Where do most of the tourists originate from in BC?, target=Tourism In Canada - What Provinces have the highest growth rates from 2014-17? Where do most of the tourists originate from in BC?
  fields: Location (group) 1
## Highlight Bindings
- Total Tourism Demand (2014-17): [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Indicators:nk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Location:nk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Products:nk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Year:qk]
- Provincial Tourism Growth Rates (2014-17): [federated.1jxzz030pj39fl1gdog6e0w941ap].[Location (group) 1], [federated.1jxzz030pj39fl1gdog6e0w941ap].[tyr:Year:qk]
- Provinces with Highest Demand (2017): [federated.1jxzz030pj39fl1gdog6e0w941ap].[max:Value:qk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Indicators:nk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Location:nk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[tyr:Year:qk]
- Breakdown of Where Tourism Demand Comes From - : [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Indicators:nk]
- Total Tourism Demand (2014-17): [federated.1jxzz030pj39fl1gdog6e0w941ap].[Location (group) 1]
- Breakdown of Where Tourism Demand Comes From - : [federated.1jxzz030pj39fl1gdog6e0w941ap].[none:Indicators:nk], [federated.1jxzz030pj39fl1gdog6e0w941ap].[tyr:Year:qk]
