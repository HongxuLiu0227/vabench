# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled "Dashboard 3" using React, TypeScript, and Vite. The dashboard visualizes Citi Bike trip data for November 2016.

## Tech Stack
- **Framework**: React 18+ with TypeScript.
- **Build Tool**: Vite.
- **Visualization**: D3.js (v7+) primitives (`d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-time-format`). Do not use high-level chart libraries like Recharts or Nivo.
- **Styling**: CSS Modules or Tailwind CSS (optional, but ensure layout fidelity).

## Data Loading
The application must load data from the following URL:
`/data/TEMP_1o6gr4v0a4irtf1f3ekzg1cc6xxs.csv`

Implement a `useData` hook or utility function that:
1. Uses the native `fetch` API to retrieve the CSV file.
2. Parses the CSV text using `d3-dsv` (e.g., `d3.csvParse`).
3. Transforms the string dates into JavaScript `Date` objects for the 'Start Time' column.
4. Returns the typed array of data.

## Data Schema
The CSV contains the following relevant columns for this dashboard:
- `Trip Duration` (integer)
- `Start Time` (datetime string)
- `Stop Time` (datetime string)
- `Start Station ID` (integer)
- `Gender` (integer: 0=Undefined, 1=Male, 2=Female)

Define a TypeScript interface `CitiBikeTrip` reflecting these types.

## Dashboard Layout (Dashboard 3)
The dashboard consists of two main worksheets arranged side-by-side on desktop.
- **Container**: Use CSS Grid with `grid-template-columns: 1fr 1fr`.
- **Left Sheet**: "Gender Trips by Hour of Day"
- **Right Sheet**: "Trips by Day of Month"

## Component Specifications

### 1. Trips by Day of Month (Right Sheet)
- **Type**: Stacked Bar Chart.
- **Title**: "Trips by Day of Month"
- **X-Axis**: Day of Month (1 to 30). Derived from `Start Time`.
- **Y-Axis**: Count of Records (Trip count).
- **Color Encoding**: Stacked by Weekday (Monday=1 to Sunday=7).
  - **Palette**: Sequential Gray (Warm).
  - **Colors**:
    - Monday (1): #59504e
    - Tuesday (2): #dcd4d0
    - Wednesday (3): #c4bcb8
    - Thursday (4): #aea5a2
    - Friday (5): #98908c
    - Saturday (6): #827a77
    - Sunday (7): #6e6462
- **Interaction**: Clicking a specific day bar should trigger a global filter action (see Interactions section).

### 2. Gender Trips by Hour of Day (Left Sheet)
- **Type**: Grouped Bar Chart.
- **Title**: "Trips by Hour of Day"
- **X-Axis**: Hour of Day (0 to 23). Derived from `Start Time`.
- **Y-Axis**: Count of Records (Trip count).
- **Color Encoding**: Grouped by Gender.
  - **Palette**: Categorical.
  - **Colors**:
    - Male (1): #4e79a7
    - Female (2): #ff9da7
    - Undefined (0): #e15759 (Note: The Tableau sheet filters out 'Undefined' by default, so you may choose to exclude it or include it with this color).
- **Filter Logic**: This chart must react to the selection made in the "Trips by Day of Month" chart. If a day is selected, this chart should only show data for that specific day.

## Interactions (Filter 3)
Implement a state management solution (e.g., React Context or lifting state up in the Dashboard component) to handle the "Filter 3" action defined in the workbook.
- **Trigger**: User selects a bar (specific day) in the "Trips by Day of Month" chart.
- **Target**: The "Gender Trips by Hour of Day" chart updates to filter the dataset to the selected Day of Month.
- **Behavior**:
  - Initial State: Show hourly data for the entire month.
  - Selected State: Show hourly data only for the selected day.
  - Reset: Clicking the same bar again or a 'Reset' button (optional) should clear the filter.

## Implementation Details
- **Date Parsing**: Use `d3-time-format` (`%m/%d/%Y %I:%M:%S %p` or similar based on CSV format) to parse 'Start Time'.
- **Scales**:
  - Use `scaleBand` for X-axes (Day and Hour).
  - Use `scaleLinear` for Y-axes (Count).
  - Use `scaleOrdinal` for Color scales.
