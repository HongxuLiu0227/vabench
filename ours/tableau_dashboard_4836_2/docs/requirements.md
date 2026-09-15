# Project Requirements

You are an expert React developer. Your task is to implement a dashboard application based on the following specification.

## Tech Stack
- **Framework:** React 18+ with TypeScript.
- **Build Tool:** Vite.
- **Visualization:** D3.js (v7) for charts (use primitives like `d3-scale`, `d3-shape`, `d3-axis`). Do not use high-level chart libraries like Recharts or Nivo unless necessary for complex interactions, but prefer raw D3 for fidelity.
- **Styling:** CSS Modules or Tailwind CSS (optional, but keep styling inline or modular). No heavy UI component libraries (e.g., Ant Design) unless specified.

## Data Loading

The application must load data from the public directory.

1.  **Fetch Data:**
    Use the native `fetch` API to load the dataset.
    URL: `/data/federated_0se4v9q15j8hfi17f25m50.csv`

2.  **Parse Data:**
    Use `d3-dsv` (d3.csvParse) to parse the CSV string into an array of objects.

3.  **Type Definitions:**
    Define a TypeScript interface `DataRow` representing the columns in the CSV.
    Key fields include: `DisplayMFL`, `DisplayFacilityName`, `DisplayCounty`, `DisplayMechanism`, `DisplayAgency`, `UploadStatus`, `UploadDate`, `Upload_monthYear`, `UploadDate_MPI`, `Upload_monthYear_MPI`, `Siteabstractiondate`.

4.  **Data Transformation (Calculated Fields):**
    Replicate the Tableau calculated fields in JavaScript/TypeScript utility functions.
    -   **Parameter 1 (Upload Period):** This is a global state variable (Date). Default to '2021-01-06'.
    -   **Upload Status - Calc:** Logic to determine if 'CT & PKVs Uploaded', 'Latest CT Only', 'Only PKVs', or 'Never Uploaded'. Compare `UploadDate` and `UploadDate_MPI` against the Parameter and Today.
    -   **Recency of Uploads:** Calculate months difference between `Siteabstractiondate` and the max upload date.
    -   **Recency Color:** Return 'Good', 'Average', or 'Bad' based on recency.
    -   **County Percent Uploads Proportions:** `CountD(SiteCode) / CountD(DisplayMFL)` (filtered by context).
    -   **Partner Percent Uploaded:** Similar logic, grouped by `DisplayMechanism`.
    -   **Overview_PercentUploaded CT:** `Number of Sites Uploaded CT / Total Expected Sites`.

## Sample Data

