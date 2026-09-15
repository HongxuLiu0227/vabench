# Project Requirements

You are a senior React engineer tasked with recreating a specific Tableau dashboard ('Dashboard2') using React, TypeScript, and Vite. You must use D3.js (d3-scale, d3-shape, d3-axis, d3-array, d3-selection) for all visualizations. Do not use high-level chart libraries like Recharts or Nivo.

## 1. Data Loading

The application must load data from `/data/DfTRoadSafety_Accidents_2014.csv`.

- Use `d3-dsv` (or native fetch + parsing) to load the CSV.
- Create a TypeScript interface `AccidentRecord` representing the columns in the CSV (e.g., `Accident_Index`, `Longitude`, `Latitude`, `Weather_Conditions`, `Speed_limit`, `Light_Conditions`, `Road_Surface_Conditions`, `Number_of_Casualties`, etc.).
- Implement a `useData` hook that fetches the data, parses it, and returns the typed array.
- Handle data cleaning: Map raw codes to human-readable aliases based on the Tableau XML definitions (e.g., `Weather_Conditions` "1" -> "Fine No High winds", "2" -> "Raining No High winds").

## 2. Global State & Interactions

- Use React Context (`DashboardContext`) to manage the global filter state.
- **Interaction:** Implement a "Filter Action". When a user clicks a bar/mark in any chart, the dashboard should filter all other charts by the selected `Weather_Conditions`. Clicking the same item again or the background should clear the filter.
- The context should expose `data` (full dataset), `filteredData` (dataset based on current selection), and `setWeatherFilter`.

## 3. Layout & Styling

- **Dashboard Container:** Use CSS Grid to replicate the layout defined in the Tableau XML.
- **Background Color:** The dashboard background must be `#ffe791`.
- **Grid Structure:**
  - Columns: `1fr 1fr 160px` (Left Charts, Right Charts, Sidebar).
  - Rows: `auto 1fr 1fr` (Title, Top Section, Bottom Section).
  - **Title Area:** Spans full width. Text: "Impact of Weather on Number of Accidents". Color: `#ff0000`. Font-weight: Bold.
  - **Top Left (Q2_Weather):** Row 2, Col 1.
  - **Top Right (sheet13):** Row 2, Col 2.
  - **Bottom (Sheet 28):** Row 3, Col 1 / Col 2 (span 2).
  - **Sidebar:** Row 2 / Row 3, Col 3. Contains legends.

## 4. Component Specifications

### Component: `Q2_Weather`
- **Title:** "No. of Accidents in different Weather conditions" (Color: `#0b2255`).
- **Chart Type:** Vertical Bar Chart.
- **Data:** Group by `Weather_Conditions`. Count records (`SUM([Number of Records])`).
- **Axes:**
  - X: `Weather_Conditions` (Band Scale). Sort Descending by count.
  - Y: Count (Linear Scale).
- **Visuals:**
  - Bars: Color `#1f77b4` (or a distinct blue).
  - Annotation: Add a text overlay near the top of the chart: "Most accidents occured in Fine no high wind condition".
- **Interaction:** Click bar -> Trigger `setWeatherFilter`.

### Component: `Sheet 28`
- **Title:** "Effect of Light condition, Speed and Weather on Number of Accidents" (Color: `#0b2255`).
- **Chart Type:** Horizontal Bar Chart.
- **Data:** Group by `Speed_limit`. Count records.
- **Axes:**
  - Y: `Speed_limit` (Band Scale).
  - X: Count (Linear Scale).
- **Visual Encodings (Crucial):**
  - **Color:** Encode `Weather_Conditions`. Use the specific palette from the XML (e.g., Fine=`#1f77b4`, Raining=`#ff7f0e`, Snowing=`#2ca02c`, etc.).
  - **Size:** Encode `Light Conditions (group)`. In D3, map this to the **height (thickness)** of the bars. (e.g., Daylight = Thicker, Darkness = Thinner).
- **Interaction:** Click bar -> Trigger `setWeatherFilter`.

