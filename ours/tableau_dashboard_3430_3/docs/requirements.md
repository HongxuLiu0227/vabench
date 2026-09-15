# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard named "Station Use DB" using React, TypeScript, and Vite. The dashboard analyzes CitiBike trip data from 2020.

## Tech Stack & Constraints
- **Framework**: React + TypeScript + Vite.
- **Visualization**: Use D3.js primitives (d3-scale, d3-axis, d3-shape, d3-array, d3-selection, d3-transition). Do not use high-level chart libraries like Recharts or Nivo.
- **UI Components**: Use standard HTML/CSS or a lightweight library like Headless UI if needed for layout, but avoid heavy component suites like Ant Design.
- **Styling**: Use CSS Modules or Tailwind CSS (assume Tailwind is available for layout utility classes).
- **Data**: The data source is a CSV file located at `/data/TEMP_0dadi4n02dru231bavf6q0qrp5qq.csv`.

## Data Loading

1.  **Fetch the Data**: Use the native `fetch` API to load the CSV.
2.  **Parse the Data**: Use `d3-dsv` (d3.csvParse) to parse the CSV string into an array of objects.
3.  **Type Definition**: Define a TypeScript interface `CitiBikeTrip` matching the CSV columns:
    - `tripduration`: number
    - `starttime`: Date
    - `stoptime`: Date
    - `start station id`: number
    - `start station name`: string
    - `start station latitude`: number
    - `start station longitude`: number
    - `end station id`: number
    - `end station name`: string
    - `end station latitude`: number
    - `end station longitude`: number
    - `bikeid`: number
    - `usertype`: string
    - `birth year`: number (or Date)
    - `gender`: string

## Data Processing Logic

Before rendering, process the raw data in a `useEffect` hook or a utility function:

1.  **Aggregation**: Group data by `start station name` and `end station name` separately to calculate the count of trips (Number of Records).
2.  **Ranking**:
    - Calculate the rank for each station based on trip count (descending).
    - **Top 10**: Filter stations where `rank <= 10`.
    - **Bottom 10**: Filter stations where `rank` is in the bottom 10 (highest rank number or lowest count). Note: Tableau logic for Bottom 10 is `RANK_UNIQUE(-COUNT) <= 10`.
3.  **Filtering State**: Create a global state (e.g., React Context or lifting state up) to handle `selectedStartStation` and `selectedEndStation`.

## Dashboard Layout

The main dashboard component should use a CSS Grid layout to arrange the 6 worksheets. A suggested layout is a 3-row, 2-column grid:

- **Row 1**: `Top 10 Stations (start)` | `Top 10 Stations (end)`
- **Row 2**: `Most Popular Journey Starting Locations` (Map) | `Most Popular Journey Ending Locations` (Map)
- **Row 3**: `Bottom 10 Stations (start)` | `Bottom 10 Stations (end)`

## Component Specifications

### 1. StationBarChart (Reusable for Top/Bottom Start/End)

**Props**:
- `data`: Array of `{ stationName: string, count: number }`.
- `type`: 'start' | 'end'.
- `onStationClick`: (stationName: string) => void.
- `selectedStation`: string | null.

**Visual Encoding**:
- **Mark Type**: Horizontal Bar.
- **X-Axis**: `d3.scaleLinear` for "Number of Trips". Range: [0, maxCount].
- **Y-Axis**: `d3.scaleBand` for Station Names. Range: [height, 0].
- **Color**: Use the "Orange" palette. The Tableau XML specifies `palette="orange_10_0"`. Approximate with a standard orange (e.g., `#F28E2B` or a gradient). If a station is selected, highlight it; dim others.
- **Labels**: Display station names on the Y-axis. Display trip counts at the end of bars or on hover.
- **Interactions**: Clicking a bar triggers `onStationClick`, updating the global filter state.

### 2. StationMap (Reusable for Start/End Maps)

**Props**:
- `data`: Array of `{ stationName: string, lat: number, lon: number, count: number }`.
- `type`: 'start' | 'end'.
- `filterStartStation`: string | null (from global state).
- `filterEndStation`: string | null (from global state).

