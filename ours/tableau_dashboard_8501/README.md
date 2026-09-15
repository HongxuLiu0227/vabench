# FIFA 19 Player Age Dashboard

A React-based data visualization dashboard displaying player age analysis by position, built according to Tableau specifications.

## Overview

This dashboard visualizes FIFA 19 player data with three interactive worksheets:
- **9a_Min_age_position**: Shows players at each position with minimal age (circle marks)
- **9b_Max_age_position**: Shows players at each position with maximal age (square marks)
- **9c_Avg_age_position**: Shows average age by position (vertical ranked bar chart)

## Tech Stack

- **React 19.2.0** - UI framework
- **TypeScript** - Type safety
- **Vite 7.3.1** - Build tool and dev server
- **D3.js 7.9.0** - Data visualization
- **PapaParse 5.5.3** - CSV parsing
- **React Router 7.13.1** - Client-side routing

## Data Source

**Runtime data source**: `/data/data (2).csv`

The dashboard loads full dataset rows from `public/data/data (2).csv` using the fetch API. No sample data or local imports are used for runtime visualization.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173/`

### Build

```bash
npm run build
```

Build artifacts are saved to the `dist/` directory.

### Lint

```bash
npm run lint
```

## Dashboard Features

### Interactive Filtering

Click on any position in the three worksheets to filter the entire dashboard:
- **9a_Min_age_position**: Click a circle to filter by that position
- **9b_Max_age_position**: Click a square to filter by that position
- **9c_Avg_age_position**: Click a bar to filter by that position

**Auto-clear behavior**: Clicking the same selection again clears the filter. Clicking outside the charts also clears the filter.

### Tooltips

Hover over any mark to see:
- Position name
- Age value
- Player name (for min/max age views)
- Player count (for average age view)

## Tableau Specification Compliance

### Worksheet 9a_Min_age_position
- **Chart Intent**: Custom Tableau View (Circle marks)
- **Title**: "Players at the position with Minimal Age" (pink, Times New Roman, 16pt, bold)
- **Rows**: MIN(Age)
- **Columns**: Position
- **Interactions**: Filter on-select, auto-clear

### Worksheet 9b_Max_age_position
- **Chart Intent**: Custom Tableau View (Square marks)
- **Title**: "Players at the position with Maximal Age" (yellow, Times New Roman, 16pt, bold)
- **Rows**: MAX(Age)
- **Columns**: Position
- **Filter**: Excludes null positions
- **Interactions**: Filter on-select, auto-clear

### Worksheet 9c_Avg_age_position
- **Chart Intent**: Vertical Ranked Bar
- **Title**: "Average Age at the Position" (teal, Times New Roman, 16pt, bold)
- **Rows**: AVG(Age)
- **Columns**: Position
- **Sort**: Descending by average age
- **Interactions**: Filter on-select, auto-clear

### Dashboard Actions

All three worksheets have filter actions that target the entire dashboard:
- Filter 1: From 9a_Min_age_position → 9_AGE_POSITION
- Filter 2: From 9b_Max_age_position → 9_AGE_POSITION
- Filter 3: From 9c_Avg_age_position → 9_AGE_POSITION

### Layout

Based on Tableau dashboard zones:
- Fixed size: 900x500
- Top row: Min Age (left) + Max Age (right)
- Bottom row: Average Age (full width)

## Project Structure

```
src/
├── components/
│   ├── worksheets/
│   │   ├── MinAgePosition.tsx    # Circle view for min age
│   │   ├── MaxAgePosition.tsx    # Square view for max age
│   │   └── AvgAgePosition.tsx    # Bar chart for avg age
│   ├── Dashboard.tsx              # Main dashboard container
│   └── index.ts
├── hooks/
│   └── useFifaData.ts             # Data loading and state management
├── services/
│   └── dataService.ts             # CSV parsing and aggregation
├── types/
│   └── index.ts                   # TypeScript interfaces
├── App.tsx                        # Router setup
├── main.tsx                       # App entry point
└── *.css                          # Stylesheets

public/
└── data/
    └── data (2).csv               # Full dataset (9MB)

docs/
├── tableau_spec.json              # Tableau specification
├── tableau_render_contract.json   # Render contract (authoritative)
└── requirements.md                # Original requirements
```

## Data Loading

1. **Fetch**: Data is fetched from `/data/data (2).csv`
2. **Parse**: PapaParse converts CSV to JSON with header normalization
3. **Type Conversion**: Numeric fields (Age, Overall, Potential, etc.) are converted to numbers
4. **Filter**: Invalid rows (missing Name, Position, or Age) are filtered out
5. **Aggregate**: Data is aggregated by Position (min, max, avg age)
6. **Render**: All charts render with the full aggregated dataset

## Styling

- Plain CSS (no Tailwind or component libraries)
- Responsive design with CSS Grid and Flexbox
- Consistent with Tableau layout and zone specifications
- Clean, minimal design with proper spacing

## Browser Support

Modern browsers with ES2022+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance

- Full dataset loaded once at startup (~18K players)
- Efficient D3 rendering with SVG
- Reactive updates on filter changes
- Optimized bundle size (~107KB gzipped)

## Notes

- No authentication/login panel is present in this dashboard
- All data is client-side only; no server requests beyond initial CSV load
- Dashboard complies with Tableau render contract specifications
- Chart titles use exact wording and styling from Tableau specification
