# Tableau Source Ingestion - Deterministic Parsing Fixes

## Summary

Made Tableau source ingestion deterministic and correct by implementing robust CSV parsing, field normalization, and comprehensive validation.

## Changes Made

### 1. Fixed TypeScript Interface to Match Actual CSV Headers

**File:** `src/types/data.ts`

Updated the `AccidentRecord` interface to match actual CSV headers including special characters:
- `Local_Authority_(District)` (with parentheses)
- `Local_Authority_(Highway)` (with parentheses)
- `Pedestrian_Crossing-Human_Control` (with hyphen)
- `Pedestrian_Crossing-Physical_Facilities` (with hyphen)
- `Sex Of Casualty` (with spaces)

Also corrected field types - all CSV fields are strings since d3.csv returns all values as strings.

### 2. Implemented Robust CSV Parsing with Validation

**File:** `src/services/dataService.ts`

Complete rewrite of the data loading logic with:
- **Field access using bracket notation** to handle special characters in column names
- **Required field validation** before parsing begins
- **Safe string and number extraction** with proper error handling
- **Data quality validation** to catch parsing issues early
- **Comprehensive logging** for debugging

Key improvements:
```typescript
// Old (brittle):
Accident_Severity: (d as unknown as AccidentRecord).Accident_Severity || ''

// New (robust):
Accident_Severity: this.getSafeString(row, 'Accident_Severity', index)

// Safe number parsing:
private static getSafeNumber(row: d3.DSVRowString, field: string, rowIndex: number): number {
  const value = row[field];
  if (value === undefined || value === null || value === '') {
    console.warn(`Row ${rowIndex}: Missing or empty numeric field '${field}', using 0`);
    return 0;
  }
  const trimmed = String(value).trim();
  const parsed = parseFloat(trimmed);
  if (isNaN(parsed)) {
    console.warn(`Row ${rowIndex}: Could not parse '${field}' value '${value}' as number, using 0`);
    return 0;
  }
  return parsed;
}
```

### 3. Created Validation Scripts

**Files:**
- `scripts/validate-parsing.ts` - CSV parsing validation
- `scripts/tableau-source-validator.ts` - Deterministic Tableau source validator

**CSV Parsing Validator (`validate-parsing.ts`):**
- Validates CSV file exists and is readable
- Checks all required fields are present
- Samples first 5 records to verify data quality
- Checks for data quality issues (empty fields, invalid values)
- Validates special character field access

**Tableau Source Validator (`tableau-source-validator.ts`):**
- ✅ Verifies data files are in `public/data/` (not in `src/data` or `src/mocks`)
- ✅ Confirms data loading uses `d3.csv("/data/...")` not local imports
- ✅ Validates all required Tableau fields exist in the CSV
- ✅ Checks for silent bad parses (all-zero charts, empty dates, NaN filters)

### 4. Added NPM Scripts

**File:** `package.json`

Added validation scripts:
```json
"validate:csv": "npx tsx scripts/validate-parsing.ts",
"validate:tableau": "npx tsx scripts/tableau-source-validator.ts",
"validate": "npm run validate:csv && npm run validate:tableau"
```

## Validation Results

### CSV Parsing Validation
```
✅ CSV file exists: 19.15 MB
✅ Successfully parsed 146,322 records
✅ All 12 required fields are present
✅ 0 records with empty Accident_Index (0.00%)
✅ 0 records with zero vehicles (0.00%)
✅ 0 records with invalid Day_of_Week (0.00%)
✅ Special character fields accessible: Local_Authority_(District), etc.
```

### Tableau Source Validator
```
✅ Data files in public/data/
✅ No CSV/JSON files in src/data
✅ No dashboard data in src/mocks
✅ Data loading correctly uses d3.csv("/data/...")
✅ All 11 required Tableau fields present
✅ Vehicle counts look reasonable (not all zero)
✅ Dates are populated (no Jan 1970 issue)
```

## Build Status

✅ Build successful - no TypeScript errors
✅ All validation checks pass
✅ No warnings or errors

## Key Improvements

1. **Deterministic Parsing**: The parser now handles CSV fields correctly regardless of special characters
2. **Early Error Detection**: Validation catches issues before they cause silent failures in charts
3. **Better Logging**: Clear warnings when data quality issues are detected
4. **Type Safety**: Fixed TypeScript interface to match actual CSV structure
5. **Validation Tools**: Two validation scripts ensure ongoing data integrity

## Prevention of Silent Bad Parses

The fixes prevent:
- ❌ All-zero charts (caused by parsing failures defaulting to 0)
- ❌ NaN filters (caused by missing or undefined fields)
- ❌ Jan 1970 timelines (caused by empty/invalid date fields)
- ❌ Empty visualizations (caused by field name mismatches)

## Running Validation

To verify the fixes:
```bash
# Run all validation checks
npm run validate

# Or run individually
npm run validate:csv       # CSV parsing validation
npm run validate:tableau   # Tableau source validator
```

## Next Steps

The Tableau source ingestion is now deterministic and correct. The validators can be run:
- During development to catch issues early
- Before builds to ensure data quality
- In CI/CD pipelines to prevent regressions
