# Tableau Dashboard 3 - Market Penetration

A React + TypeScript + Vite implementation of Tableau Dashboard 3, featuring an interactive Market Penetration visualization using D3.js.

## Overview

This application recreates a Tableau dashboard showing market penetration analysis across Canadian provinces/territories. It features:
- Vertical ranked bar chart with D3.js
- Interactive highlight selection on geography
- Color encoding by penetration ratio
- Reference line at 0.15% benchmark
- Tooltips with detailed metrics
- Responsive layout following Tableau specifications

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **D3.js** - Data visualization (d3-scale, d3-shape, d3-axis, d3-dsv)
- **React Router DOM** - Client-side routing

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard3.tsx          # Dashboard container with layout constraints
│   └── MarketPenetration.tsx   # D3-based bar chart component
├── pages/
│   └── DashboardPage.tsx       # Main page with data loading
├── services/
│   └── dataService.ts          # CSV loading and transformation
├── App.tsx                     # Router configuration
├── main.tsx                    # Application entry point
└── index.css                   # Global styles
```

## Data Source

**Primary Data URL:** `/data/TEMP_1u26wfe0q5eoqa1015kns03ieqbd.csv`

### Data Policy Compliance

✅ **All runtime data loaded from `public/data/`** via fetch
✅ **No dataset files in `src/data` or `src/mocks`**
✅ **Full dataset (40,000 rows) used for visualizations** - no sample rows
✅ **Quantitative fields converted to numbers before aggregation**

### Data Structure

The application loads the full dataset from `/public/data/TEMP_1u26wfe0q5eoqa1015kns03ieqbd.csv`:

- **Total Records:** 40,000 rows
- **Format:** CSV with triple-quoted column headers
- **Loading Method:** `fetch('/data/TEMP_1u26wfe0q5eoqa1015kns03ieqbd.csv')`

### CSV Columns

| Column | Type | Description |
|--------|------|-------------|
| `Number` | Number | Count of records (used as customer count) |
| `Gender` | String | Customer gender (not used in visualization) |
| `StateFull` | String | Full state/province name (not used directly) |
| `Age2` | Number | Customer age (not used in visualization) |
| `Rand` | Number | Random value (not used in visualization) |
| `Geography` | String | Geographic region name (category field) |
| `Population` | Number | Population count for the geography |

### Data Processing Pipeline

1. **Fetch:** CSV data loaded via `fetch()` from public/data directory
2. **Parse:** d3-dsv csvParse() handles triple-quoted headers
3. **Normalize:** Column names cleaned (e.g., `"""Geography"""` → `Geography`)
4. **Group:** Records aggregated by `Geography`:
   - `customerCount`: Sum of `Number` field per geography
   - `population`: Maximum population value per geography
5. **Calculate:** Penetration ratio = `customerCount / population`
6. **Sort:** Descending by penetration ratio (ranked bar chart)

## Authentication

**No authentication required.** This dashboard is publicly accessible without login.

## Features

### Market Penetration Chart

- **Vertical ranked bars** sorted by penetration ratio (descending)
- **Sequential color scale** (Tableau-style blues) based on penetration ratio
- **Reference line** at 0.0015 (0.15%) benchmark
- **Data labels** showing percentage and customer count
- **Rotated x-axis labels** (-90 degrees) for full geography name visibility

### Interactions

- **Click to highlight**: Click any bar to highlight a geography (auto-clears after 3 seconds)
- **Hover tooltips**: Shows geography, penetration ratio, customer count, and population
- **Click outside**: Clear highlight selection
- **Visual feedback**: Highlighted bars show stroke, non-selected bars dim

### Dashboard Layout

Per Tableau specifications:
- Min width: 420px, Max width: 650px
- Min height: 560px, Max height: 860px
- Centered layout with 8px margin
- Clean, minimal design matching Tableau aesthetic

## Routing

The application uses React Router with the following routes:
- `/` - Main dashboard (default)
- `/dashboard` - Alias to main dashboard
- `/*` - Redirects to `/`

## Development Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Implementation Notes

### Data Transformation

The raw CSV data is aggregated by geography:
- **Customer Count**: Sum of records per geography
- **Population**: Maximum value (constant per geography in join)
- **Penetration Ratio**: customerCount / population

### D3.js Integration

- Uses `d3.scaleBand` for x-axis (geography categories)
- Uses `d3.scaleLinear` for y-axis (penetration ratio)
- Uses `d3.scaleSequential` with `d3.interpolateBlues` for color encoding
- Dynamic margins to accommodate rotated labels

## Tableau Spec Compliance Checklist

### Worksheet: Market Penetration

✅ **Chart Type**: Vertical ranked bar chart (`vertical_ranked_bar`)
✅ **X-Axis**: Geography (categorical dimension)
✅ **Y-Axis**: Penetration Ratio (calculated measure)
✅ **Color Encoding**: By penetration ratio (sequential blues)
✅ **Sorting**: Descending by penetration ratio
✅ **Reference Line**: At 0.0015 (0.15% benchmark)
✅ **Data Labels**: Percentages shown on bars
✅ **Axis Labels**: Rotated -90 degrees for readability
✅ **Interactions**: Highlight on geography selection
✅ **Auto-clear**: Highlight clears after 3 seconds
✅ **Layout**: Follows dashboard zone positioning
✅ **Margins**: Dynamic for full label visibility

### Dashboard: Dashboard 3

✅ **Size Constraints**: min/max width and height per spec
✅ **Centering**: Horizontal center alignment
✅ **Margins**: 8px container margin
✅ **Styling**: Tableau-faithful minimal design

## License

This project was generated from Vite + React + TypeScript template.
