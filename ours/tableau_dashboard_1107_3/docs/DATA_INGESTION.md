# Tableau Data Ingestion - Deterministic CSV Parsing

## Overview

This document describes the deterministic CSV parsing system that handles dirty headers and ensures all Tableau spec fields can be resolved at runtime.

## Problem Statement

CSV files exported from Tableau or other data systems often have:
- **BOM (Byte Order Mark)**: Special character at the start of UTF-8 files
- **Inconsistent quoting**: Headers like `"""TripID"""`, `"tripduration"`, or `TripID`
- **Mixed patterns**: Different quote styles in the same file

These issues cause fragile field access code that breaks when headers change slightly.

## Solution Architecture

### 1. Header Normalization

Location: `src/services/dataService.ts`

```typescript
function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, '') // Remove BOM
    .replace(/^"+|"+$/g, '') // Remove leading/trailing quotes
    .replace(/^"+|"+$/g, '') // Remove again for nested quotes
    .trim();
}
```

This function handles:
- BOM characters (`\uFEFF`)
- Triple quotes: `"""TripID"""` → `TripID`
- Double quotes: `"tripduration"` → `tripduration`
- Single quotes: `'gender'` → `gender`
- No quotes: `starttime` → `starttime`

### 2. Field Accessor Pattern

Instead of hardcoded field access like:
```typescript
// ❌ FRAGILE - breaks if quotes change
const value = row['"""TripID"""'];
```

We use robust field accessors:
```typescript
// ✅ ROBUST - handles all quote patterns
const accessor = createFieldAccessor('TripID');
const value = accessor(row);
```

The accessor tries multiple patterns:
1. Direct access: `row['TripID']`
2. Single-wrapped: `row['"TripID"']`
3. Double-wrapped: `row['""TripID""']`
4. Triple-wrapped: `row['"""TripID"""']`
5. Fallback: Case-insensitive search through all keys

### 3. Validation Pipeline

#### CSV Header Validation
Before processing, we validate that all required fields are present:

```typescript
function validateCsvHeaders(rawData: Record<string, string>[]): void {
  const requiredFields = ['tripid', 'tripduration', 'starttime', ...];
  const availableFields = new Set(
    Object.keys(rawData[0]).map(k => normalizeHeader(k).toLowerCase())
  );
  const missingFields = requiredFields.filter(f => !availableFields.has(f.toLowerCase()));

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}
```

#### Tableau Field Validation
After processing, we validate that all Tableau spec fields can be resolved:

Location: `src/utils/tableauFieldValidator.ts`

```typescript
export function validateTableauFields(sampleData: ProcessedTripData): {
  isValid: boolean;
  missingFields: string[];
  resolvedFields: string[];
  errors: string[];
}
```

