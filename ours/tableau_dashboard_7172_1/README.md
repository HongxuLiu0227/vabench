# Brokers Stats Dashboard

A React + TypeScript implementation of a Tableau workbook displaying boat sales broker statistics with interactive D3-based visualizations.

## Overview

This dashboard visualizes boat sales data across three dimensions:
1. **Sail vs Power** - Boat types sold by each broker
2. **Price Cut** - Boats sold with/without price cuts by each broker
3. **Used vs New** - Boat conditions sold by each broker

## Tech Stack

- **React 19.2.0** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.3.1** - Build tool
- **D3.js v7** - Data visualization (scales, axes, shapes)
- **React Router DOM v7** - Client-side routing
- **d3-dsv** - CSV parsing

## Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint -- --max-warnings 0
```

## Project Structure

```
src/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard container
│   ├── HorizontalRankedBarChart.tsx  # D3 bar chart
│   ├── ChartLegend.tsx  # Legend component
│   └── *Worksheet.tsx   # Individual worksheet components
├── contexts/            # React Context for state
├── services/            # Data loading and transformation
├── types/               # TypeScript interfaces
└── App.tsx              # Root component with routing
```

## Data

The dashboard loads data from:
```
/data/Sold_Boats_Report_07-13-2020_11_37_51.csv
```

Data transformations include:
- Date parsing (MM/dd/yyyy format)
- Sold price extraction from "USD XXXXX" format
- HasPriceCut calculated field
- Filtering by 10 specific brokers
- Date range filter (2012-01-21 to 2020-07-06)

## Features

- ✅ Interactive D3-based horizontal bar charts
- ✅ Click to select brokers with dashboard-wide highlight interactions
- ✅ Auto-clear selection/hightlight behavior (click outside to clear)
- ✅ Hover tooltips with detailed information
- ✅ Color-coded series (Sail/Power, Price Cut, Used/New)
- ✅ Responsive layout
- ✅ Client-side routing with React Router
- ✅ Full Tableau-spec compliance (worksheets, dashboard zones, actions, highlight bindings)
- ✅ Accessible loading and error states
- ✅ Data loaded from public/data directory via fetch
- ✅ Quantitative fields properly converted to numbers before aggregation

## Build Status

✅ TypeScript compilation: Passing
✅ ESLint: Passing
✅ Production build: Successful

## Tableau Spec Compliance

### Worksheets Implemented (3/3)
1. ✅ **Number of Boats Sold By Brokers(Price Cut)**
   - Chart type: horizontal_ranked_bar
   - Series field: Calculation_1145603158979420163 (HasPriceCut)
   - Axis title: "Number of Boats Sold"
   - Legend: Required (position: right)
   - Filter: 10 brokers, date range 2012-01-21 to 2020-07-06

2. ✅ **Number of Boats Sold By Brokers(Sail vs Power)**
   - Chart type: horizontal_ranked_bar
   - Series field: Boat Type
   - Axis title: "Number of Boats Sold"
   - Legend: Required (position: right)
   - Filter: 10 brokers, date range 2012-01-21 to 2020-07-06

3. ✅ **Number of Boats Sold By Brokers(Used vs New)**
   - Chart type: horizontal_ranked_bar
   - Series field: Boat Condition
   - Axis title: "Number of Boats Sold"
   - Legend: Required (position: right)
   - Filter: 10 brokers, date range 2012-01-21 to 2020-07-06

### Dashboard Interactions (2/2 actions, 5/5 highlight bindings)
- ✅ Action1: Highlight brush on Price Cut worksheet (auto-clear: true)
- ✅ Action2: Dashboard-wide highlight (auto-clear: true)
- ✅ 5 highlight bindings implemented for cross-worksheet filtering

### Dashboard Zones
- ✅ 3 worksheets positioned according to Tableau zone coordinates
- ✅ Vertical stacking layout matching spec dimensions
- ✅ Fixed-size dashboard (827x1169) per spec

### Data Policy Compliance
- ✅ Data loaded from `/data/Sold_Boats_Report_07-13-2020_11_37_51.csv`
- ✅ No local imports from src/data or src/mocks
- ✅ Quantitative fields converted to numbers via Number()/parseFloat()
- ✅ Full dataset loaded via fetch, not sample rows
- ✅ Date filtering applied: 2012-01-21 to 2020-07-06
- ✅ Broker filtering applied: 10 specific brokers

## Recent Improvements

1. **Fixed TypeScript type mismatch** - Added `total` field to `BrokerChartData` interface
2. **Enhanced interactions** - Implemented dashboard-wide highlight/filter with auto-clear
3. **Improved accessibility** - Replaced generic divs with accessible LoadingState and ErrorState components
4. **Better label visibility** - Increased left margin to 180px to ensure full broker names are visible
5. **Complete interaction implementation** - All Tableau dashboard actions and highlight bindings now functional

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
