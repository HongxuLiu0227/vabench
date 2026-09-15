# Tableau Trip Dashboard

A React + TypeScript + Vite application that visualizes bike trip data with interactive charts, implementing Tableau dashboard specifications.

## Features

- **Trips Over Time Chart**: Dual-axis line chart showing trip counts and average duration over time
- **Percentage of Trips by User Type**: Line chart showing Subscriber vs Customer percentages
- **Percentage of Trips by Gender**: Line chart showing Female vs Unknown gender percentages
- **Interactive Filtering**: Click on charts to filter by month, user type, or gender
- **Highlighting**: Hover and click interactions to highlight specific data series
- **Responsive Design**: Clean, modern UI with proper spacing and visual hierarchy

## Installation

Install dependencies using npm:

```bash
npm install
```

Or using pnpm:

```bash
pnpm install
```

## Development

Start the development server:

```bash
npm run dev
```

Or using pnpm:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173/`

## Testing

Currently, this project does not have a test script configured. To add testing, you can install a testing framework like Vitest:

```bash
npm install -D vitest @vitest/ui
```

## Building

Build the application for production:

```bash
npm run build
```

Or using pnpm:

```bash
pnpm build
```

The production files will be in the `dist/` directory.

## Linting

Run ESLint to check code quality:

```bash
npm run lint
```

Or using pnpm:

```bash
pnpm lint
```

## Data Loading

The dashboard loads trip data from CSV files located in `public/data/`. The data is fetched at runtime using the Fetch API and parsed using D3's CSV parser.

## Tableau Specification Compliance

This dashboard is built according to a Tableau specification contract that defines:
- Chart intents (line_chart for all three worksheets)
- Data filtering and aggregation rules
- Interactive behaviors (filter actions and highlight bindings)
- Legend positioning and styling
- Axis titles and formatting

## Project Structure

- `src/components/`: React components for charts and dashboard layout
- `src/services/`: Data loading and processing services
- `src/contexts/`: React Context for filter and highlight state management
- `src/hooks/`: Custom React hooks for data management
- `src/types/`: TypeScript type definitions
- `src/utils/`: Utility functions for data validation
- `public/data/`: CSV data files loaded at runtime

## Browser Support

This project supports modern browsers that support:
- ES6+ JavaScript
- CSS Grid and Flexbox
- SVG for chart rendering