**Visual Encoding**:
- **Mark Type**: Circle (Scatter plot on Map).
- **Projection**: Use `d3.geoMercator()`. Fit the projection to the bounds of the data provided in the XML (approx NYC area) or dynamically fit to the data extent.
    - *Start Map Bounds*: Lat ~40.70 to 40.72, Lon ~-74.01 to -73.98.
    - *End Map Bounds*: Lat ~40.70 to 40.72, Lon ~-74.01 to -73.98.
- **X/Y Scales**: Map Longitude/Latitude to SVG coordinates using the projection.
- **Size**: `d3.scaleSqrt` or `d3.scaleLinear` mapping `count` to circle radius (range approx 3px to 15px).
- **Color**: `d3.scaleSequential` using an orange interpolator (e.g., `d3.interpolateOranges`) based on `count`.
- **Tooltip**: Custom HTML tooltip showing:
    - "Start Station Name" / "End Station Name": `<stationName>`
    - "Start Station Latitude" / "End Station Latitude": `<lat>`
    - "Start Station Longitude" / "End Station Longitude": `<lon>`
    - "Number of Trips Started" / "Number of Trips Ended": `<count>`
- **Background**: Since we are using D3 primitives, a simple light gray background or a very subtle SVG path representing land (if available) is sufficient. Do not implement complex tile layers unless necessary; focus on the data points.

### 3. Interactions (Filtering)

- **Action Source**: Selecting a bar in `Top 10 Start`, `Bottom 10 Start`, `Top 10 End`, or `Bottom 10 End`.
- **Action Target**: The entire dashboard ("Station Use DB").
- **Logic**:
    - If a user clicks a station in a "Start" chart, set `selectedStartStation`.
    - If a user clicks a station in an "End" chart, set `selectedEndStation`.
    - Pass these filters to the Maps. The Maps should filter their displayed points:
        - Start Map: Filter by `selectedStartStation` (if set).
        - End Map: Filter by `selectedEndStation` (if set).
    - *Note*: The Tableau XML implies cross-filtering. If a Start Station is selected, the End charts/maps might also need to update to show only trips originating from that station. Implement this if feasible, otherwise prioritize filtering the maps as they are the primary visual context.

## Sample Data

Here is a placeholder for the data structure. Replace this with the actual fetched data logic.

