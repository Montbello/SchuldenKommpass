const fs = require('fs');
const path = require('path');

// Mapping of old mock variable names to new prisma paths
const mockMappings = {
  // Appointments
  'mockAppointmentFindMany': 'prisma.appointment.findMany',
  'mockAppointmentFindUnique': 'prisma.appointment.findUnique',
  'mockAppointmentCreate': 'prisma.appointment.create',
  'mockAppointmentUpdate': 'prisma.appointment.update',
  'mockAppointmentDelete': 'prisma.appointment.delete',
  
  // Certificates
  'mockCertificateFindMany': 'prisma.certificate.findMany',
  'mockCertificateFindUnique': 'prisma.certificate.findUnique',
  'mockCertificateCreate': 'prisma.certificate.create',
  'mockAuditEventCreate': 'prisma.auditEvent.create',
  'mockGenerateCertificateToken': 'unlockService.generateCertificateToken',
  'mockVerifyCertificateToken': 'unlockService.verifyCertificateToken',
  'mockGetLevelProgress': 'unlockService.getLevelProgress',
  
  // Matches
  'mockMatchFindMany': 'prisma.match.findMany',
  'mockMatchFindUnique': 'prisma.match.findUnique',
  'mockMatchFindFirst': 'prisma.match.findFirst',
  'mockMatchCreate': 'prisma.match.create',
  'mockMatchUpdate': 'prisma.match.update',
  'mockSkillFindMany': 'prisma.skill.findMany',
  'mockTaskFindMany': 'prisma.task.findMany',
  
  // Onboarding
  'mockUserFindUnique': 'prisma.user.findUnique',
  'mockUserUpdate': 'prisma.user.update',
  'mockSkillDeleteMany': 'prisma.skill.deleteMany',
  'mockSkillCreateMany': 'prisma.skill.createMany',
  'mockRunAndUpdateStatus': 'stabilityService.runAndUpdateStatus',
  
  // Progress
  'mockProgressFindMany': 'prisma.progress.findMany',
  'mockProgressFindUnique': 'prisma.progress.findUnique',
  'mockProgressFindFirst': 'prisma.progress.findFirst',
  'mockProgressCreate': 'prisma.progress.create',
  'mockProgressUpdate': 'prisma.progress.update',
  'mockDocumentCreate': 'prisma.document.create',
  'mockAwardPoints': 'unlockService.awardPoints',
  
  // Tasks
  'mockTaskFindUnique': 'prisma.task.findUnique',
  'mockTaskCreate': 'prisma.task.create',
  'mockTaskUpdate': 'prisma.task.update',
  
  // Users Controller
  'mockGetUser': 'usersService.getUser',
  'mockUpdateUser': 'usersService.updateUser',
  'mockGetUserSkills': 'usersService.getUserSkills',
  'mockAddSkill': 'usersService.addSkill',
  'mockDeleteSkill': 'usersService.deleteSkill',
  
  // Institutions
  'mockUserFindMany': 'prisma.user.findMany',
  'mockUserFindFirst': 'prisma.user.findFirst',
  'mockUserCount': 'prisma.user.count',
  'mockProgressFindMany': 'prisma.progress.findMany',
  'mockCertificateFindMany': 'prisma.certificate.findMany',
};

function fixMockReferences(content) {
  let fixed = content;
  
  // Replace all mock variable references
  Object.entries(mockMappings).forEach(([oldMock, newPath]) => {
    // Replace mockXxx.mockResolvedValue(...) with vi.mocked(path).mockResolvedValue(...)
    const regex1 = new RegExp(`${oldMock}\\.mock`, 'g');
    fixed = fixed.replace(regex1, `vi.mocked(${newPath}).mock`);
    
    // Replace expect(mockXxx) with expect(path)
    const regex2 = new RegExp(`expect\\(${oldMock}\\)`, 'g');
    fixed = fixed.replace(regex2, `expect(${newPath})`);
  });
  
  // Add missing imports if needed
  if (fixed.includes('vi.mocked(prisma.') && !fixed.includes('import prisma from')) {
    // Add prisma import after service import
    fixed = fixed.replace(
      /(import \{ \w+Service \} from '\.\/\w+\.service';)/,
      "$1\nimport prisma from '../../prismaClient';"
    );
  }
  
  if (fixed.includes('stabilityService.') && !fixed.includes("import { stabilityService }")) {
    fixed = fixed.replace(
      /(import \{ onboardingService \} from '\.\/onboarding\.service';)/,
      "$1\n// Note: stabilityService mock needs to be added"
    );
  }
  
  return fixed;
}

// Process all test files
const srcDir = path.join(__dirname, 'src');

function findAndFixTestFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findAndFixTestFiles(filePath);
    } else if (file.endsWith('.spec.ts')) {
      console.log(`Processing ${file}...`);
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const fixed = fixMockReferences(content);
        
        if (content !== fixed) {
          fs.writeFileSync(filePath, fixed, 'utf8');
          console.log(`✓ Fixed mock references in ${file}`);
        } else {
          console.log(`- No changes needed in ${file}`);
        }
      } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message);
      }
    }
  });
}

console.log('Fixing mock references in test files...\n');
findAndFixTestFiles(srcDir);
console.log('\n✓ Done! Run npm test to verify.');
