# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled "Dashboard 3" using React, TypeScript, and Vite. The dashboard analyzes Citi Bike trip data.

## 1. Tech Stack & Dependencies
- **Framework:** React 18+ with TypeScript.
- **Build Tool:** Vite.
- **Visualization:** D3.js (v7). Use primitives: `d3-scale`, `d3-axis`, `d3-array`, `d3-time`, `d3-shape`, `d3-dsv`. Do not use high-level chart libraries.
- **Styling:** CSS Modules or standard CSS. No UI component library is required.

## 2. Data Loading
The primary data source is a CSV file located at `/data/TableauTemp_1f56vnx1u34eds13ml2di1i0hdr8.csv`.

**Implementation Steps:**
1. Create a utility function `useCitiBikeData` using `useEffect` and `useState`.
2. Use `fetch('/data/TableauTemp_1f56vnx1u34eds13ml2di1i0hdr8.csv')` to retrieve the raw text.
3. Use `d3.csvParse` (from `d3-dsv`) to parse the CSV string.
4. **Type Definitions:** Define a `CitiBikeTrip` interface based on the columns:
   - `tripduration`: number
   - `starttime`: Date (parse from string)
   - `stoptime`: Date (parse from string)
   - `start station name`: string
   - `end station name`: string
   - `bikeid`: number
   - `usertype`: string
   - `birth year`: number
   - `gender`: number (0=Unknown, 1=Male, 2=Female)

## 3. Data Transformation Logic
Before rendering charts, you must aggregate the raw trip data.

**Shared Logic:**
- Extract `year` and `month` from the `stoptime` date.
- Group data by `year`.
- Calculate `TotalTrips` = `COUNT(bikeid)`.

**Specific Sheet Logic:**
1. **Sheet 13 (Total Recorded Trips):**
   - Group all data by `year(stoptime)`.
   - Measure: Count of records.
2. **Sheet 13 (2) (Total Recorded Trips - First Quarter):**
   - Filter data where `month(stoptime)` is in [1, 2, 3, 4].
   - Group by `year(stoptime)`.
   - Measure: Count of records.
3. **Sheet 13 (3) (Percent Ridership Growth):**
   - Group all data by `year(stoptime)`.
   - Measure: Count of records.
   - **Table Calculation:** Calculate Year-Over-Year (YoY) percentage difference: `(CurrentYearCount - PreviousYearCount) / PreviousYearCount`.
4. **Sheet 13 (4) (Percent Ridership Growth - First Quarter):**
   - Filter data where `month(stoptime)` is in [1, 2, 3, 4].
   - Group by `year(stoptime)`.
   - Measure: Count of records.
   - **Table Calculation:** Calculate YoY percentage difference.

## 4. Component Architecture

### `App.tsx`
- Fetches data.
- Performs transformations.
- Manages shared state for interactions (e.g., `selectedYear`).
- Renders `Dashboard`.

### `Dashboard.tsx`
- **Layout:** Use CSS Grid.
  - Desktop: 2 columns, 2 rows for charts, plus a sidebar for the legend.
  - Mobile (Responsive): Stack charts vertically (1 column) as per the "Phone" layout in the workbook.
- **Composition:**
  - Top-Left: `Sheet13`
  - Top-Right: `Sheet13_3`
  - Bottom-Left: `Sheet13_2`
  - Bottom-Right: `Sheet13_4`
  - Right Sidebar: `ColorLegend`

### `BarChart.tsx` (Reusable)
- **Props:** `data`, `xKey` (year), `yKey` (value), `title`, `colorScale`, `selectedYear`, `onYearClick`.
- **Implementation:**
  - Use `d3.select` and `d3.axis` to render SVG axes.
  - Render `<rect>` elements for bars.
  - **Color Encoding:** Apply the provided `colorScale` based on the `yKey` value.
  - **Interaction:** On bar click, invoke `onYearClick(year)`. If `selectedYear` is set and differs from the bar's year, reduce opacity (highlight effect).

### `ColorLegend.tsx`
- Renders a continuous gradient legend representing the color scale used in Sheet 13.
- Label: "Total Recorded Trips".

## 5. Visualization Details (D3)

**Common Settings:**
- **X-Axis:** `scaleBand` for Years. Domain: Sorted unique years.
- **Y-Axis:** `scaleLinear`.

