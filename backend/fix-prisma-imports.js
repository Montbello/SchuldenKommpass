const fs = require('fs');
const path = require('path');

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file has the wrong import
  if (content.includes("import { prisma } from '../../prismaClient'")) {
    console.log(`Fixing ${filePath}...`);
    content = content.replace(
      "import { prisma } from '../../prismaClient';",
      "import prisma from '../../prismaClient';"
    );
    // Also handle without semicolon
    content = content.replace(
      "import { prisma } from '../../prismaClient'",
      "import prisma from '../../prismaClient'"
    );
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function findAllTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules')) {
      files.push(...findAllTsFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  });
  
  return files;
}

const srcDir = path.join(__dirname, 'src');
const tsFiles = findAllTsFiles(srcDir);

let fixedCount = 0;
tsFiles.forEach(file => {
  if (fixImports(file)) {
    fixedCount++;
  }
});

console.log(`\n✓ Fixed ${fixedCount} files`);
