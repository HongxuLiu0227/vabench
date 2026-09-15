# Mars Weather Dashboard

A React + TypeScript + Vite application visualizing Mars weather data using D3.js. This dashboard displays temperature, pressure, and seasonal data from Mars rovers, implemented according to Tableau specification contracts.

## Installation

Install dependencies using pnpm:

```bash
pnpm install
```

## Available Scripts

### `pnpm dev`

Start the development server with hot module replacement (HMR). Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

### `pnpm build`

Build the application for production. This compiles TypeScript and bundles the application using Vite.

```bash
pnpm build
```

The built files will be in the `dist/` directory.

### `pnpm lint`

Run ESLint to check code quality and ensure code standards are met.

```bash
pnpm lint
```

### `pnpm preview`

Preview the production build locally.

```bash
pnpm build
pnpm preview
```

## Data Source

This dashboard loads Mars weather data from `/data/mars_data.csv` (located in `public/data/`). The data is fetched at runtime and processed using Papa Parse for CSV parsing.

## Tableau Specification Compliance

This dashboard implements a Tableau workbook specification with the following worksheets:

1. **Sheet 1 - Maximum Temperatures**: Scatter plot showing max temperatures over sols elapsed, with reference lines and seasonal color encoding.
2. **Sheet 2 - Average Temperature Fluctuations**: Grouped visualization showing average min/max temperatures by month.
3. **Sheet 3**: Monthly temperature range analysis (not displayed in main dashboard).
4. **Sheet 4**: Temperature fluctuation by category (not displayed in main dashboard).
5. **Sheet 5 - Can You Handle the Pressure?**: Horizontal bar chart showing average pressure by month with reference lines for Mt. Everest and Armstrong Limit.

### Interactions

- **Highlight Action**: Click on data points in Sheet 1 to highlight by month.
- **Filter Action**: Click on data points in Sheet 2 to filter the entire dashboard by month.
- **Auto-clear**: Interactions use auto-clear behavior for better UX.

## Project Structure

```
src/
├── components/
│   ├── dashboard/        # Main dashboard layout
│   ├── worksheets/       # Individual worksheet components (Sheet 1-5)
│   └── ui/              # Loading and error states
├── contexts/            # React context for cross-worksheet interactions
├── services/            # Data loading and processing service
└── types/               # TypeScript type definitions
```

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js** - Data visualization
- **Papa Parse** - CSV parsing
- **ESLint** - Code linting
