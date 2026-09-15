import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check for type-only imports in key files
const filesToCheck = [
  'src/components/AnnualByTypeYearChart.tsx',
  'src/components/Dashboard.tsx',
  'src/components/InformationSourceChart.tsx',
  'src/components/TypesOfBreachChart.tsx',
  'src/contexts/FilterContext.tsx',
  'src/services/dataAggregator.ts',
  'src/services/dataLoader.ts',
];

console.log('Checking type-only imports...\n');

let allValid = true;

filesToCheck.forEach(filePath => {
  const fullPath = join(__dirname, filePath);
  try {
    const content = readFileSync(fullPath, 'utf-8');

    // Check if file uses type-only imports for types
    const hasTypeOnlyImport = content.includes('import type {');
    const hasRegularTypeImport = content.match(/import\s+{\s*[^}]*DataPoint|FilterState|BreachTypeCount|InfoSourceCount|PieSlice|DataRow|ReactNode/);

    if (hasRegularTypeImport && !hasTypeOnlyImport) {
      console.log(`❌ ${filePath}: Still using regular type imports`);
      allValid = false;
    } else if (hasTypeOnlyImport) {
      console.log(`✓ ${filePath}: Uses type-only imports`);
    } else {
      console.log(`? ${filePath}: No type imports found`);
    }
  } catch (error) {
    console.log(`⚠ ${filePath}: Could not read file - ${error.message}`);
  }
});

console.log('\n' + (allValid ? '✓ All type imports are fixed!' : '❌ Some type imports still need fixing'));
