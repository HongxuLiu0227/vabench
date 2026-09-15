# Metacritic Games Dashboard

A Tableau-faithful React dashboard visualizing video game critic and user scores from Metacritic data.

## Overview

This dashboard recreates a Tableau workbook visualization using React, TypeScript, and D3.js. It displays game metrics across three interactive worksheets with cross-filtering capabilities.

## Features

- **Game Metrics Chart**: Line chart showing average Metascore trends by release month
- **Critics Table**: Detailed breakdown of critic reviews (positive, neutral, negative)
- **Users Table**: Detailed breakdown of user reviews (positive, neutral, negative)
- **Cross-Worksheet Filtering**: Click on any data point to filter all views
- **Responsive Design**: Tableau-faithful layout with proper aspect ratios

## Tech Stack

- **React 19.2** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7.3** - Build tool
- **D3.js 7.9** - Data visualization
- **React Router DOM 7.13** - Client-side routing
- **PapaParse 5.5** - CSV parsing

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Build

```bash
pnpm build
```

Production build will be in the `dist/` directory.

## Linting

```bash
pnpm lint
```

## Data Source

The dashboard loads data from `/public/data/metacritic_games_clean.csv`, which contains:
- Game titles and platforms
- Developer and genre information
- Critic scores (positive, neutral, negative counts)
- User scores (positive, neutral, negative counts)
- Metascore and user score aggregates
- Release dates

## Dashboard Layout

The dashboard follows the Tableau specification with three worksheets:

1. **game_meta** (top, full-width)
   - Line chart of average Metascore by month
   - Interactive points for filtering
   - Axis titles: "Average Metascore" and "Month of release"

2. **game_crit** (bottom left)
   - Table view of critic metrics by game
   - Columns: Game, Positive, Neutral, Negative, Total
   - Clickable rows for filtering

3. **game_users** (bottom right)
   - Table view of user metrics by game
   - Columns: Game, Positive, Neutral, Negative, Total
   - Clickable rows for filtering

## Interactions

- **Filter Actions**: All three worksheets participate in cross-filtering
- **Auto-Clear**: Selections are automatically cleared when new selections are made
- **Highlight Fields**: Game, platform, and ad-hoc clusters support highlighting
- **Visual Feedback**: Selected items are highlighted; non-selected items are dimmed

## Routing

- `/` - Main dashboard (default)
- `/dashboard` - Alias for main dashboard
- All other routes redirect to `/`

## Tableau Spec Compliance

This implementation follows the `tableau_spec.json` and `tableau_render_contract.json` specifications:

- ✅ All 3 worksheets implemented
- ✅ Correct chart intents (line_chart, custom_tableau_view)
- ✅ Proper field bindings and aggregations
- ✅ Axis titles rendered where specified
- ✅ Dashboard text zones (source and attribution)
- ✅ Filter actions with auto-clear behavior
- ✅ Highlight bindings for interactive selection
- ✅ Zone-based layout matching Tableau coordinates
- ✅ Title styling (colors, fonts, emphasis)
- ✅ No decorative chrome beyond Tableau specification

## File Structure

```
src/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard container
│   ├── GameMetaChart.tsx    # Line chart visualization
│   ├── GameCritTable.tsx    # Critics table
│   └── GameUsersTable.tsx   # Users table
├── contexts/
│   └── FilterContext.tsx # State management for filtering
├── services/
│   └── dataService.ts   # Data loading from CSV
├── types/
│   └── index.ts         # TypeScript type definitions
├── utils/
│   └── dataTransformations.ts  # Data aggregation helpers
├── App.tsx              # Root component with routing
└── main.tsx             # Application entry point
```

## License

MIT

## Credits

- Data source: [Kaggle - Metacritic Games Stats 2011-2019](https://www.kaggle.com/skateddu/metacritic-games-stats-20112019)
- Original dashboard created by: Sergio Funes
