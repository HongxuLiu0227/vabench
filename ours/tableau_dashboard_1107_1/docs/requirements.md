# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled "FemaleRidershipDashboard".

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or similar) for visualizations (use d3-scale, d3-shape, d3-axis, d3-array primitives).
- CSS for layout (Flexbox/Grid). No external UI component libraries (e.g., Ant Design) unless necessary for basic icons.

## Data Loading
The primary data source is a large CSV file available at `/data/TEMP_0wf32yc0donotc13aoxty1ndxfqb.csv`.

1.  **Fetch the data**: Use the native `fetch` API to retrieve the CSV content.
2.  **Parse the data**: Use `d3-dsv` (e.g., `d3.csvParse`) to convert the raw CSV string into an array of objects.
3.  **Type Safety**: Define a TypeScript interface `TripData` matching the columns in the CSV.

```typescript
// Example Data Loading Logic
import * as d3 from 'd3';

interface TripData {
  TripID: string;
  tripduration: string;
  starttime: string; // ISO date string
  stoptime: string;
  'start station id': string;
  'start station name': string;
  'start station latitude': string;
  'start station longitude': string;
  'end station id': string;
  'end station name': string;
  'end station latitude': string;
  'end station longitude': string;
  bikeid: string;
  usertype: string;
  'birth year': string;
  gender: string; // '0', '1', '2'
}

export const loadData = async (): Promise<TripData[]> => {
  const response = await fetch('/data/TEMP_0wf32yc0donotc13aoxty1ndxfqb.csv');
  const csvText = await response.text();
  const data = d3.csvParse<TripData>(csvText);
  return data;
};
```

## Data Processing & Transformation
Before rendering charts, transform the raw `TripData` into aggregated structures.

1.  **Date Parsing**: Convert `starttime` strings to JavaScript `Date` objects.
2.  **Derived Fields**:
    - `Year`: Extract full year from `starttime` (e.g., 2019, 2020).
    - `GenderText`: Map `gender` integer to string: `1` -> 'Male', `2` -> 'Female', `0` -> 'Unknown'.
3.  **Aggregations**: Group data by dimensions (Year, Gender, UserType) and calculate `COUNT(TripID)`.
4.  **Table Calculations (PctDiff)**:
    - Calculate Year-Over-Year (YOY) Percentage Difference.
    - Formula: `(Count_CurrentYear - Count_PreviousYear) / Count_PreviousYear`.
    - Handle the first year (e.g., 2019) by returning `null` or `0` for PctDiff.

## Dashboard Layout (FemaleRidershipDashboard)
Recreate the layout using CSS Grid or Flexbox to match the Tableau zone structure.

- **Container**: A fixed-width or responsive container (approx 1000px-1200px wide).
- **Top Row**: Split into two equal-width columns (approx 50% each).
    - **Left**: "Overall YOY" Chart.
    - **Right**: "Female Trip YOY" Chart.
- **Bottom Row**: Full width.
    - **Main**: "UserType and Gender YOY" Chart.
    - **Legend**: A color legend for Gender, positioned to the right of the bottom chart (or integrated into the chart area).

## Component Specifications

### 1. Overall YOY Chart (`OverallYOYChart`)
- **Type**: Bar Chart.
- **Dimensions**:
    - X-Axis: `Year` (Categorical: 2019, 2020).
    - Y-Axis: `Count of Trips` (Quantitative).
- **Visual Encoding**:
    - Bars: Vertical bars for each year.
    - Color: Map Year to specific colors (2019: `#4e79a7`, 2020: `#f28e2b`).
    - Labels: Display the calculated **PctDiff** value on top of the bars (formatted as percentage, e.g., "-15%" or "+5%").
- **Data**: Aggregate total trips by Year.

### 2. Female Trip YOY Chart (`FemaleTripYOYChart`)
- **Type**: Bar Chart.
- **Dimensions**:
    - X-Axis: `Year` (Categorical: 2019, 2020).
    - Y-Axis: `GenderText` (Categorical: Male, Female, Unknown). *Note: The XML places Gender on Rows (Y-axis) and Year on Columns (X-axis).*
- **Visual Encoding**:
    - Bars: Vertical bars grouped by Gender on the Y-axis, split by Year on the X-axis. (Or horizontal bars depending on orientation, but XML implies Rows=Gender, Cols=Year -> Vertical Bars with Gender on Y).
    - Color: Map Year to specific colors (2019: `#4e79a7`, 2020: `#f28e2b`).
    - Labels: Display the calculated **PctDiff** value on the bars.
- **Data**: Aggregate trips by Year and Gender.

### 3. UserType and Gender YOY Chart (`UserTypeGenderYOYChart`)
- **Type**: Bar Chart (Grouped/Stacked).
- **Dimensions**:
    - X-Axis: Nested hierarchy: `usertype` -> `GenderText` -> `Year`.
    - Y-Axis: `Count of Trips`.
- **Visual Encoding**:
    - Bars: Grouped bars.
    - Color: Encode `GenderText` using the color palette:
        - Female: `#4e79a7`
        - Male: `#f28e2b`
        - Unknown: `#e15759`
