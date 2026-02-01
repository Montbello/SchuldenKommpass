const fs = require('fs');
const path = require('path');

// Find all .spec.ts files recursively
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

// Fix mock patterns in a file
function fixMockPatterns(content) {
  let fixed = content;
  
  // Step 1: Remove top-level const mockXxx = vi.fn(); declarations
  fixed = fixed.replace(/^const mock\w+ = vi\.fn\(\);[\r\n]+/gm, '');
  
  // Step 2: Replace mockXxx.mockResolvedValue(...) with vi.mocked(prisma.xxx).mockResolvedValue(...)
  // This is complex, so we'll do a simpler replacement
  // We need to identify which mock belongs to which prisma method
  
  // Step 3: Replace in beforeEach blocks: mockXxx.mockReset() with vi.clearAllMocks()
  fixed = fixed.replace(/beforeEach\(\(\) => \{[\r\n\s]+([\s\S]*?)mockReset\(\);[\r\n\s]+\}\);/g, (match) => {
    return match.replace(/mock\w+\.mockReset\(\);[\r\n\s]*/g, '');
  });
  
  // Add vi.clearAllMocks() at start of beforeEach if not present
  fixed = fixed.replace(/(beforeEach\(\(\) => \{)[\r\n\s]+(?![\s]*vi\.clearAllMocks)/g, '$1\n    vi.clearAllMocks();\n');
  
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
      console.log('  ✓ Fixed\n');
    } else {
      console.log('  - No changes needed\n');
    }
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}\n`);
  }
});

console.log('\nDone! Please review the changes manually.');
console.log('Note: Some mock references may need manual adjustment.');
console.log('Run: npm test -- --reporter=verbose to see remaining issues.');
