const fs = require('fs');
const path = require('path');

const testFiles = [
  'src/modules/certificates/certificates.service.spec.ts',
  'src/modules/appointments/appointments.service.spec.ts',
  'src/modules/institutions/institutions.service.spec.ts',
  'src/modules/matches/matches.service.spec.ts',
  'src/modules/onboarding/onboarding.service.spec.ts',
  'src/modules/onboarding/stability.service.spec.ts',
  'src/modules/progress/progress.service.spec.ts',
  'src/modules/tasks/tasks.service.spec.ts',
  'src/modules/users/users.controller.spec.ts',
];

testFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  console.log(`Processing ${file}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all mock variables with vi.fn() in vi.mock() blocks
  // Match pattern like: someName: mockSomething,
  content = content.replace(/(\w+):\s*mock[A-Z]\w+,/g, '$1: vi.fn(),');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed ${file}`);
});

console.log('\n✓ All files fixed!');
