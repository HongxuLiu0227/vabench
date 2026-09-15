# Tableau Dashboard: Superstore Analytics

A React + TypeScript dashboard implementation based on Tableau workbook specifications for Superstore sales analysis.

## Project Overview

This dashboard visualizes Superstore sales data with three interactive worksheets:

1. **Scatterplot** (P121__scatterplot) - Sales vs Profit analysis by product
2. **Sales by Sub-Category** (P9517__sales_by_sub_category) - Horizontal ranked bar chart
3. **Category/Sub-Category Analysis** (P121__bar) - Hierarchical horizontal bar chart

## Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool and dev server
- **D3.js 7** - Data visualization (using d3-scale, d3-shape, d3-axis primitives)
- **React Router DOM 7** - Client-side routing
- **d3-dsv** - CSV parsing

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx              # Main dashboard layout
│   ├── ScatterplotWorksheet.tsx   # Scatterplot visualization
│   ├── HorizontalBarChart.tsx     # Reusable horizontal bar chart
│   └── KPICard.tsx                # KPI metric cards
├── services/
│   ├── types.ts                   # TypeScript type definitions
│   └── dataLoader.ts              # Data loading and aggregation logic
├── utils/
│   └── formatters.ts              # Number formatting utilities
├── App.tsx                        # Router configuration
└── main.tsx                       # Application entry point
```

## Data Source

The dashboard loads data from:
```
/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv
```

All data is fetched client-side via `fetch()` and processed in the browser.

## Installation & Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Preview production build
pnpm preview
```

## Available Scripts

- `pnpm dev` - Start development server with hot module replacement
- `pnpm build` - Build for production (TypeScript compilation + Vite bundling)
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build locally

## Dashboard Features

### KPI Metrics
- Total Sales
- Total Profit
- Profit Ratio

### Worksheets

#### 1. Scatterplot
- **X-Axis**: Sales (SUM)
- **Y-Axis**: Profit (SUM)
- **Color**: Sales (gradient from blue scale)
- **Size**: Quantity (SUM)
- **LOD**: Product Name
- **Interactions**: Hover tooltips with product details

#### 2. Sales by Sub-Category
- **Type**: Horizontal ranked bar chart
- **Y-Axis**: Sub-Category
- **X-Axis**: Sales (SUM)
- **Sort**: Descending by Sales
- **Interactions**: Hover tooltips with sales values

#### 3. Category/Sub-Category Bar Chart
- **Type**: Horizontal ranked bar chart
- **Y-Axis**: Category - Sub-Category (hierarchical)
- **X-Axis**: Sales (SUM)
- **Color**: By category
- **Sort**: Descending by Sales
- **Interactions**: Hover tooltips with sales values

## Routing

The dashboard uses React Router DOM with the following routes:

- `/` - Main dashboard (default)
- `/dashboard` - Dashboard alias
- All other paths redirect to `/`

## Tableau Spec Compliance

This implementation follows the structured Tableau specifications in `docs/tableau_spec.json` and `docs/tableau_render_contract.json`:

✅ Chart types implemented per `chart_intent`
✅ Field mappings (rows, cols, encodings)
✅ Axis titles and labels
✅ Tooltip interactions
✅ Dynamic margins for long labels
✅ Zone-based layout positioning
✅ Proper data aggregation (SUM, LOD calculations)

### Worksheet Checklist

| Worksheet | Chart Type | Fields | Title | Interactions |
|-----------|------------|--------|-------|--------------|
| P121__scatterplot | custom_tableau_view | Sales, Profit, Quantity, Product Name | ✅ | ✅ Hover tooltips |
| P9517__sales_by_sub_category | horizontal_ranked_bar | Sub-Category, Sales | ✅ | ✅ Hover tooltips |
| P121__bar | horizontal_ranked_bar | Category, Sub-Category, Sales | ✅ | ✅ Hover tooltips |

## Design Decisions

1. **D3 Primitives**: All charts use D3 primitives (scales, shapes, axes) directly, not high-level chart libraries
2. **Data Loading**: Full dataset loaded via fetch; no sample data in source code
3. **Type Safety**: All types defined in `services/types.ts` with proper TypeScript imports
4. **Responsive Layout**: Flexbox-based layout adapts to screen size
5. **Tableau-Faithful Styling**: Clean, minimal design matching Tableau defaults

## Build Output

The production build generates optimized assets in the `dist/` directory:
- HTML: 0.46 kB (gzipped: 0.30 kB)
- CSS: 0.53 kB (gzipped: 0.36 kB)
- JS: 296.13 kB (gzipped: 96.14 kB)

## Browser Support

Works in all modern browsers that support:
- ES2020+ JavaScript
- CSS Grid and Flexbox
- SVG (for D3 visualizations)
- Fetch API

## License

This project was generated based on Tableau workbook specifications.
