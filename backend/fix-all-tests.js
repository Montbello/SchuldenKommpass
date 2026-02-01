const fs = require('fs');
const path = require('path');

// Map of test files and their prisma mock structure
const testConfigs = {
  'appointments.service.spec.ts': {
    prismaPath: '../../prismaClient',
    mockStructure: {
      appointment: ['findMany', 'findUnique', 'create', 'update', 'delete']
    }
  },
  'certificates.service.spec.ts': {
    prismaPath: '../../prismaClient',
    mockStructure: {
      certificate: ['findMany', 'findUnique', 'create'],
      auditEvent: ['create']
    }
  },
  'institutions.service.spec.ts': {
    prismaPath: '@prisma/client',
    isPrismaClient: true
  },
  'matches.service.spec.ts': {
    prismaPath: '../../prismaClient',
    mockStructure: {
      match: ['findMany', 'findUnique', 'findFirst', 'create', 'update'],
      skill: ['findMany'],
      task: ['findMany']
    }
  },
  'onboarding.service.spec.ts': {
    prismaPath: '../../prismaClient',
    mockStructure: {
      user: ['findUnique', 'update'],
      skill: ['deleteMany', 'createMany'],
      auditEvent: ['create']
    }
  },
  'stability.service.spec.ts': {
    prismaPath: '../../prismaClient',
    mockStructure: {
      user: ['findUnique', 'update'],
      auditEvent: ['create']
    }
  },
  'progress.service.spec.ts': {
    prismaPath: '../../prismaClient',
    mockStructure: {
      progress: ['findMany', 'findUnique', 'findFirst', 'create', 'update'],
      document: ['create']
    }
  },
  'tasks.service.spec.ts': {
    prismaPath: '../../prismaClient',
    mockStructure: {
      task: ['findMany', 'findUnique', 'create', 'update']
    }
  },
  'users.controller.spec.ts': {
    isController: true,
    servicePath: './users.service',
    mockStructure: {
      usersService: ['getUser', 'updateUser', 'getUserSkills', 'addSkill', 'deleteSkill']
    }
  }
};

function generateMockStructure(config) {
  if (config.isController) {
    // For controllers, mock the service
    const methods = config.mockStructure.usersService.map(m => `${m}: vi.fn()`).join(',\n      ');
    return `vi.mock('${config.servicePath}', () => ({
  usersService: {
      ${methods},
  },
}));`;
  }
  
  if (config.isPrismaClient) {
    // Special case for institutions that uses PrismaClient constructor
    return `vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    progress: {
      findMany: vi.fn(),
    },
    certificate: {
      findMany: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
    },
    document: {
      findMany: vi.fn(),
    },
  })),
}));`;
  }
  
  // For services with prisma
  const tables = Object.keys(config.mockStructure);
  const mockTables = tables.map(table => {
    const methods = config.mockStructure[table].map(m => `${m}: vi.fn()`).join(',\n      ');
    return `${table}: {\n      ${methods},\n    }`;
  }).join(',\n    ');
  
  return `vi.mock('${config.prismaPath}', () => ({
  ${config.prismaPath.includes('prisma') && !config.prismaPath.includes('@') ? 'prisma' : 'default'}: {
    ${mockTables},
  },
}));`;
}

function fixTestFile(filePath, fileName) {
  const config = testConfigs[fileName];
  if (!config) {
    console.log(`⚠️  No config for ${fileName}, skipping`);
    return;
  }
  
  console.log(`Processing ${fileName}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove old mock variable declarations
  content = content.replace(/^const mock\w+ = vi\.fn\(\);[\r\n]*/gm, '');
  
  // Find and replace the vi.mock block
  const mockBlockRegex = /vi\.mock\([^)]+\),?\s*\(\)\s*=>\s*[\(\{][\s\S]*?[\)\}]\);/;
  const newMockBlock = generateMockStructure(config);
  
  if (mockBlockRegex.test(content)) {
    content = content.replace(mockBlockRegex, newMockBlock);
  }
  
  // Replace mock variable calls with vi.mocked()
  // This is complex, so we do basic replacements
  if (!config.isController) {
    content = content.replace(/mock(\w+)\.mock/g, 'vi.mocked(prisma.$1).mock');
    content = content.replace(/expect\(mock(\w+)\)/g, 'expect(prisma.$1)');
  } else {
    // For controllers
    content = content.replace(/mock(\w+)\.mock/g, 'vi.mocked(usersService.$1).mock');
    content = content.replace(/expect\(mock(\w+)\)/g, 'expect(usersService.$1)');
  }
  
  // Fix beforeEach to use vi.clearAllMocks()
  if (content.includes('beforeEach')) {
    content = content.replace(/beforeEach\(\(\) => \{[\s\S]*?\}\);/g, (match) => {
      if (!match.includes('vi.clearAllMocks')) {
        return match.replace('beforeEach(() => {', 'beforeEach(() => {\n    vi.clearAllMocks();');
      }
      return match;
    });
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed ${fileName}`);
}

// Process all test files
const srcDir = path.join(__dirname, 'src');
const testFiles = [];

function findTestFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findTestFiles(filePath);
    } else if (file.endsWith('.spec.ts') && file !== 'users.service.spec.ts') {
      testFiles.push({ path: filePath, name: file });
    }
  });
}

findTestFiles(srcDir);

console.log(`Found ${testFiles.length} test files to fix\n`);

testFiles.forEach(({ path: filePath, name }) => {
  try {
    fixTestFile(filePath, name);
  } catch (error) {
    console.error(`✗ Error fixing ${name}:`, error.message);
  }
});

console.log('\n✓ All files processed!');
console.log('Run: npm test to verify fixes');
