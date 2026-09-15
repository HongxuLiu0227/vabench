# Synthetic Dashboard 184 - Tableau Recreation

A React + TypeScript + Vite application that recreates a Tableau dashboard visualization using D3.js primitives. This dashboard displays sales analytics with scatterplots, bar charts, and regional overviews.

## Dashboard Overview

**Dashboard Name:** Synthetic Dashboard 184

**Layout Structure:**
- **Top Row (~62% height):**
  - Left: Scatterplot (Sales vs Profit by Product)
  - Right: Horizontal Bar Chart (Sales by Category/Sub-Category)
- **Bottom Row (~38% height):**
  - Full Width: Discount Overview by Region

## Installation

Install dependencies using pnpm:

```bash
pnpm install
```

If you encounter any issues, try:

```bash
pnpm install --frozen-lockfile
```

## Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173/`

## Building

Build for production:

```bash
pnpm build
```

This runs TypeScript compilation and Vite bundling, outputting to the `dist/` directory.

## Linting

Check code for issues:

```bash
pnpm lint
```

Auto-fix linting issues:

```bash
pnpm lint:fix
```

## Data Loading

The dashboard loads data from CSV files in the `public/data/` directory:

- **Primary Data Source:** `/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv`

Data is loaded via `fetch()` at runtime and parsed using PapaParse. The application includes:
- Automatic header detection (skips preamble rows)
- Type-safe parsing with error handling
- Field validation
- Aggregation by Product, Category, and Region

## Tech Stack

- **Framework:** React 19.2.0 + TypeScript 5.9.3 + Vite 7.3.1
- **Visualization:** D3.js (d3-scale, d3-axis, d3-selection, d3-array, d3-shape, d3-format, d3-interpolate)
- **CSV Parsing:** PapaParse 5.5.3
- **Routing:** React Router DOM 7.13.2

## Dashboard Components

### 1. Scatterplot (`P121__scatterplot`)
- **Title:** "Scatterplot"
- **Data:** Aggregated by Product Name
- **X-Axis:** SUM(Sales)
- **Y-Axis:** SUM(Profit)
- **Size:** SUM(Quantity) - Circle radius
- **Color:** Sequential blue scale based on Sales

### 2. Horizontal Bar Chart (`P121__bar`)
- **Title:** "Bar"
- **Data:** Aggregated by Category and Sub-Category
- **X-Axis:** SUM(Sales)
- **Y-Axis:** Category/Sub-Category hierarchy
- **Color:** Blue-teal gradient based on Sales
- **Sorting:** Descending by Sales (top 20)

### 3. Discount Overview by Region (`P2648__discount_overview_by_region`)
- **Title:** "Discount Overview by Region"
- **Data:** Aggregated by Region with multiple measures
- **Measures:** AVG(Discount), SUM(Profit), SUM(Shipping Cost), SUM(Quantity), SUM(Sales), COUNTD(Customer Name)
- **X-Axis:** Measure Values
- **Y-Axis:** Region
- **Color:** Orange-blue diverging scale based on Discount (reversed)

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard layout
│   ├── Scatterplot.tsx        # Scatterplot visualization
│   ├── HorizontalBar.tsx      # Horizontal bar chart
│   └── DiscountOverview.tsx   # Regional discount overview
├── hooks/
│   └── useDashboardData.ts    # Custom hook for data loading
├── services/
│   └── dataService.ts         # Data fetching and aggregation
├── types/
│   └── data.ts                # TypeScript type definitions
├── App.tsx                    # Root application component
└── main.tsx                   # Application entry point
```

## Tableau Contract Compliance

This implementation follows the Tableau render contract specified in `docs/tableau_render_contract.json`:

- ✅ All worksheets implement their specified `chart_intent`
- ✅ Field bindings match the specification
- ✅ Zone positions and aspect ratios preserved
- ✅ Full category labels visible (no clipping)
- ✅ Dynamic margins for axis labels
- ✅ Title wording preserved from contract
- ✅ Manual sort order applied where specified
- ✅ Color encoding follows specification
- ✅ No dataset files in `src/data` or `src/mocks`
- ✅ All data loaded via `fetch('/data/...')`

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- CSS Grid
- SVG
- ResizeObserver

## License

MIT