### Component: `Sheet13`
- **Title:** "Impact of Weather and Road Surface Conditions on Number of Accidents" (Color: `#0b2255`).
- **Chart Type:** Vertical Bar Chart (Nested/Grouped).
- **Data:** Group by `Weather_Conditions` and `Road_Surface_Conditions`. Count records.
- **Axes:**
  - X: `Weather_Conditions` (Primary Band) nested with `Road_Surface_Conditions` (Secondary Band).
  - Y: Count (Linear Scale).
- **Visuals:**
  - Bars: Color by `Road_Surface_Conditions` or a neutral color if not specified, but the XML implies a breakdown. Use a standard palette for Road Surface (Dry, Wet, etc.).
  - Annotation: Add a text overlay pointing to the highest bar: "Weather and Road Surface conditions together contribute to most number of accidents".
- **Interaction:** Click bar -> Trigger `setWeatherFilter`.

### Component: `LegendPanel`
- Located in the right sidebar.
- **Color Legend:** Display the mapping for `Weather_Conditions` (used in Sheet 28). Use the colors defined in the XML (`#1f77b4`, `#ff7f0e`, `#2ca02c`, `#d62728`, `#9467bd`, `#e377c2`, `#8c564b`, `#bcbd22`, `#7f7f7f`).
- **Size Legend:** Display the mapping for `Light Conditions (group)` (used in Sheet 28). Show varying bar thicknesses corresponding to Daylight vs Darkness.

## 5. Sample Data

Here is a sample of the data structure you will be working with:

