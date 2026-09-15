# Project Requirements

You are a senior React engineer tasked with recreating a Tableau dashboard titled "Critical Factors Responsible for Large Number of Accidents".

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7): Use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-time`, `d3-dsv` for visualizations. Do not use high-level chart libraries like Recharts or Nivo.
- CSS: Use standard CSS modules or styled-components. No UI component libraries (e.g., Ant Design) unless necessary for basic layout.

## Data Loading

The primary data source is `DfTRoadSafety_Accidents_2014.csv`.

1.  **Fetch Strategy**: Use the `d3.csv` function (which wraps `fetch`) to load data from `/data/DfTRoadSafety_Accidents_2014.csv`.
2.  **Type Safety**: Define a TypeScript interface `AccidentRecord` matching the columns in the CSV.
3.  **Implementation Example**:

```typescript
import * as d3 from 'd3';

interface AccidentRecord {
  Accident_Index: string;
  Location_Easting_OSGR: number;
  Location_Northing_OSGR: number;
  Longitude: number;
  Latitude: number;
  Police_Force: string;
  Accident_Severity: string; // "1", "2", "3"
  Number_of_Vehicles: number;
  Number_of_Casualties: number;
  Date: string; // ISO date string
  Day_of_Week: number; // 1-7
  Time: string;
  Local_Authority_District: string;
  Local_Authority_Highway: string;
  "1st_Road_Class": string;
  "1st_Road_Number": string;
  Road_Type: string;
  Speed_limit: string;
  Junction_Detail: string;
  Junction_Control: string;
  "2nd_Road_Class": string;
  "2nd_Road_Number": string;
  Pedestrian_Crossing_Human_Control: string;
  Pedestrian_Crossing_Physical_Facilities: string;
  Light_Conditions: string;
  Weather_Conditions: string;
  Road_Surface_Conditions: string;
  Special_Conditions_at_Site: string;
  Carriageway_Hazards: string;
  Urban_or_Rural_Area: string;
  Did_Police_Officer_Attend_Scene_of_Accident: string;
  LSOA_of_Accident_Location: string;
  Sex_Of_Casualty: string;
}

export const useAccidentData = () => {
  const [data, setData] = React.useState<AccidentRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    d3.csv<AccidentRecord>('/data/DfTRoadSafety_Accidents_2014.csv').then((rawData) => {
      // Type coercion if necessary (e.g., parsing numbers)
      const parsed = rawData.map(d => ({
        ...d,
        Number_of_Vehicles: +d.Number_of_Vehicles,
        Number_of_Casualties: +d.Number_of_Casualties,
        Day_of_Week: +d.Day_of_Week,
        Speed_limit: d.Speed_limit
      }));
      setData(parsed);
      setLoading(false);
    });
  }, []);

  return { data, loading };
};
```

## Data Transformation & Aggregation

The Tableau workbook performs aggregations (Count of Records, Sum of Casualties). You must replicate this logic using `d3.rollup` or `Array.reduce` before passing data to the visualization components.

**Key Mappings (Aliases):**
- **Accident_Severity**: "1" -> "Fatal", "2" -> "Serious", "3" -> "Slight".
- **Day_of_Week**: 1 -> "Sunday", 2 -> "Monday", ..., 7 -> "Saturday".
- **Light_Conditions**: "1" -> "Daylight", "4" -> "Darkness - lights lit", "5" -> "Darkness - light unlit", "6" -> "Darkness - No lighting", "7" -> "Darkness - Lighting Unknown".
- **Weather_Conditions**: "1" -> "Fine No High winds", "2" -> "Raining No High winds", etc.
- **Road_Surface_Conditions**: "1" -> "Dry", "2" -> "Wet or Damp", etc.
- **Speed_limit**: Keep as string (e.g., "30", "40").

## Dashboard Layout

**Container**: `Dashboard4`
- **Background Color**: `#e0d490`
- **Title**: "Critical Factors Responsible for Large Number of Accidents" (Color: `#820000`)
- **Grid Structure**: Use CSS Grid.
  - Main Content Area (Left): 2 columns, 2 rows.
  - Sidebar (Right): Fixed width (approx 160px-200px) for legends.

