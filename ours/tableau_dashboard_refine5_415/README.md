# Tableau Dashboard 415 - Superstore Orders Analysis

A React + TypeScript + Vite application that recreates a Tableau dashboard using D3.js for data visualization.

## Overview

This dashboard displays sales data from the Sample Superstore dataset, featuring four interactive visualizations:

1. **Line Chart** (P121__line) - Monthly sales trends over time
2. **Scatterplot** (P121__scatterplot) - Sales vs Profit analysis by product
3. **Yearly Sales Chart** (P1225__total_sales_each_year) - Annual sales comparison
4. **Customer Overview** (P1968__customer_overview) - Regional customer metrics table

## Data Source

This dashboard uses the official Tableau data source policy:
- **Data URL**: `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`
- **Rows**: 9,994 order records
- **Format**: CSV loaded via fetch API at runtime
- **Location**: `public/data/` directory only (no local imports from `src/data` or `src/mocks`)

## Installation & Setup

### Prerequisites
- Node.js 18+
- pnpm package manager

### Install Dependencies
```bash
pnpm install
```

### Development Server
```bash
pnpm dev
```
Navigate to `http://localhost:5173` to view the dashboard.

### Build for Production
```bash
pnpm build
```
The built files will be in the `dist/` directory.

### Validate Data Source
```bash
pnpm validate:tableau
```
This validates the CSV data file and checks all required Tableau fields.

## Project Structure

```
├── public/
│   └── data/
│       └── 9517_dash_dashboard0_png_informative_dashboard/
│           └── p9517_Sample_-_Superstore_Orders.csv
├── src/
│   ├── components/
│   │   ├── LineChart.tsx          # Monthly sales line chart
│   │   ├── ScatterPlot.tsx        # Sales vs Profit scatterplot
│   │   ├── YearlyLineChart.tsx    # Yearly sales chart
│   │   ├── CustomerOverviewTable.tsx  # Regional metrics table
│   │   └── LoadingState.tsx       # Loading and error states
│   ├── pages/
│   │   └── Dashboard.tsx          # Main dashboard layout
│   ├── services/
│   │   ├── dataLoader.ts          # CSV data loading via fetch
│   │   └── dataTransformers.ts    # Data aggregation functions
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── App.tsx                    # Root component with routing
│   └── main.tsx                   # Application entry point
├── docs/
│   ├── tableau_spec.json          # Tableau workbook specification
│   ├── tableau_render_contract.json  # Render contract (authoritative)
│   └── requirements.md            # Original requirements
└── scripts/
    └── validateTableauSource.ts   # Data validation script
```

## Tableau Specification Compliance

This dashboard strictly follows the Tableau render contract defined in `docs/tableau_render_contract.json`:

### Worksheet Specifications

| Worksheet | Chart Type | Rows Field | Cols Field | Zone Position |
|-----------|------------|------------|------------|---------------|
| P121__line | line_chart | sum:Sales | tmn:Order Date | x=50000, y=1000, w=49200, h=49000 |
| P121__scatterplot | custom_tableau_view | sum:Profit | sum:Sales | x=800, y=1000, w=49200, h=49000 |
| P1225__total_sales_each_year | line_chart | sum:Sales | yr:Order Date | x=50000, y=50000, w=49200, h=49000 |
| P1968__customer_overview | custom_tableau_view | none:Region | Measure Names | x=800, y=50000, w=49200, h=49000 |

### Key Features

- **Full Data Loading**: All charts use complete dataset (9,994 rows) loaded from public/data
- **Type Coercion**: All quantitative fields converted to numbers before aggregation
- **Label Visibility**: Full category labels preserved with dynamic margins
- **Interactive Tooltips**: Hover to see detailed metrics on all charts
- **Responsive Layout**: Dashboard maintains 1000x800 aspect ratio per specification

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **D3.js v7** - Data visualization
- **PapaParse** - CSV parsing
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm validate:tableau` - Validate Tableau data source

## Dashboard Routes

- `/` - Main dashboard (primary route)
- `/dashboard` - Dashboard alias

## License

This project follows the Tableau data source policy and render contract specifications.
