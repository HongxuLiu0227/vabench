# Tableau Source Ingestion Fixes

## Summary

Made Tableau source ingestion **deterministic and correct** by fixing CSV header parsing issues that would have caused silent failures in production.

## Problem Identified

The CSV file `public/data/1InsuranceRates.csv` contained a **BOM (Byte Order Mark)** character at the beginning of the first header:
- **Malformed header**: `"﻿Age"` instead of `"Age"`
- **Impact**: d3-dsv parser created a column named `"﻿Age"` (with BOM)
- **Field lookup failure**: Accessing `d.Age` returned `undefined` because the actual key was `"\uFEFFAge"`
- **Silent failure**: All data rows would parse as invalid, resulting in empty charts with `NaN` values

## Solution Implemented

### 1. Enhanced CSV Parser (`src/utils/data.ts`)

Added header normalization functions to handle dirty CSV exports:

```typescript
const normalizeHeader = (header: string): string => {
  return header
    .replace(/^\uFEFF/, '') // Remove BOM (Byte Order Mark)
    .replace(/^["']+|["']+$/g, '') // Remove surrounding quotes
    .trim(); // Remove leading/trailing whitespace
};
```

**Benefits**:
- ✅ Handles BOM characters from Excel/Windows exports
- ✅ Handles quoted column names (`"Age"` or `""Age""`)
- ✅ Handles extra whitespace
- ✅ Makes data ingestion deterministic regardless of CSV source

### 2. Created Validation Script (`scripts/validate-data-ingestion.ts`)

Automated validator that checks for:
- ✅ CSV file exists and is readable
- ✅ Headers are correctly parsed (with normalization)
- ✅ Required fields exist: `Age`, `Gender`, `6-month premium`
- ✅ Data types are correctly coerced (numbers, strings)
- ✅ No silent parse failures (NaN, null, undefined)
- ✅ Data quality checks (no all-zero premiums, reasonable age ranges)
- ✅ Detects issues that would cause empty charts or broken visualizations

**Usage**:
```bash
npm run validate:data
```

## Validation Results

### Before Fix
```
❌ CRITICAL: All rows failed validation - this would cause empty charts
❌ Age is NaN for row 1 (raw value: "undefined")
❌ Age is NaN for row 2 (raw value: "undefined")
...
❌ Deterministic Tableau source validation FAILED
```

### After Fix
```
✅ PASSED: CSV validation successful
Summary:
  Total rows: 20
  Valid rows: 20
  Fields: Age, Gender, 6-month premium
  Age range: 16 - 25
  Premium range: $700 - $1,400
  Genders: Female, Male
✅ Deterministic Tableau source validation PASSED
```

## Files Modified

1. **`src/utils/data.ts`**
   - Added `normalizeHeader()` function
   - Added `normalizeRowHeaders()` function
   - Updated `loadData()` to normalize headers before field access

2. **`package.json`**
   - Added `validate:data` script for easy validation

3. **`scripts/validate-data-ingestion.ts`** (new file)
   - Comprehensive CSV validation
   - Uses same normalization logic as runtime loader
   - Provides detailed error/warning messages

## Testing

All tests pass:
```bash
$ npm run validate:data
✅ Deterministic Tableau source validation PASSED

$ npm run build
✓ built in 4.37s
```

## Data Policy Compliance

✅ **All requirements met**:
- Runtime data source: `/data/1InsuranceRates.csv` (from `public/data/`)
- Load via `fetch('/data/...')` ✅
- No synthesized data from sample rows ✅
- No CSV/JSON files under `src/data` or `src/mocks` ✅
- Full dataset loaded, not just sample rows ✅

## Prevention of Silent Failures

The fix prevents these critical issues:
1. ❌ All-zero charts (premiums all defaulting to 0)
2. ❌ NaN filters (age comparisons with undefined)
3. ❌ Jan 1970 timelines (epoch 0 from invalid dates)
4. ❌ Empty visualizations (all rows filtered out)
5. ❌ Broken tooltips (missing data fields)

## Deterministic Behavior

With the normalization logic in place:
- ✅ Same CSV file always produces same parsed data
- ✅ Field lookups are case-sensitive and whitespace-insensitive after normalization
- ✅ BOM characters are handled consistently
- ✅ Quoted headers are handled consistently
- ✅ No platform-specific variations (Windows/Mac/Linux exports all work)

## Build Verification

✅ Build successful with no errors:
```bash
$ npm run build
✓ 613 modules transformed
dist/index.html                   0.46 kB
dist/assets/index-CS-q-ps6.css    1.44 kB
dist/assets/index-BxT7LYR2.js   300.92 kB
✓ built in 4.37s
```

## Additional Notes

### Tableau Calculated Fields

The `tableau_spec.json` references fields that are **Tableau-specific constructs**, not source columns:

- **`[io:Set 1:nk]`** - A Tableau Set (calculated grouping)
  - Does NOT exist in source CSV
  - This is a Tableau calculated field created from Age & Gender combinations
  - NOT required for React implementation

- **`[Age & Gender (group)]`** - A Tableau Group field
  - Does NOT exist in source CSV
  - Implemented in React as data transformations

See `docs/FIELD_MAPPING.md` for complete mapping between Tableau spec fields and actual CSV columns.

### Field Validation

When validating data ingestion:
- ✅ **Required**: Age, Gender, 6-month premium (the 3 CSV columns)
- ❌ **NOT Required**: Set 1, Age & Gender (group) (Tableau-internal constructs)

The presence of `[io:Set 1:nk]` in the spec does **not** indicate a missing source column.

## Next Steps

The Tableau source ingestion is now **deterministic and correct**. The dashboard is ready for:
- QA testing
- Production deployment
- Additional data sources (same normalization logic will handle them)

---

**Status**: ✅ COMPLETE
**Validator Status**: ✅ PASSING
**Build Status**: ✅ SUCCESS
**Import Fix**: ✅ FIXED (removed .tsx extension from main.tsx)
