# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard named 'CityBikeChallenege' using React, TypeScript, and Vite. The dashboard analyzes CitiBike trip data for Jersey City in 2020.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7) for visualizations (use primitives like d3-scale, d3-axis, d3-shape, d3-selection)
- CSS Modules or Styled Components for styling (no external UI library required)

## Data Loading

The primary data source is a CSV file located at `/data/TEMP_0du9fqe1d1zge91goeeim12daxpo.csv`.

Implement a data loader utility that fetches this file, parses it, and applies the necessary transformations to match the Tableau calculated fields.

### Data Schema
The CSV contains the following columns:
- `tripduration` (integer)
- `starttime` (datetime string)
- `stoptime` (datetime string)
- `start station id` (integer)
- `start station name` (string)
- `start station latitude` (float)
- `start station longitude` (float)
- `end station id` (integer)
- `end station name` (string)
- `end station latitude` (float)
- `end station longitude` (float)
- `bikeid` (integer)
- `usertype` (string: 'Subscriber' or 'Customer')
- `birth year` (integer)
- `gender` (integer: 0, 1, or 2)

### Data Transformations
You must derive the following fields during the loading process:
1.  **Age**: Calculate as `2021 - birth_year`. Handle potential nulls or invalid years gracefully.
2.  **GenderNames**: Map the `gender` integer to strings:
    - 0 -> "Unknown"
    - 1 -> "Male"
    - 2 -> "Female"

### Fetch Implementation
Use the browser `fetch` API to load the data.

```typescript
// Example utility function
export const loadBikeData = async (): Promise<BikeTrip[]> => {
  const response = await fetch('/data/TEMP_0du9fqe1d1zge91goeeim12daxpo.csv');
  const csvText = await response.text();
  // Use d3-dsv or a custom parser to convert CSV text to JSON
  const data = d3.csvParse(csvText, (d) => {
    // Parse and transform fields here
    return {
      ...d,
      tripduration: +d.tripduration,
      birthYear: +d['birth year'],
      gender: +d.gender,
      // Add derived fields
      age: 2021 - (+d['birth year']),
      genderName: mapGenderToName(+d.gender),
    };
  });
  return data;
};
```