**Sheet 13 & Sheet 13 (2):**
- **Mark Type:** Bar.
- **Color Palette:** `red_blue_white_diverging_10_0`. Use `d3.interpolateRdBu` or similar diverging scale. The domain should be based on the min/max of the trip counts.
- **Sheet 13 (2) Specifics:** The XML defines a custom red palette. If possible, approximate this using a custom `d3.scaleSequential` with the specific hex codes provided in the XML (ranging from dark red `#a90c38` to white `#ffffff` to dark blue `#141b87`).

**Sheet 13 (3) & Sheet 13 (4):**
- **Mark Type:** Bar.
- **Measure:** Percent Difference (decimal or percentage).
- **Color Palette:** `red_blue_white_diverging_10_0`. Use `d3.interpolateRdBu`. Domain should be centered around 0 (e.g., [-max, 0, +max]) to ensure white is at 0 growth.

## 6. Interactions
- **Highlight Action:** The workbook defines a "Highlight" action on "Dashboard 3".
- **React Implementation:**
  - Maintain a `selectedYear` state in `App.tsx`.
  - Pass this state to all 4 chart components.
  - When a user clicks a bar in any chart:
    - Update `selectedYear`.
    - All charts re-render: Bars matching the `selectedYear` remain fully opaque; all other bars fade (e.g., opacity 0.3).
    - Clicking the same bar again should deselect (set `selectedYear` to null).

## 7. Sample Data

