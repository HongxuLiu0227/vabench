# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard named 'ReportingRatesCTNMPI' using React, TypeScript, and Vite.

## Tech Stack & Constraints
- **Framework:** React + TypeScript + Vite.
- **Visualization:** Use D3.js primitives (d3-scale, d3-shape, d3-axis, d3-array) for all charts. Do not use high-level chart libraries.
- **Styling:** Use CSS Modules or Tailwind CSS (preferred for layout speed). Use CSS Grid for the main dashboard layout.
- **Data:** Load data from `/data/federated_0se4v9q15j8hfi17f25m50.csv`.

## Data Loading
Implement a data fetching utility using the native `fetch` API.

1. Create a function `useDashboardData` that fetches the CSV.
2. Use `d3-dsv` (d3.csvParse) to parse the raw text.
3. Type the data strictly based on the columns found in the CSV.

Example implementation structure:
```typescript
import { useState, useEffect } from 'react';
import { csvParse } from 'd3-dsv';

interface DataRow {
  DisplayMFL: string;
  DisplayFacilityName: string;
  DisplaySubcounty: string;
  DisplayCounty: string;
  DisplayMechanism: string;
  DisplayAgency: string;
  UploadStatus: string;
  UploadDate: string; // ISO date string
  Upload_monthYear: string;
  SiteCode: string;
  MPI_SiteCode: string;
  UploadDate_MPI: string;
  Upload_monthYear_MPI: string;
  Siteabstractiondate: string;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/federated_0se4v9q15j8hfi17f25m50.csv')
      .then(res => res.text())
      .then(csvText => {
        const parsed = csvParse(csvText) as DataRow[];
        setData(parsed);
        setLoading(false);
      });
  }, []);

  return { data, loading };
};
```

