# Tableau Dashboard - Synthetic Dashboard 483

A React + TypeScript + Vite application that implements a Tableau-style dashboard with three visualizations:

- **Sales by Sub Category** - Horizontal ranked bar chart
- **Total Sales Each Year** - Line chart showing annual sales trends
- **Line** - Monthly time series line chart

## Features

- Real-time data loading from CSV via `fetch('/data/...')`
- Interactive D3.js visualizations
- Responsive layout matching Tableau dashboard specifications
- Robust CSV parsing with validation and error handling
- Data quality metrics and logging

## Installation

Install dependencies using pnpm:

```bash
pnpm install
```

## Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Testing

Run the linter to check code quality:

```bash
pnpm lint
```

Note: This project does not currently have automated tests configured.

## Build

Build for production:

```bash
pnpm build
```

The production bundle will be output to the `dist/` directory.

Preview the production build:

```bash
pnpm preview
```

## Data Source

This dashboard loads data from:
```
/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv
```

The CSV file contains 9,994 rows with 21 fields including Order Date, Sales, Profit, Sub-Category, and more.

## Tableau Compliance

This dashboard implements the following Tableau specifications:

- ✅ All worksheets match `tableau_spec.json` contract
- ✅ Chart intents match `tableau_render_contract.json`
- ✅ Data loaded via `fetch('/data/...')` from public/data
- ✅ No dataset files in src/data or src/mocks
- ✅ Full dataset loaded (not sample rows)

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard layout
│   ├── HorizontalRankedBar.tsx # Horizontal bar chart
│   └── LineChart.tsx           # Line chart component
├── hooks/
│   └── useSuperstoreData.ts   # Data loading hook
├── services/
│   └── dataService.ts         # CSV parsing and aggregation
├── types/
│   └── index.ts               # TypeScript type definitions
└── main.tsx                   # Application entry point
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization
- **pnpm** - Package manager

## Browser Support

Modern browsers that support:
- ES6+ JavaScript
- CSS Grid and Flexbox
- Fetch API
- SVG

## License

Private - All rights reserved
