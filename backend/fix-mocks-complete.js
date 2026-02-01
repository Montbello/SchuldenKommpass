const fs = require('fs');
const path = require('path');

function findTestFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTestFiles(filePath, fileList);
    } else if (file.endsWith('.spec.ts') && file !== 'users.service.spec.ts') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixMockPatterns(content) {
  let fixed = content;
  
  // Replace mock variable references in vi.mock() blocks with vi.fn()
  fixed = fixed.replace(/vi\.mock\([^)]+\),\s*\(\)\s*=>\s*(\{[\s\S]*?\}\));/g, (match) => {
    // Inside the mock factory, replace mockXxx references with vi.fn()
    return match.replace(/:\s*mock\w+/g, ': vi.fn()');
  });
  
  //Replace vi.mock patterns with proper structure
  fixed = fixed.replace(/vi\.mock\('([^']+)',\s*\(\)\s*=>\s*\{[\s\S]*?return\s*(\{[\s\S]*?\});[\s\S]*?\}\);/g, (match, modulePath, returnBlock) => {
    const cleanedReturn = returnBlock.replace(/:\s*mock\w+/g, ': vi.fn()');
    return `vi.mock('${modulePath}', () => (${cleanedReturn}));`;
  });
  
  return fixed;
}

// Process files
const testFiles = findTestFiles(path.join(__dirname, 'src'));

console.log(`Found ${testFiles.length} test files to process\n`);

testFiles.forEach(filePath => {
  console.log(`Processing: ${path.relative(__dirname, filePath)}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixMockPatterns(content);
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log('  ✓ Fixed mock declarations\n');
    } else {
      console.log('  - No changes needed\n');
    }
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}\n`);
  }
});

console.log('\nDone! Mock declarations have been fixed.');
console.log('Run tests again to check for remaining issues.');