**Grid Template**:
```css
.dashboard-container {
  display: grid;
  grid-template-columns: 1fr 180px; /* Charts | Legends */
  grid-template-rows: auto 1fr 1fr;
  background-color: #e0d490;
  gap: 10px;
  padding: 20px;
  height: 100vh;
}

.dashboard-header {
  grid-column: 1 / -1;
  color: #820000;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

/* 2x2 Grid for Charts */
.charts-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  grid-column: 1 / 2;
  grid-row: 2 / 4;
}

.legend-sidebar {
  grid-column: 2 / 3;
  grid-row: 2 / 4;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: rgba(255,255,255,0.3);
  padding: 10px;
  border-radius: 4px;
}
```

## Worksheet Specifications

### 1. Worksheet: Q2_Weather
**Title**: "No. of Accidents in different Weather conditions"
**Type**: Bar Chart
**Position**: Top-Left

**Visual Encodings**:
- **X-Axis**: `Weather_Conditions` (Dimension, Aliased). Sort by Count (Descending).
- **Y-Axis**: `Number of Records` (Measure: Count).
- **Color**: `Light_Conditions` (Grouped/Dimension). Use the palette defined in the workbook (Daylight=Blue, Darkness=Green/Orange).
- **Annotation**: Add a text annotation near the top bars: "Most accidents occured in Fine no high wind condition".

**D3 Implementation**:
- Use `d3.scaleBand` for X.
- Use `d3.scaleLinear` for Y.
- Render `<rect>` elements for bars.
- Filter data based on global context filters (Light, Speed, Weather, Road Surface).

### 2. Worksheet: Sheet 29
**Title**: "Impact of Day of the week on Number of Accidents"
**Type**: Bar Chart
**Position**: Top-Right

**Visual Encodings**:
- **X-Axis**: `Day_of_Week` (Dimension, 1-7, mapped to Sun-Sat).
- **Y-Axis**: `Number of Records` (Measure: Count).
- **Color**: Default (or match `Light_Conditions` if consistent with dashboard theme, but XML implies Automatic/Single color usually). *Correction*: XML shows `mark class="Automatic"` with no specific color encoding for this sheet, implying a single color or color by dimension if filtered. We will use a neutral color (e.g., steelblue) or color by `Light_Conditions` if the dashboard filter implies it. Given the sidebar legend for Light Conditions, it's likely colored by Light Conditions.

**D3 Implementation**:
- `d3.scaleBand` for X.
- `d3.scaleLinear` for Y.

### 3. Worksheet: Q7_Speed
**Title**: "Effect of Speed on Number of Accidents"
**Type**: Line Chart (Multi-line)
**Position**: Bottom-Left

**Visual Encodings**:
- **X-Axis**: `Accident_Severity` (Dimension: Fatal, Serious, Slight). Treat as Ordinal.
- **Y-Axis**: `Number_of_Casualties` (Measure: Sum).
- **Color**: `Speed_limit` (Dimension: 20, 30, 40, etc.).
- **Annotations**:
  - Point annotation at Severity="Slight", Speed="30": "Highest casuality at Speed 30".
  - Point annotation at Severity="Slight", Speed="20": "Low casuality at speed 20".

**D3 Implementation**:
- `d3.scalePoint` for X (Severity).
- `d3.scaleLinear` for Y.
- `d3.scaleOrdinal` for Color (Speed limit).
- Group data by `Speed_limit`, then use `d3.line()` to draw paths.

### 4. Worksheet: Sheet 28
**Title**: "Effect of Light condition, Speed and Weather on Number of Accidents"
**Type**: Scatter Plot (Circle View)
**Position**: Bottom-Right

**Visual Encodings**:
- **X-Axis**: `Number of Records` (Measure: Count).
- **Y-Axis**: `Speed_limit` (Dimension). Treat as Ordinal/Band.
- **Color**: `Weather_Conditions` (Dimension).
- **Size**: `Light_Conditions` (Group/Dimension).

