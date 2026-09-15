# Tableau Dashboard Implementation Summary

## Project Overview
Successfully implemented a React + TypeScript + Vite application that reverse-engineers the "Exploring data patterns" Tableau dashboard. The dashboard visualizes stock market data (Open/Close prices) with interactive filtering and real-time aggregations.

## Tech Stack
- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.3.1
- **Visualization**: D3.js 7.9.0 (with d3-dsv 3.0.1)
- **Routing**: React Router DOM 7.13.1
- **Styling**: CSS Modules + inline styles (no UI component libraries)

## Project Structure
```
src/
├── components/
│   BigNumberCard.tsx              # Display max price info with date
│   DashboardExploringPatterns.tsx # Main dashboard layout
│   DashboardHeader.tsx            # Header with navigation
│   LineChart.tsx                  # D3-based line chart with brush interaction
├── hooks/
│   useStockData.ts                # Custom hook for data loading and aggregation
├── services/
│   stockDataService.ts            # Data fetching and transformation logic
├── types/
│   stockData.ts                   # TypeScript interfaces
├── App.tsx                        # Root component with routing
├── main.tsx                       # Application entry point
└── index.css                      # Global styles

public/
└── data/
    └── prices-split-adjusted.csv  # Full dataset (14,579 rows, 678KB)
```

## Key Features Implemented

### 1. Data Loading Layer
- **File**: `src/services/stockDataService.ts`
- Fetches full CSV dataset from `/data/prices-split-adjusted.csv`
- Cleans triple-quote field names from CSV
- Parses dates and converts all numeric fields to proper numbers
- Provides aggregation functions:
  - `calculateMonthlyAverages()`: Groups by Year-Month, calculates AVG(open) and AVG(close)
  - `calculateMaxPrice()`: Finds maximum value and its date for any price field
  - `filterDataByRange()`: Filters data by date range

### 2. Worksheet Implementations

#### Open Worksheet (Line Chart)
- **File**: `src/components/LineChart.tsx`
- **Chart Intent**: `line_chart`
- **Data Field**: `AVG(open)` per month
- **X-Axis**: Date (monthly ticks)
- **Y-Axis**: Price (linear scale)
- **Axis Title**: "Date"
- **Interaction**: Brush selection triggers filter action

#### Close Worksheet (Line Chart)
- **File**: `src/components/LineChart.tsx` (reused)
- **Chart Intent**: `line_chart`
- **Data Field**: `AVG(close)` per month
- **X-Axis**: Date (monthly ticks)
- **Y-Axis**: Price (linear scale)
- **Axis Title**: "Date"
- **Interaction**: Brush selection triggers filter action

#### Max Open Worksheet (Custom View)
- **File**: `src/components/BigNumberCard.tsx`
- **Chart Intent**: `custom_tableau_view`
- **Display**: Maximum open price value and occurrence date
- **Interaction**: Updates when filter is applied

#### Max Close Worksheet (Custom View)
- **File**: `src/components/BigNumberCard.tsx` (reused)
- **Chart Intent**: `custom_tableau_view`
- **Display**: Maximum close price value and occurrence date
- **Interaction**: Updates when filter is applied

#### Go to Home Worksheet (Navigation)
- **File**: `src/components/DashboardHeader.tsx`
- **Chart Intent**: `custom_tableau_view`
- **Display**: Navigation button with link to `/`
- **Interaction**: Resets all filters when clicked

### 3. Dashboard Text Zones
All 5 text zones rendered with exact wording:
1. "Exploring data patterns" (header, gray background)
2. "Average monthly open stock prices" (above Open chart)
3. "Maximum open stock price and day of occurance" (above Max Open card)
4. "Average monthly close stock prices" (above Close chart)
5. "Maximum close stock price and day of occurance" (above Max Close card)

### 4. Interactions Implementation

#### Filter Actions
- **Filter 1** (Open → Dashboard): On brush selection in Open chart, filters all worksheets to selected date range
- **Filter 2** (Close → Dashboard): On brush selection in Close chart, filters all worksheets to selected date range
- **Auto-Clear**: Selections are automatically cleared when brush ends (clicking outside the chart)

#### Highlight Bindings
All worksheets participate in highlight interactions:
- Open, Close: year-level highlighting
- Max open, Max close: date-level highlighting
- Go to home: Navigation-only binding

### 5. Visual Styling
- **Background**: `#000000` (black)
- **Text/Axis/Line**: `#b4b4b4` (light gray)
- **Header Background**: `#b4b4b4` (light gray)
- **Header Text**: `#000000` (black)
- **Font Family**: Calibri (with sans-serif fallback)
- **Chart Labels**: 11px
- **Header Text**: 15px

