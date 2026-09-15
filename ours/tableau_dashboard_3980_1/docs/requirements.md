# Project Requirements

You are a senior React engineer tasked with recreating a specific Tableau dashboard.

**Objective:**
Recreate the Tableau dashboard "Dashboard-Start&End time" using React, TypeScript, and Vite. The dashboard visualizes CitiBike trip data to analyze peak usage hours.

**Tech Stack:**
- React 18+
- TypeScript
- Vite
- D3.js (v7 or later) for visualizations (use primitives like d3-scale, d3-axis, d3-selection, d3-array).
- d3-dsv for CSV parsing.
- CSS Modules or Styled Components for styling (no external UI library required).

**Data Source:**
- The data is located at `/data/TEMP_0du9fqe1d1zge91goeeim12daxpo.csv`.
- This file contains the union of monthly CitiBike trip data.

**Data Loading & Parsing:**
1. Create a utility function `useCitiBikeData` that fetches the CSV using the native `fetch` API.
2. Use `d3.csvParse` to parse the raw text.
3. Type cast the columns:
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
   - `gender`: number (0=Unknown, 1=Male, 2=Female)

**Calculated Fields (Data Transformation):**
After loading, augment the data with the following calculated fields:
1. `GenderNames`: string -> `case gender when 0 then "Unknown" when 1 then "Male" when 2 then "Female" END`
2. `Age`: number -> `2021 - birth year`
3. `Distance`: number (miles) -> Haversine formula: `3959 * acos(sin(radians(start_lat)) * sin(radians(end_lat)) + cos(radians(start_lat)) * cos(radians(end_lat)) * cos(radians(end_long) - radians(start_long)))`

**Dashboard Layout:**
- Create a main component `DashboardStartEndTime`.
- Use CSS Grid to create a layout with two main sections side-by-side (responsive: stack on mobile).
- **Left Panel:** Worksheet "Peak hours for trip start".
- **Right Panel:** Worksheet "Peak hours for trip end".

**Worksheet 1: Peak hours for trip start**
- **Component:** `PeakHoursChart`
- **Props:** `data` (all trips), `type` ('start' | 'end'), `title`.
- **Visual Encoding:**
  - **Mark Type:** Bar (Automatic in Tableau, effectively Bar).
  - **X-Axis:** `HOUR(starttime)` (0 to 23). Label: "HOUR(starttime)".
  - **Y-Axis:** `Count` of records. Label: "Number of Records".
  - **Color:** `#ffaa00` (Orange).
  - **Labels:** Show data labels (the count) on top of the bars.
- **Implementation Details:**
  - Aggregate data: Group by hour (0-23) and count occurrences.
  - Use `d3.scaleBand` for X and `d3.scaleLinear` for Y.
  - Render SVG `rect` elements for bars.

**Worksheet 2: Peak hours for trip end**
- **Component:** `PeakHoursChart` (Reuse the same component).
- **Props:** `data` (all trips), `type`='end', `title`="Peak hours for trip end".
- **Visual Encoding:**
  - **Mark Type:** Bar.
  - **X-Axis:** `HOUR(stoptime)` (0 to 23). Label: "HOUR(stoptime)".
  - **Y-Axis:** `Count` of records. Label: "Number of Records".
  - **Color:** `#ffaa00` (Orange).
  - **Labels:** Show data labels on top of bars.

**Interactions:**
- **Highlight Action:** The Tableau workbook defines a "Highlight" action on hover.
- **React Implementation:**
  - State: `hoveredHour` (number | null) in the parent Dashboard component.
  - Event: When hovering a bar in the "Start" chart, update `hoveredHour`.
  - Effect: Pass `hoveredHour` to both charts. If a chart's bar matches `hoveredHour`, reduce opacity of non-matching bars or highlight the matching bar visually (e.g., stroke or brightness).

**Styling:**
- Keep the background clean (white or light gray).
- Ensure fonts are sans-serif (e.g., Arial, Helvetica, system-ui).
- Match axis titles and labels to the Tableau specification.

