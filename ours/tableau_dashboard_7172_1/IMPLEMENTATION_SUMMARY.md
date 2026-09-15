# Tableau Dashboard Implementation Summary

## Project Overview
This project is a React + TypeScript implementation of a Tableau workbook displaying boat sales broker statistics.

## Tech Stack
- **Framework**: React 19.2.0 + TypeScript 5.9.3
- **Build Tool**: Vite 7.3.1
- **Visualization**: D3.js (v7) for chart rendering
- **Routing**: React Router DOM v7
- **Data Parsing**: d3-dsv for CSV parsing

## Project Structure
```
src/
├── components/
│   ├── Dashboard.tsx           # Main dashboard container
│   ├── Dashboard.css           # Dashboard styling
│   ├── HorizontalRankedBarChart.tsx  # D3-based bar chart
│   ├── ChartLegend.tsx         # Legend component
│   ├── PriceCutWorksheet.tsx   # Price cut analysis worksheet
│   ├── SailVsPowerWorksheet.tsx  # Sail vs Power worksheet
│   └── UsedVsNewWorksheet.tsx  # Used vs New worksheet
├── contexts/
│   └── DashboardContext.tsx    # Global state management
├── services/
│   └── dataService.ts          # Data loading and transformation
├── types/
│   └── index.ts                # TypeScript interfaces
├── App.tsx                     # Root component with routing
├── main.tsx                    # Application entry point
└── App.css                     # Global styles
```

## Data Loading
- CSV data is loaded from `/data/Sold_Boats_Report_07-13-2020_11_37_51.csv`
- Data transformation includes:
  - Date parsing (MM/dd/yyyy format)
  - Sold price parsing (format: "USD 12345")
  - HasPriceCut calculated field
  - Number type coercion for aggregations

## Worksheets Implemented

### 1. Number of Boats Sold By Brokers(Sail vs Power)
- **Chart Type**: Horizontal ranked bar chart
- **Series**: Boat Type (Sail/Power)
- **Colors**: Power (#4e79a7), Sail (#f28e2b)
- **Legend**: Right-aligned

### 2. Number of Boats Sold By Brokers(Price Cut)
- **Chart Type**: Horizontal ranked bar chart
- **Series**: HasPriceCut (Price Cut/No Price Cut)
- **Colors**: No Price Cut (#59a14f), Price Cut (#edc948)
- **Legend**: Right-aligned

### 3. Number of Boats Sold By Brokers(Used vs New)
- **Chart Type**: Horizontal ranked bar chart
- **Series**: Boat Condition (Used/New)
- **Colors**: Used (#91dcea), New (#fd6f30)
- **Legend**: Right-aligned

## Features Implemented

### ✅ Tableau Spec Compliance
- [x] Chart type: horizontal_ranked_bar for all worksheets
- [x] Axis titles: "Number of Boats Sold"
- [x] Series fields mapped correctly (HasPriceCut, Boat Type, Boat Condition)
- [x] Filters applied (10 specific brokers)
- [x] Date range filter (2012-01-21 to 2020-07-06)
- [x] Legend rendering with correct colors and positions
- [x] Data sorting by total count (descending)

### ✅ Interactions
- [x] Click on broker bar to select
- [x] Hover tooltips showing broker, category, and count
- [x] Dashboard context for selection state
- [x] Highlight/opacity changes on selection
- [x] Auto-clear behavior on click outside

### ✅ Visual Fidelity
- [x] Dynamic chart margins for full label visibility
- [x] Horizontal bars stacked by category
- [x] Count labels on bars
- [x] Clean, Tableau-faithful styling
- [x] Responsive layout

### ✅ Routing
- [x] React Router DOM with BrowserRouter
- [x] Dashboard rendered at `/` (root)
- [x] `/dashboard` route as alias
- [x] All routes redirect to dashboard

## Build & Lint Status
✅ **Build**: Passing (TypeScript + Vite)
✅ **Lint**: Passing (ESLint with --max-warnings 0)
✅ **Dependencies**: All packages installed successfully

## Running the Project

### Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

### Lint
```bash
npm run lint -- --max-warnings 0
```

## Data Policy Compliance
- ✅ All data loaded from `/public/data/...`
- ✅ No CSV files under `src/data` or `src/mocks`
- ✅ Full dataset loaded via fetch
- ✅ Numeric measures parsed before aggregation

## Notes
- The implementation follows Tableau render contract specifications
- All charts use D3 scales and shapes (no chart libraries)
- State management via React Context API
- CSS modules for component isolation
- TypeScript strict mode enabled
