# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled "Short-Term Customers vs Annual Subscribers".

## Tech Stack
- React + TypeScript + Vite
- D3.js (v7) for visualizations (use primitives: d3-scale, d3-shape, d3-axis, d3-array, d3-time-format, d3-dsv)
- CSS Grid for layout
- No external UI component libraries (use standard HTML/CSS)

## Data Loading
The primary data source is located at `/data/TEMP_0dadi4n02dru231bavf6q0qrp5qq.csv`.

You must implement a data loader utility that:
1. Fetches the CSV using `fetch('/data/TEMP_0dadi4n02dru231bavf6q0qrp5qq.csv')`.
2. Parses the CSV text using `d3.csvParse`.
3. Transforms the raw data into a usable format for the charts.

### Data Transformations
The raw CSV contains columns: `tripduration`, `starttime`, `stoptime`, `start station id`, `start station name`, `start station latitude`, `start station longitude`, `end station id`, `end station name`, `end station latitude`, `end station longitude`, `bikeid`, `usertype`, `birth year`, `gender`.

You must derive the following fields for every row:
- `age`: Calculate as `2021 - new Date(row['birth year']).getFullYear()`. Handle potential nulls.
- `ageGroup`: Categorize `age` into bins: "17-20", "21-30", "31-40", "41-50", "51-60", "61-70", "71+".
- `month`: Extract the 0-indexed month from `starttime` (e.g., `new Date(row.starttime).getMonth()`).

## State Management & Interactions
The dashboard uses "Use as Filter" interactions. Clicking a mark in any chart should filter all other charts.

Implement a global state context or prop drilling pattern:
- `filters`: An object containing active filters for `gender`, `usertype`, `ageGroup`, and `month`.
- `setFilter`: A function to update a specific filter key.
- `resetFilters`: A function to clear all filters.

When a user interacts with a chart (e.g., clicks a bar), identify the dimension values associated with that mark and update the `filters` state. All charts must re-render their data by filtering the master dataset based on the active `filters` object.

## Visual Encodings & Colors
Adhere strictly to these color mappings defined in the workbook:
- **Usertype (Customer):** `#4e79a7`
- **Usertype (Subscriber):** `#f28e2b`
- **Gender (Female):** `#4e79a7`
- **Gender (Male):** `#f28e2b`
- **Gender (Unknown):** `#e15759`

## Component Specifications

### 1. Dashboard Layout (`Dashboard.tsx`)
- **Title:** "Short-Term Customers vs Annual Subscribers" (Bold, Underlined, Color `#4e79a7`).
- **Logo:** Display the Citi Bike logo (assume an image is available or use a placeholder text/icon) positioned in the top-left area.
- **Grid Structure:** Use CSS Grid with 2 columns and 2 rows for the main charts.
  - Top-Left: `MaleVsFemaleTotals`
  - Top-Right: `CustomersVsSubscribersTotals`
  - Bottom-Left: `TotalTrips2020`
  - Bottom-Right: `AgeComparison`

### 2. Chart: Age Comparison (`AgeComparison.tsx`)
- **Type:** Stacked Bar Chart (Tableau Automatic mark with Color dimension defaults to stacked).
- **X-Axis:** `ageGroup` (Ordinal scale, specific order: 17-20, 21-30, 31-40, 41-50, 51-60, 61-70, 71+).
- **Y-Axis:** Count of records (Number of Trips).
- **Color:** `usertype` (Customer vs Subscriber).
- **Interaction:** Clicking a bar segment filters the dashboard by that specific `ageGroup` and `usertype`.
- **Title:** "Age Comparison".

### 3. Chart: Customers vs Subscribers Totals (`CustomersVsSubscribersTotals.tsx`)
- **Type:** Line Chart.
- **X-Axis:** `month` (1 to 12, labeled Jan-Dec).
- **Y-Axis:** Cumulative Sum of Trips (RUNNING_SUM of Count).
- **Color:** `usertype` (Customer vs Subscriber). Draw two lines.
- **Interaction:** Clicking a line or data point filters the dashboard by that `usertype` and specific `month`.
- **Title:** "Customers vs Subscribers Totals".

### 4. Chart: Male vs Female Totals (`MaleVsFemaleTotals.tsx`)
- **Type:** Stacked Bar Chart (or Grouped, but XML implies nested columns). The XML defines Columns as `(gender / usertype)`. This implies a nested axis.
- **X-Axis:** `gender` (nested by `usertype`). Essentially, for each gender (Male, Female), show bars for Customer and Subscriber.
- **Y-Axis:** Count of records (Number of People).
- **Color:** `usertype`.
- **Filter:** Exclude "Unknown" gender from the dataset for this specific chart.
- **Interaction:** Clicking a bar filters by `gender` and `usertype`.
- **Title:** "Male vs Female Rider Totals".

