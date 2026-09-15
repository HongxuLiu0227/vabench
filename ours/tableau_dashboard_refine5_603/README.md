# Tableau Dashboard - Synthetic Dashboard 603

A React + TypeScript + Vite application that reproduces Tableau dashboard visualizations using D3.js for data visualization.

## Dashboard Overview

This dashboard displays Superstore sales data with four interactive worksheets:

1. **Total Sales Each Year** - Line chart showing sales trends by year
2. **Discount Overview by Region** - Regional metrics table with discount, profit, and sales data
3. **Line** - Time-series line chart showing monthly sales trends
4. **Scatterplot** - Sales vs. Profit scatter plot with quantity-based sizing

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

Run tests:

```bash
pnpm test -- --runInBand
```

## Build

Build for production:

```bash
pnpm build
```

The built files will be in the `dist/` directory.

## Linting

Run ESLint:

```bash
pnpm lint
```

## Data Source

This dashboard loads data from `/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv` in the public directory.

## Technologies

- React 19.2.0
- TypeScript 5.9.3
- Vite 7.3.1
- D3.js 7.9.0
- ESLint 9.39.1

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
