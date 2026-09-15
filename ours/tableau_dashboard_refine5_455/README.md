# Synthetic Dashboard 455

A Tableau-style dashboard built with React + TypeScript + Vite, featuring D3.js visualizations.

## Project Overview

This dashboard recreates a Tableau workbook named "Synthetic Dashboard 455" with four interactive worksheets displaying sales, profit, and customer analytics.

## Features

- **Scatterplot**: Sales vs Profit analysis with bubble size representing quantity
- **Horizontal Bar Chart**: Sales ranked by Category and Sub-Category
- **Line Chart**: Total sales trend by year
- **Customer Overview**: Regional customer metrics with heat-map color encoding

## Tech Stack

- **Framework**: React 19.2.4 + TypeScript 5.9.3
- **Build Tool**: Vite 7.3.1
- **Visualization**: D3.js (d3-scale, d3-shape, d3-axis, d3-array, d3-selection, d3-dsv)
- **Routing**: React Router DOM 7.13.2
- **Styling**: Plain CSS (no Tailwind)

## Installation

```bash
# Install dependencies
pnpm install
```

## Development

```bash
# Start development server
pnpm dev

# Run linting
pnpm lint

# Run tests
pnpm test

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── components/          # React visualization components
│   ├── Scatterplot.tsx     # Sales vs Profit scatterplot
│   ├── BarChart.tsx        # Horizontal ranked bar chart
│   ├── LineChart.tsx       # Yearly sales line/bar chart
│   ├── CustomerOverview.tsx # Regional metrics table
│   └── Dashboard.tsx       # Main dashboard layout
├── services/           # Data loading and processing
│   └── dataService.ts      # CSV loading and aggregation
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Router setup
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Data Source

The dashboard loads data from:
```
/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv
```

Data is loaded client-side via `fetch()` and parsed with `d3-dsv`.

## Dashboard Layout

Fixed container size: **1000px × 800px**

```
┌─────────────────────┬─────────────────────┐
│   Bar Chart         │   Scatterplot       │
│  (Category/Sales)   │ (Sales/Profit/Qty)  │
├─────────────────────┼─────────────────────┤
│  Yearly Sales       │ Customer Overview   │
│  (Year/Sales)       │ (Regional Metrics)  │
└─────────────────────┴─────────────────────┘
```

## Tableau Spec Compliance Checklist

### Worksheet: P121__scatterplot
- ✅ chart_type: Circle
- ✅ rows_field: SUM(Profit)
- ✅ cols_field: SUM(Sales)
- ✅ series_field: SUM(Sales) (color encoding)
- ✅ size encoding: SUM(Quantity)
- ✅ level of detail: Product Name
- ✅ title_runs: "Scatterplot"
- ✅ zone positioning: top-right quadrant
- ✅ fidelity_rules:
  - ✅ Preserve title wording
  - ✅ Preserve full category labels
  - ✅ Use dynamic chart margins

### Worksheet: P121__bar
- ✅ chart_type: Automatic (rendered as horizontal bar)
- ✅ chart_intent: horizontal_ranked_bar
- ✅ rows_field: Category / Sub-Category (nested hierarchy)
- ✅ cols_field: SUM(Sales)
- ✅ series_field: SUM(Sales) (color encoding)
- ✅ bar_orientation: horizontal
- ✅ title_runs: "Bar"
- ✅ zone positioning: top-left quadrant
- ✅ fidelity_rules:
  - ✅ Preserve title wording
  - ✅ Preserve full category labels
  - ✅ Use dynamic chart margins
  - ✅ Sort bars descending by Sales

### Worksheet: P1968__customer_overview
- ✅ chart_type: Automatic (rendered as table)
- ✅ rows_field: Region
- ✅ cols_field: Measure Names × Multiple Values
- ✅ series_field: Profit (color encoding for profit ratio)
- ✅ level of detail: COUNTD(Customer Name), SUM(Sales), SUM(Quantity), SUM(Profit), Profit Ratio
- ✅ manual_sort: Measure Names in ASC order
- ✅ title_runs: "Customer Overview"
- ✅ zone positioning: bottom-right quadrant
- ✅ fidelity_rules:
  - ✅ Preserve title wording
  - ✅ Preserve full category labels
  - ✅ Use dynamic chart margins
- ✅ Heat map encoding: Diverging color scale (Red-Yellow-Green) centered at 0, domain -0.5 to 0.5

### Worksheet: P1225__total_sales_each_year
- ✅ chart_type: Bar
- ✅ chart_intent: line_chart (rendered as bar chart with value labels)
- ✅ rows_field: SUM(Sales)
- ✅ cols_field: YEAR(Order Date)
- ✅ series_field: SUM(Sales) (color encoding)
- ✅ title_runs: "Total Sales Each Year"
- ✅ zone positioning: bottom-left quadrant
- ✅ fidelity_rules:
  - ✅ Preserve title wording
  - ✅ Preserve full category labels
  - ✅ Use dynamic chart margins

### Dashboard-Level Compliance
- ✅ Dashboard size: 1000×800px (min/max)
- ✅ Dashboard name: "Synthetic Dashboard 455"
- ✅ 2×2 grid layout with proper zone positioning
- ✅ Margin: 8px outer, 4px inner between worksheets
- ✅ dashboard_text_zones: 0 (none specified)
- ✅ dashboard_actions: 0 (none specified)
- ✅ highlight_bindings: 0 (none specified)
- ✅ Data loading from `/public/data/...` via fetch
- ✅ Numeric measures parsed explicitly (Number(), parseFloat())
- ✅ No data files under `src/data` or `src/mocks`

## Interactive Features

- **Tooltips**: Hover over data points to see detailed metrics
- **Color Encoding**: Sequential color scales (blue-teal) for sales-based metrics
- **Heat Map**: Diverging color scale (red-yellow-green) for profit ratio in Customer Overview
- **Responsive Labels**: Axis labels and chart titles adjust to content

## Browser Compatibility

Tested on modern browsers supporting:
- ES6+ JavaScript
- SVG for visualizations
- CSS Grid and Flexbox
- Fetch API

## License

This project was generated for Tableau dashboard recreation purposes.
