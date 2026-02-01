const fs = require('fs');
const path = require('path');

// Add unlockService mock to certificates.service.spec.ts
function addUnlockServiceMock(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find where to insert (after prisma mock, before imports)
  const mockEnd = content.indexOf('}));');
  if (mockEnd === -1) return content;
  
  const insertPos = content.indexOf('\n\n', mockEnd) + 2;
  
  const unlockMock = `vi.mock('../../services/unlock.service', () => ({
  unlockService: {
    generateCertificateToken: vi.fn(),
    verifyCertificateToken: vi.fn(),
    getLevelProgress: vi.fn(),
  },
}));

`;
  
  // Check if already exists
  if (content.includes("vi.mock('../../services/unlock.service'")) {
    return content;
  }
  
  return content.slice(0, insertPos) + unlockMock + content.slice(insertPos);
}

// Fix wrong mock calls like prisma.generate.certificateToken
function fixWrongMockCalls(content) {
  // Fix unlockService calls
  content = content.replace(/vi\.mocked\(prisma\.generate\.certificateToken\)/g, 'vi.mocked(unlockService.generateCertificateToken)');
  content = content.replace(/expect\(prisma\.generate\.certificateToken\)/g, 'expect(unlockService.generateCertificateToken)');
  content = content.replace(/vi\.mocked\(prisma\.verify\.certificateToken\)/g, 'vi.mocked(unlockService.verifyCertificateToken)');
  content = content.replace(/vi\.mocked\(prisma\.get\.levelProgress\)/g, 'vi.mocked(unlockService.getLevelProgress)');
  
  // Fix auditEvent calls
  content = content.replace(/prisma\.audit\.eventCreate/g, 'prisma.auditEvent.create');
  
  return content;
}

// Add missing imports
function addMissingImports(content, needsUnlockService) {
  if (needsUnlockService && !content.includes("import { unlockService }")) {
    // Find the line after prisma import
    const prismaImportMatch = content.match(/import prisma from '\.\.\/\.\.\/prismaClient';?\n/);
    if (prismaImportMatch) {
      const insertPos = content.indexOf(prismaImportMatch[0]) + prismaImportMatch[0].length;
      const unlockImport = "import { unlockService } from '../../services/unlock.service';\n";
      content = content.slice(0, insertPos) + unlockImport + content.slice(insertPos);
    }
  }
  
  return content;
}

console.log('Applying final fixes to test files...\n');

// Fix certificates.service.spec.ts
const certsPath = path.join(__dirname, 'src/modules/certificates/certificates.service.spec.ts');
if (fs.existsSync(certsPath)) {
  console.log('Fixing certificates.service.spec.ts...');
  let content = fs.readFileSync(certsPath, 'utf8');
  content = addUnlockServiceMock(certsPath);
  content = fixWrongMockCalls(content);
  content = addMissingImports(content, true);
  fs.writeFileSync(certsPath, content, 'utf8');
  console.log('✓ Fixed certificates.service.spec.ts');
}

console.log('\n✓ Done! Run npm test');
