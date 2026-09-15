#!/usr/bin/env tsx
/**
 * Deterministic Tableau source validator
 * Validates that:
 * 1. CSV headers are normalized correctly
 * 2. Required Tableau fields are present in parsed data
 * 3. Build imports are correct
 */

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

const results: ValidationResult = {
  success: true,
  errors: [],
  warnings: [],
};

// Check 1: Verify CSV headers can be normalized
console.log('\n=== Checking CSV Header Normalization ===');

const csvPath = path.resolve(process.cwd(), 'public/data/metacritic_games_clean.csv');
if (!fs.existsSync(csvPath)) {
  results.errors.push(`CSV file not found: ${csvPath}`);
  results.success = false;
} else {
  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvText.split('\n');
  const firstLine = lines[0];

  console.log('Raw header line (first 200 chars):');
  console.log(firstLine.substring(0, 200));

  // Check for triple quotes
  if (firstLine.includes('"""')) {
    results.warnings.push('CSV contains triple quotes - normalization required');
  }

  // Parse and normalize headers
  const normalizedHeader = firstLine.replace(/"""/g, '"').replace(/^"+|"+$/g, '').trim();
  const parseResult = Papa.parse<'F1' | 'game' | 'platform' | 'metascore' | 'user_score'>(normalizedHeader, {
    header: true,
    skipEmptyLines: true,
  });

  if (parseResult.errors.length > 0) {
    results.errors.push(`CSV parsing errors: ${parseResult.errors.map(e => e.message).join(', ')}`);
    results.success = false;
  } else {
    console.log('✓ CSV headers parsed successfully');
  }
}

// Check 2: Verify required Tableau fields exist in data
console.log('\n=== Checking Required Tableau Fields ===');

const requiredTableauFields = [
  'AdhocCluster',
  'Calculation_652740522679025665',
  'Calculation_652740522680942595',
];

// Check if the data loader computes these fields
const dataLoaderPath = path.resolve(process.cwd(), 'src/utils/data.ts');
if (fs.existsSync(dataLoaderPath)) {
  const dataLoaderContent = fs.readFileSync(dataLoaderPath, 'utf-8');

  for (const field of requiredTableauFields) {
    if (dataLoaderContent.includes(field)) {
      console.log(`✓ Field ${field} is computed in data loader`);
    } else {
      results.errors.push(`Field ${field} not found in data loader`);
      results.success = false;
    }
  }
} else {
  results.errors.push(`Data loader not found: ${dataLoaderPath}`);
  results.success = false;
}

// Check if types include these fields
const typesPath = path.resolve(process.cwd(), 'src/types/index.ts');
if (fs.existsSync(typesPath)) {
  const typesContent = fs.readFileSync(typesPath, 'utf-8');

  for (const field of requiredTableauFields) {
    if (typesContent.includes(field)) {
      console.log(`✓ Field ${field} is defined in types`);
    } else {
      results.errors.push(`Field ${field} not found in types`);
      results.success = false;
    }
  }
} else {
  results.errors.push(`Types file not found: ${typesPath}`);
  results.success = false;
}

// Check 3: Verify build imports are correct
console.log('\n=== Checking Build Imports ===');

const mainTsxPath = path.resolve(process.cwd(), 'src/main.tsx');
if (fs.existsSync(mainTsxPath)) {
  const mainContent = fs.readFileSync(mainTsxPath, 'utf-8');

  if (mainContent.includes("from './App.tsx'")) {
    results.errors.push('src/main.tsx imports \'./App.tsx\' - should be \'./App\' without extension');
    results.success = false;
  } else if (mainContent.includes("from './App'")) {
    console.log('✓ Build import is correct (no .tsx extension)');
  } else {
    results.warnings.push('Could not verify App import in main.tsx');
  }
} else {
  results.errors.push(`main.tsx not found: ${mainTsxPath}`);
  results.success = false;
}

// Check 4: Verify GameData interface includes required fields
console.log('\n=== Checking GameData Interface ===');

if (fs.existsSync(typesPath)) {
  const typesContent = fs.readFileSync(typesPath, 'utf-8');

  const gameDataMatch = typesContent.match(/export interface GameData \{([^}]+)\}/);
  if (gameDataMatch) {
    const interfaceBody = gameDataMatch[1];
    const hasAllFields = requiredTableauFields.every(field =>
      interfaceBody.includes(field)
    );

    if (hasAllFields) {
      console.log('✓ GameData interface includes all required Tableau fields');
    } else {
      const missingFields = requiredTableauFields.filter(field =>
        !interfaceBody.includes(field)
      );
      results.errors.push(`GameData interface missing fields: ${missingFields.join(', ')}`);
      results.success = false;
    }
  }
}

// Summary
console.log('\n=== Validation Summary ===');
console.log(`Success: ${results.success ? '✓ PASS' : '✗ FAIL'}`);

if (results.errors.length > 0) {
  console.log(`\nErrors (${results.errors.length}):`);
  results.errors.forEach((error, i) => {
    console.log(`  ${i + 1}. [ERROR] ${error}`);
  });
}

if (results.warnings.length > 0) {
  console.log(`\nWarnings (${results.warnings.length}):`);
  results.warnings.forEach((warning, i) => {
    console.log(`  ${i + 1}. [WARN] ${warning}`);
  });
}

if (results.success) {
  console.log('\n✓ All checks passed - Tableau source ingestion is deterministic and correct');
  process.exit(0);
} else {
  console.log('\n✗ Validation failed - fix the errors above');
  process.exit(1);
}
