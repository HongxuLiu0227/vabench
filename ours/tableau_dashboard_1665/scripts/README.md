# Tableau Data Validation Scripts

This directory contains comprehensive validation scripts for ensuring deterministic and correct Tableau source data ingestion.

## Overview

These scripts validate:
1. **CSV parsing correctness** - No preamble rows, clean headers, proper data types
2. **Data transformation accuracy** - All transformations produce valid output
3. **Tableau spec field mapping** - All spec fields resolve to real CSV columns

## Quick Start

Run all validations:
```bash
npm run validate  # or
npx tsx scripts/runAllValidations.ts
```

Run individual validations:
```bash
npx tsx scripts/validateData.ts
npx tsx scripts/validateTransformations.ts
npx tsx scripts/validateTableauSpec.ts
```

## Validation Scripts

### 1. validateData.ts
Validates CSV file structure and parsing.

**Checks:**
- CSV file exists and is readable
- No preamble rows before header
- Headers are clean (no quoted/dirty headers)
- All expected columns present
- No empty rows
- All numeric fields parse correctly
- Data service parsing logic works correctly

**Output:**
- Parsed row count
- Column listing
- Sample parsed data
- Any errors or warnings

**Example:**
```
=== Validating CSV: /public/data/final_df.csv ===
✓ Parsed 26 rows
Found 18 columns
✓ All checks passed!
```

### 2. validateTransformations.ts
Validates all data transformation functions.

**Checks:**
- transformLineChartData
- transformMeanLineChartData
- transformScatterData
- transformComparisonData
- getSortedArtists

**Output:**
- Record count for each transformation
- Sample data
- Value range validation
- Artist filtering validation

**Example:**
```
=== Validating Data Transformations ===
✓ Transformed to 364 records
✓ Record count is correct (26 artists × 14 age columns)
✓ No NaN values found
```

### 3. validateTableauSpec.ts
Validates Tableau spec field mapping to CSV columns.

**Checks:**
- All spec fields can be normalized
- Normalized fields map to CSV columns
- Critical measure fields present
- Worksheet requirements validated

**Output:**
- Field mapping results
- Unmapped fields (should only be computed fields)
- Worksheet-by-worksheet validation

**Example:**
```
=== Validating Tableau Spec Field Mapping ===
✓ Mapped 32 fields to CSV columns
✓ All critical measure fields present in CSV
✓ All Tableau spec fields can be mapped to CSV columns!
```

### 4. runAllValidations.ts
Runs all validations and provides summary.

**Output:**
- Comprehensive validation report
- Pass/fail status for each validation
- Total duration
- Overall status

**Example:**
```
╔══════════════════════════════════════════════════════════╗
║     Tableau Data Ingestion Validation Suite              ║
╚══════════════════════════════════════════════════════════╝

✓ ALL VALIDATIONS PASSED!
Total Duration: 4331ms
Passed: 3/3
```

## Field Normalization

The validation scripts correctly normalize Tableau field names:

**Raw Tableau Field:**
```
[federated.0c41x7800cm3vo122xn0d15j97ro].[avg:Year Born:qk]
```

**Normalized CSV Column:**
```
Year Born
```

**Normalization Steps:**
1. Remove federated prefix: `[federated.0c41x7800cm3vo122xn0d15j97ro].`
2. Remove aggregation prefix: `avg:`
3. Remove type suffix: `:qk`
4. Remove brackets: `[` and `]`

## Expected Validation Results

All validations should **PASS** with:
- ✅ 26 rows parsed
- ✅ 18 columns
- ✅ 364 line chart records (26 × 14)
- ✅ 52 scatter plot records (26 × 2)
- ✅ 32 fields mapped to CSV
- ✅ 3 special/computed fields (Measure Names, Multiple Values, Action)

## Troubleshooting

### Validation Fails

If any validation fails:

1. **Check CSV file:**
   ```bash
   head -5 public/data/final_df.csv
   ```

2. **Check CSV columns:**
   ```bash
   head -1 public/data/final_df.csv | tr ',' '\n'
   ```

3. **Re-run specific validation:**
   ```bash
   npx tsx scripts/validateData.ts
   ```

4. **Check error messages** - Each script provides detailed error information

### Build Fails

If build fails after validation passes:

1. **Check TypeScript compilation:**
   ```bash
   npx tsc -b
   ```

2. **Check Vite build:**
   ```bash
   npx vite build
   ```

3. **Clean and rebuild:**
   ```bash
   rm -rf dist node_modules/.vite
   npm run build
   ```

## Data Quality

### CSV Structure
```
artist,13 Years Old,12 Years Old,...,Year Born,Recognition by Millennials,Recognition by Gen-Zs,No. of Songs
```

### Data Ranges
- **Artists:** 26 unique
- **Age Columns:** 14 (Year Born + 1-13 Years Old)
- **Recognizability:** 0.0 - 1.0 (all valid)
- **No. of Songs:** 3 - 18 (integers)

### No Data Issues
- ✅ No preamble rows
- ✅ No quoted headers
- ✅ No missing values
- ✅ No NaN values
- ✅ No duplicate rows

## Integration with CI/CD

Add to your CI pipeline:

```yaml
- name: Validate Tableau Data
  run: |
    npm install
    npx tsx scripts/runAllValidations.ts
```

Exit code 0 = success, 1 = failure.

## Additional Documentation

- `TABLEAU_DATA_VALIDATION_SUMMARY.md` - Comprehensive validation summary
- `TABLEAU_SPEC_COMPLIANCE_CHECKLIST.md` - Spec compliance checklist
- `../docs/tableau_spec.json` - Tableau specification
- `../docs/tableau_render_contract.json` - Render contract

## Support

For issues or questions:
1. Check the validation output for specific error messages
2. Review the comprehensive summary documents
3. Verify CSV file hasn't been modified
4. Check that all validation scripts are present

---

**Last Updated:** 2025-03-20
**Status:** ✅ All validations passing
