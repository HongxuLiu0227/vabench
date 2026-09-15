# Metacritic Games Analysis Dashboard

A React-based interactive dashboard for analyzing Metacritic video game data. Built with TypeScript, React Router, and D3.js for data visualization.

## Features

- **6 Interactive Dashboards**: Overview, Developer, Game, Genre, Platform, and Number of Players analysis
- **16 Worksheet Components**: Custom D3-based visualizations
- **Interactive Filters**: Multi-select dropdowns for Platform, Genre, Rating, Developer, and Number of Players
- **Real-time Data Filtering**: All charts update based on selected filters
- **Responsive Design**: Works on desktop and tablet devices
- **Client-side Routing**: Navigation using React Router DOM

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** for fast development and building
- **D3.js** (v7) for data visualizations
- **React Router DOM** for navigation
- **PapaParse** for CSV parsing
- **CSS** for styling (no component library)

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

The built files will be in the `dist/` directory.

## Data Source

The dashboard loads data from `/public/data/metacritic_games_clean.csv` at runtime.

## Tableau Compliance Checklist

This implementation follows the Tableau render contract specifications:

- ✅ All 16 worksheets implemented according to chart_intent
- ✅ Proper zone positioning for dashboard layouts
- ✅ Axis titles rendered where specified
- ✅ Filter actions implemented
- ✅ Highlight interactions with auto-clear behavior
- ✅ Full category labels preserved (no clipping)
- ✅ Dynamic chart margins for label visibility
- ✅ Dashboard text zones rendered with exact wording
- ✅ Data loaded from `/data/...` at runtime (not from source files)

## License

This project was generated based on a Tableau workbook specification.