- **Margins**: Define consistent margins for axes and labels.

## Sample Data
Here is a placeholder for the data structure:

```json
[
  {
    "﻿\"\"\"Trip Duration\"\"\"": 360,
    "\"Start Time\"": "2016-11-07 16:53:24",
    "\"Stop Time\"": "2016-11-07 16:59:25",
    "\"Start Station ID\"": 523,
    "\"Start Station Name\"": "W 38 St & 8 Ave",
    "\"Start Station Latitude\"": 40.75466591,
    "\"Start Station Longitude\"": -73.99138152,
    "\"End Station ID\"": 517,
    "\"End Station Name\"": "Pershing Square South",
    "\"End Station Latitude\"": 40.751581,
    "\"End Station Longitude\"": -73.97791,
    "\"Bike ID\"": 22476,
    "\"User Type\"": "Subscriber",
    "\"Birth Year\"": 1989.0,
    "\"Gender\"": 1
  },
  {
    "﻿\"\"\"Trip Duration\"\"\"": 691,
    "\"Start Time\"": "2016-11-17 14:53:16",
    "\"Stop Time\"": "2016-11-17 15:04:47",
    "\"Start Station ID\"": 539,
    "\"Start Station Name\"": "Metropolitan Ave & Bedford Ave",
    "\"Start Station Latitude\"": 40.71534825,
    "\"Start Station Longitude\"": -73.96024116,
    "\"End Station ID\"": 282,
    "\"End Station Name\"": "Kent Ave & S 11 St",
    "\"End Station Latitude\"": 40.707644944175705,
    "\"End Station Longitude\"": -73.96841526031494,
    "\"Bike ID\"": 23960,
    "\"User Type\"": "Customer",
    "\"Birth Year\"": "",
    "\"Gender\"": 0
  },
  {
    "﻿\"\"\"Trip Duration\"\"\"": 381,
    "\"Start Time\"": "2016-11-01 09:21:29",
    "\"Stop Time\"": "2016-11-01 09:27:51",
    "\"Start Station ID\"": 519,
    "\"Start Station Name\"": "Pershing Square North",
    "\"Start Station Latitude\"": 40.751873,
    "\"Start Station Longitude\"": -73.977706,
    "\"End Station ID\"": 491,
    "\"End Station Name\"": "E 24 St & Park Ave S",
    "\"End Station Latitude\"": 40.74096374,
    "\"End Station Longitude\"": -73.98602213,
    "\"Bike ID\"": 21505,
    "\"User Type\"": "Subscriber",
    "\"Birth Year\"": 1968.0,
    "\"Gender\"": 1
  },
  {
    "﻿\"\"\"Trip Duration\"\"\"": 249,
    "\"Start Time\"": "2016-11-25 10:25:57",
    "\"Stop Time\"": "2016-11-25 10:30:06",
    "\"Start Station ID\"": 3293,
    "\"Start Station Name\"": "W 92 St & Broadway",
    "\"Start Station Latitude\"": 40.7921,
    "\"Start Station Longitude\"": -73.9739,
    "\"End Station ID\"": 3170,
    "\"End Station Name\"": "W 84 St & Columbus Ave",
    "\"End Station Latitude\"": 40.78499979,
    "\"End Station Longitude\"": -73.97283406,
    "\"Bike ID\"": 23968,
    "\"User Type\"": "Subscriber",
    "\"Birth Year\"": 1972.0,
    "\"Gender\"": 1
  },
  {
    "﻿\"\"\"Trip Duration\"\"\"": 899,
    "\"Start Time\"": "2016-11-20 09:00:16",
    "\"Stop Time\"": "2016-11-20 09:15:16",
    "\"Start Station ID\"": 3172,
    "\"Start Station Name\"": "W 74 St & Columbus Ave",
    "\"Start Station Latitude\"": 40.7785669,
    "\"Start Station Longitude\"": -73.97754961,
    "\"End Station ID\"": 500,
    "\"End Station Name\"": "Broadway & W 51 St",
    "\"End Station Latitude\"": 40.76228826,
    "\"End Station Longitude\"": -73.98336183,
    "\"Bike ID\"": 25076,
    "\"User Type\"": "Subscriber",
    "\"Birth Year\"": 1990.0,
    "\"Gender\"": 2
  },
  {
    "﻿\"\"\"Trip Duration\"\"\"": 413,
    "\"Start Time\"": "2016-11-01 08:12:45",
    "\"Stop Time\"": "2016-11-01 08:19:38",
    "\"Start Station ID\"": 417,
    "\"Start Station Name\"": "Barclay St & Church St",
    "\"Start Station Latitude\"": 40.71291224,
    "\"Start Station Longitude\"": -74.01020234,
    "\"End Station ID\"": 2010,
    "\"End Station Name\"": "Grand St & Greene St",
    "\"End Station Latitude\"": 40.72165481,
    "\"End Station Longitude\"": -74.00234737,
    "\"Bike ID\"": 21194,
    "\"User Type\"": "Subscriber",
    "\"Birth Year\"": 1967.0,
    "\"Gender\"": 1
  },
  {
    "﻿\"\"\"Trip Duration\"\"\"": 971,
    "\"Start Time\"": "2016-11-23 16:45:37",
    "\"Stop Time\"": "2016-11-23 17:01:48",
    "\"Start Station ID\"": 519,
    "\"Start Station Name\"": "Pershing Square North",
    "\"Start Station Latitude\"": 40.751873,
    "\"Start Station Longitude\"": -73.977706,
    "\"End Station ID\"": 3176,
    "\"End Station Name\"": "W 64 St & West End Ave",
    "\"End Station Latitude\"": 40.77452835,
    "\"End Station Longitude\"": -73.98753759,
    "\"Bike ID\"": 23344,
    "\"User Type\"": "Subscriber",
    "\"Birth Year\"": 1968.0,
    "\"Gender\"": 2
  },
  {
    "﻿\"\"\"Trip Duration\"\"\"": 1249,
    "\"Start Time\"": "2016-11-08 16:15:20",
    "\"Stop Time\"": "2016-11-08 16:36:09",
    "\"Start Station ID\"": 501,
    "\"Start Station Name\"": "FDR Drive & E 35 St",
    "\"Start Station Latitude\"": 40.744219,
    "\"Start Station Longitude\"": -73.97121214,
    "\"End Station ID\"": 3135,
    "\"End Station Name\"": "E 75 St & 3 Ave",
    "\"End Station Latitude\"": 40.77112927,
    "\"End Station Longitude\"": -73.95772297,
    "\"Bike ID\"": 17924,
    "\"User Type\"": "Customer",
    "\"Birth Year\"": "",
    "\"Gender\"": 0
  },
  {
    "﻿\"\"\"Trip Duration\"\"\"": 1316,
    "\"Start Time\"": "2016-11-11 13:00:22",
    "\"Stop Time\"": "2016-11-11 13:22:19",
    "\"Start Station ID\"": 3265,
    "\"Start Station Name\"": "E 2 St & 2 Ave",
    "\"Start Station Latitude\"": 40.7245634290432,
    "\"Start Station Longitude\"": -73.9894437789917,
    "\"End Station ID\"": 79,
    "\"End Station Name\"": "Franklin St & W Broadway",
    "\"End Station Latitude\"": 40.71911552,
    "\"End Station Longitude\"": -74.00666661,
    "\"Bike ID\"": 26081,
    "\"User Type\"": "Subscriber",
    "\"Birth Year\"": 1991.0,
    "\"Gender\"": 1
  },
  {
    "﻿\"\"\"Trip Duration\"\"\"": 2419,
    "\"Start Time\"": "2016-11-24 16:55:27",
    "\"Stop Time\"": "2016-11-24 17:35:47",
    "\"Start Station ID\"": 477,
    "\"Start Station Name\"": "W 41 St & 8 Ave",
    "\"Start Station Latitude\"": 40.75640548,
    "\"Start Station Longitude\"": -73.9900262,
    "\"End Station ID\"": 3162,
    "\"End Station Name\"": "W 78 St & Broadway",
    "\"End Station Latitude\"": 40.78339981,
    "\"End Station Longitude\"": -73.98093133,
    "\"Bike ID\"": 26479,
    "\"User Type\"": "Subscriber",
    "\"Birth Year\"": 1990.0,
    "\"Gender\"": 1
  }
]
```

