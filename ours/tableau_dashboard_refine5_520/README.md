# Tableau Dashboard 520

This is a React + TypeScript + Vite application that implements a Tableau dashboard with strict adherence to the Tableau data-source policy and render contract.

## Tableau Spec Compliance

This dashboard implements the following worksheets according to the Tableau render contract:

### Worksheets
1. **P121__line** - Line chart showing monthly sales trends
2. **P1968__customer_overview** - Customer overview by region with multiple metrics
3. **P1225__total_sales_each_year** - Line chart showing yearly sales totals
4. **P121__scatterplot** - Scatter plot showing Sales vs Profit by product

### Data Source Policy
- **All dashboard data is loaded from**: `/data/2648_dash_dashboard0_png_discount_20dashboard/p2648_TableauTemp_0tumk6m1wd3kt01h4z0ux1dz9kj5.csv`
- **No mock or sample data** is used in the application
- **Full dataset** is loaded via `fetch()` and parsed using D3's CSV parser
- **Quantitative fields** are converted to numbers before aggregation using safe type conversion

### Implementation Details

#### Data Loading
- Data is loaded asynchronously via `fetch()` from the public/data directory
- Safe number conversion handles empty strings, non-numeric values, and NaN
- Date validation ensures proper datetime parsing
- Data quality validation checks for:
  - Rows with all zero values
  - Invalid dates
  - NaN values in numeric fields
  - Minimum data quality thresholds

#### Chart Components
All charts are implemented using:
- **D3.js** for data visualization and rendering
- **React** hooks for state management
- **TypeScript** for type safety
- **Full dataset aggregation** - no sample rows or synthetic data

#### Dashboard Layout
The dashboard follows the Tableau render contract zone coordinates:
- 2x2 grid layout matching the Tableau dashboard structure
- Worksheet positioning based on contract zone coordinates
- No invented chrome (hero headers, footer watermarks, etc.)
- Minimal styling to match Tableau's clean aesthetic

### Data Quality
- All numeric fields are converted using `Number()` with validation
- Empty or invalid values are logged and replaced with 0 to prevent chart failures
- Date fields are validated and parsed to Date objects
- Customer counts are tracked using Set to avoid duplicates

## Development

### Prerequisites
- Node.js (v18 or higher recommended)
- pnpm package manager

### Installation
```bash
pnpm install
```

### Development Server
```bash
pnpm dev
```

### Build
```bash
pnpm build
```

### Lint
```bash
pnpm lint
```

**Note:** This project does not have a test suite configured. All validation is performed through:
- TypeScript type checking during build
- ESLint for code quality
- Runtime data quality validation in the data loader

### Preview Production Build
```bash
pnpm preview
```

## Technical Stack
- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.3.1** - Build tool and dev server
- **D3.js 7.9.0** - Data visualization
- **React Router DOM 7.13.2** - Routing

## Tableau Render Contract Compliance Checklist

- [x] All worksheets implement their specified chart intents
- [x] Dashboard composition matches zone coordinates from contract
- [x] All data loaded from `/data/...` URLs (no local imports)
- [x] Quantitative fields converted to numbers before aggregation
- [x] No placeholder text or stub implementations
- [x] No invented chrome or styling not specified by Tableau
- [x] Full dataset loaded (no sample rows in runtime)
- [x] Accessible loading and error states implemented