## Sample Data
```json
[
  {
    "﻿\"\"\"tripduration\"\"\"": 790,
    "\"starttime\"": "2020-07-12 08:51:06.836000",
    "\"stoptime\"": "2020-07-12 09:04:17.370000",
    "\"start station id\"": 3205,
    "\"start station name\"": "JC Medical Center",
    "\"start station latitude\"": 40.71653978099194,
    "\"start station longitude\"": -74.0496379137039,
    "\"end station id\"": 3199,
    "\"end station name\"": "Newport Pkwy",
    "\"end station latitude\"": 40.7287448,
    "\"end station longitude\"": -74.0321082,
    "\"bikeid\"": 44694,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1977,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202007-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 468,
    "\"starttime\"": "2020-06-11 07:33:37.916000",
    "\"stoptime\"": "2020-06-11 07:41:26.863000",
    "\"start station id\"": 3278,
    "\"start station name\"": "Monmouth and 6th",
    "\"start station latitude\"": 40.72568548362901,
    "\"start station longitude\"": -74.04879033565521,
    "\"end station id\"": 3792,
    "\"end station name\"": "Columbus Dr at Exchange Pl",
    "\"end station latitude\"": 40.71687,
    "\"end station longitude\"": -74.03281,
    "\"bikeid\"": 42586,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1979,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202006-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 353,
    "\"starttime\"": "2020-07-05 18:08:27.961000",
    "\"stoptime\"": "2020-07-05 18:14:21.413000",
    "\"start station id\"": 3192,
    "\"start station name\"": "Liberty Light Rail",
    "\"start station latitude\"": 40.7112423,
    "\"start station longitude\"": -74.0557013,
    "\"end station id\"": 3205,
    "\"end station name\"": "JC Medical Center",
    "\"end station latitude\"": 40.71653978099194,
    "\"end station longitude\"": -74.0496379137039,
    "\"bikeid\"": 44543,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1958,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202007-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 2399,
    "\"starttime\"": "2020-09-05 15:25:53.556000",
    "\"stoptime\"": "2020-09-05 16:05:53.506000",
    "\"start station id\"": 3638,
    "\"start station name\"": "Washington St",
    "\"start station latitude\"": 40.7242941,
    "\"start station longitude\"": -74.0354826,
    "\"end station id\"": 3276,
    "\"end station name\"": "Marin Light Rail",
    "\"end station latitude\"": 40.71458403535893,
    "\"end station longitude\"": -74.04281705617905,
    "\"bikeid\"": 43098,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1993,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202009-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 2421,
    "\"starttime\"": "2020-07-06 18:28:43.130000",
    "\"stoptime\"": "2020-07-06 19:09:04.687000",
    "\"start station id\"": 3205,
    "\"start station name\"": "JC Medical Center",
    "\"start station latitude\"": 40.71653978099194,
    "\"start station longitude\"": -74.0496379137039,
    "\"end station id\"": 3205,
    "\"end station name\"": "JC Medical Center",
    "\"end station latitude\"": 40.71653978099194,
    "\"end station longitude\"": -74.0496379137039,
    "\"bikeid\"": 42583,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1991,
    "\"gender\"": 2,
    "\"Table Name\"": "JC-202007-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 372,
    "\"starttime\"": "2020-09-10 13:04:15.782000",
    "\"stoptime\"": "2020-09-10 13:10:27.887000",
    "\"start station id\"": 3681,
    "\"start station name\"": "Grand St",
    "\"start station latitude\"": 40.71517767732029,
    "\"start station longitude\"": -74.03768330812454,
    "\"end station id\"": 3681,
    "\"end station name\"": "Grand St",
    "\"end station latitude\"": 40.71517767732029,
    "\"end station longitude\"": -74.03768330812454,
    "\"bikeid\"": 40207,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1985,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202009-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 2318,
    "\"starttime\"": "2020-12-06 11:23:36.449000",
    "\"stoptime\"": "2020-12-06 12:02:15.140000",
    "\"start station id\"": 3214,
    "\"start station name\"": "Essex Light Rail",
    "\"start station latitude\"": 40.7127742,
    "\"start station longitude\"": -74.0364857,
    "\"end station id\"": 3185,
    "\"end station name\"": "City Hall",
    "\"end station latitude\"": 40.7177325,
    "\"end station longitude\"": -74.043845,
    "\"bikeid\"": 46529,
    "\"usertype\"": "Customer",
    "\"birth year\"": 1969,
    "\"gender\"": 0,
    "\"Table Name\"": "JC-202012-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 325,
    "\"starttime\"": "2020-07-15 19:31:01.023000",
    "\"stoptime\"": "2020-07-15 19:36:26.473000",
    "\"start station id\"": 3213,
    "\"start station name\"": "Van Vorst Park",
    "\"start station latitude\"": 40.71848892,
    "\"start station longitude\"": -74.047726625,
    "\"end station id\"": 3192,
    "\"end station name\"": "Liberty Light Rail",
    "\"end station latitude\"": 40.7112423,
    "\"end station longitude\"": -74.0557013,
    "\"bikeid\"": 42609,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1988,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202007-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 1496,
    "\"starttime\"": "2020-03-15 15:47:33.254000",
    "\"stoptime\"": "2020-03-15 16:12:29.807000",
    "\"start station id\"": 3638,
    "\"start station name\"": "Washington St",
    "\"start station latitude\"": 40.7242941,
    "\"start station longitude\"": -74.0354826,
    "\"end station id\"": 3205,
    "\"end station name\"": "JC Medical Center",
    "\"end station latitude\"": 40.71653978099194,
    "\"end station longitude\"": -74.0496379137039,
    "\"bikeid\"": 42177,
    "\"usertype\"": "Customer",
    "\"birth year\"": 1990,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202003-citibike-tripdata.csv"
  },
  {
    "﻿\"\"\"tripduration\"\"\"": 303,
    "\"starttime\"": "2020-02-19 07:23:55.274000",
    "\"stoptime\"": "2020-02-19 07:28:59.013000",
    "\"start station id\"": 3203,
    "\"start station name\"": "Hamilton Park",
    "\"start station latitude\"": 40.727595966,
    "\"start station longitude\"": -74.044247311,
    "\"end station id\"": 3202,
    "\"end station name\"": "Newport PATH",
    "\"end station latitude\"": 40.7272235,
    "\"end station longitude\"": -74.0337589,
    "\"bikeid\"": 42496,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1993,
    "\"gender\"": 1,
    "\"Table Name\"": "JC-202002-citibike-tripdata.csv"
  }
]
```

## Dashboard Layout
The main dashboard is referred to as `Dashboard-usertype` in the workbook. It should contain at least the following two worksheets arranged in a responsive grid (e.g., side-by-side on desktop, stacked on mobile).