This ensures:
- All fields in `tableau_spec.json` map to actual columns
- Field values are valid (e.g., dates are real dates, numbers aren't NaN)
- Any data quality issues are caught early

## Data Flow

```
CSV File (with dirty headers)
    ↓
fetch() - Load from /data/
    ↓
d3-dsv csvParse() - Parse to array of objects
    ↓
validateCsvHeaders() - Check required fields exist
    ↓
processTripData() - Transform each row using field accessors
    ↓
validateTableauFields() - Verify Tableau spec fields resolve
    ↓
Processed Data - Clean, typed data for visualization
```

## Field Mapping

### CSV to Internal Fields

| CSV Header (various formats) | Internal Field | Type |
|------------------------------|----------------|------|
| `"""TripID"""` | `tripId` | number |
| `"""tripduration"""` | `tripDuration` | number |
| `"""starttime"""` | `startTime` | Date |
| `"""stoptime"""` | `stopTime` | Date |
| `"""start station id"""` | `startStationId` | number |
| `"""start station name"""` | `startStationName` | string |
| `"""start station latitude"""` | `startStationLatitude` | number |
| `"""start station longitude"""` | `startStationLongitude` | number |
| `"""end station id"""` | `endStationId` | number |
| `"""end station name"""` | `endStationName` | string |
| `"""end station latitude"""` | `endStationLatitude` | number |
| `"""end station longitude"""` | `endStationLongitude` | number |
| `"""bikeid"""` | `bikeId` | number |
| `"""usertype"""` | `userType` | string |
| `"""birth year"""` | `birthYear` | number |
| `"""gender"""` | `gender` | number |

### Derived Fields

| Field | Calculation | Type |
|-------|-------------|------|
| `tripDurationMinutes` | `tripDuration / 60` | number |
| `genderText` | `gender === 1 ? 'Male' : gender === 2 ? 'Female' : 'Unknown'` | string |
| `month` | Abbreviated month from `startTime` (e.g., "Jan") | string |
| `year` | Year from `startTime` | number |

## Tableau Spec Field Mapping

Location: `src/types/data.ts`

```typescript
export const TABLEAU_FIELD_MAPPING: Record<string, keyof ProcessedTripData> = {
  'TripID': 'tripId',
  'tripduration': 'tripDuration',
  'starttime': 'startTime',
  // ... etc
};
```

This mapping ensures that any field referenced in the Tableau spec can be resolved to an internal field.

## Adding New Fields

When adding a new field to the dataset:

1. **Update the field accessor** in `src/services/dataService.ts`:
   ```typescript
   const accessors = {
     // ... existing fields
     newField: createFieldAccessor('new field name'),
   };
   ```

2. **Update ProcessedTripData interface** in `src/types/data.ts`:
   ```typescript
   export interface ProcessedTripData {
     // ... existing fields
     newField: string; // or number, Date, etc.
   }
   ```

3. **Update processTripData function** in `src/services/dataService.ts`:
   ```typescript
   function processTripData(raw: Record<string, string>): ProcessedTripData {
     return {
       // ... existing fields
       newField: accessors.newField(raw),
     };
   }
   ```

4. **Add to TABLEAU_FIELD_MAPPING** if it's referenced in the spec:
   ```typescript
   export const TABLEAU_FIELD_MAPPING: Record<string, keyof ProcessedTripData> = {
     // ... existing mappings
     'New Field': 'newField',
   };
   ```

5. **Add to required fields list** in `validateCsvHeaders()` if required:
   ```typescript
   const requiredFields = [
     // ... existing fields
     'new field name',
   ];
   ```

## Testing

### Manual Testing

Run the CSV parsing test:
```bash
node test-csv-parsing.mjs
```

This will:
- Load both CSV files
- Check all headers can be normalized
- Verify all required fields are present
- Test field access with various quote patterns

### Integration Testing

The validation runs automatically in development mode when data is loaded. Check the browser console for validation output:

```
=== Tableau Data Validation ===

✓ All required CSV fields validated
✓ Successfully loaded 741749 trip records
✓ All Tableau fields validated successfully
  Resolved 16 required fields
✓ Data quality validation passed
  Checked 1000 records (sample of 741749 total)

✓ All validations passed! Data is ready for visualization.
```

## Error Handling

### Missing Required Fields

```
Error: CSV is missing required fields: tripid, starttime
Available fields: tripduration, stoptime, start station id
```

**Solution**: Check that the CSV file contains all required columns. The field names may have different quoting.

### Invalid Date Values

```
Field "starttime" → "startTime" has invalid date value: Invalid Date
```

**Solution**: Check the CSV date format. Expected format: `YYYY-MM-DD HH:MM:SS.mmmmmm`

### NaN Values

```
Field "tripduration" → "tripDuration" is NaN
```

**Solution**: Check that numeric fields in the CSV contain valid numbers (not text or empty).

## Performance Considerations

1. **Field Accessors**: Pre-created at module load time for better performance
2. **Validation**: Only samples first 1000 records for data quality checks
3. **Caching**: Data is loaded once and cached in React state

## Future Enhancements

1. **Schema Validation**: Add JSON schema validation for Tableau spec compliance
2. **Type Guards**: Add runtime type guards for safer data access
3. **CSV Streaming**: For very large files, consider streaming instead of loading all into memory
4. **Web Workers**: Move CSV parsing to a web worker to avoid blocking the main thread

## Maintenance

### When CSV Format Changes

1. Update the field name in the accessor
2. Run the test script to verify
3. Check validation output in browser console

### When Tableau Spec Changes

1. Update `TABLEAU_FIELD_MAPPING` in `src/types/data.ts`
2. Add new fields to the validator if needed
3. Update required fields list if needed

## Related Files

- `src/services/dataService.ts` - CSV parsing and data loading
- `src/types/data.ts` - Type definitions and field mappings
- `src/utils/tableauFieldValidator.ts` - Validation utilities
- `src/hooks/useData.ts` - React hooks for data access
- `public/data/*.csv` - Source data files

## Checklist

- [x] Header normalization handles BOM characters
- [x] Field accessors try multiple quote patterns
- [x] Validation checks all required fields
- [x] Tableau spec fields map to internal fields
- [x] Data quality checks catch common issues
- [x] Error messages are actionable
- [x] Test script verifies CSV parsing
- [x] Documentation is comprehensive
