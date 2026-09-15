# Station Use DB - CitiBike Trip Dashboard

A React + TypeScript + Vite dashboard that visualizes 2020 CitiBike trip data, recreating a Tableau dashboard using D3.js primitives.

## Tech Stack

- **Framework**: React 19.2.0 + TypeScript 5.9.3 + Vite 7.3.1
- **Visualization**: D3.js (d3-scale, d3-axis, d3-shape, d3-array, d3-selection, d3-transition, d3-dsv, d3-scale-chromatic)
- **Routing**: React Router DOM 7.13.1
- **Styling**: CSS Modules (custom styling without Tailwind)

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx           # Main dashboard layout and state management
│   ├── HorizontalBarChart.tsx  # D3-based horizontal bar chart for Top/Bottom stations
│   ├── CitymapScatter.tsx      # D3-based scatter plot for station locations
│   └── worksheets/             # Individual worksheet components
│       ├── Top10Start.tsx
│       ├── Top10End.tsx
│       ├── Bottom10Start.tsx
│       ├── Bottom10End.tsx
│       ├── CitymapStart.tsx
│       └── CitymapEnd.tsx
├── contexts/
│   └── DashboardContext.tsx    # Global filter state context
├── hooks/
│   └── useDashboard.ts         # Custom hook for dashboard context
├── services/
│   └── dataService.ts          # CSV loading, parsing, and aggregation logic
├── types/
│   └── index.ts                # TypeScript type definitions
└── App.tsx                     # Root component with routing
```

## Data Source

The dashboard loads data from `/data/TEMP_0dadi4n02dru231bavf6q0qrp5qq.csv` (64MB) containing 2020 CitiBike trip records.

**Data Policy**: All data is loaded via `fetch('/data/...')` from the `public/data/` directory. No CSV files are stored in `src/data` or `src/mocks`.

### Data Fields

- `tripduration`: Trip duration in seconds
- `starttime`/`stoptime`: Start and end timestamps
- `start station name`/`end station name`: Station identifiers
- `start station latitude`/`start station longitude`: Starting coordinates
- `end station latitude`/`end station longitude`: Ending coordinates
- `bikeid`: Bike identifier
- `usertype`: Subscriber or Customer
- `birth year`: Rider birth year
- `gender`: Rider gender (Male, Female, Unknown)

## Dashboard Features

### Worksheets (6 total)

1. **Top 10 Stations (start)**: Horizontal bar chart showing top 10 start stations by trip count
2. **Top 10 Stations (end)**: Horizontal bar chart showing top 10 end stations by trip count
3. **Bottom 10 Stations (start)**: Horizontal bar chart showing bottom 10 start stations by trip count
4. **Bottom 10 Stations (end)**: Horizontal bar chart showing bottom 10 end stations by trip count
5. **Most Popular Journey Starting Locations**: Scatter plot showing all start stations with size/color by trip count
6. **Most Popular Journey Ending Locations**: Scatter plot showing all end stations with size/color by trip count

### Interactions

- **Filter Actions**: Clicking on any bar in Top/Bottom Start/End charts filters the entire dashboard
  - Clicking a start station filters trips by that start station
  - Clicking an end station filters trips by that end station
  - **Auto-clear**: Clicking the same station again clears the filter
- **Highlighting**: Selected stations are highlighted in orange, others are dimmed
- **Tooltips**: Hover over bars or map points to see detailed information

## Tableau Spec Compliance

This dashboard implements the Tableau render contract with the following specifications:

### Worksheet Compliance

| Worksheet | Chart Type | Axis Title | Legend Required | Interactions |
|-----------|------------|------------|-----------------|--------------|
| Top 10 Start | Horizontal Ranked Bar | Number of Trips | No | Filter + Highlight |
| Top 10 End | Horizontal Ranked Bar | Number of Trips | No | Filter + Highlight |
| Bottom 10 Start | Horizontal Ranked Bar | Number of Trips | No | Filter + Highlight |
| Bottom 10 End | Horizontal Ranked Bar | Number of Trips | No | Filter + Highlight |
| Citymap Start | Scatter Map (Coordinates) | N/A | Yes (Right) | Highlight |
| Citymap End | Scatter Map (Coordinates) | N/A | No | Highlight |

### Dashboard Actions

4 filter actions with on-select activation and auto-clear behavior:
- Filter 5: Bottom 10 End → Station Use DB
- Filter 6: Top 10 End → Station Use DB
- Filter 7: Bottom 10 Start → Station Use DB
- Filter 8: Top 10 Start → Station Use DB

### Data Processing

- All quantitative fields converted to numbers using `Number()` before aggregation
- No string concatenation in metrics
- Full dataset loaded from `/data/TEMP_0dadi4n02dru231bavf6q0qrp5qq.csv`
- Filtering and aggregation performed on complete dataset

## Development

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Preview Production Build

```bash
npm run preview
```

## Key Implementation Details

1. **No Placeholders**: All components render real data with functional interactions
2. **No Stub Data**: Sample rows in documentation only; runtime uses full CSV dataset
3. **Real Interactions**: All buttons and charts perform meaningful actions (filtering, state updates)
4. **Accessible Components**: Custom loading and error states instead of bare divs
5. **Full Label Visibility**: Chart margins dynamically calculated to prevent label clipping
6. **Color Scale Legend**: Citymap Start includes a continuous color scale legend for trip counts

## Dashboard Layout

The dashboard uses a CSS Grid layout matching the Tableau zone specifications:

```
┌─────────────────────────┬─────────────────────────┐
│  Citymap Start          │  Citymap End            │
│  (Most Popular Journey  │  (Most Popular Journey  │
│   Starting Locations)    │   Ending Locations)      │
├─────────────────────────┼─────────────────────────┤
│  Top 10 Start           │  Top 10 End             │
├─────────────────────────┼─────────────────────────┤
│  Bottom 10 Start        │  Bottom 10 End          │
└─────────────────────────┴─────────────────────────┘
```

## License

This project was generated from a Vite template and customized for the CitiBike data visualization use case.
