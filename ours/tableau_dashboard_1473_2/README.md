# Citi Bike Dashboard - Top 10 and Bottom 10 Stations

A React + TypeScript + Vite dashboard that visualizes the top and bottom 10 bike stations for both start and end locations, recreating a Tableau dashboard using D3.js.

## Features

- **4 Interactive Vertical Ranked Bar Charts**:
  - Top 10 Stations - Start
  - Top 10 Stations - End
  - Bottom 10 Stations - Start
  - Bottom 10 Stations - End

- **Tableau-Faithful Design**:
  - Exact chart layout with 2x2 grid positioning
  - Tableau color palette
  - Vertical bar orientation with dynamic margins for long labels
  - Proper axis titles and chart titles

- **Interactive Features**:
  - Cross-worksheet highlight interactions (6 highlight bindings)
  - Click-to-select stations with visual highlighting
  - Auto-clear highlight on outside click
  - Hover tooltips with station details
  - Smooth transitions and visual feedback

- **Data Loading**:
  - Full CSV dataset loaded from `/data/TEMP_18ux8nb0tmgmpj17oq32z1vbqe0m.csv`
  - Client-side data processing with d3-dsv
  - Numeric parsing and aggregation

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization and chart rendering
- **React Router DOM** - Client-side routing (root path `/`)
- **d3-dsv** - CSV parsing

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx                 # Main dashboard with 2x2 grid
│   └── VerticalRankedBarChart.tsx    # D3-based bar chart component
├── contexts/
│   └── HighlightContext.tsx          # Global highlight state management
├── services/
│   └── dataService.ts                # Data loading and processing
├── types/
│   └── index.ts                      # TypeScript type definitions
├── App.tsx                           # Root component with routing
├── main.tsx                          # Application entry point
├── App.css                           # Dashboard styling
└── index.css                         # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

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

Build output will be in the `dist/` directory.

### Lint

```bash
npm run lint
```

### Preview Production Build

```bash
npm run preview
```

## Tableau Spec Compliance Checklist

### Worksheets Implemented

- ✅ **Bottom 10 Stations - End** - `vertical_ranked_bar` chart intent
- ✅ **Bottom 10 Stations - Start** - `vertical_ranked_bar` chart intent
- ✅ **Top 10 Stations - End** - `vertical_ranked_bar` chart intent
- ✅ **Top 10 Stations - Start** - `vertical_ranked_bar` chart intent

### Fields Per Worksheet

- ✅ `rows_field` - Count aggregation (measure)
- ✅ `cols_field` - Station name (dimension)
- ✅ `series_field` - Station name for color encoding
- ✅ `title_runs` - Exact title wording preserved

### Interactions

- ✅ `highlight_bindings` - 6 bindings implemented via HighlightContext
  - Start station highlighting propagates to all worksheets
  - End station highlighting propagates to all worksheets
  - Click-to-select with visual feedback
  - Auto-clear on outside click

### Visual Fidelity

- ✅ 2x2 grid layout matching zone coordinates
- ✅ Full category labels visible (no clipping)
- ✅ Dynamic chart margins for long station names
- ✅ Tableau color palette (#499894, #4e79a7, #59a14f, etc.)
- ✅ Vertical bar orientation with proper scales
- ✅ Tooltips on hover
- ✅ Rounded bar corners for modern look

## Data Source

The dashboard loads bike trip data from `/public/data/TEMP_18ux8nb0tmgmpj17oq32z1vbqe0m.csv`.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

