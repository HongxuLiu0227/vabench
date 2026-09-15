# Project Requirements

You are a senior React engineer tasked with recreating a specific Tableau dashboard named 'TripDashboard'.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7) for visualizations (use d3-scale, d3-axis, d3-shape, d3-array, d3-time-format)
- CSS Grid/Flexbox for layout (no external UI component libraries unless necessary for basic layout, prefer custom CSS)

## Data Loading
The application must load data from the public folder.

1. **Primary Data Source**: The dashboard relies on 'BikeDataCombined'.
   - Fetch URL: `/data/TEMP_0wf32yc0donotc13aoxty1ndxfqb.csv`
   - This file contains trip-level data.

2. **Secondary Data Source**: The workbook contains 'BikeStationDataset', but it is not used in the 'TripDashboard' views. You may ignore it for the dashboard implementation, or load it from `/data/TEMP_0lftzi414zrmhq1bx5w7b05n83gh.csv` if you wish to extend functionality later.

**Implementation Instructions**:
- Create a `useData` hook or utility function to fetch the CSV using the native `fetch()` API.
- Parse the CSV text using `d3.csvParse`.
- Type the data. The CSV columns are: `TripID`, `tripduration`, `starttime`, `stoptime`, `start station id`, `start station name`, `start station latitude`, `start station longitude`, `end station id`, `end station name`, `end station latitude`, `end station longitude`, `bikeid`, `usertype`, `birth year`, `gender`.
- **Data Transformation**:
  - Parse `starttime` and `stoptime` into JavaScript Date objects.
  - Create a derived field `TripDurationMinutes` = `tripduration / 60`.
  - Create a derived field `GenderText`:
    - If `gender` == 1, return 'Male'
    - If `gender` == 2, return 'Female'
    - If `gender` == 0, return 'Unknown'

## Dashboard Layout (TripDashboard)
The dashboard uses a T-shaped layout.
- **Container**: A CSS Grid container.
- **Top Section (Height: ~40%)**: Contains the worksheet "Trips Over Time". It spans the full width.
- **Bottom Section (Height: ~60%)**: Split into two columns.
  - **Left Column (Width: ~80%)**: Vertically stacked.
    - Top: "PCT of Trips By UserType"
    - Bottom: "Pct of Trips by Gender"
  - **Right Column (Width: ~20%)**: Vertically stacked Color Legends.
    - Legend for "Trips Over Time" (Measure Names)
    - Legend for "PCT of Trips By UserType" (UserType)
    - Legend for "Pct of Trips by Gender" (Gender Text)

## Worksheet Specifications

### 1. Trips Over Time
- **Type**: Dual-Axis Line Chart (or Combo Chart).
- **X-Axis**: `MONTH(starttime)` (Discrete time axis, formatted as 'Jan', 'Feb', etc.).
- **Y-Axis (Left)**: `COUNT(TripID)` (Number of Records). Label: "Count of Trips".
- **Y-Axis (Right)**: `AVG(TripDurationMinutes)`. Label: "Avg Trip Duration (Minutes)".
- **Visual Encoding**:
  - Line 1 (Count): Color #e15759 (Red).
  - Line 2 (Duration): Color #4e79a7 (Blue).
- **Interactions**: Hovering over a month should show a tooltip with the Month, Count, and Avg Duration.

### 2. PCT of Trips By UserType
- **Type**: 100% Stacked Bar Chart.
- **X-Axis**: `MONTH(starttime)`.
- **Y-Axis**: Percentage of Total (0% to 100%). Label: "% of Total Trips".
- **Color**: `usertype` (Categorical dimension).
- **Labels**: Show percentage labels on the bars (cull if too small).
- **Interactions**: Clicking a bar segment filters the dashboard by that Month and UserType.