**D3 Implementation**:
- `d3.scaleLinear` for X.
- `d3.scaleBand` or `d3.scalePoint` for Y (Speed).
- `d3.scaleOrdinal` for Color (Weather).
- `d3.scaleSqrt` or `d3.scaleLinear` for Radius (Light Conditions).
- Render `<circle>` elements.

## Interactions & Filters

**Global State**: Create a context or state object `DashboardFilters` containing:
- `selectedLightConditions`: string[] (default: all)
- `selectedSpeedLimits`: string[] (default: all)
- `selectedWeatherConditions`: string[] (default: all)
- `selectedRoadSurfaceConditions`: string[] (default: all)

**Filter Logic**:
- When a user interacts with a chart (e.g., clicks a bar in Q2_Weather), update the corresponding filter state.
- All charts must re-render filtering the raw data based on these active selections.
- The workbook defines "Use as Filter" actions. Implement click handlers on chart elements (bars/circles) to toggle the filter value for that dimension.

## Legends (Sidebar)

The sidebar must contain discrete color legends for:
1.  **Light Conditions** (Daylight, Darkness...)
2.  **Speed Limit** (20, 30, 40, 50, 60, 70)
3.  **Weather Conditions** (Fine, Raining, Snowing...)
4.  **Size Legend** for Light Conditions (Small circle to Large circle).

## Sample Data

