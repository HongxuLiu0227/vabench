# Project Requirements

You are an expert React and D3 developer. Your task is to implement a dashboard based on the provided Tableau workbook definition and data constraints.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7) for visualizations (scales, shapes, axes, selection)
- d3-dsv for CSV parsing
- react-simple-maps (for the map visualization, as it integrates D3 geo-projections with React)
- CSS (standard CSS modules or styled-components, no UI library like AntD)

## Data Loading
1.  **Source**: The primary data file is available at `/data/TEMP_16kzbk812vlpgd1bdwy9c1dlt4ya.csv`.
2.  **Parsing**: Use `d3.csvParse` to load the data.
3.  **Type Definition**: Create a TypeScript interface `DataRow` matching the CSV columns. Note that some columns have trailing spaces (e.g., `Total Discharges `, `Average Covered Charges `).
4.  **Filtering (Sepsis)**: The workbook defines a "Sepsis" group. You must filter the dataset to only include rows where `DRG Definition` matches one of the following strings exactly:
    - `870 - SEPTICEMIA OR SEVERE SEPSIS W MV 96+ HOURS`
    - `871 - SEPTICEMIA OR SEVERE SEPSIS W/O MV 96+ HOURS W MCC`
    - `872 - SEPTICEMIA OR SEVERE SEPSIS W/O MV 96+ HOURS W/O MCC`
5.  **Derived Fields**:
    - `Diagnosis`: Split `DRG Definition` by " - " and take the second part (trim whitespace).

## State Management
Use React Context or a simple state lift to manage:
- `data`: The full filtered dataset.
- `selectedStates`: A Set of strings representing the selected `Provider State`. Default to `new Set(['NJ', 'NY'])` as per the workbook's default filter.
- `selectedProvider`: An object representing a specific provider selected on the map (for the "Action 1" interaction). Default to `null`.

## Layout & Components
The dashboard "Sepsis: Interactive" consists of a vertical stack of three visualizations.

### 1. Main Container (`Dashboard.tsx`)
- **Layout**: Flexbox column (`flex-direction: column`).
- **Height**: 100vh.
- **Margins**: Apply a global margin of 8px to the container.