### 3. Pct of Trips by Gender
- **Type**: 100% Stacked Bar Chart.
- **X-Axis**: `MONTH(starttime)`.
- **Y-Axis**: Percentage of Total (0% to 100%). Label: "% of Total Trips".
- **Color**: `GenderText` (Male, Female, Unknown).
  - Male: #f28e2b (Orange)
  - Female: #4e79a7 (Blue)
  - Unknown: #e15759 (Red)
- **Labels**: Show percentage labels on the bars.
- **Interactions**: Clicking a bar segment filters the dashboard by that Month and Gender.

## Global Interactions (Filter Actions)
- Implement a global state object `filters` containing: `selectedMonth` (Date | null), `selectedUserType` (string | null), `selectedGender` (string | null).
- When a user interacts (clicks/selects) with a chart:
  - Update the global filter state based on the data point clicked.
  - All charts must re-render to reflect the filtered data.
  - If a filter is active, the other charts should only show data matching the criteria.
  - Example: Clicking 'January' in 'Trips Over Time' sets `selectedMonth` to Jan. The 'Pct of Trips By UserType' chart should then only show data for January.

## Sample Data
Here is a sample of the data structure to expect:

```json
[
  {
    "﻿\"\"\"TripID\"\"\"": 17743,
    "\"tripduration\"": 783,
    "\"starttime\"": "2019-11-16 15:33:45.156000",
    "\"stoptime\"": "2019-11-16 15:46:48.646000",
    "\"start station id\"": 3280,
    "\"start station name\"": "Astor Place",
    "\"start station latitude\"": 40.71928220070703,
    "\"start station longitude\"": -74.07126188278198,
    "\"end station id\"": 3195,
    "\"end station name\"": "Sip Ave",
    "\"end station latitude\"": 40.73089709786179,
    "\"end station longitude\"": -74.06391263008119,
    "\"bikeid\"": 29615,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1953,
    "\"gender\"": 2
  },
  {
    "﻿\"\"\"TripID\"\"\"": 17074,
    "\"tripduration\"": 1626,
    "\"starttime\"": "2019-05-16 10:45:34.766000",
    "\"stoptime\"": "2019-05-16 11:12:41.468000",
    "\"start station id\"": 3640,
    "\"start station name\"": "Journal Square",
    "\"start station latitude\"": 40.733670000000004,
    "\"start station longitude\"": -74.0625,
    "\"end station id\"": 3201,
    "\"end station name\"": "Dey St",
    "\"end station latitude\"": 40.737711,
    "\"end station longitude\"": -74.066921,
    "\"bikeid\"": 26276,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1987,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"TripID\"\"\"": 1713,
    "\"tripduration\"": 448,
    "\"starttime\"": "2020-11-04 08:27:15.612000",
    "\"stoptime\"": "2020-11-04 08:34:44.129000",
    "\"start station id\"": 3269,
    "\"start station name\"": "Brunswick & 6th",
    "\"start station latitude\"": 40.726011729646245,
    "\"start station longitude\"": -74.0503889322281,
    "\"end station id\"": 3186,
    "\"end station name\"": "Grove St PATH",
    "\"end station latitude\"": 40.71958611647166,
    "\"end station longitude\"": -74.0431174635887,
    "\"bikeid\"": 41696,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1978,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"TripID\"\"\"": 11551,
    "\"tripduration\"": 2005,
    "\"starttime\"": "2020-12-31 15:39:27.715000",
    "\"stoptime\"": "2020-12-31 16:12:53.506000",
    "\"start station id\"": 3187,
    "\"start station name\"": "Warren St",
    "\"start station latitude\"": 40.721123600000006,
    "\"start station longitude\"": -74.03805095,
    "\"end station id\"": 3187,
    "\"end station name\"": "Warren St",
    "\"end station latitude\"": 40.721123600000006,
    "\"end station longitude\"": -74.03805095,
    "\"bikeid\"": 42585,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1991,
    "\"gender\"": 2
  },
  {
    "﻿\"\"\"TripID\"\"\"": 4666,
    "\"tripduration\"": 225,
    "\"starttime\"": "2019-05-04 19:19:05.722000",
    "\"stoptime\"": "2019-05-04 19:22:50.807000",
    "\"start station id\"": 3195,
    "\"start station name\"": "Sip Ave",
    "\"start station latitude\"": 40.73089709786179,
    "\"start station longitude\"": -74.06391263008119,
    "\"end station id\"": 3194,
    "\"end station name\"": "McGinley Square",
    "\"end station latitude\"": 40.7253399253558,
    "\"end station longitude\"": -74.06762212514876,
    "\"bikeid\"": 29621,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1966,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"TripID\"\"\"": 15659,
    "\"tripduration\"": 970,
    "\"starttime\"": "2019-01-26 13:40:16.284000",
    "\"stoptime\"": "2019-01-26 13:56:27.070000",
    "\"start station id\"": 3276,
    "\"start station name\"": "Marin Light Rail",
    "\"start station latitude\"": 40.71458403535893,
    "\"start station longitude\"": -74.04281705617905,
    "\"end station id\"": 3276,
    "\"end station name\"": "Marin Light Rail",
    "\"end station latitude\"": 40.71458403535893,
    "\"end station longitude\"": -74.04281705617905,
    "\"bikeid\"": 29259,
    "\"usertype\"": "Customer",
    "\"birth year\"": 1969,
    "\"gender\"": 0
  },
  {
    "﻿\"\"\"TripID\"\"\"": 5833,
    "\"tripduration\"": 663,
    "\"starttime\"": "2019-05-06 15:41:52.360000",
    "\"stoptime\"": "2019-05-06 15:52:56.155000",
    "\"start station id\"": 3205,
    "\"start station name\"": "JC Medical Center",
    "\"start station latitude\"": 40.71653978099194,
    "\"start station longitude\"": -74.0496379137039,
    "\"end station id\"": 3206,
    "\"end station name\"": "Hilltop",
    "\"end station latitude\"": 40.7311689,
    "\"end station longitude\"": -74.0575736,
    "\"bikeid\"": 29294,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1963,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"TripID\"\"\"": 4942,
    "\"tripduration\"": 301,
    "\"starttime\"": "2019-04-15 21:14:07.388000",
    "\"stoptime\"": "2019-04-15 21:19:09.320000",
    "\"start station id\"": 3186,
    "\"start station name\"": "Grove St PATH",
    "\"start station latitude\"": 40.71958611647166,
    "\"start station longitude\"": -74.0431174635887,
    "\"end station id\"": 3269,
    "\"end station name\"": "Brunswick & 6th",
    "\"end station latitude\"": 40.726011729646245,
    "\"end station longitude\"": -74.0503889322281,
    "\"bikeid\"": 29600,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1989,
    "\"gender\"": 2
  },
  {
    "﻿\"\"\"TripID\"\"\"": 37976,
    "\"tripduration\"": 3335,
    "\"starttime\"": "2020-07-31 17:10:24.831000",
    "\"stoptime\"": "2020-07-31 18:06:00.735000",
    "\"start station id\"": 3187,
    "\"start station name\"": "Warren St",
    "\"start station latitude\"": 40.721123600000006,
    "\"start station longitude\"": -74.03805095,
    "\"end station id\"": 3187,
    "\"end station name\"": "Warren St",
    "\"end station latitude\"": 40.721123600000006,
    "\"end station longitude\"": -74.03805095,
    "\"bikeid\"": 42431,
    "\"usertype\"": "Customer",
    "\"birth year\"": 1992,
    "\"gender\"": 2
  },
  {
    "﻿\"\"\"TripID\"\"\"": 17299,
    "\"tripduration\"": 159,
    "\"starttime\"": "2020-07-15 11:21:48.777000",
    "\"stoptime\"": "2020-07-15 11:24:28.498000",
    "\"start station id\"": 3269,
    "\"start station name\"": "Brunswick & 6th",
    "\"start station latitude\"": 40.726011729646245,
    "\"start station longitude\"": -74.0503889322281,
    "\"end station id\"": 3203,
    "\"end station name\"": "Hamilton Park",
    "\"end station latitude\"": 40.727595965999996,
    "\"end station longitude\"": -74.044247311,
    "\"bikeid\"": 44381,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1986,
    "\"gender\"": 2
  }
]
```

