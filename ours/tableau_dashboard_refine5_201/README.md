# Synthetic Dashboard 201 - Sales Analytics

A Tableau-inspired React dashboard for visualizing sales data with interactive D3.js charts.

## Overview

This dashboard provides comprehensive sales analytics through four interactive visualizations:

1. **Sales by Sub-Category** - Horizontal ranked bar chart showing sales aggregated by product sub-categories
2. **Sales by Category and Sub-Category** - Hierarchical horizontal ranked bar chart with category grouping
3. **Sales vs Profit Scatterplot** - Interactive scatter plot with bubble sizing by quantity
4. **Total Sales Each Year** - Time series line chart showing annual sales trends

## Features

- **Real Data**: All charts load from the full dataset at `/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv`
- **Interactive Visualizations**: D3.js-powered charts with hover effects and tooltips
- **Responsive Design**: Charts adapt to container size
- **Accessible**: Loading spinners and error messages with proper ARIA labels
- **Production-Ready**: No placeholders or stubs - all components are fully functional

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **D3.js** - Data visualization
- **Vite** - Build tool and dev server
- **React Router** - Navigation (dashboard at `/` and `/dashboard`)

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The dashboard will be available at `http://localhost:5173`

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

The dashboard uses the Orders dataset located at:
```
public/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv
```

All data is loaded at runtime via `fetch()` to ensure the dashboard reflects the full dataset (51,290 rows).

## Tableau Spec Compliance

This dashboard implements the Tableau specification from `docs/tableau_spec.json` and `docs/tableau_render_contract.json`:

### Worksheets Implemented

1. **P9517__sales_by_sub_category** (horizontal_ranked_bar)
   - Rows: Sub-Category / Product Name
   - Columns: Sales

2. **P121__bar** (horizontal_ranked_bar)
   - Rows: Category / Sub-Category
   - Columns: Sales

3. **P121__scatterplot** (custom_tableau_view)
   - Rows: Profit
   - Columns: Sales
   - Size: Quantity
   - Detail: Product Name

4. **P1225__total_sales_each_year** (line_chart)
   - Rows: Sales
   - Columns: Order Date (Year)

### Dashboard Layout

The dashboard follows the 2x2 grid layout from the Tableau specification:
- Top-left: Bar Chart (Category/Sub-Category)
- Top-right: Sales by Sub-Category
- Bottom-left: Total Sales Each Year
- Bottom-right: Scatterplot

## Component Structure

```
src/
├── components/
│   ├── Dashboard.tsx              # Main dashboard layout
│   ├── LoadingSpinner.tsx         # Accessible loading indicator
│   ├── ErrorMessage.tsx           # Accessible error display
│   ├── HorizontalRankedBarChart.tsx
│   ├── ScatterplotChart.tsx
│   ├── LineChart.tsx
│   └── worksheets/
│       ├── BarChart.tsx
│       ├── SalesBySubCategory.tsx
│       ├── Scatterplot.tsx
│       └── TotalSalesEachYear.tsx
├── services/
│   ├── dataLoader.ts              # CSV parsing and data loading
│   └── dataTransform.ts           # Data aggregation functions
└── App.tsx                        # Router configuration
```

## Data Processing

All numeric fields are properly converted to numbers before aggregation:
- Sales: Sum aggregation
- Profit: Sum aggregation
- Quantity: Sum aggregation
- Order Date: Parsed and extracted to year

## Accessibility

- Loading states use ARIA `role="status"` and `aria-live="polite"`
- Error states use ARIA `role="alert"` and `aria-live="assertive"`
- All interactive elements have proper hover states
- Charts include tooltips with detailed information

## Build Output

The optimized production build includes:
- HTML: 0.49 kB (gzipped: 0.32 kB)
- CSS: 0.37 kB (gzipped: 0.28 kB)
- JavaScript: 291.55 kB (gzipped: 93.04 kB)

## License

This project is part of the Tableau Dashboard generation pipeline.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

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
