# Project Requirements

# React + TypeScript Implementation Specification for Citi Bike Dashboard

## Overview
This specification outlines how to recreate the Tableau dashboard "Top 10 and Bottom 10" in a React + TypeScript application using D3 for visualizations. The dashboard displays the top and bottom 10 bike stations for both start and end locations.

## Dashboard Structure
The dashboard consists of a 2x2 grid layout with four worksheets:
1. Top 10 Stations - Start
2. Top 10 Stations - End
3. Bottom 10 Stations - Start
4. Bottom 10 Stations - End

## Data Loading

### Fetching Data
```typescript
const loadData = async (): Promise<any[]> => {
  try {
    const response = await fetch('/data/TEMP_18ux8nb0tmgmpj17oq32z1vbqe0m.csv');
    const csvText = await response.text();
    
    // Parse CSV using d3-dsv
    const parsedData = d3.csvParse(csvText);
    return parsedData;
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
};
```

### Data Processing
```typescript
interface BikeTrip {
  tripduration: number;
  starttime: string;
  stoptime: string;
  'start station id': string;
  'start station name': string;
  'start station latitude': string;
  'start station longitude': string;
  'end station id': string;
  'end station name': string;
  'end station latitude': string;
  'end station longitude': string;
  bikeid: string;
  usertype: string;
  'birth year': string;
  gender: string;
  ride_id: string;
  rideable_type: string;
  started_at: string;
  ended_at: string;
  start_station_name: string;
  start_station_id: string;
  end_station_name: string;
  end_station_id: string;
  start_lat: string;
  start_lng: string;
  end_lat: string;
  end_lng: string;
  member_casual: string;
}

const processStationData = (data: BikeTrip[], isStart: boolean, isTop: boolean) => {
  const stationCounts = d3.rollup(
    data,
    v => v.length,
    d => isStart ? d['start station name'] : d['end station name']
  );
  
  const sortedStations = Array.from(stationCounts, ([name, count]) => ({
    name,
    count
  })).sort((a, b) => isTop ? b.count - a.count : a.count - b.count);
  
  return sortedStations.slice(0, 10);
};
```

