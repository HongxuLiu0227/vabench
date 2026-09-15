# Project Requirements

You are an expert React and D3 developer. Your task is to implement a dashboard based on the provided Tableau workbook definition and data manifest.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7): Use `d3-scale`, `d3-axis`, `d3-array`, `d3-selection`, `d3-shape`, `d3-time`, `d3-time-format`.
- CSS: Use standard CSS modules or styled-components. Do not use Ant Design.

## Data Loading
The application must load data from the public folder.

1.  **Fetch Logic**: Create a utility function `useCitiBikeData` that fetches `/data/JC-201701-citibike-tripdata.csv`.
2.  **Parsing**: Use `d3-dsv` (d3.csvParse) to parse the CSV string.
3.  **Type Safety**: Define a TypeScript interface `CitiBikeTrip` matching the columns in the CSV:
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
    - `birth year`: number
    - `gender`: number

## Sample Data
```json
[
  {
    "﻿\"\"\"tripduration\"\"\"": 370,
    "\"starttime\"": "2017-01-15 12:08:00",
    "\"stoptime\"": "2017-01-15 12:14:00",
    "\"start station id\"": 3213,
    "\"start station name\"": "Van Vorst Park",
    "\"start station latitude\"": 40.71848892,
    "\"start station longitude\"": -74.04772663,
    "\"end station id\"": 3183,
    "\"end station name\"": "Exchange Place",
    "\"end station latitude\"": 40.7162469,
    "\"end station longitude\"": -74.0334588,
    "\"bikeid\"": 26271,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1956.0,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-201701-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 385,
    "\"starttime\"": "2017-09-07 12:03:13",
    "\"stoptime\"": "2017-09-07 12:09:39",
    "\"start station id\"": 3183,
    "\"start station name\"": "Exchange Place",
    "\"start station latitude\"": 40.7162469,
    "\"start station longitude\"": -74.0334588,
    "\"end station id\"": 3186,
    "\"end station name\"": "Grove St PATH",
    "\"end station latitude\"": 40.71958611647166,
    "\"end station longitude\"": -74.04311746358871,
    "\"bikeid\"": 29520,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1988.0,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-201709-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 321,
    "\"starttime\"": "2017-07-10 19:02:54",
    "\"stoptime\"": "2017-07-10 19:08:16",
    "\"start station id\"": 3186,
    "\"start station name\"": "Grove St PATH",
    "\"start station latitude\"": 40.71958611647166,
    "\"start station longitude\"": -74.04311746358871,
    "\"end station id\"": 3203,
    "\"end station name\"": "Hamilton Park",
    "\"end station latitude\"": 40.727595966,
    "\"end station longitude\"": -74.044247311,
    "\"bikeid\"": 29447,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1956.0,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-201707-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 267,
    "\"starttime\"": "2017-10-11 09:10:57",
    "\"stoptime\"": "2017-10-11 09:15:25",
    "\"start station id\"": 3203,
    "\"start station name\"": "Hamilton Park",
    "\"start station latitude\"": 40.727595966,
    "\"start station longitude\"": -74.044247311,
    "\"end station id\"": 3186,
    "\"end station name\"": "Grove St PATH",
    "\"end station latitude\"": 40.71958611647166,
    "\"end station longitude\"": -74.04311746358871,
    "\"bikeid\"": 26226,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1987.0,
    "\"gender\"": 2,
    "\"Table Name\"": "JC-201710-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 321,
    "\"starttime\"": "2017-12-02 09:00:56",
    "\"stoptime\"": "2017-12-02 09:06:17",
    "\"start station id\"": 3205,
    "\"start station name\"": "JC Medical Center",
    "\"start station latitude\"": 40.71653978099194,
    "\"start station longitude\"": -74.0496379137039,
    "\"end station id\"": 3211,
    "\"end station name\"": "Newark Ave",
    "\"end station latitude\"": 40.72152515,
    "\"end station longitude\"": -74.046304543,
    "\"bikeid\"": 31759,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1983.0,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-201712-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 321,
    "\"starttime\"": "2017-07-14 20:35:14",
    "\"stoptime\"": "2017-07-14 20:40:36",
    "\"start station id\"": 3183,
    "\"start station name\"": "Exchange Place",
    "\"start station latitude\"": 40.7162469,
    "\"start station longitude\"": -74.0334588,
    "\"end station id\"": 3267,
    "\"end station name\"": "Morris Canal",
    "\"end station latitude\"": 40.7124188237569,
    "\"end station longitude\"": -74.03852552175522,
    "\"bikeid\"": 26227,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1987.0,
    "\"gender\"": 2,
    "\"Table Name\"": "JC-201707-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 512,
    "\"starttime\"": "2017-06-12 07:54:36",
    "\"stoptime\"": "2017-06-12 08:03:08",
    "\"start station id\"": 3193,
    "\"start station name\"": "Lincoln Park",
    "\"start station latitude\"": 40.7246050998869,
    "\"start station longitude\"": -74.07840594649315,
    "\"end station id\"": 3195,
    "\"end station name\"": "Sip Ave",
    "\"end station latitude\"": 40.73074262530658,
    "\"end station longitude\"": -74.06378388404846,
    "\"bikeid\"": 29273,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1986.0,
    "\"gender\"": 2,
    "\"Table Name\"": "JC-201706-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 1476,
    "\"starttime\"": "2017-08-12 18:27:56",
    "\"stoptime\"": "2017-08-12 18:52:33",
    "\"start station id\"": 3211,
    "\"start station name\"": "Newark Ave",
    "\"start station latitude\"": 40.72152515,
    "\"start station longitude\"": -74.046304543,
    "\"end station id\"": 3202,
    "\"end station name\"": "Newport PATH",
    "\"end station latitude\"": 40.7272235,
    "\"end station longitude\"": -74.0337589,
    "\"bikeid\"": 26166,
    "\"usertype\"": "Customer",
    "\"birth year\"": "",
    "\"gender\"": 0,
    "\"Table Name\"": "JC-201708-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 148,
    "\"starttime\"": "2017-09-06 18:18:12",
    "\"stoptime\"": "2017-09-06 18:20:41",
    "\"start station id\"": 3211,
    "\"start station name\"": "Newark Ave",
    "\"start station latitude\"": 40.72152515,
    "\"start station longitude\"": -74.046304543,
    "\"end station id\"": 3205,
    "\"end station name\"": "JC Medical Center",
    "\"end station latitude\"": 40.71653978099194,
    "\"end station longitude\"": -74.0496379137039,
    "\"bikeid\"": 29643,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1989.0,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-201709-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 1655,
    "\"starttime\"": "2017-06-23 12:47:31",
    "\"stoptime\"": "2017-06-23 13:15:07",
    "\"start station id\"": 3202,
    "\"start station name\"": "Newport PATH",
    "\"start station latitude\"": 40.7272235,
    "\"start station longitude\"": -74.0337589,
    "\"end station id\"": 3199,
    "\"end station name\"": "Newport Pkwy",
    "\"end station latitude\"": 40.7287448,
    "\"end station longitude\"": -74.0321082,
    "\"bikeid\"": 29569,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1988.0,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-201706-citibike-tripdata.csv"
  }
]
```

