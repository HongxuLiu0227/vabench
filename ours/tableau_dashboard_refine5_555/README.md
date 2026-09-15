# Tableau Dashboard 555 - Synthetic Dashboard

A React-based implementation of Tableau Dashboard 555, visualizing sales data with four interactive worksheets.

## Worksheets

- **Scatterplot** (P121__scatterplot): Custom Tableau view showing Profit vs Sales with Quantity as size
- **Bar** (P121__bar): Horizontal ranked bar chart showing sales by Category and Sub-Category
- **Total Sales Each Year** (P1225__total_sales_each_year): Line chart showing sales trends over years
- **Line** (P121__line): Line chart showing monthly sales trends over time

## Installation

Install dependencies using pnpm:

```bash
pnpm install
```

## Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Testing

This project does not currently have automated tests configured.

## Build

Build the project for production:

```bash
pnpm build
```

The built files will be in the `dist/` directory.

## Linting

Run ESLint to check code quality:

```bash
pnpm lint
```

## Data Source

This dashboard loads data from `/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv` at runtime. The data file contains order information including Sales, Profit, Quantity, and product categorization.

## Tech Stack

- React 19.2.0
- TypeScript
- Vite
- D3.js for data visualization
- React Router DOM for routing

## Dashboard Layout

The dashboard uses a 2x2 grid layout:
- **Top-Left**: Bar chart (horizontal ranked bars)
- **Top-Right**: Line chart (monthly trends)
- **Bottom-Left**: Line chart (yearly sales)
- **Bottom-Right**: Scatterplot

## Implementation Notes

- All data is loaded via `fetch('/data/...')` from the public/data directory
- Worksheets are lazy-loaded for optimal performance
- Charts use D3.js for rendering
- Responsive design adapts to container dimensions
- Data aggregation is performed at runtime using D3's grouping and summing functions