**Sample Data:**
```json
[
  {
    "﻿\"\"\"tripduration\"\"\"": 195,
    "\"starttime\"": "2020-02-04 20:11:35.591000",
    "\"stoptime\"": "2020-02-04 20:14:51.132000",
    "\"start station id\"": 3186,
    "\"start station name\"": "Grove St PATH",
    "\"start station latitude\"": 40.71958611647166,
    "\"start station longitude\"": -74.04311746358871,
    "\"end station id\"": 3270,
    "\"end station name\"": "Jersey & 6th St",
    "\"end station latitude\"": 40.72528910781132,
    "\"end station longitude\"": -74.04557168483734,
    "\"bikeid\"": 29279,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1983,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202002-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 4690,
    "\"starttime\"": "2020-05-02 17:36:03.599000",
    "\"stoptime\"": "2020-05-02 18:54:14.445000",
    "\"start station id\"": 3681,
    "\"start station name\"": "Grand St",
    "\"start station latitude\"": 40.71517767732029,
    "\"start station longitude\"": -74.03768330812454,
    "\"end station id\"": 3211,
    "\"end station name\"": "Newark Ave",
    "\"end station latitude\"": 40.72152515,
    "\"end station longitude\"": -74.046304543,
    "\"bikeid\"": 42177,
    "\"usertype\"": "Customer",
    "\"birth year\"": 1985,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202005-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 550,
    "\"starttime\"": "2020-10-08 00:08:35.870000",
    "\"stoptime\"": "2020-10-08 00:17:46.100000",
    "\"start station id\"": 3186,
    "\"start station name\"": "Grove St PATH",
    "\"start station latitude\"": 40.71958611647166,
    "\"start station longitude\"": -74.04311746358871,
    "\"end station id\"": 3192,
    "\"end station name\"": "Liberty Light Rail",
    "\"end station latitude\"": 40.7112423,
    "\"end station longitude\"": -74.0557013,
    "\"bikeid\"": 44345,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1992,
    "\"gender\"": 0,
    "\"Table Name\"": "JC-202010-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 369,
    "\"starttime\"": "2020-10-07 13:20:43.506000",
    "\"stoptime\"": "2020-10-07 13:26:52.951000",
    "\"start station id\"": 3202,
    "\"start station name\"": "Newport PATH",
    "\"start station latitude\"": 40.7272235,
    "\"start station longitude\"": -74.0337589,
    "\"end station id\"": 3681,
    "\"end station name\"": "Grand St",
    "\"end station latitude\"": 40.71517767732029,
    "\"end station longitude\"": -74.03768330812454,
    "\"bikeid\"": 43974,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1985,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202009-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 2696,
    "\"starttime\"": "2020-07-05 18:46:58.861000",
    "\"stoptime\"": "2020-07-05 19:31:54.996000",
    "\"start station id\"": 3267,
    "\"start station name\"": "Morris Canal",
    "\"start station latitude\"": 40.7124188237569,
    "\"start station longitude\"": -74.03852552175522,
    "\"end station id\"": 3638,
    "\"end station name\"": "Washington St",
    "\"end station latitude\"": 40.7242941,
    "\"end station longitude\"": -74.0354826,
    "\"bikeid\"": 42518,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1986,
    "\"gender\"": 2,
    "\"Table Name\"": "JC-202007-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 458,
    "\"starttime\"": "2020-11-14 22:22:15.594000",
    "\"stoptime\"": "2020-11-14 22:29:54.371000",
    "\"start station id\"": 3186,
    "\"start station name\"": "Grove St PATH",
    "\"start station latitude\"": 40.71958611647166,
    "\"start station longitude\"": -74.04311746358871,
    "\"end station id\"": 3192,
    "\"end station name\"": "Liberty Light Rail",
    "\"end station latitude\"": 40.7112423,
    "\"end station longitude\"": -74.0557013,
    "\"bikeid\"": 40517,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1983,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202011-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 142,
    "\"starttime\"": "2020-01-19 18:46:04.230000",
    "\"stoptime\"": "2020-01-19 18:48:26.894000",
    "\"start station id\"": 3278,
    "\"start station name\"": "Monmouth and 6th",
    "\"start station latitude\"": 40.72568548362901,
    "\"start station longitude\"": -74.04879033565521,
    "\"end station id\"": 3272,
    "\"end station name\"": "Jersey & 3rd",
    "\"end station latitude\"": 40.72333158646436,
    "\"end station longitude\"": -74.04595255851744,
    "\"bikeid\"": 29255,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1987,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202001-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 594,
    "\"starttime\"": "2020-04-25 11:09:30.687000",
    "\"stoptime\"": "2020-04-25 11:19:25.531000",
    "\"start station id\"": 3640,
    "\"start station name\"": "Journal Square",
    "\"start station latitude\"": 40.733670000000004,
    "\"start station longitude\"": -74.0625,
    "\"end station id\"": 3206,
    "\"end station name\"": "Hilltop",
    "\"end station latitude\"": 40.7311689,
    "\"end station longitude\"": -74.0575736,
    "\"bikeid\"": 42322,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1969,
    "\"gender\"": 0,
    "\"Table Name\"": "JC-202004-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 876,
    "\"starttime\"": "2020-08-03 09:24:57.248000",
    "\"stoptime\"": "2020-08-03 09:39:33.881000",
    "\"start station id\"": 3679,
    "\"start station name\"": "Bergen Ave",
    "\"start station latitude\"": 40.722103786686034,
    "\"start station longitude\"": -74.07145500183105,
    "\"end station id\"": 3214,
    "\"end station name\"": "Essex Light Rail",
    "\"end station latitude\"": 40.7127742,
    "\"end station longitude\"": -74.0364857,
    "\"bikeid\"": 42240,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1975,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202008-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 1660,
    "\"starttime\"": "2020-05-19 20:06:03.273000",
    "\"stoptime\"": "2020-05-19 20:33:43.318000",
    "\"start station id\"": 3276,
    "\"start station name\"": "Marin Light Rail",
    "\"start station latitude\"": 40.71458403535893,
    "\"start station longitude\"": -74.04281705617905,
    "\"end station id\"": 3276,
    "\"end station name\"": "Marin Light Rail",
    "\"end station latitude\"": 40.71458403535893,
    "\"end station longitude\"": -74.04281705617905,
    "\"bikeid\"": 42430,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1986,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202005-citibike-tripdata.csv"
  }
]
```