```json
[
  {
    "﻿\"\"\"tripduration\"\"\"": 149,
    "\"starttime\"": "2020-10-21 18:40:53.618000",
    "\"stoptime\"": "2020-10-21 18:43:22.791000",
    "\"start station id\"": 3203,
    "\"start station name\"": "Hamilton Park",
    "\"start station latitude\"": 40.727595965999996,
    "\"start station longitude\"": -74.044247311,
    "\"end station id\"": 3272,
    "\"end station name\"": "Jersey & 3rd",
    "\"end station latitude\"": 40.723331586464354,
    "\"end station longitude\"": -74.04595255851744,
    "\"bikeid\"": 44401,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1964,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 349,
    "\"starttime\"": "2020-06-22 16:34:30.993000",
    "\"stoptime\"": "2020-06-22 16:40:20.889000",
    "\"start station id\"": 3275,
    "\"start station name\"": "Columbus Drive",
    "\"start station latitude\"": 40.71835519823214,
    "\"start station longitude\"": -74.03891444206238,
    "\"end station id\"": 3279,
    "\"end station name\"": "Dixon Mills",
    "\"end station latitude\"": 40.72163014263835,
    "\"end station longitude\"": -74.04996782541275,
    "\"bikeid\"": 42116,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1986,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 230,
    "\"starttime\"": "2020-01-02 15:50:29.984000",
    "\"stoptime\"": "2020-01-02 15:54:20.112000",
    "\"start station id\"": 3186,
    "\"start station name\"": "Grove St PATH",
    "\"start station latitude\"": 40.71958611647166,
    "\"start station longitude\"": -74.0431174635887,
    "\"end station id\"": 3203,
    "\"end station name\"": "Hamilton Park",
    "\"end station latitude\"": 40.727595965999996,
    "\"end station longitude\"": -74.044247311,
    "\"bikeid\"": 29212,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1979,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 113,
    "\"starttime\"": "2020-09-21 09:30:28.872000",
    "\"stoptime\"": "2020-09-21 09:32:21.905000",
    "\"start station id\"": 3279,
    "\"start station name\"": "Dixon Mills",
    "\"start station latitude\"": 40.72163014263835,
    "\"start station longitude\"": -74.04996782541275,
    "\"end station id\"": 3186,
    "\"end station name\"": "Grove St PATH",
    "\"end station latitude\"": 40.71958611647166,
    "\"end station longitude\"": -74.0431174635887,
    "\"bikeid\"": 44671,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1996,
    "\"gender\"": "Female"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 231,
    "\"starttime\"": "2020-11-20 14:58:38.816000",
    "\"stoptime\"": "2020-11-20 15:02:30.405000",
    "\"start station id\"": 3278,
    "\"start station name\"": "Monmouth and 6th",
    "\"start station latitude\"": 40.72568548362901,
    "\"start station longitude\"": -74.0487903356552,
    "\"end station id\"": 3273,
    "\"end station name\"": "Manila & 1st",
    "\"end station latitude\"": 40.72165072487999,
    "\"end station longitude\"": -74.04288411140442,
    "\"bikeid\"": 45764,
    "\"usertype\"": "Customer",
    "\"birth year\"": 1994,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 496,
    "\"starttime\"": "2020-09-17 12:07:01.896000",
    "\"stoptime\"": "2020-09-17 12:15:18.170000",
    "\"start station id\"": 3202,
    "\"start station name\"": "Newport PATH",
    "\"start station latitude\"": 40.7272235,
    "\"start station longitude\"": -74.03375890000001,
    "\"end station id\"": 3202,
    "\"end station name\"": "Newport PATH",
    "\"end station latitude\"": 40.7272235,
    "\"end station longitude\"": -74.03375890000001,
    "\"bikeid\"": 44421,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1993,
    "\"gender\"": "Female"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 3382,
    "\"starttime\"": "2020-10-26 20:47:55.994000",
    "\"stoptime\"": "2020-10-26 21:44:18.455000",
    "\"start station id\"": 3279,
    "\"start station name\"": "Dixon Mills",
    "\"start station latitude\"": 40.72163014263835,
    "\"start station longitude\"": -74.04996782541275,
    "\"end station id\"": 3268,
    "\"end station name\"": "Lafayette Park",
    "\"end station latitude\"": 40.71346382669195,
    "\"end station longitude\"": -74.06285852193831,
    "\"bikeid\"": 43235,
    "\"usertype\"": "Customer",
    "\"birth year\"": 1969,
    "\"gender\"": "Unknown"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 1717,
    "\"starttime\"": "2020-11-06 20:45:24.273000",
    "\"stoptime\"": "2020-11-06 21:14:01.883000",
    "\"start station id\"": 3199,
    "\"start station name\"": "Newport Pkwy",
    "\"start station latitude\"": 40.728744799999994,
    "\"start station longitude\"": -74.03210820000001,
    "\"end station id\"": 3269,
    "\"end station name\"": "Brunswick & 6th",
    "\"end station latitude\"": 40.726011729646245,
    "\"end station longitude\"": -74.0503889322281,
    "\"bikeid\"": 42133,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1970,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 681,
    "\"starttime\"": "2020-01-20 17:26:40.290000",
    "\"stoptime\"": "2020-01-20 17:38:01.972000",
    "\"start station id\"": 3186,
    "\"start station name\"": "Grove St PATH",
    "\"start station latitude\"": 40.71958611647166,
    "\"start station longitude\"": -74.0431174635887,
    "\"end station id\"": 3268,
    "\"end station name\"": "Lafayette Park",
    "\"end station latitude\"": 40.71346382669195,
    "\"end station longitude\"": -74.06285852193831,
    "\"bikeid\"": 26280,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1979,
    "\"gender\"": "Male"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 579,
    "\"starttime\"": "2020-09-30 20:31:11.115000",
    "\"stoptime\"": "2020-09-30 20:40:50.716000",
    "\"start station id\"": 3195,
    "\"start station name\"": "Sip Ave",
    "\"start station latitude\"": 40.73089709786179,
    "\"start station longitude\"": -74.06391263008119,
    "\"end station id\"": 3210,
    "\"end station name\"": "Pershing Field",
    "\"end station latitude\"": 40.742677141,
    "\"end station longitude\"": -74.051788633,
    "\"bikeid\"": 44685,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1989,
    "\"gender\"": "Male"
  }
]
```

## Implementation Notes

