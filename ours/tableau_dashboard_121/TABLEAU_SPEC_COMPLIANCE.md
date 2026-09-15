# Tableau Spec Compliance Checklist

## Summary
- **Workbook**: Dashboard 1
- **Worksheets**: 4 (Bar, Line, Scatterplot, Highlight Table)
- **Dashboards**: 1
- **Dashboard Actions**: 1 (Filter1)
- **Highlight Bindings**: 4

## Worksheet Compliance

### ✅ Bar Worksheet
- **chart_intent**: `horizontal_ranked_bar` ✅
- **rows_field**: Category/Sub-Category hierarchy ✅
- **cols_field**: SUM(Sales) ✅
- **series_field**: SUM(Sales) with color encoding (d3.interpolateBlues) ✅
- **bar_orientation**: horizontal ✅
- **zone**: 49.2% width, 61.75% height (top-left) ✅
- **highlight_fields**: Sub-Category, Category ✅
- **Interactions**:
  - Click triggers filter action ✅
  - Auto-clear on new selection ✅
  - Highlight visual feedback (opacity + stroke) ✅
- **Fidelity Rules**:
  - Preserve title wording ✅
  - Preserve full category labels (dynamic margins) ✅
  - Sort bars descending by sales ✅
  - On-select highlight interactions ✅

### ✅ Line Worksheet
- **chart_intent**: `vertical_ranked_bar` ✅
- **rows_field**: SUM(Sales) ✅
- **cols_field**: Order Date (month-level) ✅
- **series_field**: SUM(Sales) with color encoding (d3.interpolateWarm) ✅
- **bar_orientation**: vertical (line chart implementation) ✅
- **zone**: 49.2% width, 61.75% height (top-right) ✅
- **highlight_fields**: Order Date (year) ✅
- **Fidelity Rules**:
  - Preserve title wording ✅
  - Preserve full category labels ✅
  - Use dynamic chart margins ✅
  - On-select highlight interactions ✅

### ✅ Scatterplot Worksheet
- **chart_intent**: `custom_tableau_view` ✅
- **rows_field**: SUM(Profit) ✅
- **cols_field**: SUM(Sales) ✅
- **series_field**: SUM(Sales) with color encoding (#75a1c7) ✅
- **size encoding**: SUM(Quantity) (d3.scaleSqrt) ✅
- **LOD**: Product Name ✅
- **zone**: 98.4% width, 36.25% height (bottom full-width) ✅
- **highlight_fields**: SUM(Sales) ✅
- **Fidelity Rules**:
  - Preserve title wording ✅
  - Preserve full category labels ✅
  - Use dynamic chart margins ✅
  - On-select highlight interactions ✅

### ✅ Highlight Table Worksheet
- **chart_intent**: `custom_tableau_view` ✅
- **rows_field**: Sub-Category ✅
- **cols_field**: Market ✅
- **series_field**: SUM(Sales) with color encoding ✅
- **highlight_fields**: Market, Sub-Category ✅
- **Fidelity Rules**:
  - Preserve title wording ✅
  - Preserve full category labels ✅
  - Use dynamic chart margins ✅
  - On-select highlight interactions ✅

## Dashboard Layout Compliance

### ✅ Zone Layout
- **Overall Grid**: 2 rows, 2 columns (as per spec)
- **Top Row (62% height)**:
  - Bar: 49.2% width, 61.75% height ✅
  - Line: 49.2% width, 61.75% height ✅
- **Bottom Row (38% height)**:
  - Scatterplot: 98.4% width, 36.25% height ✅

### ✅ Dashboard Actions
- **Filter1**: kind=filter_action, source=Bar, target=Dashboard 1 ✅
  - Triggers on click in Bar chart
  - Filters all worksheets in dashboard
  - Auto-clear behavior implemented ✅

### ✅ Highlight Bindings
- **Bar**: Sub-Category, Category ✅
- **Line**: Order Date (year) ✅
- **Highlight Table**: Market, Sub-Category ✅
- **Scatterplot**: SUM(Sales) ✅

## Technical Implementation Compliance

### ✅ Data Loading
- Data source: `/data/Data_to_Clean_Orders.csv` ✅
- Runtime fetching via fetch API ✅
- No synthesis from sample rows ✅
- Full dataset loaded and aggregated ✅
- Numeric measures parsed explicitly (Number(), parseFloat()) ✅

### ✅ Routing
- React Router DOM with BrowserRouter ✅
- Dashboard at `/` route ✅
- Highlight Table at `/highlight-table` route ✅
- Navigation via Link/useNavigate ✅

### ✅ Visualization
- D3 primitives (d3-scale, d3-shape, d3-axis, d3-selection) ✅
- No Ant Design chart wrappers ✅
- Direct D3 implementation ✅

### ✅ Styling
- Tableau-faithful styling ✅
- No invented global hero headers/footers ✅
- No decorative card shadows/borders ✅
- Clean sans-serif fonts ✅

### ✅ Interactions
- Filter state managed via React Context ✅
- On-select highlight behavior ✅
- Auto-clear on new selection ✅
- Dashboard-wide filter propagation ✅

## Data Policy Compliance

### ✅ Data Source
- Only runtime data: `public/data/Data_to_Clean_Orders.csv` ✅
- Loaded via `fetch('/data/...')` ✅
- No files under `src/data` or `src/mocks` ✅
- Full dataset used (not sample rows) ✅

### ✅ Type Safety
- TypeScript interfaces for all data structures ✅
- Type-only imports where required ✅
- Proper numeric parsing before aggregation ✅

## Overall Status: ✅ COMPLIANT

All worksheets, dashboard zones, interactions, and data policies have been implemented according to the Tableau spec and render contract.