## Sample Data
```json
[
  {
    "﻿\"\"\"F1\"\"\"": 92845,
    "\"tripduration\"": 395.0,
    "\"starttime\"": "2020-03-15 18:24:29.578000",
    "\"stoptime\"": "2020-03-15 18:31:04.652000",
    "\"start station id\"": 3213.0,
    "\"start station name\"": "Van Vorst Park",
    "\"start station latitude\"": 40.71848892,
    "\"start station longitude\"": -74.047726625,
    "\"end station id\"": 3267.0,
    "\"end station name\"": "Morris Canal",
    "\"end station latitude\"": 40.7124188237569,
    "\"end station longitude\"": -74.03852552175522,
    "\"bikeid\"": 42313.0,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1984.0,
    "\"gender\"": 2.0,
    "\"ride_id\"": "",
    "\"rideable_type\"": "",
    "\"started_at\"": "",
    "\"ended_at\"": "",
    "\"start_station_name\"": "",
    "\"start_station_id\"": "",
    "\"end_station_name\"": "",
    "\"end_station_id\"": "",
    "\"start_lat\"": "",
    "\"start_lng\"": "",
    "\"end_lat\"": "",
    "\"end_lng\"": "",
    "\"member_casual\"": ""
  },
  {
    "﻿\"\"\"F1\"\"\"": 273622,
    "\"tripduration\"": "",
    "\"starttime\"": "",
    "\"stoptime\"": "",
    "\"start station id\"": "",
    "\"start station name\"": "",
    "\"start station latitude\"": "",
    "\"start station longitude\"": "",
    "\"end station id\"": "",
    "\"end station name\"": "",
    "\"end station latitude\"": "",
    "\"end station longitude\"": "",
    "\"bikeid\"": "",
    "\"usertype\"": "",
    "\"birth year\"": "",
    "\"gender\"": "",
    "\"ride_id\"": "E01F6020F38EA058",
    "\"rideable_type\"": "docked_bike",
    "\"started_at\"": "2021-05-11 20:19:58",
    "\"ended_at\"": "2021-05-11 20:25:55",
    "\"start_station_name\"": "Hamilton Park",
    "\"start_station_id\"": "JC009",
    "\"end_station_name\"": "Grove St PATH",
    "\"end_station_id\"": "JC005",
    "\"start_lat\"": 40.727595,
    "\"start_lng\"": -74.044247,
    "\"end_lat\"": 40.71958611647166,
    "\"end_lng\"": -74.04311746358871,
    "\"member_casual\"": "member"
  },
  {
    "﻿\"\"\"F1\"\"\"": 233558,
    "\"tripduration\"": "",
    "\"starttime\"": "",
    "\"stoptime\"": "",
    "\"start station id\"": "",
    "\"start station name\"": "",
    "\"start station latitude\"": "",
    "\"start station longitude\"": "",
    "\"end station id\"": "",
    "\"end station name\"": "",
    "\"end station latitude\"": "",
    "\"end station longitude\"": "",
    "\"bikeid\"": "",
    "\"usertype\"": "",
    "\"birth year\"": "",
    "\"gender\"": "",
    "\"ride_id\"": "EDDA4060FC3AC49E",
    "\"rideable_type\"": "docked_bike",
    "\"started_at\"": "2021-05-17 11:14:27",
    "\"ended_at\"": "2021-05-17 11:18:45",
    "\"start_station_name\"": "Journal Square",
    "\"start_station_id\"": "JC103",
    "\"end_station_name\"": "Dey St",
    "\"end_station_id\"": "JC065",
    "\"start_lat\"": 40.73367,
    "\"start_lng\"": -74.0625,
    "\"end_lat\"": 40.737711,
    "\"end_lng\"": -74.066921,
    "\"member_casual\"": "member"
  },
  {
    "﻿\"\"\"F1\"\"\"": 110594,
    "\"tripduration\"": 949.0,
    "\"starttime\"": "2020-10-11 11:16:48.859000",
    "\"stoptime\"": "2020-10-11 11:32:38.591000",
    "\"start station id\"": 3268.0,
    "\"start station name\"": "Lafayette Park",
    "\"start station latitude\"": 40.71346382669195,
    "\"start station longitude\"": -74.06285852193832,
    "\"end station id\"": 3194.0,
    "\"end station name\"": "McGinley Square",
    "\"end station latitude\"": 40.7253399253558,
    "\"end station longitude\"": -74.06762212514877,
    "\"bikeid\"": 40469.0,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1989.0,
    "\"gender\"": 2.0,
    "\"ride_id\"": "",
    "\"rideable_type\"": "",
    "\"started_at\"": "",
    "\"ended_at\"": "",
    "\"start_station_name\"": "",
    "\"start_station_id\"": "",
    "\"end_station_name\"": "",
    "\"end_station_id\"": "",
    "\"start_lat\"": "",
    "\"start_lng\"": "",
    "\"end_lat\"": "",
    "\"end_lng\"": "",
    "\"member_casual\"": ""
  },
  {
    "﻿\"\"\"F1\"\"\"": 438816,
    "\"tripduration\"": 3627.0,
    "\"starttime\"": "2020-07-31 19:21:14.596000",
    "\"stoptime\"": "2020-07-31 20:21:42.195000",
    "\"start station id\"": 3275.0,
    "\"start station name\"": "Columbus Drive",
    "\"start station latitude\"": 40.71835519823214,
    "\"start station longitude\"": -74.03891444206238,
    "\"end station id\"": 3275.0,
    "\"end station name\"": "Columbus Drive",
    "\"end station latitude\"": 40.71835519823214,
    "\"end station longitude\"": -74.03891444206238,
    "\"bikeid\"": 44683.0,
    "\"usertype\"": "Customer",
    "\"birth year\"": 1969.0,
    "\"gender\"": 0.0,
    "\"ride_id\"": "",
    "\"rideable_type\"": "",
    "\"started_at\"": "",
    "\"ended_at\"": "",
    "\"start_station_name\"": "",
    "\"start_station_id\"": "",
    "\"end_station_name\"": "",
    "\"end_station_id\"": "",
    "\"start_lat\"": "",
    "\"start_lng\"": "",
    "\"end_lat\"": "",
    "\"end_lng\"": "",
    "\"member_casual\"": ""
  },
  {
    "﻿\"\"\"F1\"\"\"": 188503,
    "\"tripduration\"": "",
    "\"starttime\"": "",
    "\"stoptime\"": "",
    "\"start station id\"": "",
    "\"start station name\"": "",
    "\"start station latitude\"": "",
    "\"start station longitude\"": "",
    "\"end station id\"": "",
    "\"end station name\"": "",
    "\"end station latitude\"": "",
    "\"end station longitude\"": "",
    "\"bikeid\"": "",
    "\"usertype\"": "",
    "\"birth year\"": "",
    "\"gender\"": "",
    "\"ride_id\"": "818D3FC67D5BDE09",
    "\"rideable_type\"": "docked_bike",
    "\"started_at\"": "2021-04-24 14:00:47",
    "\"ended_at\"": "2021-04-24 14:11:00",
    "\"start_station_name\"": "Newport Pkwy",
    "\"start_station_id\"": "JC008",
    "\"end_station_name\"": "Hamilton Park",
    "\"end_station_id\"": "JC009",
    "\"start_lat\"": 40.728744,
    "\"start_lng\"": -74.032108,
    "\"end_lat\"": 40.727595966,
    "\"end_lng\"": -74.044247311,
    "\"member_casual\"": "member"
  },
  {
    "﻿\"\"\"F1\"\"\"": 344528,
    "\"tripduration\"": 4526.0,
    "\"starttime\"": "2020-06-07 10:58:06.271000",
    "\"stoptime\"": "2020-06-07 12:13:32.300000",
    "\"start station id\"": 3276.0,
    "\"start station name\"": "Marin Light Rail",
    "\"start station latitude\"": 40.71458403535893,
    "\"start station longitude\"": -74.04281705617905,
    "\"end station id\"": 3276.0,
    "\"end station name\"": "Marin Light Rail",
    "\"end station latitude\"": 40.71458403535893,
    "\"end station longitude\"": -74.04281705617905,
    "\"bikeid\"": 42441.0,
    "\"usertype\"": "Customer",
    "\"birth year\"": 1981.0,
    "\"gender\"": 1.0,
    "\"ride_id\"": "",
    "\"rideable_type\"": "",
    "\"started_at\"": "",
    "\"ended_at\"": "",
    "\"start_station_name\"": "",
    "\"start_station_id\"": "",
    "\"end_station_name\"": "",
    "\"end_station_id\"": "",
    "\"start_lat\"": "",
    "\"start_lng\"": "",
    "\"end_lat\"": "",
    "\"end_lng\"": "",
    "\"member_casual\"": ""
  },
  {
    "﻿\"\"\"F1\"\"\"": 263729,
    "\"tripduration\"": "",
    "\"starttime\"": "",
    "\"stoptime\"": "",
    "\"start station id\"": "",
    "\"start station name\"": "",
    "\"start station latitude\"": "",
    "\"start station longitude\"": "",
    "\"end station id\"": "",
    "\"end station name\"": "",
    "\"end station latitude\"": "",
    "\"end station longitude\"": "",
    "\"bikeid\"": "",
    "\"usertype\"": "",
    "\"birth year\"": "",
    "\"gender\"": "",
    "\"ride_id\"": "3CD06C27B1362D15",
    "\"rideable_type\"": "docked_bike",
    "\"started_at\"": "2021-05-27 19:59:33",
    "\"ended_at\"": "2021-05-27 20:07:37",
    "\"start_station_name\"": "Newport Pkwy",
    "\"start_station_id\"": "JC008",
    "\"end_station_name\"": "Warren St",
    "\"end_station_id\"": "JC006",
    "\"start_lat\"": 40.728744,
    "\"start_lng\"": -74.032108,
    "\"end_lat\"": 40.7211236,
    "\"end_lng\"": -74.03805095,
    "\"member_casual\"": "casual"
  },
  {
    "﻿\"\"\"F1\"\"\"": 69685,
    "\"tripduration\"": 1239.0,
    "\"starttime\"": "2020-12-26 15:00:09.854000",
    "\"stoptime\"": "2020-12-26 15:20:49.290000",
    "\"start station id\"": 3193.0,
    "\"start station name\"": "Lincoln Park",
    "\"start station latitude\"": 40.7246050998869,
    "\"start station longitude\"": -74.07840594649315,
    "\"end station id\"": 3206.0,
    "\"end station name\"": "Hilltop",
    "\"end station latitude\"": 40.7311689,
    "\"end station longitude\"": -74.0575736,
    "\"bikeid\"": 42159.0,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1982.0,
    "\"gender\"": 1.0,
    "\"ride_id\"": "",
    "\"rideable_type\"": "",
    "\"started_at\"": "",
    "\"ended_at\"": "",
    "\"start_station_name\"": "",
    "\"start_station_id\"": "",
    "\"end_station_name\"": "",
    "\"end_station_id\"": "",
    "\"start_lat\"": "",
    "\"start_lng\"": "",
    "\"end_lat\"": "",
    "\"end_lng\"": "",
    "\"member_casual\"": ""
  },
  {
    "﻿\"\"\"F1\"\"\"": 79353,
    "\"tripduration\"": 306.0,
    "\"starttime\"": "2020-04-25 18:11:32.793000",
    "\"stoptime\"": "2020-04-25 18:16:39.521000",
    "\"start station id\"": 3203.0,
    "\"start station name\"": "Hamilton Park",
    "\"start station latitude\"": 40.727595966,
    "\"start station longitude\"": -74.044247311,
    "\"end station id\"": 3186.0,
    "\"end station name\"": "Grove St PATH",
    "\"end station latitude\"": 40.71958611647166,
    "\"end station longitude\"": -74.04311746358871,
    "\"bikeid\"": 42288.0,
    "\"usertype\"": "Subscriber",
    "\"birth year\"": 1973.0,
    "\"gender\"": 2.0,
    "\"ride_id\"": "",
    "\"rideable_type\"": "",
    "\"started_at\"": "",
    "\"ended_at\"": "",
    "\"start_station_name\"": "",
    "\"start_station_id\"": "",
    "\"end_station_name\"": "",
    "\"end_station_id\"": "",
    "\"start_lat\"": "",
    "\"start_lng\"": "",
    "\"end_lat\"": "",
    "\"end_lng\"": "",
    "\"member_casual\"": ""
  }
]
```

