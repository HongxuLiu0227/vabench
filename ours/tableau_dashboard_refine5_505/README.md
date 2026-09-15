# Tableau Dashboard - Synthetic Dashboard 505

A React + TypeScript + Vite implementation of a Tableau dashboard with 4 interactive visualizations.

## Dashboard Worksheets

This dashboard includes the following worksheets:

1. **Total Sales Each Year** - Line chart showing sales trends over years
2. **Line** - Monthly sales trend line chart
3. **Scatterplot** - Sales vs Profit analysis with quantity sizing
4. **Sales by Sub Category** - Horizontal ranked bar chart of sales by product sub-category

## Installation

Install dependencies using pnpm:

```bash
pnpm install --frozen-lockfile
```

## Development

Start the development server:

```bash
pnpm dev
```

## Testing

Run the linter to check code quality:

```bash
pnpm lint
```

## Building

Build the project for production:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## Data Source

The dashboard loads sales data from `/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv` via fetch API, following the Tableau data policy for runtime data loading.

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization
- **PapaParse** - CSV parsing
- **React Router DOM** - Routing

## Project Structure

```
src/
├── components/
│   ├── charts/          # Reusable chart components (LineChart, ScatterPlot, HorizontalBarChart)
│   ├── worksheets/      # Individual worksheet implementations
│   └── ui/              # UI components (LoadingState, ErrorState)
├── lib/                 # Utility functions and data transformations
├── pages/              # Page components (Dashboard)
├── services/           # API and data loading services
└── utils/              # Validation and utility functions
```
