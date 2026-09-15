# Bike Trip Dashboard - Peak Hours

A React + TypeScript dashboard visualizing bike trip peak hours, built to replicate Tableau workbook functionality using D3.js for visualizations.

## Overview

This dashboard displays peak hours for bike trip starts and ends, featuring:
- **Peak hours for trip start**: Line chart showing trip frequency by hour of day
- **Peak hours for trip end**: Line chart showing trip end frequency by hour of day
- **Interactive highlighting**: Hover over any data point to highlight the corresponding hour across both charts
- **Auto-clear behavior**: Selection state automatically clears when mouse leaves the chart

## Tech Stack

- **React 19.2.4** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.3.1** - Build tool
- **D3.js 7.9.0** - Data visualization
- **React Router DOM 7.13.1** - Client-side routing

## Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── LoadingState.tsx       # Accessible loading component
│   │   ├── ErrorState.tsx         # Accessible error component
│   │   └── index.ts
│   ├── LineChart.tsx              # D3-based line chart component
│   ├── PeakHoursTripStart.tsx     # Worksheet for trip start peaks
│   ├── PeakHoursTripEnd.tsx       # Worksheet for trip end peaks
│   └── Dashboard.tsx              # Main dashboard layout
├── services/
│   ├── dataLoader.ts              # CSV data fetching and processing
│   └── dataValidator.ts           # Data validation utilities
├── types/
│   └── index.ts                   # TypeScript type definitions
├── App.tsx                        # React Router setup
└── main.tsx                       # Application entry point
```

## Data Source

The dashboard loads bike trip data from:
```
public/data/TEMP_0du9fqe1d1zge91goeeim12daxpo.csv
```

Data is fetched at runtime via `fetch('/data/...')` and processed client-side.

## Installation & Running

### Install dependencies
```bash
pnpm install
```

### Run development server
```bash
pnpm dev
```

### Build for production
```bash
pnpm build
```

### Preview production build
```bash
pnpm preview
```

### Run linter
```bash
pnpm lint
```

### Run tests
```bash
pnpm test
```
Note: Test script is configured but no tests are currently implemented.

## Routing

- `/` - Main dashboard (default)
- `/dashboard` - Dashboard alias route
- Any unknown routes redirect to `/`

## Tableau Spec Compliance Checklist

### Worksheet: Peak hours for trip start
- ✅ **chart_type**: Line chart implemented with D3
- ✅ **rows**: Number of Records (Y-axis)
- ✅ **cols**: Hour of starttime (X-axis)
- ✅ **table_calc**: Not applicable
- ✅ **manual_sort**: Chronological hour order (0-23)
- ✅ **filter**: Not applicable
- ✅ **reference_lines**: Not applicable
- ✅ **style_rule_elements**: Axis styling implemented
- ✅ **title_runs**: Title displayed as "Peak hours for trip start"
- ✅ **axis_titles**: "Number of Records" on Y-axis
- ✅ **legend_spec**: No legend required (single-series line)
- ✅ **interactions**: Hover highlight with auto-clear behavior
- ✅ **dashboard_zone**: Top zone (48% height, proper positioning)

### Worksheet: Peak hours for trip end
- ✅ **chart_type**: Line chart implemented with D3
- ✅ **rows**: Number of Records (Y-axis)
- ✅ **cols**: Hour of stoptime (X-axis)
- ✅ **table_calc**: Not applicable
- ✅ **manual_sort**: Chronological hour order (0-23)
- ✅ **filter**: Not applicable
- ✅ **reference_lines**: Not applicable
- ✅ **style_rule_elements**: Axis styling implemented
- ✅ **title_runs**: Title displayed as "Peak hours for trip end"
- ✅ **axis_titles**: "Number of Records" on Y-axis
- ✅ **legend_spec**: No legend required (single-series line)
- ✅ **interactions**: Hover highlight with auto-clear behavior
- ✅ **dashboard_zone**: Bottom zone (48% height, proper positioning)

### Dashboard: Dashboard-Start&End time
- ✅ **layout**: Vertical stack with proper zone positioning
- ✅ **zones**: Two worksheet zones (top and bottom)
- ✅ **dashboard_text_zones**: None (as per spec)
- ✅ **dashboard_actions**: Highlight action implemented (hover-based)
- ✅ **highlight_bindings**: Both worksheets support highlight interaction

### Data Processing
- ✅ Data loaded from `/data/...` at runtime via fetch
- ✅ CSV parsing handles quoted values correctly
- ✅ Numeric fields parsed with `Number()` before aggregation
- ✅ Hour extraction from datetime fields for proper time-based aggregation
- ✅ No synthesized data - full dataset used for metrics

### Visual Fidelity
- ✅ D3-based rendering (not Ant Design wrappers)
- ✅ Tableau-faithful styling (no decorative chrome)
- ✅ Dynamic axis margins for label visibility
- ✅ Full category labels preserved (0-23 hours)
- ✅ Tooltip on hover showing hour and count
- ✅ Highlight state reduces opacity of non-selected points

### Accessibility & UX
- ✅ Accessible loading states with ARIA attributes (role="status", aria-live="polite", aria-busy="true")
- ✅ Accessible error states with ARIA alerts (role="alert", aria-live="assertive")
- ✅ Error recovery with retry button
- ✅ Animated loading spinner for visual feedback
- ✅ High contrast error messages with clear visual hierarchy

## Key Features

1. **Real Data Loading**: All data fetched from public/data directory at runtime
2. **D3 Visualizations**: Custom D3 line charts with proper axes and labels
3. **Interactive Highlighting**: Hover synchronization across both charts
4. **Auto-clear**: Selection state clears automatically on mouse out
5. **Responsive Design**: Charts adapt to container size
6. **Type Safety**: Full TypeScript implementation with type-only imports
7. **Accessible UI**: Proper ARIA attributes on loading and error states
8. **Error Recovery**: Retry button on error states for user action
9. **Data Validation**: Comprehensive validation ensures data quality before rendering

## Development Notes

- All type imports use `import type` for TypeScript compatibility
- Error handling for invalid date values in CSV data
- Loading and error states for better UX
- Data caching in service layer to avoid redundant fetches
- Clean separation of concerns (data loading, visualization, layout)

## License

This project was generated from a Vite template and customized for Tableau dashboard replication.
