#!/usr/bin/env node

/**
 * Pre-Build Validation Script
 * Validates build readiness and checks for common blockers
 */

const fs = require('fs');
const path = require('path');

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${description}: ${filePath}`);
    return true;
  } else {
    console.log(`✗ ${description} NOT FOUND: ${filePath}`);
    return false;
  }
}

function checkImportPaths() {
  console.log('\n=== Checking Import Paths ===\n');

  const srcDir = path.join(__dirname, '..', 'src');
  const issues = [];

  // Check main.tsx imports App.tsx correctly
  const mainPath = path.join(srcDir, 'main.tsx');
  if (fs.existsSync(mainPath)) {
    const mainContent = fs.readFileSync(mainPath, 'utf-8');
    if (mainContent.includes('./App.tsx')) {
      console.log('✓ main.tsx correctly imports App.tsx');
    } else if (mainContent.includes('./App')) {
      console.log('✓ main.tsx imports App (no extension)');
    } else {
      console.log('✗ main.tsx does not import App correctly');
      issues.push('main.tsx App import issue');
    }
  }

  // Check for data imports from src/data or src/mocks (should use public/data)
  const findFiles = (dir, pattern) => {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    items.forEach(item => {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...findFiles(fullPath, pattern));
      } else if (item.name.match(pattern)) {
        files.push(fullPath);
      }
    });
    return files;
  };

  try {
    const tsFiles = findFiles(srcDir, /\.(tsx?|jsx?)$/);
    let hasBadDataImports = false;

    tsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      // Check for imports from ../data or ../mocks
      if (content.match(/from\s+['"]\.\.\/(data|mocks)/)) {
        console.log(`⚠ ${path.relative(srcDir, file)} imports from ../data or ../mocks`);
        hasBadDataImports = true;
      }
    });

    if (!hasBadDataImports) {
      console.log('✓ No forbidden data imports found (all using public/data)');
    }
  } catch (error) {
    console.log(`⚠ Could not check all import paths: ${error.message}`);
  }

  return issues.length === 0;
}

function checkPackageJson() {
  console.log('\n=== Checking package.json ===\n');

  const pkgPath = path.join(__dirname, '..', 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.log('✗ package.json not found');
    return false;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  // Check for required dependencies
  const requiredDeps = ['d3-dsv'];
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  let allPresent = true;
  requiredDeps.forEach(dep => {
    if (allDeps[dep]) {
      console.log(`✓ Dependency present: ${dep}`);
    } else {
      console.log(`✗ Missing dependency: ${dep}`);
      allPresent = false;
    }
  });

  return allPresent;
}

function checkTypeScriptConfig() {
  console.log('\n=== Checking TypeScript Configuration ===\n');

  const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    console.log('⚠ tsconfig.json not found (may be using default config)');
    return true;
  }

  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));

  if (tsconfig.compilerOptions) {
    console.log('✓ TypeScript compiler options found');
  }

  return true;
}

function checkViteConfig() {
  console.log('\n=== Checking Vite Configuration ===\n');

  const viteConfigPath = path.join(__dirname, '..', 'vite.config.ts');
  if (!fs.existsSync(viteConfigPath)) {
    console.log('✗ vite.config.ts not found');
    return false;
  }

  console.log('✓ vite.config.ts found');
  return true;
}

function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           Pre-Build Validation Check                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results = {
    criticalFiles: true,
    importPaths: checkImportPaths(),
    packageJson: checkPackageJson(),
    typeScriptConfig: checkTypeScriptConfig(),
    viteConfig: checkViteConfig(),
  };

  console.log('\n=== Critical Files Check ===\n');

  const criticalFiles = [
    [path.join(__dirname, '..', 'src', 'main.tsx'), 'Entry point (main.tsx)'],
    [path.join(__dirname, '..', 'src', 'App.tsx'), 'App component (App.tsx)'],
    [path.join(__dirname, '..', 'src', 'services', 'dataLoader.ts'), 'Data loader service'],
    [path.join(__dirname, '..', 'src', 'types', 'data.ts'), 'Type definitions'],
    [path.join(__dirname, '..', 'public', 'data', 'metacritic_games_clean.csv'), 'CSV data file'],
    [path.join(__dirname, '..', 'index.html'), 'HTML template'],
    [path.join(__dirname, '..', 'package.json'), 'Package configuration'],
  ];

  criticalFiles.forEach(([filePath, description]) => {
    if (!checkFileExists(filePath, description)) {
      results.criticalFiles = false;
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log('BUILD READINESS SUMMARY');
  console.log('='.repeat(60));

  const allPassed = Object.values(results).every(r => r);

  Object.entries(results).forEach(([name, passed]) => {
    const status = passed ? '✓ PASSED' : '✗ FAILED';
    const paddedName = name.replace(/([A-Z])/g, ' $1').trim().padEnd(30);
    console.log(`${paddedName} ${status}`);
  });

  console.log('='.repeat(60));

  if (allPassed) {
    console.log('\n✓ ALL BUILD READINESS CHECKS PASSED');
    console.log('✓ No build blockers detected');
    console.log('✓ Ready to run: npm run build\n');
    process.exit(0);
  } else {
    console.log('\n✗ BUILD READINESS ISSUES FOUND');
    console.log('✗ Please fix the issues before building\n');
    process.exit(1);
  }
}

main();
