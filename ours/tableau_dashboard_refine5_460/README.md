# Tableau Dashboard - Superstore Orders Analysis

A React-based dashboard application that visualizes Superstore Orders data using D3.js, implementing Tableau's structured specification and render contract.

## Overview

This dashboard provides an interactive analysis of sales data with four visualizations:

1. **Sales by Sub Category** - Horizontal ranked bar chart showing sales performance by product sub-category
2. **Total Sales Each Year** - Line chart displaying yearly sales trends
3. **Scatterplot** - Scatter plot showing the relationship between Sales and Profit, with circle size representing Quantity
4. **Line** - Line chart showing sales trends over time (monthly granularity)

## Data Source

The dashboard uses the Superstore Orders dataset:
- **File**: `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`
- **Rows**: 9,994 records
- **Date Range**: 2015-2018
- **Metrics**: Sales, Profit, Quantity, Discount

## Tableau Specification Compliance

This implementation strictly follows the Tableau specification:
- **Chart Types**: Implemented as per `tableau_spec.json` (line_chart, horizontal_ranked_bar, custom_tableau_view)
- **Dashboard Layout**: 2x2 grid layout matching Tableau's zone coordinates
- **Data Aggregation**: Full dataset loaded via fetch, aggregated at runtime
- **Interactive Tooltips**: Hover effects on all data points with formatted values
- **Responsive Design**: Charts adapt to container size with proper margins

## Installation & Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run linter
pnpm lint

# Build for production
pnpm build

# Preview production build
pnpm preview

# Validate data (optional)
pnpm validate:data
```

## Project Structure

```
src/
├── components/          # React chart components
│   ├── LineChart.tsx           # Line chart for date/year data
│   ├── HorizontalBarChart.tsx  # Horizontal ranked bar chart
│   ├── Scatterplot.tsx         # Scatter plot with size encoding
│   ├── Loading.tsx             # Loading state component
│   └── ErrorDisplay.tsx        # Error display component
├── hooks/
│   └── useData.ts              # Custom hook for data loading
├── pages/
│   └── Dashboard.tsx           # Main dashboard page
├── services/
│   ├── dataService.ts          # CSV fetching and aggregation
│   └── dataValidator.ts        # Data quality validation
├── types/
│   └── index.ts                # TypeScript type definitions
└── main.tsx                    # Application entry point
```

## Key Features

### Data Loading & Validation
- Fetches full CSV dataset from `/data/...` endpoint
- Robust CSV parsing with BOM handling
- Type-safe data conversion (quantitative fields coerced to numbers)
- Comprehensive data validation with error reporting

### Chart Implementations
- **D3.js Integration**: All charts built with D3 v7
- **Type Safety**: Full TypeScript support with proper type definitions
- **Accessibility**: Semantic HTML, ARIA labels where applicable
- **Performance**: Efficient data aggregation and rendering

### Interactive Features
- Hover tooltips with formatted values
- Smooth animations and transitions
- Responsive design (mobile-friendly)
- Real-time data validation feedback

## Technical Stack

- **React 19.2.0** - UI framework
- **TypeScript 5.9.3** - Type safety
- **D3.js 7.9.0** - Data visualization
- **Vite 7.3.1** - Build tool and dev server
- **React Router 7.13.2** - Client-side routing

## Data Policy

**Mandatory**: All dashboard data must come from files under `public/data/...`. This application:
- ✅ Loads data via `fetch('/data/...')` from public directory
- ✅ Does NOT import dataset files from source code
- ✅ Does NOT synthesize data from sample rows
- ✅ Aggregates full dataset at runtime for accurate metrics

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This project is part of the Tableau Dashboard Refinement initiative.