## Dashboard Architecture
The main dashboard is named **"Popularity of Stations"**.

### Layout Structure
Use a CSS Grid layout for the dashboard container.
- **Header**: Dashboard Title.
- **Filters Bar**: Global filters for Month and Birth Year.
- **Main Content**:
  - **Left/Center**: `Map 1` (Inferred from actions, likely a map visualization of stations).
  - **Right**: A vertical stack containing `Top Stations` (Inferred) and `Bottom Stations` (Explicitly defined).

### Global State
Create a context or lift state to the Dashboard component to manage:
1.  `rawData`: The full dataset.
2.  `filters`: Object containing selected `month` (from `stoptime`) and `birthYear`.
3.  `selection`: Object representing the currently selected station (from interactions).

## Component Specifications

### 1. Bottom Stations (Explicitly Defined)
This component visualizes the "Bottom 10 Stations by Start Station (Count)".

**Visual Encoding**:
- **Chart Type**: Horizontal Bar Chart.
- **X-Axis**: Count of records (Measure). Label should be hidden or minimal based on XML (`format attr="title" ... value=""`).
- **Y-Axis**: `start station name` (Dimension).
- **Color**: Encoded by the Count (Measure). Use the Tableau "Orange" palette. In D3, use `d3.interpolateOranges` or a sequential scale `scaleSequential` with `interpolateOranges`.
- **Background**: The worksheet background color is `#d4d4d4`.
- **Title**: "Bottom 10 Stations by Start Station (Count)".

**Data Logic**:
1.  Filter `rawData` based on global filters (Month, Birth Year).
2.  Group by `start station name`.
3.  Count the number of records per station.
4.  Sort the stations by Count in **Ascending** order.
5.  Take the **Bottom 10** (first 10 after ascending sort).

**D3 Implementation Details**:
- Use `scaleBand` for the Y-axis (padding: 0.1).
- Use `scaleLinear` for the X-axis.
- Render `<rect>` elements for bars.
- Render `<text>` elements for axis labels.
- Ensure the color scale domain is set from [minCount, maxCount] of the filtered data.

### 2. Top Stations (Inferred)
This component is referenced in the Actions section but the XML definition is truncated.

**Visual Encoding**:
- **Chart Type**: Horizontal Bar Chart.
- **X-Axis**: Count of records.
- **Y-Axis**: `start station name`.
- **Color**: Encoded by Count (Use a Blue or Green palette to distinguish from Bottom, or reuse Orange if consistent). Default to `d3.interpolateBlues`.
- **Title**: "Top 10 Stations by Start Station (Count)".

**Data Logic**:
1.  Filter `rawData` based on global filters.
2.  Group by `start station name`.
3.  Count records.
4.  Sort by Count in **Descending** order.
5.  Take the **Top 10**.

### 3. Map 1 (Inferred)
This component is referenced in the Actions section.

