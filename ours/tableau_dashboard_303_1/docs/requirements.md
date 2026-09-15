# Project Requirements

Recreate the Tableau dashboard defined by the provided .twb workbook using React + TypeScript (Vite) with D3-based charting.

Constraints:
- Treat the Tableau workbook as ground truth for layout, worksheets, chart types, and interactions.
- Do not invent new visuals or rearrange content.

Workbook reference: /root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_303_1/docs/APFE1680688_Tableau.twb
Primary data URL: /data/DfTRoadSafety_Accidents_2014.csv

## Sample Data (10 rows)
```json
[
  {
    "Accident_Index": "201401KF60132",
    "Location_Easting_OSGR": 540870,
    "Location_Northing_OSGR": 182730,
    "Longitude": 0.029272,
    "Latitude": 51.525866,
    "Police_Force": 1,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 2,
    "Date": "10-03-2014",
    "Day_of_Week": 2,
    "Time": "21:00",
    "Local_Authority_(District)": 17,
    "Local_Authority_(Highway)": "E09000025",
    "1st_Road_Class": 3,
    "1st_Road_Number": 124,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 6,
    "Junction_Control": 2,
    "2nd_Road_Class": 3,
    "2nd_Road_Number": 112,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 5,
    "Light_Conditions": 4,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01003602",
    "Sex Of Casualty": 2
  },
  {
    "Accident_Index": "201437EA79894",
    "Location_Easting_OSGR": 618725,
    "Location_Northing_OSGR": 244077,
    "Longitude": 1.188696,
    "Latitude": 52.051847,
    "Police_Force": 37,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 3,
    "Number_of_Casualties": 1,
    "Date": "16-04-2014",
    "Day_of_Week": 4,
    "Time": "15:15",
    "Local_Authority_(District)": 412,
    "Local_Authority_(Highway)": "E10000029",
    "1st_Road_Class": 5,
    "1st_Road_Number": 1075,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 6,
    "Junction_Control": 4,
    "2nd_Road_Class": 6,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 4,
    "Light_Conditions": 1,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01030006",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": "201404DA14065",
    "Location_Easting_OSGR": 352797,
    "Location_Northing_OSGR": 430084,
    "Longitude": -2.717567,
    "Latitude": 53.764953,
    "Police_Force": 4,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 1,
    "Date": "06-09-2014",
    "Day_of_Week": 7,
    "Time": "13:35",
    "Local_Authority_(District)": 79,
    "Local_Authority_(Highway)": "E10000017",
    "1st_Road_Class": 3,
    "1st_Road_Number": 583,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 3,
    "Junction_Control": 2,
    "2nd_Road_Class": 6,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 0,
    "Light_Conditions": 1,
    "Weather_Conditions": 2,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01025314",
    "Sex Of Casualty": 2
  },
  {
    "Accident_Index": "201497QB70412",
    "Location_Easting_OSGR": 269704,
    "Location_Northing_OSGR": 661004,
    "Longitude": -4.081461,
    "Latitude": 55.824685,
    "Police_Force": 97,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 1,
    "Number_of_Casualties": 1,
    "Date": "12-12-2014",
    "Day_of_Week": 6,
    "Time": "10:40",
    "Local_Authority_(District)": 938,
    "Local_Authority_(Highway)": "S12000029",
    "1st_Road_Class": 6,
    "1st_Road_Number": 0,
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
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": 2010000000000.0,
    "Location_Easting_OSGR": 444052,
    "Location_Northing_OSGR": 113927,
    "Longitude": -1.374637,
    "Latitude": 50.923062,
    "Police_Force": 44,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 3,
    "Number_of_Casualties": 2,
    "Date": "13-08-2014",
    "Day_of_Week": 4,
    "Time": "13:10",
    "Local_Authority_(District)": 500,
    "Local_Authority_(Highway)": "E06000045",
    "1st_Road_Class": 3,
    "1st_Road_Number": 3035,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 3,
    "Junction_Control": 4,
    "2nd_Road_Class": 6,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 8,
    "Light_Conditions": 1,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01017177",
    "Sex Of Casualty": 2
  },
  {
    "Accident_Index": "201434NW33984",
    "Location_Easting_OSGR": 488902,
    "Location_Northing_OSGR": 267681,
    "Longitude": -0.69769,
    "Latitude": 52.300032,
    "Police_Force": 34,
    "Accident_Severity": 2,
    "Number_of_Vehicles": 1,
    "Number_of_Casualties": 1,
    "Date": "01-12-2014",
    "Day_of_Week": 2,
    "Time": "10:30",
    "Local_Authority_(District)": 386,
    "Local_Authority_(Highway)": "E10000021",
    "1st_Road_Class": 6,
    "1st_Road_Number": 9462,
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
    "Did_Police_Officer_Attend_Scene_of_Accident": 2,
    "LSOA_of_Accident_Location": "E01027350",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": 2010000000000.0,
    "Location_Easting_OSGR": 320580,
    "Location_Northing_OSGR": 671450,
    "Longitude": -3.272696,
    "Latitude": 55.929578,
    "Police_Force": 95,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 1,
    "Number_of_Casualties": 1,
    "Date": "29-11-2014",
    "Day_of_Week": 7,
    "Time": "16:20",
    "Local_Authority_(District)": 923,
    "Local_Authority_(Highway)": "S12000036",
    "1st_Road_Class": 5,
    "1st_Road_Number": 0,
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
    "Road_Surface_Conditions": 2,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 2,
    "LSOA_of_Accident_Location": "",
    "Sex Of Casualty": 2
  },
  {
    "Accident_Index": "201420H004464",
    "Location_Easting_OSGR": 399350,
    "Location_Northing_OSGR": 297520,
    "Longitude": -2.011035,
    "Latitude": 52.57547,
    "Police_Force": 20,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 4,
    "Number_of_Casualties": 3,
    "Date": "06-05-2014",
    "Day_of_Week": 3,
    "Time": "17:30",
    "Local_Authority_(District)": 307,
    "Local_Authority_(Highway)": "E08000030",
    "1st_Road_Class": 3,
    "1st_Road_Number": 4038,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 3,
    "Junction_Control": 4,
    "2nd_Road_Class": 6,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 1,
    "Light_Conditions": 1,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01010367",
    "Sex Of Casualty": 2
  },
  {
    "Accident_Index": "201422E402540",
    "Location_Easting_OSGR": 350180,
    "Location_Northing_OSGR": 249270,
    "Longitude": -2.729396,
    "Latitude": 52.139432,
    "Police_Force": 22,
    "Accident_Severity": 1,
    "Number_of_Vehicles": 1,
    "Number_of_Casualties": 1,
    "Date": "12-07-2014",
    "Day_of_Week": 7,
    "Time": "15:56",
    "Local_Authority_(District)": 285,
    "Local_Authority_(Highway)": "E06000019",
    "1st_Road_Class": 3,
    "1st_Road_Number": 49,
    "Road_Type": 6,
    "Speed_limit": 60,
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
    "LSOA_of_Accident_Location": "E01014100",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": 2010000000000.0,
    "Location_Easting_OSGR": 581740,
    "Location_Northing_OSGR": 166300,
    "Longitude": 0.609409,
    "Latitude": 51.366622,
    "Police_Force": 46,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 1,
    "Number_of_Casualties": 1,
    "Date": "11-03-2014",
    "Day_of_Week": 3,
    "Time": "15:45",
    "Local_Authority_(District)": 544,
    "Local_Authority_(Highway)": "E06000035",
    "1st_Road_Class": 6,
    "1st_Road_Number": 0,
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
    "Did_Police_Officer_Attend_Scene_of_Accident": 2,
    "LSOA_of_Accident_Location": "E01016096",
    "Sex Of Casualty": 2
  }
]
```

