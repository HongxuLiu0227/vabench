# Project Requirements

You are an expert React and D3 developer. Your task is to implement a dashboard that exactly replicates the provided Tableau workbook definition.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (use `d3-scale`, `d3-shape`, `d3-axis`, `d3-hierarchy`, `d3-array`, `d3-selection`). Do not use high-level chart libraries like Recharts or Nivo.
- CSS for layout (Flexbox/Grid).

## Data Loading

The primary data source is located at: `/data/TEMP_16kzbk812vlpgd1bdwy9c1dlt4ya.csv`

You must implement a data loading utility that fetches this CSV, parses it, and transforms it into the application's state.

### Data Fetching Logic
1. Use the native `fetch` API to retrieve the CSV file.
2. Use `d3-dsv` (d3.csvParse) to parse the raw text into an array of objects.
3. **Data Transformation**:
   - The raw CSV contains a column `DRG Definition`. You must create a derived field `Diagnosis` by splitting this string on the hyphen `-` and taking the second part (trimming whitespace). Formula: `TRIM(SPLIT([DRG Definition], "-", 2))`.
   - Group the data by the derived `Diagnosis` field.
   - For each group, calculate the following aggregations:
     - `Number of Records`: Count of rows.
     - `Total Discharges`: Sum of `Total Discharges ` (note the trailing space in the column name).
     - `Average Covered Charges`: Sum of `Average Covered Charges ` (note the trailing space).
     - `Average Medicare Payments`: Sum of `Average Medicare Payments`.

### TypeScript Interfaces
Define interfaces for the raw CSV row and the aggregated data structure.

## Dashboard Layout

The dashboard is named "G: Number of Records per Diagnosis and Total Discharges".

**Layout Structure:**
- Use a CSS Grid or Flexbox container with a vertical column direction.
- **Top Section (50% height):** Contains the worksheet "G: Number of Records per Diagnosis".
- **Bottom Section (50% height):** Contains the worksheet "G: Total Discharges vs Diagnosis".
- Margins: Apply a small margin (approx 4px-8px) around the inner charts to match the Tableau zone styling.

## Component Specifications

### 1. Bubble Chart Component (`G: Number of Records per Diagnosis`)

**Visual Encoding:**
- **Mark Type:** Packed Circles (Bubbles).
- **Layout:** Use `d3.pack()` to arrange circles.
- **Size:** Encoded by `Number of Records` (Count).
- **Color:** Encoded by `Number of Records` (Count). Use a sequential color scale (e.g., `d3.interpolateTurbo` or a custom "Tableau Map Temperature" approximation) where lighter colors represent lower values and darker/intense colors represent higher values.
- **Labels:** Display the `Diagnosis` text inside the bubbles. Implement label culling (hide labels if the bubble is too small) to prevent overlap.

**Data Filtering:**
- Filter the aggregated data to only include diagnoses where `Number of Records` is between 613 and 3023 (inclusive).

**Interactions:**
- **Selection:** Clicking a bubble should trigger a "Filter" action.
- **State:** When a bubble is selected, update the global state to store the selected `Diagnosis`.
- **Visual Feedback:** Highlight the selected bubble (e.g., stroke opacity or color shift).

**Tooltips:**
On hover, display:
- Diagnosis
- Total Discharges
- Average Covered Charges
- Average Medicare Payments

### 2. Bar Chart Component (`G: Total Discharges vs Diagnosis`)

**Visual Encoding:**
- **Mark Type:** Vertical Bars.
- **X-Axis:** `Diagnosis` (Nominal/Ordinal).
- **Y-Axis:** `Total Discharges` (Quantitative).
- **Sorting:** Sort the bars in descending order based on `Total Discharges`.

**Interactions:**
- **Filtering:** This chart listens to the selection state from the Bubble Chart.
- If a `Diagnosis` is selected in the Bubble Chart, filter this chart to show **only** that specific diagnosis.
- If no selection is active (or selection is cleared), show all diagnoses (or maintain the last filtered state depending on standard behavior, but usually, dashboard actions filter down). *Note: The Tableau XML specifies an action "Filter 2" that targets this sheet.*

**Tooltips:**
On hover, display:
- Diagnosis
- Number of Records
- Average Covered Charges
- Average Medicare Payments

## Implementation Details

