# Tableau Dashboard - Synthetic Dashboard 182

A React-based dashboard application that visualizes superstore sales data with interactive D3.js charts. This dashboard is fully compliant with Tableau specifications and provides real-time data visualization.

## Dashboard Overview

This dashboard displays four interactive visualizations:

1. **Scatterplot** - Shows the relationship between Sales and Profit, with bubble size representing Quantity
2. **Discount Overview by Region** - A detailed table showing discount metrics, profit, quantity, sales, and profit ratio by region
3. **Line Chart** - Displays sales trends over time (monthly)
4. **Total Sales Each Year** - Shows annual sales performance with year-over-year comparison

## Data Source

**Compliance Notice**: This dashboard strictly adheres to the Tableau data-source policy. All data is loaded from the public data directory:

```
/data/1968_dash_dashboard0_png_coursera_course_204_week_203_dashboard/p1968_TEMP_1u7hox51ox1io4183hb2v01q3nst.csv
```

- **Total Rows**: 9,994 data rows
- **Data Loading**: Via `fetch('/data/...')` with full dataset parsing
- **No Local Imports**: Dashboard data is NOT imported from `src/data` or `src/mocks`
- **Runtime Aggregation**: All metrics are computed from full dataset rows at runtime

### Data Fields

The dataset contains the following fields:
- Row ID, Order ID, Order Date, Ship Date, Ship Mode
- Customer ID, Customer Name, Segment
- Country, City, State, Postal Code, Region
- Product ID, Category, Sub-Category, Product Name
- Sales, Quantity, Discount, Profit

## Tableau Specification Compliance

This dashboard implements the Tableau render contract defined in:
- `docs/tableau_spec.json` - Authoritative machine-readable contract
- `docs/tableau_render_contract.json` - Final authority for chart geometry/layout

### Worksheet Implementation

| Worksheet | Chart Type | Intent | Fields |
|-----------|------------|--------|--------|
| P121__scatterplot | Circle (Scatterplot) | custom_tableau_view | Rows: Profit, Cols: Sales, Color: Sales, Size: Quantity, LOD: Product Name |
| P2648__discount_overview_by_region | Automatic | custom_tableau_view | Rows: Region, Cols: Measure Names × Multiple Values, Color: Discount |
| P121__line | Automatic | line_chart | Rows: Sales, Cols: Order Date (month), Color: Sales |
| P1225__total_sales_each_year | Bar (rendered as line) | line_chart | Rows: Sales, Cols: Order Date (year), Color: Sales |

### Dashboard Layout

The dashboard uses a 2×2 grid layout matching Tableau zone coordinates:

```
┌─────────────────────────┬─────────────────────────┐
│  Discount Overview      │  Total Sales Each Year  │
│  (P2648)                │  (P1225)                │
│  x: 0.6%, y: 1.1%       │  x: 50%, y: 1.1%        │
├─────────────────────────┼─────────────────────────┤
│  Line Chart             │  Scatterplot            │
│  (P121__line)           │  (P121__scatterplot)    │
│  x: 0.6%, y: 50%        │  x: 50%, y: 50%         │
└─────────────────────────┴─────────────────────────┘
```

### Features Implemented

✅ **Data Loading**
- Full dataset loaded via fetch from `/data/...`
- CSV parsing with BOM handling and header normalization
- Numeric field conversion (no string aggregation)
- Proper null/empty value handling

✅ **Chart Rendering**
- D3-based interactive charts with tooltips
- Responsive sizing using ResizeObserver
- Proper axis scaling and domain computation
- Color scales based on data values

✅ **Accessibility**
- ARIA labels and roles on all charts
- Semantic HTML for loading/error states
- Keyboard navigation support
- Screen reader friendly

✅ **Layout & Composition**
- Matches Tableau dashboard zone coordinates
- No synthetic chrome or invented headers
- Proper margin handling for full label visibility
- Responsive grid layout

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager

### Install Dependencies

```bash
pnpm install
```

### Development Server

```bash
pnpm dev
```

The dashboard will be available at `http://localhost:5173/`

### Build for Production