```json
[
  {
    "﻿\"\"\"F1\"\"\"": 4803,
    "\"tripduration\"": 340,
    "\"starttime\"": "2020-04-15 20:31:39.526000",
    "\"stoptime\"": "2020-04-15 20:37:19.894000",
    "\"start station id\"": 3195,
    "\"start station name\"": "Sip Ave",
    "\"start station latitude\"": 40.73089709786179,
    "\"start station longitude\"": -74.06391263008119,
    "\"end station id\"": 3679,
    "\"end station name\"": "Bergen Ave",
    "\"end station latitude\"": 40.72210378668603,
    "\"end station longitude\"": -74.07145500183104,
    "\"bikeid\"": 40910,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1999,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"F1\"\"\"": 3704,
    "\"tripduration\"": 270,
    "\"starttime\"": "2019-11-04 08:13:09.161000",
    "\"stoptime\"": "2019-11-04 08:17:39.754000",
    "\"start station id\"": 3225,
    "\"start station name\"": "Baldwin at Montgomery",
    "\"start station latitude\"": 40.7236589,
    "\"start station longitude\"": -74.0641943,
    "\"end station id\"": 3195,
    "\"end station name\"": "Sip Ave",
    "\"end station latitude\"": 40.73089709786179,
    "\"end station longitude\"": -74.06391263008119,
    "\"bikeid\"": 29477,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1986,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"F1\"\"\"": 8804,
    "\"tripduration\"": 398,
    "\"starttime\"": "2020-06-09 08:40:39.809000",
    "\"stoptime\"": "2020-06-09 08:47:18.277000",
    "\"start station id\"": 3220,
    "\"start station name\"": "5 Corners Library",
    "\"start station latitude\"": 40.73496102000952,
    "\"start station longitude\"": -74.05950307846071,
    "\"end station id\"": 3678,
    "\"end station name\"": "Fairmount Ave",
    "\"end station latitude\"": 40.72572613742557,
    "\"end station longitude\"": -74.07195925712584,
    "\"bikeid\"": 42260,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1978,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"F1\"\"\"": 6026,
    "\"tripduration\"": 1776,
    "\"starttime\"": "2020-07-05 19:21:05.163000",
    "\"stoptime\"": "2020-07-05 19:50:42.146000",
    "\"start station id\"": 3184,
    "\"start station name\"": "Paulus Hook",
    "\"start station latitude\"": 40.7141454,
    "\"start station longitude\"": -74.0335519,
    "\"end station id\"": 3269,
    "\"end station name\"": "Brunswick & 6th",
    "\"end station latitude\"": 40.726011729646245,
    "\"end station longitude\"": -74.0503889322281,
    "\"bikeid\"": 41367,
    "\"usertype\"": "Customer",
    "\"birth year\"": 1993,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"F1\"\"\"": 34714,
    "\"tripduration\"": 1382,
    "\"starttime\"": "2020-07-28 20:23:41.667000",
    "\"stoptime\"": "2020-07-28 20:46:44.484000",
    "\"start station id\"": 3184,
    "\"start station name\"": "Paulus Hook",
    "\"start station latitude\"": 40.7141454,
    "\"start station longitude\"": -74.0335519,
    "\"end station id\"": 3202,
    "\"end station name\"": "Newport PATH",
    "\"end station latitude\"": 40.7272235,
    "\"end station longitude\"": -74.03375890000001,
    "\"bikeid\"": 44335,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1989,
    "\"gender\"": 2
  },
  {
    "﻿\"\"\"F1\"\"\"": 11821,
    "\"tripduration\"": 404,
    "\"starttime\"": "2019-08-08 15:45:27.859000",
    "\"stoptime\"": "2019-08-08 15:52:12.095000",
    "\"start station id\"": 3640,
    "\"start station name\"": "Journal Square",
    "\"start station latitude\"": 40.733670000000004,
    "\"start station longitude\"": -74.0625,
    "\"end station id\"": 3281,
    "\"end station name\"": "Leonard Gordon Park",
    "\"end station latitude\"": 40.74590996631558,
    "\"end station longitude\"": -74.05727148056029,
    "\"bikeid\"": 29295,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1980,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"F1\"\"\"": 25758,
    "\"tripduration\"": 3843,
    "\"starttime\"": "2019-08-16 23:23:13.614000",
    "\"stoptime\"": "2019-08-17 00:27:17.427000",
    "\"start station id\"": 3185,
    "\"start station name\"": "City Hall",
    "\"start station latitude\"": 40.717732500000004,
    "\"start station longitude\"": -74.04384499999999,
    "\"end station id\"": 3186,
    "\"end station name\"": "Grove St PATH",
    "\"end station latitude\"": 40.71958611647166,
    "\"end station longitude\"": -74.0431174635887,
    "\"bikeid\"": 29305,
    "\"usertype\"": "Customer",
    "\"birth year\"": 1977,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"F1\"\"\"": 24031,
    "\"tripduration\"": 2521,
    "\"starttime\"": "2020-07-20 07:02:35.678000",
    "\"stoptime\"": "2020-07-20 07:44:36.860000",
    "\"start station id\"": 3205,
    "\"start station name\"": "JC Medical Center",
    "\"start station latitude\"": 40.71653978099194,
    "\"start station longitude\"": -74.0496379137039,
    "\"end station id\"": 3205,
    "\"end station name\"": "JC Medical Center",
    "\"end station latitude\"": 40.71653978099194,
    "\"end station longitude\"": -74.0496379137039,
    "\"bikeid\"": 44781,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1980,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"F1\"\"\"": 10340,
    "\"tripduration\"": 2186,
    "\"starttime\"": "2020-08-08 17:19:53.786000",
    "\"stoptime\"": "2020-08-08 17:56:19.989000",
    "\"start station id\"": 3205,
    "\"start station name\"": "JC Medical Center",
    "\"start station latitude\"": 40.71653978099194,
    "\"start station longitude\"": -74.0496379137039,
    "\"end station id\"": 3205,
    "\"end station name\"": "JC Medical Center",
    "\"end station latitude\"": 40.71653978099194,
    "\"end station longitude\"": -74.0496379137039,
    "\"bikeid\"": 45352,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1994,
    "\"gender\"": 1
  },
  {
    "﻿\"\"\"F1\"\"\"": 17344,
    "\"tripduration\"": 343,
    "\"starttime\"": "2020-09-13 09:22:28.257000",
    "\"stoptime\"": "2020-09-13 09:28:11.332000",
    "\"start station id\"": 3205,
    "\"start station name\"": "JC Medical Center",
    "\"start station latitude\"": 40.71653978099194,
    "\"start station longitude\"": -74.0496379137039,
    "\"end station id\"": 3185,
    "\"end station name\"": "City Hall",
    "\"end station latitude\"": 40.717732500000004,
    "\"end station longitude\"": -74.04384499999999,
    "\"bikeid\"": 44916,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1980,
    "\"gender\"": 1
  }
]
```

## 8. Exact Copy Requirements
- Ensure all chart titles match exactly:
  - "Total Recorded Trips"
  - "Total Recorded Trips - First Quarter"
  - "Percent Ridership Growth"
  - "Percent Ridership Growth - First Quarter"
