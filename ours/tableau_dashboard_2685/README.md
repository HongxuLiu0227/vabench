# Monthly Profit Dashboard - Tableau Recreation

This project is a React + TypeScript implementation of a Tableau dashboard showing monthly profit analysis with top products and customers.

## Overview

The dashboard displays:
- **Monthly Profit**: Vertical bar chart showing profit trends over time
- **Top Products by Profit**: Horizontal bar chart of top 10 products (filtered by selected month)
- **Top Ten Customers by Profit**: Horizontal bar chart of top 10 customers (filtered by selected month)

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **D3.js v7** for data visualization (d3-scale, d3-axis, d3-shape, d3-array, d3-time-format, d3-selection)
- **React Router DOM** for client-side routing
- **CSS** for styling (CSS Modules)

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

### Lint

```bash
pnpm lint
```

## Features

### Interactive Filtering
- Click on any bar in the **Monthly Profit** chart to filter the Top Products and Top Customers charts
- Click the same bar again to clear the filter and show global top 10
- Initial state defaults to September 2010 (201009)

### Data Loading
- Full dataset is loaded from `/data/#TableauTemp_0gk6vqz1hr1vdh1egpwt119prxkq.csv`
- Data is parsed using D3's CSV parser
- Numeric values are properly parsed before aggregation

### Chart Implementation
- **Monthly Profit**: Vertical ranked bar chart with D3 primitives
- **Top Products**: Horizontal ranked bar chart (top 10)
- **Top Customers**: Horizontal ranked bar chart (top 10)
- Dynamic margins for axis labels
- Tableau-faithful color (#4e79a7)

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx           # Main dashboard component
│   ├── Dashboard.css           # Dashboard styling
│   ├── MonthlyProfitChart.tsx  # Vertical bar chart component
│   ├── TopProductsChart.tsx    # Horizontal bar chart (products)
│   └── TopCustomersChart.tsx   # Horizontal bar chart (customers)
├── services/
│   └── dataService.ts          # Data loading and aggregation
├── types/
│   └── index.ts                # TypeScript type definitions
├── utils/
│   └── chartUtils.ts           # D3 chart rendering utilities
├── App.tsx                     # Router configuration
└── main.tsx                    # Application entry point
```

## Tableau Spec Compliance

This implementation follows the structured Tableau specification from `docs/tableau_render_contract.json`:

- ✅ Chart intents implemented (vertical_ranked_bar, horizontal_ranked_bar)
- ✅ Field bindings and aggregations match spec
- ✅ Interactive filtering with auto-clear behavior
- ✅ Preserved exact title wording ("Top Products by Profit", "Top Ten Customers by Profit")
- ✅ Dynamic chart margins for full label visibility
- ✅ Proper numeric parsing before aggregation
- ✅ Client-side routing with React Router
- ✅ Dashboard composition from zone coordinates

## Data Source

Dashboard data is served from the public directory and loaded via fetch API at runtime.