### 5. Chart: Total Trips 2020 (`TotalTrips2020.tsx`)
- **Type:** Bar Chart.
- **X-Axis:** `usertype`.
- **Y-Axis:** Count of records (Number of Trips).
- **Color:** `usertype`.
- **Interaction:** Clicking a bar filters by `usertype`.
- **Title:** "Amount of trips total during 2020".

## Sample Data
Here is a sample of the data structure expected after parsing the CSV:

```json
[
  {
    "﻿\"\"\"tripduration\"\"\"": 5365,
    "\"starttime\"": "2020-05-05 18:03:49.310000",
    "\"stoptime\"": "2020-05-05 19:33:14.979000",
    "\"start station id\"": 3225,
    "\"start station name\"": "Baldwin at Montgomery",
    "\"start station latitude\"": 40.7236589,
    "\"start station longitude\"": -74.0641943,
    "\"end station id\"": 3225,
    "\"end station name\"": "Baldwin at Montgomery",
    "\"end station latitude\"": 40.7236589,
    "\"end station longitude\"": -74.0641943,
    "\"bikeid\"": 42366,
    "\"usertype\"": "Customer",
    "\"birth year\"": 1983,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 77,
    "\"starttime\"": "2020-02-19 07:15:58.575000",
    "\"stoptime\"": "2020-02-19 07:17:16.447000",
    "\"start station id\"": 3186,
    "\"start station name\"": "Grove St PATH",
    "\"start station latitude\"": 40.71958611647166,
    "\"start station longitude\"": -74.0431174635887,
    "\"end station id\"": 3185,
    "\"end station name\"": "City Hall",
    "\"end station latitude\"": 40.717732500000004,
    "\"end station longitude\"": -74.04384499999999,
    "\"bikeid\"": 42634,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1985,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 373,
    "\"starttime\"": "2020-11-01 10:20:38.983000",
    "\"stoptime\"": "2020-11-01 10:26:52.039000",
    "\"start station id\"": 3185,
    "\"start station name\"": "City Hall",
    "\"start station latitude\"": 40.717732500000004,
    "\"start station longitude\"": -74.04384499999999,
    "\"end station id\"": 3268,
    "\"end station name\"": "Lafayette Park",
    "\"end station latitude\"": 40.71346382669195,
    "\"end station longitude\"": -74.06285852193831,
    "\"bikeid\"": 41696,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1982,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 919,
    "\"starttime\"": "2020-07-27 14:35:14.882000",
    "\"stoptime\"": "2020-07-27 14:50:34.425000",
    "\"start station id\"": 3203,
    "\"start station name\"": "Hamilton Park",
    "\"start station latitude\"": 40.727595965999996,
    "\"start station longitude\"": -74.044247311,
    "\"end station id\"": 3272,
    "\"end station name\"": "Jersey & 3rd",
    "\"end station latitude\"": 40.723331586464354,
    "\"end station longitude\"": -74.04595255851744,
    "\"bikeid\"": 42380,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1966,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 466,
    "\"starttime\"": "2020-02-19 09:02:23.637000",
    "\"stoptime\"": "2020-02-19 09:10:10.449000",
    "\"start station id\"": 3186,
    "\"start station name\"": "Grove St PATH",
    "\"start station latitude\"": 40.71958611647166,
    "\"start station longitude\"": -74.0431174635887,
    "\"end station id\"": 3681,
    "\"end station name\"": "Grand St",
    "\"end station latitude\"": 40.71517767732029,
    "\"end station longitude\"": -74.03768330812454,
    "\"bikeid\"": 42615,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1956,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 693,
    "\"starttime\"": "2020-07-12 15:58:57.922000",
    "\"stoptime\"": "2020-07-12 16:10:31.910000",
    "\"start station id\"": 3199,
    "\"start station name\"": "Newport Pkwy",
    "\"start station latitude\"": 40.728744799999994,
    "\"start station longitude\"": -74.03210820000001,
    "\"end station id\"": 3792,
    "\"end station name\"": "Columbus Dr at Exchange Pl",
    "\"end station latitude\"": 40.71687,
    "\"end station longitude\"": -74.03281,
    "\"bikeid\"": 44392,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1986,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 564,
    "\"starttime\"": "2020-09-01 15:49:50.686000",
    "\"stoptime\"": "2020-09-01 15:59:15.045000",
    "\"start station id\"": 3195,
    "\"start station name\"": "Sip Ave",
    "\"start station latitude\"": 40.73089709786179,
    "\"start station longitude\"": -74.06391263008119,
    "\"end station id\"": 3193,
    "\"end station name\"": "Lincoln Park",
    "\"end station latitude\"": 40.7246050998869,
    "\"end station longitude\"": -74.07840594649316,
    "\"bikeid\"": 44347,
    "\"usertype\"": "Customer",
    "\"birth year\"": 1993,
    "\"gender\"": "Female"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 524,
    "\"starttime\"": "2020-10-15 06:13:38.447000",
    "\"stoptime\"": "2020-10-15 06:22:22.968000",
    "\"start station id\"": 3203,
    "\"start station name\"": "Hamilton Park",
    "\"start station latitude\"": 40.727595965999996,
    "\"start station longitude\"": -74.044247311,
    "\"end station id\"": 3184,
    "\"end station name\"": "Paulus Hook",
    "\"end station latitude\"": 40.7141454,
    "\"end station longitude\"": -74.0335519,
    "\"bikeid\"": 40517,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1969,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 212,
    "\"starttime\"": "2020-01-01 11:28:21.871000",
    "\"stoptime\"": "2020-01-01 11:31:54.506000",
    "\"start station id\"": 3276,
    "\"start station name\"": "Marin Light Rail",
    "\"start station latitude\"": 40.71458403535893,
    "\"start station longitude\"": -74.04281705617905,
    "\"end station id\"": 3184,
    "\"end station name\"": "Paulus Hook",
    "\"end station latitude\"": 40.7141454,
    "\"end station longitude\"": -74.0335519,
    "\"bikeid\"": 29276,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1985,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 938,
    "\"starttime\"": "2020-10-21 09:54:40.726000",
    "\"stoptime\"": "2020-10-21 10:10:19.495000",
    "\"start station id\"": 3199,
    "\"start station name\"": "Newport Pkwy",
    "\"start station latitude\"": 40.728744799999994,
    "\"start station longitude\"": -74.03210820000001,
    "\"end station id\"": 3681,
    "\"end station name\"": "Grand St",
    "\"end station latitude\"": 40.71517767732029,
    "\"end station longitude\"": -74.03768330812454,
    "\"bikeid\"": 34039,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1991,
    "\"gender\"": "Female"
  }
]
```

