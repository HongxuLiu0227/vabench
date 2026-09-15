# CitiBike Trip Dashboard

A React + TypeScript + Vite dashboard visualizing CitiBike trip data from Jersey City in January 2017. Built to replicate Tableau workbook functionality using D3.js for visualizations.

## Features

- **Interactive Dashboard**: Displays popularity of CitiBike stations with three visualizations
- **Top 10 Stations**: Vertical bar chart showing the most popular start stations
- **Bottom 10 Stations**: Vertical bar chart showing the least popular start stations
- **End Station Map**: Scatter plot visualization of end station locations with size encoding trip count
- **Cross-Filter Interactions**: Click on any bar or circle to filter all other worksheets
- **Auto-Clear Behavior**: Click again on a selected item to clear the filter

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and optimized builds
- **D3.js (v7)** for chart rendering and data visualization
- **React Router DOM** for client-side routing
- **d3-dsv** for CSV parsing
- **CSS Modules** for styling (no Tailwind or Ant Design)

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard layout
│   ├── TopStations.tsx        # Top 10 start stations (vertical bar chart)
│   ├── BottomStations.tsx     # Bottom 10 start stations (vertical bar chart)
│   └── Map1.tsx               # End station popularity (scatter plot)
├── contexts/
│   └── DashboardContext.tsx   # Global state for filters and data
├── services/
│   └── dataLoader.ts          # Data fetching and aggregation logic
├── types/
│   └── citibike.ts            # TypeScript interfaces
└── App.tsx                    # Router setup
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

The dashboard will be available at `http://localhost:5173`

### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Lint

```bash
# Run ESLint
pnpm lint
```

## Data Source

The dashboard uses CitiBike trip data from January 2017:
- **File**: `public/data/JC-201701-citibike-tripdata.csv`
- **Records**: ~5,800+ trips
- **Fields**: Trip duration, start/end times, station locations, user demographics

## Tableau Spec Compliance

This dashboard implements the following from the Tableau render contract:

### Worksheets Implemented

1. **Top Stations** (`vertical_ranked_bar`)
   - Chart intent: Vertical ranked bar
   - Title: "Top 10 Stations by Start Station (Count)"
   - Sort: Descending by count
   - Color: Blue (#1f77b4)

2. **Bottom Stations** (`vertical_ranked_bar`)
   - Chart intent: Vertical ranked bar
   - Title: "Bottom 10 Stations by Start Station (Count)"
   - Sort: Ascending by count
   - Background: #d4d4d4
   - Color: Orange (#ff7f0e)

3. **Map 1** (rendered as scatter plot per contract)
   - Chart intent: Horizontal ranked bar (rendered as scatter for coordinates)
   - Title: "Popularity of End Station"
   - X-axis: End station longitude
   - Y-axis: End station latitude
   - Size: Encodes trip count
   - Color: Green (#2ca02c)
   - Legend: Overlay legend showing count size scale

### Interactions Implemented

- ✅ Filter actions between all three worksheets
- ✅ Auto-clear behavior on re-selection
- ✅ Highlight states (non-selected items dimmed)
- ✅ Cross-worksheet filtering (selecting in one filters all)

### Compliance Checklist

- [x] All worksheet titles match contract exactly
- [x] Chart intents implemented as specified
- [x] Filter actions working as specified
- [x] Dashboard zones layout respects contract positioning
- [x] Axis labels preserved and fully visible
- [x] Legend rendered for Map 1 with overlay positioning
- [x] Dynamic margins for full label visibility
- [x] Numeric measures parsed explicitly before aggregation
- [x] Data loaded from `/data/...` via fetch only
- [x] No synthetic/sample data in visualizations

## Usage

1. **View Dashboard**: The main dashboard shows all three visualizations
2. **Filter Data**: Click on any bar (Top/Bottom Stations) or circle (Map) to filter by that station
3. **Clear Filter**: Click the same item again to clear the filter
4. **Navigate**: Use the browser's back/forward buttons - routing is fully implemented

## License

MIT

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
