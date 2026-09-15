# Project Requirements

You are an expert React developer. Your task is to implement a dashboard based on the following specification.

## Project Overview
Recreate the 'EndStation' dashboard from the provided Tableau workbook. The dashboard visualizes Citi Bike trip data, focusing on End Stations.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7 or newer) for visualizations (use `d3-scale`, `d3-axis`, `d3-shape`, `d3-array`, `d3-selection`).
- CSS for layout (CSS Grid/Flexbox).
- No external UI component libraries (e.g., Ant Design) unless necessary for basic layout.

## Data Loading
The data consists of 12 CSV files (Jan 2017 - Dec 2017) located in the `public/data` directory.

1.  **Fetch Strategy**: Create a utility function `loadData` that iterates through the list of provided file URLs and fetches them concurrently or sequentially.
2.  **Parsing**: Use `d3-dsv` (d3.csvParse) to parse the CSV strings.
3.  **Normalization**: The source files have inconsistent headers (e.g., 'Trip Duration' vs 'tripduration', 'Start Station Name' vs 'start station name'). You must implement a normalization step to map all rows to a consistent TypeScript interface:
    ```typescript
    interface TripData {
      tripDuration: number;
      startTime: Date;
      stopTime: Date;
      startStationId: number;
      startStationName: string;
      startStationLatitude: number;
      startStationLongitude: number;
      endStationId: number;
      endStationName: string;
      endStationLatitude: number;
      endStationLongitude: number;
      bikeId: number;
      userType: string;
      birthYear: number;
      gender: number; // 0=Unknown, 1=Male, 2=Female
    }
    ```
4.  **Filtering**: Exclude any records where `endStationLatitude` and `endStationLongitude` are both 0 (as defined in the workbook filter 'Exclusions').

## Component Architecture

### 1. `App.tsx`
- **State**: `trips: TripData[]`, `selectedStation: string | null`.
- **Effect**: Fetch data on mount using the `loadData` utility.
- **Layout**: A CSS Grid container representing the dashboard.
- **Interactions**: Pass `setSelectedStation` to the Map component. Pass `selectedStation` to the Bar Charts.

### 2. `EndStationMap.tsx`
- **Props**: `data: TripData[]`, `onStationClick: (name: string) => void`, `selectedStation: string | null`.
- **Visualization**: Scatter Plot (Symbol Map).
- **Encoding**:
  - **X-Axis**: `endStationLongitude` (Linear Scale). Domain: Auto-fit to data, roughly [-74.1, -74.0].
  - **Y-Axis**: `endStationLatitude` (Linear Scale). Domain: Auto-fit to data, roughly [40.7, 40.75].
  - **Marks**: Circles.
  - **Size**: Encodes the count of trips ending at that station (Radius scale).
  - **Color**: Encodes the count of trips (Sequential color scale, Orange palette). Base color: `#f28e2b`.
  - **Labels**: Show `endStationName` for marks. Use D3 label collision detection or simple opacity culling to prevent overlap.
- **Interaction**: Click event on a circle updates the global `selectedStation` state. Highlight the selected station visually (e.g., stroke or opacity).

### 3. `StationBarChart.tsx`
- **Props**: `data: TripData[]`, `selectedStation: string | null`, `variant: 'top' | 'bottom'`.
- **Logic**:
  - Filter `data` based on `selectedStation` (if provided). If a station is selected, the chart should show only that station's data or maintain the Top/10 logic within the filtered context. *Note: In Tableau, filtering a dimension usually filters the view. We will implement it such that if a station is selected, the chart shows that specific station's bar.*
  - Aggregate data: Group by `endStationName` and count records.
  - Sort:
    - If `variant === 'top'`: Sort Descending by count, take Top 10.
    - If `variant === 'bottom'`: Sort Ascending by count, take Bottom 10.
- **Visualization**: Horizontal Bar Chart.
- **Encoding**:
  - **X-Axis**: Count of Records (Linear Scale).
  - **Y-Axis**: `endStationName` (Band Scale).
  - **Color**:
    - If `variant === 'top'`: Fill `#f28e2b`. Background `#f5ead7`.
    - If `variant === 'bottom'`: Fill `#ffbe7d`. Background `#faf5f0`.

## Layout Specification (CSS Grid)
The dashboard 'EndStation' uses a tiled layout. Approximate proportions:
- **Container**: Fixed aspect ratio or responsive container (e.g., 1000x800px base).
- **Row 1 (Top)**: 'End Station Map'. Height: ~55%. Width: 100%.
- **Row 2 (Bottom)**: Split into two columns.
  - **Left**: 'Trips by End Station-Top 10'. Width: ~45%.
  - **Right**: 'Trips by End Station-Bottom 10'. Width: ~55%.