- Ensure the app handles the large file size (64MB) efficiently. Consider streaming or basic pagination if the browser freezes, but for this spec, standard `fetch` is acceptable.
- Preserve exact text for titles and tooltips as listed in the XML (e.g., "Bottom 10 Stations (end)", "Number of Trips").
- Use `d3-axis` for axis generation.
- Use `d3-transition` for smooth animations when bars change or filters are applied.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/TEMP_0dadi4n02dru231bavf6q0qrp5qq.csv

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
const rows = await loadCsv("/data/TEMP_0dadi4n02dru231bavf6q0qrp5qq.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_3430_3/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Bottom 10 End
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:end station name:nk]`
- cols_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[__tableau_internal_object_id__].[cnt:2020-citibike-tripdata.csv_2F3EFCFE222F4686B0EA2FF8A40BD19A:qk]`
- series_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:end station name:nk]`
- bar_orientation: `horizontal`
- axis_title_cols: Number of Trips
- zone: x=74759, y=58188, w=24758, h=40883
- highlight_fields: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:end station name:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574854787079:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Bottom 10 Start
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:start station name:nk]`
- cols_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[__tableau_internal_object_id__].[cnt:2020-citibike-tripdata.csv_2F3EFCFE222F4686B0EA2FF8A40BD19A:qk]`
- series_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574854787079:nk]`
- bar_orientation: `horizontal`
- axis_title_cols: Number of Trips
- zone: x=25242, y=58188, w=24758, h=40883
- highlight_fields: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:start station name:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574854787079:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Citymap End
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:end station latitude:qk]`
- cols_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:end station longitude:qk]`
- series_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[__tableau_internal_object_id__].[cnt:2020-citibike-tripdata.csv_2F3EFCFE222F4686B0EA2FF8A40BD19A:qk]`
- bar_orientation: `horizontal`
- zone: x=50000, y=929, w=49517, h=57259
- highlight_fields: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:end station name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Citymap Start
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:start station latitude:qk]`
- cols_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:start station longitude:qk]`
- series_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[__tableau_internal_object_id__].[cnt:2020-citibike-tripdata.csv_2F3EFCFE222F4686B0EA2FF8A40BD19A:qk]`
- bar_orientation: `horizontal`
- zone: x=483, y=929, w=49517, h=57259
- legend_required: true
- legend_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[__tableau_internal_object_id__].[cnt:2020-citibike-tripdata.csv_2F3EFCFE222F4686B0EA2FF8A40BD19A:qk]`
- legend_relative_position: right
- highlight_fields: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[attr:start station name:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:start station name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Top 10 End
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:end station name:nk]`
- cols_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[__tableau_internal_object_id__].[cnt:2020-citibike-tripdata.csv_2F3EFCFE222F4686B0EA2FF8A40BD19A:qk]`
- series_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574855196681:nk]`
- bar_orientation: `horizontal`
- axis_title_cols: Number of Trips
- zone: x=50000, y=58188, w=24759, h=40883
- highlight_fields: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:end station name:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574853439494:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574854787079:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574855196681:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Top 10 Start
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:start station name:nk]`
- cols_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[__tableau_internal_object_id__].[cnt:2020-citibike-tripdata.csv_2F3EFCFE222F4686B0EA2FF8A40BD19A:qk]`
- series_field: `[federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574855196681:nk]`
- bar_orientation: `horizontal`
- axis_title_cols: Number of Trips
- zone: x=483, y=58188, w=24759, h=40883
- highlight_fields: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:end station name:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:start station name:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574853439494:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574855196681:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 5 (generated): kind=filter_action, source=Bottom 10 End, target=Station Use DB
- Filter 6 (generated): kind=filter_action, source=Top 10 End, target=Station Use DB
- Filter 7 (generated): kind=filter_action, source=Bottom 10 Start, target=Station Use DB
- Filter 8 (generated): kind=filter_action, source=Top 10 Start, target=Station Use DB
## Highlight Bindings
- Citymap Start: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[attr:start station name:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:start station name:nk]
- Citymap End: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:end station name:nk]
- Top 10 Start: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:end station name:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:start station name:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574853439494:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574855196681:nk]
- Top 10 End: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:end station name:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574853439494:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574854787079:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574855196681:nk]
- Bottom 10 Start: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:start station name:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574854787079:nk]
- Bottom 10 End: [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[none:end station name:nk], [federated.1av8hvy0u9aebv1fsz5tj1j5hdb7].[usr:Calculation_949696574854787079:nk]
