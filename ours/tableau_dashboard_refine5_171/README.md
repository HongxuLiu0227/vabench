# Tableau Dashboard - Synthetic Dashboard 171

A React-based implementation of Tableau dashboard "Synthetic Dashboard 171" with strict data-source compliance and full D3.js visualizations.

## Dashboard Overview

This dashboard visualizes sales data with four worksheets:

1. **P121__scatterplot**: Scatterplot showing Sales vs Profit relationship
   - X-axis: Sales
   - Y-axis: Profit
   - Color: Sales (continuous color scale)
   - Size: Quantity
   - Detail: Product Name

2. **P9517__sales_by_sub_category**: Horizontal ranked bar chart
   - Y-axis: Sub-Category / Product Name
   - X-axis: Sales
   - Sorted: Descending by Sales

3. **P121__line**: Line chart showing sales over time
   - X-axis: Order Date (monthly)
   - Y-axis: Sales
   - Color: Sales (continuous)

4. **P1225__total_sales_each_year**: Yearly sales trend
   - X-axis: Year
   - Y-axis: Sales
   - Color: Sales (continuous)

## Data Source Policy

**MANDATORY**: All dashboard data is loaded from the public/data directory in compliance with Tableau data-source policy:

- **Dataset Location**: `/data/121_dash_dashboard0_png_dashboard_201/p121_Data_to_Clean_Orders.csv`
- **Loading Method**: Fetch-based loading via `fetch('/data/...')`
- **Data Format**: CSV with robust parsing for preamble rows, quoted headers, and BOM characters
- **No Local Imports**: Dashboard datasets are NOT imported from `src/data` or `src/mocks`
- **Full Dataset**: All visualizations render complete data, not sample rows

### Required Data Fields

The CSV must contain these fields for proper visualization:
- Row ID, Order ID, Order Date, Sales, Profit, Quantity, Sub-Category, Product Name

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint
```

## Tableau Spec Compliance

This dashboard implements the Tableau specification defined in:
- `docs/tableau_spec.json` - Authoritative machine-readable contract
- `docs/tableau_render_contract.json` - Final authority for chart geometry/layout

### Compliance Checklist

- ✅ All worksheets implement fields from tableau_spec.json
- ✅ Dashboard composition follows zone coordinates from spec
- ✅ Chart types match chart_intent (scatterplot, horizontal_ranked_bar, line_chart)
- ✅ No placeholder text or "Coming soon" messages
- ✅ All interactive elements (buttons, links, tooltips) are functional
- ✅ Quantitative fields converted to numbers before aggregation
- ✅ No synthetic global chrome (hero titles, footer watermarks)
- ✅ Full category labels visible (no clipping)
- ✅ Data loaded only from `/data/...` directory

## Implementation Notes

### Data Loading
- Robust CSV parsing with PapaParse
- Handles preamble rows (first 4 lines)
- Normalizes quoted/dirty headers
- BOM character removal
- Required field validation

### Visualizations
- Built with D3.js v7.9.0
- Interactive tooltips on hover
- Color scales using sequential interpolation
- Responsive sizing based on container dimensions
- Accessible loading states with ARIA labels

### Accessibility
- Semantic HTML structure
- ARIA labels for loading states
- Keyboard navigation support
- High contrast colors (minimum 4.5:1 ratio)

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx           # Main dashboard layout
│   ├── Scatterplot.tsx         # P121__scatterplot worksheet
│   ├── HorizontalRankedBar.tsx # P9517__sales_by_sub_category worksheet
│   └── LineChart.tsx           # P121__line and P1225__total_sales_each_year worksheets
├── services/
│   └── dataService.ts          # Data loading and aggregation
├── types/
│   └── data.ts                 # TypeScript type definitions
├── utils/
│   └── dataValidator.ts        # Data validation utilities
└── pages/
    └── DashboardPage.tsx       # Dashboard page wrapper

public/
└── data/
    └── 121_dash_dashboard0_png_dashboard_201/
        └── p121_Data_to_Clean_Orders.csv  # Source dataset

docs/
├── tableau_spec.json           # Tableau specification contract
└── tableau_render_contract.json # Chart geometry/layout contract
```

## Technologies

- **React 19.2.0**: UI framework
- **TypeScript 5.9.3**: Type safety
- **D3.js 7.9.0**: Data visualization
- **PapaParse 5.5.3**: CSV parsing
- **React Router 7.13.2**: Client-side routing
- **Vite 7.3.1**: Build tool and dev server

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

This project is part of the Tableau Dashboard Refine initiative.
