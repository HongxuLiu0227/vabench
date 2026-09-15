# COVID-19 Analysis Dashboard

A React-based dashboard for visualizing COVID-19 data, implemented according to Tableau specifications.

## Project Structure

- **Data Layer**: `/src/services/dataService.ts` - Fetches and processes COVID-19 data from `/data/TEMP_1ivazc70g79b4o17qlddt0m84lj6.csv`
- **Components**: `/src/components/` - Contains chart components and worksheets
- **Types**: `/src/types/data.ts` - TypeScript interfaces for data structures

## Features

### Worksheets

1. **Daily Cases** (Horizontal Ranked Bar)
   - Shows monthly new cases per million
   - Filter: Months 3-12 (March to December)
   - Aggregation: Sum of `new_cases_per_million` by year-month

2. **Top 10** (Horizontal Ranked Bar)
   - Shows top 10 countries by total deaths
   - Filter: 11 specific countries (Afghanistan, Australia, Brazil, France, India, Italy, Russia, South Africa, Turkey, United Kingdom, United States)
   - Aggregation: Sum of `new_deaths` by location

3. **Total Cases** (Vertical Ranked Bar)
   - Shows average new cases by continent
   - Filter: Africa and South America
   - Aggregation: Average of `new_cases` by continent

4. **Total Deaths** (Vertical Ranked Bar)
   - Shows average new deaths per million by continent
   - Filter: Africa and South America
   - Aggregation: Average of `new_deaths_per_million` by continent

### Interactions

- **Highlight**: Click on any bar to highlight that category across all charts
- **Auto-clear**: Click outside bars to clear highlights
- **Hover**: Hover over bars to see them highlighted while others fade

## Tech Stack

- **React 19.2.4** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.3.1** - Build tool
- **D3.js** - Data visualization (d3-scale, d3-shape, d3-axis, d3-array, d3-time, d3-dsv)

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

## Data Policy

All runtime data is loaded from `/data/TEMP_1ivazc70g79b4o17qlddt0m84lj6.csv` using the native `fetch` API. No data files are stored under `src/`.

## Tableau Spec Compliance Checklist

### Worksheets Implemented

✅ **Daily Cases**
- chart_type: Bar (horizontal_ranked_bar)
- rows: Year-Month (yr/mn)
- cols: SUM(new_cases_per_million)
- filter: Months 3-12
- title: None
- axis_titles: None
- legend: Not required
- interactions: Highlight on date fields

✅ **Top 10**
- chart_type: Automatic (horizontal_ranked_bar)
- rows: Location
- cols: SUM(new_deaths)
- filter: 11 countries
- title: "Top 10 countries having more deaths"
- axis_titles: None
- legend: Not required
- interactions: Highlight on new_deaths

✅ **Total Cases**
- chart_type: Bar (vertical_ranked_bar)
- rows: AVG(new_cases)
- cols: Continent
- filter: Africa, South America
- title: "Total Cases Continent Wise"
- axis_titles: None
- legend: Not required
- interactions: Highlight on continent

✅ **Total Deaths**
- chart_type: Bar (vertical_ranked_bar)
- rows: AVG(new_deaths_per_million)
- cols: Continent
- filter: Africa, South America
- title: None
- axis_titles: None
- legend: Not required
- interactions: Highlight on continent

### Dashboard Elements

✅ **Dashboard Layout**
- Grid layout with 3 columns, 2 rows
- Daily Cases spans bottom row
- Proper zone positioning

✅ **Dashboard Text Zone**
- Title: "Purvit Vashishtha"
- Subtitle: "COVID-19 Analysis Dashboard"

✅ **Dashboard Actions**
- Highlight brush action with auto-clear
- Target: All worksheets in dashboard

✅ **Highlight Bindings**
- Top 10: sum:new_deaths
- Daily Cases: Multiple date fields
- Total Cases: continent
- Total Deaths: continent

## Implementation Notes

- All numeric measures are parsed explicitly using `parseFloat()` before aggregation
- Charts use D3 scales for proper axis calculations
- Responsive design with dynamic chart margins
- Full category label visibility preserved
- Bars sorted descending by displayed measure (as per Tableau spec)
