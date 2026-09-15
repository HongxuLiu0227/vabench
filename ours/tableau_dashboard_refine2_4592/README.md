# Tableau Dashboard - Office Supplies Analytics

An interactive React-based dashboard reproducing Tableau visualizations for Office Supplies sales data.

## Overview

This application recreates a Tableau dashboard with the following visualizations:
- **Line Chart**: Revenue trends over time by sales representative
- **Sales Rep vs Units**: Vertical ranked bar chart showing units sold by representative
- **Sales Rep vs Revenue**: Vertical ranked bar chart showing revenue by representative
- **Data Table**: Detailed tabular view with filtering capabilities

All worksheets support interactive filtering with auto-clear behavior, matching the original Tableau workbook interactions.

## Installation

```bash
pnpm install
```

## Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Build

Build for production:

```bash
pnpm build
```

The built files will be in the `dist/` directory.

## Testing

Run the linter:

```bash
pnpm lint
```

## Data Source

This dashboard loads data from `/data/OfficeSupplies (Office_Supplies data set (Class work module 1)).csv` in the public directory. The data is loaded at runtime via fetch requests, following Tableau data policy compliance.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization and charting
- **React Router DOM** - Client-side routing

## Project Structure

```
src/
├── components/         # React components for each worksheet
│   ├── LineChart.tsx
│   ├── SalesRepVsUnits.tsx
│   ├── SalesRepVsRevenue.tsx
│   └── DataTable.tsx
├── contexts/          # React Context for dashboard state
├── services/          # Data loading and processing
├── types/             # TypeScript type definitions
├── utils/             # Helper functions
└── App.tsx            # Main application component
```

## Tableau Compliance

This implementation follows:
- **Tableau Spec Contract**: `docs/tableau_spec.json` - Authoritative machine-readable specification
- **Tableau Render Contract**: `docs/tableau_render_contract.json` - Chart geometry and layout requirements
- **Data Policy**: Runtime data loads from `public/data/` via fetch; no datasets in source directories

## Interactive Features

- Click any bar, line point, or table row to filter all other worksheets
- Filters auto-clear when clicking empty space
- Cross-worksheet highlighting maintains visual context
- Responsive layout adapts to screen size