## Component Architecture

### Main Dashboard Component
```typescript
const Dashboard: React.FC = () => {
  const [data, setData] = useState<BikeTrip[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      const rawData = await fetch('/data/TEMP_18ux8nb0tmgmpj17oq32z1vbqe0m.csv');
      const csvText = await rawData.text();
      const parsedData = d3.csvParse(csvText) as BikeTrip[];
      setData(parsedData);
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  const topStartStations = processStationData(data, true, true);
  const topEndStations = processStationData(data, false, true);
  const bottomStartStations = processStationData(data, true, false);
  const bottomEndStations = processStationData(data, false, false);
  
  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <StationChart 
          title="Top 10 Stations - Start" 
          data={topStartStations} 
          isTop={true} 
          isStart={true} 
        />
        <StationChart 
          title="Top 10 Stations - End" 
          data={topEndStations} 
          isTop={true} 
          isStart={false} 
        />
        <StationChart 
          title="Bottom 10 Stations - Start" 
          data={bottomStartStations} 
          isTop={false} 
          isStart={true} 
        />
        <StationChart 
          title="Bottom 10 Stations - End" 
          data={bottomEndStations} 
          isTop={false} 
          isStart={false} 
        />
      </div>
    </div>
  );
};
```

### Station Chart Component
```typescript
interface StationChartProps {
  title: string;
  data: { name: string; count: number }[];
  isTop: boolean;
  isStart: boolean;
}

const StationChart: React.FC<StationChartProps> = ({ title, data, isTop, isStart }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0])
      .nice()
      .range([height, 0]);
    
    // Color scheme based on Tableau's palette
    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(getTableauColors());
    
    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.name) || 0)
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.count))
      .attr('fill', d => colorScale(d.name) || '#4e79a7')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
        // Show tooltip
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
      });
    
    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');
    
    // Y axis
    g.append('g')
      .call(d3.axisLeft(y));
    
    // Title
    svg.append('text')
      .attr('x', width / 2 + margin.left)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);
    
  }, [data, title, isTop, isStart]);
  
  return (
    <div className="station-chart">
      <svg ref={svgRef} width={400} height={300} />
    </div>
  );
};
```