1.  **State Management:** Use React `useState` to hold the full dataset and the `selectedDiagnosis`.
2.  **D3 Integration:** Use `useRef` to select the SVG container and `useEffect` to render/update charts when data or selection changes.
3.  **Responsiveness:** Ensure charts resize with their containers using `ResizeObserver` or `viewBox` attributes.
4.  **Styling:** Keep the UI clean. Use a sans-serif font. Match the font size hierarchy (Tableau uses size 7 for labels, which is small; ensure readability in the web app).

## Sample Data

```json
[
  {
    "﻿\"\"\"DRG Definition\"\"\"": "246 - PERC CARDIOVASC PROC W DRUG-ELUTING STENT W MCC OR 4+ VESSELS/STENTS",
    "\"Provider Id\"": 230070,
    "\"Provider Name\"": "COVENANT MEDICAL CENTER, INC",
    "\"Provider Street Address\"": "1447 N HARRISON",
    "\"Provider City\"": "SAGINAW",
    "\"Provider State\"": "MI",
    "\"Provider Zip Code\"": 48602,
    "\"Hospital Referral Region Description\"": "MI - Saginaw",
    "\"Total Discharges \"": 32,
    "\"Average Covered Charges \"": 69884.5,
    "\"Average Total Payments \"": 20795.59,
    "\"Average Medicare Payments\"": 19037.06,
    "\"Census Region\"": "MIDWEST",
    "\"Census Region Division\"": "D3_EAST_NORTH_CENTRAL",
    "\"Federal Region\"": "REGION_V",
    "\"Economic Analysis Region\"": "GREAT LAKES",
    "\"Provider Latitude\"": 43.42866353,
    "\"Provider Longitude\"": -83.95558932
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "253 - OTHER VASCULAR PROCEDURES W CC",
    "\"Provider Id\"": 180104,
    "\"Provider Name\"": "WESTERN BAPTIST HOSPITAL",
    "\"Provider Street Address\"": "2501 KENTUCKY AVENUE",
    "\"Provider City\"": "PADUCAH",
    "\"Provider State\"": "KY",
    "\"Provider Zip Code\"": 42003,
    "\"Hospital Referral Region Description\"": "KY - Paducah",
    "\"Total Discharges \"": 23,
    "\"Average Covered Charges \"": 42376.26,
    "\"Average Total Payments \"": 12755.91,
    "\"Average Medicare Payments\"": 11778.56,
    "\"Census Region\"": "SOUTH",
    "\"Census Region Division\"": "D6_EAST_SOUTH_CENTRAL",
    "\"Federal Region\"": "REGION_IV",
    "\"Economic Analysis Region\"": "SOUTHEAST",
    "\"Provider Latitude\"": 37.07338183,
    "\"Provider Longitude\"": -88.62624176
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "243 - PERMANENT CARDIAC PACEMAKER IMPLANT W CC",
    "\"Provider Id\"": 210056,
    "\"Provider Name\"": "GOOD SAMARITAN HOSPITAL",
    "\"Provider Street Address\"": "5601 LOCH RAVEN BLVD",
    "\"Provider City\"": "BALTIMORE",
    "\"Provider State\"": "MD",
    "\"Provider Zip Code\"": 21239,
    "\"Hospital Referral Region Description\"": "MD - Baltimore",
    "\"Total Discharges \"": 14,
    "\"Average Covered Charges \"": 23926.85,
    "\"Average Total Payments \"": 22491.07,
    "\"Average Medicare Payments\"": 21684.78,
    "\"Census Region\"": "SOUTH",
    "\"Census Region Division\"": "D5_SOUTH_ATLANTIC",
    "\"Federal Region\"": "REGION_III",
    "\"Economic Analysis Region\"": "MIDEAST",
    "\"Provider Latitude\"": 39.35891531,
    "\"Provider Longitude\"": -76.58885095
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "372 - MAJOR GASTROINTESTINAL DISORDERS & PERITONEAL INFECTIONS W CC",
    "\"Provider Id\"": 450713,
    "\"Provider Name\"": "ST DAVID'S SOUTH AUSTIN MEDICAL CENTER",
    "\"Provider Street Address\"": "901 WEST BEN WHITE BLVD",
    "\"Provider City\"": "AUSTIN",
    "\"Provider State\"": "TX",
    "\"Provider Zip Code\"": 78704,
    "\"Hospital Referral Region Description\"": "TX - Austin",
    "\"Total Discharges \"": 27,
    "\"Average Covered Charges \"": 39649.25,
    "\"Average Total Payments \"": 7471.74,
    "\"Average Medicare Payments\"": 6804.48,
    "\"Census Region\"": "SOUTH",
    "\"Census Region Division\"": "D7_WEST_SOUTH_CENTRAL",
    "\"Federal Region\"": "REGION_VI",
    "\"Economic Analysis Region\"": "SOUTHWEST",
    "\"Provider Latitude\"": 30.22726648,
    "\"Provider Longitude\"": -97.77433267
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "683 - RENAL FAILURE W CC",
    "\"Provider Id\"": 140117,
    "\"Provider Name\"": "RESURRECTION MEDICAL CENTER",
    "\"Provider Street Address\"": "7435 W TALCOTT AVENUE",
    "\"Provider City\"": "CHICAGO",
    "\"Provider State\"": "IL",
    "\"Provider Zip Code\"": 60631,
    "\"Hospital Referral Region Description\"": "IL - Chicago",
    "\"Total Discharges \"": 105,
    "\"Average Covered Charges \"": 27721.53,
    "\"Average Total Payments \"": 7052.77,
    "\"Average Medicare Payments\"": 5761.81,
    "\"Census Region\"": "MIDWEST",
    "\"Census Region Division\"": "D3_EAST_NORTH_CENTRAL",
    "\"Federal Region\"": "REGION_V",
    "\"Economic Analysis Region\"": "GREAT LAKES",
    "\"Provider Latitude\"": 41.98870018,
    "\"Provider Longitude\"": -87.81312782
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "377 - G.I. HEMORRHAGE W MCC",
    "\"Provider Id\"": 440082,
    "\"Provider Name\"": "ST THOMAS HOSPITAL",
    "\"Provider Street Address\"": "4220 HARDING RD, PO BOX 380",
    "\"Provider City\"": "NASHVILLE",
    "\"Provider State\"": "TN",
    "\"Provider Zip Code\"": 37205,
    "\"Hospital Referral Region Description\"": "TN - Nashville",
    "\"Total Discharges \"": 45,
    "\"Average Covered Charges \"": 26663.55,
    "\"Average Total Payments \"": 9647.88,
    "\"Average Medicare Payments\"": 8750.8,
    "\"Census Region\"": "SOUTH",
    "\"Census Region Division\"": "D6_EAST_SOUTH_CENTRAL",
    "\"Federal Region\"": "REGION_IV",
    "\"Economic Analysis Region\"": "SOUTHEAST",
    "\"Provider Latitude\"": 36.12781848,
    "\"Provider Longitude\"": -86.84342481
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "191 - CHRONIC OBSTRUCTIVE PULMONARY DISEASE W CC",
    "\"Provider Id\"": 140018,
    "\"Provider Name\"": "MT SINAI HOSPITAL MEDICAL CENTER",
    "\"Provider Street Address\"": "15TH STREET AT CALIFORNIA",
    "\"Provider City\"": "CHICAGO",
    "\"Provider State\"": "IL",
    "\"Provider Zip Code\"": 60608,
    "\"Hospital Referral Region Description\"": "IL - Chicago",
    "\"Total Discharges \"": 29,
    "\"Average Covered Charges \"": 24914.65,
    "\"Average Total Payments \"": 10023.03,
    "\"Average Medicare Payments\"": 9322.62,
    "\"Census Region\"": "MIDWEST",
    "\"Census Region Division\"": "D3_EAST_NORTH_CENTRAL",
    "\"Federal Region\"": "REGION_V",
    "\"Economic Analysis Region\"": "GREAT LAKES",
    "\"Provider Latitude\"": 41.860125,
    "\"Provider Longitude\"": -87.69570300000001
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "552 - MEDICAL BACK PROBLEMS W/O MCC",
    "\"Provider Id\"": 30061,
    "\"Provider Name\"": "BANNER BOSWELL MEDICAL CENTER",
    "\"Provider Street Address\"": "10401 WEST THUNDERBIRD BOULEVARD",
    "\"Provider City\"": "SUN CITY",
    "\"Provider State\"": "AZ",
    "\"Provider Zip Code\"": 85351,
    "\"Hospital Referral Region Description\"": "AZ - Sun City",
    "\"Total Discharges \"": 85,
    "\"Average Covered Charges \"": 27330.23,
    "\"Average Total Payments \"": 4752.92,
    "\"Average Medicare Payments\"": 3836.74,
    "\"Census Region\"": "WEST",
    "\"Census Region Division\"": "D8_MOUNTAIN",
    "\"Federal Region\"": "REGION_IX",
    "\"Economic Analysis Region\"": "SOUTHWEST",
    "\"Provider Latitude\"": 33.60478155,
    "\"Provider Longitude\"": -112.28354409999999
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "189 - PULMONARY EDEMA & RESPIRATORY FAILURE",
    "\"Provider Id\"": 100075,
    "\"Provider Name\"": "ST JOSEPH'S HOSPITAL",
    "\"Provider Street Address\"": "3001 W MARTIN LUTHER KING JR BLVD",
    "\"Provider City\"": "TAMPA",
    "\"Provider State\"": "FL",
    "\"Provider Zip Code\"": 33677,
    "\"Hospital Referral Region Description\"": "FL - Tampa",
    "\"Total Discharges \"": 62,
    "\"Average Covered Charges \"": 31139.85,
    "\"Average Total Payments \"": 8331.98,
    "\"Average Medicare Payments\"": 7678.14,
    "\"Census Region\"": "SOUTH",
    "\"Census Region Division\"": "D5_SOUTH_ATLANTIC",
    "\"Federal Region\"": "REGION_IV",
    "\"Economic Analysis Region\"": "SOUTHEAST",
    "\"Provider Latitude\"": 27.98136347,
    "\"Provider Longitude\"": -82.49285245
  },
  {
    "﻿\"\"\"DRG Definition\"\"\"": "682 - RENAL FAILURE W MCC",
    "\"Provider Id\"": 110087,
    "\"Provider Name\"": "GWINNETT MEDICAL CENTER",
    "\"Provider Street Address\"": "1000 MEDICAL CENTER BOULEVARD",
    "\"Provider City\"": "LAWRENCEVILLE",
    "\"Provider State\"": "GA",
    "\"Provider Zip Code\"": 30045,
    "\"Hospital Referral Region Description\"": "GA - Atlanta",
    "\"Total Discharges \"": 77,
    "\"Average Covered Charges \"": 22894.8,
    "\"Average Total Payments \"": 10574.94,
    "\"Average Medicare Payments\"": 9528.61,
    "\"Census Region\"": "SOUTH",
    "\"Census Region Division\"": "D5_SOUTH_ATLANTIC",
    "\"Federal Region\"": "REGION_IV",
    "\"Economic Analysis Region\"": "SOUTHEAST",
    "\"Provider Latitude\"": 33.96452008,
    "\"Provider Longitude\"": -84.01467871
  }
]
```



