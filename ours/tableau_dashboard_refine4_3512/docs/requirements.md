# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled 'Dashboard 1' from a provided workbook definition.

## Tech Stack & Constraints
- **Framework:** React + TypeScript + Vite.
- **Visualization:** Use D3.js primitives (d3-scale, d3-shape, d3-axis, d3-array). Do not use high-level chart libraries like Recharts or Nivo.
- **Styling:** CSS Modules or Styled Components. Use CSS Grid/Flexbox for layout.
- **Data:** Load data from `/data/TableauTemp_0remyjs0msga5a1eprth20vm607r.csv`.

## Data Loading

The primary data source is a CSV file located at `/data/TableauTemp_0remyjs0msga5a1eprth20vm607r.csv`.

You must implement a `useData` hook or utility function to fetch and parse this data.

```typescript
import { csv } from 'd3-fetch';
import { timeParse } from 'd3-time-format';

// Define the shape of a raw data row
type DataRow = {
  'Date Made Public': string;
  Company: string;
  Location: string;
  'Type of breach': string;
  'Type of organization': string;
  'Records Breached': string;
  'Total Records': string;
  'Description of incident': string;
  'Information Source': string;
  'Source URL': string;
};

// Define the processed data shape
type DataPoint = {
  date: Date;
  year: number;
  company: string;
  location: string;
  breachType: string;
  orgType: string;
  recordsBreached: number | null;
  totalRecords: number;
  description: string;
  infoSource: string;
  sourceUrl: string;
};

export const useData = () => {
  const [data, setData] = React.useState<DataPoint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const parseDate = timeParse('%m/%d/%Y'); // Adjust format based on actual CSV content inspection

    csv<DataRow>('/data/TableauTemp_0remyjs0msga5a1eprth20vm607r.csv')
      .then((rawData) => {
        const processed = rawData.map((d) => {
          const dateObj = parseDate(d['Date Made Public']);
          return {
            date: dateObj || new Date(),
            year: dateObj ? dateObj.getFullYear() : 0,
            company: d.Company,
            location: d.Location,
            breachType: d['Type of breach'],
            orgType: d['Type of organization'],
            recordsBreached: d['Records Breached'] ? parseInt(d['Records Breached'], 10) : null,
            totalRecords: parseInt(d['Total Records'], 10) || 0,
            description: d['Description of incident'],
            infoSource: d['Information Source'],
            sourceUrl: d['Source URL'],
          };
        }).filter(d => !isNaN(d.year)); // Filter out invalid dates
        setData(processed);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
};
```

## Sample Data