**Visual Encoding**:
- **Chart Type**: Symbol Map (Scatter plot on geographic coordinates).
- **X-Axis**: `start station longitude`.
- **Y-Axis**: `start station latitude`.
- **Marks**: Circles representing stations.
- **Color/Size**: Encoded by Count of trips starting at that station.

**Data Logic**:
1.  Filter `rawData`.
2.  Aggregate by `start station latitude`, `start station longitude`, and `start station name`.
3.  Count records.
4.  Render circles at (lon, lat).

### 4. Filters Component
- **Month Filter**: A dropdown or set of checkboxes derived from `stoptime` (Month part).
- **Birth Year Filter**: A dropdown or slider derived from `birth year`.

## Interactions (Wiring)
Based on the `<actions>` section in the XML:

1.  **Filter Action (Map 1)**:
    - Trigger: Selecting a mark (station) on `Map 1`.
    - Effect: Should filter the `Bottom Stations` and `Top Stations` charts to show data only for the selected station.

2.  **Filter Action (Bottom Stations)**:
    - Trigger: Clicking a bar in `Bottom Stations`.
    - Effect: Should filter `Map 1` and `Top Stations` to highlight or isolate the selected station.

3.  **Filter Action (Top Stations)**:
    - Trigger: Clicking a bar in `Top Stations`.
    - Effect: Should filter `Map 1` and `Bottom Stations`.

**Implementation**:
- Maintain a `selectedStation` state in the Dashboard context.
- Pass `selectedStation` down to all chart components.
- If `selectedStation` is not null, charts should:
    - Dim non-selected items (opacity reduction).
    - Or filter the data to show only the selected item (Tableau "Filter" action usually implies filtering the view, but "Highlight" is also common. The XML says `command="tsc:tsl-filter"`, which implies filtering the data source for the target sheets).
- Apply the filter logic: If a station is selected in one sheet, the other sheets should re-calculate their aggregations (Top/Bottom 10) based on the subset of data belonging to that station.

## Styling Notes
- **Fonts**: Use a sans-serif font (Arial, Helvetica, system-ui).
- **Colors**: Use the specific hex codes found in the XML where available (e.g., `#d4d4d4` for Bottom Stations background).
- **Responsiveness**: Charts should resize with their containers using `ResizeObserver` or `viewBox` logic.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/JC-201701-citibike-tripdata.csv

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
const rows = await loadCsv("/data/JC-201701-citibike-tripdata.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_8077_2/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Bottom Stations
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.02mw22n0f3ayp71e2zu0c1mty079].[cnt:bikeid (copy)_705939293799452673:qk]`
- cols_field: `[federated.02mw22n0f3ayp71e2zu0c1mty079].[none:start station name:nk]`
- series_field: `[federated.02mw22n0f3ayp71e2zu0c1mty079].[cnt:bikeid (copy)_705939293799452673:qk]`
- bar_orientation: `vertical`
- zone: x=49999, y=60147, w=49274, h=38964
- highlight_fields: [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:start station name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Map 1
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.02mw22n0f3ayp71e2zu0c1mty079].[none:end station latitude:qk]`
- cols_field: `[federated.02mw22n0f3ayp71e2zu0c1mty079].[none:end station longitude:qk]`
- series_field: `[federated.02mw22n0f3ayp71e2zu0c1mty079].[cnt:end station id:qk]`
- bar_orientation: `horizontal`
- zone: x=727, y=889, w=98546, h=59258
- legend_required: true
- legend_field: `[federated.02mw22n0f3ayp71e2zu0c1mty079].[cnt:end station id:qk]`
- legend_relative_position: overlay
- highlight_fields: [federated.02mw22n0f3ayp71e2zu0c1mty079].[cnt:end station id:qk], [federated.02mw22n0f3ayp71e2zu0c1mty079].[mn:stoptime:ok], [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:birth year:ok], [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:end station latitude:qk], [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:end station longitude:qk], [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:end station name:nk], [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:start station name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Top Stations
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.02mw22n0f3ayp71e2zu0c1mty079].[cnt:bikeid (copy)_705939293799452673:qk]`
- cols_field: `[federated.02mw22n0f3ayp71e2zu0c1mty079].[none:start station name:nk]`
- series_field: `[federated.02mw22n0f3ayp71e2zu0c1mty079].[cnt:bikeid (copy)_705939293799452673:qk]`
- bar_orientation: `vertical`
- zone: x=727, y=60147, w=49272, h=38964
- highlight_fields: [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:start station name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Map 1, target=Popularity of Stations
- Filter 2 (generated): kind=filter_action, source=Bottom Stations, target=Popularity of Stations
- Filter 3 (generated): kind=filter_action, source=Top Stations, target=Popularity of Stations
## Highlight Bindings
- Map 1: [federated.02mw22n0f3ayp71e2zu0c1mty079].[cnt:end station id:qk], [federated.02mw22n0f3ayp71e2zu0c1mty079].[mn:stoptime:ok], [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:birth year:ok], [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:end station latitude:qk], [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:end station longitude:qk], [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:end station name:nk], [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:start station name:nk]
- Top Stations: [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:start station name:nk]
- Bottom Stations: [federated.02mw22n0f3ayp71e2zu0c1mty079].[none:start station name:nk]
