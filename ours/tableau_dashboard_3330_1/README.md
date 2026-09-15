# Tableau Dashboard - PANAS Survey Analysis

A React-based interactive dashboard that visualizes PANAS (Positive and Negative Affect Schedule) survey data from musicians, analyzing the relationship between demographic factors and emotional responses after performances.

## Overview

This dashboard recreates a Tableau workbook showing:
- **KPI Cards**: Display counts and percentages of respondents with positive vs. negative affect scores
- **Pie Charts**: Demographic breakdowns by Age, Gender, Ethnicity, and Marital Status
- **Interactive Features**: Click-based filtering and highlight interactions

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js v7** - Data visualization (pie charts, arc generation)
- **React Router DOM v7** - Client-side routing

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx       # Main dashboard layout and state management
│   ├── KPICard.tsx         # KPI metric display component
│   ├── PieChart.tsx        # D3-based pie chart with interactions
│   └── Legend.tsx          # Chart legend component
├── services/
│   └── dataService.ts      # Data loading, parsing, and aggregation logic
├── types/
│   └── index.ts            # TypeScript type definitions
├── App.tsx                 # Root component with routing
└── main.tsx                # Application entry point
```

## Data Loading

The dashboard loads data from `/data/1.Who-PANAS - F _Visulizaton.csv` which contains:
- Survey responses from 412 musicians
- Demographic information (age, gender, ethnicity, marital status)
- PANAS emotional responses (20 items across positive and negative affect)
- Calculated fields: Positive Score, Negative Score, and Positive-Negative Score difference

### Data Transformation

1. **PANAS Score Calculation**:
   - Positive Score: Sum of 10 positive emotion items
   - Negative Score: Sum of 10 negative emotion items
   - Positive-Negative Score: Positive - Negative

2. **Global Aggregates**:
   - Count of respondents with positive vs. negative scores
   - Percentages calculated from total (positive + negative)

3. **Demographic Aggregation**:
   - Counts and percentages by category
   - Filtering excludes null values
   - Manual sort ordering per Tableau spec

## Features

### Interactive Filtering
- **Click on Positive KPI Card**: Filters to show only respondents with positive scores
- **Click on Negative KPI Card**: Filters to show only respondents with negative scores
- **Filter indicator**: Shows active filter with clear button

### Highlight Interactions
- **Click on pie slices**: Highlights selected category across all charts
- **Visual feedback**: Non-selected slices show at 30% opacity
- **Toggle behavior**: Click same slice to clear highlight

### Tooltips
- Hover over pie slices to see:
  - Category name
  - Count of respondents
  - Percentage of total

## Color Schemes

Per Tableau specification:
- **Gender**: Male (#3896c4), Female (#eb1e2c), Other (#76b7b2)
- **Age**: Gradient from dark orange (#9e3d22) to light peach (#ffc685)
- **Ethnicity**: 8-category palette (#59a14f, #76b7b2, #4e79a7, etc.)
- **Marital Status**: Blue-based palette (#4e79a7, #a0cbe8, #f28e2b, etc.)

## Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Routing

- `/` - Main dashboard (default route)
- `/dashboard` - Dashboard (alias)

All routes render the same dashboard view with full dataset loaded.

## Browser Compatibility

- Modern browsers with ES2020+ support
- Chrome/Edge 90+, Firefox 88+, Safari 14+

## Performance

- Data loaded once on app initialization
- React useMemo for expensive aggregations
- D3 updates only chart elements on state changes

## License

This project was generated from the original Tableau workbook specification.