```json
[
  {
    "Accident_Index": 2010000000000.0,
    "Location_Easting_OSGR": 525903,
    "Location_Northing_OSGR": 148790,
    "Longitude": -0.198376,
    "Latitude": 51.224368,
    "Police_Force": 45,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 1,
    "Number_of_Casualties": 1,
    "Date": "23-07-2014",
    "Day_of_Week": 4,
    "Time": "17:41",
    "Local_Authority_(District)": 513,
    "Local_Authority_(Highway)": "E10000030",
    "1st_Road_Class": 6,
    "1st_Road_Number": 1252,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 0,
    "Junction_Control": -1,
    "2nd_Road_Class": -1,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 0,
    "Light_Conditions": 1,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01030594",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": "201401YE80776",
    "Location_Easting_OSGR": 534330,
    "Location_Northing_OSGR": 197070,
    "Longitude": -0.05946,
    "Latitude": 51.656323,
    "Police_Force": 1,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 4,
    "Number_of_Casualties": 1,
    "Date": "18-10-2014",
    "Day_of_Week": 7,
    "Time": "12:25",
    "Local_Authority_(District)": 32,
    "Local_Authority_(Highway)": "E09000010",
    "1st_Road_Class": 3,
    "1st_Road_Number": 10,
    "Road_Type": 3,
    "Speed_limit": 40,
    "Junction_Detail": 0,
    "Junction_Control": -1,
    "2nd_Road_Class": -1,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 0,
    "Light_Conditions": 1,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01001513",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": "201434NW30174",
    "Location_Easting_OSGR": 490161,
    "Location_Northing_OSGR": 268088,
    "Longitude": -0.679123,
    "Latitude": 52.303485,
    "Police_Force": 34,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 2,
    "Date": "25-11-2014",
    "Day_of_Week": 3,
    "Time": "18:40",
    "Local_Authority_(District)": 386,
    "Local_Authority_(Highway)": "E10000021",
    "1st_Road_Class": 4,
    "1st_Road_Number": 573,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 6,
    "Junction_Control": 4,
    "2nd_Road_Class": 6,
    "2nd_Road_Number": 9436,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 0,
    "Light_Conditions": 4,
    "Weather_Conditions": 2,
    "Road_Surface_Conditions": 2,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01027315",
    "Sex Of Casualty": 2
  },
  {
    "Accident_Index": 2010000000000.0,
    "Location_Easting_OSGR": 568190,
    "Location_Northing_OSGR": 159680,
    "Longitude": 0.411822,
    "Latitude": 51.311321,
    "Police_Force": 46,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 1,
    "Date": "23-06-2014",
    "Day_of_Week": 2,
    "Time": "12:05",
    "Local_Authority_(District)": 542,
    "Local_Authority_(Highway)": "E10000016",
    "1st_Road_Class": 1,
    "1st_Road_Number": 20,
    "Road_Type": 3,
    "Speed_limit": 70,
    "Junction_Detail": 0,
    "Junction_Control": -1,
    "2nd_Road_Class": -1,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 0,
    "Light_Conditions": 1,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 2,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01024784",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": 2010000000000.0,
    "Location_Easting_OSGR": 356644,
    "Location_Northing_OSGR": 388049,
    "Longitude": -2.65336,
    "Latitude": 53.387482,
    "Police_Force": 7,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 1,
    "Date": "02-11-2014",
    "Day_of_Week": 1,
    "Time": "11:50",
    "Local_Authority_(District)": 128,
    "Local_Authority_(Highway)": "E06000007",
    "1st_Road_Class": 5,
    "1st_Road_Number": 1046,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 3,
    "Junction_Control": 4,
    "2nd_Road_Class": 6,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 0,
    "Light_Conditions": 1,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 2,
    "LSOA_of_Accident_Location": "E01012532",
    "Sex Of Casualty": 2
  },
  {
    "Accident_Index": 2010000000000.0,
    "Location_Easting_OSGR": 437330,
    "Location_Northing_OSGR": 350490,
    "Longitude": -1.444566,
    "Latitude": 53.050355,
    "Police_Force": 30,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 1,
    "Date": "28-01-2014",
    "Day_of_Week": 3,
    "Time": "07:15",
    "Local_Authority_(District)": 320,
    "Local_Authority_(Highway)": "E10000007",
    "1st_Road_Class": 4,
    "1st_Road_Number": 6374,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 0,
    "Junction_Control": -1,
    "2nd_Road_Class": -1,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 0,
    "Light_Conditions": 4,
    "Weather_Conditions": 2,
    "Road_Surface_Conditions": 2,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 2,
    "Did_Police_Officer_Attend_Scene_of_Accident": 2,
    "LSOA_of_Accident_Location": "E01019429",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": 2010000000000.0,
    "Location_Easting_OSGR": 409880,
    "Location_Northing_OSGR": 369770,
    "Longitude": -1.853476,
    "Latitude": 53.224872,
    "Police_Force": 30,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 1,
    "Number_of_Casualties": 2,
    "Date": "18-08-2014",
    "Day_of_Week": 2,
    "Time": "12:07",
    "Local_Authority_(District)": 329,
    "Local_Authority_(Highway)": "E10000007",
    "1st_Road_Class": 3,
    "1st_Road_Number": 5270,
    "Road_Type": 6,
    "Speed_limit": 50,
    "Junction_Detail": 0,
    "Junction_Control": -1,
    "2nd_Road_Class": -1,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 0,
    "Light_Conditions": 1,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 2,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01019613",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": "201414C101914",
    "Location_Easting_OSGR": 442512,
    "Location_Northing_OSGR": 392226,
    "Longitude": -1.361708,
    "Latitude": 53.42511,
    "Police_Force": 14,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 1,
    "Date": "30-09-2014",
    "Day_of_Week": 3,
    "Time": "08:45",
    "Local_Authority_(District)": 213,
    "Local_Authority_(Highway)": "E08000018",
    "1st_Road_Class": 3,
    "1st_Road_Number": 6021,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 3,
    "Junction_Control": 4,
    "2nd_Road_Class": 3,
    "2nd_Road_Number": 6021,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 8,
    "Light_Conditions": 1,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01007714",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": "201431C125814",
    "Location_Easting_OSGR": 458541,
    "Location_Northing_OSGR": 340321,
    "Longitude": -1.13001,
    "Latitude": 52.957055,
    "Police_Force": 31,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 4,
    "Number_of_Casualties": 1,
    "Date": "13-05-2014",
    "Day_of_Week": 3,
    "Time": "16:40",
    "Local_Authority_(District)": 346,
    "Local_Authority_(Highway)": "E06000018",
    "1st_Road_Class": 4,
    "1st_Road_Number": 686,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 3,
    "Junction_Control": 4,
    "2nd_Road_Class": 6,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 4,
    "Light_Conditions": 1,
    "Weather_Conditions": 9,
    "Road_Surface_Conditions": -1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01013954",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": "201406L094376",
    "Location_Easting_OSGR": 358935,
    "Location_Northing_OSGR": 405834,
    "Longitude": -2.621245,
    "Latitude": 53.547519,
    "Police_Force": 6,
    "Accident_Severity": 2,
    "Number_of_Vehicles": 1,
    "Number_of_Casualties": 1,
    "Date": "28-11-2014",
    "Day_of_Week": 6,
    "Time": "12:30",
    "Local_Authority_(District)": 114,
    "Local_Authority_(Highway)": "E08000010",
    "1st_Road_Class": 4,
    "1st_Road_Number": 5238,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 6,
    "Junction_Control": 2,
    "2nd_Road_Class": 5,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 5,
    "Light_Conditions": 1,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01006392",
    "Sex Of Casualty": 1
  }
]
```

