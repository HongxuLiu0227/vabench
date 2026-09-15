# Reporting Rates CT + MPI Dashboard

A React-based dashboard application that replicates Tableau workbook functionality for visualizing healthcare facility reporting rates for Care & Treatment (CT) and Patient Key Values (PKV/MPI) data.

## Overview

This dashboard displays EMR (Electronic Medical Record) site performance metrics across different partner organizations, showing:
- Distribution of EMR sites by partner
- Overall reporting rates for Care & Treatment uploads
- PKV (Patient Key Value) upload recency rates

## Tech Stack

- **Framework:** React 19.2.4 + TypeScript 5.9.3
- **Build Tool:** Vite 7.3.1
- **Routing:** React Router DOM 7.13.2
- **Visualization:** D3.js 7.9.0 (direct D3 primitives)
- **Data Parsing:** d3-dsv 3.0.1
- **Styling:** CSS with CSS Variables for theming

## Project Structure

```
src/
├── components/
│   ├── worksheets/           # Worksheet-specific components
│   │   ├── PartnerDistribution.tsx
│   │   ├── PartnerOverall.tsx
│   │   └── PartnerRecency.tsx
│   ├── Dashboard.tsx          # Main dashboard container
│   ├── DashboardTextZone.tsx  # Informational text zone
│   ├── DateParameterSelector.tsx  # Date filter control
│   └── HorizontalBarChart.tsx # D3-based chart component
├── services/
│   └── dataService.ts         # Data loading and transformation
├── types/
│   └── index.ts               # TypeScript type definitions
├── App.tsx                    # Router setup
├── App.css                    # Application styles
└── main.tsx                   # Application entry point
```

## Installation

```bash
pnpm install
```

## Running the Application

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

## Data Source

The dashboard loads data from `/public/data/federated_0se4v9q15j8hfi17f25m50.csv`, which contains:
- Facility information (MFL codes, names, counties, sub-counties)
- Partner organizations (mechanisms and agencies)
- Upload dates and status for Care & Treatment data
- Upload dates and status for PKV/MPI data
- Site abstraction dates

## Features

### Interactive Date Selection
Users can select different reporting periods using the "Upload Period - 3 Months" dropdown. Changing the date automatically updates all metrics across the dashboard.

### Performance Categories
Metrics are color-coded based on performance thresholds:
- **Above 67%:** Green (Good performance)
- **34-66%:** Yellow (Average performance)
- **Below 33%:** Red (Poor performance)

### Responsive Design
The dashboard adapts to different screen sizes:
- Desktop: 3-column layout showing all worksheets side-by-side
- Tablet/Mobile: Single-column layout for better readability

## Tableau Spec Compliance Checklist

### Worksheet: Partner: Distribution
- ✅ chart_type: Automatic (horizontal_ranked_bar)
- ✅ rows_field: DisplayMechanism (Partner)
- ✅ cols_field: County Denominator Expected Reports (count)
- ✅ series_field: DisplayAgency (group)
- ✅ bar_orientation: horizontal
- ✅ axis_title_cols: "Number of EMR Sites by Partner"
- ✅ title_runs: "Distribution of EMR Sites by Partner"
- ✅ Dynamic margins for full label visibility
- ✅ Bars sorted descending by count

### Worksheet: Partner: Overall
- ✅ chart_type: Automatic (horizontal_ranked_bar)
- ✅ rows_field: DisplayMechanism (Partner)
- ✅ cols_field: County Percent Uploads Proportions (%)
- ✅ series_field: County Color (performance categories)
- ✅ bar_orientation: horizontal
- ✅ series_order: Above 67%, 34-66%, Below 33%
- ✅ expected_series_values: Above 67%, 34-66%, Below 33%
- ✅ axis_title_cols: "% C&T Uploads"
- ✅ title_runs: "Overall Reporting Care & Treatment by Partner <Parameter 1>"
- ✅ legend_required: true
- ✅ legend_field: County Color
- ✅ legend_relative_position: below
- ✅ Dynamic margins for full label visibility
- ✅ Bars sorted descending by percentage

### Worksheet: Partner: Recency
- ✅ chart_type: Automatic (horizontal_ranked_bar)
- ✅ rows_field: DisplayMechanism (Partner)
- ✅ cols_field: Partner Percent Uploaded (%)
- ✅ series_field: Partner Color (performance categories)
- ✅ bar_orientation: horizontal
- ✅ series_order: Above 67%, 34-66%, Below 33%
- ✅ expected_series_values: Above 67%, 34-66%, Below 33%
- ✅ axis_title_cols: "% PKV Uploads"
- ✅ title_runs: "Overall Reporting PKVs by Partner <Parameter 1>"
- ✅ Dynamic margins for full label visibility
- ✅ Bars sorted descending by percentage

### Dashboard Features
- ✅ dashboard_text_zones: 1 (explanatory text at bottom)
- ✅ Exact wording preserved from Tableau specification
- ✅ Run-level emphasis (bold terms) preserved
- ✅ Dashboard zones layout maintained (3-column grid)
- ✅ Client-side routing with React Router DOM
- ✅ Full data loading from /public/data/... directory

### Data Handling
- ✅ CSV data fetched from public directory via fetch API
- ✅ Numeric measures parsed explicitly (no string concatenation)
- ✅ Aggregations computed from full dataset
- ✅ No data files under src/data or src/mocks
- ✅ Type-safe data transformations

### Styling
- ✅ Tableau-faithful visual design
- ✅ Verdana font family (Tableau standard)
- ✅ No decorative chrome or card shadows (minimal borders only)
- ✅ Clean, functional layout focused on data
- ✅ Responsive breakpoints for mobile/tablet

## Routing

The application uses React Router DOM with the following routes:
- `/` - Main dashboard (default)
- `/dashboard` - Dashboard alias

## Code Quality

```bash
# Run linter
pnpm lint

# Type check
pnpm build
```

All code passes ESLint with no errors and TypeScript strict mode compilation.

## Performance Considerations

- Data is fetched once on mount and cached in state
- Date changes recompute metrics from cached raw data
- Charts use ResizeObserver for responsive rendering
- Minimal re-renders through careful state management

## Browser Support

- Modern browsers with ES2022 support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
