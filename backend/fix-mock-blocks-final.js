const fs = require('fs');
const path = require('path');

function fixMockBlocks(content) {
  // Replace any mockXxx variables inside vi.mock() blocks with vi.fn()
  return content.replace(
    /vi\.mock\([^)]+\),\s*\(\)\s*=>\s*\({[\s\S]*?\}\)\);/g,
    (match) => {
      // Inside each mock block, replace mockXxx with vi.fn()
      return match.replace(/:\s*mock[A-Z]\w+/g, ': vi.fn()');
    }
  );
}

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
  console.log(`Processing ${path.basename(filePath)}...`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixMockBlocks(content);
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✓ Fixed mock blocks in ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`- No mock block changes needed in ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    return false;
  }
}

function findTestFiles(dir) {
  const files = fs.readdirSync(dir);
  const testFiles = [];
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      testFiles.push(...findTestFiles(filePath));
    } else if (file.endsWith('.spec.ts')) {
      testFiles.push(filePath);
    }
  });
  
  return testFiles;
}

console.log('Final fix: Replacing mock variables in vi.mock() blocks...\n');

const testFiles = findTestFiles(srcDir);
let fixedCount = 0;

testFiles.forEach(filePath => {
  if (processFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\n✓ Done! Fixed ${fixedCount} files.`);
console.log('Run: npm test to verify all tests pass.');
