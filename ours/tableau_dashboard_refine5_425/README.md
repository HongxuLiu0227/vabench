# Tableau Dashboard - Superstore Orders Analysis

A React-based interactive dashboard visualizing Superstore orders data, implementing Tableau worksheets and dashboards using D3.js for charts and custom components for data tables.

## Overview

This dashboard reproduces a Tableau workbook with 3 worksheets and 1 dashboard:

- **P121__line**: Line chart showing sales trends over time (monthly)
- **P1225__total_sales_each_year**: Line chart showing total sales by year
- **P2648__discount_overview_by_region**: Table view showing discount metrics by region

## Data Source

The dashboard loads data from:
```
/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv
```

This file contains detailed order information including:
- Order dates and shipping details
- Customer information (ID, name, segment)
- Geographic data (Region, State, City)
- Product details (Category, Sub-Category, Product Name)
- Sales metrics (Sales, Quantity, Discount, Profit)

## Features

### Interactive Filters
- **Region**: Filter data by geographic region (South, West, Central, East)
- **Category**: Filter by product category (Furniture, Office Supplies, Technology)
- **Segment**: Filter by customer segment (Consumer, Corporate, Home Office)

### Data Visualizations
- **Line Charts**: D3-based interactive line charts with tooltips
- **Data Tables**: Responsive tables showing aggregated metrics by region
- **Dynamic Margins**: Charts adjust margins to ensure full label visibility

### Technical Implementation
- **Data Loading**: Fetch-based CSV parsing with robust error handling
- **Data Validation**: Comprehensive validation ensures data quality
- **Numeric Conversion**: All quantitative fields properly converted to numbers before aggregation
- **Type Safety**: Full TypeScript implementation with strict typing

## Installation

```bash
# Install dependencies
pnpm install
```

## Development

```bash
# Start development server
pnpm dev
```

The dashboard will be available at `http://localhost:5173/`

## Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Testing

```bash
# Run tests
pnpm test

# Run tests in band
pnpm test -- --runInBand
```

## Linting

```bash
# Run linter
pnpm lint
```

## Project Structure

```
src/
├── components/
│   ├── DiscountOverview.tsx    # Region metrics table component
│   ├── Filters.tsx             # Interactive filter controls
│   └── LineChart.tsx           # D3-based line chart component
├── pages/
│   └── Dashboard.tsx           # Main dashboard layout and orchestration
├── services/
│   └── dataService.ts          # Data loading, parsing, and aggregation logic
├── types/
│   └── index.ts                # TypeScript type definitions
├── App.tsx                     # Root component with routing
├── main.tsx                    # Application entry point
└── index.css                   # Global styles

public/
└── data/
    └── 9517_dash_dashboard0_png_informative_dashboard/
        └── p9517_Sample_-_Superstore_Orders.csv
```

## Tableau Spec Compliance

This dashboard implements the following worksheets according to the Tableau specification:

### P121__line
- **Chart Type**: Line chart (Automatic in Tableau)
- **Rows**: SUM(Sales)
- **Columns**: TMN(Order Date) - Time level: month
- **Title**: "Line"

### P1225__total_sales_each_year
- **Chart Type**: Bar chart (rendered as line chart per render contract)
- **Rows**: SUM(Sales)
- **Columns**: YR(Order Date) - Time level: year
- **Title**: "Total Sales Each Year"

### P2648__discount_overview_by_region
- **Chart Type**: Custom Tableau view (table with multiple measures)
- **Rows**: Region
- **Columns**: Measure Names (Multiple Values)
  - AVG(Discount)
  - SUM(Profit)
  - SUM(Quantity)
  - SUM(Sales)
  - COUNTD(Customer Name)
- **Title**: "Discount Overview by Region"
- **Manual Sort**: Measures ordered as specified in Tableau spec

## Dashboard Layout

The dashboard follows the zone coordinates from the Tableau specification:

- **Top Row** (y=0.01 to y=0.6275): Two columns
  - Left (x=0.008 to x=0.5): P121__line
  - Right (x=0.5 to x=0.992): P1225__total_sales_each_year
- **Bottom Row** (y=0.6275 to y=0.99): Full width
  - P2648__discount_overview_by_region

## Data Quality & Validation

The application includes comprehensive data validation:
- BOM (Byte Order Mark) stripping for proper CSV parsing
- Header normalization to handle quoted/dirty column names
- Date parsing with validation to prevent invalid dates
- Numeric field parsing with error handling
- Statistical validation to detect common issues:
  - All-zero metrics (indicates parsing failure)
  - Unix epoch dates (indicates invalid date parsing)
  - Missing categorical values

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## License

This project was generated from a Tableau workbook specification.
