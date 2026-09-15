# Tableau Dashboard 3 - Citi Bike Trip Analysis

A React + TypeScript + Vite application that recreates a Tableau dashboard analyzing Citi Bike trip data.

## Project Overview

This dashboard provides interactive visualizations of Citi Bike trip data with four main views:
- **Total Recorded Trips**: Year-over-year trip count analysis
- **Total Recorded Trips - First Quarter**: Q1 (Jan-Apr) trip analysis
- **Percent Ridership Growth**: Year-over-year growth percentage
- **Percent Ridership Growth - First Quarter**: Q1 growth percentage

## Tech Stack

- **Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite 7.3
- **Visualization**: D3.js v7 (d3-scale, d3-axis, d3-array, d3-shape, d3-selection, d3-dsv)
- **Styling**: CSS
- **Routing**: React Router DOM 7.13

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint
```

## Data Source

The dashboard loads Citi Bike trip data from:
```
/data/TableauTemp_1f56vnx1u34eds13ml2di1i0hdr8.csv
```

Data is loaded via `fetch()` at runtime and parsed using D3's CSV parser. The application handles:
- Over-quoted CSV headers (Tableau export format)
- BOM (Byte Order Mark) characters
- Malformed CSV entries
- Date parsing and validation
- Numeric field coercion

## Component Architecture

### App.tsx
- Manages global state for year selection
- Provides routing via React Router
- Handles clear selection functionality

### Dashboard.tsx
- Main dashboard layout (2x2 grid with legend sidebar)
- Loads and transforms data
- Manages four chart instances
- Responsive design for mobile devices

### LineChart.tsx
- Reusable line chart component
- Interactive year selection with highlight effects
- Dynamic Y-axis labels (counts vs percentages)
- Hover effects on data points
- Value labels on charts

### ColorLegend.tsx
- Continuous color scale legend
- Displays min/max values
- Gradient visualization

## Data Transformations

1. **Aggregation by Year**: Groups trip records by `stoptime` year
2. **Month Filtering**: Filters records to first quarter (months 1-4)
3. **Percentage Growth**: Calculates YoY growth using formula:
   ```
   ((CurrentYear - PreviousYear) / PreviousYear) * 100
   ```

## Interactions

- **Year Selection**: Click any data point to select a year
- **Cross-Chart Highlighting**: Selected year highlights across all four charts
- **Auto-Clear**: Click the same year again to deselect, or use the "Clear Selection" button
- **Hover Effects**: Data points expand on hover

## Dashboard Layout

```
┌─────────────────┬─────────────────┐
│  Sheet 13       │  Sheet 13 (3)   │
│  Total Trips    │  % Growth       │
├─────────────────┼─────────────────┤
│  Sheet 13 (2)   │  Sheet 13 (4)   │
│  Total Trips Q1 │  % Growth Q1    │
└─────────────────┴─────────────────┘
                    │
                 [Legend]
```

## File Structure

```
src/
├── components/
│   ├── LineChart.tsx       # Line chart visualization
│   ├── ColorLegend.tsx     # Color scale legend
│   └── *.css              # Component styles
├── pages/
│   ├── Dashboard.tsx       # Main dashboard page
│   └── Dashboard.css       # Dashboard layout
├── services/
│   └── dataService.ts      # Data loading & transformation
├── utils/
│   └── csvParser.ts        # CSV parsing utilities
├── types/
│   └── index.ts            # TypeScript type definitions
├── App.tsx                 # Root component with routing
└── main.tsx                # Application entry point
```

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## Performance Notes

- CSV data is loaded once and cached in component state
- Charts use `useMemo` for expensive computations (scales, line generators)
- SVG rendering is optimized with D3 selections

## License

MIT
