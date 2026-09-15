# Tableau Dashboard Recreation

A React + TypeScript dashboard application that recreates a Tableau workbook visualization using D3.js for rendering. The dashboard displays sales data from the Superstore dataset.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js v7** - Data visualization and charting
- **React Router DOM** - Client-side routing

## Features

The dashboard includes three worksheets from the Tableau spec:

1. **P121__line** - Monthly sales line chart showing sales trends over time
2. **P121__bar** - Horizontal ranked bar chart showing sales by category and sub-category
3. **P1225__total_sales_each_year** - Yearly sales line chart showing total sales by year

All charts feature:
- Interactive tooltips on hover
- Tableau-faithful styling
- Grid lines for better readability
- Full dataset loaded from `/data/...`

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The dashboard will be available at `http://localhost:5173/`

### Build

```bash
pnpm build
```

The built files will be in the `dist/` directory.

### Lint

```bash
pnpm lint
```

## Data Source

The dashboard loads data from:
```
/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv
```

The CSV file is parsed client-side using a custom CSV parser that handles:
- Quoted fields
- BOM (Byte Order Mark) removal
- Type conversion for numeric fields
- Date parsing

**Tableau Data Policy Compliance:**
- ✅ All runtime data loaded from `public/data/...` via fetch
- ✅ No data files in `src/data` or `src/mocks`
- ✅ Full dataset loaded at runtime (no sample rows in production code)
- ✅ Quantitative fields converted to numbers before aggregation

## Project Structure

```
src/
├── components/          # Reusable chart components
│   ├── LineChart.tsx           # Time-series line chart
│   ├── HorizontalBarChart.tsx  # Horizontal ranked bar chart
│   └── YearlyLineChart.tsx     # Yearly sales line chart
├── pages/               # Page components
│   └── Dashboard.tsx            # Main dashboard page
├── services/            # Business logic and data services
│   └── dataService.ts           # Data loading and aggregation
├── types/               # TypeScript type definitions
│   └── index.ts                  # Shared interfaces
├── App.tsx              # Root component
└── main.tsx             # Application entry point with routing
```

## Routing

The application uses React Router DOM with the following routes:
- `/` - Main dashboard (default, per Tableau spec)
- `/dashboard` - Alias to main dashboard
- `*` - Redirects to `/`

## Tableau Spec Compliance Checklist

### Dashboard Layout
- ✅ Dashboard size: 1000x800px (from render contract)
- ✅ Zone positioning matches `tableau_render_contract.json` exactly
- ✅ No invented chrome (removed header, KPI cards, shadows)
- ✅ White background matching Tableau workbook

### P121__line (Monthly Sales Line Chart)
- ✅ Chart type: Line chart
- ✅ Zone position: x=8, y=8, w=492, h=494 (top left)
- ✅ Aspect ratio: 0.7968
- ✅ X-axis: Order Date (month granularity)
- ✅ Y-axis: SUM(Sales)
- ✅ Title: "Line"
- ✅ No legend (legend.required = false)
- ✅ Interactive tooltips showing date and sales values
- ✅ Grid lines for readability
- ✅ Data point markers

### P121__bar (Category Sales Bar Chart)
- ✅ Chart type: Horizontal ranked bar chart
- ✅ Zone position: x=500, y=8, w=492, h=494 (top right)
- ✅ Aspect ratio: 0.7968
- ✅ Y-axis: Category / Sub-Category hierarchy
- ✅ X-axis: SUM(Sales)
- ✅ Sort: Descending by sales value
- ✅ Title: "Bar"
- ✅ No legend (legend.required = false)
- ✅ Color coding by category
- ✅ Value labels on bars
- ✅ Interactive tooltips

### P1225__total_sales_each_year (Yearly Sales Line Chart)
- ✅ Chart type: Line chart
- ✅ Zone position: x=8, y=502, w=984, h=290 (bottom, full width)
- ✅ Aspect ratio: 2.7145
- ✅ X-axis: Order Date (year granularity)
- ✅ Y-axis: SUM(Sales)
- ✅ Title: "Total Sales Each Year"
- ✅ No legend (legend.required = false)
- ✅ Interactive tooltips showing year and sales values
- ✅ Grid lines for readability
- ✅ Data point markers

### Interactions
- ✅ No dashboard actions defined in spec (0 actions)
- ✅ No highlight bindings defined in spec (0 bindings)
- ✅ Charts have hover interactions for tooltips

## Implementation Notes

- All charts use D3.js for rendering with SVG
- Data is fetched from the public directory using the Fetch API
- Numeric measures are explicitly parsed to numbers before aggregation
- No sample data in source files - full dataset is loaded at runtime
- Dynamic chart margins ensure axis labels are fully visible
- Absolute positioning used to match Tableau zone coordinates exactly
- Loading states use accessible components with ARIA attributes
- All TypeScript strict type checking enabled (no `any` types)

## Recent Changes

### Placeholder and Stub Elimination
- ✅ Removed KPI cards (not in Tableau spec)
- ✅ Removed "Informative Dashboard" header (invented chrome)
- ✅ Removed generic styling (shadows, rounded corners, gray background)
- ✅ Updated layout to match Tableau zone coordinates exactly
- ✅ Updated chart dimensions to match zone aspect ratios
- ✅ Fixed all TypeScript lint errors (removed `any` types, unused imports)
- ✅ Verified data loading uses fetch from `/data/...` and converts to numbers

## License

MIT
