# Project Requirements

You are an expert React developer. Your task is to implement a dashboard application that replicates the functionality and visual style of a specific Tableau workbook ('ReportingRatesCTNMPI').

## Tech Stack & Constraints
- **Framework:** React + TypeScript + Vite.
- **Visualization:** Use D3.js primitives (d3-scale, d3-shape, d3-axis, d3-array) for charts. Do not use high-level chart libraries like Recharts or Chart.js unless absolutely necessary for complex interactions, but prefer raw D3 for fidelity.
- **Styling:** Use standard CSS or CSS-in-JS (e.g., styled-components or emotion). Do not use Ant Design or similar heavy UI component libraries unless the layout explicitly requires complex tree-grids or specific widgets not easily built with CSS Grid/Flex.
- **Data:** The application must fetch data from `/data/federated_0se4v9q15j8hfi17f25m50.csv`.

## Data Loading

1.  **Fetch the Data:**
    Create a utility function `useDashboardData` that fetches the CSV file from the public directory.
    ```typescript
    const fetchData = async () => {
      const response = await fetch('/data/federated_0se4v9q15j8hfi17f25m50.csv');
      const csvText = await response.text();
      // Use d3-dsv or a similar parser to convert CSV text to an array of objects
      const data = d3.csvParse(csvText);
      return data;
    };
    ```

2.  **Type Definitions:**
    Define a TypeScript interface `DataRow` based on the CSV columns provided in the Tableau XML.
    ```typescript
    interface DataRow {
      DisplayMFL: string;
      DisplayFacilityName: string;
      DisplaySubcounty: string;
      DisplayCounty: string;
      DisplayMechanism: string;
      DisplayAgency: string;
      UploadStatus: string;
      UploadDate: string; // Date string, parse to Date object
      Upload_monthYear: string;
      SiteCode: string;
      MPI_SiteCode: string;
      UploadDate_MPI: string;
      Upload_monthYear_MPI: string;
      Siteabstractiondate: string;
    }
    ```

## Data Transformation & Logic (Replicating Tableau Calculations)

The dashboard relies heavily on a "Parameter 1" (a selected month/year). You must implement a state variable `selectedDate` (defaulting to roughly Jan 2021 based on the XML, or the latest available date in the data).

You need to replicate the following logic in TypeScript helper functions:

1.  **Filtering Logic (3-Month Window):**
    The workbook analyzes uploads for the selected month (Month 0) and the two preceding months (Month -1, Month -2).
    -   `Month 0`: `UploadDate` is in `selectedDate` month.
    -   `Month 1`: `UploadDate` is in `selectedDate` minus 1 month.
    -   `Month 2`: `UploadDate` is in `selectedDate` minus 2 months.

2.  **Metrics Calculation:**
    -   `Expected Sites`: `COUNTD(DisplayMFL)` (Total distinct facilities).
    -   `Uploaded Sites (CT)`: `COUNTD(SiteCode)` where `UploadDate` falls within the specific month window being analyzed.
    -   `Reporting Rate (%)`: `(Uploaded Sites / Expected Sites) * 100`.

3.  **Color Logic (County/Partner Performance):**
    -   **Above 67%**: Green / 'Good'
    -   **34% - 66%**: Yellow / 'Average'
    -   **Below 34%**: Red / 'Bad'
    (Derived from `Calculation_557601975853465601` in XML).

4.  **Recency Logic:**
    Calculate the difference in months between `Siteabstractiondate` and the most recent `UploadDate`.
    -   0-2 months: 'Good'
    -   3+ months: 'Average'
    -   Negative or Null: 'Bad'

## Component Architecture

### 1. `App` (Main Container)
-   Manages the global state: `data` (array of rows), `selectedDate` (Date object), and `filters` (object for selected County/Partner).
-   Layout: CSS Grid.
    -   **Header:** Title "Reporting Rates CT + MPI" and the Date Parameter control.
    -   **Top Row:** 3 KPI Cards (Month 0, Month 1, Month 2 Reporting Rates).
    -   **Middle Row:** Two charts side-by-side (County Performance, Partner Performance).
    -   **Bottom Row:** Detailed Data Table (Facility Level).

### 2. `ParameterControl`
-   A dropdown or date picker allowing the user to select the "Upload Period - 3 Months".
-   Changing this value triggers a recalculation of all metrics and re-renders all charts.

### 3. `KPICard`
-   Props: `label` (e.g., "October 2019", "September 2019"), `value` (percentage), `count` (number of sites).
-   Visual: Large bold percentage, smaller label below.