### Color Scheme Function
```typescript
const getTableauColors = () => {
  // Extracting the color palette from Tableau's XML
  return [
    '#499894', '#4e79a7', '#59a14f', '#76b7b2', '#79706e',
    '#86bcb6', '#8cd17d', '#9c755f', '#9d7660', '#a0cbe8',
    '#b07aa1', '#b6992d', '#bab0ac', '#d37295', '#d4a6c8',
    '#d7b5a6', '#e15759', '#edc948', '#f1ce63', '#f28e2b',
    '#fabfd2', '#ff9d9a', '#ff9da7', '#ffbe7d'
  ];
};
```

## CSS Styling
```css
.dashboard {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.station-chart {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.bar {
  transition: opacity 0.2s;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
  }
}
```

## Implementation Notes

1. **Data Processing**: The implementation processes the raw CSV data to calculate trip counts for each station, then sorts them to get the top/bottom 10 stations.

2. **Visualization**: Each station chart is implemented as a horizontal bar chart using D3.js, matching the Tableau visualization style.

3. **Color Scheme**: The color palette is extracted from the Tableau workbook's XML definition to maintain visual consistency.

4. **Responsive Design**: The dashboard uses CSS Grid for layout with responsive adjustments for mobile devices.

5. **Interactions**: Basic hover effects are implemented for the bars to provide visual feedback.

