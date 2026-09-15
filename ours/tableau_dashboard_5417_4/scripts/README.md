# Validation Scripts

This directory contains validation scripts to ensure deterministic and correct Tableau source ingestion.

## Quick Start

```bash
# Run all validations (recommended)
npm run validate

# Or run directly
node scripts/validate-master.cjs
```

## Individual Scripts

### 1. validate-master.cjs (Master Validator)
**Purpose**: Runs all validation checks + production build

**Usage**:
```bash
npm run validate
# or
node scripts/validate-master.cjs
```

**Checks**:
- CSV parsing
- Tableau field mapping
- Data quality
- Build readiness
- Production build

**Duration**: ~4.6s

**Status**: ✅ All validations passed

---

### 2. validate-csv-parsing.cjs (CSV Parser)
**Purpose**: Validates CSV parsing with quoted headers

**Usage**:
```bash
npm run validate:csv
# or
node scripts/validate-csv-parsing.cjs
```

**Validates**:
- ✓ Finds header at correct row
- ✓ Normalizes quoted headers
- ✓ Parses data rows correctly
- ✓ Extracts field values

**Result**: 5,699 data rows parsed

---

### 3. validate-tableau-fields.cjs (Field Mapper)
**Purpose**: Validates Tableau spec field mappings

**Usage**:
```bash
npm run validate:fields
# or
node scripts/validate-tableau-fields.cjs
```

**Validates**:
- ✓ Extracts fields from tableau_spec.json
- ✓ Maps fields to CSV columns
- ✓ Checks computed metrics
- ✓ Verifies time series fields

**Result**: 3/3 fields mapped, 0 missing

---

### 4. validate-data-quality.cjs (Data Quality)
**Purpose**: Validates data quality to prevent visualization issues

**Usage**:
```bash
npm run validate:quality
# or
node scripts/validate-data-quality.cjs
```

**Validates**:
- ✓ No all-zero metrics
- ✓ No NaN dates
- ✓ Valid categorical values
- ✓ Score fields populated

**Result**: No data quality issues

---

### 5. validate-build-readiness.cjs (Build Checker)
**Purpose**: Validates no build blockers exist

**Usage**:
```bash
npm run validate:build
# or
node scripts/validate-build-readiness.cjs
```

**Validates**:
- ✓ All critical files present
- ✓ Correct import paths
- ✓ Required dependencies
- ✓ Config files present

**Result**: No build blockers

---

### 6. validate-all.cjs (Source Validator)
**Purpose**: Runs all source validation checks (no build)

**Usage**:
```bash
node scripts/validate-all.cjs
```

**Checks**:
- CSV parsing
- Tableau field mapping
- Data quality

**Duration**: ~0.5s

**Use case**: Quick validation without build

## NPM Scripts

```json
{
  "validate": "node scripts/validate-master.cjs",
  "validate:csv": "node scripts/validate-csv-parsing.cjs",
  "validate:fields": "node scripts/validate-tableau-fields.cjs",
  "validate:quality": "node scripts/validate-data-quality.cjs",
  "validate:build": "node scripts/validate-build-readiness.cjs"
}
```

## Output Examples

### Success Output
```
✅ SUCCESS: ALL VALIDATIONS PASSED

The following has been verified:
  ✓ CSV parsing is deterministic (handles quoted headers)
  ✓ Tableau fields map correctly to CSV columns
  ✓ Data quality is good (no all-zero metrics, NaN dates)
  ✓ No build blockers (import paths, missing files)
  ✓ Production build completes successfully

✅ Ready for QA and deployment stages
```

### Failure Output
```
❌ FAILURE: SOME VALIDATIONS FAILED

Failed validations:
  1. CSV Parsing Validation
  2. Data Quality Validation

⚠️  Please fix the issues above before proceeding to QA/build
```

## Troubleshooting

### CSV Parsing Fails
- Check CSV file format in `public/data/`
- Verify headers are not corrupted
- Check for BOM or encoding issues

### Field Mapping Fails
- Verify `tableau_spec.json` is present
- Check field names match CSV columns
- Ensure no typos in field references

### Data Quality Fails
- Check for all-zero metrics in source
- Verify date formats (YYYY-MM-DD)
- Ensure categorical fields have values

### Build Fails
- Run `npm install` to update dependencies
- Check TypeScript configuration
- Verify import paths are correct

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Validate Tableau Source
  run: npm run validate

- name: Build Application
  run: npm run build
```

## Support

For issues:
1. Check individual validation scripts
2. Review `docs/SOURCE_INGESTION_VALIDATION.md`
3. Examine CSV file in `public/data/`
4. Verify Tableau specs in `docs/`

---

**Status**: ✅ All validators passing
**Last Run**: 2026-03-23
**Version**: 1.0.0