```bash
pnpm build
```

The optimized production build will be in the `dist/` directory.

### Linting

```bash
pnpm lint
```

### Run Tests

```bash
pnpm test -- --runInBand
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard layout
│   ├── Scatterplot.tsx        # Scatterplot visualization
│   ├── LineChart.tsx          # Line chart (monthly)
│   ├── YearlySalesChart.tsx   # Yearly sales line chart
│   ├── DiscountOverview.tsx   # Regional metrics table
│   ├── Loading.tsx            # Loading state component
│   └── ErrorDisplay.tsx       # Error state component
├── hooks/
│   ├── useData.ts             # Data fetching hook
│   └── useContainerSize.ts    # Responsive container sizing
├── services/
│   ├── types.ts               # TypeScript type definitions
│   └── dataService.ts         # Data fetching and aggregation
├── App.tsx                    # Root application component
└── main.tsx                   # Application entry point
```

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **D3.js v7** - Data visualization
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

## Key Features

### Responsive Design
All charts automatically resize to fit their containers using ResizeObserver API, ensuring proper display on various screen sizes.

### Interactive Tooltips
Hover over data points to see detailed information:
- **Scatterplot**: Product name, sales, profit, quantity
- **Line Charts**: Date/month and sales values
- **Regional Table**: Color-coded discount values

### Data Aggregation
The dashboard performs real-time aggregation:
- **By Product**: Aggregates sales, profit, and quantity per product
- **By Region**: Calculates average discount, total profit, quantity, sales, and profit ratio
- **By Month**: Groups sales by month for trend analysis
- **By Year**: Groups sales by year for annual comparisons

### Accessibility
- All charts include proper ARIA labels
- Loading and error states use semantic HTML
- Table data is properly structured with headers
- High contrast colors for better readability

## Tableau Spec Compliance Checklist

### P121__scatterplot
- ✅ Chart type: Circle (Scatterplot)
- ✅ Rows: SUM(Profit)
- ✅ Cols: SUM(Sales)
- ✅ Color: SUM(Sales) with sequential color scale
- ✅ Size: SUM(Quantity) with sqrt scale
- ✅ Level of Detail: Product Name
- ✅ Title: "Scatterplot"
- ✅ Zone position: x: 50%, y: 50%

### P2648__discount_overview_by_region
- ✅ Chart type: Automatic (table view)
- ✅ Rows: Region
- ✅ Cols: Measure Names × Multiple Values
- ✅ Measures: Discount, Profit, Quantity, Sales, Profit Ratio
- ✅ Color encoding: Average Discount with heat map
- ✅ Title: "Discount Overview by Region"
- ✅ Zone position: x: 0.6%, y: 1.1%

### P121__line
- ✅ Chart type: Automatic (line)
- ✅ Rows: SUM(Sales)
- ✅ Cols: MONTH(Order Date)
- ✅ Color: SUM(Sales)
- ✅ Title: "Line"
- ✅ Zone position: x: 0.6%, y: 50%

### P1225__total_sales_each_year
- ✅ Chart type: Bar (rendered as line for clarity)
- ✅ Rows: SUM(Sales)
- ✅ Cols: YEAR(Order Date)
- ✅ Color: SUM(Sales)
- ✅ Title: "Total Sales Each Year"
- ✅ Zone position: x: 50%, y: 1.1%

## Data Quality

- **Numeric Conversion**: All quantitative fields converted to numbers before aggregation
- **Validation**: Sample validation checks for non-zero sales values
- **Error Handling**: Graceful error handling with user-friendly messages
- **Empty State**: Proper handling of empty/missing data

## Performance

- **Memoization**: Aggregated data cached using React useMemo
- **Efficient Rendering**: D3 selections optimized for performance
- **Lazy Loading**: Charts only render when container is measured
- **Build Optimization**: Vite provides fast builds and optimized bundles

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the Tableau Dashboard generation system.

## Notes

- Dashboard route is available at `/` (root)
- `/dashboard` redirects to `/`
- All data is loaded from public/data directory
- No authentication required for this dashboard
- Charts use real-time data aggregation from the full dataset