```json
[
  {
    "﻿\"\"\"Date Made Public\"\"\"": "2013-02-13",
    "\"Company\"": "Sinai Medical Center of Jersey City LLC",
    "\"Location\"": "Jersey City, New Jersey",
    "\"Type of breach\"": "INSD",
    "\"Type of organization\"": "MED",
    "\"Records Breached\"": "Unknown",
    "\"Total Records\"": "",
    "\"Description of incident\"": "A pediatrician misused patient information in order to defraud Medicaid of nearly one million dollars. Â The pediatrician owned Sinai Medical Center and billed Medicaid for wound repairs and other procedures that were never performed. Â Police arrested the dishonest pediatrician on January 16, 2013. Â",
    "\"Information Source\"": "PHIPrivacy.net",
    "\"Source URL\"": ""
  },
  {
    "﻿\"\"\"Date Made Public\"\"\"": "2014-10-03",
    "\"Company\"": "Mount Sinai Beth Israel",
    "\"Location\"": "New York, New York",
    "\"Type of breach\"": "PORT",
    "\"Type of organization\"": "MED",
    "\"Records Breached\"": "10,790",
    "\"Total Records\"": "",
    "\"Description of incident\"": "Mount Sinai Beth Israel announced a data breach when a laptop computer was stolen from a staff room. According to the facility the laptop was password-protected but not encrypted.The patient information housed on the laptop included patient names, dates of birth, medical record numbers, dates of service, procedure codes and description of procedures along with clinical information about patient care received. The facility has stated that patient Social Security numbers, insurance information, addresses and phone numbers were not stored on this particular laptop.More Information: http://www.mountsinaihealth.org/about-the-health-system/news-releases/st...",
    "\"Information Source\"": "Media",
    "\"Source URL\"": ""
  },
  {
    "﻿\"\"\"Date Made Public\"\"\"": "2013-02-22",
    "\"Company\"": "Crescent Health Inc., Walgreens",
    "\"Location\"": "Anaheim, California",
    "\"Type of breach\"": "STAT",
    "\"Type of organization\"": "MED",
    "\"Records Breached\"": "100,000",
    "\"Total Records\"": 100000.0,
    "\"Description of incident\"": "Desktop computer hardware was stolen from the Anaheim Billing Center of Crescent Healthcare, Inc. on December 28, 2012. Â The theft was discovered on Monday, December 31 and reported to law enforcement. Â Names, Social Security numbers, health insurance identification numbers, health insurance information, dates of birth, diagnoses, other medical information, disability codes, addresses, and phone numbers may have been exposed.UPDATEÂ (04/03/2013): Over 100,000 people were affected.",
    "\"Information Source\"": "California Attorney General",
    "\"Source URL\"": ""
  },
  {
    "﻿\"\"\"Date Made Public\"\"\"": "2016-10-14",
    "\"Company\"": "Peabody Retirement Community",
    "\"Location\"": "Manchester, Indiana",
    "\"Type of breach\"": "HACK",
    "\"Type of organization\"": "MED",
    "\"Records Breached\"": "1,466",
    "\"Total Records\"": "",
    "\"Description of incident\"": "As reported by Health and Human Services hacking/IT Incident. No specific information as to what information was  \ncompromised  as provided by health and human services. More Information: https://ocrportal.hhs.gov/ocr/breach/breach_report.jsf;jsessionid=9BF4AF...",
    "\"Information Source\"": "Government Agency",
    "\"Source URL\"": ""
  },
  {
    "﻿\"\"\"Date Made Public\"\"\"": "2016-09-09",
    "\"Company\"": "Public Education Employees' Health Insurance Plan",
    "\"Location\"": "Montgomery, Alabama",
    "\"Type of breach\"": "DISC",
    "\"Type of organization\"": "MED",
    "\"Records Breached\"": "1,349",
    "\"Total Records\"": "",
    "\"Description of incident\"": "As reported by Health and Human Services unauthorized access/disclosure. No specific information as to what information was  \ncompromised  as provided by health and human services. More Information: https://ocrportal.hhs.gov/ocr/breach/breach_report.jsf;jsessionid=9BF4AF...",
    "\"Information Source\"": "Government Agency",
    "\"Source URL\"": ""
  },
  {
    "﻿\"\"\"Date Made Public\"\"\"": "2014-06-26",
    "\"Company\"": "Salina Family Healthcare Center",
    "\"Location\"": "Salina, Kansas",
    "\"Type of breach\"": "DISC",
    "\"Type of organization\"": "MED",
    "\"Records Breached\"": 500,
    "\"Total Records\"": "",
    "\"Description of incident\"": "\"Salina Family Healthcare Center (SFHC) notified more than 500 \npatients of an unintentionalÂ transmission of unsecured personal patient \nprotected health information after discovering theÂ following event:\n\"On April 8, 2014, a staff member submitted a database to the National\n Commission for QualityÂ Assurance (NCQA) for our involvement in a care \ncoordination research study. The staff memberÂ responsible for our \nparticipation in the project inadvertently left a table in that database\n thatÂ included patientsâ€™ names, dates of birth, chart numbers and CPT \ncodes associated with their care.Â Upon opening the email, the NCQA staff\n member who received the database immediately recognized the breach, \ndeleted the database, and notified our staff member\"\".",
    "\"Information Source\"": "PHIPrivacy.net",
    "\"Source URL\"": ""
  },
  {
    "﻿\"\"\"Date Made Public\"\"\"": "2014-08-07",
    "\"Company\"": "San Mateo Medical Center",
    "\"Location\"": "San Mateo, California",
    "\"Type of breach\"": "INSD",
    "\"Type of organization\"": "MED",
    "\"Records Breached\"": "Unknown",
    "\"Total Records\"": "",
    "\"Description of incident\"": "San Mateo Medical Center (SMMC) notified individuals of a potential data breach when the facility discovered that an employee who was hired in the payroll unit of the facility failed to disclose a prior conviction for identity theft. The employee was terminated immediately, but the individual had access to SMMC employee information including names, contact information, Social Security numbers and dates of birth.The facility reported that they found \"no evidence indicating that the employee misused confidential information from SMMC employee records\".SMMC has engaged Kroll to provide identity theft protection for one year at no cost. For those affected they can contact the county at 1-844-530-4127 from 6:00 a.m. to 3:00 p.m. PDT.",
    "\"Information Source\"": "California Attorney General",
    "\"Source URL\"": ""
  },
  {
    "﻿\"\"\"Date Made Public\"\"\"": "2015-12-01",
    "\"Company\"": "Cottage Health",
    "\"Location\"": "Santa Barbara, California",
    "\"Type of breach\"": "DISC",
    "\"Type of organization\"": "MED",
    "\"Records Breached\"": "11,000",
    "\"Total Records\"": 11000.0,
    "\"Description of incident\"": "Cottage Health is notifying patients of a data breach when the personal health information was exposed inadvertently online from October 26, 2015 to November 8, 2015. The information included patient and/or guarantor names, addresses, Social Security numbers, health insurance information and account numbers. Some medical and diagnosis information was also exposed. The breach affects the following affiliated hospitals in the healthcare system:- Goleta Valley Cottage Hospital- Santa Ynez Valley Cottage Hospital- Santa Barbara Cottage HospitalThe healthcare company is providing 12 months free of single- Bureau Credit Monitoring through TransUnion credit bureau.For those with questions call 1-877-866-6056 Monday through Friday 6 am- 6 pm Pacific Time.More information: http://oag.ca.gov/ecrime/databreach/reports/sb24-59101",
    "\"Information Source\"": "California Attorney General",
    "\"Source URL\"": ""
  },
  {
    "﻿\"\"\"Date Made Public\"\"\"": "2016-07-27",
    "\"Company\"": "Select Pain & Spine Dr. Christopher T. Sloan, D.P.M.",
    "\"Location\"": "Farmington, Missouri",
    "\"Type of breach\"": "HACK",
    "\"Type of organization\"": "MED",
    "\"Records Breached\"": "48,000",
    "\"Total Records\"": 48000.0,
    "\"Description of incident\"": "â€œWe write to inform you that our practice discovered a data breach on May 27, 2016 that may have contained personal health information and have been investigating the exact nature and scope of the information obtained by the hackers since,â€ the letter reads. â€œTo date, our investigation has determined that on May 4, 2016, a hacker, or hackers, likely gained access into our secured database system through a third party contractor and may have obtained some personal information of our patients including: names, addresses, social security numbers, date of births, diagnoses, lab results, other medical records, and potentially some financial information.\"\"On June 25, a hacker going by the name â€œthedarkoverlordâ€ provided information to Deep Dot Web of a purported hacking of three different healthcare organizations â€“ one originating from Farmington and containing 48,000 alleged patient records, according to the Deep Dot Web report.\"This breach is one entity of the medical group that was hacked. More Information: http://dailyjournalonline.com/news/local/local-medical-group-involved-in...More Information: http://www.hipaajournal.com/farmington-medical-group-confirms-cyberattac...",
    "\"Information Source\"": "Media",
    "\"Source URL\"": ""
  },
  {
    "﻿\"\"\"Date Made Public\"\"\"": "2013-11-08",
    "\"Company\"": "Littleton Podiatry",
    "\"Location\"": "Littleton, Colorado",
    "\"Type of breach\"": "PORT",
    "\"Type of organization\"": "MED",
    "\"Records Breached\"": "3,512 (No Social Security numbers or financial information exposed)",
    "\"Total Records\"": "",
    "\"Description of incident\"": "The August 27 theft of a laptop resulted in the exposure of patient information.",
    "\"Information Source\"": "HHS via PHIPrivacy.net",
    "\"Source URL\"": ""
  }
]
```