### 4. `CountyBarChart` (D3 Implementation)
-   **Data:** Group data by `DisplayCounty`. Calculate Reporting Rate % for the *current selected month*.
-   **Visual Encoding:**
    -   X-Axis: Reporting Rate % (0 to 100).
    -   Y-Axis: County Names.
    -   Color: Encoded by performance tier (Green/Yellow/Red) based on the % value.
-   **Interaction:** Clicking a bar sets the `selectedCounty` filter in the parent state.

### 5. `PartnerBarChart` (D3 Implementation)
-   **Data:** Group data by `DisplayMechanism` (Partner). Calculate Reporting Rate %.
-   **Visual Encoding:**
    -   X-Axis: Partner Names.
    -   Y-Axis: Reporting Rate %.
    -   Color: Encoded by performance tier.
-   **Interaction:** Clicking a bar sets the `selectedPartner` filter.

### 6. `FacilityTable`
-   **Data:** The raw list of facilities, filtered by `selectedCounty` and `selectedPartner` (if any).
-   **Columns:** `DisplayFacilityName`, `DisplaySubcounty`, `DisplayMechanism`, `UploadStatus` (Calculated), `Latest Upload Date` (Max of UploadDate).
-   **Style:** Standard HTML table with sticky header.

## Sample Data

Here is a sample of the data structure you will be working with:

```json
[
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 12523,
    "\"DisplayFacilityName\"": "Migwani Sub County Hospital",
    "\"DisplaySubcounty\"": "Mwingi West",
    "\"DisplayCounty\"": "KITUI",
    "\"DisplayMechanism\"": "CHS NAISHI",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2020-11-18",
    "\"Upload_monthYear\"": "November 2020",
    "\"SiteCode\"": 12523,
    "\"MPI_SiteCode\"": 12523,
    "\"UploadDate_MPI\"": "2020-11-18",
    "\"Upload_monthYear_MPI\"": "November 2020",
    "\"Siteabstractiondate\"": "2021-05-05"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 13948,
    "\"DisplayFacilityName\"": "Nyenye Misori Dispensary",
    "\"DisplaySubcounty\"": "Bondo",
    "\"DisplayCounty\"": "SIAYA",
    "\"DisplayMechanism\"": "CHS SHINDA",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-10-04",
    "\"Upload_monthYear\"": "October 2020",
    "\"SiteCode\"": 13948,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-05-06"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 13692,
    "\"DisplayFacilityName\"": "Kijauri Sub County Hospital",
    "\"DisplaySubcounty\"": "Borabu",
    "\"DisplayCounty\"": "NYAMIRA",
    "\"DisplayMechanism\"": "AFYA ZIWANI",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-05-13",
    "\"Upload_monthYear\"": "May 2021",
    "\"SiteCode\"": 13692,
    "\"MPI_SiteCode\"": 13692,
    "\"UploadDate_MPI\"": "2021-05-11",
    "\"Upload_monthYear_MPI\"": "May 2021",
    "\"Siteabstractiondate\"": "2021-05-04"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 12626,
    "\"DisplayFacilityName\"": "Mwingi Sub County Hospital",
    "\"DisplaySubcounty\"": "Mwingi Central",
    "\"DisplayCounty\"": "KITUI",
    "\"DisplayMechanism\"": "CHS NAISHI",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-10-05",
    "\"Upload_monthYear\"": "October 2020",
    "\"SiteCode\"": 12626,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-05-03"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 15983,
    "\"DisplayFacilityName\"": "Mabusi Health Centre",
    "\"DisplaySubcounty\"": "Likuyani",
    "\"DisplayCounty\"": "KAKAMEGA",
    "\"DisplayMechanism\"": "AMPATH PLUS",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2021-04-01",
    "\"Upload_monthYear\"": "April 2021",
    "\"SiteCode\"": 15983,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-03-30"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 13122,
    "\"DisplayFacilityName\"": "Ngara Health Centre (City Council of Nairobi)",
    "\"DisplaySubcounty\"": "Starehe",
    "\"DisplayCounty\"": "NAIROBI",
    "\"DisplayMechanism\"": "UMB PACT ENDELEZA",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2020-12-04",
    "\"Upload_monthYear\"": "December 2020",
    "\"SiteCode\"": 13122,
    "\"MPI_SiteCode\"": 13122,
    "\"UploadDate_MPI\"": "2020-12-23",
    "\"Upload_monthYear_MPI\"": "December 2020",
    "\"Siteabstractiondate\"": "2021-05-20"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 15646,
    "\"DisplayFacilityName\"": "St Joseph Catholic Dispensary (Laikipia East)",
    "\"DisplaySubcounty\"": "Laikipia East",
    "\"DisplayCounty\"": "LAIKIPIA",
    "\"DisplayMechanism\"": "AFYA NYOTA YA BONDE",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-01-04",
    "\"Upload_monthYear\"": "January 2021",
    "\"SiteCode\"": 15646,
    "\"MPI_SiteCode\"": 15646,
    "\"UploadDate_MPI\"": "2021-01-04",
    "\"Upload_monthYear_MPI\"": "January 2021",
    "\"Siteabstractiondate\"": "2021-04-15"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 11526,
    "\"DisplayFacilityName\"": "Lungalunga Subcounty Hospital",
    "\"DisplaySubcounty\"": "Lunga Lunga",
    "\"DisplayCounty\"": "KWALE",
    "\"DisplayMechanism\"": "AFYA PWANI",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-12-15",
    "\"Upload_monthYear\"": "December 2020",
    "\"SiteCode\"": 11526,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-05-10"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 14063,
    "\"DisplayFacilityName\"": "Rwambwa Sub-county Hospital",
    "\"DisplaySubcounty\"": "Alego Usonga",
    "\"DisplayCounty\"": "SIAYA",
    "\"DisplayMechanism\"": "CHS SHINDA",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2020-10-08",
    "\"Upload_monthYear\"": "October 2020",
    "\"SiteCode\"": 14063,
    "\"MPI_SiteCode\"": 14063,
    "\"UploadDate_MPI\"": "2020-10-08",
    "\"Upload_monthYear_MPI\"": "October 2020",
    "\"Siteabstractiondate\"": "2021-05-04"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 16066,
    "\"DisplayFacilityName\"": "Nambale Sub County Hospital",
    "\"DisplaySubcounty\"": "Nambale",
    "\"DisplayCounty\"": "BUSIA",
    "\"DisplayMechanism\"": "AMPATH PLUS",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2021-04-09",
    "\"Upload_monthYear\"": "April 2021",
    "\"SiteCode\"": 16066,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-05-04"
  }
]
```

