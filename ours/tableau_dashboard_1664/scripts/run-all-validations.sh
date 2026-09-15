#!/bin/bash

# Comprehensive Tableau Source Validation Script
# Runs all validation checks to ensure deterministic and correct data ingestion

set -e

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    Tableau Source Validation Suite                          ║"
echo "║              Ensuring deterministic and correct data ingestion              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Change to script directory
cd "$(dirname "$0")/.."

# Run all validation scripts
echo "────────────────────────────────────────────────────────────────────────────────"
echo "1. CSV Parsing Validation"
echo "────────────────────────────────────────────────────────────────────────────────"
node scripts/validate-csv-parsing.js
echo ""

echo "────────────────────────────────────────────────────────────────────────────────"
echo "2. Data Ingestion Validation"
echo "────────────────────────────────────────────────────────────────────────────────"
node scripts/validate-data-ingestion.js
echo ""

echo "────────────────────────────────────────────────────────────────────────────────"
echo "3. Data Quality Validation"
echo "────────────────────────────────────────────────────────────────────────────────"
node scripts/validate-data-quality.js
echo ""

echo "────────────────────────────────────────────────────────────────────────────────"
echo "4. Build Verification"
echo "────────────────────────────────────────────────────────────────────────────────"
npm run build > /dev/null 2>&1
echo "✓ Build successful"
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                      ALL VALIDATIONS PASSED ✓                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Summary:"
echo "  ✓ CSV parsing: Deterministic and correct"
echo "  ✓ Data ingestion: All required fields present and accessible"
echo "  ✓ Data quality: No silent parse failures, all values valid"
echo "  ✓ Build: Successful, no errors"
echo ""
echo "Tableau source ingestion is ready for QA/build stages."