## Dashboard Layout Specification

The dashboard 'Dashboard 1' uses a horizontal layout split into two main sections: a main content area (left, ~70% width) and a sidebar (right, fixed width ~200px).

**Container Structure:**
- `DashboardContainer` (Flex Row, height: 100vh)
  - `MainContent` (Flex Column, flex: 1, padding: 8px)
    - `TopRow` (Flex Row, height: 50%)
      - `TypesOfBreachChart` (Width: 50%, margin: 4px)
      - `AnnualByTypeYearChart` (Width: 50%, margin: 4px)
    - `BottomRow` (Flex Row, height: 50%)
      - `InformationSourceChart` (Width: 100%, margin: 4px)
  - `Sidebar` (Flex Column, width: 178px, padding: 4px)
    - `InfoSourceLegend` (Height: auto)
    - `YearFilter` (Height: auto)
    - `BreachTypeLegend` (Height: auto)

## Component Specifications

### 1. Annual % by Type & Year (Pie Chart)
- **Location:** Top Right of Main Content.
- **Type:** Pie Chart.
- **Data:** Group data by `Type of breach` and `Year`. Calculate Count of records.
- **Visual Encodings:**
  - **Angle:** Percentage of Total Count (Table Calc: Percent of Total).
  - **Color:** `Type of breach` (Use specific palette below).
  - **LOD/Detail:** `Year` (used for tooltips and filtering).
