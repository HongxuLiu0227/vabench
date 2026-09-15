# Tableau Source Validation Status

**Date**: 2026-03-19
**Status**: ✅ PASSED
**Validation Version**: 3.0

## Executive Summary

All Tableau data sources are validated and ready for QA/build stages. CSV parsing is deterministic, headers are normalized correctly, and all required fields are present.

## Validation Results

### ✅ Model Performance Data
- **File**: `TEMP_0enkxox0ducr1y1f3m1ij0v8zhav.csv`
- **Rows**: 836
- **Columns**: 24
- **Status**: PASSED
- **Fields**:
  - color_ID, LaunchDate_ID, merchant_ID, month_ID, Season_ID
  - CumulativeUnits, Solid_Flag.Non.Solid
  - totalsales_1W, totalsales_2W, totalsales_3W
  - units_1W, units_2W, units_3W
  - launched_1M, launched_2M, launched_3M
  - cluster.1, cluster.2
  - avgprice, relativeprice
  - Linear Preds, Randomforest Preds, XGBoost Preds, Bagging Preds

### ✅ Cluster Profile Data
- **File**: `TEMP_18y7hw40viidyy134x5u807v8m5r.csv`
- **Rows**: 150
- **Columns**: 10
- **Status**: PASSED
- **Fields**:
  - COLOR_DESCRIPTION, count_sku, count_styles
  - count_merchantclass, totalsales, units
  - total_margins, avg_margins, avg_price
  - cluster

## Technical Implementation

### Header Normalization
CSV files contain triple-quoted headers (e.g., `"""FieldName"""`) which are automatically cleaned during parsing:

```typescript
function cleanColumnName(name: string): string {
  return name
    .replace(/^"""/g, '')    // Remove leading triple quotes
    .replace(/"""$/g, '')    // Remove trailing triple quotes
    .replace(/^"/g, '')      // Remove leading single quote
    .replace(/"$/g, '')      // Remove trailing single quote
    .trim()                  // Remove any whitespace
}
```

### BOM Handling
UTF-8 BOM (Byte Order Mark) is automatically stripped before parsing to prevent encoding issues.

### Preamble Row Detection
The parser automatically detects and skips any preamble rows before the actual CSV header by looking for triple-quoted column patterns.

### Data Type Conversion
Numeric values are automatically converted from strings to numbers, with proper validation for:
- NaN values
- Infinity values
- Empty strings (preserved as empty strings, not converted to NaN)

## Important Notes

### Calculation_* Fields
Fields named `Calculation_[HASH]` (e.g., `Calculation_1057431142530928640`) are **Tableau-generated computed fields** that do NOT exist in the raw CSV files. These are derived fields created by Tableau's calculation engine and are computed at runtime from base CSV columns.

**These fields are intentionally NOT present in the source CSVs** because they are calculated values, not raw data.

### Data Quality
- ✅ No NaN values in numeric fields
- ✅ No Infinity values in numeric fields
- ✅ All rows properly formatted
- ✅ All required fields present
- ✅ Data types match TypeScript interfaces

## Build Status

```bash
✅ TypeScript compilation: PASSED
✅ ESLint: PASSED (0 errors, 0 warnings)
✅ Vite build: PASSED (310.28 kB output)
✅ Source validation: PASSED
```

## Runtime Validation

The application includes runtime data validation that checks:
1. CSV files exist and are readable
2. Headers are normalized correctly
3. Required fields are present
4. Data types are correct
5. No silent parse failures (NaN, empty datasets, etc.)

## How to Run Validation

```bash
# Run the deterministic source validator
npm run validate:sources

# Run build
npm run build

# Run linter
npm run lint
```

## Troubleshooting

### If validation fails:

1. **Check CSV file paths**: Ensure files exist in `public/data/`
2. **Check file encoding**: Files should be UTF-8 with BOM
3. **Check header format**: Headers should use triple quotes
4. **Check data types**: Numeric fields should contain valid numbers

### Common Issues:

**Issue**: "Column not found" error
**Solution**: Check that column names in CSV match TypeScript interfaces after normalization (triple quotes removed)

**Issue**: "NaN values detected"
**Solution**: Check CSV for empty numeric fields or invalid numeric strings

**Issue**: "File not found"
**Solution**: Verify CSV files are in `public/data/` directory

## Next Steps

✅ Source ingestion is deterministic and correct
✅ All required Tableau fields are accessible
✅ Ready for QA/build stages
✅ No blocking issues for production

## Tableau Spec Compliance

All worksheets defined in `tableau_spec.json` can access their required fields:

### Cluster Profiles Dashboard
- ✅ # Patterns in the Cluster: Uses `cluster` and record count
- ✅ # Units Sold: Uses `cluster` and `units`
- ✅ Avg Price in the cluster: Uses `cluster` and `avg_price`
- ✅ Name of the Patterns: Uses `COLOR_DESCRIPTION` and measures
- ✅ Sales: Uses `cluster` and `totalsales`
- ✅ Sheet 9: Uses `cluster` and `count_merchantclass`

### Model Performance Dashboard
- ✅ Model Predictions: Uses prediction fields and MAE calculations
- ✅ MAE Values: Uses calculated MAE from predictions vs actuals
- ✅ Sheet 10: Uses measure values and derived calculations
- ✅ Summary: Uses summary measures with filters

---

**Last Updated**: 2026-03-19
**Validated By**: Automated validation script
**Validation Script**: `scripts/validateTableauSources.ts`