6. **Performance**: For large datasets, consider implementing data aggregation on the server side or using Web Workers for client-side processing.

7. **Dependencies**: The implementation uses D3.js for data manipulation and visualization. Install with `npm install d3 @types/d3`.

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/root/autodl-tmp/chi26-image2code/generated-react-app/tableau_dashboard_1473_2/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Bottom 10 Stations - End
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1x4cg220zswnce1b47xi10rs3rs4].[cnt:end station id:qk]`
- cols_field: `[federated.1x4cg220zswnce1b47xi10rs3rs4].[none:end station name:nk]`
- series_field: `[federated.1x4cg220zswnce1b47xi10rs3rs4].[none:end station name:nk]`
- bar_orientation: `vertical`
- zone: x=50000, y=50000, w=48769, h=48571
- highlight_fields: [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:end station name:nk], [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:start station name:nk], [federated.1x4cg220zswnce1b47xi10rs3rs4].[yr:starttime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Bottom 10 Stations - Start
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1x4cg220zswnce1b47xi10rs3rs4].[cnt:start station id:qk]`
- cols_field: `[federated.1x4cg220zswnce1b47xi10rs3rs4].[none:start station name:nk]`
- series_field: `[federated.1x4cg220zswnce1b47xi10rs3rs4].[none:start station name:nk]`
- bar_orientation: `vertical`
- zone: x=1231, y=50000, w=48769, h=48571
- highlight_fields: [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:start station name:nk], [federated.1x4cg220zswnce1b47xi10rs3rs4].[yr:starttime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Top 10 Stations - End
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1x4cg220zswnce1b47xi10rs3rs4].[cnt:end station id:qk]`
- cols_field: `[federated.1x4cg220zswnce1b47xi10rs3rs4].[none:end station name:nk]`
- series_field: `[federated.1x4cg220zswnce1b47xi10rs3rs4].[none:end station name:nk]`
- bar_orientation: `vertical`
- zone: x=50000, y=1429, w=48769, h=48571
- highlight_fields: [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:end station name:nk], [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:start station name:nk], [federated.1x4cg220zswnce1b47xi10rs3rs4].[yr:starttime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: Top 10 Stations - Start
- chart_intent: `vertical_ranked_bar`
- rows_field: `[federated.1x4cg220zswnce1b47xi10rs3rs4].[cnt:start station id:qk]`
- cols_field: `[federated.1x4cg220zswnce1b47xi10rs3rs4].[none:start station name:nk]`
- series_field: `[federated.1x4cg220zswnce1b47xi10rs3rs4].[none:start station name:nk]`
- bar_orientation: `vertical`
- zone: x=1231, y=1429, w=48769, h=48571
- highlight_fields: [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:start station name:nk], [federated.1x4cg220zswnce1b47xi10rs3rs4].[yr:starttime:ok]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Highlight Bindings
- Top 10 Stations - Start: [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:start station name:nk], [federated.1x4cg220zswnce1b47xi10rs3rs4].[yr:starttime:ok]
- Top 10 Stations - End: [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:end station name:nk], [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:start station name:nk], [federated.1x4cg220zswnce1b47xi10rs3rs4].[yr:starttime:ok]
- Bottom 10 Stations - Start: [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:start station name:nk], [federated.1x4cg220zswnce1b47xi10rs3rs4].[yr:starttime:ok]
- Bottom 10 Stations - End: [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:end station name:nk], [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:start station name:nk], [federated.1x4cg220zswnce1b47xi10rs3rs4].[yr:starttime:ok]
- Top 10 Stations - End: [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:end station name:nk]
- Top 10 Stations - Start: [federated.1x4cg220zswnce1b47xi10rs3rs4].[none:start station name:nk]
