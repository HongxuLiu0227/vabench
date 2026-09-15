# Tableau Data Source Validation Summary

**Date:** 2026-03-21
**Status:** ✓ PASSED

## Overview

All 12 Citi Bike trip data CSV files have been validated and are loading correctly. The data ingestion is now deterministic and handles multiple header formats.

## Data Files Validated

| File | Total Rows | Valid Rows | Invalid Coords (0,0) |
|------|-----------|------------|---------------------|
| JC-201701-citibike-tripdata.csv | 12,926 | 12,926 | 0 |
| JC-201702-citibike-tripdata.csv | 14,026 | 14,026 | 0 |
| JC-201703-citibike-tripdata.csv | 12,201 | 12,200 | 1 |
| JC-201704-citibike-tripdata.csv | 21,186 | 21,186 | 0 |
| JC-201705-citibike-tripdata.csv | 25,966 | 25,966 | 0 |
| JC-201706-citibike-tripdata.csv | 32,060 | 32,060 | 0 |
| JC-201707-citibike-tripdata.csv | 33,573 | 33,573 | 0 |
| JC-201708 citibike-tripdata.csv | 35,472 | 35,336 | 136 |
| JC-201709-citibike-tripdata.csv | 33,119 | 32,510 | 609 |
| JC-201710-citibike-tripdata.csv | 34,919 | 34,880 | 39 |
| JC-201711-citibike-tripdata.csv | 23,582 | 23,582 | 0 |
| JC-201712-citibike-tripdata.csv | 15,898 | 15,898 | 0 |
| **TOTAL** | **294,928** | **294,843** | **785 (0.27%)** |

## Header Format Variations Handled

The data loader now correctly handles **TWO different CSV header formats**:

### Format 1: Title Case (Jan-Mar 2017)
```
Trip Duration,Start Time,Stop Time,Start Station ID,Start Station Name,...
```

### Format 2: Lowercase (Apr-Dec 2017)
```
"tripduration","starttime","stoptime","start station id","start station name",...
```

## Required Tableau Fields

All required fields for the Tableau render contract are present and validated:

- ✓ `end station name` → Used in all 3 worksheets
- ✓ `end station latitude` → Used in End Station Map
- ✓ `end station longitude` → Used in End Station Map
- ✓ `start station name` → Used in interactions/filters

## Data Quality Improvements

### 1. Header Normalization
- Converts both Title Case and lowercase headers to normalized field names
- Handles both single-word ("bikeid") and two-word ("bike id") formats
- Uses `d3-dsv` for robust CSV parsing

### 2. NULL Value Handling
- Properly handles `NULL`, `null`, and empty string values
- Prevents NaN values from appearing in charts
- Filters out records with invalid coordinates (0.0, 0.0) as per Tableau spec

### 3. Date Validation
- Validates date strings before creating Date objects
- Filters out records with invalid dates that would show as "Jan 1970"

### 4. Preamble Row Detection
- Automatically detects and skips preamble rows if present
- Looks for known field patterns to identify the real header

### 5. Error Logging
- Logs skipped rows for debugging (first 5 per file)
- Provides detailed validation metrics
- Shows which fields were parsed from each file

## Validation Results

- ✓ All 12 files load successfully
- ✓ All required Tableau fields are present
- ✓ Invalid coordinates are filtered out (785 rows, 0.27%)
- ✓ No silent parse failures
- ✓ Data is deterministic and reproducible

## Build Status

```bash
✓ TypeScript compilation: PASSED
✓ Vite build: PASSED
✓ Bundle size: 280.33 KB (gzipped: 91.75 KB)
```

## Files Modified

1. **src/services/dataLoader.ts**
   - Enhanced header normalization to handle both Title Case and lowercase formats
   - Added NULL value parsing
   - Added date validation
   - Added preamble row detection
   - Improved error logging and data quality metrics
   - Added required Tableau field validation

2. **scripts/validate-data-loading.cjs** (NEW)
   - Standalone validation script
   - Can be run independently: `node scripts/validate-data-loading.cjs`
   - Validates all 12 CSV files
   - Reports data quality metrics

## Next Steps for QA/Build Stages

The data ingestion is now deterministic and correct. The following issues have been resolved:

1. ✅ CSV headers with different formats (Title Case vs lowercase)
2. ✅ Quoted vs unquoted headers
3. ✅ NULL values in numeric fields
4. ✅ Invalid coordinates (0.0, 0.0)
5. ✅ Invalid date strings
6. ✅ Two-word field names (e.g., "Bike ID", "User Type")
7. ✅ Missing required fields detection

The application is ready for QA testing and build stages.
