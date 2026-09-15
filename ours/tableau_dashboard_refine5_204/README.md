# Tableau Dashboard 204 - Superstore Orders Analytics

This is a React + TypeScript + Vite application that implements a Tableau-style dashboard for visualizing Superstore Orders data.

## Dashboard Overview

The dashboard displays four visualizations in a 2x2 grid layout:

- **Top-Left**: Total Sales Each Year (Line Chart)
- **Top-Right**: Sales by Sub-Category (Horizontal Ranked Bar)
- **Bottom-Left**: Scatterplot (Sales vs Profit with Quantity encoding)
- **Bottom-Right**: Bar Chart (Sales by Category/Sub-Category)

## Data Source

All dashboard data is loaded from:
```
/data/9517_dash_dashboard0_png_informative_dashboard/p9517_Sample_-_Superstore_Orders.csv
```

The data is fetched at runtime and aggregated client-side using D3.js for visualization.

## Key Features

- **Full Data Loading**: Loads complete CSV dataset via fetch API (no sample data)
- **Accessible Components**: Uses proper ARIA roles and semantic HTML for loading/error states
- **Interactive Charts**: All charts include hover effects and tooltips for data exploration
- **Dynamic Layout**: Chart margins adjust automatically to accommodate long category labels
- **Responsive Design**: Grid layout adapts to different screen sizes

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

## Build

Build the production bundle:
```bash
pnpm build
```

The built files will be in the `dist` directory.

## Linting

Run ESLint to check code quality:
```bash
pnpm lint
```

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization
- **PapaParse** - CSV parsing
- **React Router** - Client-side routing

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

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