## Sample Data
```json
[
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 12913,
    "\"DisplayFacilityName\"": "Dandora I Health Centre",
    "\"DisplaySubcounty\"": "Embakasi North",
    "\"DisplayCounty\"": "NAIROBI",
    "\"DisplayMechanism\"": "UMB PACT ENDELEZA",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2020-12-10",
    "\"Upload_monthYear\"": "December 2020",
    "\"SiteCode\"": 12913,
    "\"MPI_SiteCode\"": 12913,
    "\"UploadDate_MPI\"": "2020-12-21",
    "\"Upload_monthYear_MPI\"": "December 2020",
    "\"Siteabstractiondate\"": "2021-05-17"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 14159,
    "\"DisplayFacilityName\"": "Urenga Health Centre",
    "\"DisplaySubcounty\"": "Ugenya",
    "\"DisplayCounty\"": "SIAYA",
    "\"DisplayMechanism\"": "CHS SHINDA",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-04-08",
    "\"Upload_monthYear\"": "April 2021",
    "\"SiteCode\"": 14159,
    "\"MPI_SiteCode\"": 14159,
    "\"UploadDate_MPI\"": "2021-04-08",
    "\"Upload_monthYear_MPI\"": "April 2021",
    "\"Siteabstractiondate\"": "2021-05-06"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 10485,
    "\"DisplayFacilityName\"": "Karatina District Hospital",
    "\"DisplaySubcounty\"": "Mathira East",
    "\"DisplayCounty\"": "NYERI",
    "\"DisplayMechanism\"": "CHS TEGEMEZA PLUS",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-04-02",
    "\"Upload_monthYear\"": "April 2021",
    "\"SiteCode\"": 10485,
    "\"MPI_SiteCode\"": 10485,
    "\"UploadDate_MPI\"": "2021-04-02",
    "\"Upload_monthYear_MPI\"": "April 2021",
    "\"Siteabstractiondate\"": "2021-05-04"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 13524,
    "\"DisplayFacilityName\"": "Chiga Dispensary",
    "\"DisplaySubcounty\"": "Kisumu East",
    "\"DisplayCounty\"": "KISUMU",
    "\"DisplayMechanism\"": "AFYA ZIWANI",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-09-02",
    "\"Upload_monthYear\"": "September 2020",
    "\"SiteCode\"": 13524,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-04-30"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 14841,
    "\"DisplayFacilityName\"": "Kesses Health Centre",
    "\"DisplaySubcounty\"": "Kesses",
    "\"DisplayCounty\"": "UASIN GISHU",
    "\"DisplayMechanism\"": "AMPATH PLUS",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-06-06",
    "\"Upload_monthYear\"": "June 2020",
    "\"SiteCode\"": 14841,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-05-07"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 10916,
    "\"DisplayFacilityName\"": "JM Kariuki County Memorial Hospital (Olkalou)",
    "\"DisplaySubcounty\"": "Olkalou",
    "\"DisplayCounty\"": "NYANDARUA",
    "\"DisplayMechanism\"": "CHS TEGEMEZA PLUS",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-06-04",
    "\"Upload_monthYear\"": "June 2021",
    "\"SiteCode\"": 10916,
    "\"MPI_SiteCode\"": 10916,
    "\"UploadDate_MPI\"": "2021-06-04",
    "\"Upload_monthYear_MPI\"": "June 2021",
    "\"Siteabstractiondate\"": "2021-05-03"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 13705,
    "\"DisplayFacilityName\"": "Kitare Health Centre",
    "\"DisplaySubcounty\"": "Mbita",
    "\"DisplayCounty\"": "HOMA BAY",
    "\"DisplayMechanism\"": "EGPAF TIMIZA",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-01-05",
    "\"Upload_monthYear\"": "January 2021",
    "\"SiteCode\"": 13705,
    "\"MPI_SiteCode\"": 13705,
    "\"UploadDate_MPI\"": "2021-01-05",
    "\"Upload_monthYear_MPI\"": "January 2021",
    "\"Siteabstractiondate\"": "2021-05-04"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 14358,
    "\"DisplayFacilityName\"": "Chepsaita Dispensary",
    "\"DisplaySubcounty\"": "Turbo",
    "\"DisplayCounty\"": "UASIN GISHU",
    "\"DisplayMechanism\"": "AMPATH PLUS",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-09-05",
    "\"Upload_monthYear\"": "September 2020",
    "\"SiteCode\"": 14358,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-05-05"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 14156,
    "\"DisplayFacilityName\"": "Ukwala Sub County Hospital",
    "\"DisplaySubcounty\"": "Ugenya",
    "\"DisplayCounty\"": "SIAYA",
    "\"DisplayMechanism\"": "CHS SHINDA",
    "\"DisplayAgency\"": "CDC",
    "\"UploadStatus\"": "Only Care & Treatment Uploaded",
    "\"UploadDate\"": "2020-08-07",
    "\"Upload_monthYear\"": "August 2020",
    "\"SiteCode\"": 14156,
    "\"MPI_SiteCode\"": "",
    "\"UploadDate_MPI\"": "",
    "\"Upload_monthYear_MPI\"": "",
    "\"Siteabstractiondate\"": "2021-05-06"
  },
  {
    "﻿\"\"\"DisplayMFL\"\"\"": 12287,
    "\"DisplayFacilityName\"": "Kibugu Health Centre",
    "\"DisplaySubcounty\"": "Manyatta",
    "\"DisplayCounty\"": "EMBU",
    "\"DisplayMechanism\"": "AFYA JIJINI",
    "\"DisplayAgency\"": "USAID",
    "\"UploadStatus\"": "Both Care & Treatment + PKV(MPI) uploaded",
    "\"UploadDate\"": "2021-05-05",
    "\"Upload_monthYear\"": "May 2021",
    "\"SiteCode\"": 12287,
    "\"MPI_SiteCode\"": 12287,
    "\"UploadDate_MPI\"": "2021-05-05",
    "\"Upload_monthYear_MPI\"": "May 2021",
    "\"Siteabstractiondate\"": "2021-04-27"
  }
]
```

## Dashboard Layout & Components
The dashboard layout should be a responsive CSS Grid.

