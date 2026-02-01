import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../prismaClient', () => ({
  default: {
    task: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    progress: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    }
  },
}));




import { tasksService } from './tasks.service';
import prisma from '../../prismaClient';

describe('tasksService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
});

  describe('getTasks', () => {
    it('returns all active tasks', async () => {
      const mockTasks = [
        {
          task_id: 'task-1',
          title: 'Task 1',
          active: true,
          created_at: new Date('2024-02-01'),
          organisation: { organisation_id: 'org-1', name: 'Org 1' },
          created_by: { user_id: 'user-1', name: 'Creator', email: 'creator@example.com' },
        },
        {
          task_id: 'task-2',
          title: 'Task 2',
          active: true,
          created_at: new Date('2024-01-01'),
          organisation: { organisation_id: 'org-2', name: 'Org 2' },
          created_by: { user_id: 'user-2', name: 'Creator 2', email: 'creator2@example.com' },
        },
      ];

      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks);

      const result = await tasksService.getTasks();

      expect(result).toEqual(mockTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { active: true },
        include: {
          organisation: true,
          created_by: {
            select: { user_id: true, name: true, email: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    });

    it('filters tasks by skill', async () => {
      vi.mocked(prisma.task.findMany).mockResolvedValue([]);

      await tasksService.getTasks({ skill: 'Programming' });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true, required_skill: 'Programming' },
        })
      );
    });

    it('filters tasks by organisation', async () => {
      vi.mocked(prisma.task.findMany).mockResolvedValue([]);

      await tasksService.getTasks({ organisationId: 'org-1' });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true, organisationId: 'org-1' },
        })
      );
    });

    it('filters tasks by multiple criteria', async () => {
      vi.mocked(prisma.task.findMany).mockResolvedValue([]);

      await tasksService.getTasks({ skill: 'Programming', organisationId: 'org-1' });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true, required_skill: 'Programming', organisationId: 'org-1' },
        })
      );
    });
  });

  describe('getTask', () => {
    it('returns task with details', async () => {
      const mockTask = {
        task_id: 'task-1',
        title: 'Task 1',
        description: 'Description',
        active: true,
        organisation: { organisation_id: 'org-1', name: 'Org 1' },
        created_by: { user_id: 'user-1', name: 'Creator', email: 'creator@example.com' },
        matches: [],
        progresses: [],
      };

      vi.mocked(prisma.task.findUnique).mockResolvedValue(mockTask);

      const result = await tasksService.getTask('task-1');

      expect(result).toEqual(mockTask);
      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { task_id: 'task-1' },
        include: {
          organisation: true,
          created_by: {
            select: { user_id: true, name: true, email: true },
          },
          matches: true,
          progresses: true,
        },
      });
    });

    it('throws error when task not found', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue(null);

      await expect(tasksService.getTask('nonexistent')).rejects.toThrow('Task not found');
    });
  });

  describe('createTask', () => {
    it('creates task with minimal data', async () => {
      const mockTask = {
        task_id: 'task-1',
        title: 'New Task',
        active: true,
        organisation: null,
      };

      vi.mocked(prisma.task.create).mockResolvedValue(mockTask);

      const result = await tasksService.createTask({
        title: 'New Task',
      });

      expect(result).toEqual(mockTask);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'New Task',
          description: undefined,
          required_skill: undefined,
          estimated_time: undefined,
          createdById: undefined,
          organisationId: undefined,
          active: true,
        },
        include: { organisation: true },
      });
    });

    it('creates task with complete data', async () => {
      const mockTask = {
        task_id: 'task-1',
        title: 'New Task',
        description: 'Task description',
        required_skill: 'Programming',
        estimated_time: 120,
        createdById: 'user-1',
        organisationId: 'org-1',
        active: true,
        organisation: { organisation_id: 'org-1', name: 'Org 1' },
      };

      vi.mocked(prisma.task.create).mockResolvedValue(mockTask);

      const result = await tasksService.createTask({
        title: 'New Task',
        description: 'Task description',
        required_skill: 'Programming',
        estimated_time: 120,
        createdById: 'user-1',
        organisationId: 'org-1',
      });

      expect(result).toEqual(mockTask);
    });
  });

  describe('updateTask', () => {
    it('updates task fields', async () => {
      const mockTask = {
        task_id: 'task-1',
        title: 'Updated Task',
        description: 'Updated description',
        active: true,
      };

      vi.mocked(prisma.task.update).mockResolvedValue(mockTask);

      const result = await tasksService.updateTask('task-1', {
        title: 'Updated Task',
        description: 'Updated description',
      });

      expect(result).toEqual(mockTask);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { task_id: 'task-1' },
        data: {
          title: 'Updated Task',
          description: 'Updated description',
        },
      });
    });

    it('can toggle active status', async () => {
      const mockTask = {
        task_id: 'task-1',
        title: 'Task',
        active: false,
      };

      vi.mocked(prisma.task.update).mockResolvedValue(mockTask);

      await tasksService.updateTask('task-1', { active: false });

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { task_id: 'task-1' },
        data: { active: false },
      });
    });
  });

  describe('deactivateTask', () => {
    it('sets task to inactive', async () => {
      const mockTask = {
        task_id: 'task-1',
        title: 'Task',
        active: false,
      };

      vi.mocked(prisma.task.update).mockResolvedValue(mockTask);

      const result = await tasksService.deactivateTask('task-1');

      expect(result.active).toBe(false);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { task_id: 'task-1' },
        data: { active: false },
      });
    });
  });
});