## Summary of Deliverables
1.  `App.tsx`: Main entry point, handles data fetching.
2.  `Dashboard.tsx`: Layout container.
3.  `BubbleChart.tsx`: Implementation of the packed bubble visualization.
4.  `BarChart.tsx`: Implementation of the vertical bar chart.
5.  `types.ts`: TypeScript interfaces.
6.  `utils.ts`: Data parsing and aggregation logic.

Ensure strict adherence to the field names and calculations derived from the XML.

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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_1378_1/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: G: Number of Records per Diagnosis
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.1km3k6705qm2tv158tss61u3dc2z].[sum:Number of Records:qk]`
- zone: x=468, y=752, w=99064, h=49249
- legend_required: true
- legend_field: `[federated.1km3k6705qm2tv158tss61u3dc2z].[sum:Number of Records:qk]`
- legend_relative_position: overlay
- highlight_fields: [federated.1km3k6705qm2tv158tss61u3dc2z].[Sepsis], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:DRG Definition - Split 2:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: G: Total Discharges vs Diagnosis
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1km3k6705qm2tv158tss61u3dc2z].[sum:Total Discharges :qk]`
- cols_field: `[federated.1km3k6705qm2tv158tss61u3dc2z].[none:DRG Definition - Split 2:nk]`
- series_field: `[federated.1km3k6705qm2tv158tss61u3dc2z].[Action (Diagnosis)]`
- bar_orientation: `vertical`
- zone: x=468, y=50001, w=99064, h=49247
- highlight_fields: [federated.1km3k6705qm2tv158tss61u3dc2z].[none:DRG Definition - Split 2:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 2 (generated): kind=filter_action, source=G: Number of Records per Diagnosis, target=G: Number of Records per Diagnosis and Total Discharges
## Highlight Bindings
- G: Total Discharges vs Diagnosis: [federated.1km3k6705qm2tv158tss61u3dc2z].[none:DRG Definition - Split 2:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk]
- G: Number of Records per Diagnosis: [federated.1km3k6705qm2tv158tss61u3dc2z].[Sepsis], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:DRG Definition - Split 2:nk], [federated.1km3k6705qm2tv158tss61u3dc2z].[none:Provider State:nk]