### 1. Header & Controls
- **Title:** "Reporting Rates CTNMPI"
- **Parameter Control:** A Date Picker labeled "Upload Period - 3 Months". Default to `2021-01-06`. This controls the global state `selectedDate`.

### 2. KPI Cards (Top Row)
Display three cards side-by-side:
1. **Total Expected EMR Sites:** Count of unique `DisplayMFL` in the dataset.
2. **Sites Uploaded (Current Month):** Count of unique `SiteCode` where `UploadDate` falls within the selected month (derived from `selectedDate`).
3. **Reporting Rate:** (Sites Uploaded / Total Expected) formatted as a percentage.

### 3. County Performance Chart (Middle Left)
- **Type:** Horizontal Bar Chart.
- **X-Axis:** Reporting Rate % (0 to 100).
- **Y-Axis:** `DisplayCounty` (sorted descending by rate).
- **Color Encoding:** Based on calculated performance buckets:
  - >= 67%: Green (#4caf50)
  - 34% - 66%: Orange (#ff9800)
  - < 34%: Red (#f44336)
- **Interaction:** Hover to see exact counts and percentage.

### 4. Partner Performance Chart (Middle Right)
- **Type:** Horizontal Bar Chart.
- **X-Axis:** Reporting Rate %.
- **Y-Axis:** `DisplayMechanism` (Partner).
- **Color Encoding:** Same buckets as County chart.

### 5. Trend Analysis (Bottom)
- **Type:** Line Chart.
- **X-Axis:** Time (Months). Show the selected month and the previous 2 months.
- **Y-Axis:** Reporting Rate %.
- **Series:** One line showing the trend over the 3-month period.

### 6. Facility Detail Table (Footer)
- **Type:** HTML Table with sticky header.
- **Columns:**
  - Facility Name (`DisplayFacilityName`)
  - MFL Code (`DisplayMFL`)
  - County (`DisplayCounty`)
  - Partner (`DisplayMechanism`)
  - Upload Status (Calculated field logic below)
  - Recency (Calculated field logic below)

## Business Logic (Calculated Fields)
Implement these logic functions in a `utils.ts` file to replicate Tableau calculations.

**1. Upload Status Calculation**
Compare `UploadDate` (CT) and `UploadDate_MPI` (MPI) against the `selectedDate` parameter.
- If both CT and MPI exist for the current month: "Care & Treatment + PKV(MPI) uploaded"
- If only CT exists: "Only Care & Treatment Uploaded"
- If only MPI exists: "Only PKV(MPI) Uploaded"
- Else: "Not Uploaded Care & Treatment or PKV(MPI)"

**2. Recency Calculation**
Calculate the difference in months between `Today` (or `selectedDate`) and the latest `UploadDate`.
- If diff is 0 or 1 month: "Good"
- If diff is 2 months: "Average"
- Else: "Bad"

**3. Reporting Rate Calculation**
`COUNTD(SiteCode) / COUNTD(DisplayMFL)`

## Implementation Details
- **Filtering:** The dashboard must react to the `selectedDate` parameter. All charts and KPIs should update when the date changes.
- **Responsiveness:** The grid should stack vertically on mobile screens.
- **Styling:** Keep the UI clean and professional, similar to standard Tableau aesthetics (white background, clear fonts, distinct colors for data).

Generate the complete React application code structure, including the main `App.tsx`, `Dashboard.tsx`, and individual chart components.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_4836_1/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
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
## Dashboard Text Zones
- zone(x=352, y=8970, w=99648, h=5814): EMR Facilities Upload Status - <[Parameters].[Parameter 4]>
- zone(x=527, y=69770, w=33629, h=30061): Definitions EMR Recency Date is an indicator of when the EMR was last updated. If the date is 4 months ago, it either means that that’s the last time a facility had a patient, or the last time the EMR was updated. Latest Upload Date: Is the last time the EMR was uploaded to the DWH Latest PKV Date: Is the last time the PKVs were uploaded to the DWH
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Summary Stats, target=Reporting Rates_Optimization:Dashboard: Facility Upload Status (CT + PKV)
