# Tableau Source Ingestion Fixes - Summary

## Overview
Fixed deterministic and correct Tableau source ingestion for the Citi Bike dashboard.

## Problems Identified

### 1. Malformed CSV Headers
- **Issue**: CSV file had over-quoted headers (e.g., `"""F1""","""tripduration""",...`)
- **Impact**: d3-dsv parser was stripping outer quotes but leaving double quotes, causing field lookup failures
- **Root Cause**: Tableau export added extra quote layers around column names

### 2. Carriage Return Characters
- **Issue**: Last column had trailing `\r` character (Windows line endings)
- **Impact**: Field name `"gender"\r` wouldn't match expected `"gender"`
- **Root Cause**: File used Windows-style `\r\n` line endings

### 3. No Validation of Data Quality
- **Issue**: No checks for invalid dates (Jan 1970), NaN values, or missing fields
- **Impact**: Silent bad parses could lead to all-zero charts
- **Root Cause**: Missing data validation layer

### 4. Inconsistent Type Definitions
- **Issue**: `CitiBikeTripRaw` type had incorrect field mappings with quadruple quotes
- **Impact**: Type safety was compromised; field names didn't match actual data
- **Root Cause**: Manual guesswork instead of runtime normalization

## Solutions Implemented

### 1. Created Robust CSV Parser (`src/utils/csvParser.ts`)

**Features:**
- `normalizeHeader()` function that handles:
  - Triple-quoted headers: `"""field"""` → `field`
  - Double-quoted headers: `""field""` → `field`
  - Single-quoted headers: `"field"` → `field`
  - BOM characters: `\uFEFF`
  - Carriage returns: `\r` at end of field names
- `parseTableauCSV()` for parsing with automatic header normalization
- `validateFields()` to check required fields exist
- `detectHeaderRow()` to skip preamble rows
- `loadTableauCSV()` as the main entry point with full preprocessing

**Example normalization:**
```typescript
"""F1"""          → F1
""tripduration""  → tripduration
"gender"\r        → gender
```

### 2. Updated Data Service (`src/services/dataService.ts`)

**Changes:**
- Removed dependency on `CitiBikeTripRaw` type
- Added proper number and date parsing with validation
- Implemented field validation before parsing
- Added filtering for invalid records (bad dates, out-of-range years)
- Added console logging for debugging (shows rows loaded, invalid records filtered)

**Key improvements:**
```typescript
// Parse numbers with validation
const parseNumber = (value: string, fieldName: string): number => {
  const num = Number(value);
  if (isNaN(num)) {
    console.warn(`Invalid numeric value for ${fieldName}: "${value}", using 0`);
    return 0;
  }
  return num;
};

// Parse dates with validation
const parseDate = (value: string, fieldName: string): Date => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date value for ${fieldName}: "${value}", using epoch`);
    return new Date(0);
  }
  return date;
};
```

### 3. Fixed Type Definitions (`src/types/index.ts`)

**Changes:**
- Removed `CitiBikeTripRaw` interface (no longer needed)
- Updated comments to reflect that CSV fields are normalized by parser

### 4. Created Validation Tools

**Scripts created:**

1. **`scripts/test-csv-parser.cjs`**
   - Tests CSV parsing with actual data
   - Shows original vs normalized headers
   - Samples first data row

2. **`scripts/validate-tableau-source.cjs`**
   - Comprehensive validation script
   - Checks:
     - CSV file exists
     - Headers parse correctly
     - Required fields present
     - Data rows exist
     - Date fields valid (not Jan 1970)
     - Numeric fields valid (not NaN)
     - Data variety exists (multiple years)
   - Returns proper exit codes for CI/CD

## Validation Results

### Before Fixes
- Headers: `"""F1""","""tripduration""","""starttime""",...`
- Field lookup: `d['"tripduration"']` → Would fail
- Data validation: None
- Would silently produce empty charts or NaN values

### After Fixes
- Headers normalized: `F1, tripduration, starttime, stoptime, ...`
- Field lookup: `d['tripduration']` → Works correctly
- Data validation: Comprehensive
- 798,259 valid trip records loaded
- Years: 2019, 2020 (data variety confirmed)
- All validator checks pass

## Test Results

```
=== Deterministic Tableau Source Validator ===

✓ CSV file found
✓ Found 16 columns
✓ Headers normalized successfully
✓ All required fields present
✓ Found 798259 data rows
✓ No invalid dates found in sample
✓ Dates are not defaulting to Jan 1970
✓ Numeric fields are valid
✓ Data contains 2 different years: 2019, 2020

