# Tableau Data Validation Guide

## Overview
This dashboard uses a Tableau workbook specification with calculated fields that are computed at runtime from raw CSV columns. This guide explains how to properly validate the data ingestion.

## Data Structure

### Raw CSV File: `public/data/fight-songs-538.csv`

**Expected columns (23 total):**
```
school, conference, song_name, writers, year, student_writer, official_song,
contest, bpm, sec_duration, fight, number_fights, victory, win_won,
victory_win_won, rah, nonsense, colors, men, opponents, spelling,
trope_count, spotify_id
```

**Quality checks:**
- ✓ First row is header (no preamble)
- ✓ All headers are unquoted (clean formatting)
- ✓ All numeric fields (bpm, sec_duration, etc.) contain valid numbers
- ✓ No null values in critical fields (school, conference)

### Calculated Fields (Runtime Only)

These fields do NOT exist in the CSV file. They are computed by `src/services/dataService.ts` when the data is loaded.

#### Calculation_1314769640457560064
- **Purpose:** School Name Title for action filter
- **Tableau Reference:** `[federated.11puer61m90mpg19d40mw1ku60q8].[usr:Calculation_1314769640457560064:nk]`
- **Formula:** `CONCAT(conference, ', ', school)`
- **Source Columns:** `conference`, `school`
- **Data Type:** String
- **Example Value:** `"Independent, Notre Dame"`, `"Big 12, Baylor"`
- **Implementation:** Line 44 in `src/services/dataService.ts`

## Validation Rules

### For External QA/Build Systems

When validating Tableau field references against the CSV:

1. **Identify Field Type:**
   - Fields with pattern `[usr:Calculation_...:nk]` are **user-calculated fields**
   - Fields with prefix `Calculation_` are **computed at runtime**
   - These should NOT be checked against CSV headers

2. **For Calculated Fields:**
   - ✓ Verify source columns exist in CSV
   - ✓ Verify calculation is implemented in `src/services/dataService.ts`
   - ✓ Verify field is added to TypeScript type definitions
   - ✗ DO NOT expect field in CSV headers
   - ✗ DO NOT flag as "missing required field"

3. **For Raw CSV Fields:**
   - ✓ Verify field exists in CSV headers
   - ✓ Verify data type matches specification
   - ✓ Verify no null values in critical fields

### Field Reference Mapping

| Tableau Field Reference | Type | CSV Column? | Implementation |
|------------------------|------|-------------|----------------|
| `school` | Raw | ✓ | CSV column |
| `conference` | Raw | ✓ | CSV column |
| `bpm` | Raw | ✓ | CSV column (numeric) |
| `sec_duration` | Raw | ✓ | CSV column (numeric) |
| `Calculation_1314769640457560064` | Calculated | ✗ | Computed at runtime |

## Validation Scripts

### Local Validation
Run the deterministic Tableau source validator:
```bash
bash validate_tableau_source.sh
```

This checks:
- Data file exists
- No preamble rows
- Required raw fields present
- Clean headers (no quotes)
- Valid numeric data
- No nulls in critical fields
- Build succeeds

### Build Verification
```bash
npm run build
```

## Common Validation Errors

### Error: "csv_missing_required_fields: Calculation_1314769640457560064"

**Cause:** Validator is checking a calculated field against CSV headers.

**Solution:**
1. Check if field has `[usr:...:nk]` pattern or `Calculation_` prefix
2. If yes, verify it's documented in `docs/calculated_fields.json`
3. Verify source columns exist in CSV
4. Verify runtime implementation exists in `src/services/dataService.ts`
5. Do NOT expect this field in the CSV file

## Data Loading Flow

```
1. fetch('/data/fight-songs-538.csv')
   ↓
2. d3.csvParse(csvText)
   ↓
3. Map each row to FightSongData interface:
   - Copy raw CSV columns
   - Parse numeric fields (bpm, sec_duration, etc.)
   - COMPUTE calculated fields:
     * Calculation_1314769640457560064 = `${conference}, ${school}`
   ↓
4. Return FightSongData[] with all fields (raw + calculated)
   ↓
5. Components consume data with full field set
```

## Specification Files

- `docs/tableau_spec.json` - Original Tableau workbook specification
- `docs/tableau_render_contract.json` - Rendering intents and layout
- `docs/calculated_fields.json` - Runtime calculated field definitions
- `public/data/fight-songs-538.csv` - Raw data source
- `src/services/dataService.ts` - Data loading and field computation
- `src/types/index.ts` - TypeScript type definitions

## Checklist for Validation

- [ ] CSV file exists at `public/data/fight-songs-538.csv`
- [ ] CSV has 23 columns with correct headers
- [ ] CSV headers are unquoted (clean format)
- [ ] Numeric fields contain valid numbers
- [ ] No null values in school/conference columns
- [ ] All required raw fields present: school, conference, bpm, sec_duration
- [ ] Calculated fields documented in `docs/calculated_fields.json`
- [ ] Calculated fields implemented in `src/services/dataService.ts`
- [ ] TypeScript types include calculated fields
- [ ] Build succeeds: `npm run build`
- [ ] Local validator passes: `bash validate_tableau_source.sh`
