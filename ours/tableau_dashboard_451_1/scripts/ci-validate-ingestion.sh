#!/bin/bash
# CI/CD Pipeline Validation Script for Tableau Source Ingestion
# This script runs all validation checks and exits with error code if any fail

set -e  # Exit on any error

echo "════════════════════════════════════════════════════════════════"
echo "  Tableau Source Ingestion - CI/CD Validation Pipeline"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ALL_PASSED=true

# Function to run a test and track results
run_test() {
  local test_name=$1
  local test_command=$2

  echo "▶ Running: $test_name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if eval "$test_command"; then
    echo -e "${GREEN}✓ PASSED${NC}: $test_name"
  else
    echo -e "${RED}✗ FAILED${NC}: $test_name"
    ALL_PASSED=false
  fi
  echo ""
}

# Change to project directory
cd "$(dirname "$0")/.."

# Run validation tests
run_test "CSV Parsing Validation" "node scripts/validate-csv-parsing.js"
run_test "Tableau Field Mapping" "node scripts/validate-tableau-fields.js"
run_test "Comprehensive Ingestion Tests" "node scripts/comprehensive-validator.js"
run_test "TypeScript Compilation" "npm run build"

# Final summary
echo "════════════════════════════════════════════════════════════════"
if [ "$ALL_PASSED" = true ]; then
  echo -e "${GREEN}✓ ALL VALIDATION TESTS PASSED${NC}"
  echo "════════════════════════════════════════════════════════════════"
  exit 0
else
  echo -e "${RED}✗ SOME VALIDATION TESTS FAILED${NC}"
  echo "════════════════════════════════════════════════════════════════"
  exit 1
fi