- **Interactions**:
    - **Click/Select**: Clicking a bar (specific Gender) should trigger a global highlight action.

## Interactions & State Management
- **Global State**: Create a context or state in the parent dashboard to track `selectedGender`.
- **Highlighting**:
    - When a user selects a Gender (e.g., "Female") in the "UserType and Gender YOY" chart:
        - Dim (reduce opacity) bars in all charts that do not correspond to "Female".
        - Keep "Female" bars fully opaque.
    - If no selection is active, all bars are fully opaque.

## Styling
- Use the exact colors specified in the Tableau XML style rules.
- Fonts: Use a clean sans-serif font (e.g., Tableau font family: 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif).
- Titles: Preserve exact text: "Overall YOY", "Female Trip YOY", "UserType and Gender YOY".

## Sample Data
Here is a placeholder for the sample data structure:

```json
[
  {
    "﻿\"\"\"TripID\"\"\"": 9997,
    "\"tripduration\"": 595,
    "\"starttime\"": "2019-02-25 07:40:40.019000",
    "\"stoptime\"": "2019-02-25 07:50:35.356000",
    "\"start station id\"": 3210,
    "\"start station name\"": "Pershing Field",
    "\"start station latitude\"": 40.742677141,
    "\"start station longitude\"": -74.051788633,
    "\"end station id\"": 3640,
    "\"end station name\"": "Journal Square",
    "\"end station latitude\"": 40.733670000000004,
    "\"end station longitude\"": -74.0625,
    "\"bikeid\"": 26163,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1991,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"TripID\"\"\"": 26511,
    "\"tripduration\"": 736,
    "\"starttime\"": "2019-04-04 15:30:28.078000",
    "\"stoptime\"": "2019-04-04 15:42:44.458000",
    "\"start station id\"": 3278,
    "\"start station name\"": "Monmouth and 6th",
    "\"start station latitude\"": 40.72568548362901,
    "\"start station longitude\"": -74.0487903356552,
    "\"end station id\"": 3210,
    "\"end station name\"": "Pershing Field",
    "\"end station latitude\"": 40.742677141,
    "\"end station longitude\"": -74.051788633,
    "\"bikeid\"": 26233,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1981,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"TripID\"\"\"": 11998,
    "\"tripduration\"": 137,
    "\"starttime\"": "2019-08-08 17:24:55.997000",
    "\"stoptime\"": "2019-08-08 17:27:13.375000",
    "\"start station id\"": 3202,
    "\"start station name\"": "Newport PATH",
    "\"start station latitude\"": 40.7272235,
    "\"start station longitude\"": -74.03375890000001,
    "\"end station id\"": 3638,
    "\"end station name\"": "Washington St",
    "\"end station latitude\"": 40.7242941,
    "\"end station longitude\"": -74.0354826,
    "\"bikeid\"": 26233,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1996,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"TripID\"\"\"": 4905,
    "\"tripduration\"": 587,
    "\"starttime\"": "2020-03-07 17:51:53.582000",
    "\"stoptime\"": "2020-03-07 18:01:40.907000",
    "\"start station id\"": 3205,
    "\"start station name\"": "JC Medical Center",
    "\"start station latitude\"": 40.71653978099194,
    "\"start station longitude\"": -74.0496379137039,
    "\"end station id\"": 3187,
    "\"end station name\"": "Warren St",
    "\"end station latitude\"": 40.721123600000006,
    "\"end station longitude\"": -74.03805095,
    "\"bikeid\"": 42352,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1984,
    "\"gender\"": 2
  },
  {
    "﻿\"\"\"TripID\"\"\"": 6275,
    "\"tripduration\"": 987,
    "\"starttime\"": "2020-10-06 11:37:00.140000",
    "\"stoptime\"": "2020-10-06 11:53:27.878000",
    "\"start station id\"": 3681,
    "\"start station name\"": "Grand St",
    "\"start station latitude\"": 40.71517767732029,
    "\"start station longitude\"": -74.03768330812454,
    "\"end station id\"": 3203,
    "\"end station name\"": "Hamilton Park",
    "\"end station latitude\"": 40.727595965999996,
    "\"end station longitude\"": -74.044247311,
    "\"bikeid\"": 42128,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1970,
    "\"gender\"": 2
  },
  {
    "﻿\"\"\"TripID\"\"\"": 3310,
    "\"tripduration\"": 271,
    "\"starttime\"": "2019-12-05 20:30:02.523000",
    "\"stoptime\"": "2019-12-05 20:34:34.146000",
    "\"start station id\"": 3187,
    "\"start station name\"": "Warren St",
    "\"start station latitude\"": 40.721123600000006,
    "\"start station longitude\"": -74.03805095,
    "\"end station id\"": 3199,
    "\"end station name\"": "Newport Pkwy",
    "\"end station latitude\"": 40.728744799999994,
    "\"end station longitude\"": -74.03210820000001,
    "\"bikeid\"": 29507,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1980,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"TripID\"\"\"": 9354,
    "\"tripduration\"": 395,
    "\"starttime\"": "2019-02-06 07:52:23.829000",
    "\"stoptime\"": "2019-02-06 07:58:59.031000",
    "\"start station id\"": 3209,
    "\"start station name\"": "Brunswick St",
    "\"start station latitude\"": 40.7241765,
    "\"start station longitude\"": -74.05065640000001,
    "\"end station id\"": 3183,
    "\"end station name\"": "Exchange Place",
    "\"end station latitude\"": 40.7162469,
    "\"end station longitude\"": -74.0334588,
    "\"bikeid\"": 29479,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1976,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"TripID\"\"\"": 12497,
    "\"tripduration\"": 325,
    "\"starttime\"": "2019-04-09 20:15:36.863000",
    "\"stoptime\"": "2019-04-09 20:21:02.236000",
    "\"start station id\"": 3202,
    "\"start station name\"": "Newport PATH",
    "\"start station latitude\"": 40.7272235,
    "\"start station longitude\"": -74.03375890000001,
    "\"end station id\"": 3681,
    "\"end station name\"": "Grand St",
    "\"end station latitude\"": 40.71517767732029,
    "\"end station longitude\"": -74.03768330812454,
    "\"bikeid\"": 29202,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1970,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"TripID\"\"\"": 16203,
    "\"tripduration\"": 215,
    "\"starttime\"": "2019-06-12 20:46:23.177000",
    "\"stoptime\"": "2019-06-12 20:49:58.969000",
    "\"start station id\"": 3187,
    "\"start station name\"": "Warren St",
    "\"start station latitude\"": 40.721123600000006,
    "\"start station longitude\"": -74.03805095,
    "\"end station id\"": 3202,
    "\"end station name\"": "Newport PATH",
    "\"end station latitude\"": 40.7272235,
    "\"end station longitude\"": -74.03375890000001,
    "\"bikeid\"": 26318,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1985,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"TripID\"\"\"": 2481,
    "\"tripduration\"": 216,
    "\"starttime\"": "2019-08-02 11:54:14.778000",
    "\"stoptime\"": "2019-08-02 11:57:51.002000",
    "\"start station id\"": 3203,
    "\"start station name\"": "Hamilton Park",
    "\"start station latitude\"": 40.727595965999996,
    "\"start station longitude\"": -74.044247311,
    "\"end station id\"": 3211,
    "\"end station name\"": "Newark Ave",
    "\"end station latitude\"": 40.72152515,
    "\"end station longitude\"": -74.046304543,
    "\"bikeid\"": 29570,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1988,
    "\"gender\"": 2
  }
]
```

