# Tableau Dashboard - Informative Dashboard

A React + TypeScript + Vite implementation of the Tableau "Informative Dashboard" with interactive visualizations and filter actions.

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

## Build

Build for production:

```bash
pnpm build
```

## Testing

Run tests:

```bash
pnpm test
```

Note: Tests are not yet configured for this project.

## Linting

Run ESLint:

```bash
pnpm lint
```

## Data Source

This dashboard loads data from CSV files located in the `public/data/` directory at runtime:
- `/data/Sample - Superstore_Orders.csv`
- `/data/Sample - Superstore_People.csv`
- `/data/Sample - Superstore_Returns.csv`

## Worksheets

The dashboard includes 7 interactive worksheets:
- **Top 10 Customers** - Horizontal ranked bar chart
- **Bottom 10 Customers** - Horizontal ranked bar chart
- **Sales by City** - Horizontal ranked bar chart
- **Sales by Sub Category** - Horizontal ranked bar chart
- **Customer Sales & Profits** - Scatter plot visualization
- **Sales Map** - Geographic map visualization
- **Info** - Summary information display

## Interactions

The dashboard supports:
- **Filter Actions**: Click on bars in "Sales by Sub Category", "Sales by City", or "Customer Sales & Profits" to filter all worksheets
- **Highlight Bindings**: Selection highlights across all worksheets
- **Auto-Clear**: Selection state automatically clears when new selections are made

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
