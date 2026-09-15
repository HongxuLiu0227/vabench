# Deployment Notes

## Quick Start

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Development Server:**
   ```bash
   npm run dev
   ```
   Dashboard will be available at `http://localhost:5173/`

3. **Production Build:**
   ```bash
   npm run build
   ```
   Built files will be in `dist/`

4. **Preview Production Build:**
   ```bash
   npm run preview
   ```

## Data Files

The dashboard requires these CSV files to be present in `public/data/`:
- `TEMP_0lftzi414zrmhq1bx5w7b05n83gh.csv` (108KB)
- `TEMP_0wf32yc0donotc13aoxty1ndxfqb.csv` (136MB)

## Authentication

No authentication is implemented in this dashboard. All data is publicly accessible.

## Browser Compatibility

- Modern browsers with ES6+ support
- D3.js for data visualization
- React 18+ for UI rendering

## Performance Notes

- Initial data load may take 2-5 seconds (136MB CSV)
- Charts render progressively as data is processed
- Aggregations are memoized for optimal performance

## Technical Stack

- React 18.3.1
- TypeScript 5.7.2
- D3.js 7.9.0
- Vite 7.3.1
- React Router DOM 7.4.0

## Tableau Compliance

This dashboard is fully compliant with the Tableau spec in:
- `docs/tableau_spec.json`
- `docs/tableau_render_contract.json`

All worksheets, interactions, and visual specifications have been implemented.
