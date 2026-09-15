# Tableau Dashboard: Recognizability of 90's Artists in 2020

A React-based interactive dashboard visualizing the recognizability of 90's artists among Millennials and Gen-Zs in 2020. This application faithfully reproduces a Tableau workbook using D3.js for data visualization.

## Overview

This dashboard displays data from a study analyzing how well different generations recognize 90's music artists. It includes five interactive visualizations:

1. **Number of Songs in the 90s** - Horizontal bar chart showing artists ranked by their number of songs in the 90s
2. **Recognizability by Age When Song Was Released** - Multi-line chart showing recognizability patterns across different age groups
3. **Number of Songs vs. Recognizability** - Scatter plot correlating song count with recognizability scores
4. **Mean Recognizability by Age When Song Was Released** - Aggregate line chart showing average recognizability trends
5. **Millennials vs. Gen-Zs** - Comparison chart showing recognizability differences between generations

## Features

- **Interactive Filtering**: Click on any artist bar in the "Number of Songs in the 90s" chart to filter all other visualizations
- **Legend Support**: Interactive legend for selecting/deselecting artists
- **Responsive Design**: Charts automatically resize based on container width
- **D3.js Visualizations**: All charts built with D3.js for accurate, performant rendering
- **Data-Driven**: All metrics computed from full dataset loaded from `/data/final_df.csv`

## Tech Stack

- **React 19.2.0** - UI framework
- **TypeScript** - Type safety
- **D3.js (v7)** - Data visualization library
  - d3-dsv: CSV parsing
  - d3-scale: Scaling functions
  - d3-axis: Axis generation
  - d3-shape: Shape generators
  - d3-selection: DOM manipulation
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing

## Installation

```bash
npm install
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

### Production Build
```bash
npm run build
```
Build artifacts are stored in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## Validation Scripts

The project includes validation scripts to ensure data integrity and Tableau spec compliance:

```bash
# Validate data file
npm run validate:data

# Validate Tableau spec compliance
npm run validate:spec

# Run all validations
npm run validate
```

## Project Structure

```
tableau_dashboard_1665/
├── public/
│   └── data/
│       └── final_df.csv          # Source data file
├── src/
│   ├── components/
│   │   ├── charts/               # D3 chart components
│   │   │   ├── HorizontalBarChart.tsx
│   │   │   ├── MultiLineChart.tsx
│   │   │   ├── ScatterPlot.tsx
│   │   │   ├── MeanLineChart.tsx
│   │   │   └── ComparisonChart.tsx
│   │   ├── Dashboard.tsx         # Main dashboard container
│   │   ├── Legend.tsx            # Artist legend
│   │   └── ShapeLegend.tsx       # Measure type legend
│   ├── services/
│   │   ├── dataService.ts        # Data loading and transformation
│   │   └── types.ts              # TypeScript interfaces
│   ├── App.tsx                   # Root component with routing
│   └── main.tsx                  # Application entry point
├── docs/
│   ├── tableau_spec.json         # Tableau workbook specification
│   └── tableau_render_contract.json # Rendering contract
└── scripts/
    ├── validateData.ts           # Data validation script
    └── validateTableauSpec.ts    # Spec validation script
```

## Data Source

All dashboard metrics are sourced from `public/data/final_df.csv`, which contains:
- 26 artists from the 90s era
- Recognizability scores across 14 age categories (Year Born through 13 Years Old)
- Generation-specific recognizability (Millennials vs Gen-Zs)
- Number of songs released in the 90s

## Interactions

### Filter Action
- **Source**: "Number of Songs in the 90s" worksheet
- **Target**: All worksheets in the dashboard
- **Trigger**: Click on any artist bar
- **Behavior**: Highlights selected artist across all charts, dims others
- **Auto-clear**: Click same artist again or click background to clear selection

### Highlight Bindings
All charts support artist-based highlighting:
- Charts respond to artist selection from the bar chart or legend
- Non-selected artists are shown at reduced opacity
- Selected data points are emphasized with increased stroke width and opacity

## Tableau Spec Compliance

This implementation follows the Tableau render contract specified in:
- `docs/tableau_spec.json` - Workbook structure and field definitions
- `docs/tableau_render_contract.json` - Chart geometry and layout specifications

### Compliance Checklist

#### Worksheets Implemented:
- ✅ **Mean Recognizability by Age When Song Was Released** (`custom_tableau_view`)
  - Axis title: "Recognizability"
  - Highlight interactions implemented
  - Correct field mapping and aggregation

- ✅ **Millennials vs. Gen-Zs** (`custom_tableau_view`)
  - Axis title: "Recognizability"
  - Highlight interactions implemented
  - Measure comparison displayed correctly

- ✅ **Number of Songs in the 90s** (`horizontal_ranked_bar`)
  - Filter action to entire dashboard
  - Ranked by song count (descending)
  - Click interactions working

- ✅ **Number of Songs vs. Recognizability** (`custom_tableau_view`)
  - Axis title: "Recognizability"
  - Scatter plot with measure-based shapes
  - Highlight interactions implemented

- ✅ **Recognizability by Age When Song Was Released** (`custom_tableau_view`)
  - Axis title: "Recognizability"
  - Legend: Required, positioned right of worksheet
  - Highlight interactions implemented

#### Dashboard Actions:
- ✅ Filter action: "Number of Songs in the 90s" → Dashboard (auto-clear enabled)

#### Highlight Bindings:
- ✅ 6 highlight bindings implemented across all worksheets

#### Data Policy:
- ✅ All data loaded from `/data/final_df.csv`
- ✅ No data files in `src/data` or `src/mocks`
- ✅ Full dataset used (no sample rows)
- ✅ Numeric fields properly converted using `Number()` / `parseFloat()`

#### Layout:
- Dashboard routes available at `/` and `/dashboard`
- Responsive grid layout with proper aspect ratios
- Long category labels fully visible (no clipping)

## License

This project was generated based on a Tableau workbook specification.

## Credits

Original Tableau Workbook: "Recognizability of 90's Artists in 2020 by Millenials and Gen-Zs - Andrew Liawan"
