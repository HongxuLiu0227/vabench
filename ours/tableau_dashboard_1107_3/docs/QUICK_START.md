# Tableau Data Ingestion - Quick Reference

## Quick Verification

### Check if Data Loads Correctly
```bash
npm run build
```
Expected: `✓ built in X.XXs` (no errors)

### Test CSV Parsing
```bash
node test-csv-parsing.mjs
```
Expected:
- ✓ Loaded 741,749 rows
- ✓ All 16 required trip fields present
- ✓ Field access working

## Common Issues

### Issue: "Missing required fields"
**Cause**: CSV headers don't match expected field names
**Solution**:
1. Check actual CSV headers in browser console or test output
2. Field names are case-insensitive but spelling must match
3. Quotes and whitespace are handled automatically

### Issue: "Invalid Date" in validation
**Cause**: Date format doesn't match expected pattern
**Expected Format**: `YYYY-MM-DD HH:MM:SS.mmmmmm`
**Example**: `2020-12-10 13:50:17.076000`

### Issue: "Field accessor could not find value"
**Cause**: Development warning when field lookup fails
**Solution**: Check field name matches CSV (case-insensitive)

## Key Files

| File | Purpose |
|------|---------|
| `src/services/dataService.ts` | CSV parsing and data loading |
| `src/types/data.ts` | Field mappings and types |
| `src/utils/tableauFieldValidator.ts` | Validation utilities |
| `docs/DATA_INGESTION.md` | Full documentation |

## Field Access Pattern

### ❌ Don't Do This
```typescript
const value = row['"""TripID"""']; // Fragile!
```

### ✅ Do This Instead
```typescript
// Use the pre-created accessor
const value = accessors.tripId(row);

// Or create a new accessor
const accessor = createFieldAccessor('TripID');
const value = accessor(row);
```

## Adding a New Field

1. Add to `accessors` object in `dataService.ts`
2. Add to `ProcessedTripData` interface in `types/data.ts`
3. Use in `processTripData()` function
4. Add to `TABLEAU_FIELD_MAPPING` if needed
5. Add to `requiredFields` in `validateCsvHeaders()` if critical

## Validation Output

### Success (Expected)
```
=== Tableau Data Validation ===

✓ All required CSV fields validated
✓ Successfully loaded 741749 trip records
✓ All Tableau fields validated successfully
  Resolved 16 required fields
✓ Data quality validation passed

✓ All validations passed! Data is ready for visualization.
```

### Failure (Action Required)
```
✗ CSV is missing required fields: tripid, starttime
Available fields: tripduration, stoptime

→ Action: Check CSV file has all required columns
```

## Performance Tips

1. ✅ Field accessors are pre-created (fast)
2. ✅ Validation samples only 1,000 records (fast)
3. ✅ Data loaded once and cached in React state
4. ⚠️ For >1M rows, consider streaming or web workers

## Debug Mode

Validation runs automatically in development mode. Check browser console for detailed output.

## Getting Help

1. Check `docs/DATA_INGESTION.md` for detailed documentation
2. Run `test-csv-parsing.mjs` to verify CSV files
3. Check browser console for validation messages
4. Review error messages for actionable guidance

## Success Criteria

- ✅ Build succeeds without errors
- ✅ CSV files load successfully
- ✅ All required fields present
- ✅ No validation errors in console
- ✅ Charts render with actual data (not all zeros)

## Maintenance

- Keep field accessors in sync with CSV columns
- Update documentation when adding fields
- Run tests after changes to dataService
- Monitor console for validation warnings

---

**Last Updated**: 2026-03-23
**Status**: ✅ Production Ready
