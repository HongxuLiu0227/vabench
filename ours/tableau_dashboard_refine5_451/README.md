# Synthetic Dashboard 451 - Tableau Recreation

A React + TypeScript + Vite application that recreates a Tableau dashboard visualizing Superstore sales data.

## Tech Stack

- **Framework**: React 19.2.4
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.3.1
- **Visualization**: D3.js 7.9.0 (using primitives: d3-scale, d3-shape, d3-axis, d3-selection, d3-time)
- **Routing**: React Router DOM 7.13.2
- **Data Parsing**: d3-dsv 3.0.1

## Project Structure

```
src/
├── components/          # Chart components
│   ├── Dashboard.tsx           # Main dashboard layout
│   ├── ChartContainer.tsx      # Reusable chart wrapper with resize handling
│   ├── SalesBySubCategory.tsx  # Horizontal ranked bar chart
│   ├── Scatterplot.tsx         # Scatter plot with color/size encoding
│   ├── TotalSalesEachYear.tsx  # Line chart by year
│   └── LineChartByMonth.tsx    # Line chart by month
├── services/
│   └── dataLoader.ts           # Data fetching and CSV parsing
├── types/
│   └── index.ts                # TypeScript type definitions
├── utils/
│   └── dataTransformations.ts  # Data aggregation utilities
└── App.tsx                     # Router configuration
```

## Dashboard Layout

The dashboard is arranged in a 2×2 grid:

| **Sales by Sub Category** | **Scatterplot** |
|---------------------------|-----------------|
| **Total Sales Each Year** | **Line** |

## Worksheet Specifications

### 1. P9517__sales_by_sub_category
- **Chart Type**: Horizontal Ranked Bar
- **Y-Axis**: Sub-Category (dimension)
- **X-Axis**: SUM(Sales)
- **Features**: Sorted by sales descending, tooltips on hover

### 2. P121__scatterplot
- **Chart Type**: Scatter Plot
- **X-Axis**: SUM(Sales)
- **Y-Axis**: SUM(Profit)
- **Color**: Encodes Sales (sequential blue scale)
- **Size**: Encodes Quantity (sqrt scaling)
- **Level of Detail**: Product Name (each circle = one product)

### 3. P1225__total_sales_each_year
- **Chart Type**: Line Chart (by Year)
- **X-Axis**: YEAR(Order Date)
- **Y-Axis**: SUM(Sales)
- **Features**: Data labels on bars, color encodes sales value

### 4. P121__line
- **Chart Type**: Line Chart (by Month)
- **X-Axis**: MONTH(Order Date)
- **Y-Axis**: SUM(Sales)
- **Features**: Gradient stroke (turbo color), area fill, interactive dots

## Data Loading

Data is loaded from `/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv`

The CSV contains Superstore transaction data with fields including:
- Category, Sub-Category, Product Name
- Sales, Profit, Quantity, Discount
- Order Date, Ship Date
- Customer Name, Region, State, City

## Development

### Install Dependencies
```bash
pnpm install
```

### Run Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

### Run Linter
```bash
pnpm lint
```

### Preview Production Build
```bash
pnpm preview
```

## Tableau Spec Compliance Checklist

✅ **P121__line** (Line Chart by Month)
- chart_intent: line_chart ✓
- rows_field: SUM(Sales) ✓
- cols_field: MONTH(Order Date) ✓
- series_field: SUM(Sales) ✓
- title: "Line" ✓
- Dynamic margins for full label visibility ✓

✅ **P9517__sales_by_sub_category** (Horizontal Ranked Bar)
- chart_intent: horizontal_ranked_bar ✓
- rows_field: Sub-Category / Product Name ✓
- cols_field: SUM(Sales) ✓
- bar_orientation: horizontal ✓
- title: "Sales by Sub Category" ✓
- Dynamic margins for full label visibility ✓
- Sorted by sales descending ✓

✅ **P1225__total_sales_each_year** (Line Chart by Year)
- chart_intent: line_chart ✓
- rows_field: SUM(Sales) ✓
- cols_field: YEAR(Order Date) ✓
- series_field: SUM(Sales) ✓
- title: "Total Sales Each Year" ✓
- Dynamic margins for full label visibility ✓

✅ **P121__scatterplot** (Scatter Plot)
- chart_intent: custom_tableau_view ✓
- rows_field: SUM(Profit) ✓
- cols_field: SUM(Sales) ✓
- series_field: SUM(Sales) (color encoding) ✓
- Additional encoding: size by Quantity ✓
- Level of detail: Product Name ✓
- title: "Scatterplot" ✓
- Dynamic margins for full label visibility ✓

## Features

- **Responsive Design**: All charts use ResizeObserver for automatic resizing
- **Interactive Tooltips**: Hover over any data element to see detailed information
- **Client-Side Routing**: Uses React Router with BrowserRouter
- **Type Safety**: Full TypeScript implementation
- **Clean Architecture**: Separation of concerns between data loading, transformation, and visualization
- **Tableau-Faithful Styling**: Clean white backgrounds, grey axis lines, legible fonts

## Data Policy

All dashboard data is loaded from `public/data/` directory via fetch API. No data files are stored under `src/data` or `src/mocks`.

## License

This project was generated as part of a Tableau dashboard recreation exercise.
