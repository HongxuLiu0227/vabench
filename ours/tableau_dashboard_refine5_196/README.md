# Tableau Dashboard - Synthetic Dashboard 196

A React-based implementation of a Tableau dashboard with D3.js visualizations.

## Overview

This dashboard displays sales data analysis through three interactive visualizations:

- **Scatterplot**: Shows the relationship between Sales and Profit, with circle size representing Quantity
- **Line Chart**: Displays sales trends over time (monthly aggregation)
- **Yearly Sales Chart**: Shows total sales aggregated by year

## Data Source

All dashboard data is loaded from:
```
/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv
```

The CSV file is fetched at runtime and processed client-side using PapaParse for CSV parsing.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **D3.js v7** - Data visualization
- **PapaParse** - CSV parsing
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server

## Installation

```bash
# Install dependencies
pnpm install
```

## Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Routing

- `/` - Main dashboard (primary route)
- `/dashboard` - Dashboard alias (redirects to `/`)

## Dashboard Layout

The dashboard follows the Tableau specification with a 1000x800 layout:

**Top Row (62% height):**
- Left: Scatterplot (49% width)
- Right: Line Chart (49% width)

**Bottom Row (36% height):**
- Full width: Yearly Sales Chart

## Data Processing

The dashboard processes the raw CSV data with the following transformations:

1. **Scatterplot**: Aggregates Sales, Profit, and Quantity by Product Name
2. **Line Chart**: Aggregates Sales by month (Order Date)
3. **Yearly Sales**: Aggregates Sales by year (Order Date)

All numeric fields are properly converted to numbers before aggregation to prevent string concatenation issues.

## Accessibility

- Loading states use ARIA live regions (`role="status"`, `aria-live="polite"`)
- Error states use ARIA alerts (`role="alert"`, `aria-live="assertive"`)
- Proper semantic HTML structure
- Keyboard navigation support for interactive elements

## Browser Compatibility

Modern browsers with ES2022+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT
