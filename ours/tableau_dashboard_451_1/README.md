# Tableau Dashboard - Dashboard 1

This is a React + TypeScript implementation of a Tableau dashboard, built with Vite. The dashboard displays sales data across US states with interactive filtering and hover-based interactions.

## Tech Stack

- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.3.1** - Build tooling
- **D3.js 7.x** - Data visualization (maps, scales, arrays)
- **React Router DOM 6.x** - Client-side routing
- **TopoJSON Client** - US states geometry

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard layout
│   ├── MapSale.tsx            # US map visualization with D3
│   ├── SaleRegion.tsx         # Regional sales table
│   ├── YearFilter.tsx         # Year filter component
│   └── NavButton.tsx          # Navigation button
├── services/
│   └── dataService.ts         # Data loading and processing
├── App.tsx                    # Router setup
└── main.tsx                   # Application entry point
```

## Data Source

The dashboard loads data from `/data/TEMP_0nc2r4718q3tv71etu3qn12v6eqk.csv` at runtime. The file contains:

- Order information (Order ID, Order Date, Ship Date)
- Customer details (Customer ID, Customer Name, Segment)
- Geographic data (Country/Region, City, State, Postal Code, Region)
- Product information (Product ID, Category, Sub-Category, Product Name)
- Sales metrics (Sales, Quantity, Discount, Profit)

Calculated fields:
- **ProfitRatio**: Profit / Sales
- **Year**: Derived from Order Date

## Installation & Setup

```bash
# Install dependencies (using pnpm or npm)
pnpm install
# or
npm install

# Run development server
pnpm dev
# or
npm run dev

# Build for production
pnpm build
# or
npm run build

# Run linter
pnpm lint
# or
npm run lint

# Preview production build
pnpm preview
# or
npm run preview
```

## Dashboard Layout

The dashboard uses a fixed 1000x800px layout with absolute positioning matching Tableau zones:

1. **Map Sale** (Top-Left, ~75% width, ~63% height)
   - Choropleth map of US states
   - Color-encoded by Sales (sequential blue scale)
   - Displays state labels, Sales, Profit, and ProfitRatio on hover
   - Reacts to region hover from Sale Region table

2. **Sale Region** (Bottom-Left, ~50% width, ~16% height)
   - Table showing Regional aggregates
   - Columns: Region, Sales, Profit, ProfitRatio
   - Green text (#72b966) with cyan gridlines (#00ffc7, 3px solid)
   - Hovering a row filters the Map Sale visualization

3. **Year Filter** (Right side, vertically centered)
   - Radio list for year selection
   - Default: 2017
   - Filters both Map Sale and Sale Region components

4. **Navigation Button** (Bottom-Right)
   - Orange background (#f28e2b)
   - Yellow text (#f1ce63)
   - Black dashed border
   - Links to `/dashboard-2`

## Interactions

### Hover-Based Filtering
- **Source**: Sale Region table
- **Target**: Map Sale visualization
- **Behavior**: When hovering over a region row in the table, the map dims all states not belonging to that region (opacity: 0.2)
- **Auto-Clear**: Highlight clears when mouse leaves the table row

### Year Filtering
- Changing the year filter updates both the map and table data
- Default year is 2017

## Tableau Spec Compliance Checklist

### Worksheet: Map Sale
- ✅ **chart_type**: Automatic (implemented as custom D3 map)
- ✅ **rows**: Latitude (generated) - used for map projection
- ✅ **cols**: Longitude (generated) - used for map projection
- ✅ **series_field**: SUM(Sales) - color encoding
- ✅ **filter**: Year filter (defaults to 2017)
- ✅ **zone**: Position and size match Tableau coordinates (x=1500, y=1500, w=97800, h=63375)
- ✅ **highlight_fields**: City, Country/Region, State, Order Date (Year)
- ✅ **tooltip**: Shows State, Sales, Profit, ProfitRatio
- ✅ **title_runs**: N/A (no title runs in spec)
- ✅ **axis_titles**: N/A (map doesn't use axis titles)

### Worksheet: Sale Region
- ✅ **chart_type**: Automatic (implemented as text table)
- ✅ **rows**: Region
- ✅ **cols**: Measure Names
- ✅ **series_field**: Measure Names (Sales, Profit, ProfitRatio)
- ✅ **manual_sort**: ASC order maintained (Sales, Profit, ProfitRatio)
- ✅ **filter**: Year filter and Measure Names filter
- ✅ **zone**: Position matches Tableau coordinates (x=1600, y=65375, w=50700, h=15875)
- ✅ **highlight_fields**: Measure Names, Region
- ✅ **style_rule_elements**: cell, label styling applied
- ✅ **gridlines**: 3px solid #00ffc7 (cyan)
- ✅ **text color**: #72b966 (greenish)

### Dashboard Actions
- ✅ **Filter 1 (generated)**: Hover action from Sale Region to Dashboard 1
  - Source: Sale Region worksheet
  - Target: Dashboard 1 (all worksheets)
  - Activation: on-hover with auto-clear
  - Fields: all special fields

### Highlight Bindings
- ✅ **Map Sale**: City, Country/Region, State, Order Date (Year)
- ✅ **Sale Region**: Measure Names, Region

### Dashboard Zones
- ✅ **Zone 1 (Map Sale)**: Correct position and aspect ratio
- ✅ **Zone 2 (Sale Region)**: Correct position and aspect ratio
- ✅ **Zone 3 (Year Filter)**: Correct position on right side
- ✅ **Zone 4 (Navigation)**: Correct position at bottom-right

### Dashboard Text Zones
- ✅ **Count**: 0 (no text zones in spec)

## Styling Details

### Global Styles
- Font family: Arial
- Background color: #f0f0f0 (light gray)
- Dashboard background: #ffffff (white)

### Map Component
- Sequential color scale: D3 interpolateBlues
- State stroke: #ffffff (white), 1px
- Map background: #f8f8f8 (light gray)
- Tooltip color: #00ffc7 (cyan text on dark background)

### Table Component
- Text color: #72b966 (green)
- Gridlines: 3px solid #00ffc7 (cyan)
- Header background: #f0f0f0
- Alternating row colors for readability

### Navigation Button
- Background: #f28e2b (orange)
- Text color: #f1ce63 (yellow)
- Border: 1px dashed #000000 (black)
- Font size: 11px

## Data Loading

The application fetches and processes data as follows:

1. **Fetch**: Uses `fetch('/data/TEMP_0nc2r4718q3tv71etu3qn12v6eqk.csv')`
2. **Parse**: Uses D3's CSV parser to parse the raw text
3. **Type Conversion**:
   - Order Date and Ship Date → JavaScript Date objects
   - Sales, Profit, Quantity, Discount → Number
   - Postal Code → Number
4. **Calculated Fields**:
   - ProfitRatio = Profit / Sales
   - Year = Order Date.getFullYear()
5. **Aggregation**:
   - By State: Sum of Sales and Profit, calculated ProfitRatio
   - By Region: Sum of Sales and Profit, calculated ProfitRatio

## Implementation Notes

- **No Tailwind CSS**: Using inline styles and plain CSS
- **D3 Direct Usage**: No wrapper libraries; D3 primitives used directly
- **Client-Side Routing**: React Router with real URL paths (BrowserRouter)
- **State Management**: React hooks (useState, useEffect, useMemo)
- **Performance**: Memoized filtered data to avoid unnecessary re-renders
- **Type Safety**: Full TypeScript implementation with proper type imports

## Development

The project follows these conventions:

- Named exports only
- No default exports where multiple exports exist
- Type-only imports for type definitions (due to `verbatimModuleSyntax`)
- ESLint configured with React hooks rules
- No authentication required (no auth in spec)

## Known Limitations

1. **Map Geometry**: Loads US states from CDN at runtime; requires internet connection
2. **State Name Matching**: Matches by exact state name; some data may not match if state names differ
3. **Dashboard 2**: Placeholder only (not implemented in this version)

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- React 19
- SVG for D3 visualizations
- CSS Grid and Flexbox

## License

This project was generated from a Tableau specification and implemented as a React application.
