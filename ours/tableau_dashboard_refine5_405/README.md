# Synthetic Dashboard 405

A React + TypeScript + Vite application that recreates a Tableau dashboard with interactive D3.js visualizations.

## Overview

This dashboard displays sales data analysis with three main visualizations:
1. **Discount Overview by Region** - A highlight table showing regional metrics with color encoding
2. **Sales by Sub Category** - A horizontal bar chart ranked by sales
3. **Scatterplot** - A scatter plot showing the relationship between Sales, Profit, and Quantity

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **D3.js v7** for data visualizations
- **PapaParse** for CSV parsing
- **React Router DOM** for client-side routing

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Build

```bash
pnpm build
```

## Linting

```bash
pnpm lint
```

## Project Structure

```
src/
├── components/           # React components for each worksheet
│   ├── Dashboard.tsx     # Main dashboard layout
│   ├── DiscountOverview.tsx
│   ├── SalesBySubCategory.tsx
│   └── Scatterplot.tsx
├── services/            # Data loading and aggregation
│   └── dataService.ts   # CSV loading with useData hook
├── types/               # TypeScript type definitions
│   └── data.ts
├── utils/               # Utility functions
│   └── formatters.ts    # Number/currency formatting
├── App.tsx              # Router configuration
└── main.tsx             # Application entry point
```

## Data Source

The dashboard loads data from:
```
/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv
```

Data is loaded via fetch API and parsed with PapaParse. All numeric fields are properly converted to numbers before aggregation.

## Dashboard Layout

The dashboard follows the Tableau specification with a 2-row layout:
- **Top Row (62% height)**: Two side-by-side worksheets
  - Left: Discount Overview by Region
  - Right: Sales by Sub Category
- **Bottom Row (38% height)**: Full-width Scatterplot

## Features

- **Interactive Tooltips**: Hover over cells, bars, or points to see detailed values
- **Responsive Charts**: D3 charts adjust to container dimensions
- **Color Encoding**: Discount values use a diverging color scale (red-blue)
- **Proper Number Formatting**: Currency, percentages, and integers formatted appropriately
- **Type-Safe**: Full TypeScript coverage with strict type checking

## Tableau Spec Compliance

This implementation follows the structured Tableau specification:
- ✅ All 3 worksheets implemented
- ✅ Chart intents match specification (highlight table, horizontal ranked bar, scatter plot)
- ✅ Field mappings and aggregations preserved
- ✅ Title wording preserved from specification
- ✅ Zone layout approximates Tableau dashboard layout
- ✅ No dashboard text zones (specification has 0)
- ✅ No interactions/highlight bindings (specification has 0)

## Authentication

This application does not require authentication.