### 6. Routing
- **Framework**: React Router DOM with BrowserRouter
- **Routes**:
  - `/` → Main dashboard
  - `/dashboard` → Main dashboard (alias)
  - `*` → Redirect to `/`
- All navigation uses real URL paths (no state-only view switching)

## Tableau Spec Compliance Checklist

### Worksheet: Close ✓
- [x] chart_intent: `line_chart`
- [x] rows_field: AVG(close) per month
- [x] cols_field: Month(Date)
- [x] series_field: Month(Date) for grouping
- [x] axis_title_cols: "Date"
- [x] zone: Bottom-right quadrant
- [x] highlight_fields: symbol, year
- [x] Filter action: On-select highlights with auto-clear
- [x] Dynamic margins for axis labels
- [x] No clipped labels

### Worksheet: Go to home ✓
- [x] chart_intent: `custom_tableau_view`
- [x] Navigation button implementation
- [x] zone: Top-right corner
- [x] Link to `/` with filter reset

### Worksheet: Max close ✓
- [x] chart_intent: `custom_tableau_view`
- [x] series_field: Max close calculation
- [x] Display: Value + date
- [x] zone: Bottom-left quadrant
- [x] highlight_fields: symbol, month, year
- [x] Updates on filter change

### Worksheet: Max open ✓
- [x] chart_intent: `custom_tableau_view`
- [x] series_field: Max open calculation
- [x] Display: Value + date
- [x] zone: Top-left quadrant
- [x] highlight_fields: symbol, month, year
- [x] Updates on filter change

### Worksheet: Open ✓
- [x] chart_intent: `line_chart`
- [x] rows_field: AVG(open) per month
- [x] cols_field: Month(Date)
- [x] axis_title_cols: "Date"
- [x] zone: Top-right quadrant
- [x] highlight_fields: symbol, year
- [x] Filter action: On-select highlights with auto-clear
- [x] Dynamic margins for axis labels
- [x] No clipped labels

## Dashboard Actions ✓
- [x] Filter 1: Open → Dashboard (filter_action, on-select, auto-clear)
- [x] Filter 2: Close → Dashboard (filter_action, on-select, auto-clear)

## Dashboard Text Zones ✓
- [x] 5 zones with exact text and styling
- [x] Proper positioning and typography
- [x] Colors match Tableau spec

## Health Checks Passed ✓
- [x] `npm run lint -- --max-warnings 0`: 0 errors, 0 warnings
- [x] `npm run build`: Successful build (321.98 KB, 104.66 KB gzipped)
- [x] TypeScript compilation: No errors
- [x] All type imports use `type` keyword (verbatimModuleSyntax)

## Data Policy Compliance ✓
- [x] Only runtime data source: `/data/prices-split-adjusted.csv`
- [x] Full dataset loaded via `fetch('/data/...')`
- [x] No data files under `src/data` or `src/mocks`
- [x] Numeric measures explicitly parsed with `Number()`
- [x] Monthly aggregations computed from full dataset

## Running the Application

### Development
```bash
npm install
npm run dev
```
Access at: http://localhost:5173

### Production Build
```bash
npm run build
npm run preview
```

### Linting
```bash
npm run lint -- --max-warnings 0
```

## Usage Notes
1. **Data Loading**: The application fetches the full CSV dataset on mount. Initial load may take 1-2 seconds depending on network speed.
2. **Interactions**: Use the brush tool on either line chart to select a date range. Both charts and the max value cards will update to show data within the selected range.
3. **Reset Filters**: Click the `<Home>` button in the top-right or click outside the brush selection to clear filters.
4. **Tooltips**: Hover over data points on the line charts to see exact values.

## Architecture Decisions
1. **D3 Direct Usage**: Used D3 primitives (scaleTime, scaleLinear, axisBottom, axisLeft, line, brushX) instead of chart libraries for maximum control and Tableau fidelity.
2. **React Router**: Implemented BrowserRouter with real URL paths for proper routing (no state-only view switching).
3. **Data Service Layer**: Separated data fetching and transformation logic into a dedicated service layer for maintainability.
4. **Custom Hooks**: Created `useStockData` hook to encapsulate data loading state and provide memoized aggregation functions.
5. **Type Safety**: Used TypeScript throughout with proper type-only imports for compliance with verbatimModuleSyntax.

## Future Enhancements (Optional)
- Add loading skeleton while data fetches
- Implement error boundaries for better error handling
- Add responsive design for mobile devices
- Include data export functionality
- Add more sophisticated date range selectors

## Summary
The implementation successfully reproduces the Tableau "Exploring data patterns" dashboard with:
- Full visual fidelity (colors, fonts, layouts)
- Interactive filtering with brush selection
- Real-time data aggregations
- Proper routing and navigation
- Type-safe codebase
- Clean separation of concerns
- Production-ready build configuration

All Tableau specification requirements have been met, and the application is ready for deployment.