```json
[
  {
    "Accident_Index": 2010000000000.0,
    "Location_Easting_OSGR": 421195,
    "Location_Northing_OSGR": 301768,
    "Longitude": -1.688414,
    "Latitude": 52.61325,
    "Police_Force": 21,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 1,
    "Date": "11-04-2014",
    "Day_of_Week": 6,
    "Time": "08:47",
    "Local_Authority_(District)": 258,
    "Local_Authority_(Highway)": "E10000028",
    "1st_Road_Class": 4,
    "1st_Road_Number": 5404,
    "Road_Type": 1,
    "Speed_limit": 40,
    "Junction_Detail": 1,
    "Junction_Control": 4,
    "2nd_Road_Class": 6,
    "2nd_Road_Number": 24,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 0,
    "Light_Conditions": 1,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01029863",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": 2010000000000.0,
    "Location_Easting_OSGR": 567871,
    "Location_Northing_OSGR": 328855,
    "Longitude": 0.490438,
    "Latitude": 52.831039,
    "Police_Force": 36,
    "Accident_Severity": 2,
    "Number_of_Vehicles": 1,
    "Number_of_Casualties": 4,
    "Date": "31-05-2014",
    "Day_of_Week": 7,
    "Time": "04:21",
    "Local_Authority_(District)": 407,
    "Local_Authority_(Highway)": "E10000020",
    "1st_Road_Class": 3,
    "1st_Road_Number": 149,
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
    "Road_Surface_Conditions": 2,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 2,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01026718",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": "201454B482514",
    "Location_Easting_OSGR": 386786,
    "Location_Northing_OSGR": 176187,
    "Longitude": -2.191711,
    "Latitude": 51.484429,
    "Police_Force": 54,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 1,
    "Date": "19-12-2014",
    "Day_of_Week": 6,
    "Time": "09:05",
    "Local_Authority_(District)": 635,
    "Local_Authority_(Highway)": "E06000054",
    "1st_Road_Class": 4,
    "1st_Road_Number": 4039,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 8,
    "Junction_Control": 4,
    "2nd_Road_Class": 6,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 0,
    "Light_Conditions": 1,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 2,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 2,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01031940",
    "Sex Of Casualty": 2
  },
  {
    "Accident_Index": "201401YR90527",
    "Location_Easting_OSGR": 528570,
    "Location_Northing_OSGR": 190160,
    "Longitude": -0.145216,
    "Latitude": 51.59557,
    "Police_Force": 1,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 1,
    "Date": "24-07-2014",
    "Day_of_Week": 5,
    "Time": "23:00",
    "Local_Authority_(District)": 31,
    "Local_Authority_(Highway)": "E09000014",
    "1st_Road_Class": 4,
    "1st_Road_Number": 550,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 3,
    "Junction_Control": 2,
    "2nd_Road_Class": 4,
    "2nd_Road_Number": 106,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 5,
    "Light_Conditions": 4,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01001997",
    "Sex Of Casualty": 2
  },
  {
    "Accident_Index": 2010000000000.0,
    "Location_Easting_OSGR": 597180,
    "Location_Northing_OSGR": 140840,
    "Longitude": 0.81692,
    "Latitude": 51.132817,
    "Police_Force": 46,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 1,
    "Date": "08-11-2014",
    "Day_of_Week": 7,
    "Time": "10:50",
    "Local_Authority_(District)": 530,
    "Local_Authority_(Highway)": "E10000016",
    "1st_Road_Class": 3,
    "1st_Road_Number": 28,
    "Road_Type": 6,
    "Speed_limit": 60,
    "Junction_Detail": 3,
    "Junction_Control": 4,
    "2nd_Road_Class": 6,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 0,
    "Light_Conditions": 1,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 2,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 2,
    "Did_Police_Officer_Attend_Scene_of_Accident": 2,
    "LSOA_of_Accident_Location": "E01032814",
    "Sex Of Casualty": 2
  },
  {
    "Accident_Index": 2010000000000.0,
    "Location_Easting_OSGR": 440060,
    "Location_Northing_OSGR": 350510,
    "Longitude": -1.403839,
    "Latitude": 53.050338,
    "Police_Force": 30,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 1,
    "Number_of_Casualties": 1,
    "Date": "27-11-2014",
    "Day_of_Week": 5,
    "Time": "20:15",
    "Local_Authority_(District)": 320,
    "Local_Authority_(Highway)": "E10000007",
    "1st_Road_Class": 4,
    "1st_Road_Number": 6441,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 3,
    "Junction_Control": 4,
    "2nd_Road_Class": 6,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 0,
    "Light_Conditions": 4,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 2,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 2,
    "LSOA_of_Accident_Location": "E01019458",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": "201414B092214",
    "Location_Easting_OSGR": 436043,
    "Location_Northing_OSGR": 403785,
    "Longitude": -1.457732,
    "Latitude": 53.529486,
    "Police_Force": 14,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 1,
    "Date": "05-10-2014",
    "Day_of_Week": 1,
    "Time": "14:40",
    "Local_Authority_(District)": 210,
    "Local_Authority_(Highway)": "E08000016",
    "1st_Road_Class": 4,
    "1st_Road_Number": 6100,
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
    "LSOA_of_Accident_Location": "E01007458",
    "Sex Of Casualty": 2
  },
  {
    "Accident_Index": "201401QA19028",
    "Location_Easting_OSGR": 515030,
    "Location_Northing_OSGR": 191100,
    "Longitude": -0.340295,
    "Latitude": 51.606944,
    "Police_Force": 1,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 3,
    "Date": "28-11-2014",
    "Day_of_Week": 6,
    "Time": "20:20",
    "Local_Authority_(District)": 29,
    "Local_Authority_(Highway)": "E09000015",
    "1st_Road_Class": 3,
    "1st_Road_Number": 409,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 8,
    "Junction_Control": 4,
    "2nd_Road_Class": 6,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 0,
    "Light_Conditions": 4,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 1,
    "LSOA_of_Accident_Location": "E01002142",
    "Sex Of Casualty": 1
  },
  {
    "Accident_Index": "201401TW60138",
    "Location_Easting_OSGR": 519740,
    "Location_Northing_OSGR": 175840,
    "Longitude": -0.277498,
    "Latitude": 51.468814,
    "Police_Force": 1,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 1,
    "Date": "08-03-2014",
    "Day_of_Week": 7,
    "Time": "18:50",
    "Local_Authority_(District)": 24,
    "Local_Authority_(Highway)": "E09000027",
    "1st_Road_Class": 3,
    "1st_Road_Number": 316,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 0,
    "Junction_Control": -1,
    "2nd_Road_Class": -1,
    "2nd_Road_Number": 0,
    "Pedestrian_Crossing-Human_Control": 0,
    "Pedestrian_Crossing-Physical_Facilities": 4,
    "Light_Conditions": 4,
    "Weather_Conditions": 1,
    "Road_Surface_Conditions": 1,
    "Special_Conditions_at_Site": 0,
    "Carriageway_Hazards": 0,
    "Urban_or_Rural_Area": 1,
    "Did_Police_Officer_Attend_Scene_of_Accident": 2,
    "LSOA_of_Accident_Location": "E01003865",
    "Sex Of Casualty": 2
  },
  {
    "Accident_Index": "201401YR90572",
    "Location_Easting_OSGR": 533360,
    "Location_Northing_OSGR": 188670,
    "Longitude": -0.076669,
    "Latitude": 51.581068,
    "Police_Force": 1,
    "Accident_Severity": 3,
    "Number_of_Vehicles": 2,
    "Number_of_Casualties": 1,
    "Date": "28-07-2014",
    "Day_of_Week": 2,
    "Time": "14:00",
    "Local_Authority_(District)": 31,
    "Local_Authority_(Highway)": "E09000014",
    "1st_Road_Class": 3,
    "1st_Road_Number": 503,
    "Road_Type": 6,
    "Speed_limit": 30,
    "Junction_Detail": 8,
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
    "LSOA_of_Accident_Location": "E01002046",
    "Sex Of Casualty": 1
  }
]
```

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
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_303_4/docs/tableau_render_contract.json`
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
- legend_required: true
- legend_relative_position: above
- highlight_fields: [textscan.1ats9d2064dxax15btitd1ugifpt].[Light Conditions (group)], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Accident_Severity:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored above the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Q7_Speed
- chart_intent: `custom_tableau_view`
- rows_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[sum:Number_of_Casualties:qk]`
- cols_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Accident_Severity:nk]`
- series_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Speed_limit:nk]`
- zone: x=0, y=53010, w=43110, h=46321
- legend_required: true
- legend_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Speed_limit:nk]`
- legend_relative_position: above
- highlight_fields: [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Accident_Severity:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Speed_limit:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored above the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 28
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Speed_limit:nk]`
- cols_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[sum:Number of Records:qk]`
- series_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]`
- bar_orientation: `horizontal`
- zone: x=43110, y=53010, w=43109, h=46321
- legend_required: true
- legend_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]`
- legend_relative_position: right
- highlight_fields: [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[Light Conditions (group)], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Speed_limit:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Render the worksheet legend in the dashboard with the same category mapping.
- rule: Keep legend anchored right the worksheet based on dashboard zones; avoid global legend hoisting.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Sheet 29
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[sum:Number of Records:qk]`
- cols_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[none:Day_of_Week:qk]`
- series_field: `[textscan.1ats9d2064dxax15btitd1ugifpt].[Action (Light Conditions (group),Speed limit,Weather Conditions)]`
- bar_orientation: `horizontal`
- zone: x=43110, y=6689, w=43109, h=46321
- highlight_fields: [textscan.1ats9d2064dxax15btitd1ugifpt].[hr:Time:ok], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Day_of_Week:qk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Urban_or_Rural_Area:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- No. of Accidents in Light conditions <[Light Conditions (group)]>: kind=highlight_brush, source=Dashboard4, target=Dashboard4
- No. of Accidents at speed<[Speed_limit]>: kind=filter_action, source=Dashboard4, target=Dashboard4
## Highlight Bindings
- Q2_Weather: [textscan.1ats9d2064dxax15btitd1ugifpt].[Light Conditions (group)], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Accident_Severity:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]
- Q7_Speed: [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Accident_Severity:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Speed_limit:nk]
- Q2_Weather: [textscan.1ats9d2064dxax15btitd1ugifpt].[Light Conditions (group)]
- Q7_Speed: [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Speed_limit:nk]
- Sheet 28: [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]
- Sheet 28: [textscan.1ats9d2064dxax15btitd1ugifpt].[Light Conditions (group)], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Speed_limit:nk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Weather_Conditions:nk]
- Sheet 29: [textscan.1ats9d2064dxax15btitd1ugifpt].[hr:Time:ok], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Day_of_Week:qk], [textscan.1ats9d2064dxax15btitd1ugifpt].[none:Urban_or_Rural_Area:nk]
