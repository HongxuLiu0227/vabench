/**
 * Comprehensive Tableau Data Validation
 * Runs all validation checks and provides a summary
 */

import { execSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ValidationResult {
  name: string;
  success: boolean;
  duration: number;
  details?: string;
}

function runValidation(scriptName: string): ValidationResult {
  const startTime = Date.now();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${scriptName}`);
  console.log('='.repeat(60));

  try {
    execSync(`npx tsx ${scriptName}`, {
      cwd: __dirname,
      stdio: 'inherit',
      timeout: 30000
    });
    const duration = Date.now() - startTime;
    return { name: scriptName, success: true, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      name: scriptName,
      success: false,
      duration,
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║     Tableau Data Ingestion Validation Suite              ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  const results: ValidationResult[] = [];

  // Run all validations
  results.push(runValidation('validateData.ts'));
  results.push(runValidation('validateTransformations.ts'));
  results.push(runValidation('validateTableauSpec.ts'));

  // Print summary
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    Validation Summary                    ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  let totalDuration = 0;
  let successCount = 0;
  let failureCount = 0;

  results.forEach((result, idx) => {
    const status = result.success ? '✓ PASS' : '✗ FAIL';
    const statusColor = result.success ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`${idx + 1}. ${result.name}`);
    console.log(`   Status: ${statusColor}${status}${reset}`);
    console.log(`   Duration: ${result.duration}ms`);

    if (!result.success && result.details) {
      console.log(`   Error: ${result.details}`);
    }

    console.log('');

    totalDuration += result.duration;
    if (result.success) successCount++;
    else failureCount++;
  });

  console.log('─'.repeat(60));
  console.log(`Total Duration: ${totalDuration}ms`);
  console.log(`Passed: ${successCount}/${results.length}`);
  console.log(`Failed: ${failureCount}/${results.length}`);
  console.log('─'.repeat(60));

  // Overall status
  const allPassed = results.every(r => r.success);
  if (allPassed) {
    console.log('\n✓ ALL VALIDATIONS PASSED!');
    console.log('\nTableau source ingestion is deterministic and correct.');
    console.log('All required fields resolve to real columns at runtime.');
    console.log('No silent bad parses detected.');
  } else {
    console.log('\n✗ SOME VALIDATIONS FAILED');
    console.log('\nPlease review the errors above and fix any issues.');
  }

  console.log('');

  process.exit(allPassed ? 0 : 1);
}

main();
