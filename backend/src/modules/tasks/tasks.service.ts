import prisma from '../../prismaClient';

export const tasksService = {
  // Get all active tasks (with optional filters)
  async getTasks(filters?: { skill?: string; organisationId?: string }) {
    const where: any = { active: true };
    
    if (filters?.skill) {
      where.required_skill = filters.skill;
    }
    
    if (filters?.organisationId) {
      where.organisationId = filters.organisationId;
    }

    return prisma.task.findMany({
      where,
      include: {
        organisation: true,  // Include Organisation data
        created_by: {
          select: { user_id: true, name: true, email: true }
        }
      },
      orderBy: { created_at: 'desc' },
    });
  },

  // Get single task by ID
  async getTask(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { task_id: taskId },
      include: {
        organisation: true,
        created_by: {
          select: { user_id: true, name: true, email: true }
        },
        matches: true,
        progresses: true,
      },
    });
    if (!task) throw new Error('Task not found');
    return task;
  },

  // Create a new task (Admin/Partner only)
  async createTask(data: {
    title: string;
    description?: string;
    required_skill?: string;
    estimated_time?: number;
    createdById?: string;
    organisationId?: string;  // NEW: Link to Organisation
  }) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        required_skill: data.required_skill,
        estimated_time: data.estimated_time,
        createdById: data.createdById,
        organisationId: data.organisationId,
        active: true,
      },
      include: { organisation: true },
    });
  },

  // Update task
  async updateTask(taskId: string, data: {
    title?: string;
    description?: string;
    required_skill?: string;
    estimated_time?: number;
    active?: boolean;
  }) {
    return prisma.task.update({
      where: { task_id: taskId },
      data,
    });
  },

  // Deactivate task (soft delete)
  async deactivateTask(taskId: string) {
    return prisma.task.update({
      where: { task_id: taskId },
      data: { active: false },
    });
  },
};