## 6. Implementation Notes

- Ensure all charts are responsive. Use `ResizeObserver` or `viewBox` logic in D3.
- Use `d3-scaleBand` for categorical axes and `d3-scaleLinear` for measures.
- Use `d3-axisBottom` and `d3-axisLeft` for axes.
- Ensure the color palettes match the XML definitions exactly.
- The "Light Conditions (group)" is a calculated field in Tableau. In React, you can derive this by mapping the raw `Light_Conditions` codes to groups (Daylight, Darkness - lights lit, etc.) before passing to the chart.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/DfTRoadSafety_Accidents_2014.csv

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
const rows = await loadCsv("/data/DfTRoadSafety_Accidents_2014.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_303_2/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Q2_Weather
- chart_intent: `vertical_ranked_bar`
- rows_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[sum:Number of Records:qk]`
- cols_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]`
- series_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[Action (Light Conditions (group),Speed limit,Weather Conditions)]`
- bar_orientation: `vertical`
- zone: x=0, y=6689, w=43110, h=46321
- highlight_fields: [textscan.1ats9d2064dxax15btitd1ugifpt].[Light Conditions (group)], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Accident_Severity:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 28
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Speed_limit:nk]`
- cols_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[sum:Number of Records:qk]`
- series_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]`
- bar_orientation: `horizontal`
- zone: x=0, y=53010, w=86219, h=46321
- legend_required: true
- legend_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]`
- legend_relative_position: above
- highlight_fields: [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[Light Conditions (group)], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Speed_limit:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored above the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: sheet13
- chart_intent: `vertical_ranked_bar`
- rows_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[sum:Number of Records:qk]`
- cols_field: `([textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk] / [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Road_Surface_Conditions:nk])`
- series_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[Action (Light Conditions (group),Weather Conditions)]`
- bar_orientation: `vertical`
- zone: x=43110, y=6689, w=43109, h=46321
- highlight_fields: [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Light_Conditions:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Road_Surface_Conditions:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Road_Type:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Speed_limit:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Effect of Weather <[Weather_Conditions]>: kind=filter_action, source=Dashboard2, target=Dashboard2
## Highlight Bindings
- Q2_Weather: [textscan.1ats9d2064dxax15btitd1ugifpt].[Light Conditions (group)], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Accident_Severity:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]
- Sheet 28: [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]
- Sheet 28: [textscan.1ats9d2064dxax15btitd1ugifpt].[Light Conditions (group)], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Speed_limit:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]
- sheet13: [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Light_Conditions:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Road_Surface_Conditions:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Road_Type:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Speed_limit:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]
