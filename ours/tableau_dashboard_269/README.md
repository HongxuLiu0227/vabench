# Tableau Dashboard - Superstore Sales Analysis

A React + TypeScript + Vite application that reproduces Tableau dashboard functionality for analyzing sales and profit data from the Sample Superstore dataset.

## Features

- **Interactive Dashboard**: Four-panel layout with multiple visualization types
- **Cross-Filtering**: Click on bars, states, or categories to filter all worksheets
- **Tableau Compliant**: Follows Tableau render contract for accurate visualization
- **Responsive Design**: Uses ResizeObserver for dynamic chart sizing
- **Real Data Analysis**: Loads full dataset from public/data directory

## Installation

Install dependencies:
```bash
pnpm install
```

## Available Scripts

- **`pnpm dev`** - Start development server with hot module replacement
- **`pnpm build`** - Build for production (runs TypeScript check + Vite build)
- **`pnpm lint`** - Run ESLint to check code quality
- **`pnpm preview`** - Preview production build locally

## Development

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Create an optimized production build:
```bash
pnpm build
```

The built files will be in the `dist/` directory.

## Data Source

This dashboard uses the Sample Superstore dataset located at:
- `/data/Orders (Sample - Superstore).csv`

The data is loaded at runtime via `fetch()` calls to ensure the full dataset is used for all visualizations.

## Dashboard Worksheets

1. **Sales by Region** - Vertical ranked bar chart with profit-based color encoding
2. **Sales&Profit by Subcategory** - Horizontal ranked bar chart
3. **Sales&Profits by Product Name** - Custom table view
4. **Sales by States** - Horizontal ranked bar chart

## Interactions

The dashboard supports the following filter actions (with auto-clear on re-click):

- **Action 1**: Click on a region bar to filter all worksheets by that region
- **Action 2**: Click on a state bar to filter all worksheets by that state
- **Action 3**: Click on a subcategory bar to filter all worksheets by category and sub-category

Filters are applied across all worksheets simultaneously, reproducing Tableau's dashboard-wide filter behavior.

## Technical Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization
- **PapaParse** - CSV parsing
- **ESLint** - Code linting

## Tableau Render Contract

This application follows the Tableau render contract specified in `docs/tableau_render_contract.json`:

- All worksheets implement their specified `chart_intent`
- Dashboard actions reproduce Tableau filter interactions
- Highlight bindings enable cross-worksheet highlighting
- Color encodings match Tableau specifications
- Dynamic axis margins prevent label clipping

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
