# Suicide Trends In Thailand - Tableau Dashboard

A React-based interactive dashboard visualizing suicide statistics in Thailand, built according to Tableau specifications. This dashboard provides comprehensive insights into suicide trends across multiple dimensions including time, demographics, and economic factors.

## Dashboard Overview

This dashboard displays four interactive visualizations:

1. **Suicide Rates Per Year** (Sheet 1) - Line chart showing annual suicide trends over time
2. **Suicide Rates Between Sex and Generations** (Sheet 2) - Vertical ranked bar chart comparing suicide numbers across generations and sex
3. **Suicide Rates By Ages** (Sheet 3) - Horizontal bar chart displaying suicide distribution across age groups
4. **Suicide Rates By GDP** (Sheet 4) - Scatter/line chart examining the relationship between GDP and suicide rates

## Features

### Interactive Filtering
- **Click-to-filter**: Click on any data point in any chart to filter all other visualizations
- **Auto-clear behavior**: Clicking the same data point again clears the filter
- **Dashboard-wide propagation**: Filters apply across all worksheets simultaneously
- **Active filter display**: Current filters are shown in a floating panel in the bottom-right corner

### Data Visualization
- **D3.js-powered charts**: All visualizations use D3.js for rendering
- **Responsive tooltips**: Hover over data points to see detailed information
- **Color-coded data**: Visual indicators help distinguish values and patterns
- **Full label visibility**: Dynamic margins ensure all labels are fully readable

### Data Compliance
- **Strict Tableau data-source policy**: All data loaded from `/data/suicide trend.csv`
- **No synthetic data**: Dashboard uses full dataset rows, never sample data
- **Numeric field validation**: All quantitative fields converted to numbers before aggregation
- **Thailand-focused**: Dashboard filtered to Thailand data as per specification

## Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production (TypeScript compilation + Vite bundling)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build locally

## Project Structure

```
tableau_dashboard_10115/
├── public/
│   └── data/
│       └── suicide trend.csv          # Source dataset (must remain in public/data)
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx               # Main dashboard container
│   │   ├── Sheet1.tsx                  # Suicide Rates Per Year
│   │   ├── Sheet2.tsx                  # Suicide Rates Between Sex and Generations
│   │   ├── Sheet3.tsx                  # Suicide Rates By Ages
│   │   └── Sheet4.tsx                  # Suicide Rates By GDP
│   ├── contexts/
│   │   └── FilterContext.tsx           # Global filter state management
│   ├── services/
│   │   └── dataService.ts              # Data loading and aggregation functions
│   ├── types/
│   │   └── index.ts                    # TypeScript type definitions
│   ├── utils/
│   │   ├── csvValidator.ts             # CSV structure validation
│   │   └── dataValidator.ts            # Development-mode data validation
│   ├── App.tsx                         # Root component with routing
│   └── main.tsx                        # Application entry point
├── docs/
│   ├── tableau_spec.json               # Tableau specification contract
│   └── tableau_render_contract.json    # Rendering intent specification
└── package.json
```

## Data Source

The dashboard uses suicide statistics data from `/data/suicide trend.csv`. The data includes:
- Country information (filtered to Thailand)
- Year ranges
- Sex (male/female)
- Age groups
- Suicide numbers
- Population data
- GDP metrics (gdp_for_year, gdp_per_capita)
- Generation classifications
- HDI (Human Development Index) for year

**Important**: Do not move or duplicate the dataset file. It must remain at `public/data/suicide trend.csv` for the application to function correctly.

## Technical Stack

- **React 19.2** - UI framework
- **TypeScript** - Type-safe development
- **D3.js 7.9** - Data visualization library
- **React Router DOM 7.13** - Client-side routing
- **Vite 7.3** - Build tool and dev server

## Dashboard Layout

The dashboard uses a 2x2 grid layout:

```
┌─────────────────────────────────┬──────────────────────┐
│   Sheet 1: Suicide Rates        │   Sheet 3: Suicide    │
│   Per Year                      │   Rates By Ages      │
│                                 │                      │
├─────────────────────────────────┼──────────────────────┤
│   Sheet 4: Suicide Rates        │   Sheet 2: Suicide    │
│   By GDP                        │   Rates Between Sex  │
│                                 │   and Generations    │
└─────────────────────────────────┴──────────────────────┘
```

## Tableau Specification Compliance

This dashboard implements:
- ✅ All 4 worksheets with correct chart intents
- ✅ Dashboard composition per zone coordinates
- ✅ 3 dashboard actions (filter interactions with auto-clear)
- ✅ 4 highlight bindings for cross-worksheet interactions
- ✅ Dashboard text zone ("Suicide Trends In Thailand" header)
- ✅ Title runs with specified styling (color #75a1c7, Prompt font family)
- ✅ Filter members (Thailand-only data)
- ✅ Full numeric coercion for quantitative fields

### Worksheet Implementation Status

| Worksheet | Chart Intent | Status | Notes |
|-----------|--------------|--------|-------|
| Sheet 1 | Line chart | ✅ Complete | Yearly suicide trends with click-to-filter |
| Sheet 2 | Vertical ranked bar | ✅ Complete | Generation × sex grouped bars, sorted by value |
| Sheet 3 | Horizontal bar | ✅ Complete | Age group distribution, ascending order |
| Sheet 4 | Scatter/line | ✅ Complete | GDP vs suicide correlation |

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES2022 support

## Performance Notes

- Dataset size: ~2.5MB CSV file
- Initial load time: 1-3 seconds (depending on network)
- All aggregations performed client-side using D3.js
- CSV parsing includes validation to ensure data integrity

## Development Notes

### Data Validation
In development mode, the dashboard runs comprehensive validation checks:
- CSV structure validation
- Numeric field parsing verification
- Aggregation result verification
- Cross-worksheet filter propagation testing

### Styling
The dashboard uses inline styles (not Tailwind CSS) with the following design tokens:
- Primary color: `#75a1c7` (Tableau blue)
- Text color: `#2c5985` (Dark blue)
- Background: `#f0f3fa` (Light blue-gray)
- Font family: Prompt, sans-serif (Google Fonts)

### Loading States
The dashboard includes accessible loading components:
- Initial data loading state
- Error state with user-friendly messages
- Empty state handling (no matching data after filters)

## License

This dashboard is generated from Tableau specifications and uses suicide statistics data for educational and analytical purposes.

## Support

For issues related to:
- **Data**: Verify `public/data/suicide trend.csv` exists and is accessible
- **Build failures**: Ensure Node.js version is 18+ and dependencies are installed
- **Rendering issues**: Check browser console for validation warnings
- **Filters not working**: Verify FilterContext provider wraps the app
