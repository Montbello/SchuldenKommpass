const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/modules/users/users.controller.spec.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Fix PascalCase method names to camelCase
content = content.replace(/usersService\.GetUser/g, 'usersService.getUser');
content = content.replace(/usersService\.UpdateUser/g, 'usersService.updateUser');
content = content.replace(/usersService\.GetUserSkills/g, 'usersService.getUserSkills');
content = content.replace(/usersService\.AddSkill/g, 'usersService.addSkill');
content = content.replace(/usersService\.DeleteSkill/g, 'usersService.deleteSkill');
content = content.replace(/usersService\.UpdateSkill/g, 'usersService.updateSkill');

// Fix wrong method names like "usersService.Next"
content = content.replace(/usersService\.Next/g, 'mockNext');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Fixed users.controller.spec.ts');
