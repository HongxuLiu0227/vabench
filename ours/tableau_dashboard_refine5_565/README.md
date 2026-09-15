# Tableau Dashboard - Synthetic Dashboard 565

A React + TypeScript + Vite implementation of a Tableau dashboard featuring sales analytics visualizations using D3.js.

## Project Overview

This project recreates a Tableau workbook dashboard with the following worksheets:
- **Scatterplot** (P121__scatterplot): Sales vs Profit with Quantity as bubble size
- **Horizontal Bar Chart** (P121__bar): Sales by Category and Sub-Category
- **Total Sales Each Year** (P1225__total_sales_each_year): Line chart showing annual sales trends
- **Sales by Date** (P121__line): Time series of sales over order dates

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization
- **PapaParse** - CSV parsing
- **React Router DOM** - Client-side routing

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The application will be available at `http://localhost:5173/`

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

## Data Source

The dashboard loads data from:
```
/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv
```

This CSV contains sales transaction data with fields including:
- Order Date, Ship Date
- Sales, Profit, Quantity, Discount
- Category, Sub-Category, Product Name
- Customer and geographic information

## Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   └── Dashboard.tsx          # Main dashboard layout (2x2 grid)
│   └── worksheets/
│       ├── Scatterplot.tsx        # Sales vs Profit scatter plot
│       ├── HorizontalBar.tsx      # Sales by Category/Sub-Category
│       ├── SalesByYear.tsx        # Annual sales line chart
│       └── SalesByDate.tsx        # Daily sales time series
├── services/
│   └── dataLoader.ts              # CSV loading and data transformation
├── types/
│   └── data.ts                    # TypeScript type definitions
├── App.tsx                        # Router configuration
└── main.tsx                       # Application entry point
```

## Features

### Data Loading
- Client-side CSV parsing with PapaParse
- Data caching for performance
- Numeric parsing for all measures
- Automatic data aggregation

### Visualizations
- **Scatterplot**: Bubble chart with size encoding for quantity
- **Horizontal Bar**: Sorted bars with category color coding
- **Line Charts**: Smooth curves with grid lines and data points
- **Tooltips**: Interactive hover information on all charts

### Routing
- `/` - Main dashboard
- `/dashboard` - Dashboard alias
- All other routes redirect to `/`

## Tableau Spec Compliance Checklist

### P121__scatterplot
- ✅ `chart_type`: Circle (implemented as scatter plot with bubbles)
- ✅ `rows`: Profit (Y-axis)
- ✅ `cols`: Sales (X-axis)
- ✅ `title_runs`: "Scatterplot"
- ✅ Size encoding by Quantity
- ✅ Color encoding by Sales
- ✅ No axis titles (as per spec)
- ✅ No legend (not required)

### P121__bar
- ✅ `chart_type`: Automatic (horizontal bars)
- ✅ `rows`: Category / Sub-Category hierarchy
- ✅ `cols`: Sales
- ✅ `title_runs`: "Bar"
- ✅ `bar_orientation`: Horizontal
- ✅ Sorted by Sales descending
- ✅ Color by Category
- ✅ No axis titles (as per spec)
- ✅ No legend (not required)

### P1225__total_sales_each_year
- ✅ `chart_type`: Bar (rendered as line chart per render contract)
- ✅ `rows`: Sales
- ✅ `cols`: Order Date (year)
- ✅ `title_runs`: "Total Sales Each Year"
- ✅ Time-based X-axis
- ✅ No axis titles (as per spec)
- ✅ No legend (not required)

### P121__line
- ✅ `chart_type`: Automatic (line chart)
- ✅ `rows`: Sales
- ✅ `cols`: Order Date (month)
- ✅ `title_runs`: "Line"
- ✅ Time-series X-axis
- ✅ No axis titles (as per spec)
- ✅ No legend (not required)

### Dashboard Layout
- ✅ 2x2 grid layout
- ✅ Zone positions matching Tableau spec
- ✅ Responsive container with max-width
- ✅ Consistent margins and spacing

### Interactions
- ✅ Hover tooltips on all data points
- ✅ Visual feedback on hover (opacity, size changes)
- ✅ No dashboard actions required (spec: 0 actions)
- ✅ No highlight bindings required (spec: 0 bindings)

## Browser Compatibility

Works on all modern browsers that support:
- ES6+ JavaScript
- SVG for D3.js visualizations
- CSS Grid for layout

## Performance Considerations

- Data is cached after first load
- SalesByDate chart samples data points for performance (14MB dataset)
- All charts use React refs for D3 DOM manipulation
- Efficient re-renders with proper dependency arrays

## License

MIT