Validation PASSED - All checks successful
```

## Build Status

```
✓ built in 1.82s
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-DVz4MpWU.css    3.81 kB │ gzip:  1.16 kB
dist/assets/index-C1YGfPt0.js   284.49 kB │ gzip: 92.85 kB
```

## Impact

### Deterministic Guarantees
1. ✓ Headers are normalized consistently regardless of quote patterns
2. ✓ Required Tableau fields are validated before processing
3. ✓ Invalid records are filtered out with warnings
4. ✓ No silent bad parses that lead to all-zero charts
5. ✓ Date fields are validated (no Jan 1970 default dates)
6. ✓ Numeric fields are validated (no NaN values)

### Contract Compliance
- ✓ Runtime data source: `/data/TableauTemp_1f56vnx1u34eds13ml2di1i0hdr8.csv`
- ✓ Full dataset loaded via `fetch('/data/...')`
- ✓ No synthesized data from sample rows
- ✓ No CSV/JSON files under `src/data` or `src/mocks`
- ✓ Chart metrics computed from real data at runtime

## Files Modified

1. `src/utils/csvParser.ts` - Created (new robust CSV parser)
2. `src/services/dataService.ts` - Updated (uses new parser, adds validation)
3. `src/types/index.ts` - Updated (removed raw type, added documentation)
4. `scripts/test-csv-parser.cjs` - Created (CSV parsing test)
5. `scripts/validate-tableau-source.cjs` - Created (comprehensive validator)

## Next Steps

The deterministic Tableau source validator is now available as:
```bash
node scripts/validate-tableau-source.cjs
```

This can be integrated into CI/CD pipelines to ensure data quality before build/deploy.

## Tableau Spec Compliance Checklist

### Worksheets Implemented
- ✓ **Sheet 13**: "Total Recorded Trips" (line chart)
  - rows_field: `[usr:Calculation_1279303814258806785:qk]` → resolved to `stoptime` year aggregation
  - cols_field: `[yr:stoptime:ok]` → resolved to year column
  - series_field: `[usr:Calculation_1279303814258806785:qk]` → count aggregation
  - legend: required, right-anchored
  - title: "Total Recorded Trips"

- ✓ **Sheet 13 (2)**: "Total Recorded Trips - First Quarter" (line chart)
  - rows_field: `[usr:Calculation_1279303814258806785:qk]` → resolved to `stoptime` year aggregation
  - cols_field: `[yr:stoptime:ok]` → resolved to year column
  - slices: `[mn:stoptime:ok]` → filtered to months 1-4
  - filter_members: ["1", "2", "3", "4"]
  - title: "Total Recorded Trips - First Quarter"

- ✓ **Sheet 13 (3)**: "Percent Ridership Growth" (line chart)
  - rows_field: `[pcdf:usr:Calculation_1279303814258806785:qk]` → percent difference calculation
  - cols_field: `[yr:stoptime:ok]` → resolved to year column
  - table_calc: PctDiff over year
  - title: "Percent Ridership Growth"

- ✓ **Sheet 13 (4)**: "Percent Ridership Growth - First Quarter" (line chart)
  - rows_field: `[pcdf:usr:Calculation_1279303814258806785:qk]` → percent difference calculation
  - cols_field: `[yr:stoptime:ok]` → resolved to year column
  - slices: `[mn:stoptime:ok]` → filtered to months 1-4
  - filter_members: ["1", "2", "3", "4"]
  - table_calc: PctDiff over year
  - title: "Percent Ridership Growth - First Quarter"

### Dashboard Layout
- ✓ Dashboard 3: 2x2 grid layout
  - Top-left: Sheet 13
  - Top-right: Sheet 13 (3)
  - Bottom-left: Sheet 13 (2)
  - Bottom-right: Sheet 13 (4)
  - Right sidebar: Legend for Sheet 13

### Interactions
- ✓ `dashboard_actions`: 2 actions defined
- ✓ `highlight_bindings`: 4 worksheets with highlight on month/year fields
- ✓ Auto-clear behavior implemented

### Data Quality
- ✓ No all-zero charts
- ✓ No NaN filters
- ✓ No Jan 1970 timelines (except filtered invalid records)
- ✓ Real field resolution from CSV columns

---

**Status**: ✅ COMPLETE - All Tableau source ingestion issues resolved
**Build**: ✅ PASSING - Compiles without errors
**Validator**: ✅ PASSING - All data quality checks successful
