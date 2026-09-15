# Tableau Spec Compliance Checklist

## Dashboard: CityBike Challenge (Dashboard-usertype)

### Worksheets Implemented: 2/2

---

## Worksheet 1: Usertype by Age

### Chart Configuration
- ✅ **chart_intent**: `horizontal_ranked_bar` - Implemented as horizontal bar chart
- ✅ **rows_field**: `[none:usertype:nk]` - Mapped to Y-axis (Subscriber, Customer)
- ✅ **cols_field**: `[avg:Calculation_1234830743585095680:qk]` - Mapped to X-axis (Average Age)
- ✅ **series_field**: `[none:usertype:nk]` - Used for color encoding
- ✅ **bar_orientation**: `horizontal` - Bars render horizontally

### Visual Encoding
- ✅ **Color Mapping**:
  - Subscriber: `#e15759` (red)
  - Customer: `#edc948` (yellow)
- ✅ **Axis Titles**:
  - Y-axis: "Usertype"
  - X-axis: "Average Age"
- ✅ **Sorting**: Bars sorted by avg age descending
- ✅ **Dynamic Margins**: Left margin calculated to prevent label clipping

### Interactions
- ✅ **Highlight Fields**: `[none:usertype:nk]` - Click to select usertype
- ✅ **On-Select Behavior**: Toggles selection, dims non-selected bars
- ✅ **Auto-Clear**: Clicking same bar again clears selection
- ✅ **Tooltips**: Show usertype, avg age, and trip count on hover

### Layout
- ✅ **Zone Position**: x=1231, y=1103, w=97538, h=27587
- ✅ **Aspect Ratio**: ~3.5:1 (wider than tall)
- ✅ **Padding**: 20px between charts

---

## Worksheet 2: Usertype by Gender

### Chart Configuration
- ✅ **chart_intent**: `vertical_ranked_bar` - Implemented as vertical grouped bar chart
- ✅ **rows_field**: `[__tableau_internal_object_id__].[cnt:_6A3F8AF9D57442BFAC88113923A51491:qk]` - Mapped to Y-axis (Count of Trips)
- ✅ **cols_field**: `[none:usertype:nk] / [none:Calculation_1049057258591756288:nk]` - Grouped bars by usertype and gender
- ✅ **series_field**: `[none:Calculation_1049057258591756288:nk]` - Gender (mapped to color)
- ✅ **bar_orientation**: `vertical` - Bars render vertically

### Visual Encoding
- ✅ **Color Mapping**:
  - Unknown: `#59a14f` (green)
  - Male: `#f28e2b` (orange)
  - Female: `#b07aa1` (purple)
- ✅ **Axis Titles**:
  - Y-axis: "Count of Trips"
  - X-axis: Categories (Subscriber, Customer)
- ✅ **Grouping**: Side-by-side bars for each gender within usertype
- ✅ **Legend**: Gender legend at top of chart

### Interactions
- ✅ **Highlight Fields**:
  - `[none:Calculation_1049057258591756288:nk]` (Gender)
  - `[none:usertype:nk]` (Usertype)
- ✅ **Filter Response**: Chart updates when usertype selected in Age chart
- ✅ **Dimming**: Non-filtered usertype groups dimmed when filter active
- ✅ **Tooltips**: Show usertype, gender, and trip count on hover

### Layout
- ✅ **Zone Position**: x=1231, y=28690, w=97538, h=70207
- ✅ **Aspect Ratio**: ~1.4:1 (taller than wide)
- ✅ **Padding**: 20px between charts

---

## Dashboard Actions

### Filter3 (Action4)
- ✅ **kind**: `filter_action`
- ✅ **activation**: `on-select` with `auto-clear: true`
- ✅ **source**: Dashboard-usertype (Usertype by Age worksheet)
- ✅ **target**: Dashboard-usertype (both worksheets)
- ✅ **Implementation**: Clicking bar in Age chart filters both charts by usertype

---

## Highlight Bindings

### Usertype by age
- ✅ **Fields**: `[none:usertype:nk]`
- ✅ **Mode**: `color-one-way`
- ✅ **Behavior**: Bars highlighted on hover/selection

### Usertype by gender
- ✅ **Fields**:
  - `[none:Calculation_1049057258591756288:nk]` (Gender)
  - `[none:usertype:nk]` (Usertype)
- ✅ **Mode**: `color-one-way`
- ✅ **Behavior**: Bars respond to cross-worksheet filtering

---

## Fidelity Rules Compliance

### Both Worksheets
- ✅ **Title Wording**: Preserved from title_runs (empty, so using worksheet names)
- ✅ **Full Category Labels**: No clipped labels, dynamic margins ensure visibility
- ✅ **Dynamic Chart Margins**: Calculated based on label width/height
- ✅ **Sort Order**: Descending by displayed measure (avg age for Age, count for Gender)
- ✅ **On-Select Highlight**: Click to select with visual feedback
- ✅ **Auto-Clear Behavior**: Clicking same item clears selection

---

## Data Loading Policy

- ✅ **Data Source**: `/data/TEMP_0du9fqe1d1zge91goeeim12daxpo.csv` (public/data directory)
- ✅ **Loading Method**: `fetch('/data/...')` - No synthesized data
- ✅ **Full Dataset**: All rows loaded and aggregated at runtime
- ✅ **No src/mocks**: No mock data in source directory
- ✅ **Numeric Parsing**: All measures parsed with `Number()` before aggregation
- ✅ **Calculated Fields**:
  - Age = 2021 - birth_year
  - GenderName = mapped from gender code

---

## Routing

- ✅ **React Router DOM**: Implemented with `BrowserRouter`
- ✅ **Dashboard Route**: `/` (primary route)
- ✅ **Alias Route**: `/dashboard` (redirects to `/`)
- ✅ **Navigation**: Real URL paths (not state-only view switching)

---

## Technical Implementation

- ✅ **D3.js Primitives**: Using d3-scale, d3-axis, d3-shape, d3-selection directly
- ✅ **No High-Level Libraries**: No Recharts, Nivo, or Ant Design charts
- ✅ **TypeScript**: Full type safety with named exports
- ✅ **Clean Lint**: ESLint passes with 0 errors
- ✅ **Successful Build**: TypeScript compilation and Vite build successful

---

## Summary

✅ **All 2 worksheets implemented**
✅ **All 1 dashboard action implemented**
✅ **All 2 highlight bindings implemented**
✅ **0 dashboard text zones** (none specified)
✅ **Tableau spec contract honored**
✅ **Render contract followed**
✅ **Data policy compliance verified**

**Overall Status**: COMPLETE ✅
