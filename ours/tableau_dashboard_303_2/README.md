# Road Safety Accidents Dashboard

A React + TypeScript dashboard visualizing UK road safety accident data from 2014, recreated from a Tableau workbook.

## Features

- **Interactive Visualizations**: Three D3.js-powered charts showing accident patterns
- **Filter Actions**: Click any chart to filter all views by weather conditions
- **Responsive Design**: CSS Grid layout faithful to original Tableau dashboard
- **Type-Safe**: Full TypeScript implementation

## Worksheets

### Q2_Weather
- **Chart Type**: Vertical ranked bar chart
- **Data**: Number of accidents by weather conditions
- **Interaction**: Click bars to filter by weather condition

### Sheet 28
- **Chart Type**: Horizontal ranked bar chart
- **Data**: Accidents by speed limit, encoded with:
  - **Color**: Weather conditions
  - **Size**: Light conditions (Daylight vs. Darkness)
- **Legend**: Color and size legends displayed in sidebar
- **Interaction**: Click bars to filter by weather condition

### Sheet 13
- **Chart Type**: Vertical grouped bar chart
- **Data**: Accidents by weather and road surface conditions
- **Interaction**: Click bars to filter by weather condition

## Dashboard Actions

- **Filter Action**: Selecting a weather condition in any chart filters all other worksheets
- **Auto-Clear**: Clicking the same selection again or the background clears the filter

## Data Source

- **File**: `/data/DfTRoadSafety_Accidents_2014.csv`
- **Records**: UK road accident data from 2014
- **Size**: ~20MB

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

### Test

```bash
pnpm test
```

## Tech Stack

- **React 19.2** with TypeScript
- **D3.js** (d3-scale, d3-shape, d3-axis, d3-array, d3-selection, d3-format)
- **React Router DOM** for client-side routing
- **Vite** for build tooling

## Implementation Notes

### Data Loading
- CSV parsing is handled client-side using a custom parser
- Full dataset is loaded from `public/data/` directory
- Data is mapped from numeric codes to readable values (e.g., weather conditions)

### State Management
- React Context (`DashboardContext`) manages global filter state
- Filter state is shared across all worksheet components

### Visualizations
- All charts use D3.js primitives directly
- Dynamic axis margins prevent label clipping
- Color palettes match Tableau specification exactly
- Bar heights in Sheet 28 encode light conditions

### Routing
- Single-page application with React Router DOM
- Dashboard rendered at root path (`/`)
- `/dashboard` path available as alias

## Tableau Spec Compliance Checklist

- ✅ **Q2_Weather**:
  - chart_type: Automatic → vertical_ranked_bar
  - rows: SUM(Number of Records)
  - cols: Weather_Conditions
  - title_runs: "No. of Accidents in different Weather conditions" (#0b2255)
  - highlight_fields: Light Conditions, Accident Severity, Weather Conditions
  - zone: x=0, y=6689, w=43110, h=46321

- ✅ **Sheet 28**:
  - chart_type: Automatic → horizontal_ranked_bar
  - rows: Speed_limit
  - cols: SUM(Number of Records)
  - encodings: color=Weather_Conditions, size=Light Conditions (group)
  - title_runs: "Effect of Light condition, Speed and Weather on Number of Accidents" (#0b2255)
  - legend_required: true (Weather_Conditions, anchored above)
  - highlight_fields: Weather Conditions, Light Conditions, Speed limit
  - zone: x=0, y=53010, w=86219, h=46321

- ✅ **Sheet 13**:
  - chart_type: Automatic → vertical_ranked_bar
  - rows: SUM(Number of Records)
  - cols: Weather_Conditions / Road_Surface_Conditions
  - title_runs: "Impact of Weather and Road Surface Conditions on Number of Accidents" (#0b2255)
  - highlight_fields: Light Conditions, Road Surface Conditions, Road Type, Speed limit, Weather Conditions
  - zone: x=43110, y=6689, w=43109, h=46321

- ✅ **Dashboard2**:
  - Background color: #ffe791
  - Title: "Impact of Weather on Number of Accidents" (#ff0000, bold)
  - Layout: CSS Grid matching tableau_spec.json dashboard_zones
  - Filter Action: "Effect of Weather <[Weather_Conditions]>" on-select, auto-clear
  - Target: Dashboard2 (all worksheets)

## License

This project uses UK road accident data sourced from the Department for Transport.
