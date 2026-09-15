# Tableau Dashboard 586 - React Implementation

This project is a React + TypeScript implementation of a Tableau dashboard, recreated using D3.js for visualizations.

## Overview

This dashboard displays sales data analysis with three interactive visualizations:
1. **Scatterplot** - Shows the relationship between Sales and Profit, with circle size representing Quantity
2. **Bar Chart** - Displays sales by Category and Sub-Category
3. **Sales by Sub-Category** - Shows detailed sales breakdown by Sub-Category and Product

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization library
- **React Router DOM** - Client-side routing

## Project Structure

```
src/
├── components/
│   ├── Scatterplot.tsx          # Scatter plot visualization
│   ├── HorizontalBarChart.tsx   # Horizontal bar chart component
│   ├── SalesBySubCategory.tsx   # Sales by sub-category view
│   └── Dashboard.tsx            # Main dashboard layout
├── services/
│   └── dataLoader.ts            # Data loading and aggregation logic
├── types/
│   └── index.ts                 # TypeScript type definitions
├── App.tsx                      # Main app with routing
├── main.tsx                     # Application entry point
└── index.css                    # Global styles
```

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

### Build

```bash
pnpm build
```

### Preview

```bash
pnpm preview
```

### Lint

```bash
pnpm lint
```

## Data Source

The dashboard loads data from:
```
/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv
```

Data is loaded via fetch API and aggregated in the browser using the dataLoader service.

## Features

- **Interactive Visualizations**: All charts support hover interactions with tooltips
- **Responsive Layout**: Dashboard adapts to different screen sizes
- **Real Data**: Uses full dataset from CSV, not sample rows
- **Type-Safe**: Full TypeScript implementation
- **Client-Side Routing**: Uses React Router DOM for navigation
- **Tableau-Faithful**: Follows Tableau specifications for layout and styling

## Dashboard Layout

The dashboard follows the Tableau zone specifications:
- **Top Row**: Scatterplot (left) and Bar Chart (right)
- **Bottom Row**: Sales by Sub-Category (full width)

## Tableau Spec Compliance Checklist

### P121__scatterplot (Scatterplot)
- ✅ chart_type: Circle
- ✅ rows: Profit (sum:Profit:qk)
- ✅ cols: Sales (sum:Sales:qk)
- ✅ encodings.color: Sales
- ✅ encodings.size: Quantity
- ✅ encodings.lod: Product Name
- ✅ title: "Scatterplot"
- ✅ zone positioning: x=800, y=1000, w=49200, h=61748

### P121__bar (Bar)
- ✅ chart_type: Automatic → Horizontal bar
- ✅ rows: Category / Sub-Category hierarchy
- ✅ cols: Sales (sum:Sales:qk)
- ✅ encodings.color: Sales
- ✅ title: "Bar"
- ✅ zone positioning: x=50000, y=1000, w=49200, h=61750
- ✅ sorted by Sales descending

### P9517__sales_by_sub_category (Sales by Sub Category)
- ✅ chart_type: Automatic → Horizontal bar
- ✅ rows: Sub-Category / Product Name hierarchy
- ✅ cols: Sales (sum:Sales:qk)
- ✅ title: "Sales by Sub Category"
- ✅ zone positioning: x=800, y=62750, w=98400, h=36250
- ✅ sorted by Sales descending

### Dashboard Zones
- ✅ Layout matches Tableau zone specifications
- ✅ Background colors match spec (e6e6e6 for scatter container)
- ✅ Margins and padding preserved
- ✅ Aspect ratios maintained

## License

This project was generated from a Vite template and customized for Tableau dashboard recreation.

