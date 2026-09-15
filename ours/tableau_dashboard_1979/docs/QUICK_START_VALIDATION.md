# Quick Start: Tableau Source Validation

## Run All Validations

```bash
# Validate CSV structure and data quality
npx tsx scripts/validate-tableau-source.ts

# Run deterministic parsing tests
npx tsx scripts/test-deterministic-parsing.ts
```

## Expected Results

Both scripts should show:
- ✅ All checks passed
- ✅ No data quality issues
- ✅ Tableau contract compliance verified

## Key Files Modified

1. **src/services/dataLoader.ts**
   - Fixed CSV parsing with d3-dsv
   - Added header normalization
   - Added row validation
   - Added Tableau field mapping validation

2. **scripts/validate-tableau-source.ts** (NEW)
   - Standalone validation script
   - Checks CSV structure and data quality

3. **scripts/test-deterministic-parsing.ts** (NEW)
   - Comprehensive test suite
   - 10 tests covering all parsing aspects

4. **docs/TABLEAU_SOURCE_VALIDATION_REPORT.md** (NEW)
   - Complete validation report
   - Data quality metrics
   - Known issues and recommendations

## Data Quality Summary

- **Total Rows**: 7,521
- **Non-Zero Values**: 7,216 (96%)
- **Years**: 2014, 2017 (⚠️ Missing 2015, 2016)
- **Locations**: 14 Canadian provinces/territories
- **Indicators**: 10 (including required "Total demand")

## Troubleshooting

### If tests fail:
1. Check CSV file exists at `public/data/df.csv`
2. Verify CSV structure: `,Year,Location,Indicators,Products,UOM,Scalar Factor,Value`
3. Check console for specific error messages
4. Review logs in browser DevTools

### Common Issues:
- **Import errors**: Ensure d3-dsv is installed
- **Type errors**: Check TypeScript types in `src/types/data.ts`
- **Data not loading**: Check browser console for fetch errors

## Next Steps

✅ All validation checks passed
✅ Ready for QA/build stages
✅ Deterministic parsing confirmed

See [TABLEAU_SOURCE_VALIDATION_REPORT.md](./TABLEAU_SOURCE_VALIDATION_REPORT.md) for detailed analysis.