- **Interactions:**
  - **Selection:** Clicking a slice triggers the global filter action (Action 1). It should filter the dashboard by the specific `Year` and `Type of breach` of the selected slice.
- **Tooltip:** Display 'Type of breach', 'Year', and '% of Total Count'.

### 2. Types of Breach (Bar Chart)
- **Location:** Top Left of Main Content.
- **Type:** Vertical Bar Chart.
- **Data:** Group by `Type of breach`. Calculate Count of records.
- **Visual Encodings:**
  - **X-Axis:** `Type of breach` (Categorical).
  - **Y-Axis:** Count of `Total Records`.
  - **Color:** `Type of breach` (Match Pie chart colors).
- **Interactions:**
  - **Filter:** This sheet listens to the 'Action 1' filter. If a slice is selected in the Pie chart, this chart must filter to show only data matching that `Year` and `Type of breach`.

### 3. Information Source for Breach (Stacked Bar Chart)
- **Location:** Bottom of Main Content (Full Width).
- **Type:** Stacked Vertical Bar Chart.
- **Data:** Group by `Type of breach` (X-axis) and `Information Source` (Stack/Color). Calculate Count of records.
- **Visual Encodings:**
  - **X-Axis:** `Type of breach`.
  - **Y-Axis:** Count of `Total Records`.
  - **Color:** `Information Source` (Use specific palette below).
- **Interactions:**
  - **Filter:** This sheet listens to the 'Action 1' filter. It must update based on the Pie chart selection.
  - **Data Cleaning:** Exclude records where `Information Source` is null or empty (as per XML filter).