## Implementation Notes
- Use `d3.stack` for the stacked bar charts.
- Use `d3.line` for the cumulative line chart.
- Ensure axes are labeled correctly (e.g., "Number of Trips", "Number of People").
- Handle window resizing to make charts responsive (use `ResizeObserver` or `viewBox`).
- The "Age Groups" calculation logic must match the bins defined in the Tableau XML exactly.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_3430_2/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Age Comparison
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[__tableau_internal_object_id__].[cnt:2020-citibike-tripdata.csv_2F3EFCFE222F4686B0EA2FF8A40BD19A:qk]`
- cols_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[Age Groups]`
- series_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk]`
- axis_title_rows: Number of Trips
- zone: x=49998, y=56676, w=49519, h=42395
- legend_required: true
- legend_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk]`
- legend_relative_position: above
- highlight_fields: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[Age Groups], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:Age (bin):ok], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:Calculation_949696574842662915:ok], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[tyr:birth year:qk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored above the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Customers vs Subsribers Totals
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[__tableau_internal_object_id__].[cum:cnt:2020-citibike-tripdata.csv_2F3EFCFE222F4686B0EA2FF8A40BD19A:qk]`
- cols_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[mn:starttime:ok]`
- series_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk]`
- axis_title_rows: Number of Trips
- zone: x=49998, y=14286, w=49519, h=42390
- highlight_fields: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[mn:starttime:ok], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[yr:starttime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Male vs Female Totals
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[__tableau_internal_object_id__].[cnt:2020-citibike-tripdata.csv_2F3EFCFE222F4686B0EA2FF8A40BD19A:qk]`
- cols_field: `([federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:gender:nk] / [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk])`
- series_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk]`
- bar_orientation: `vertical`
- axis_title_rows: Number of People
- zone: x=483, y=14286, w=49515, h=42390
- highlight_fields: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:gender:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Total Trips 2020
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[__tableau_internal_object_id__].[cnt:2020-citibike-tripdata.csv_2F3EFCFE222F4686B0EA2FF8A40BD19A:qk]`
- cols_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk]`
- series_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk]`
- bar_orientation: `vertical`
- axis_title_rows: Number of Trips
- zone: x=483, y=56676, w=49515, h=42395
- highlight_fields: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Male vs Female Totals, target=Customers vs Subscribers DB
- Filter 2 (generated): kind=filter_action, source=Total Trips 2020, target=Customers vs Subscribers DB
- Filter 3 (generated): kind=filter_action, source=Age Comparison, target=Customers vs Subscribers DB
- Filter 4 (generated): kind=filter_action, source=Customers vs Subsribers Totals, target=Customers vs Subscribers DB
## Highlight Bindings
- Total Trips 2020: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk]
- Customers vs Subsribers Totals: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[mn:starttime:ok], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[yr:starttime:ok]
- Male vs Female Totals: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:gender:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk]
- Age Comparison: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[Age Groups], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:Age (bin):ok], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:Calculation_949696574842662915:ok], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[tyr:birth year:qk]
- Age Comparison: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:usertype:nk]
