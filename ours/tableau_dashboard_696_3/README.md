# Results and Model Accuracy Dashboard

A React + TypeScript + Vite application that recreates a Tableau dashboard for visualizing stock prediction model accuracy.

## Features

- **Interactive Line Charts**: Built with D3.js primitives (no chart libraries)
- **Time-Series Visualization**: Displays predicted open and close stock prices
- **Tableau-Faithful Design**: Matches original colors, fonts, and layout
- **Client-Side Routing**: React Router for navigation
- **Real Data Loading**: Fetches CSV data from `/data/` directory
- **Responsive Layout**: Grid-based dashboard layout
- **Interactive Tooltips**: Hover over charts to see values

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # Main dashboard component
│   │   ├── LineChart.tsx          # D3-based line chart
│   │   ├── GoToHomeButton.tsx     # Navigation button
│   │   └── Home.tsx               # Landing page
│   ├── services/
│   │   └── dataService.ts         # Data loading and processing
│   ├── types/
│   │   └── data.ts                # TypeScript interfaces
│   ├── App.tsx                    # Router configuration
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global styles
├── public/
│   └── data/
│       └── prices-split-adjusted.csv  # Historical stock data
└── docs/
    ├── requirements.md            # Original requirements
    ├── tableau_spec.json          # Tableau specification
    └── tableau_render_contract.json  # Render contract
```

## Installation

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Lint

Run ESLint to check code quality:

```bash
npm run lint
```

## Preview

Preview the production build:

```bash
npm run preview
```

## Routes

- `/` - Home page (landing)
- `/dashboard` - Main dashboard with charts
- `/home` - Redirects to `/`

## Dashboard Zones

The dashboard implements all 7 text zones from the Tableau specification:

1. **Header Title**: "Results and Model accuracy"
2. **Subtitle**: Google Excel data source notice
3. **RMSE Label**: "Root Mean Square Error"
4. **RMSE Values (Close)**: Train: 0.36, Test: 1.54
5. **RMSE Values (Open)**: Train: 0.38, Test: 2.69
6. **Y-Axis Label (Close)**: "Close Stock" (rotated -90°)
7. **Y-Axis Label (Open)**: "Open Stock" (rotated -90°)

## Styling

- **Font**: Calibri throughout
- **Colors**: Match Tableau spec exactly
  - Dashboard background: `#000000`
  - Header background: `#b4b4b4`
  - Chart background: `#e6e6e6`
- **Sizes**: 12px and 15px as specified

## Data

The dashboard uses:
- Historical stock data from `public/data/prices-split-adjusted.csv` loaded via fetch('/data/...')
- Full dataset (all rows) used for visualizations - no sampling or mock data

## Technical Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **D3.js** - Data visualization (primitive functions only)
- **React Router DOM** - Client-side routing
- **d3-dsv** - CSV parsing

## Compliance

✅ All data loaded from `/data/` via fetch
✅ No data files under `src/` directories
✅ Numeric measures explicitly parsed
✅ Real URL routing (not state-based navigation)
✅ Tableau spec compliant layout and styling
✅ ESLint passing with no warnings
✅ TypeScript compilation successful

## License

This project was generated based on Tableau specifications for educational purposes.