## Styling Details
- **Fonts**: Sans-serif (Arial, Helvetica, system-ui).
- **Colors**:
  - Primary Orange: `#f28e2b`
  - Secondary Orange: `#ffbe7d`
  - Background Top Chart: `#f5ead7`
  - Background Bottom Chart: `#faf5f0`
  - Text: `#333333`
- **Titles**: Preserve exact text from workbook:
  - "End Station Map"
  - "Trips by End Station-Top 10"
  - "Trips by End Station-Bottom 10"

## Sample Data
```json
[
  {
    "tripduration": 630,
    "starttime": "2017-08-04 19:52:51",
    "stoptime": "2017-08-04 20:03:21",
    "start station id": 3187,
    "start station name": "Warren St",
    "start station latitude": 40.7211236,
    "start station longitude": -74.03805095,
    "end station id": 3276,
    "end station name": "Marin Light Rail",
    "end station latitude": 40.71458403535893,
    "end station longitude": -74.04281705617905,
    "bikeid": 29540,
    "usertype": "Subscriber",
    "birth year": 1989,
    "gender": 1
  },
  {
    "tripduration": 514,
    "starttime": "2017-08-22 11:56:43",
    "stoptime": "2017-08-22 12:05:17",
    "start station id": 3267,
    "start station name": "Morris Canal",
    "start station latitude": 40.7124188237569,
    "start station longitude": -74.03852552175522,
    "end station id": 3184,
    "end station name": "Paulus Hook",
    "end station latitude": 40.7141454,
    "end station longitude": -74.0335519,
    "bikeid": 29656,
    "usertype": "Subscriber",
    "birth year": 1976,
    "gender": 1
  },
  {
    "tripduration": 696,
    "starttime": "2017-08-01 20:25:47",
    "stoptime": "2017-08-01 20:37:23",
    "start station id": 3211,
    "start station name": "Newark Ave",
    "start station latitude": 40.72152515,
    "start station longitude": -74.046304543,
    "end station id": 3194,
    "end station name": "McGinley Square",
    "end station latitude": 40.7253399253558,
    "end station longitude": -74.06762212514877,
    "bikeid": 26305,
    "usertype": "Subscriber",
    "birth year": 1982,
    "gender": 2
  },
  {
    "tripduration": 357,
    "starttime": "2017-08-26 22:04:33",
    "stoptime": "2017-08-26 22:10:31",
    "start station id": 3183,
    "start station name": "Exchange Place",
    "start station latitude": 40.7162469,
    "start station longitude": -74.0334588,
    "end station id": 3267,
    "end station name": "Morris Canal",
    "end station latitude": 40.7124188237569,
    "end station longitude": -74.03852552175522,
    "bikeid": 29548,
    "usertype": "Subscriber",
    "birth year": 1977,
    "gender": 1
  },
  {
    "tripduration": 178,
    "starttime": "2017-08-03 08:17:30",
    "stoptime": "2017-08-03 08:20:28",
    "start station id": 3279,
    "start station name": "Dixon Mills",
    "start station latitude": 40.721630142638354,
    "start station longitude": -74.04996782541275,
    "end station id": 3186,
    "end station name": "Grove St PATH",
    "end station latitude": 40.71958611647166,
    "end station longitude": -74.04311746358871,
    "bikeid": 29217,
    "usertype": "Subscriber",
    "birth year": 1976,
    "gender": 0
  },
  {
    "tripduration": 2073,
    "starttime": "2017-08-06 16:32:58",
    "stoptime": "2017-08-06 17:07:32",
    "start station id": 3210,
    "start station name": "Pershing Field",
    "start station latitude": 40.742677141,
    "start station longitude": -74.051788633,
    "end station id": 3187,
    "end station name": "Warren St",
    "end station latitude": 40.7211236,
    "end station longitude": -74.03805095,
    "bikeid": 29681,
    "usertype": "Subscriber",
    "birth year": 1968,
    "gender": 1
  },
  {
    "tripduration": 165,
    "starttime": "2017-08-28 06:56:29",
    "stoptime": "2017-08-28 06:59:15",
    "start station id": 3267,
    "start station name": "Morris Canal",
    "start station latitude": 40.7124188237569,
    "start station longitude": -74.03852552175522,
    "end station id": 3184,
    "end station name": "Paulus Hook",
    "end station latitude": 40.7141454,
    "end station longitude": -74.0335519,
    "bikeid": 29474,
    "usertype": "Subscriber",
    "birth year": 1980,
    "gender": 1
  },
  {
    "tripduration": 178,
    "starttime": "2017-08-30 07:21:44",
    "stoptime": "2017-08-30 07:24:43",
    "start station id": 3267,
    "start station name": "Morris Canal",
    "start station latitude": 40.7124188237569,
    "start station longitude": -74.03852552175522,
    "end station id": 3183,
    "end station name": "Exchange Place",
    "end station latitude": 40.7162469,
    "end station longitude": -74.0334588,
    "bikeid": 26304,
    "usertype": "Subscriber",
    "birth year": 1992,
    "gender": 1
  },
  {
    "tripduration": 236,
    "starttime": "2017-08-08 11:08:56",
    "stoptime": "2017-08-08 11:12:52",
    "start station id": 3203,
    "start station name": "Hamilton Park",
    "start station latitude": 40.727595966,
    "start station longitude": -74.044247311,
    "end station id": 3186,
    "end station name": "Grove St PATH",
    "end station latitude": 40.71958611647166,
    "end station longitude": -74.04311746358871,
    "bikeid": 26159,
    "usertype": "Subscriber",
    "birth year": 1968,
    "gender": 1
  },
  {
    "tripduration": 270,
    "starttime": "2017-08-02 08:17:34",
    "stoptime": "2017-08-02 08:22:04",
    "start station id": 3194,
    "start station name": "McGinley Square",
    "start station latitude": 40.7253399253558,
    "start station longitude": -74.06762212514877,
    "end station id": 3195,
    "end station name": "Sip Ave",
    "end station latitude": 40.73074262530658,
    "end station longitude": -74.06378388404846,
    "bikeid": 29532,
    "usertype": "Subscriber",
    "birth year": 1984,
    "gender": 1
  }
]
```

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/JC-201701-citibike-tripdata.csv
- /data/JC-201702-citibike-tripdata.csv
- /data/JC-201703-citibike-tripdata.csv
- /data/JC-201704-citibike-tripdata.csv
- /data/JC-201705-citibike-tripdata.csv
- /data/JC-201706-citibike-tripdata.csv
- /data/JC-201707-citibike-tripdata.csv
- /data/JC-201708 citibike-tripdata.csv
- /data/JC-201709-citibike-tripdata.csv
- /data/JC-201710-citibike-tripdata.csv
- /data/JC-201711-citibike-tripdata.csv
- /data/JC-201712-citibike-tripdata.csv

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
const rows = await loadCsv("/data/JC-201708 citibike-tripdata.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_147_1/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: End Station Map
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Latitude:qk]`
- cols_field: `[federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Longitude:qk]`
- series_field: `[federated.01dkfvi1fptbes1h4mzna02djglj].[sum:Number of Records:qk]`
- bar_orientation: `horizontal`
- zone: x=2700, y=1875, w=82200, h=45000
- highlight_fields: [federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Latitude:qk], [federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Longitude:qk], [federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Trips by End Station-Bottom 10
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Name:nk]`
- cols_field: `[federated.01dkfvi1fptbes1h4mzna02djglj].[sum:Number of Records:qk]`
- series_field: `[federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Name:nk]`
- bar_orientation: `horizontal`
- zone: x=41100, y=43875, w=41000, h=39500
- highlight_fields: [federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Name:nk], [federated.01dkfvi1fptbes1h4mzna02djglj].[none:Start Station Name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Trips by End Station-Top 10
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Name:nk]`
- cols_field: `[federated.01dkfvi1fptbes1h4mzna02djglj].[sum:Number of Records:qk]`
- series_field: `[federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Name:nk]`
- bar_orientation: `horizontal`
- zone: x=2800, y=43375, w=32700, h=41500
- highlight_fields: [federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Name:nk], [federated.01dkfvi1fptbes1h4mzna02djglj].[none:Start Station Name:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter1 1: kind=filter_action, source=EndStation, target=EndStation
## Highlight Bindings
- End Station Map: [federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Latitude:qk], [federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Longitude:qk], [federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Name:nk]
- Trips by End Station-Bottom 10: [federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Name:nk], [federated.01dkfvi1fptbes1h4mzna02djglj].[none:Start Station Name:nk]
- Trips by End Station-Top 10: [federated.01dkfvi1fptbes1h4mzna02djglj].[none:End Station Name:nk], [federated.01dkfvi1fptbes1h4mzna02djglj].[none:Start Station Name:nk]
