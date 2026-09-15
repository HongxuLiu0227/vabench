# Tableau Dashboard 391

A React + TypeScript + Vite application that recreates a Tableau dashboard with D3-based visualizations.

## Dashboard Overview

This application displays sales data analytics with the following worksheets:

1. **Total Sales Each Year** - Line chart showing sales trends by year
2. **Line** - Monthly sales line chart with detailed time-series data
3. **Sales by Sub Category** - Horizontal ranked bar chart of sales by product sub-category
4. **Scatterplot** - Scatter plot visualizing the relationship between Sales, Profit, and Quantity

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
pnpm build
```

### Preview

```bash
pnpm preview
```

### Linting

```bash
pnpm lint
```

## Data Source

The dashboard loads data from `/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv`

The CSV file contains order records with the following fields:
- Order ID, Order Date, Ship Date
- Customer information (Customer ID, Customer Name, Segment)
- Product details (Category, Sub-Category, Product Name)
- Sales metrics (Sales, Quantity, Discount, Profit, Shipping Cost)

## Technical Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization
- **PapaParse** - CSV parsing
- **React Router DOM** - Client-side routing

## Architecture

### Data Layer (`src/services/`)
- `dataLoader.ts` - Handles CSV data loading and aggregation
- Parses order records and aggregates data by year, month, sub-category, and product

### Components (`src/components/`)
- `Dashboard.tsx` - Main dashboard container with data loading
- `Worksheet.tsx` - Worksheet wrapper component
- `TotalSalesEachYearChart.tsx` - Yearly sales line chart
- `LineChart.tsx` - Monthly sales line chart
- `SalesBySubCategoryChart.tsx` - Horizontal bar chart
- `ScatterPlotChart.tsx` - Scatter plot with size encoding

### Routing
- `/` - Main dashboard (default)
- `/dashboard` - Dashboard alias
- All other routes redirect to `/`

## Tableau Spec Compliance

This implementation follows the Tableau specification defined in:
- `docs/tableau_spec.json` - Authoritative worksheet and dashboard specifications
- `docs/tableau_render_contract.json` - Chart intents and rendering requirements

### Worksheet Implementations

✅ **P1225__total_sales_each_year**
- Chart type: Line chart
- Rows: Sales (sum)
- Columns: Order Date (year)
- Title: "Total Sales Each Year"

✅ **P121__line**
- Chart type: Line chart
- Rows: Sales (sum)
- Columns: Order Date (month)
- Title: "Line"

✅ **P9517__sales_by_sub_category**
- Chart type: Horizontal ranked bar
- Rows: Sub-Category
- Columns: Sales (sum)
- Title: "Sales by Sub Category"
- Sorted: Descending by sales

✅ **P121__scatterplot**
- Chart type: Scatter plot (custom Tableau view)
- Rows: Profit (sum)
- Columns: Sales (sum)
- Size: Quantity (sum)
- Detail: Product Name
- Title: "Scatterplot"

## Features

- **Responsive Design** - Charts adapt to container size
- **Interactive Tooltips** - Hover over data points for details
- **Real Data** - Full dataset loaded from CSV, no sample data
- **Type Safety** - Full TypeScript implementation
- **Clean Build** - Passes ESLint with no warnings