```json
[
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 13722,
    "\"DisplayFacilityName\"": "Kowino Dispensary",
    "\"DisplaySubcounty\"": "Kisumu Central",
    "\"DisplayCounty\"": "KISUMU",
    "\"DisplayMechanism\"": "AFYA ZIWANI",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-05-05",
    "\"Upload_monthYear\"": "May 2021",
    "\"SiteCode\"": 13722,
    "\"MPI_SiteCode\"": 13722,
    "\"UploadDate_MPI\"": "2021-05-10",
    "\"Upload_monthYear_MPI\"": "May 2021",
    "\"Siteabstractiondate\"": "2021-05-06"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 17183,
    "\"DisplayFacilityName\"": "Uradi Health Centre",
    "\"DisplaySubcounty\"": "Alego Usonga",
    "\"DisplayCounty\"": "SIAYA",
    "\"DisplayMechanism\"": "KCCB KARP",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-12-04",
    "\"Upload_monthYear\"": "December 2020",
    "\"SiteCode\"": 17183,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-04-28"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 14033,
    "\"DisplayFacilityName\"": "OUR LADY F LOURDES RANGALA MISSION HOPSPITAL",
    "\"DisplaySubcounty\"": "Ugunja",
    "\"DisplayCounty\"": "SIAYA",
    "\"DisplayMechanism\"": "KCCB KARP",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-09-04",
    "\"Upload_monthYear\"": "September 2020",
    "\"SiteCode\"": 14033,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-05-28"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 10402,
    "\"DisplayFacilityName\"": "Kagumo Health Centre",
    "\"DisplaySubcounty\"": "Kirinyaga Central",
    "\"DisplayCounty\"": "KIRINYAGA",
    "\"DisplayMechanism\"": "UON CRISSP PLUS",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-10-15",
    "\"Upload_monthYear\"": "October 2020",
    "\"SiteCode\"": 10402,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-05-07"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 11973,
    "\"DisplayFacilityName\"": "Chuka  County Refferal Hospital",
    "\"DisplaySubcounty\"": "Chuka",
    "\"DisplayCounty\"": "THARAKA-NITHI",
    "\"DisplayMechanism\"": "AFYA JIJINI",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-04-21",
    "\"Upload_monthYear\"": "April 2021",
    "\"SiteCode\"": 11973,
    "\"MPI_SiteCode\"": 11973,
    "\"UploadDate_MPI\"": "2021-04-21",
    "\"Upload_monthYear_MPI\"": "April 2021",
    "\"Siteabstractiondate\"": "2021-05-06"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 12422,
    "\"DisplayFacilityName\"": "Laare Health Centre",
    "\"DisplaySubcounty\"": "Igembe North",
    "\"DisplayCounty\"": "MERU",
    "\"DisplayMechanism\"": "CHAK CHAP UZIMA",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Not Uploaded Care & Treatment or PKV(MPI)",
    "\"UploadDate\"": "",
    "\"Upload_monthYear\"": "",
    "\"SiteCode\"": "",
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": ""
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 14068,
    "\"DisplayFacilityName\"": "Saradidi Dispensary",
    "\"DisplaySubcounty\"": "Rarieda",
    "\"DisplayCounty\"": "SIAYA",
    "\"DisplayMechanism\"": "CHS SHINDA",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-10-16",
    "\"Upload_monthYear\"": "October 2020",
    "\"SiteCode\"": 14068,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-04-30"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 13657,
    "\"DisplayFacilityName\"": "Katito Sub County Hospital",
    "\"DisplaySubcounty\"": "Nyakach",
    "\"DisplayCounty\"": "KISUMU",
    "\"DisplayMechanism\"": "UCSF CLINICAL KISUMU",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-05-03",
    "\"Upload_monthYear\"": "May 2021",
    "\"SiteCode\"": 13657,
    "\"MPI_SiteCode\"": 13657,
    "\"UploadDate_MPI\"": "2021-05-05",
    "\"Upload_monthYear_MPI\"": "May 2021",
    "\"Siteabstractiondate\"": "2021-04-30"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 14498,
    "\"DisplayFacilityName\"": "Fitc Dispensary",
    "\"DisplaySubcounty\"": "Nakuru West",
    "\"DisplayCounty\"": "NAKURU",
    "\"DisplayMechanism\"": "AFYA NYOTA YA BONDE",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-06-03",
    "\"Upload_monthYear\"": "June 2020",
    "\"SiteCode\"": 14498,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-05-26"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 14498,
    "\"DisplayFacilityName\"": "Fitc Dispensary",
    "\"DisplaySubcounty\"": "Nakuru West",
    "\"DisplayCounty\"": "NAKURU",
    "\"DisplayMechanism\"": "AFYA NYOTA YA BONDE",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2020-12-04",
    "\"Upload_monthYear\"": "December 2020",
    "\"SiteCode\"": 14498,
    "\"MPI_SiteCode\"": 14498,
    "\"UploadDate_MPI\"": "2020-12-04",
    "\"Upload_monthYear_MPI\"": "December 2020",
    "\"Siteabstractiondate\"": "2021-05-26"
  }
]
```

## Dashboard Layout & Components

The dashboard layout should be responsive, using CSS Grid or Flexbox to mimic the Tableau dashboard structure.

### Global State
-   `selectedDate`: Date (controlled by a dropdown matching the Tableau parameter list: Oct 2019 - Jan 2021).
-   `filters`: Object containing `selectedCounty` (string | null) and `selectedPartner` (string | null).

### Component: `DashboardContainer`
-   **Layout:** Vertical stack of sections.
-   **Header:** Title "Reporting Rates CT & MPI".
-   **Controls:** Date selector (Parameter 1).

### Component: `OverviewKPIs`
-   **Layout:** Horizontal row of 3 cards.
-   **Data:**
    1.  **Expected Uploads:** `Sum({Fixed :COUNTD([DisplayMFL])})` -> Total unique facilities.
    2.  **Uploaded:** `NoOfPatients (copy)` -> Count of sites uploaded in the selected period.
    3.  **Reporting Rate:** `Overview_PercentUploaded CT` -> Percentage formatted (e.g., "85%").

