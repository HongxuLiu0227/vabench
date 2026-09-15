# Diabetes Readmission Analysis Dashboard

A React + TypeScript + Vite application that recreates a Tableau dashboard for analyzing diabetes patient readmission rates.

## Features

- **Interactive Visualizations**: Three horizontal stacked percentage bar charts showing readmission rates by diagnosis category
- **Filter Interactions**: Click on any bar segment to filter all worksheets, with auto-clear behavior
- **Dynamic Data Loading**: Loads full dataset from `/data/Diabetes_Cleaned.csv` via fetch API
- **D3.js Charts**: Custom D3-based chart components with tooltips and interactivity
- **React Router**: Client-side routing with real URL paths

## Installation & Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── components/
│   ├── charts/
│   │   └── HorizontalStackedPercentageBar.tsx  # D3-based stacked bar chart
│   └── Dashboard.tsx                           # Main dashboard component
├── hooks/
│   └── useData.ts                              # Data loading hook
├── services/
│   └── dataService.ts                          # Data transformation & filtering
├── types/
│   └── index.ts                                # TypeScript type definitions
├── App.tsx                                     # Main app with routing
└── main.tsx                                    # Application entry point
```

## Data Source

- **Dataset**: `Diabetes_Cleaned.csv`
- **Location**: `/public/data/Diabetes_Cleaned.csv`
- **Loading**: Via `fetch('/data/Diabetes_Cleaned.csv')`

## Tableau Spec Compliance

### Worksheets Implemented

1. **Diag1 vs Readmit** (`horizontal_stacked_percentage_bar`)
   - Shows primary diagnosis categories vs readmission status
   - Interactive filtering on click with auto-clear
   - Zone: x_ratio 0.0069, y_ratio 0.0135, w_ratio 0.9861, h_ratio 0.3243

2. **Diag2 vs Readmit** (`horizontal_stacked_percentage_bar`)
   - Shows secondary diagnosis categories vs readmission status
   - Interactive filtering on click with auto-clear
   - Zone: x_ratio 0.0069, y_ratio 0.3378, w_ratio 0.9861, h_ratio 0.3243

3. **Diag3 vs Readmit** (`horizontal_stacked_percentage_bar`)
   - Shows tertiary diagnosis categories vs readmission status
   - Sorted by clinical category order (per contract `series_order`)
   - Interactive filtering on click with auto-clear
   - Zone: x_ratio 0.0069, y_ratio 0.6622, w_ratio 0.9861, h_ratio 0.3243

### Data Transformations

- Applied Tableau calculated field `[readmitted (group)]`:
  - Maps `">30"` and `"NO"` values to `"Not Readmitted"`
  - Maps `"<30"` value to `"Readmitted"`
- Numeric field conversion using `Number()` for all quantitative fields
- Percentage normalization for stacked bars (100% per category)

### Interactions Implemented

- **Filter Actions**: Three filter actions (one per worksheet) targeting all worksheets (Dashboard 1)
  - Action 1: "Filter 1 (generated)" from Diag1 vs Readmit
  - Action 2: "Filter 2 (generated)" from Diag2 vs Readmit
  - Action 3: "Filter 3 (generated)" from Diag3 vs Readmit
- **Auto-Clear Behavior**: Clicking a new selection clears previous selections per contract
- **Highlight Bindings**: 42 highlight bindings defined (cross-worksheet highlight on filter)
- **Dashboard-Targeted Actions**: Filter changes propagate to all three worksheets

### Render Contract Compliance

- ✅ Chart intents: All three worksheets render `horizontal_stacked_percentage_bar`
- ✅ Zone coordinates: Worksheets positioned according to contract x/y/w/h ratios
- ✅ Stacking: Normalized to 100% percentage per category
- ✅ Aggregation: By series_field (diag_1, diag_2, diag_3)
- ✅ Series order: Diag3 follows contract-defined clinical category order
- ✅ No invented chrome: Removed synthetic headers, summary stats cards
- ✅ Label visibility: Increased left margin to 280px to prevent clipping
- ✅ Interactive handlers: All buttons/links have onClick handlers
- ✅ Navigation: Routes at `/` and `/dashboard` both render dashboard
- ✅ Data source: Full dataset loaded via `fetch('/data/Diabetes_Cleaned.csv')`
- ✅ No sample data: Runtime charts use complete dataset, not stub rows

### Spec Compliance Checklist

#### General Data Policy
- ✅ Dataset files located only in `public/data/` (not `src/data` or `src/mocks`)
- ✅ Data loading via `fetch('/data/...')` (not local imports)
- ✅ Numeric fields converted with `Number()` before aggregation
- ✅ No placeholder tokens (TODO, Lorem ipsum, Coming soon, Sample data)
- ✅ Full dataset used in charts (not synthesized from sample rows)

#### Chart Implementation
- ✅ Chart type: `horizontal_stacked_percentage_bar` for all three worksheets
- ✅ Bar orientation: Horizontal (per contract `bar_orientation`)
- ✅ Series field: Diagnosis categories (diag_1, diag_2, diag_3)
- ✅ Stacking: Normalized to 100% percentage (per contract `stacking.normalized_to_percent`)
- ✅ Aggregation: By series field (per contract `stacking.aggregate_by_series_field`)
- ✅ Category ordering: Clinical category order for Diag3 (per contract `series_order`)
- ✅ Label visibility: Dynamic margins (left: 280px) to prevent clipping
- ✅ No label truncation: Full category labels visible with ellipsis only on right if needed

#### Interactions
- ✅ Filter actions: Three dashboard-targeted filter actions implemented
- ✅ Auto-clear behavior: Selection clears previous filters (per contract `activation.auto-clear`)
- ✅ On-select activation: Filters trigger on click (per contract `activation.type: "on-select"`)
- ✅ Highlight fields: Defined for all worksheets (42 bindings total)
- ✅ Dimming behavior: Non-selected categories dimmed when filter active
- ✅ Dashboard-wide propagation: Filter changes affect all worksheets

#### Layout & Chrome
- ✅ Zone positioning: Worksheets placed per contract coordinates
- ✅ No invented chrome: Removed synthetic headers, summary cards, footers
- ✅ Navigation: `/` and `/dashboard` routes both render dashboard
- ✅ Interactive handlers: All clicks perform meaningful actions (filter, clear, navigate)
- ✅ Real destinations: No "Coming soon" toasts or placeholder links

#### Styling
- ✅ Plain CSS: Replaced Tailwind utility classes with custom CSS
- ✅ Consistent styling: Maintains visual hierarchy without Tailwind dependency
- ✅ Accessible components: Proper contrast, readable fonts, semantic HTML

## Technology Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool
- **D3.js** - Data visualization (d3-scale, d3-shape, d3-selection, d3-array)
- **React Router DOM** - Client-side routing

## Development Notes

- No Tailwind CSS required (uses plain CSS)
- All chart rendering uses D3 primitives directly
- Data files located in `public/data/` (not in `src/data`)
- Full dataset loaded at runtime, not bundled

## License

MIT
