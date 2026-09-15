# Tableau Dashboard - Sales Analysis

This is a React-based implementation of a Tableau dashboard displaying sales analysis with three interactive worksheets: Sales by Segment, Plot of Sales, and Sales by Region.

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

## Building

Build the project for production:

```bash
pnpm build
```

## Linting

Run ESLint to check code quality:

```bash
pnpm lint
```

## Data Source

This dashboard loads data from the following CSV files located in `public/data/`:
- Superstore Sales Training_Orders.csv
- Superstore Sales Training_Returns.csv
- Superstore Sales Training_Users.csv

Data is loaded at runtime via `fetch('/data/...')` calls to ensure full dataset access.

## Dashboard Features

### Worksheets
1. **Sales by Segment** - Pie chart showing sales distribution by customer segment with interactive filtering
2. **Plot of Sales** - Scatter plot showing the relationship between Sales and Profit, colored by customer segment
3. **Sales by Region** - Horizontal bar chart showing sales by country/region, colored by profit

### Interactions
- Click on segments in the Sales by Segment pie chart to filter the entire dashboard (auto-clear enabled)
- Hover over any chart element to highlight related data across all worksheets
- Region filter available in the sidebar for additional filtering

### Compliance
- ✅ Tableau spec compliance: Implements all worksheets according to tableau_spec.json
- ✅ Tableau render contract: Follows chart intents and dashboard layout from tableau_render_contract.json
- ✅ Data policy compliance: All data loaded from public/data URLs, no dataset files in src/data or src/mocks

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
