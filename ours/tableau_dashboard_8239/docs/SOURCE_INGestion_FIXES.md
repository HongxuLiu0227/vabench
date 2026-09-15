# Tableau Source Ingestion Fixes

## Summary

Fixed deterministic and correct Tableau source data ingestion to prevent silent parse failures that could lead to all-zero charts, NaN filters, or Jan 1970 timelines.

## Issues Identified

### 1. CSV Header Normalization Issues
**Problem**: The CSV file had inconsistent quoting patterns:
- Headers with quadruple quotes: `""""Row ID""""`
- BOM (Byte Order Mark) character at file start
- Carriage return (`\r`) on the last header field
- Mixed quote handling by d3-dsv parser

**Impact**: Without proper normalization, field lookups like `row['Row ID']` would fail because the actual keys were `﻿"""Row ID"""` or `"Row ID"`.

### 2. Silent Parse Failures
**Problem**: No validation to detect parsing failures.
- Could result in all-zero metric values
- No warnings for NaN or invalid dates
- No field accessibility checks

**Impact**: Charts would render but show incorrect/empty data.

## Solutions Implemented

### 1. Header Normalization (`src/services/dataService.ts`)

Added robust header normalization that:
- Removes BOM character (`\uFEFF`)
- Strips line endings (`\r`, `\n`, `\r\n`)
- Removes ALL surrounding quote layers (handles 1-4+ quotes)
- Trims whitespace

```typescript
function normalizeHeader(header: string): string {
  // Remove BOM if present (UTF-8 BOM is \uFEFF)
  let cleaned = header.replace(/^\uFEFF/, '');

  // Remove line endings (handle both \r\n and \r or \n)
  cleaned = cleaned.replace(/\r\n?|\n/g, '');

  // Remove ALL leading quotes
  while (cleaned.startsWith('"')) {
    cleaned = cleaned.slice(1);
  }

  // Remove ALL trailing quotes
  while (cleaned.endsWith('"')) {
    cleaned = cleaned.slice(0, -1);
  }

  return cleaned.trim();
}
```

### 2. Deterministic Field Mapping

Created a header mapping system that:
- Maps raw CSV headers to normalized versions
- Enables field lookup via normalized names
- Handles multiple quote patterns consistently

```typescript
function createHeaderMapping(rawHeaders: string[]): Map<string, string> {
  const mapping = new Map<string, string>();
  rawHeaders.forEach(raw => {
    const normalized = normalizeHeader(raw);
    mapping.set(raw, normalized);
    mapping.set(normalized, normalized);
  });
  return mapping;
}
```

### 3. Data Validation (`src/services/dataService.ts`)

Added validation in `loadSuperstoreData()` to catch parse failures:
- Checks for empty CSV files
- Validates parsed data is not empty
- Detects all-zero rows (sign of numeric parse failure)
- Logs sample data for debugging
- Provides warnings for suspicious patterns

```typescript
// Validate parsed data
if (!parsedData || parsedData.length === 0) {
  throw new Error('Failed to parse CSV: no data rows found');
}

// Check for silent failures (all-zero rows)
const hasValidData = sampleRow &&
                    sampleRow['Sales'] !== 0 ||
                    sampleRow['Profit'] !== 0 ||
                    sampleRow['Quantity'] !== 0;

if (!hasValidData && parsedData.length > 1) {
  const allZero = parsedData.every(row =>
    row['Sales'] === 0 && row['Profit'] === 0 && row['Quantity'] === 0
  );
  if (allZero) {
    console.warn('Warning: All parsed rows have zero values - possible parsing issue');
  }
}
```

### 4. Deterministic Source Validator (`scripts/validate-tableau-source.cjs`)

Created a comprehensive validator script that checks:
- ✓ CSV file exists and is readable
- ✓ BOM and quote handling
- ✓ All 21 expected fields are accessible
- ✓ No all-zero rows (silent parse failure detection)
- ✓ No null critical values
- ✓ Numeric conversion works correctly
- ✓ Date parsing works (no Jan 1970)
- ✓ Render contract is valid

**Usage**:
```bash
npm run validate:tableau-source
```

## Verification

All validations pass:
```
✓ Successfully parsed 9994 rows
✓ All 21 expected fields found
✓ No all-zero rows in first 100 rows
✓ No null critical values
✓ Numeric conversion works correctly
✓ Date parsing works correctly (no Jan 1970)
✓ Render contract has 10 worksheets
```

## Build Status

✅ Build succeeds without errors
✅ No TypeScript type errors
✅ Bundle size: ~311 KB (gzipped: ~100 KB)

## Data Files Status

✅ No data files in `src/data` or `src/mocks` (per Tableau Data Policy)
✅ All data is in `public/data/` directory
✅ Runtime loads data via `fetch('/data/...')`

## Field Mapping Verification

All required Tableau fields from the render contract resolve correctly:

| Field Name | Accessible | Sample Value |
|------------|------------|--------------|
| Row ID | ✓ | 1 |
| Order ID | ✓ | CA-2016-152156 |
| Order Date | ✓ | 2016-11-08 |
| Ship Date | ✓ | 2016-11-11 |
| Ship Mode | ✓ | Second Class |
| Customer ID | ✓ | CG-12520 |
| Customer Name | ✓ | Claire Gute |
| Segment | ✓ | Consumer |
| Country | ✓ | United States |
| City | ✓ | Henderson |
| State | ✓ | Kentucky |
| Postal Code | ✓ | 42420 |
| Region | ✓ | South |
| Product ID | ✓ | FUR-BO-10001798 |
| Category | ✓ | Furniture |
| Sub-Category | ✓ | Bookcases |
| Product Name | ✓ | Bush Somerset Collection Bookcase |
| Sales | ✓ | 261.96 |
| Quantity | ✓ | 2 |
| Discount | ✓ | 0.0 |
| Profit | ✓ | 41.9136 |

## Next Steps

The source ingestion is now deterministic and correct. The application is ready for:
- QA testing
- Build stage validation
- Production deployment

No further data quality issues detected. The CSV file is preserved as-is (no modifications), with all normalization handled in code.