## Data Loading (Full Dataset)
Fetch the full dataset from the URLs under /data/... (Vite public folder) and parse it in the browser.

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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_303_1/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Q10_Day
- chart_intent: `vertical_ranked_bar`
- rows_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[sum:Number_of_Casualties:qk]`
- cols_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[hr:Time:ok]`
- series_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Light_Conditions:nk]`
- bar_orientation: `vertical`
- zone: x=43109, y=6689, w=43110, h=46321
- legend_required: true
- legend_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Light_Conditions:nk]`
- legend_relative_position: right
- highlight_fields: [textscan.1ats9d2064dxax15btitd1ugifpt].[hr:Time:ok], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Light_Conditions:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Q4_Time
- chart_intent: `custom_tableau_view`
- rows_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[sum:Number of Records:qk]`
- cols_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[qr:Date:ok]`
- series_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Accident_Severity:nk]`
- zone: x=0, y=53010, w=86219, h=46321
- legend_required: true
- legend_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Accident_Severity:nk]`
- legend_relative_position: above
- highlight_fields: [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Accident_Severity:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[yr:Date:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored above the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 29
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[sum:Number of Records:qk]`
- cols_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Day_of_Week:qk]`
- series_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[Action (Light Conditions (group),Speed limit,Weather Conditions)]`
- bar_orientation: `horizontal`
- zone: x=0, y=6689, w=43109, h=46321
- highlight_fields: [textscan.1ats9d2064dxax15btitd1ugifpt].[hr:Time:ok], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Day_of_Week:qk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Urban_or_Rural_Area:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- No of Accidents in week day No<[Day_of_Week]>: kind=filter_action, source=Dashboard1, target=Dashboard1
## Highlight Bindings
- Q4_Time: [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Accident_Severity:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[yr:Date:ok]
- Q10_Day: [textscan.1ats9d2064dxax15btitd1ugifpt].[hr:Time:ok], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Light_Conditions:nk]
- Q10_Day: [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Light_Conditions:nk]
- Q4_Time: [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Accident_Severity:nk]
- Sheet 29: [textscan.1ats9d2064dxax15btitd1ugifpt].[hr:Time:ok], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Day_of_Week:qk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Urban_or_Rural_Area:nk]
