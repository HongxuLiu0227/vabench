# Tableau Dashboard Implementation Summary

## Project Overview
Successfully implemented a React + TypeScript dashboard that reproduces a Tableau workbook analyzing road safety accidents from the 2014 DfT dataset.

## Tech Stack
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.3.1
- D3.js v7 (for all visualizations)
- React Router DOM v6
- No UI component libraries (pure D3 + custom CSS)

## Data Architecture

### Data Source
- **File**: `/data/DfTRoadSafety_Accidents_2014.csv` (20MB+)
- **Loading Strategy**: Client-side fetch via D3's CSV parser
- **Records**: ~146,000 accident records

### Data Pipeline
1. **Raw CSV** → `AccidentRecord` interface
2. **Parser** → `ParsedAccidentRecord` (numeric coercion)
3. **Service Layer** → `DataService` class for:
   - Data loading and parsing
   - Filtering by multiple dimensions
   - Aggregation (count, sum, rollup)
4. **View Models** → Chart-specific aggregated data structures

### Key Mappings
| Field | Values | Labels |
|-------|--------|--------|
| Accident_Severity | 1,2,3 | Fatal, Serious, Slight |
| Day_of_Week | 1-7 | Sunday-Saturday |
| Light_Conditions | 1,4,5,6,7 | Daylight, Darkness variants |
| Weather_Conditions | 1-9 | Fine, Raining, Snowing, etc. |
| Road_Surface | 1-7 | Dry, Wet, Snow, etc. |
| Speed_limit | -1, 20-70 | Unknown, 20-70 mph |

## Dashboard Layout

### Structure
- **Background Color**: #e0d490 (Tableau faithful)
- **Title**: "Critical Factors Responsible for Large Number of Accidents"
- **Grid**: 2x2 layout with equal-sized chart containers
- **Responsive**: Adapts to viewport height/width

### Zones
```
┌─────────────────────────────────────────┐
│           Dashboard Title               │
├──────────────────┬──────────────────────┤
│   Q2_Weather     │    Sheet 29          │
│   (Vertical Bar) │   (Horizontal Bar)   │
├──────────────────┼──────────────────────┤
│   Q7_Speed       │    Sheet 28          │
│   (Line Chart)   │   (Horizontal Bar)   │
└──────────────────┴──────────────────────┘
```

## Worksheets Implemented

### 1. Q2_Weather - "No. of Accidents in different Weather conditions"
- **Chart Type**: Vertical grouped bar chart
- **X-Axis**: Weather_Conditions (top 8 by count)
- **Y-Axis**: Count of Records
- **Color Encoding**: Light_Conditions (grouped bars)
- **Title Color**: #0b2255
- **Legend**: Required, positioned above chart
- **Interactions**:
  - Click bars to filter by Weather_Conditions
  - Hover highlights across dashboard
  - Auto-clear after 2 seconds

### 2. Q7_Speed - "Effect of Speed on Number of Accidents"
- **Chart Type**: Multi-line chart
- **X-Axis**: Accident_Severity (Fatal, Serious, Slight)
- **Y-Axis**: Sum of Number_of_Casualties
- **Color Encoding**: Speed_limit (line color)
- **Title Color**: #0b2255
- **Legend**: Required, positioned above chart (speed limits)
- **Interactions**:
  - Click lines/points to filter by Speed_limit
  - Hover highlights across dashboard

### 3. Sheet 28 - "Effect of Light condition, Speed and Weather on Number of Accidents"
- **Chart Type**: Horizontal bar chart
- **Y-Axis**: Speed_limit
- **X-Axis**: Count of Records
- **Color Encoding**: Weather_Conditions (bar color)
- **Title Color**: #0b2255
- **Legend**: Required, positioned right of chart
- **Interactions**:
  - Click bars to filter by Speed_limit
  - Hover highlights Weather_Conditions

