# Tableau Dashboard: Country Details by Region

This is a React-based implementation of a Tableau dashboard displaying library statistics by region and country.

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

## Testing

Currently, no test files are present in this project. Test suite can be added as needed.

## Build

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

This dashboard loads library data from:
- `/data/Global Library Data_ST_Blanks_Country_Data.csv`

Data is loaded via `fetch()` at runtime from the `public/data` directory, following Tableau data policy requirements.

## Dashboard Features

- **Total Libraries by Region**: Horizontal ranked bar chart showing library counts by region
- **Country Details**: Detailed table showing expenditures, users, and volumes by country
- **Interactive Filtering**: Click on a region bar to filter country details (with auto-clear on re-click)

## Technical Stack

- React 19.1.1 with TypeScript
- D3.js for data visualization
- Vite for build tooling
- pnpm for package management

## Tableau Spec Compliance

This dashboard implements the following worksheets:
- **Country Details** (custom_tableau_view)
- **Total Libraries by Region** (horizontal_ranked_bar)

Interaction support:
- On-select filter action from "Total Libraries by Region" to dashboard
- Highlight bindings on Region and Country fields
