# Project Requirements

You are an expert React developer tasked with reverse-engineering a Tableau dashboard into a React + TypeScript application.

## Project Overview
The goal is to rebuild a 'Reporting Rates CT & MPI' dashboard. This dashboard tracks the reporting performance of health facilities (EMR sites) based on Care & Treatment (CT) and MPI (PKV) data uploads over a rolling 3-month period.

## Tech Stack
- **Framework:** React 18+ with TypeScript.
- **Build Tool:** Vite.
- **Visualization:** D3.js (v7 or similar) for charts. Use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`. Do not use high-level chart libraries like Recharts or Nivo unless necessary for complex tooltips, but prefer D3 primitives for the core rendering.
- **Styling:** CSS Modules or Tailwind CSS (if configured, otherwise standard CSS). Use CSS Grid for the main dashboard layout.
- **Data Handling:** Fetch CSV data from the public folder and parse it using `d3-dsv` (d3.csvParse).

## Data Loading

1.  **Source:** The primary data file is located at `/data/federated_0se4v9q15j8hfi17f25m50.csv`.
2.  **Implementation:** Create a utility or hook to fetch and parse this data.

```typescript
// Example data fetching logic
import { csv } from 'd3-fetch';

export const fetchData = async () => {
  const data = await csv('/data/federated_0se4v9q15j8hfi17f25m50.csv');
  // Type assertion or interface definition should follow the CSV structure
  return data;
};
```

## Data Logic & Calculations (Replicating Tableau)

The dashboard relies heavily on a 'Parameter 1' (Upload Period - 3 Months). You must implement a state variable `selectedDate` (default: '2021-01-06') that drives the calculations.

### Key Calculations to Implement in JavaScript/TypeScript:

1.  **Time Window:**
    -   Determine the 3-month window: `Month(selectedDate)`, `Month(selectedDate) - 1`, `Month(selectedDate) - 2`.
    -   Note: Handle year rollover correctly.

2.  **Reporting Status (CT):**
    -   A facility is considered 'Uploaded' for CT if `UploadDate` falls within the 3-month window.

3.  **Reporting Status (MPI):**
    -   A facility is considered 'Uploaded' for MPI if `UploadDate_MPI` falls within the 3-month window.

4.  **Upload Status (Categorical):**
    -   'Care & Treatment + PKV(MPI) uploaded': Both CT and MPI have valid dates in the window.
    -   'Only Care & Treatment Uploaded': CT valid, MPI null or outside window.
    -   'Only PKV(MPI) Uploaded': MPI valid, CT null or outside window.
    -   'Not Uploaded Care & Treatment or PKV(MPI)': Neither valid.

5.  **Recency:**
    -   Calculate the difference in months between `Siteabstractiondate` and the current date (or max upload date).
    -   Categorize as 'Good' (0-2 months), 'Average' (3+ months), 'Bad' (Never or negative).

6.  **Aggregations (Level of Detail):**
    -   **County Level:** Group by `DisplayCounty`.
        -   Numerator: Count of unique `DisplayMFL` where Upload Status is 'Uploaded'.
        -   Denominator: Count of unique `DisplayMFL` (Total Expected).
        -   Metric: Numerator / Denominator.
    -   **Partner Level:** Group by `DisplayMechanism`.
        -   Same Numerator/Denominator logic as County.

7.  **Color Encoding:**
    -   **Performance Color:**
        -   Green ('Above 67%'): Percentage >= 0.67
        -   Yellow ('34 - 66%'): Percentage >= 0.34 AND < 0.67
        -   Red ('Below 34%'): Percentage < 0.34

## Dashboard Layout & Components

The layout should be a responsive grid.

### 1. Header Component
-   **Title:** "Reporting Rates CT & MPI"
-   **Control:** A Date Picker or Dropdown for 'Upload Period - 3 Months'. The options should be derived from the data or hardcoded to the range found in the Tableau XML (Oct 2019 - Jan 2021).

### 2. KPI Cards Component (Top Row)
-   Display 3 key metrics:
    -   **Total Expected Sites:** `COUNTD(DisplayMFL)`
    -   **Sites Uploaded (CT):** Count of sites with CT uploads in the window.
    -   **Reporting Rate (CT):** Percentage of sites uploaded.

### 3. County Performance Chart (Middle Left)
-   **Type:** Horizontal Bar Chart.
-   **X-Axis:** Percentage (0% to 100%).
-   **Y-Axis:** `DisplayCounty` (sorted by percentage descending).
-   **Color:** Encoded by the Performance Color logic (Green/Yellow/Red).
-   **Tooltip:** Show County Name, Numerator, Denominator, and Percentage.
-   **Interaction:** Clicking a bar filters the Partner chart and Facility table to that county.

### 4. Partner Performance Chart (Middle Right)
-   **Type:** Horizontal Bar Chart.
-   **X-Axis:** Percentage (0% to 100%).
-   **Y-Axis:** `DisplayMechanism` (Partner Name).
-   **Color:** Encoded by the Performance Color logic.
-   **Interaction:** Clicking a bar filters the County chart and Facility table to that partner.

### 5. Facility Details Table (Bottom)
-   **Type:** Data Table.
-   **Columns:**
    -   `DisplayFacilityName`
    -   `DisplayCounty`
    -   `DisplayMechanism` (Partner)
    -   `UploadStatus` (The calculated categorical status)
    -   `Recency` (Text description, e.g., "2 months", "Never Uploaded")
-   **Styling:** Use color coding for the `UploadStatus` or `Recency` columns to match the dashboard theme.
-   **Pagination:** Implement basic pagination if the list is long (e.g., 50 rows per page).

## Sample Data

Here is a sample of the data structure you will encounter:

```json
[
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 12893,
    "\"DisplayFacilityName\"": "Chandaria Health Centre",
    "\"DisplaySubcounty\"": "Dagoretti South",
    "\"DisplayCounty\"": "NAIROBI",
    "\"DisplayMechanism\"": "UMB PACT ENDELEZA",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-03-05",
    "\"Upload_monthYear\"": "March 2021",
    "\"SiteCode\"": 12893,
    "\"MPI_SiteCode\"": 12893,
    "\"UploadDate_MPI\"": "2021-03-05",
    "\"Upload_monthYear_MPI\"": "March 2021",
    "\"Siteabstractiondate\"": "2021-04-30"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 13789,
    "\"DisplayFacilityName\"": "Matata Nursing Hospital",
    "\"DisplaySubcounty\"": "Rachuonyo South",
    "\"DisplayCounty\"": "HOMA BAY",
    "\"DisplayMechanism\"": "EGPAF TIMIZA",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-06-02",
    "\"Upload_monthYear\"": "June 2021",
    "\"SiteCode\"": 13789,
    "\"MPI_SiteCode\"": 13789,
    "\"UploadDate_MPI\"": "2021-06-02",
    "\"Upload_monthYear_MPI\"": "June 2021",
    "\"Siteabstractiondate\"": "2021-05-04"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 15358,
    "\"DisplayFacilityName\"": "Njoro Subcounty Hospital",
    "\"DisplaySubcounty\"": "Njoro",
    "\"DisplayCounty\"": "NAKURU",
    "\"DisplayMechanism\"": "AFYA NYOTA YA BONDE",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-07-03",
    "\"Upload_monthYear\"": "July 2020",
    "\"SiteCode\"": 15358,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-04-29"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 11984,
    "\"DisplayFacilityName\"": "Dallas Dispensary",
    "\"DisplaySubcounty\"": "Manyatta",
    "\"DisplayCounty\"": "EMBU",
    "\"DisplayMechanism\"": "AFYA JIJINI",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-02-02",
    "\"Upload_monthYear\"": "February 2021",
    "\"SiteCode\"": 11984,
    "\"MPI_SiteCode\"": 11984,
    "\"UploadDate_MPI\"": "2021-02-02",
    "\"Upload_monthYear_MPI\"": "February 2021",
    "\"Siteabstractiondate\"": "2021-02-23"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 13947,
    "\"DisplayFacilityName\"": "Nyawara Health Centre",
    "\"DisplaySubcounty\"": "Gem",
    "\"DisplayCounty\"": "SIAYA",
    "\"DisplayMechanism\"": "CHS SHINDA",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-11-10",
    "\"Upload_monthYear\"": "November 2020",
    "\"SiteCode\"": 13947,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-04-28"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 12508,
    "\"DisplayFacilityName\"": "Mbooni Sub County Hospital",
    "\"DisplaySubcounty\"": "Mbooni",
    "\"DisplayCounty\"": "MAKUENI",
    "\"DisplayMechanism\"": "CHS NAISHI",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-05-05",
    "\"Upload_monthYear\"": "May 2021",
    "\"SiteCode\"": 12508,
    "\"MPI_SiteCode\"": 12508,
    "\"UploadDate_MPI\"": "2021-05-05",
    "\"Upload_monthYear_MPI\"": "May 2021",
    "\"Siteabstractiondate\"": "2021-05-03"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 15107,
    "\"DisplayFacilityName\"": "Magadi Hospital",
    "\"DisplaySubcounty\"": "Kajiado West",
    "\"DisplayCounty\"": "KAJIADO",
    "\"DisplayMechanism\"": "AFYA NYOTA YA BONDE",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-05-05",
    "\"Upload_monthYear\"": "May 2021",
    "\"SiteCode\"": 15107,
    "\"MPI_SiteCode\"": 15107,
    "\"UploadDate_MPI\"": "2021-05-05",
    "\"Upload_monthYear_MPI\"": "May 2021",
    "\"Siteabstractiondate\"": "2021-05-05"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 13208,
    "\"DisplayFacilityName\"": "St Joseph Mukasa Dispensary",
    "\"DisplaySubcounty\"": "Roysambu",
    "\"DisplayCounty\"": "NAIROBI",
    "\"DisplayMechanism\"": "AFYA JIJINI",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2020-09-09",
    "\"Upload_monthYear\"": "September 2020",
    "\"SiteCode\"": 13208,
    "\"MPI_SiteCode\"": 13208,
    "\"UploadDate_MPI\"": "2020-09-27",
    "\"Upload_monthYear_MPI\"": "September 2020",
    "\"Siteabstractiondate\"": "2021-05-04"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 12502,
    "\"DisplayFacilityName\"": "Mbitini Catholic Dispensary",
    "\"DisplaySubcounty\"": "Kibwezi West",
    "\"DisplayCounty\"": "MAKUENI",
    "\"DisplayMechanism\"": "CHAK CHAP UZIMA",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-09-04",
    "\"Upload_monthYear\"": "September 2020",
    "\"SiteCode\"": 12502,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-05-07"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 13756,
    "\"DisplayFacilityName\"": "Magwagwa Health Centre",
    "\"DisplaySubcounty\"": "Nyamira North",
    "\"DisplayCounty\"": "NYAMIRA",
    "\"DisplayMechanism\"": "AFYA ZIWANI",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-01-07",
    "\"Upload_monthYear\"": "January 2021",
    "\"SiteCode\"": 13756,
    "\"MPI_SiteCode\"": 13756,
    "\"UploadDate_MPI\"": "2021-01-07",
    "\"Upload_monthYear_MPI\"": "January 2021",
    "\"Siteabstractiondate\"": "2021-05-04"
  }
]
```

## Implementation Notes
-   Ensure the application handles the 'Parameter' change efficiently. When the date changes, re-run the filtering logic and update all charts.
-   The 'Upload Month Year' in the data is a string (e.g., "January 2020"). You will need to parse this or use the `UploadDate` (Date object) for accurate filtering.
-   Preserve the exact text labels for Upload Status and Color legends as defined in the Tableau XML (e.g., "Care & Treatment + PKV(MPI) uploaded").

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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_4836/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Before Previous Month Overall RR 
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:County Percent Uploads Proportions (copy 2):qk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none: Parameter Period Label - Month 1 (copy):nk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayAgency:nk]`
- bar_orientation: `vertical`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: Before Previous Month Overall RR MPI (2)
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:County Percent Uploads Proportions (copy 2):qk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none: Parameter Period Label - Month 1 (copy):nk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayAgency:nk]`
- bar_orientation: `vertical`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: County MPI
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayCounty:nk]`
- cols_field: ``
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:UploadDate_MPI:ok]`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: County: Distributon
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayCounty:nk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[sum:Calculation_714102023265128449:qk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayAgency:nk]`
- bar_orientation: `horizontal`
- axis_title_cols: Number of Facilities by County
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
- legend_required: true
- legend_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:Calculation_557601975853465601:nk]`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
### Worksheet: List Consistency by Partner
- chart_intent: `custom_tableau_view`
- rows_field: `([federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayMFL:nk] / ([federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayFacilityName:nk] / ([federated.0se4v9q15j8hfi17f25m50pn59wd].[DisplayMechanism (group)] / [federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayCounty:nk])))`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:Calculation_989947529004945410:ok]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:UploadDate:ok]`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: List Denominator County
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayCounty:nk]`
- cols_field: ``
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: List Denominator Partner
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[DisplayMechanism (group)]`
- cols_field: ``
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: List Partner MPI Recency
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[DisplayMechanism (group) 2]`
- cols_field: ``
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:UploadDate_MPI:ok]`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: List Rececy by Partner
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[DisplayMechanism (group) 1]`
- cols_field: ``
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:UploadDate:ok]`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: List of EMR Sites / DWH Uploads (3)
- chart_intent: `custom_tableau_view`
- rows_field: `([federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayCounty:nk] / ([federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayMechanism:nk] / ([federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayFacilityName:nk] / ([federated.0se4v9q15j8hfi17f25m50pn59wd].[none:Calculation_1593429869476466693:nk] / ([federated.0se4v9q15j8hfi17f25m50pn59wd].[none:Calculation_1593429869483032587:nk] / [federated.0se4v9q15j8hfi17f25m50pn59wd].[none:SiteabstractionDate (copy):nk])))))`
- cols_field: ``
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:Calculation_1593429869478662153:nk]`
- series_order: CT & PKVs Uploaded, Only CT Uploaded; No PKVs, Not Uploaded this month, Never Uploaded to DWH
- expected_series_values: CT & PKVs Uploaded, Only CT Uploaded; No PKVs, Not Uploaded this month, Never Uploaded to DWH
- zone: x=34595, y=14950, w=65141, h=85050
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: Overview - Overall Recency CT
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayAgency:nk]`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: Overview - Overall Recency MPI
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayAgency:nk]`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: Overview Expected Uploads
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayAgency:nk]`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Partner: Distributon
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayMechanism:nk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[sum:County Denominator Expected Reports (copy):qk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[DisplayAgency (group)]`
- bar_orientation: `horizontal`
- axis_title_cols: Number of EMR Sites by Partner
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: Partner: Overall
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayMechanism:nk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:County Percent Uploads Proportions (copy):qk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:County Color (copy):nk]`
- bar_orientation: `horizontal`
- series_order: Above 67\%, 34 - 66\%, Below 33\%, %all%
- expected_series_values: Above 67\%, 34 - 66\%, Below 33\%, %all%
- axis_title_cols: % C&T Uploads
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: Partner: Recency
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayMechanism:nk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:Partner Percent Uploaded (copy):qk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:PArtner Color  (copy):nk]`
- bar_orientation: `horizontal`
- series_order: Above 67\%, 34 - 66\%, Below 33\%, %all%
- expected_series_values: Above 67\%, 34 - 66\%, Below 33\%, %all%
- axis_title_cols: % PKV Uploads
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: Previous Month Overall RR
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:County Percent Uploads Proportions (copy 2):qk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none: Parameter Period Label (copy):nk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayAgency:nk]`
- bar_orientation: `vertical`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: Previous Month Overall RR MPI
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:County Percent Uploads Proportions (copy 2):qk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none: Parameter Period Label (copy):nk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayAgency:nk]`
- bar_orientation: `vertical`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: Rececy by County
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayCounty:nk]`
- cols_field: ``
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:UploadDate:ok]`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
### Worksheet: Recent Month Overall RR
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:County Percent Uploads Proportions (copy 2):qk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:Date Label (copy):nk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayAgency:nk]`
- bar_orientation: `vertical`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: Recent Month Overall RR MPI
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:County Percent Uploads Proportions (copy 2):qk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:Date Label (copy):nk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayAgency:nk]`
- bar_orientation: `vertical`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
### Worksheet: Summary Stats
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:Calculation_1593429869478662153:nk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:Fixed Site (copy):qk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:Calculation_1593429869478662153:nk]`
- bar_orientation: `horizontal`
- zone: x=615, y=14787, w=33277, h=54147
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Validation List of Sites- Upload
- chart_intent: `custom_tableau_view`
- rows_field: `([federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayMFL (copy):nk] / ([federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayMechanism:nk] / ([federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayFacilityName:nk] / [federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayCounty:nk])))`
- cols_field: ``
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:UploadDate:ok]`
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
## Dashboard Text Zones
- zone(x=352, y=8970, w=99648, h=5814): EMR Facilities Upload Status - <[Parameters].[Parameter 4]>
- zone(x=527, y=69770, w=33629, h=30061): Definitions EMR Recency Date is an indicator of when the EMR was last updated. If the date is 4 months ago, it either means that that’s the last time a facility had a patient, or the last time the EMR was updated. Latest Upload Date: Is the last time the EMR was uploaded to the DWH Latest PKV Date: Is the last time the PKVs were uploaded to the DWH
- zone(x=346, y=83615, w=78874, h=15878): The Overall reporting rate refers to the proportion of EMR sites that submitted the most recent report i.e. The Jan 2020 overall reporting rate is the number of EMR sites that uploaded data to the NDW in Jan 2020 and so forth. PKVs = Patient Key Value is a concatenation of a patients Gender + Soundex value of Firstname​ + Double Metaphone value of Lastname​ + Date of Birth PKVs transmitted to the NDWH along with HTS and care and treatment data to allow for Deduplication at the National level ​and Linking patient records within and across facilities.​
- zone(x=260, y=82264, w=61818, h=17399): The Overall reporting rate refers to the proportion of EMR sites that submitted the most recent report i.e. The Jan 2020 overall reporting rate is the number of EMR sites that uploaded data to the NDW in Jan 2020 and so forth. PKVs = Patient Key Value is a concatenation of a patients Gender + Soundex value of Firstname​ + Double Metaphone value of Lastname​ + Date of Birth PKVs transmitted to the NDWH along with HTS and care and treatment data to allow for Deduplication at the National level ​and Linking patient records within and across facilities.​
- zone(x=346, y=86993, w=98788, h=12331): The Overall reporting rate refers to the proportion of EMR sites that submitted the most recent report i.e. The Jan 2020 overall reporting rate is the number of EMR sites that uploaded data to the NDW in Jan 2020 and so forth. PKVs = Patient Key Value is a concatenation of a patients Gender + Soundex value of Firstname​ + Double Metaphone value of Lastname​ + Date of Birth PKVs transmitted to the NDWH along with HTS and care and treatment data to allow for Deduplication at the National level ​and Linking patient records within and across facilities.​
- zone(x=52641, y=28041, w=47359, h=4054): Trends in Reporting PKVs (Overall)
- zone(x=1039, y=28209, w=50909, h=4054): Trends in Reporting Care & Treatment (Overall)
## Dashboard Actions
- Filter 5 (generated) 1: kind=filter_action, source=Overview Expected Uploads, target=Reporting Rates_Optimization:Dashboard:Overview
- Filter 1 (generated): kind=filter_action, source=Summary Stats, target=Reporting Rates_Optimization:Dashboard: Facility Upload Status (CT + PKV)
