# Project Requirements

You are an expert React and TypeScript developer. Your task is to implement a dashboard that exactly replicates the functionality and layout of a specific Tableau workbook.

**Tech Stack:**
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (specifically `d3-scale`, `d3-axis`, `d3-shape`, `d3-array`, `d3-dsv`)
- CSS (CSS Modules or standard CSS)

**Data Source:**
The data is located at `/data/Global Library Data_ST_Blanks_Country_Data.csv`.

**Data Loading:**
You must implement a data loading utility that fetches the CSV file, parses it using `d3.csvParse`, and converts numeric strings to numbers. The data contains the following columns: `Country`, `Region`, `Expenditures  (US Dollars)`, `Total Libraries`, `Total Librarians`, `Total Volumes`, `Total Users`.

Example Data Loading Code:
```typescript
import { csvParse } from 'd3-dsv';

interface LibraryData {
  Country: string;
  Region: string;
  'Expenditures  (US Dollars)': number;
  'Total Libraries': number;
  'Total Librarians': number;
  'Total Volumes': number;
  'Total Users': number;
}

export const fetchData = async (): Promise<LibraryData[]> => {
  const response = await fetch('/data/Global Library Data_ST_Blanks_Country_Data.csv');
  const csvText = await response.text();
  const rawData = csvParse(csvText);
  
  return rawData.map((d: any) => ({
    Country: d.Country,
    Region: d.Region,
    'Expenditures  (US Dollars)': +d['Expenditures  (US Dollars)'],
    'Total Libraries': +d['Total Libraries'],
    'Total Librarians': +d['Total Librarians'],
    'Total Volumes': +d['Total Volumes'],
    'Total Users': +d['Total Users'],
  }));
};
```

**Dashboard Layout:**
The dashboard is named "Country Details by Region". It consists of a vertical layout with two main sections:
1.  **Top:** A title area with the text "Click a region to filter country data".
2.  **Middle:** A worksheet titled "Total Libraries by Region".
3.  **Bottom:** A worksheet titled "Country Details".

**Component 1: TotalLibrariesChart**
- **Type:** Horizontal Bar Chart.
- **Data Source:** Aggregated from the raw data. Group by `Region` and Sum `Total Libraries`.
- **Visual Encoding:**
  - Y-Axis: `Region` (Categorical).
  - X-Axis: `Total Libraries` (Quantitative, Sum).
  - Marks: Bars.
- **Sorting:** Regions must be sorted in Descending order by the Sum of `Total Libraries`.
- **Interaction:** Clicking a bar triggers a filter action. It should update the global state `selectedRegion`.
- **Implementation Details:** Use D3 scales (`scaleBand` for Y, `scaleLinear` for X). Render using SVG `<rect>` elements. Include axes.

**Component 2: CountryDetailsTable**
- **Type:** Text Table / Data Grid.
- **Data Source:** Filtered by `selectedRegion`. If no region is selected, show all (or default to 'Middle East' as per the workbook default state).
- **Columns:**
  1. `Country`
  2. `Expenditures  (US Dollars)` (Sum)
  3. `Total Users` (Sum)
  4. `Total Volumes` (Sum)
- **Sorting:** Rows must be sorted in Descending order by `Total Volumes`.
- **Visual Encoding:** Plain text labels.
- **Implementation Details:** Render as a standard HTML `<table>` or a grid of divs. Ensure headers match the column names exactly.

**State Management:**
- `data`: The full array of `LibraryData` objects.
- `selectedRegion`: string | null. Defaults to 'Middle East'.

**Styling:**
- Use a clean, sans-serif font (e.g., Arial, Helvetica, sans-serif).
- Ensure the layout is responsive but maintains the vertical stacking order.
- The top chart should take up approximately 50% of the height, the bottom table the other 50%.

