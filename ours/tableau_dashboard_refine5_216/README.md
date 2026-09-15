# Synthetic Dashboard 216

A Tableau-style dashboard built with React, TypeScript, and Vite, featuring D3.js visualizations for sales data analysis.

## Features

This dashboard provides comprehensive sales analytics through four interactive visualizations:

1. **Customer Overview** (Top-Left)
   - Regional breakdown of sales metrics
   - Measures: Sales per Customer, Sales, Quantity, Profit, Profit Ratio
   - Color-coded profit ratio indicators

2. **Total Sales Each Year** (Top-Right)
   - Line chart showing yearly sales trends
   - Interactive tooltips with exact values
   - Animated data points

3. **Bar Chart** (Bottom-Left)
   - Horizontal ranked bar chart by Category and Sub-Category
   - Sorted by sales descending
   - Blue-teal color gradient based on sales values

4. **Scatterplot** (Bottom-Right)
   - Sales vs. Profit analysis by product
   - Bubble size represents quantity
   - Color gradient based on sales values

## Data Source

All dashboard data is loaded from:
```
/data/1968_dash_dashboard0_png_coursera_course_204_week_203_dashboard/p1968_TEMP_1u7hox51ox1io4183hb2v01q3nst.csv
```

The dataset includes comprehensive sales information with fields such as:
- Order details (Order ID, Order Date, Ship Date)
- Customer information (Customer ID, Customer Name, Segment)
- Geographic data (Region, Country, State, City)
- Product details (Category, Sub-Category, Product Name)
- Metrics (Sales, Quantity, Discount, Profit)

## Technology Stack

- **React 19.2.0** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js 7.9.0** - Data visualization
- **React Router DOM** - Client-side routing

## Installation

```bash
pnpm install
```

## Development

Start the development server:
```bash
pnpm dev
```

The dashboard will be available at `http://localhost:5173`

## Build

Build for production:
```bash
pnpm build
```

The built files will be in the `dist` directory.

## Linting

Run ESLint:
```bash
pnpm lint
```

## Dashboard Layout

The dashboard follows a 2x2 grid layout (1000x800px):

```
┌─────────────────┬─────────────────┐
│  Customer       │  Total Sales    │
│  Overview       │  Each Year      │
├─────────────────┼─────────────────┤
│  Bar Chart      │  Scatterplot    │
│  (Ranked)       │                 │
└─────────────────┴─────────────────┘
```

## Data Processing

All quantitative fields are properly converted to numbers before aggregation:
- Sales, Quantity, Discount, and Profit are parsed as floats
- Invalid or missing numeric values default to 0
- Date fields are properly parsed and validated
- Data aggregation follows Tableau specification requirements

## Tableau Compliance

This dashboard implements the Tableau render contract specification:
- Worksheet positions match zone coordinates
- Chart intents correctly implemented (line, table, scatterplot, horizontal bar)
- No placeholder or sample data - full dataset loaded via fetch
- All numeric aggregations use proper number conversion
- Long labels are fully visible with adequate margins

## License

Private project.
