import prisma from '../../prismaClient';

export const usersService = {
  // Get user by ID with skills
  async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      include: { skills: true },
    });
    if (!user) throw new Error('User not found');
    
    // Remove password hash
    const { password_hash: _pw, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Update user profile
  async updateUser(userId: string, data: {
    name?: string;
    date_of_birth?: Date;
    disabilities?: any;
    consent_data_sharing?: boolean;
  }) {
    const user = await prisma.user.update({
      where: { user_id: userId },
      data: {
        name: data.name,
        date_of_birth: data.date_of_birth,
        disabilities: data.disabilities,
        consent_data_sharing: data.consent_data_sharing,
      } as any,
      include: { skills: true },
    });
    
    const { password_hash: _pw, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Get user's skills
  async getUserSkills(userId: string) {
    return prisma.skill.findMany({
      where: { userId },
      orderBy: { created_at: 'desc' },
    });
  },

  // Add a skill
  async addSkill(userId: string, data: { category: string; description?: string }) {
    return prisma.skill.create({
      data: {
        userId,
        category: data.category,
        description: data.description,
      },
    });
  },

  // Delete a skill
  async deleteSkill(skillId: string, userId: string) {
    // Verify ownership
    const skill = await prisma.skill.findUnique({ where: { skill_id: skillId } });
    if (!skill) throw new Error('Skill not found');
    if (skill.userId !== userId) throw new Error('Not authorized to delete this skill');

    await prisma.skill.delete({ where: { skill_id: skillId } });
    return { success: true };
  },

  // Update skill (e.g., verify)
  async updateSkill(skillId: string, data: { verified?: boolean; description?: string }) {
    return prisma.skill.update({
      where: { skill_id: skillId },
      data,
    });
  },
};