## Implementation Steps
1.  Scaffold the Vite + React + TypeScript project.
2.  Install dependencies: `d3`, `@types/d3`.
3.  Create `types.ts` for data interfaces.
4.  Create `utils/dataProcessor.ts` for fetching, parsing, and aggregating data.
5.  Create chart components (`OverallYOYChart.tsx`, `FemaleTripYOYChart.tsx`, `UserTypeGenderYOYChart.tsx`) using D3.
6.  Create `Dashboard.tsx` to handle layout and state.
7.  Integrate into `App.tsx`.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_1107_1/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Female Trip YOY
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:Calculation_2945072721971425291:nk]`
- cols_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[yr:starttime:ok]`
- zone: x=1231, y=962, w=35846, h=24038
- highlight_fields: [federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:Calculation_2945072721971425291:nk], [federated.1vyl1wt0bikyvw19huemw1m5isqu].[yr:starttime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Overall YOY
- chart_intent: `custom_tableau_view`
- rows_field: ``
- cols_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[yr:starttime:ok]`
- zone: x=37077, y=962, w=35846, h=24038
- highlight_fields: [federated.1vyl1wt0bikyvw19huemw1m5isqu].[yr:starttime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: UserType and Gender YOY
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[cnt:TripID:qk]`
- cols_field: `([federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:usertype:nk] / ([federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:Calculation_2945072721971425291:nk] / [federated.1vyl1wt0bikyvw19huemw1m5isqu].[yr:starttime:ok]))`
- series_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:Calculation_2945072721971425291:nk]`
- bar_orientation: `vertical`
- axis_title_rows: Count of Trips
- zone: x=1231, y=25000, w=71692, h=74038
- legend_required: true
- legend_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:Calculation_2945072721971425291:nk]`
- legend_relative_position: right
- highlight_fields: [federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:Calculation_2945072721971425291:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Highlight 1 (generated): kind=highlight_brush, source=Pct of Trips by Gender, target=Pct of Trips by Gender
  fields: Gender Text
- Highlight 3 (generated): kind=highlight_brush, source=FemaleRidershipDashboard, target=FemaleRidershipDashboard
  fields: Gender Text
## Highlight Bindings
- UserType and Gender YOY: [federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:Calculation_2945072721971425291:nk]
- Female Trip YOY: [federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:Calculation_2945072721971425291:nk], [federated.1vyl1wt0bikyvw19huemw1m5isqu].[yr:starttime:ok]
- Overall YOY: [federated.1vyl1wt0bikyvw19huemw1m5isqu].[yr:starttime:ok]
