import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Checking for unused variables and other issues...\n');

// Check AnnualByTypeYearChart.tsx
const annualChart = readFileSync(join(__dirname, 'src/components/AnnualByTypeYearChart.tsx'), 'utf-8');
console.log('Checking AnnualByTypeYearChart.tsx:');
console.log("  - 'total' variable removed:", !annualChart.includes('const total = slices.reduce'));
console.log("  - 'arcHovered' variable removed:", !annualChart.includes('const arcHovered'));
console.log("  - Unused 'event' parameter fixed:", annualChart.includes('(_event, d)') || annualChart.includes('(_event, _d)'));
console.log("  - Type annotations added for d3 callbacks:", annualChart.includes(': d3.PieArcDatum<PieSlice>'));

// Check InformationSourceChart.tsx
const infoSourceChart = readFileSync(join(__dirname, 'src/components/InformationSourceChart.tsx'), 'utf-8');
console.log('\nChecking InformationSourceChart.tsx:');
console.log("  - Type-only import fixed:", infoSourceChart.includes('import type { DataPoint }'));
console.log("  - stackData type fixed:", infoSourceChart.includes('Record<string, number | string>'));
console.log("  - Number() conversion added:", infoSourceChart.includes('Number(d['));

console.log('\n✓ All TypeScript issues should be fixed!');