**Sample Data:**
```json
[
  {
    "﻿Country": "Latvia",
    "Region": "Europe",
    "Expenditures \n(US Dollars)": 26084992.0,
    "Total Libraries": 1942,
    "Total Librarians": 3430.0,
    "Total Volumes": 23380116,
    "Total Users": 1162674.0
  },
  {
    "﻿Country": "Myanmar",
    "Region": "Asia",
    "Expenditures \n(US Dollars)": 9564.0,
    "Total Libraries": 3745,
    "Total Librarians": "",
    "Total Volumes": 15314120,
    "Total Users": 11793.0
  },
  {
    "﻿Country": "Mauritius",
    "Region": "Africa",
    "Expenditures \n(US Dollars)": 610649.0,
    "Total Libraries": 113,
    "Total Librarians": 29.0,
    "Total Volumes": 1275862,
    "Total Users": 260449.0
  },
  {
    "﻿Country": "Montserrat",
    "Region": "Latin America",
    "Expenditures \n(US Dollars)": "",
    "Total Libraries": 1,
    "Total Librarians": "",
    "Total Volumes": 15000,
    "Total Users": ""
  },
  {
    "﻿Country": "Solomon Islands",
    "Region": "Oceania",
    "Expenditures \n(US Dollars)": 84400.0,
    "Total Libraries": 33,
    "Total Librarians": 16.0,
    "Total Volumes": 165500,
    "Total Users": 4499.0
  },
  {
    "﻿Country": "Samoa",
    "Region": "Oceania",
    "Expenditures \n(US Dollars)": "",
    "Total Libraries": 41,
    "Total Librarians": "",
    "Total Volumes": 177500,
    "Total Users": ""
  },
  {
    "﻿Country": "Denmark",
    "Region": "Europe",
    "Expenditures \n(US Dollars)": 752339642.0,
    "Total Libraries": 2216,
    "Total Librarians": 3205.0,
    "Total Volumes": 105606220,
    "Total Users": 2541602.0
  },
  {
    "﻿Country": "Barbados",
    "Region": "Latin America",
    "Expenditures \n(US Dollars)": 55262617.0,
    "Total Libraries": 19,
    "Total Librarians": 42.0,
    "Total Volumes": 767862,
    "Total Users": 431624.0
  },
  {
    "﻿Country": "Bermuda",
    "Region": "North America",
    "Expenditures \n(US Dollars)": 1103000.0,
    "Total Libraries": 28,
    "Total Librarians": 15.0,
    "Total Volumes": 387800,
    "Total Users": 118508.0
  },
  {
    "﻿Country": "El Salvador",
    "Region": "Latin America",
    "Expenditures \n(US Dollars)": "",
    "Total Libraries": 396,
    "Total Librarians": 0.0,
    "Total Volumes": 951500,
    "Total Users": 137905.0
  }
]
```

**Instructions:**
1.  Set up the Vite project structure.
2.  Create the data fetching logic.
3.  Implement the `TotalLibrariesChart` component using D3.js.
4.  Implement the `CountryDetailsTable` component.
5.  Create the main `Dashboard` component to manage state and layout.
6.  Ensure the filtering interaction works (clicking a bar filters the table).

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_refine_334/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Country Details
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0xur38p0m5fgy31bel3po020k9qv].[none:Country:nk]`
- cols_field: `[federated.0xur38p0m5fgy31bel3po020k9qv].[:Measure Names]`
- series_field: `[federated.0xur38p0m5fgy31bel3po020k9qv].[:Measure Names]`
- zone: x=800, y=53937, w=98400, h=45063
- highlight_fields: [federated.0xur38p0m5fgy31bel3po020k9qv].[none:Country:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Total Libraries by Region
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0xur38p0m5fgy31bel3po020k9qv].[none:Region:nk]`
- cols_field: `[federated.0xur38p0m5fgy31bel3po020k9qv].[sum:Total Libraries:qk]`
- bar_orientation: `horizontal`
- zone: x=800, y=8875, w=98400, h=45062
- highlight_fields: [federated.0xur38p0m5fgy31bel3po020k9qv].[none:Region:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Total Libraries by Region, target=Country Details by Region
## Highlight Bindings
- Total Libraries by Region: [federated.0xur38p0m5fgy31bel3po020k9qv].[none:Region:nk]
- Country Details: [federated.0xur38p0m5fgy31bel3po020k9qv].[none:Country:nk]