- Ensure axis labels are formatted reasonably (e.g., integers for counts, percentages for growth).
- Ensure the layout respects the 2x2 grid structure with the legend on the right.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_2936_3/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Sheet 13
- chart_intent: `line_chart`
- rows_field: `[federated.0ylwmbt19c6uw817qmb561v42rlx].[usr:Calculation_1279303814258806785:qk]`
- cols_field: `[federated.0ylwmbt19c6uw817qmb561v42rlx].[yr:stoptime:ok]`
- series_field: `[federated.0ylwmbt19c6uw817qmb561v42rlx].[usr:Calculation_1279303814258806785:qk]`
- zone: x=499, y=978, w=44514, h=49022
- legend_required: true
- legend_field: `[federated.0ylwmbt19c6uw817qmb561v42rlx].[usr:Calculation_1279303814258806785:qk]`
- legend_relative_position: right
- highlight_fields: [federated.0ylwmbt19c6uw817qmb561v42rlx].[mn:stoptime:ok], [federated.0ylwmbt19c6uw817qmb561v42rlx].[yr:stoptime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 13 (2)
- chart_intent: `line_chart`
- rows_field: `[federated.0ylwmbt19c6uw817qmb561v42rlx].[usr:Calculation_1279303814258806785:qk]`
- cols_field: `[federated.0ylwmbt19c6uw817qmb561v42rlx].[yr:stoptime:ok]`
- series_field: `[federated.0ylwmbt19c6uw817qmb561v42rlx].[usr:Calculation_1279303814258806785:qk]`
- zone: x=499, y=50000, w=44514, h=49022
- highlight_fields: [federated.0ylwmbt19c6uw817qmb561v42rlx].[mn:stoptime:ok], [federated.0ylwmbt19c6uw817qmb561v42rlx].[yr:stoptime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 13 (3)
- chart_intent: `line_chart`
- rows_field: `[federated.0ylwmbt19c6uw817qmb561v42rlx].[pcdf:usr:Calculation_1279303814258806785:qk]`
- cols_field: `[federated.0ylwmbt19c6uw817qmb561v42rlx].[yr:stoptime:ok]`
- series_field: `[federated.0ylwmbt19c6uw817qmb561v42rlx].[usr:Calculation_1279303814258806785:qk]`
- zone: x=45013, y=978, w=44513, h=49022
- highlight_fields: [federated.0ylwmbt19c6uw817qmb561v42rlx].[mn:stoptime:ok], [federated.0ylwmbt19c6uw817qmb561v42rlx].[yr:stoptime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 13 (4)
- chart_intent: `line_chart`
- rows_field: `[federated.0ylwmbt19c6uw817qmb561v42rlx].[pcdf:usr:Calculation_1279303814258806785:qk]`
- cols_field: `[federated.0ylwmbt19c6uw817qmb561v42rlx].[yr:stoptime:ok]`
- series_field: `[federated.0ylwmbt19c6uw817qmb561v42rlx].[usr:Calculation_1279303814258806785:qk]`
- zone: x=45013, y=50000, w=44513, h=49022
- highlight_fields: [federated.0ylwmbt19c6uw817qmb561v42rlx].[mn:stoptime:ok], [federated.0ylwmbt19c6uw817qmb561v42rlx].[yr:stoptime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Highlight 1 (generated): kind=highlight_brush, source=Sheet 1, target=Sheet 1
  fields: Start Station Name
- Highlight1: kind=highlight_brush, source=Dashboard 3, target=Dashboard 3
## Highlight Bindings
- Sheet 13: [federated.0ylwmbt19c6uw817qmb561v42rlx].[mn:stoptime:ok], [federated.0ylwmbt19c6uw817qmb561v42rlx].[yr:stoptime:ok]
- Sheet 13 (3): [federated.0ylwmbt19c6uw817qmb561v42rlx].[mn:stoptime:ok], [federated.0ylwmbt19c6uw817qmb561v42rlx].[yr:stoptime:ok]
- Sheet 13 (2): [federated.0ylwmbt19c6uw817qmb561v42rlx].[mn:stoptime:ok], [federated.0ylwmbt19c6uw817qmb561v42rlx].[yr:stoptime:ok]
- Sheet 13 (4): [federated.0ylwmbt19c6uw817qmb561v42rlx].[mn:stoptime:ok], [federated.0ylwmbt19c6uw817qmb561v42rlx].[yr:stoptime:ok]