### 4. Year Filter (Sidebar Component)
- **Location:** Middle of Sidebar.
- **Type:** Single Select Dropdown or List.
- **Data:** Unique list of Years from `Date Made Public`.
- **Behavior:** Selecting a year filters the `Annual % by Type & Year` chart (and potentially others, though the XML specifically links it to the Pie chart's filter card). In the Tableau workbook, this is a filter card on the Pie chart sheet.

### 5. Legends (Sidebar Components)
- **Breach Type Legend:** Displays colors for `Type of breach` (DISC, PORT, PHYS, UNKN, INSD, STAT, HACK).
- **Info Source Legend:** Displays colors for `Information Source` (Media, Government Agency, PHIPrivacy.net, etc.).

## Color Palettes

Implement these exact color mappings.

**Type of breach:**
- DISC: #4e79a7
- PORT: #59a14f
- PHYS: #76b7b2
- UNKN: #b07aa1
- INSD: #e15759
- STAT: #edc948
- HACK: #f28e2b

**Information Source:**
- Media: #499894
- (Null): #4e79a7
- Government Agency: #59a14f
- PHIPrivacy.net: #86bcb6
- Health IT Security: #8cd17d
- California Attorney General: #a0cbe8
- HHS via Databreaches.net: #b6992d
- Security Breach Letter: #e15759
- HHS via PHIPrivacy.net: #f1ce63
- Databreaches.net: #f28e2b
- Vermont Attorney General: #ff9d9a
- Dataloss DB: #ffbe7d

## Interaction Logic (State Management)

You need a global state context to handle the 'Action 1' interaction.

- **State:**
  - `selectedYear`: number | null
  - `selectedBreachType`: string | null

- **Flow:**
  1. User clicks a slice in `AnnualByTypeYearChart`.
  2. Update `selectedYear` and `selectedBreachType` based on the slice's data.
  3. `TypesOfBreachChart` and `InformationSourceChart` receive these state values.
  4. These charts filter their input data: `d => (selectedYear ? d.year === selectedYear : true) && (selectedBreachType ? d.breachType === selectedBreachType : true)`.
  5. The `YearFilter` component can also update `selectedYear`, which should update the Pie chart (and consequently the others if the selection logic propagates).

## Implementation Notes

- Ensure the CSV parsing handles the specific date format found in the file (likely MM/DD/YYYY based on 'Date Made Public').
- The 'Total Records' column in the CSV is a string but must be parsed as an integer for the Count aggregation.
- Use `d3.stack` for the 'Information Source for Breach' chart to handle the stacking logic correctly.
- Maintain the aspect ratios and relative sizing defined in the layout specification.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/TableauTemp_0remyjs0msga5a1eprth20vm607r.csv

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
const rows = await loadCsv("/data/TableauTemp_0remyjs0msga5a1eprth20vm607r.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_refine4_3512/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Annual % by Type & Year
- chart_intent: `pie_chart`
- rows_field: ``
- cols_field: ``
- series_field: `[federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Type of breach:nk]`
- zone: x=36309, y=1192, w=35075, h=48808
- legend_required: true
- legend_field: `[federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Type of breach:nk]`
- legend_relative_position: below
- highlight_fields: [federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Type of breach:nk], [federated.0ywgyjs0gtcd061djvygu022q3tx].[yr:Date Made Public:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored below the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Information Source for Breach
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0ywgyjs0gtcd061djvygu022q3tx].[cnt:Total Records:qk]`
- cols_field: `[federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Type of breach:nk]`
- series_field: `[federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Information Source:nk]`
- bar_orientation: `vertical`
- zone: x=1231, y=50000, w=70153, h=48808
- legend_required: true
- legend_field: `[federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Information Source:nk]`
- legend_relative_position: above
- highlight_fields: [federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Information Source:nk], [federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Type of breach:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored above the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Types of Breach
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0ywgyjs0gtcd061djvygu022q3tx].[cnt:Total Records:qk]`
- cols_field: `[federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Type of breach:nk]`
- series_field: `[federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Type of breach:nk]`
- bar_orientation: `vertical`
- zone: x=1231, y=1192, w=35078, h=48808
- highlight_fields: [federated.0ywgyjs0gtcd061djvygu022q3tx].[:Measure Names], [federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Type of breach:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Annual % by Type & Year, target=Dashboard 1
## Highlight Bindings
- Types of Breach: [federated.0ywgyjs0gtcd061djvygu022q3tx].[:Measure Names], [federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Type of breach:nk]
- YTD: [federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Location:nk], [federated.0ywgyjs0gtcd061djvygu022q3tx].[yr:Date Made Public:ok]
- Date made Public: [federated.0ywgyjs0gtcd061djvygu022q3tx].[qr:Date Made Public:ok], [federated.0ywgyjs0gtcd061djvygu022q3tx].[yr:Date Made Public:ok]
- Information Source for Breach: [federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Information Source:nk], [federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Type of breach:nk]
- Annual % by Type & Year: [federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Type of breach:nk], [federated.0ywgyjs0gtcd061djvygu022q3tx].[yr:Date Made Public:ok]
- Annual % by Type & Year: [federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Type of breach:nk]
- Information Source for Breach: [federated.0ywgyjs0gtcd061djvygu022q3tx].[none:Information Source:nk]
