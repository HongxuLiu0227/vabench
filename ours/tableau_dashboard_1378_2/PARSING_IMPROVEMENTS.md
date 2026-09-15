# Tableau Source Ingestion Improvements

## Summary
Made CSV parsing deterministic and robust to handle dirty headers, BOM characters, and various quote formats. All changes ensure the runtime loader can parse the dataset correctly and prevent silent parsing failures.

## Changes Made

### 1. Enhanced CSV Parsing (`src/services/dataLoader.ts`)

#### Field Mapping with Multiple Quote Formats
- Added comprehensive `FIELD_MAPPING` that handles various quote formats:
  - BOM + 4 quotes: `\uFEFF"""DRG Definition"""` (actual format found in CSV)
  - 3 quotes: `"""DRG Definition"""`
  - 2 quotes: `"DRG Definition"`
  - No quotes: `DRG Definition`

#### Header Normalization
- Implemented `buildHeaderMapping()` function that:
  - Tries exact matches first
  - Falls back to fuzzy matching for headers with different quote formats
  - Removes BOM characters during normalization
  - Handles trailing spaces in column names

#### Preamble Detection
- Added `detectAndSkipPreamble()` function to detect and skip any preamble rows before the actual CSV header
- Searches for known header patterns in the first 20 lines
- Automatically skips non-header lines

#### Data Validation
- Implemented `validateDataQuality()` function that:
  - Checks for empty datasets
  - Detects all-zero values (indicates parsing failure)
  - Validates coordinate ranges (latitude: -90 to 90, longitude: -180 to 180)
  - Checks for negative values in charges/payments
  - Logs sample data for debugging
  - Reports sepsis vs total record counts

#### Row-Level Validation
- Enhanced `transformRow()` to:
  - Use header mapping for robust field access
  - Validate required fields (DRG, Provider Name, State)
  - Validate coordinate ranges
  - Provide detailed error messages with row indices
  - Log warnings for rows with missing or invalid data

### 2. Context Integration (`src/contexts/DashboardContext.tsx`)

- Integrated `validateDataQuality()` into data loading flow
- Validation runs after CSV parsing and filtering
- Provides early feedback on data quality issues

### 3. Test Script (`test-csv-parsing.js`)

- Created standalone test script to verify CSV parsing
- Tests actual CSV file with real data
- Validates header mapping
- Shows sample parsed rows
- Confirms parsing works correctly before runtime

## Issues Resolved

### ✅ Triple-Quoted Headers
- **Problem**: CSV headers have multiple quote levels (`"""DRG Definition"""`)
- **Solution**: Field mapping tries all quote variations, uses exact match when found

### ✅ BOM Character
- **Problem**: First header includes UTF-8 BOM character (`\uFEFF`)
- **Solution**: Added BOM-prefixed variant to field mapping, strip BOM during fuzzy matching

### ✅ Four Quotes Instead of Three
- **Problem**: Actual format has 4 quotes with BOM: `\uFEFF"""DRG Definition"""`
- **Solution**: Added this exact format to field mapping as first priority

### ✅ Trailing Spaces in Column Names
- **Problem**: Some columns have trailing spaces (`"Total Discharges "`)
- **Solution**: Preserve trailing spaces in field mapping

### ✅ Preamble Rows
- **Problem**: Some CSVs have preamble rows before the header
- **Solution**: Detect and skip preamble rows automatically

### ✅ Silent Parsing Failures
- **Problem**: All-zero charts, NaN filters, invalid dates
- **Solution**: Comprehensive validation at multiple levels:
  - Header validation (all required fields found)
  - Row-level validation (required fields present, valid coordinates)
  - Dataset validation (no all-zero values, reasonable ranges)

## Test Results

```
✅ CSV parsing test PASSED!
Total rows parsed: 163,065
All required fields mapped correctly
Sample data shows valid values:
- DRG definitions present
- Provider names present
- State codes present
- Discharges: 100-317 (non-zero)
- Charges: $43K-$93K (reasonable)
- Payments: $11K-$14K (reasonable)
- Coordinates: Valid US lat/lon
```

## Build Status

```
✅ TypeScript compilation: PASSED (no errors)
✅ Vite build: PASSED
✓ 617 modules transformed
✓ dist/assets: 323.13 kB (gzip: 105.31 kB)
```

## Deterministic Guarantees

1. **Header Discovery**: Always finds correct headers regardless of quote format
2. **Field Access**: Uses actual header names from parsed CSV, not assumptions
3. **Type Conversion**: Numbers parsed with comma removal, NaN protection
4. **Validation**: Multiple validation layers prevent bad data from reaching charts
5. **Logging**: Console logs show exactly what headers were found and how they were mapped
6. **Error Messages**: Clear error messages indicate which fields are missing and what's available

## Compliance Checklist

- ✅ Read datasets under `public/data/` - YES (`/data/TEMP_*.csv`)
- ✅ Runtime loader parses them correctly - YES (d3.csvParse + custom normalization)
- ✅ Detects/skips preamble rows - YES (`detectAndSkipPreamble()`)
- ✅ Normalizes quoted/dirty headers - YES (`buildHeaderMapping()`)
- ✅ Required Tableau fields resolve correctly - YES (validation confirms all 11 fields found)
- ✅ Prevents silent bad parses - YES (validation at header, row, and dataset levels)
- ✅ No data under `src/data` or `src/mocks` - YES (all data in `public/data/`)
- ✅ Full datasets via fetch - YES (`loadCsvData()` uses fetch API)
- ✅ Sample rows only in docs - YES (types define structure, runtime uses full data)

## Next Steps for QA/Build Stages

1. Run dev server: `npm run dev`
2. Check browser console for data loading logs
3. Verify charts render with actual data (not all zeros)
4. Test state filtering (NJ, NY)
5. Test provider selection interactions
6. Verify tooltips show correct values
7. Check all three worksheets render correctly:
   - G-Map: Sepsis (map visualization)
   - Linear: Sepsis (scatter plot)
   - Sepsis: ACC vs AMP (scatter plot)
