# Tableau Dashboard 206 - Synthetic Sales Analytics Dashboard

A React + TypeScript + Vite application that recreates a Tableau dashboard for visualizing sales data with interactive D3-based charts.

## Overview

This project implements a Tableau-style dashboard with four worksheets visualizing global sales data:
- **Sales by Sub-Category** - Horizontal ranked bar chart showing sales by product sub-category
- **Scatterplot** - Scatter plot showing Sales vs. Profit by product (bubble size = quantity)
- **Total Sales Each Year** - Line chart showing annual sales trends
- **Line** - Line chart showing monthly sales trends over time

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization
- **React Router DOM** - Client-side routing
- **PapaParse** - CSV parsing

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard layout
│   ├── LineChart.tsx          # Line chart component
│   ├── HorizontalRankedBar.tsx # Horizontal bar chart component
│   └── ScatterPlot.tsx        # Scatter plot component
├── services/
│   └── dataLoader.ts          # Data loading and aggregation logic
├── App.tsx                    # Router configuration
├── main.tsx                   # Application entry point
└── index.css                  # Global styles
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Development

Open [http://localhost:5173](http://localhost:5173) to view the dashboard in your browser.

## Data Source

The dashboard loads sales data from:
```
/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv
```

The CSV file is automatically parsed on the client side using PapaParse, with proper type coercion for numeric fields (Sales, Profit, Quantity, Discount, Shipping Cost).

## Dashboard Layout

The dashboard follows a 2x2 grid layout as specified in the Tableau render contract:

```
┌─────────────────────────┬─────────────────────────┐
│  Sales by Sub-Category  │      Scatterplot        │
│  (Horizontal Bars)      │  (Sales vs Profit)      │
├─────────────────────────┼─────────────────────────┤
│  Total Sales Each Year  │         Line            │
│  (Annual Trend)         │    (Monthly Trend)      │
└─────────────────────────┴─────────────────────────┘
```

## Features

- **Interactive Charts** - Hover over data points to see detailed tooltips
- **Responsive Layout** - Charts adapt to container size
- **Dynamic Margins** - Axis labels are automatically sized to prevent clipping
- **Type-Safe Data Handling** - All numeric values are properly parsed from CSV strings
- **Client-Side Routing** - Uses React Router DOM with BrowserRouter

## Chart Implementations

### Line Chart (P121__line, P1225__total_sales_each_year)
- Uses D3 scaleTime for x-axis and scaleLinear for y-axis
- Supports both monthly and yearly granularity
- Includes hover tooltips showing date and sales values
- Smooth curve interpolation using d3.curveMonotoneX

### Horizontal Ranked Bar (P9517__sales_by_sub_category)
- Displays sub-categories sorted by sales (descending)
- Uses D3 scaleBand for categorical y-axis
- Includes value labels on each bar
- Horizontal orientation for better readability of long category names

### Scatter Plot (P121__scatterplot)
- X-axis: Sales, Y-axis: Profit
- Bubble size represents Quantity
- Uses D3 scaleSqrt for size encoding
- Semi-transparent circles with stroke for better visual distinction

## Tableau Spec Compliance

This implementation follows the structured specifications in:
- `docs/tableau_spec.json` - Authoritative machine-readable contract
- `docs/tableau_render_contract.json` - Final authority for chart geometry/layout

### Compliance Checklist

✅ **P121__line** (Line Chart)
- Chart type: Line chart with time-series x-axis
- Rows: Sales (sum)
- Cols: Order Date (month granularity)
- Title: "Line"
- Legend: Not required
- Axis titles: Not specified

✅ **P9517__sales_by_sub_category** (Horizontal Ranked Bar)
- Chart type: Horizontal bar chart
- Rows: Sub-Category
- Cols: Sales (sum)
- Title: "Sales by Sub Category"
- Legend: Not required
- Axis titles: Not specified
- Sorted: Descending by sales

✅ **P1225__total_sales_each_year** (Line Chart)
- Chart type: Line chart with yearly x-axis
- Rows: Sales (sum)
- Cols: Order Date (year granularity)
- Title: "Total Sales Each Year"
- Legend: Not required
- Axis titles: Not specified

✅ **P121__scatterplot** (Scatter Plot)
- Chart type: Scatter plot with size encoding
- Rows: Profit (sum)
- Cols: Sales (sum)
- Size: Quantity (sum)
- Title: "Scatterplot"
- Legend: Not required
- Axis titles: Not specified

## Building for Production

```bash
# Run linter
pnpm lint

# Build application
pnpm build

# Output will be in /dist directory
```

The production build has been verified to compile successfully with:
- TypeScript strict mode enabled
- ESLint passing with zero warnings
- All assets properly bundled and minified

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
