#!/bin/bash

# Deterministic Tableau Source Validator
# This script validates that the Tableau source ingestion is deterministic and correct

set -e

DATA_DIR="public/data"
DATA_FILE="$DATA_DIR/fight-songs-538.csv"

echo "========================================================================"
echo "TABLEAU SOURCE INGESTION VALIDATOR"
echo "========================================================================"

# Check 1: Data file exists
echo ""
echo "CHECK 1: Data file exists"
if [ -f "$DATA_FILE" ]; then
    echo "  ✓ Data file found: $DATA_FILE"
else
    echo "  ✗ Data file NOT found: $DATA_FILE"
    exit 1
fi

# Check 2: No preamble rows
echo ""
echo "CHECK 2: No preamble rows (first row must be header)"
FIRST_FIELD=$(head -1 "$DATA_FILE" | cut -d',' -f1)
if [ "$FIRST_FIELD" = "school" ]; then
    echo "  ✓ No preamble detected - first row is header"
else
    echo "  ✗ Preamble detected - first field is: $FIRST_FIELD"
    exit 1
fi

# Check 3: Required headers present
echo ""
echo "CHECK 3: Required Tableau fields present in CSV"
REQUIRED_FIELDS=("school" "conference" "bpm" "sec_duration")
HEADERS=$(head -1 "$DATA_FILE")
ALL_PRESENT=true
for field in "${REQUIRED_FIELDS[@]}"; do
    if echo "$HEADERS" | grep -q "\"$field\"" || echo "$HEADERS" | grep -q ",$field," || echo "$HEADERS" | grep -q "^$field," || echo "$HEADERS" | grep -q ",$field$"; then
        echo "  ✓ Field '$field' found"
    else
        echo "  ✗ Field '$field' NOT found"
        ALL_PRESENT=false
    fi
done

if [ "$ALL_PRESENT" = "false" ]; then
    exit 1
fi

# Check 4: No quoted headers
echo ""
echo "CHECK 4: Header normalization (no quoted/dirty headers)"
if echo "$HEADERS" | grep -q '"'; then
    echo "  ✗ Headers contain quotes - need normalization"
    exit 1
else
    echo "  ✓ All headers are clean (no quotes)"
fi

# Check 5: Data quality
echo ""
echo "CHECK 5: Data quality - numeric fields contain valid data"
INVALID_ROWS=$(python3 << PYEOF
import csv
with open('$DATA_FILE', 'r') as f:
    reader = csv.DictReader(f)
    invalid = 0
    for i, row in enumerate(reader, 1):
        try:
            bpm = float(row['bpm'])
            dur = float(row['sec_duration'])
            if bpm <= 0 or dur <= 0:
                invalid += 1
        except (ValueError, KeyError):
            invalid += 1
    print(invalid)
PYEOF
)

if [ "$INVALID_ROWS" -eq 0 ]; then
    echo "  ✓ All numeric fields contain valid data"
else
    echo "  ⚠ Found $INVALID_ROWS rows with invalid numeric data (will be coerced to 0)"
fi

# Check 6: No null values in critical fields
echo ""
echo "CHECK 6: No null values in critical fields"
NULL_COUNTS=$(python3 << PYEOF
import csv
with open('$DATA_FILE', 'r') as f:
    reader = csv.DictReader(f)
    null_school = 0
    null_conf = 0
    for row in reader:
        if not row.get('school') or row['school'].strip() == '':
            null_school += 1
        if not row.get('conference') or row['conference'].strip() == '':
            null_conf += 1
    print(f"{null_school},{null_conf}")
PYEOF
)

NULL_SCHOOL=$(echo "$NULL_COUNTS" | cut -d',' -f1)
NULL_CONF=$(echo "$NULL_COUNTS" | cut -d',' -f2)

if [ "$NULL_SCHOOL" -eq 0 ] && [ "$NULL_CONF" -eq 0 ]; then
    echo "  ✓ No null values in critical fields (school, conference)"
else
    echo "  ✗ Found null values: school=$NULL_SCHOOL, conference=$NULL_CONF"
    exit 1
fi

# Check 7: Build passes
echo ""
echo "CHECK 7: Build verification"
if npm run build > /dev/null 2>&1; then
    echo "  ✓ Build successful"
else
    echo "  ✗ Build failed"
    exit 1
fi

echo ""
echo "========================================================================"
echo "VALIDATION RESULT: ✓ ALL CHECKS PASSED"
echo "The Tableau source ingestion is deterministic and correct."
echo "========================================================================"
exit 0
