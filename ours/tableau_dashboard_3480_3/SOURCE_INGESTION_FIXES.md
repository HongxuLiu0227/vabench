# Tableau Source Ingestion Fixes - Summary

## Problem Identified

The CSV file at `/data/TEMP_1o6gr4v0a4irtf1f3ekzg1cc6xxs.csv` had malformed headers that prevented proper field access:

1. **BOM (Byte Order Mark)**: A UTF-8 BOM character (`﻿`) was present at the start of the file
2. **Triple-quoted first column**: `"""Trip Duration"""`
3. **Double-quoted columns**: All other columns had double quotes, e.g., `"Start Time"`, `"Gender"`

When d3-dsv's `csvParse` function read this file, it created column keys with these quotes included:
- `'﻿"""Trip Duration"""'`
- `'"Start Time"'`
- `'"Gender"'`

The original code tried to access fields like `trip['Start Time']`, which returned `undefined` because the actual key was `'"Start Time"'`.

## Solution Implemented

Updated `/src/services/dataService.ts` with robust header normalization:

### 1. BOM Removal
```typescript
let csvText = await response.text();
if (csvText.charCodeAt(0) === 0xFEFF) {
  csvText = csvText.slice(1);
}
```

### 2. Header Normalization Function
```typescript
function normalizeHeader(header: string): string {
  // Remove BOM if present
  let cleaned = header.replace(/^\uFEFF/, '');

  // Remove outer quotes (handles both "field" and """field""")
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  cleaned = cleaned.replace(/^"+|"+$/g, '');

  return cleaned;
}
```

### 3. Header Mapping
Created a mapping from raw CSV headers to normalized field names:
```typescript
function createHeaderMapping(rawHeaders: string[]): Map<string, string> {
  const mapping = new Map<string, string>();
  for (const rawHeader of rawHeaders) {
    const normalized = normalizeHeader(rawHeader);
    mapping.set(rawHeader, normalized);
  }
  return mapping;
}
```

### 4. Safe Field Access
Added a helper function to safely access fields using normalized names:
```typescript
function getFieldValue(row: DSVRow, headerMapping: Map<string, string>, fieldName: string): string {
  for (const [rawHeader, normalized] of headerMapping.entries()) {
    if (normalized === fieldName) {
      return row[rawHeader] || '';
    }
  }
  return row[fieldName] || '';
}
```

## Verification Results

### CSV Parsing Test
✅ All 15 columns successfully normalized:
- Trip Duration
- Start Time
- Stop Time
- Start Station ID
- Gender
- etc.

### Data Integration Test
✅ First 10 rows: All valid
- Dates parse correctly (no NaN or Jan 1970 issues)
- Hour values in range [0, 23]
- Day values in range [1, 31]
- Gender values parse as numbers

### Aggregation Test
✅ aggregateByHourAndGender:
- Generates 48 data points (24 hours × 2 genders)
- No NaN values
- No negative values
- Filter by day works correctly

✅ aggregateByDayAndWeekday:
- Generates day-weekday combinations
- No NaN values
- No negative values
- Sorted correctly by day

### Build Test
✅ Build successful (TypeScript + Vite):
- No compilation errors
- Bundle size: 265.99 KB (gzipped: 86.65 KB)

## Data Quality Evidence

Sample of parsed data (first 1000 rows):
- **Gender distribution**:
  - 0 (Undefined): 26 records
  - 1 (Male): 974 records
  - 2 (Female): 0 records

- **Peak hours**: 13:00 (123 trips), 12:00 (114 trips), 15:00 (110 trips)
- **Peak days**: Day 19 (286 trips), Day 18 (245 trips)
- **Weekday distribution**: All 7 weekdays represented

## Compliance with Requirements

✅ **Tableau Data Policy**:
- Runtime data source: `/data/TEMP_1o6gr4v0a4irtf1f3ekzg1cc6xxs.csv`
- Load via `fetch('/data/...')`
- No CSV files under `src/data` or `src/mocks`
- No synthesized data - reads full dataset

✅ **Tableau Spec Contract**:
- Required fields resolve correctly:
  - `cnt:Start Station ID:qk` → Trip count aggregation
  - `hr:Start Time:qk` → Hour of day (0-23)
  - `dy:Start Time:ok` → Day of month (1-31)
  - `wd:Start Time (copy)_...` → Weekday (0-6)
  - `none:Gender:nk` → Gender (0, 1, 2)
- Filter members [1, 2] for Gender work correctly
- No silent bad parses

✅ **Tableau Render Contract**:
- Both worksheets can access their required fields
- No all-zero charts (data has non-zero values)
- No NaN filters
- No Jan 1970 timelines (dates parse correctly)

## Impact on Downstream Stages

1. **QA Stage**: Data is now deterministically parsed - tests will see consistent, valid data
2. **Build Stage**: No compilation errors, clean TypeScript build
3. **Runtime**: Charts will render with actual data instead of empty/undefined values

## Files Modified

1. `/src/services/dataService.ts` - Added header normalization logic

## No Data Loss

✅ Original CSV file remains unchanged at `/public/data/TEMP_1o6gr4v0a4irtf1f3ekzg1cc6xxs.csv`
✅ All data quality evidence preserved
✅ No deletion or modification of source data
