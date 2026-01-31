import prisma from '../../prismaClient';

export const matchesService = {
  // Get matches for a user
  async getMatches(userId: string) {
    return prisma.match.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { assigned_at: 'desc' },
    });
  },

  // Get single match
  async getMatch(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { match_id: matchId },
      include: { task: true, user: true },
    });
    if (!match) throw new Error('Match not found');
    return match;
  },

  // Create a match (System/Admin)
  async createMatch(data: {
    userId: string;
    taskId: string;
    score?: number;
  }) {
    const score = data.score ?? 0.5;
    // Check if match already exists
    const existing = await prisma.match.findFirst({
      where: {
        userId: data.userId,
        taskId: data.taskId,
      },
    });
    if (existing) throw new Error('Match already exists');

    return prisma.match.create({
      data: {
        userId: data.userId,
        taskId: data.taskId,
        score,
        status: 'pending',
      },
      include: { task: true },
    });
  },

  // Update match status
  async updateMatchStatus(matchId: string, userId: string, status: string) {
    // Verify the match belongs to the user
    const match = await prisma.match.findUnique({ where: { match_id: matchId } });
    if (!match) throw new Error('Match not found');
    if (match.userId !== userId) throw new Error('Not authorized');

    // Valid status transitions
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    return prisma.match.update({
      where: { match_id: matchId },
      data: { status },
      include: { task: true },
    });
  },

  // Admin: Update any match
  async adminUpdateMatch(matchId: string, data: { status?: string; score?: number }) {
    return prisma.match.update({
      where: { match_id: matchId },
      data,
      include: { task: true },
    });
  },

  // Simple matching algorithm - find tasks matching user skills
  async generateMatches(userId: string) {
    // Get user skills
    const skills = await prisma.skill.findMany({ where: { userId } });
    const skillCategories = skills.map(s => s.category);

    if (skillCategories.length === 0) {
      return [];
    }

    // Find active tasks matching any user skill
    const tasks = await prisma.task.findMany({
      where: {
        active: true,
        required_skill: { in: skillCategories },
      },
    });

    // Create matches for tasks not already matched
    const existingMatches = await prisma.match.findMany({
      where: { userId },
      select: { taskId: true },
    });
    const existingTaskIds = new Set(existingMatches.map(m => m.taskId));

    const newMatches = [];
    for (const task of tasks) {
      if (!existingTaskIds.has(task.task_id)) {
        // Calculate simple score based on skill match
        const score = 0.8 + Math.random() * 0.2; // 80-100% for demo
        
        const match = await prisma.match.create({
          data: {
            userId,
            taskId: task.task_id,
            score,
            status: 'pending',
          },
          include: { task: true },
        });
        newMatches.push(match);
      }
    }

    return newMatches;
  },
};
