# Tableau Dashboard - Superstore Sales Analysis

A React + TypeScript + Vite application that recreates a Tableau dashboard visualizing Superstore sales data.

## Overview

This dashboard displays four key visualizations:
1. **Sales by Sub Category** - Horizontal bar chart showing sales ranked by sub-category
2. **Scatterplot** - Sales vs. Profit analysis with circle size representing quantity
3. **Total Sales Each Year** - Line chart showing sales trends over time
4. **Bar** - Horizontal bar chart showing sales by Category and Sub-Category hierarchy

## Tech Stack

- **React 19.2** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 7.3** - Build tool and dev server
- **D3.js 7.9** - Data visualization
- **React Router DOM 7.13** - Client-side routing
- **PapaParse 5.5** - CSV parsing

## Data Source

The dashboard loads data from:
```
/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv
```

The CSV file contains Superstore order data with fields including:
- Order Date, Ship Date
- Customer information
- Product details (Category, Sub-Category, Product Name)
- Sales metrics (Sales, Quantity, Discount, Profit)

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

Build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── components/
│   ├── charts/
│   │   ├── HorizontalBarChart.tsx    # D3-based horizontal bar chart
│   │   ├── LineChart.tsx             # D3-based line chart
│   │   └── ScatterPlot.tsx           # D3-based scatter plot
│   ├── worksheets/
│   │   ├── BarWorksheet.tsx          # Bar chart by Category/Sub-Category
│   │   ├── SalesBySubCategoryWorksheet.tsx
│   │   ├── TotalSalesEachYearWorksheet.tsx
│   │   └── ScatterPlotWorksheet.tsx
│   └── Dashboard.tsx                 # Main dashboard layout
├── services/
│   └── dataService.ts                # Data loading and aggregation
├── types/
│   └── index.ts                      # TypeScript type definitions
├── App.tsx                           # Root component with routing
└── main.tsx                          # Application entry point
```

## Implementation Notes

### Data Loading
- Full dataset is loaded via `fetch()` from the public/data directory
- PapaParse is used for robust CSV parsing
- Numeric fields are explicitly parsed to prevent string concatenation
- Data is cached after first load

### Visualizations
- All charts are implemented using D3.js primitives
- Dynamic axis scaling based on data ranges
- Tooltips on hover for data exploration
- Responsive sizing with configurable dimensions

### Routing
- React Router DOM with BrowserRouter
- Dashboard available at `/` (root path)
- `/dashboard` also routes to the dashboard
- All other paths redirect to root

### Styling
- Minimal CSS reset in index.css
- Inline styles for dynamic chart properties
- Tableau-faithful color scheme:
  - Bar charts: #4e79a7 (blue), #59a14f (green)
  - Line chart: #f28e2b (orange)
  - Scatter plot: #e15759 (red)

## Tableau Spec Compliance

This implementation follows the Tableau specification defined in:
- `docs/tableau_spec.json` - Authoritative workbook structure
- `docs/tableau_render_contract.json` - Rendering intents and geometry

### Worksheet Checklist

✅ **P121__bar** (horizontal_ranked_bar)
- Chart type: Horizontal ranked bar
- Data: Category/Sub-Category hierarchy with Sales
- Sorted: Descending by Sales

✅ **P9517__sales_by_sub_category** (horizontal_ranked_bar)
- Chart type: Horizontal ranked bar
- Data: Sub-Category with Sales
- Sorted: Descending by Sales

✅ **P1225__total_sales_each_year** (line_chart)
- Chart type: Line chart
- Data: Year with Sales
- X-axis: Year
- Y-axis: Sales

✅ **P121__scatterplot** (custom_tableau_view)
- Chart type: Scatter plot
- Data: Sales (x-axis), Profit (y-axis), Quantity (size)
- Encodings: Position (Sales, Profit), Size (Quantity)

All worksheets implement:
- ✅ Exact title wording from title_runs
- ✅ Full category label visibility
- ✅ Dynamic chart margins
- ✅ Proper data aggregation (numeric coercion)
- ✅ D3-based rendering (no Ant Design chart wrappers)

## License

This project was generated based on a Tableau workbook specification.
