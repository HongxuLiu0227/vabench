# Citi Bike Trip Dashboard - Dashboard 3

A React-based interactive dashboard visualizing Citi Bike trip data for November 2016, recreated from a Tableau workbook.

## Features

### Worksheets
1. **Gender Trips by Hour of Day** (Left)
   - Grouped bar chart showing trip distribution by hour
   - Color-coded by gender (Male/Female)
   - Responds to day selection filter

2. **Trips by Day of Month** (Right)
   - Stacked bar chart showing daily trip counts
   - Color-coded by weekday
   - Click to filter hourly chart by selected day

### Interactions
- **Filter 3 Action**: Click any day bar in the right chart to filter the hourly chart
- **Auto-Clear**: Click the same day again to clear the filter
- Visual feedback for selected filters

## Tech Stack

- **React 19.2.0** with TypeScript
- **Vite 7.3.1** for fast development and building
- **D3.js** for data visualization (scales, shapes, arrays)
- **React Router DOM** for client-side routing
- **d3-dsv** for CSV parsing

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run linter
npm run lint
```

## Project Structure

```
src/
├── components/          # React components (Dashboard, Worksheets)
├── contexts/           # React Context for state management
├── services/           # Data loading and aggregation
├── types/              # TypeScript type definitions
├── App.tsx             # Main application with routing
└── main.tsx            # Application entry point
```

## Data Source

The dashboard uses Citi Bike trip data from November 2016, loaded from:
```
/data/TEMP_1o6gr4v0a4irtf1f3ekzg1cc6xxs.csv
```

Data is loaded client-side via the fetch API and parsed using d3-dsv.

## Tableau Spec Compliance

This implementation faithfully reproduces the Tableau workbook specifications:
- ✅ Worksheet chart types and layouts
- ✅ Field bindings and encodings
- ✅ Color palettes and legends
- ✅ Filter actions and highlight interactions
- ✅ Dashboard zone positioning

See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for detailed compliance checklist.

## License

MIT
