# Tableau Source Ingestion Fixes Summary

## Overview
Made Tableau source ingestion deterministic and correct by fixing CSV parsing, replacing mock data with real data, and adding validation.

## Changes Made

### 1. Fixed CSV Column Name Cleaning (`src/services/dataService.ts`)

**Problem**: The CSV file has triple-quoted headers (e.g., `"""date"""`) and a BOM (Byte Order Mark) character at the beginning, which caused column names to be parsed incorrectly.

**Solution**: Enhanced the `cleanColumnName` function to:
- Remove BOM character (`\uFEFF`)
- Handle triple-quoted headers properly
- Clean all column names consistently

```typescript
function cleanColumnName(name: string): string {
  return name
    .replace(/^\uFEFF/, '') // Remove BOM (Byte Order Mark)
    .replace(/^["']+|["']+$/g, '') // Remove quotes from start/end
    .replace(/"{2,}/g, '') // Remove two or more consecutive quotes
    .trim();
}
```

### 2. Replaced Mock Data with Real Data (`src/services/dataService.ts`)

**Problem**: The dashboard was using `generateMockPredictionData()` which created fake 30-day data instead of using the real stock data from the CSV.

**Solution**: Updated `loadDashboardData()` to transform real stock data into the prediction format:

```typescript
function transformStockToPrediction(stockData: StockData[]): PredictionData[] {
  return stockData.map(row => ({
    Date: row.date,
    open: row.open,
    close: row.close,
  }));
}

export async function loadDashboardData(): Promise<{
  stockData: StockData[];
  predictionData: PredictionData[];
}> {
  const stockData = await loadStockData();
  const predictionData = transformStockToPrediction(stockData);
  return { stockData, predictionData };
}
```

### 3. Created Deterministic Validator (`scripts/validate-tableau-source.ts`)

**Purpose**: Ensures CSV parsing is correct and prevents data quality issues.

**Validates**:
- CSV file exists and is readable
- Headers are parsed correctly (handles triple quotes and BOM)
- Required columns exist: date, open, close, high, low, volume
- Numeric values are valid (non-zero, non-NaN)
- Dates are correct (no Jan 1970 epoch issues)
- Data has reasonable ranges

**Usage**:
```bash
npm run validate:tableau
```

**Output**:
```
=== Tableau Source Ingestion Validator ===
✓ CSV parsed successfully: 14578 rows
✓ Raw columns: ["﻿\"\"\"date\"\"\"","\"open\"",...]
✓ Cleaned columns: date, open, high, low, close, volume

=== Data Summary ===
Total rows: 14578
Date range: 1962-01-02 to 2019-11-27
Numeric columns:
  open: min=0.1123, max=152.3000, avg=22.5878
  close: min=0.1103, max=151.6400, avg=22.5901
  ...
✅ PASSED - Tableau source ingestion is deterministic and correct
```

### 4. Added NPM Script (`package.json`)

Added convenience script to run the validator:
```json
"validate:tableau": "npx tsx scripts/validate-tableau-source.ts"
```

## Data Quality Metrics

### Dataset: `prices-split-adjusted.csv`
- **Rows**: 14,578
- **Date Range**: 1962-01-02 to 2019-11-27 (57 years of data)
- **Columns**: date, open, high, low, close, volume

### Value Ranges (Sample)
- **open**: 0.1123 to 152.30 (avg: 22.59)
- **close**: 0.1103 to 151.64 (avg: 22.59)
- **high**: 0.1129 to 153.41 (avg: 22.80)
- **low**: 0.1078 to 151.15 (avg: 22.37)
- **volume**: 780 to 205,931,184 (avg: 5,900,316)

## Issues Prevented

✅ **All-zero charts**: Numeric columns have valid ranges (not all zeros)
✅ **NaN filters**: All numeric values parse correctly
✅ **Jan 1970 timelines**: Dates parse from 1962-2019 (no epoch issues)
✅ **Silent parse failures**: Validator catches parsing issues early
✅ **Mock data in production**: Dashboard now uses real CSV data

## Build Status

✅ **TypeScript compilation**: PASSED
✅ **Vite build**: PASSED (312.17 kB output)
✅ **Validator**: PASSED

## Compliance

✅ **Tableau Data Policy**:
- Runtime data source is `public/data/prices-split-adjusted.csv`
- No data under `src/data` or `src/mocks`
- Full dataset loaded via `fetch('/data/...')`
- No synthesized/sample data in dashboard

✅ **Tableau Spec Contract**:
- Required fields (date, open, close) resolve to real columns
- Data matches worksheet requirements

## How to Verify

Run the validator before QA/build stages:
```bash
npm run validate:tableau
```

Expected output: `✅ PASSED - Tableau source ingestion is deterministic and correct`