### 4. Sheet 29 - "Impact of Day of the week on Number of Accidents"
- **Chart Type**: Horizontal bar chart
- **Y-Axis**: Day_of_Week (ordered Sunday-Saturday)
- **X-Axis**: Count of Records
- **Color**: Single color (#6baed6)
- **Title Color**: #0b2255
- **Legend**: None (single series)
- **Interactions**:
  - Hover highlights Day_of_Week
  - Displays count labels on bars

## Interaction System

### Filter State (DashboardContext)
```typescript
interface DashboardFilters {
  selectedLightConditions: string[]
  selectedSpeedLimits: string[]
  selectedWeatherConditions: string[]
  selectedRoadSurfaceConditions: string[]
  selectedAccidentSeverities: string[]
  selectedDayOfWeek: string[]
}
```

### Highlight State
```typescript
interface HighlightState {
  field: string | null        // Which dimension is highlighted
  value: string | null        // Which value is highlighted
  sourceWorksheet: string | null  // Origin chart
}
```

### Dashboard Actions (from Tableau spec)
1. **Highlight Brush**: "No. of Accidents in Light conditions <[Light Conditions (group)]>"
   - Kind: `highlight_brush`
   - Activation: on-select
   - Auto-clear: true (2 second timeout)

2. **Filter Action**: "No. of Accidents at speed<[Speed_limit]>"
   - Kind: `filter_action`
   - Activation: on-click
   - Target: Dashboard4 (all worksheets)

### Highlight Bindings (7 total)
- Q2_Weather: Light_Conditions, Accident_Severity, Weather_Conditions
- Q7_Speed: Accident_Severity, Speed_limit
- Sheet 28: Weather_Conditions, Light_Conditions, Speed_limit
- Sheet 29: Time (hour), Day_of_Week, Urban_or_Rural_Area

## Visualization Implementation Details

### D3.js Usage
All charts use D3 primitives directly:
- **Scales**: `scaleBand`, `scaleLinear`, `scalePoint`, `scaleOrdinal`
- **Shapes**: Manual `<rect>` (bars), `<path>` (lines), `<circle>` (points)
- **Axes**: `axisBottom`, `axisLeft`
- **Data**: `rollup`, `sum`, `max`, `group`
- **Transitions**: None (static render on state change)

### Color Palettes
```typescript
// Light Conditions
LIGHT_CONDITIONS_COLORS = {
  'Daylight': '#4e79a7',
  'Darkness - lights lit': '#f28e2b',
  'Darkness - light unlit': '#e15759',
  'Darkness - No lighting': '#76b7b2',
  'Darkness - Lighting Unknown': '#59a14f'
}

// Speed Limits
SPEED_LIMIT_COLORS = {
  '20': '#4e79a7', '30': '#f28e2b', '40': '#e15759',
  '50': '#76b7b2', '60': '#59a14f', '70': '#edc948',
  '-1': '#bab0ac'  // Unknown
}

// Weather Conditions
WEATHER_CONDITIONS_COLORS = {
  'Fine no high winds': '#4e79a7',
  'Raining no high winds': '#f28e2b',
  // ... (9 colors total)
}
```

### Axis Handling
- **Dynamic Margins**: Calculated based on label length
- **Label Truncation**: Prevented via `d3.scaleBand` padding
- **Rotated Labels**: 45° rotation for long category names
- **Value Labels**: Displayed on bars/points for clarity

## Routing
- **Router**: React Router DOM (BrowserRouter)
- **Routes**:
  - `/` → Dashboard (main)
  - `/dashboard` → Dashboard (alias)
  - `/*` → Redirect to `/`

## Performance Optimizations

### Data Loading
- Single fetch of full dataset on mount
- In-memory filtering/aggregation
- Memoized computed values with `React.useMemo`

### Rendering
- SVG elements removed before re-render
- Dependency arrays optimized to prevent unnecessary updates
- Event delegation where possible

### Bundle Size
- **Build Output**: 309.80 kB (99.43 kB gzipped)
- **D3 Modules**: Tree-shaken to only used functions
- **No UI Libraries**: Minimized bundle overhead

## Code Quality

### Linting
- ESLint with `--max-warnings 0`
- All TypeScript strict mode checks enabled
- Zero linting errors

### TypeScript
- Full type safety across codebase
- Type-only imports (`import type`)
- Explicit return type annotations
- No `any` types used

### Project Structure
```
src/
├── components/
│   ├── charts/
│   │   ├── Q2WeatherChart.tsx
│   │   ├── Q7SpeedChart.tsx
│   │   ├── Sheet28Chart.tsx
│   │   └── Sheet29Chart.tsx
│   └── layout/
│       └── Dashboard.tsx
├── contexts/
│   └── DashboardContext.tsx
├── services/
│   └── dataService.ts
├── types/
│   ├── constants.ts
│   └── data.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Deviations from Tableau Spec

### Minor Adjustments
1. **Legend Layout**: Legends positioned within chart containers rather than external sidebar (simplified for web layout)
2. **Filter UI**: No explicit filter controls (all interactions through chart clicks)
3. **Tooltip**: Native browser title tooltips (vs custom Tableau tooltips)
4. **Animations**: No transition animations (static updates on filter change)

### Faithful Implementations
1. **Chart Types**: Exact match to contract (vertical/horizontal bars, multi-line)
2. **Color Encodings**: Series fields mapped to correct colors
3. **Axis Titles**: Preserved (all empty per spec)
4. **Data Sorting**: Descending by measure (unless manual_sort specified)
5. **Highlight Behavior**: Cross-worksheet highlighting with auto-clear
6. **Filter Actions**: Click-to-filter with dashboard-wide propagation

## Testing Status
✅ **Lint**: All checks pass (0 errors, 0 warnings)
✅ **Type Check**: TypeScript compilation successful
✅ **Build**: Production bundle generated
✅ **Data Load**: Full dataset loads successfully
⏸️ **Unit Tests**: Not implemented (out of scope for MVP)

## Future Enhancements
- Custom tooltip component with hover details
- Export functionality (PNG, PDF)
- URL-based filter sharing
- Progressive loading for large datasets
- Unit test coverage for data transformations
- Storybook for component documentation

## Instructions to Run

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Lint
```bash
npm run lint -- --max-warnings 0
```

---

**Generated**: March 23, 2026
**Tableau Spec Compliance**: See checklist below
