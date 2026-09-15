# Road Safety Accidents Dashboard

A React + TypeScript + Vite dashboard that visualizes UK road safety accident data from 2014, recreating a Tableau workbook with interactive D3-based charts.

## Features

- **Interactive Charts**: Three visualization types built with D3.js
  - Vertical Ranked Bar: Impact of Time of Day on Number of Accidents (Q10_Day)
  - Area Chart: Number of Accidents in Different Quarters (Q4_Time)
  - Horizontal Ranked Bar: Impact of Day of the Week on Number of Accidents (Sheet 29)

- **Interactions**:
  - Click on bars/areas to highlight data across all charts
  - Click outside charts to clear highlights
  - Day-of-week filter from Sheet 29 affects all other visualizations

- **Legends**: Color-coded legends for Light Conditions (Q10_Day) and Accident Severity (Q4_Time)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint -- --max-warnings 0
```

## Project Structure

```
src/
├── components/          # React chart components
│   ├── Dashboard.tsx    # Main dashboard layout with interactions
│   ├── CustomTableauView.tsx  # Area chart for Q4_Time
│   ├── HorizontalRankedBar.tsx  # Bar chart for Sheet 29
│   ├── Legend.tsx       # Reusable legend component
│   └── VerticalRankedBar.tsx   # Grouped bar chart for Q10_Day
├── services/           # Data loading services
│   └── dataLoader.ts   # CSV data fetching and parsing
├── types/              # TypeScript type definitions
│   └── data.ts         # Data models and types
└── utils/              # Utility functions
    └── dataTransform.ts # Data aggregation and transformations
```

## Data Source

Dashboard loads data from `/public/data/DfTRoadSafety_Accidents_2014.csv` (UK Department for Transport Road Safety Data, 2014).

## Tech Stack

- **React 19.2** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7.3** - Build tool
- **D3.js 7.9** - Data visualization
- **PapaParse 5.4** - CSV parsing
- **React Router DOM 7.1** - Client-side routing

## Tableau Spec Compliance Checklist

### Worksheet: Q10_Day - "Impact of Time of Day on Number of Accidents"
- ✅ `chart_type`: Bar chart implemented as vertical grouped bars
- ✅ `rows`: sum(Number_of_Casualties) - Y-axis measure
- ✅ `cols`: HOUR(Time) - X-axis categories (hours 0-23)
- ✅ `encodings.color`: Light_Conditions - Series grouping with color
- ✅ `title_runs`: Title with color #0b2255
- ✅ `legend`: Required legend for Light_Conditions, positioned right
- ✅ `highlight_fields`: Time and Light_Conditions interactive
- ✅ Interaction: Click to highlight, auto-clear on outside click

### Worksheet: Q4_Time - "Number of Accidents in Different Quarters"
- ✅ `chart_type`: Area chart (stacked areas)
- ✅ `rows`: sum(Number of Records) - Y-axis measure
- ✅ `cols`: QUARTER(Date) + YEAR(Date) - X-axis time periods
- ✅ `encodings.color`: Accident_Severity - Series grouping
- ✅ `title_runs`: Title with color #0b2255
- ✅ `legend`: Required legend for Accident_Severity, positioned above
- ✅ `highlight_fields`: Accident_Severity and Date interactive
- ✅ `filter_members`: Day-of-week filter applied
- ✅ Interaction: Click to highlight, auto-clear on outside click

### Worksheet: Sheet 29 - "Impact of Day of the week on Number of Accidents"
- ✅ `chart_type`: Horizontal ranked bar chart
- ✅ `rows`: sum(Number of Records) - X-axis measure
- ✅ `cols`: Day_of_Week - Y-axis categories
- ✅ `title_runs`: Title with color #0b2255
- ✅ `filter_members`: Day-of-week filter applied
- ✅ `highlight_fields`: Time, Day_of_Week, Urban_or_Rural_Area interactive
- ✅ Dashboard action: Filter action on Day_of_Week propagates to Dashboard1
- ✅ Interaction: Click to filter other charts

### Dashboard Composition (Dashboard1)
- ✅ Layout zone structure preserved:
  - Sheet 29: Top-left (0-43.1% width, 6.7-53% height)
  - Q10_Day: Top-right (43.1-86.2% width, 6.7-53% height)
  - Q4_Time: Bottom (0-86.2% width, 53-99.3% height)
  - Legends: Right sidebar (86.2-100% width)
- ✅ Dashboard actions: Day-of-week filter from Sheet 29
- ✅ Highlight bindings: 5 binding configurations implemented
- ✅ Auto-clear behavior on outside click
- ✅ No dashboard text zones (as per spec)

### Data Loading
- ✅ Full dataset loaded from `/data/DfTRoadSafety_Accidents_2014.csv`
- ✅ CSV parsing with PapaParse
- ✅ Numeric measures parsed explicitly (Number(), parseFloat())
- ✅ Data cached after first load
- ✅ No data files in src/data or src/mocks

### Styling
- ✅ Tableau-faithful colors (Light_Conditions, Accident_Severity palettes)
- ✅ No invented global headers/footers
- ✅ No decorative card shadows/borders
- ✅ Dynamic chart margins for full label visibility
- ✅ Axis labels preserved with full text

### Routing
- ✅ React Router DOM with BrowserRouter
- ✅ Dashboard accessible at `/` and `/dashboard`
- ✅ Real URL-based navigation (not state-only)
- ✅ All routes wired to actual components

## License

MIT