1.  **Usertype by age** (Left/Top)
2.  **Usertype by gender** (Right/Bottom)

## Component Specifications

### 1. UsertypeByAge Chart
- **Type:** Horizontal Bar Chart
- **Data Source:** Full dataset, aggregated by `usertype`.
- **Visual Encodings:**
    - **Y-Axis:** `usertype` (Dimension: 'Subscriber', 'Customer')
    - **X-Axis:** Average of `Age` (Measure)
    - **Color:** Encoded by `usertype`.
        - Subscriber: `#e15759`
        - Customer: `#edc948`
- **Interactions:**
    - Clicking a bar triggers a global filter action (Action4) to filter the dashboard by the selected `usertype`.

### 2. UsertypeByGender Chart
- **Type:** Horizontal Bar Chart (or Stacked Bar if multiple measures are present, but based on the 'Usertype by gender' name, assume Rows=Gender, Columns=Count).
- **Data Source:** Full dataset, aggregated by `GenderNames`.
- **Visual Encodings:**
    - **Y-Axis:** `GenderNames` (Dimension: 'Unknown', 'Male', 'Female')
    - **X-Axis:** Count of Records (Measure)
    - **Color:** Encoded by `GenderNames`.
        - Unknown: `#59a14f`
        - Female: `#b07aa1`
        - Male: `#f28e2b`
- **Interactions:**
    - This chart should respond to the filter action from `UsertypeByAge`. If 'Subscriber' is selected in the Age chart, this chart should update to show only data for Subscribers.

## Interactions & State Management
- Implement a global state context or prop drilling to handle the `activeFilters`.
- The filter logic defined in the workbook is `Action (GenderNames,usertype)`. This implies that selecting a `usertype` in one chart filters the data in the other.
- When a filter is active, the charts must re-calculate their aggregates (Avg Age, Count) based on the filtered subset of data.

## Styling
- Use a clean, sans-serif font (e.g., Inter, system-ui).
- Maintain whitespace similar to a standard Tableau dashboard (padding between sheets).
- Ensure axes are clearly labeled with the dimension/measure names.
- Tooltips should display the specific values (e.g., "Subscriber: Avg Age 42.5") on hover.

## Implementation Notes
- Do not use high-level chart libraries (like Recharts or Nivo). Use D3.js to generate SVG elements directly or via `d3-selection` within React `useEffect` hooks.
- Ensure the application handles the asynchronous data loading state (show a loading spinner or skeleton screen).
- The workbook uses a specific color palette defined in the `<style>` section; adhere strictly to the hex codes provided above.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_3980_4/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Usertype by age
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.1uacfzz159odbl1dth55b0zhj2kp].[none:usertype:nk]`
- cols_field: `[federated.1uacfzz159odbl1dth55b0zhj2kp].[avg:Calculation_1234830743585095680:qk]`
- series_field: `[federated.1uacfzz159odbl1dth55b0zhj2kp].[none:usertype:nk]`
- bar_orientation: `horizontal`
- zone: x=1231, y=1103, w=97538, h=27587
- highlight_fields: [federated.1uacfzz159odbl1dth55b0zhj2kp].[none:usertype:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Usertype by gender
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1uacfzz159odbl1dth55b0zhj2kp].[__tableau_internal_object_id__].[cnt:_6A3F8AF9D57442BFAC88113923A51491:qk]`
- cols_field: `([federated.1uacfzz159odbl1dth55b0zhj2kp].[none:usertype:nk] / [federated.1uacfzz159odbl1dth55b0zhj2kp].[none:Calculation_1049057258591756288:nk])`
- series_field: `[federated.1uacfzz159odbl1dth55b0zhj2kp].[none:Calculation_1049057258591756288:nk]`
- bar_orientation: `vertical`
- zone: x=1231, y=28690, w=97538, h=70207
- highlight_fields: [federated.1uacfzz159odbl1dth55b0zhj2kp].[none:Calculation_1049057258591756288:nk], [federated.1uacfzz159odbl1dth55b0zhj2kp].[none:usertype:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter3: kind=filter_action, source=Dashboard-usertype, target=Dashboard-usertype
## Highlight Bindings
- Usertype by age: [federated.1uacfzz159odbl1dth55b0zhj2kp].[none:usertype:nk]
- Usertype by gender: [federated.1uacfzz159odbl1dth55b0zhj2kp].[none:Calculation_1049057258591756288:nk], [federated.1uacfzz159odbl1dth55b0zhj2kp].[none:usertype:nk]
