# Tableau Dashboard - Baseball Data Analysis

A React + TypeScript + Vite application that replicates a Tableau dashboard for baseball player data analysis.

## Features

This application implements 8 worksheets from the original Tableau workbook:

1. **OverView** - Summary statistics by handedness
2. **Batting Avg** - Vertical ranked bar chart showing batting averages by player
3. **Avg. Home Run with Height & Weight** - Vertical ranked bar chart showing HR by height/weight combination
4. **Bad/Good Height** - Classification of players by height (>73" vs ≤73")
5. **Bad/Good Weight** - Classification of players by weight (>184 lbs vs ≤184 lbs)
6. **Relation btw Weight and Height** - Table view showing player relationships
7. **Relation btw Weight and Height with respect to Handedness** - Analysis by handedness
8. **Sheet 3** - Additional measure values by handedness

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js v7** - Data visualization (using d3-scale, d3-axis, d3-shape, d3-selection, d3-array)
- **React Router DOM** - Client-side routing

## Data Source

The application loads data from `/public/data/TEMP_1gmu7581ajjigv161l39r0mgmvpl.csv` containing baseball player statistics including:
- Player name
- Handedness (L/R/B)
- Height (inches)
- Weight (lbs)
- Batting Average
- Home Runs (HR)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Architecture

### Data Layer (`src/services/dataService.ts`)
- CSV parsing and data transformation
- Data aggregation functions for different chart types
- Filter calculations for "bad" height/weight classifications

### Visualization Components (`src/components/charts/`)
- **VerticalRankedBarChart** - D3-based bar chart with tooltips and interactions
- **ScatterPlot** - D3-based scatter plot for height/weight relationships

### View Components (`src/components/views/`)
- **CustomTableauView** - Table-based views matching Tableau's layout

### Worksheet Components (`src/components/worksheets/`)
- Individual worksheet implementations matching the Tableau specification
- Each worksheet handles its own data aggregation and rendering

### Interaction System (`src/lib/`)
- **InteractionProvider** - Context for managing selection state across worksheets
- **useInteraction** - Hook for accessing and updating interaction state
- Supports cross-worksheet highlighting and filtering

## Routing

The application uses React Router with the following routes:
- `/` - Main dashboard (Result Of Final Analysis)
- `/dashboard` - Alias for main dashboard
- All other routes redirect to `/`

## Interactions

### Selection/Highlighting
- Click on any chart element (bars, table rows) to select that data
- Selected items are highlighted across all worksheets
- Click again to deselect
- Selection state is managed globally and propagates to all components

### Tooltips
- Hover over chart elements to see detailed information
- Tooltips show player statistics, values, and metadata

## Tableau Spec Compliance Checklist

✅ **Avg. Home Run with Height & Weight**
- Chart intent: vertical_ranked_bar
- Title preserved
- Full category labels visible
- Dynamic margins for axis labels
- Descending sort by measure
- On-select highlight interactions with auto-clear

✅ **Bad/Good Height**
- Chart intent: custom_tableau_view
- Title preserved
- Full category labels visible
- Dynamic margins
- On-select highlight interactions with auto-clear

✅ **Bad/Good Weight**
- Chart intent: custom_tableau_view
- Title preserved
- Full category labels visible
- Dynamic margins
- On-select highlight interactions with auto-clear

✅ **Batting Avg**
- Chart intent: vertical_ranked_bar
- Title preserved
- Full category labels visible
- Dynamic margins
- Descending sort by measure
- On-select highlight interactions with auto-clear

✅ **OverView**
- Chart intent: custom_tableau_view
- Title preserved
- Full category labels visible
- Dynamic margins
- On-select highlight interactions with auto-clear

✅ **Relation btw Weight and Height**
- Chart intent: custom_tableau_view
- Title preserved
- Full category labels visible
- Dynamic margins
- On-select highlight interactions with auto-clear

✅ **Relation btw Weight and Height with respect to the Handedness**
- Chart intent: custom_tableau_view
- Title preserved
- Full category labels visible
- Dynamic margins
- On-select highlight interactions with auto-clear
- Filter action implemented

✅ **Sheet 3**
- Chart intent: custom_tableau_view
- Title preserved
- Full category labels visible
- Dynamic margins
- On-select highlight interactions with auto-clear

✅ **Dashboard Actions**
- Filter 1: Avg. Home Run with Height & Weight → Result Of Final Analysis
- Filter 2: Relation btw Weight and Height with respect to Handedness → Result Of Final Analysis

✅ **Highlight Bindings**
- Implemented for all 9 worksheet binding specifications
- Cross-worksheet highlighting functional

## Project Structure

```
src/
├── components/
│   ├── charts/           # D3-based chart components
│   ├── views/            # Tableau-style view components
│   ├── worksheets/       # Individual worksheet implementations
│   └── Dashboard.tsx     # Main dashboard layout
├── hooks/
│   └── useData.ts        # Data loading hook
├── lib/
│   ├── InteractionProvider.tsx  # Interaction context
│   └── useInteraction.ts        # Interaction hook
├── services/
│   └── dataService.ts    # Data loading and transformation
├── types/
│   └── baseball.ts       # TypeScript interfaces
├── utils/
│   └── chartUtils.ts     # Chart utility functions
├── App.tsx               # Main app with routing
└── main.tsx              # Entry point
```

## Browser Compatibility

Works on modern browsers that support ES2020+.

## License

This project was generated from a Vite template and customized for Tableau dashboard replication.

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