**Deliverables:**
1. `src/types.ts`: Data interfaces.
2. `src/utils/data.ts`: Data fetching and parsing logic.
3. `src/components/PeakHoursChart.tsx`: The D3 bar chart component.
4. `src/Dashboard.tsx`: The main layout container.
5. `src/App.tsx`: Entry point.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/TEMP_0du9fqe1d1zge91goeeim12daxpo.csv

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
const rows = await loadCsv("/data/TEMP_0du9fqe1d1zge91goeeim12daxpo.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_3980_1/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Peak hours for trip end
- chart_intent: `line_chart`
- rows_field: `[federated.1uacfzz159odbl1dth55b0zhj2kp].[__tableau_internal_object_id__].[cnt:_6A3F8AF9D57442BFAC88113923A51491:qk]`
- cols_field: `[federated.1uacfzz159odbl1dth55b0zhj2kp].[hr:stoptime:ok]`
- axis_title_rows: Number of Records
- zone: x=1231, y=50000, w=97538, h=48897
- highlight_fields: [federated.1uacfzz159odbl1dth55b0zhj2kp].[yr:stoptime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Peak hours for trip start
- chart_intent: `line_chart`
- rows_field: `[federated.1uacfzz159odbl1dth55b0zhj2kp].[__tableau_internal_object_id__].[cnt:_6A3F8AF9D57442BFAC88113923A51491:qk]`
- cols_field: `[federated.1uacfzz159odbl1dth55b0zhj2kp].[hr:starttime:ok]`
- axis_title_rows: Number of Records
- zone: x=1231, y=1103, w=97538, h=48897
- highlight_fields: [federated.1uacfzz159odbl1dth55b0zhj2kp].[none:starttime:qk], [federated.1uacfzz159odbl1dth55b0zhj2kp].[yr:starttime:ok], [federated.1uacfzz159odbl1dth55b0zhj2kp].[yr:stoptime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Highlight1: kind=highlight_brush, source=Dashboard-Start&End time, target=Dashboard-Start&End time
## Highlight Bindings
- Peak hours for trip start: [federated.1uacfzz159odbl1dth55b0zhj2kp].[none:starttime:qk], [federated.1uacfzz159odbl1dth55b0zhj2kp].[yr:starttime:ok], [federated.1uacfzz159odbl1dth55b0zhj2kp].[yr:stoptime:ok]
- Peak hours for trip end: [federated.1uacfzz159odbl1dth55b0zhj2kp].[yr:stoptime:ok]