## Implementation Notes
- Use `d3.stack` for the stacked bar charts.
- Use `d3.scaleLinear` for Y-axes and `d3.scaleBand` for X-axes (or `d3.scalePoint` for time).
- Ensure the layout is responsive. On smaller screens, the Right Column (Legends) might need to move to the bottom or top.
- Preserve exact text for titles and axis labels as defined in the specifications above.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_1107_3/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: PCT of Trips By UserType
- chart_intent: `line_chart`
- rows_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[pcto:cnt:TripID:qk]`
- cols_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[tmn:starttime:ok]`
- series_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:usertype:nk]`
- axis_title_rows: % of Total Trips
- zone: x=1231, y=40624, w=79384, h=32272
- legend_required: true
- legend_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:usertype:nk]`
- legend_relative_position: right
- highlight_fields: [federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:usertype:nk], [federated.1vyl1wt0bikyvw19huemw1m5isqu].[yr:starttime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Pct of Trips by Gender
- chart_intent: `line_chart`
- rows_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[pcto:cnt:TripID:qk]`
- cols_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[tmn:starttime:ok]`
- series_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:Calculation_2945072721971425291:nk]`
- axis_title_rows: % of Total Trips
- zone: x=1231, y=72896, w=79384, h=26142
- legend_required: true
- legend_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:Calculation_2945072721971425291:nk]`
- legend_relative_position: above
- highlight_fields: [federated.1vyl1wt0bikyvw19huemw1m5isqu].[attr:gender:qk], [federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:gender:qk], [federated.1vyl1wt0bikyvw19huemw1m5isqu].[yr:starttime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored above the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Trips Over Time
- chart_intent: `line_chart`
- rows_field: `([federated.1vyl1wt0bikyvw19huemw1m5isqu].[avg:Calculation_2945072721954668554:qk] + [federated.1vyl1wt0bikyvw19huemw1m5isqu].[cnt:TripID:qk])`
- cols_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[tmn:starttime:qk]`
- series_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[:Measure Names]`
- zone: x=1231, y=962, w=97538, h=39662
- legend_required: true
- legend_field: `[federated.1vyl1wt0bikyvw19huemw1m5isqu].[:Measure Names]`
- legend_relative_position: below
- highlight_fields: [federated.1vyl1wt0bikyvw19huemw1m5isqu].[:Measure Names], [federated.1vyl1wt0bikyvw19huemw1m5isqu].[yr:starttime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored below the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Highlight 1 (generated): kind=highlight_brush, source=Pct of Trips by Gender, target=Pct of Trips by Gender
  fields: Gender Text
- Highlight 2 (generated): kind=highlight_brush, source=TripDashboard, target=TripDashboard
  fields: Gender Text, Measure Names
- Filter1: kind=filter_action, source=TripDashboard, target=TripDashboard
## Highlight Bindings
- Trips Over Time: [federated.1vyl1wt0bikyvw19huemw1m5isqu].[:Measure Names], [federated.1vyl1wt0bikyvw19huemw1m5isqu].[yr:starttime:ok]
- PCT of Trips By UserType: [federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:usertype:nk], [federated.1vyl1wt0bikyvw19huemw1m5isqu].[yr:starttime:ok]
- Pct of Trips by Gender: [federated.1vyl1wt0bikyvw19huemw1m5isqu].[attr:gender:qk], [federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:gender:qk], [federated.1vyl1wt0bikyvw19huemw1m5isqu].[yr:starttime:ok]
- PCT of Trips By UserType: [federated.1vyl1wt0bikyvw19huemw1m5isqu].[none:usertype:nk]
