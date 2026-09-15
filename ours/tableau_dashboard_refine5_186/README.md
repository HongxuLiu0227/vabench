# Tableau Dashboard 186 - Synthetic Dashboard

This is a React-based implementation of a Tableau dashboard, strictly following the Tableau render contract and data policy specifications.

## Dashboard Overview

This dashboard displays sales data analytics across four visualizations:

1. **Bar** (Top-Left) - Horizontal ranked bar chart showing Sales by Category and Sub-Category
2. **Sales by Sub Category** (Top-Right) - Horizontal ranked bar chart showing Sales by Sub-Category and Product
3. **Total Sales Each Year** (Bottom-Left) - Line chart showing sales trends over years
4. **Scatterplot** (Bottom-Right) - Scatter plot showing Profit vs Sales with Quantity as bubble size

## Data Source Policy

**MANDATORY**: All dashboard data is loaded from the official data source at:
```
/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv
```

This application:
- ✅ Loads full datasets via `fetch('/data/...')`
- ✅ Does NOT synthesize data from sample rows
- ✅ Does NOT place CSV/JSON files under `src/data` or `src/mocks`
- ✅ Keeps all dataset files only in `public/data/`
- ✅ Converts quantitative fields to numbers before aggregation

## Tableau Spec Compliance

This dashboard implements the following worksheets according to the Tableau render contract:

### P9517__sales_by_sub_category
- **Chart Type**: Horizontal Ranked Bar
- **Rows**: Sub-Category / Product Name
- **Columns**: Sales (sum)
- **Title**: "Sales by Sub Category"
- **Zone**: Top-right (x: 50%, y: 1%, width: 49.2%, height: 49%)

### P121__bar
- **Chart Type**: Horizontal Ranked Bar
- **Rows**: Category / Sub-Category
- **Columns**: Sales (sum)
- **Color Encoding**: Sales (sequential blue gradient)
- **Title**: "Bar"
- **Zone**: Top-left (x: 0.8%, y: 1%, width: 49.2%, height: 49%)

### P121__scatterplot
- **Chart Type**: Circle (Scatterplot)
- **Rows**: Profit (sum)
- **Columns**: Sales (sum)
- **Color Encoding**: Sales (sequential blue gradient)
- **Size Encoding**: Quantity (sqrt scale)
- **LOD**: Product Name
- **Title**: "Scatterplot"
- **Zone**: Bottom-right (x: 50%, y: 50%, width: 49.2%, height: 49%)

### P1225__total_sales_each_year
- **Chart Type**: Line Chart
- **Rows**: Sales (sum)
- **Columns**: Order Date (year)
- **Color Encoding**: Sales (sequential blue gradient)
- **Title**: "Total Sales Each Year"
- **Zone**: Bottom-left (x: 0.8%, y: 50%, width: 49.2%, height: 49%)

## Features

### Label Visibility
- Dynamic left margin calculation based on longest category labels
- Text-anchor positioning to prevent clipping
- Ellipsis truncation only for very long labels (> 50 characters)
- Full text available in tooltip/title attribute on hover

### Interactions
- Tooltips on all chart elements showing detailed metrics
- Hover effects with opacity changes
- Animated transitions on initial render

### Data Quality
- Comprehensive validation of numeric fields
- Date range validation and quality checks
- BOM and preamble row handling for CSV parsing
- NaN and zero-value detection

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **D3.js** - Data visualization and charting
- **React Router** - Navigation
- **Vite** - Build tool

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

### Preview
```bash
pnpm preview
```

## Dashboard Layout

The dashboard follows the exact zone specifications from the Tableau render contract:
- **Canvas Size**: 1000px × 800px
- **Layout**: 2×2 grid with proper margins and spacing
- **Worksheets**: Positioned according to normalized zone coordinates

## Notes

- All numeric values are properly converted from CSV strings to numbers
- Charts sort data descending by the displayed measure (Sales/Profit)
- No placeholder data or "Coming soon" messages - all charts display real data
- No synthetic global chrome - dashboard layout matches Tableau specification exactly