### 2. Map Sheet (`G-Map: Sepsis`)
- **Component**: `MapChart.tsx`
- **Library**: `react-simple-maps` with D3 `geoMercator` projection (matching the workbook's EPSG:3857).
- **Data**: Filter `data` by `selectedStates`.
- **Background**: Render a US State map (use a standard GeoJSON source like `us-atlas` or similar). Enable state boundaries and labels.
- **Marks**: Circles positioned at `[Provider Longitude, Provider Latitude]`.
- **Encodings**:
    - **Color**: `Provider State`. Use the specific color palette defined in the workbook:
        - NJ: `#ff9d9a`
        - NY: `#d37295`
        - (Include other states from the XML map if the user selects them, e.g., CT: `#b6992d`, PA: `#9d7660`, etc.)
    - **Size**: `Total Discharges `. Use a linear scale (`d3.scaleSqrt` or `d3.scaleLinear`) for radius.
- **Interactions**:
    - **Click**: Clicking a circle sets `selectedProvider` to that row's data.
    - **Hover**: Show a tooltip with `Provider Name`, `Average Medicare Payments`, and `Average Total Payments `.
- **Filter Control**: Include a dropdown or checklist to filter `selectedStates`. Default to NJ and NY.

### 3. Linear Sheet (`Linear: Sepsis`)
- **Component**: `LinearChart.tsx`
- **Type**: Scatter Plot.
- **Data**: Filter `data` by `selectedStates`. If `selectedProvider` is not null, filter to show only that provider (or highlight it).
- **Axes**:
    - **X-Axis**: `Average Total Payments ` (Linear scale). Title: "Average Total Payments ($)".
    - **Y-Axis**: `Total Discharges ` (Linear scale).
- **Encodings**:
    - **Color**: `Provider State` (same palette as map).
    - **Marks**: Circles.
- **Tooltip**: `Provider Name`, `Provider State`, `Diagnosis`.

### 4. Scatter Sheet (`Sepsis: ACC vs AMP`)
- **Component**: `ScatterChart.tsx`
- **Type**: Scatter Plot.
- **Data**: Filter `data` by `selectedStates`. If `selectedProvider` is not null, filter to show only that provider (or highlight it).
- **Axes**:
    - **X-Axis**: `Average Medicare Payments` (Linear scale). Title: "Average Medicare Payments ($)".
    - **Y-Axis**: `Average Covered Charges ` (Linear scale). Title: "Average Covered Charges ($)".
- **Encodings**:
    - **Color**: `Provider State` (same palette as map).
    - **Size**: `Total Discharges ` (Scale radius).
- **Tooltip**: `Provider Name`, `Provider State`, `Diagnosis`.

## Implementation Details
- **Styling**: Ensure fonts are small (approx 10-12px) to match the "dense" look of the Tableau dashboard.
- **Responsiveness**: The charts should resize to fit their containers. Use `ResizeObserver` or `viewBox` logic for SVGs.
- **D3 Integration**: Use `useRef` to select SVG elements and apply D3 transitions if necessary, or render SVG elements directly via React for better performance (React-D3 hybrid approach).

## Sample Data
Here is a sample of the data structure you will be working with:

```json
[
  {
    "﻿\"\"\"DRG Definition\"\"\"": "280 - ACUTE MYOCARDIAL INFARCTION, DISCHARGED ALIVE W MCC",
    "\"Provider Id\"": 330160,
    "\"Provider Name\"": "STATEN ISLAND UNIVERSITY HOSPITAL",
    "\"Provider Street Address\"": "475 SEAVIEW AVENUE",
    "\"Provider City\"": "STATEN ISLAND",
    "\"Provider State\"": "NY",
    "\"Provider Zip Code\"": 10305,
    "\"Hospital Referral Region Description\"": "NY - Manhattan",
    "\"Total Discharges \"": 61,
    "\"Average Covered Charges \"": 59427.7,
    "\"Average Total Payments \"": 18143.27,
    "\"Average Medicare Payments\"": 16523.42,
    "\"Census Region\"": "NORTHEAST",
    "\"Census Region Division\"": "D2_MID-ATLANTIC",
    "\"Federal Region\"": "REGION_II",
    "\"Economic Analysis Region\"": "MIDEAST",
    "\"Provider Latitude\"": 40.58371158,
    "\"Provider Longitude\"": -74.08625824
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "870 - SEPTICEMIA OR SEVERE SEPSIS W MV 96+ HOURS",
    "\"Provider Id\"": 220071,
    "\"Provider Name\"": "MASSACHUSETTS GENERAL HOSPITAL",
    "\"Provider Street Address\"": "55 FRUIT STREET",
    "\"Provider City\"": "BOSTON",
    "\"Provider State\"": "MA",
    "\"Provider Zip Code\"": 2114,
    "\"Hospital Referral Region Description\"": "MA - Boston",
    "\"Total Discharges \"": 22,
    "\"Average Covered Charges \"": 234268.59,
    "\"Average Total Payments \"": 63700.13,
    "\"Average Medicare Payments\"": 62569.59,
    "\"Census Region\"": "NORTHEAST",
    "\"Census Region Division\"": "D1_NEW_ENGLAND",
    "\"Federal Region\"": "REGION_I",
    "\"Economic Analysis Region\"": "NEW ENGLAND",
    "\"Provider Latitude\"": 42.36248785,
    "\"Provider Longitude\"": -71.069292
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "698 - OTHER KIDNEY & URINARY TRACT DIAGNOSES W MCC",
    "\"Provider Id\"": 330167,
    "\"Provider Name\"": "WINTHROP-UNIVERSITY HOSPITAL",
    "\"Provider Street Address\"": "259 FIRST STREET",
    "\"Provider City\"": "MINEOLA",
    "\"Provider State\"": "NY",
    "\"Provider Zip Code\"": 11501,
    "\"Hospital Referral Region Description\"": "NY - East Long Island",
    "\"Total Discharges \"": 16,
    "\"Average Covered Charges \"": 61279.75,
    "\"Average Total Payments \"": 14426.56,
    "\"Average Medicare Payments\"": 12876.62,
    "\"Census Region\"": "NORTHEAST",
    "\"Census Region Division\"": "D2_MID-ATLANTIC",
    "\"Federal Region\"": "REGION_II",
    "\"Economic Analysis Region\"": "MIDEAST",
    "\"Provider Latitude\"": 40.7416811,
    "\"Provider Longitude\"": -73.64308466
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "292 - HEART FAILURE & SHOCK W CC",
    "\"Provider Id\"": 180020,
    "\"Provider Name\"": "MIDDLESBORO APPALACHIAN REGIONAL HEALTHCARE HOSPIT",
    "\"Provider Street Address\"": "3600 WEST CUMBERLAND AVENUE",
    "\"Provider City\"": "MIDDLESBORO",
    "\"Provider State\"": "KY",
    "\"Provider Zip Code\"": 40965,
    "\"Hospital Referral Region Description\"": "TN - Knoxville",
    "\"Total Discharges \"": 66,
    "\"Average Covered Charges \"": 17013.86,
    "\"Average Total Payments \"": 5763.51,
    "\"Average Medicare Payments\"": 5062.8,
    "\"Census Region\"": "SOUTH",
    "\"Census Region Division\"": "D6_EAST_SOUTH_CENTRAL",
    "\"Federal Region\"": "REGION_IV",
    "\"Economic Analysis Region\"": "SOUTHEAST",
    "\"Provider Latitude\"": 36.60526317,
    "\"Provider Longitude\"": -83.74212375
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "392 - ESOPHAGITIS, GASTROENT & MISC DIGEST DISORDERS W/O MCC",
    "\"Provider Id\"": 150010,
    "\"Provider Name\"": "ST JOSEPH HOSPITAL & HEALTH CENTER INC",
    "\"Provider Street Address\"": "1907 W SYCAMORE ST",
    "\"Provider City\"": "KOKOMO",
    "\"Provider State\"": "IN",
    "\"Provider Zip Code\"": 46904,
    "\"Hospital Referral Region Description\"": "IN - Indianapolis",
    "\"Total Discharges \"": 35,
    "\"Average Covered Charges \"": 17006.48,
    "\"Average Total Payments \"": 4042.85,
    "\"Average Medicare Payments\"": 3244.34,
    "\"Census Region\"": "MIDWEST",
    "\"Census Region Division\"": "D3_EAST_NORTH_CENTRAL",
    "\"Federal Region\"": "REGION_V",
    "\"Economic Analysis Region\"": "GREAT LAKES",
    "\"Provider Latitude\"": 40.48713711,
    "\"Provider Longitude\"": -86.15555984
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "176 - PULMONARY EMBOLISM W/O MCC",
    "\"Provider Id\"": 330023,
    "\"Provider Name\"": "VASSAR BROTHERS MEDICAL CENTER",
    "\"Provider Street Address\"": "45 READE PLACE",
    "\"Provider City\"": "POUGHKEEPSIE",
    "\"Provider State\"": "NY",
    "\"Provider Zip Code\"": 12601,
    "\"Hospital Referral Region Description\"": "NY - Albany",
    "\"Total Discharges \"": 22,
    "\"Average Covered Charges \"": 49846.4,
    "\"Average Total Payments \"": 9126.5,
    "\"Average Medicare Payments\"": 7549.77,
    "\"Census Region\"": "NORTHEAST",
    "\"Census Region Division\"": "D2_MID-ATLANTIC",
    "\"Federal Region\"": "REGION_II",
    "\"Economic Analysis Region\"": "MIDEAST",
    "\"Provider Latitude\"": 41.69454073,
    "\"Provider Longitude\"": -73.93542656
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "178 - RESPIRATORY INFECTIONS & INFLAMMATIONS W CC",
    "\"Provider Id\"": 390045,
    "\"Provider Name\"": "WILLIAMSPORT REGIONAL MEDICAL CENTER",
    "\"Provider Street Address\"": "700 HIGH STREET",
    "\"Provider City\"": "WILLIAMSPORT",
    "\"Provider State\"": "PA",
    "\"Provider Zip Code\"": 17701,
    "\"Hospital Referral Region Description\"": "PA - Danville",
    "\"Total Discharges \"": 19,
    "\"Average Covered Charges \"": 23297.26,
    "\"Average Total Payments \"": 8403.0,
    "\"Average Medicare Payments\"": 7517.73,
    "\"Census Region\"": "NORTHEAST",
    "\"Census Region Division\"": "D2_MID-ATLANTIC",
    "\"Federal Region\"": "REGION_III",
    "\"Economic Analysis Region\"": "MIDEAST",
    "\"Provider Latitude\"": 41.24551342,
    "\"Provider Longitude\"": -77.01451287
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "372 - MAJOR GASTROINTESTINAL DISORDERS & PERITONEAL INFECTIONS W CC",
    "\"Provider Id\"": 50761,
    "\"Provider Name\"": "PROVIDENCE TARZANA MEDICAL CENTER",
    "\"Provider Street Address\"": "18321 CLARK STREET",
    "\"Provider City\"": "TARZANA",
    "\"Provider State\"": "CA",
    "\"Provider Zip Code\"": 91356,
    "\"Hospital Referral Region Description\"": "CA - Los Angeles",
    "\"Total Discharges \"": 17,
    "\"Average Covered Charges \"": 79641.64,
    "\"Average Total Payments \"": 8834.29,
    "\"Average Medicare Payments\"": 8307.23,
    "\"Census Region\"": "WEST",
    "\"Census Region Division\"": "D9_PACIFIC",
    "\"Federal Region\"": "REGION_IX",
    "\"Economic Analysis Region\"": "FAR WEST",
    "\"Provider Latitude\"": 34.16979653,
    "\"Provider Longitude\"": -118.5326025
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "101 - SEIZURES W/O MCC",
    "\"Provider Id\"": 390042,
    "\"Provider Name\"": "WASHINGTON HOSPITAL, THE",
    "\"Provider Street Address\"": "155 WILSON AVENUE",
    "\"Provider City\"": "WASHINGTON",
    "\"Provider State\"": "PA",
    "\"Provider Zip Code\"": 15301,
    "\"Hospital Referral Region Description\"": "PA - Pittsburgh",
    "\"Total Discharges \"": 13,
    "\"Average Covered Charges \"": 12334.38,
    "\"Average Total Payments \"": 4740.23,
    "\"Average Medicare Payments\"": 4304.84,
    "\"Census Region\"": "NORTHEAST",
    "\"Census Region Division\"": "D2_MID-ATLANTIC",
    "\"Federal Region\"": "REGION_III",
    "\"Economic Analysis Region\"": "MIDEAST",
    "\"Provider Latitude\"": 40.18307912,
    "\"Provider Longitude\"": -80.2470288
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "682 - RENAL FAILURE W MCC",
    "\"Provider Id\"": 140049,
    "\"Provider Name\"": "WEST SUBURBAN MEDICAL CENTER",
    "\"Provider Street Address\"": "3 ERIE COURT",
    "\"Provider City\"": "OAK PARK",
    "\"Provider State\"": "IL",
    "\"Provider Zip Code\"": 60302,
    "\"Hospital Referral Region Description\"": "IL - Melrose Park",
    "\"Total Discharges \"": 20,
    "\"Average Covered Charges \"": 36142.85,
    "\"Average Total Payments \"": 13931.65,
    "\"Average Medicare Payments\"": 13257.25,
    "\"Census Region\"": "MIDWEST",
    "\"Census Region Division\"": "D3_EAST_NORTH_CENTRAL",
    "\"Federal Region\"": "REGION_V",
    "\"Economic Analysis Region\"": "GREAT LAKES",
    "\"Provider Latitude\"": 41.89150221,
    "\"Provider Longitude\"": -87.77623685
  }
]
```

Please generate the complete React application code, including the `main.tsx`, `App.tsx`, `Dashboard.tsx`, and the individual chart components.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/TEMP_16kzbk812vlpgd1bdwy9c1dlt4ya.csv

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
const rows = await loadCsv("/data/TEMP_16kzbk812vlpgd1bdwy9c1dlt4ya.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_1378_2/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: G-Map: Sepsis
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider Latitude:qk]`
- cols_field: `[federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider Longitude:qk]`
- series_field: `[federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk]`
- bar_orientation: `horizontal`
- zone: x=468, y=752, w=99064, h=29886
- legend_required: true
- legend_field: `[federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk]`
- legend_relative_position: overlay
- highlight_fields: [federated.1km3k6705qm2tv158tss61u3dc2z].[Sepsis], [federated.1km3k6705qm2tv158tss61u3dc2z].[attr:Provider State:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:DRG Definition - Split 2:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider Name:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Linear: Sepsis
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk] * [federated.1km3k6705qm2tv158tss61u3dc2z].[sum:Total Discharges :qk])`
- cols_field: `([federated.1km3k6705qm2tv158tss61u3dc2z].[none:Average Total Payments :qk] + [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Average Medicare Payments:qk])`
- series_field: `[federated.1km3k6705qm2tv158tss61u3dc2z].[Sepsis]`
- bar_orientation: `horizontal`
- axis_title_cols: Average Total Payments ($), Average Medicare Payments ($)
- zone: x=468, y=30638, w=99064, h=29511
- highlight_fields: [federated.1km3k6705qm2tv158tss61u3dc2z].[Sepsis], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Average Covered Charges :qk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Average Medicare Payments:qk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Average Total Payments :qk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Calculation_1166995304830603266:qk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:DRG Definition - Split 2:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider Name:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sepsis: ACC vs AMP
- chart_intent: `horizontal_ranked_bar`
- rows_field: `([federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk] * [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Average Covered Charges :qk])`
- cols_field: `[federated.1km3k6705qm2tv158tss61u3dc2z].[none:Average Medicare Payments:qk]`
- series_field: `[federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk]`
- bar_orientation: `horizontal`
- axis_title_rows: Average Covered Charges ($)
- axis_title_cols: Average Medicare Payments ($)
- zone: x=468, y=60149, w=99064, h=39099
- highlight_fields: [federated.1km3k6705qm2tv158tss61u3dc2z].[Sepsis], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:DRG Definition - Split 2:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:DRG Definition:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Hospital Referral Region Description - Split 2:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider Name:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[sum:Total Discharges :qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=G-Map: Sepsis, target=Sepsis: Interactive
## Highlight Bindings
- Sepsis: ACC vs AMP: [federated.1km3k6705qm2tv158tss61u3dc2z].[Sepsis], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:DRG Definition - Split 2:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:DRG Definition:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Hospital Referral Region Description - Split 2:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider Name:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[sum:Total Discharges :qk]
- G-Map: Sepsis: [federated.1km3k6705qm2tv158tss61u3dc2z].[Sepsis], [federated.1km3k6705qm2tv158tss61u3dc2z].[attr:Provider State:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:DRG Definition - Split 2:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider Name:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk]
- Linear: Sepsis: [federated.1km3k6705qm2tv158tss61u3dc2z].[Sepsis], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Average Covered Charges :qk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Average Medicare Payments:qk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Average Total Payments :qk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Calculation_1166995304830603266:qk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:DRG Definition - Split 2:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider Name:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk]
- G-Map: Sepsis: [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk]