## Implementation Notes
-   Ensure the date parsing handles the specific format in the CSV (likely YYYY-MM-DD or similar).
-   The "Upload Status" logic in the Tableau XML (`Calculation_1593429869478662153`) is complex. For the React implementation, simplify this to a comparison of the latest `UploadDate` vs the `selectedDate` to determine if a facility is "Uploaded", "Late", or "Not Uploaded" for the specific month context.
-   Use CSS Grid for the main dashboard layout to ensure responsiveness. The charts should resize using the `ResizeObserver` pattern or standard `viewBox` logic in D3.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_4836_3/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Partner: Distributon
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayMechanism:nk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[sum:County Denominator Expected Reports (copy):qk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[DisplayAgency (group)]`
- bar_orientation: `horizontal`
- axis_title_cols: Number of EMR Sites by Partner
- zone: x=347, y=12669, w=32958, h=68919
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
- zone: x=33479, y=12669, w=32957, h=68919
- legend_required: true
- legend_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:County Color (copy):nk]`
- legend_relative_position: below
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored below the worksheet based on dashboard zones; avoid global legend hoisting.
### Worksheet: Partner: Recency
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[none:DisplayMechanism:nk]`
- cols_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:Partner Percent Uploaded (copy):qk]`
- series_field: `[federated.0se4v9q15j8hfi17f25m50pn59wd].[usr:PArtner Color  (copy):nk]`
- bar_orientation: `horizontal`
- series_order: Above 67\%, 34 - 66\%, Below 33\%, %all%
- expected_series_values: Above 67\%, 34 - 66\%, Below 33\%, %all%
- axis_title_cols: % PKV Uploads
- zone: x=66610, y=12669, w=32957, h=68919
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
## Dashboard Text Zones
- zone(x=260, y=82264, w=61818, h=17399): The Overall reporting rate refers to the proportion of EMR sites that submitted the most recent report i.e. The Jan 2020 overall reporting rate is the number of EMR sites that uploaded data to the NDW in Jan 2020 and so forth. PKVs = Patient Key Value is a concatenation of a patients Gender + Soundex value of Firstname​ + Double Metaphone value of Lastname​ + Date of Birth PKVs transmitted to the NDWH along with HTS and care and treatment data to allow for Deduplication at the National level ​and Linking patient records within and across facilities.​