Ensure the application is fully typed in TypeScript and handles the asynchronous data loading gracefully (e.g., showing a loading spinner).

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/TEMP_1o6gr4v0a4irtf1f3ekzg1cc6xxs.csv

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
const rows = await loadCsv("/data/TEMP_1o6gr4v0a4irtf1f3ekzg1cc6xxs.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_3480_3/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Gender Trips by Hour of Day
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.0ujdlxc0lan7461gxy9en0zkpsav].[cnt:Start Station ID:qk]`
- cols_field: `[federated.0ujdlxc0lan7461gxy9en0zkpsav].[hr:Start Time:qk]`
- series_field: `[federated.0ujdlxc0lan7461gxy9en0zkpsav].[none:Gender:nk]`
- zone: x=-197, y=-151, w=51378, h=100904
- legend_required: true
- legend_field: `[federated.0ujdlxc0lan7461gxy9en0zkpsav].[none:Gender:nk]`
- legend_relative_position: overlay
- highlight_fields: [federated.0ujdlxc0lan7461gxy9en0zkpsav].[none:Gender:nk], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[MDY(Start Time) Set], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[cnt:Gender:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[dy:Start Time (copy)_33495564085821443:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[dy:Start Time:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[hr:Start Time:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[io:MDY(Start Time) Set:nk], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[md:Start Time:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[yr:Start Time (copy)_33495564085821443:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[yr:Start Time:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Trips by Day of Month
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.0ujdlxc0lan7461gxy9en0zkpsav].[cnt:Start Station ID:qk]`
- cols_field: `[federated.0ujdlxc0lan7461gxy9en0zkpsav].[dy:Start Time:ok]`
- series_field: `[federated.0ujdlxc0lan7461gxy9en0zkpsav].[wd:Start Time (copy)_33495564085821443:ok]`
- bar_orientation: `vertical`
- zone: x=53445, y=-301, w=46654, h=100753
- legend_required: true
- legend_field: `[federated.0ujdlxc0lan7461gxy9en0zkpsav].[wd:Start Time (copy)_33495564085821443:ok]`
- legend_relative_position: overlay
- highlight_fields: [federated.0ujdlxc0lan7461gxy9en0zkpsav].[wd:Start Time (copy)_33495564085821443:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[MDY(Start Time) Set], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[cnt:Gender:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[cnt:Gender:qk], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[dy:Start Time (copy)_33495564085821443:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[dy:Start Time:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[hr:Start Time:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[io:MDY(Start Time) Set:nk], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[md:Start Time:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[yr:Start Time:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored overlay the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 3 (generated): kind=filter_action, source=Trips by Day of Month, target=Dashboard 3
## Highlight Bindings
- Gender Trips by Hour of Day: [federated.0ujdlxc0lan7461gxy9en0zkpsav].[none:Gender:nk]
- Trips by Day of Month: [federated.0ujdlxc0lan7461gxy9en0zkpsav].[wd:Start Time (copy)_33495564085821443:ok]
- Gender Trips by Hour of Day: [federated.0ujdlxc0lan7461gxy9en0zkpsav].[MDY(Start Time) Set], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[cnt:Gender:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[dy:Start Time (copy)_33495564085821443:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[dy:Start Time:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[hr:Start Time:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[io:MDY(Start Time) Set:nk], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[md:Start Time:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[none:Gender:nk], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[yr:Start Time (copy)_33495564085821443:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[yr:Start Time:ok]
- Trips by Day of Month: [federated.0ujdlxc0lan7461gxy9en0zkpsav].[MDY(Start Time) Set], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[cnt:Gender:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[cnt:Gender:qk], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[dy:Start Time (copy)_33495564085821443:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[dy:Start Time:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[hr:Start Time:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[io:MDY(Start Time) Set:nk], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[md:Start Time:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[wd:Start Time (copy)_33495564085821443:ok], [federated.0ujdlxc0lan7461gxy9en0zkpsav].[yr:Start Time:ok]