### Component: `CountyPerformanceChart`
-   **Type:** Horizontal Bar Chart.
-   **X-Axis:** `County Percent Uploads Proportions (copy 2)` (0 to 1 or 0% to 100%).
-   **Y-Axis:** `DisplayCounty` (sorted by percentage descending).
-   **Color Encoding:** `County Color` logic:
    -   >= 67%: Green (#4caf50)
    -   34% - 66%: Orange/Yellow (#ff9800)
    -   < 34%: Red (#f44336)
-   **Interactions:** Click a bar to set `selectedCounty` filter.

### Component: `PartnerPerformanceChart`
-   **Type:** Horizontal Bar Chart.
-   **X-Axis:** `Partner Percent Uploaded`.
-   **Y-Axis:** `DisplayMechanism` (sorted by percentage descending).
-   **Color Encoding:** `PArtner Color` logic (same thresholds as County).
-   **Interactions:** Click a bar to set `selectedPartner` filter.

### Component: `TrendChart`
-   **Type:** Line Chart or Multi-Bar Chart.
-   **X-Axis:** Time (Months relative to Parameter 1: Month 0, Month -1, Month -2).
-   **Y-Axis:** Reporting Rate %.
-   **Series:**
    -   `Overview_Month0 Percent` (Current Month)
    -   `Overview_Month1 Percent` (Previous Month)
    -   `Overview_Month2 Percent` (Two Months Prior)

### Component: `FacilityDetailTable`
-   **Type:** Data Table.
-   **Columns:**
    -   `DisplayFacilityName`
    -   `DisplayCounty`
    -   `DisplayMechanism`
    -   `Upload Status - Calc` (Text: "CT & PKVs Uploaded", etc.)
    -   `Recency of Uploads` (Text: "2 months", "Never Uploaded")
    -   `Latest CT Upload` (Date)
    -   `Latest PKV Upload` (Date)
-   **Styling:** Color code the `Upload Status` or `Recency` text based on the `Recency Color` logic.
-   **Interactions:** Sortable columns.

## Implementation Details

1.  **Date Handling:** Ensure strict date parsing. The CSV dates are likely strings. Use `d3-time-format` for parsing and formatting.
2.  **Filtering Logic:** When a user clicks a County in `CountyPerformanceChart`, the `PartnerPerformanceChart`, `TrendChart`, and `FacilityDetailTable` must update to show only data for that County. The same applies for Partner.
3.  **Parameter Logic:** The "Upload Period" parameter changes the reference date for calculating "Month 0", "Month -1", etc. Changing this parameter should refresh all charts.
4.  **Color Palette:** Use the specific colors mentioned in the Tableau logic (Green/Orange/Red) for the performance indicators.
5.  **Tooltips:** Implement custom HTML tooltips for the charts showing the exact percentage and count when hovering over bars/lines.

## Step-by-Step Plan
1.  Setup Vite + React + TS.
2.  Install `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-dsv`, `d3-time-format`.
3.  Create `types.ts` for data interfaces.
4.  Create `utils/dataTransform.ts` for the calculated field logic.
5.  Create `components/OverviewKPIs.tsx`.
6.  Create `components/CountyChart.tsx` using D3.
7.  Create `components/PartnerChart.tsx` using D3.
8.  Create `components/TrendChart.tsx` using D3.
9.  Create `components/FacilityTable.tsx`.
10. Assemble in `App.tsx` with state management for filters and parameters.
11. Load data in `useEffect` in `App.tsx`.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/federated_0se4v9q15j8hfi17f25m50.csv

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
const rows = await loadCsv("/data/federated_0se4v9q15j8hfi17f25m50.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_4836_2/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: County: Distributon
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayCounty:nk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[sum:Calculation_714102023265128449:qk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayAgency:nk]`
- bar_orientation: `horizontal`
- axis_title_cols: Number of Facilities by County
- zone: x=174, y=10980, w=32958, h=71621
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: County: PKV Recency
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayCounty:nk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:County Percent Uploads Proportions (copy 3):qk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:County Color (copy 2):nk]`
- bar_orientation: `horizontal`
- axis_title_cols: % PKV Uploads
- zone: x=66437, y=10980, w=32957, h=71621
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: County:Overall rate
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayCounty:nk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:Calculation_714102023265861635:qk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:Calculation_557601975853465601:nk]`
- bar_orientation: `horizontal`
- series_order: Above 67\%, 34 - 66\%, Below 34\%, %all%
- expected_series_values: Above 67\%, 34 - 66\%, Below 34\%, %all%
- axis_title_cols: % C&T Uploads
- zone: x=33306, y=10980, w=32957, h=71621
- legend_required: true
- legend_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:Calculation_557601975853465601:nk]`
- legend_relative_position: below
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored below the worksheet based on dashboard zones; avoid global legend hoisting.
## Dashboard Text Zones
- zone(x=346, y=83615, w=78874, h=15878): The Overall reporting rate refers to the proportion of EMR sites that submitted the most recent report i.e. The Jan 2020 overall reporting rate is the number of EMR sites that uploaded data to the NDW in Jan 2020 and so forth. PKVs = Patient Key Value is a concatenation of a patients Gender + Soundex value of Firstname​ + Double Metaphone value of Lastname​ + Date of Birth PKVs transmitted to the NDWH along with HTS and care and treatment data to allow for Deduplication at the National level ​and Linking patient records within and across facilities.​
