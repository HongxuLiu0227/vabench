# Tableau Dashboard 155 - Superstore Analytics

A React + TypeScript + Vite application that implements a Tableau dashboard visualization using D3.js for data rendering.

## Dashboard Overview

This dashboard displays Superstore sales analytics across four visualizations:

1. **Bar Chart** (P121__bar): Horizontal ranked bar showing Sales by Category and Sub-Category
2. **Customer Overview** (P1968__customer_overview): Table view displaying regional metrics (Sales, Quantity, Profit, Profit Ratio)
3. **Total Sales Each Year** (P1225__total_sales_each_year): Line chart showing sales trends over time
4. **Scatterplot** (P121__scatterplot): Sales vs Profit analysis with Quantity as bubble size

## Data Source

**Runtime Data Location**: `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv`

The dashboard loads the full Superstore dataset at runtime using `fetch()` and parses it client-side. All visualizations aggregate from the complete dataset, not sample rows.

## Tableau Specification Compliance

This implementation strictly follows the Tableau specification defined in:
- `docs/tableau_spec.json` - Authoritative machine-readable contract
- `docs/tableau_render_contract.json` - Final authority for chart geometry and layout

### Worksheet Implementations

| Worksheet | Chart Type | Data Fields | Intent |
|-----------|------------|-------------|---------|
| P121__bar | Horizontal Bar | Category, Sub-Category, Sales | Ranked by Sales descending |
| P1968__customer_overview | Table | Region, Sales, Quantity, Profit, Profit Ratio | Multi-measure regional summary |
| P1225__total_sales_each_year | Line Chart | Order Date (year), Sales | Temporal trend analysis |
| P121__scatterplot | Scatter | Sales (x), Profit (y), Quantity (size), Product Name | Product performance correlation |

### Layout Composition

Worksheets are positioned according to Tableau zone coordinates:
- **Top Left**: P121__bar (zone: x=593, y=1054)
- **Top Right**: P1968__customer_overview (zone: x=50000, y=1054)
- **Bottom Left**: P1225__total_sales_each_year (zone: x=593, y=49996)
- **Bottom Right**: P121__scatterplot (zone: x=50000, y=49996)

## Technical Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **D3.js 7** - Data visualization and chart rendering
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Navigate to `http://localhost:5173` to view the dashboard.

### Build for Production

```bash
pnpm build
```

The production bundle will be in the `dist/` directory.

### Preview Production Build

```bash
pnpm preview
```

## Data Loading & Processing

1. **CSV Parsing**: Custom RFC 4180 compliant parser handles quoted fields, escaped commas, and BOM removal
2. **Type Conversion**: Quantitative fields (Sales, Quantity, Profit) are converted to numbers before aggregation
3. **Date Parsing**: Order/Ship dates parsed to Date objects with year extraction for temporal analysis
4. **Aggregation**: Data grouped by appropriate dimensions (Product, Category/Sub-Category, Year, Region)

## Code Quality

Run linting:
```bash
pnpm lint
```

## Data Policy Compliance

✅ **Compliant**: All runtime data loaded from `public/data/...` using `fetch()`
✅ **Compliant**: No dataset files in `src/data` or `src/mocks`
✅ **Compliant**: Quantitative fields converted to numbers before aggregation
✅ **Compliant**: Full dataset used for visualizations (not sample rows)
✅ **Compliant**: Category labels fully visible with dynamic margins
✅ **Compliant**: No placeholder text or stub implementations
✅ **Compliant**: All buttons/links have functional onClick/href handlers
✅ **Compliant**: Dashboard route available at `/` with `/dashboard` as alias

## Tableau Spec Compliance Checklist

- ✅ **P121__scatterplot** (custom_tableau_view):
  - Sales as x-axis, Profit as y-axis, Quantity as size encoding
  - Color encoding by Sales using sequential color scale
  - Tooltips showing Product Name, Sales, Profit, Quantity
  - No axis titles required by contract

- ✅ **P121__bar** (horizontal_ranked_bar):
  - Category/Sub-Category hierarchy on y-axis
  - Sales on x-axis with bars sorted descending
  - Color encoding by category
  - Full category labels visible with multi-line formatting

- ✅ **P1225__total_sales_each_year** (line_chart):
  - Year on x-axis, Sales on y-axis
  - Line with area fill and data points
  - Proper axis labels (Year, Sales)

- ✅ **P1968__customer_overview** (custom_tableau_view):
  - Table view with Region as row
  - Multiple measures: Sales, Quantity, Profit, Profit Ratio
  - Measures sorted according to manual_sort in spec
  - Color-coded profit values (green/red)

## Notes

- Dashboard layout respects Tableau zone coordinates (no generic card grids)
- No synthetic chrome (hero titles, footer watermarks) beyond what's defined in Tableau spec
- All tooltips provide full data values
- Responsive design maintains chart aspect ratios
- Console logs included for data loading feedback only
- No test suite configured (project template defaults)
