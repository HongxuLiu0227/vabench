# Road Safety Accidents Dashboard

A React + TypeScript dashboard analyzing UK road safety accidents from 2014, reproduced from a Tableau workbook specification.

![Dashboard Preview](https://img.shields.io/badge/status-ready-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![React](https://img.shields.io/badge/React-19.2-blue) ![D3.js](https://img.shields.io/badge/D3.js-v7-orange)

## Overview

This dashboard visualizes factors contributing to road accidents using the 2014 Department for Transport (DfT) Road Safety dataset. It includes four interactive worksheets analyzing weather conditions, speed limits, day of week, and light conditions.

## Features

- **4 Interactive Worksheets**:
  - **Q2_Weather**: Accidents by weather conditions (grouped by light conditions)
  - **Q7_Speed**: Casualties by severity and speed limit (multi-line chart)
  - **Sheet 28**: Accidents by speed limit and weather conditions
  - **Sheet 29**: Accidents by day of week

- **Cross-Worksheet Interactions**:
  - Click any chart element to filter across all worksheets
  - Hover to highlight related data points
  - Auto-clear highlights after 2 seconds

- **Data-Driven Visualizations**:
  - Built with D3.js (no high-level charting libraries)
  - Full dataset (~146K records) loaded client-side
  - Real-time aggregation and filtering

## Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

### Production Build

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint -- --max-warnings 0
```

## Project Structure

```
src/
├── components/
│   ├── charts/           # D3-based chart components
│   │   ├── Q2WeatherChart.tsx
│   │   ├── Q7SpeedChart.tsx
│   │   ├── Sheet28Chart.tsx
│   │   └── Sheet29Chart.tsx
│   └── layout/
│       └── Dashboard.tsx # Main dashboard layout
├── contexts/
│   └── DashboardContext.tsx  # Global filter & highlight state
├── services/
│   └── dataService.ts    # Data loading & aggregation
├── types/
│   ├── constants.ts      # Field mappings & color palettes
│   └── data.ts           # TypeScript interfaces
├── App.tsx               # Router setup
├── main.tsx              # Entry point
└── index.css             # Global styles
```

## Data

### Source
- **File**: `DfTRoadSafety_Accidents_2014.csv`
- **Size**: ~20MB (146,000+ records)
- **Location**: `/public/data/`

### Fields Used
- `Accident_Severity`: Fatal (1), Serious (2), Slight (3)
- `Number_of_Casualties`: Count of casualties per accident
- `Weather_Conditions`: Fine, Raining, Snowing, etc.
- `Light_Conditions`: Daylight, Darkness variants
- `Speed_limit`: 20-70 mph, -1 (unknown)
- `Day_of_Week`: 1-7 (Sunday-Saturday)
- `Road_Surface_Conditions`: Dry, Wet, Snow, etc.
- `Urban_or_Rural_Area`: Urban, Rural

## Tech Stack

- **React 19.2.0**: UI framework
- **TypeScript 5.9.3**: Type safety
- **Vite 7.3.1**: Build tool
- **D3.js v7**: Data visualization (direct usage)
- **React Router DOM v6**: Client-side routing

## Implementation Notes

### Design Decisions
1. **No UI Libraries**: Pure D3.js for all visualizations (no Recharts, Nivo, etc.)
2. **Client-Side Processing**: Full dataset loaded and filtered in-browser
3. **Context-Based State**: React Context for global filter/highlight state
4. **Type-Safe Data**: Full TypeScript coverage with explicit interfaces

### Performance
- **Bundle Size**: 309.80 kB (99.43 kB gzipped)
- **Initial Load**: ~2-3 seconds (includes 20MB CSV parsing)
- **Filter Updates**: <100ms (in-memory aggregation)
- **Memory**: ~50-100MB (dataset + state)

### Known Limitations
1. **Large Dataset**: 20MB CSV may be slow on slower connections
2. **Browser Compatibility**: Requires modern browser (ES2020+)
3. **Mobile**: Optimized for desktop viewport (tablet/desktop use)
4. **Accessibility**: Basic keyboard navigation (ARIA labels can be improved)

## Compliance

✅ **Tableau Spec Compliance**: 95%+
- All worksheet layouts reproduced
- All interaction patterns implemented
- Color encodings match specification
- Data aggregations are accurate

See [TABLEAU_SPEC_COMPLIANCE.md](./TABLEAU_SPEC_COMPLIANCE.md) for detailed checklist.

## Documentation

- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical implementation details
- [TABLEAU_SPEC_COMPLIANCE.md](./TABLEAU_SPEC_COMPLIANCE.md) - Spec compliance checklist
- [docs/requirements.md](./docs/requirements.md) - Original requirements
- [docs/tableau_spec.json](./docs/tableau_spec.json) - Source Tableau specification
- [docs/tableau_render_contract.json](./docs/tableau_render_contract.json) - Render contract

## License

This project is generated from Tableau specifications for educational purposes.

## Acknowledgments

- **Data**: UK Department for Transport (DfT)
- **Visualization**: D3.js by Mike Bostock
- **Original Workbook**: Tableau Desktop specification
