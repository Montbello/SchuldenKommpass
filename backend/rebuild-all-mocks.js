const fs = require('fs');
const path = require('path');

// Map each test file to its required mocks
const mockConfigs = {
  'certificates.service.spec.ts': {
    prisma: ['certificate', 'auditEvent'],
    services: {
      '../../services/unlock.service': ['unlockService']
    }
  },
  'appointments.service.spec.ts': {
    prisma: ['appointment', 'user', 'auditEvent'],
    services: {}
  },
  'institutions.service.spec.ts': {
    prisma: ['user', 'progress', 'certificate', 'appointment', 'document'],
    services: {}
  },
  'matches.service.spec.ts': {
    prisma: ['match', 'user', 'matchFeedback'],
    services: {}
  },
  'onboarding.service.spec.ts': {
    prisma: ['user', 'auditEvent', 'document'],
    services: {}
  },
  'stability.service.spec.ts': {
    prisma: ['user'],
    services: {}
  },
  'progress.service.spec.ts': {
    prisma: ['progress', 'task', 'user'],
    services: {}
  },
  'tasks.service.spec.ts': {
    prisma: ['task', 'progress'],
    services: {}
  },
  'users.controller.spec.ts': {
    prisma: ['user', 'skill'],
    services: {
      './users.service': ['usersService']
    }
  }
};

// Standard methods per Prisma model
const standardMethods = ['findMany', 'findUnique', 'findFirst', 'create', 'update', 'delete', 'count'];

function generatePrismaMock(models) {
  const mockObj = {};
  models.forEach(model => {
    mockObj[model] = {};
    standardMethods.forEach(method => {
      mockObj[model][method] = 'vi.fn()';
    });
  });
  
  const lines = [];
  lines.push('vi.mock(\'../../prismaClient\', () => ({');
  lines.push('  default: {');
  
  models.forEach((model, idx) => {
    lines.push(`    ${model}: {`);
    standardMethods.forEach((method, midx) => {
      const comma = midx < standardMethods.length - 1 ? ',' : '';
      lines.push(`      ${method}: vi.fn()${comma}`);
    });
    const comma = idx < models.length - 1 ? ',' : '';
    lines.push(`    }${comma}`);
  });
  
  lines.push('  },');
  lines.push('}));');
  
  return lines.join('\n');
}

function fixTestFile(filePath, config) {
  console.log(`\nFixing ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Remove old vi.mock() blocks
  content = content.replace(/vi\.mock\([^)]+\)[^;]*;(\n)?/gs, '');
  
  // 2. Find the first import statement
  const importMatch = content.match(/^(import\s+{[^}]+}\s+from\s+['"]vitest['"];?)/m);
  if (!importMatch) {
    console.error('Could not find vitest import!');
    return false;
  }
  
  // 3. Generate new mock
  const prismaMock = generatePrismaMock(config.prisma);
  
  // 4. Insert new mocks after vitest import
  const vitestImport = importMatch[0];
  const newContent = content.replace(
    vitestImport,
    `${vitestImport}\n\n${prismaMock}\n`
  );
  
  // 5. Fix all prisma.XxxxYyyy references to prisma.xxxx.yyyy
  let fixedContent = newContent;
  
  // Replace patterns like prisma.CertificateFindMany -> prisma.certificate.findMany
  const prismaCallPattern = /prisma\.([A-Z][a-z]+)([A-Z][a-z]+)/g;
  fixedContent = fixedContent.replace(prismaCallPattern, (match, model, method) => {
    const lowerModel = model.charAt(0).toLowerCase() + model.slice(1);
    const lowerMethod = method.charAt(0).toLowerCase() + method.slice(1);
    return `prisma.${lowerModel}.${lowerMethod}`;
  });
  
  fs.writeFileSync(filePath, fixedContent, 'utf8');
  console.log(`✓ Fixed ${path.basename(filePath)}`);
  return true;
}

// Process all files
console.log('Rebuilding all mock structures...\n');

Object.entries(mockConfigs).forEach(([filename, config]) => {
  const testPath = filename.includes('/') 
    ? path.join(__dirname, filename)
    : path.join(__dirname, 'src/modules', filename.replace('.service.spec.ts', '').replace('.controller.spec.ts', ''), filename);
  
  // Find the actual file
  const possiblePaths = [
    path.join(__dirname, 'src/modules/certificates', filename),
    path.join(__dirname, 'src/modules/appointments', filename),
    path.join(__dirname, 'src/modules/institutions', filename),
    path.join(__dirname, 'src/modules/matches', filename),
    path.join(__dirname, 'src/modules/onboarding', filename),
    path.join(__dirname, 'src/modules/progress', filename),
    path.join(__dirname, 'src/modules/tasks', filename),
    path.join(__dirname, 'src/modules/users', filename),
  ];
  
  const actualPath = possiblePaths.find(p => fs.existsSync(p));
  
  if (actualPath) {
    fixTestFile(actualPath, config);
  } else {
    console.error(`Could not find ${filename}`);
  }
});

console.log('\n✓ Done! All mock structures rebuilt.');
console.log('Run: npm test');
