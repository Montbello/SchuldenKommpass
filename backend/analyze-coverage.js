const fs = require('fs');
const path = require('path');

const coverageFile = path.join(__dirname, 'coverage', 'coverage-final.json');

if (!fs.existsSync(coverageFile)) {
  console.log('No coverage data found. Run: npm test first');
  process.exit(1);
}

const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));

// Calculate overall and per-module coverage
const modules = {
  users: [],
  certificates: [],
  appointments: [],
  tasks: [],
  progress: [],
  onboarding: [],
  matches: [],
  institutions: [],
};

let totalStatements = { covered: 0, total: 0 };
let totalBranches = { covered: 0, total: 0 };
let totalFunctions = { covered: 0, total: 0 };
let totalLines = { covered: 0, total: 0 };

Object.entries(coverage).forEach(([file, data]) => {
  // Skip test files and non-src files
  if (file.includes('.spec.') || !file.includes('\\src\\')) {
    return;
  }

  const statements = data.s || {};
  const branches = data.b || {};
  const functions = data.f || {};
  
  const statsCovered = Object.values(statements).filter(v => v > 0).length;
  const statsTotal = Object.values(statements).length;
  
  const branchesCovered = Object.values(branches).flat().filter(v => v > 0).length;
  const branchesTotal = Object.values(branches).flat().length;
  
  const funcsCovered = Object.values(functions).filter(v => v > 0).length;
  const funcsTotal = Object.values(functions).length;
  
  totalStatements.covered += statsCovered;
  totalStatements.total += statsTotal;
  totalBranches.covered += branchesCovered;
  totalBranches.total += branchesTotal;
  totalFunctions.covered += funcsCovered;
  totalFunctions.total += funcsTotal;
  
  // Categorize by module
  const moduleName = file.match(/\\modules\\([^\\]+)\\/)?.[1];
  if (moduleName && modules[moduleName]) {
    modules[moduleName].push({
      file: path.basename(file),
      statements: statsTotal > 0 ? ((statsCovered / statsTotal) * 100).toFixed(2) : 0,
      branches: branchesTotal > 0 ? ((branchesCovered / branchesTotal) * 100).toFixed(2) : 0,
      functions: funcsTotal > 0 ? ((funcsCovered / funcsTotal) * 100).toFixed(2) : 0,
    });
  }
});

console.log('\n=== COVERAGE ANALYSIS ===\n');

console.log('Overall Coverage:');
console.log(`  Statements: ${((totalStatements.covered / totalStatements.total) * 100).toFixed(2)}% (${totalStatements.covered}/${totalStatements.total})`);
console.log(`  Branches:   ${((totalBranches.covered / totalBranches.total) * 100).toFixed(2)}% (${totalBranches.covered}/${totalBranches.total})`);
console.log(`  Functions:  ${((totalFunctions.covered / totalFunctions.total) * 100).toFixed(2)}% (${totalFunctions.covered}/${totalFunctions.total})`);

console.log('\n=== MODULE COVERAGE ===\n');

Object.entries(modules).forEach(([module, files]) => {
  if (files.length === 0) {
    console.log(`${module}: NO COVERAGE`);
    return;
  }
  
  const avgStatements = files.reduce((sum, f) => sum + parseFloat(f.statements), 0) / files.length;
  console.log(`${module}: ${avgStatements.toFixed(2)}% avg statements (${files.length} files)`);
  files.forEach(f => {
    console.log(`  - ${f.file}: ${f.statements}% stmts, ${f.branches}% branches, ${f.functions}% funcs`);
  });
});

console.log('\n=== RECOMMENDATION ===\n');

const overallPct = (totalStatements.covered / totalStatements.total) * 100;
if (overallPct >= 80) {
  console.log('✓ Coverage goal of 80% REACHED!');
} else {
  console.log(`✗ Coverage is ${overallPct.toFixed(2)}% - Need ${(80 - overallPct).toFixed(2)}% more`);
  console.log('\nModules needing tests:');
  Object.entries(modules).forEach(([module, files]) => {
    if (files.length === 0) {
      console.log(`  - ${module}: 0% (no tests)`);
    } else {
      const avg = files.reduce((sum, f) => sum + parseFloat(f.statements), 0) / files.length;
      if (avg < 80) {
        console.log(`  - ${module}: ${avg.toFixed(2)}%`);
      }
    }
  });
}
