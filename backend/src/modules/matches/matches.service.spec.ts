import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../prismaClient', () => ({
  default: {
    match: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    matchFeedback: {
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




import { matchesService } from './matches.service';
import prisma from '../../prismaClient';

describe('matchesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
});

  describe('getMatches', () => {
    it('returns matches for user ordered by assignment date', async () => {
      const mockMatches = [
        {
          match_id: 'match-1',
          userId: 'user-1',
          taskId: 'task-1',
          score: 0.9,
          status: 'pending',
          assigned_at: new Date('2024-02-01'),
          task: { task_id: 'task-1', title: 'Task 1' },
        },
        {
          match_id: 'match-2',
          userId: 'user-1',
          taskId: 'task-2',
          score: 0.8,
          status: 'accepted',
          assigned_at: new Date('2024-01-01'),
          task: { task_id: 'task-2', title: 'Task 2' },
        },
      ];

      vi.mocked(prisma.match.findMany).mockResolvedValue(mockMatches);

      const result = await matchesService.getMatches('user-1');

      expect(result).toEqual(mockMatches);
      expect(prisma.match.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { task: true },
        orderBy: { assigned_at: 'desc' },
      });
    });
  });

  describe('getMatch', () => {
    it('returns match with task and user details', async () => {
      const mockMatch = {
        match_id: 'match-1',
        userId: 'user-1',
        taskId: 'task-1',
        score: 0.9,
        status: 'pending',
        task: { task_id: 'task-1', title: 'Task 1' },
        user: { user_id: 'user-1', name: 'Test User' },
      };

      vi.mocked(prisma.match.findUnique).mockResolvedValue(mockMatch);

      const result = await matchesService.getMatch('match-1');

      expect(result).toEqual(mockMatch);
      expect(prisma.match.findUnique).toHaveBeenCalledWith({
        where: { match_id: 'match-1' },
        include: { task: true, user: true },
      });
    });

    it('throws error when match not found', async () => {
      vi.mocked(prisma.match.findUnique).mockResolvedValue(null);

      await expect(matchesService.getMatch('nonexistent')).rejects.toThrow('Match not found');
    });
  });

  describe('createMatch', () => {
    it('creates new match with default score', async () => {
      const mockMatch = {
        match_id: 'match-1',
        userId: 'user-1',
        taskId: 'task-1',
        score: 0.5,
        status: 'pending',
        task: { task_id: 'task-1', title: 'Task 1' },
      };

      vi.mocked(prisma.match.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.match.create).mockResolvedValue(mockMatch);

      const result = await matchesService.createMatch({
        userId: 'user-1',
        taskId: 'task-1',
      });

      expect(result).toEqual(mockMatch);
      expect(prisma.match.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          taskId: 'task-1',
          score: 0.5,
          status: 'pending',
        },
        include: { task: true },
      });
    });

    it('creates match with custom score', async () => {
      const mockMatch = {
        match_id: 'match-1',
        userId: 'user-1',
        taskId: 'task-1',
        score: 0.9,
        status: 'pending',
        task: { task_id: 'task-1', title: 'Task 1' },
      };

      vi.mocked(prisma.match.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.match.create).mockResolvedValue(mockMatch);

      const result = await matchesService.createMatch({
        userId: 'user-1',
        taskId: 'task-1',
        score: 0.9,
      });

      expect(result.score).toBe(0.9);
    });

    it('throws error when match already exists', async () => {
      const existingMatch = {
        match_id: 'match-1',
        userId: 'user-1',
        taskId: 'task-1',
      };

      vi.mocked(prisma.match.findFirst).mockResolvedValue(existingMatch);

      await expect(
        matchesService.createMatch({
          userId: 'user-1',
          taskId: 'task-1',
        })
      ).rejects.toThrow('Match already exists');
    });
  });

  describe('updateMatchStatus', () => {
    it('updates match status when authorized', async () => {
      const mockMatch = {
        match_id: 'match-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'pending',
      };

      const updatedMatch = {
        ...mockMatch,
        status: 'accepted',
        task: { task_id: 'task-1', title: 'Task 1' },
      };

      vi.mocked(prisma.match.findUnique).mockResolvedValue(mockMatch);
      vi.mocked(prisma.match.update).mockResolvedValue(updatedMatch);

      const result = await matchesService.updateMatchStatus('match-1', 'user-1', 'accepted');

      expect(result.status).toBe('accepted');
      expect(prisma.match.update).toHaveBeenCalledWith({
        where: { match_id: 'match-1' },
        data: { status: 'accepted' },
        include: { task: true },
      });
    });

    it('throws error when match not found', async () => {
      vi.mocked(prisma.match.findUnique).mockResolvedValue(null);

      await expect(
        matchesService.updateMatchStatus('nonexistent', 'user-1', 'accepted')
      ).rejects.toThrow('Match not found');
    });

    it('throws error when user not authorized', async () => {
      const mockMatch = {
        match_id: 'match-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'pending',
      };

      vi.mocked(prisma.match.findUnique).mockResolvedValue(mockMatch);

      await expect(
        matchesService.updateMatchStatus('match-1', 'other-user', 'accepted')
      ).rejects.toThrow('Not authorized');
    });

    it('throws error for invalid status', async () => {
      const mockMatch = {
        match_id: 'match-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'pending',
      };

      vi.mocked(prisma.match.findUnique).mockResolvedValue(mockMatch);

      await expect(
        matchesService.updateMatchStatus('match-1', 'user-1', 'invalid')
      ).rejects.toThrow('Invalid status');
    });

    it('accepts valid status transitions', async () => {
      const mockMatch = {
        match_id: 'match-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'pending',
      };

      vi.mocked(prisma.match.findUnique).mockResolvedValue(mockMatch);
      vi.mocked(prisma.match.update).mockResolvedValue({ ...mockMatch, status: 'completed' });

      const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];

      for (const status of validStatuses) {
        vi.mocked(prisma.match.findUnique).mockResolvedValue(mockMatch);
        await expect(
          matchesService.updateMatchStatus('match-1', 'user-1', status)
        ).resolves.toBeTruthy();
      }
    });
  });

  describe('adminUpdateMatch', () => {
    it('updates match status and score', async () => {
      const updatedMatch = {
        match_id: 'match-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'completed',
        score: 0.95,
        task: { task_id: 'task-1', title: 'Task 1' },
      };

      vi.mocked(prisma.match.update).mockResolvedValue(updatedMatch);

      const result = await matchesService.adminUpdateMatch('match-1', {
        status: 'completed',
        score: 0.95,
      });

      expect(result.status).toBe('completed');
      expect(result.score).toBe(0.95);
      expect(prisma.match.update).toHaveBeenCalledWith({
        where: { match_id: 'match-1' },
        data: { status: 'completed', score: 0.95 },
        include: { task: true },
      });
    });
  });

  describe('generateMatches', () => {
    it('generates matches for user skills', async () => {
      const mockSkills = [
        { skill_id: 'skill-1', userId: 'user-1', category: 'Programming' },
        { skill_id: 'skill-2', userId: 'user-1', category: 'Communication' },
      ];

      const mockTasks = [
        { task_id: 'task-1', title: 'Task 1', required_skill: 'Programming', active: true },
        { task_id: 'task-2', title: 'Task 2', required_skill: 'Communication', active: true },
      ];

      const mockMatch = {
        match_id: 'match-1',
        userId: 'user-1',
        taskId: 'task-1',
        score: 0.9,
        status: 'pending',
        task: mockTasks[0],
      };

      vi.mocked(prisma.skill.findMany).mockResolvedValue(mockSkills);
      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks);
      vi.mocked(prisma.match.findMany).mockResolvedValue([]);
      vi.mocked(prisma.match.create).mockResolvedValue(mockMatch);

      const result = await matchesService.generateMatches('user-1');

      expect(result.length).toBeGreaterThan(0);
      expect(prisma.skill.findMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          active: true,
          required_skill: { in: ['Programming', 'Communication'] },
        },
      });
    });

    it('returns empty array when user has no skills', async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue([]);

      const result = await matchesService.generateMatches('user-1');

      expect(result).toEqual([]);
      expect(prisma.task.findMany).not.toHaveBeenCalled();
    });

    it('does not create duplicate matches', async () => {
      const mockSkills = [
        { skill_id: 'skill-1', userId: 'user-1', category: 'Programming' },
      ];

      const mockTasks = [
        { task_id: 'task-1', title: 'Task 1', required_skill: 'Programming', active: true },
      ];

      const existingMatches = [
        { taskId: 'task-1' },
      ];

      vi.mocked(prisma.skill.findMany).mockResolvedValue(mockSkills);
      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks);
      vi.mocked(prisma.match.findMany).mockResolvedValue(existingMatches);

      const result = await matchesService.generateMatches('user-1');

      expect(result).toEqual([]);
      expect(prisma.match.create).not.toHaveBeenCalled();
    });

    it('assigns scores between 80-100%', async () => {
      const mockSkills = [
        { skill_id: 'skill-1', userId: 'user-1', category: 'Programming' },
      ];

      const mockTasks = [
        { task_id: 'task-1', title: 'Task 1', required_skill: 'Programming', active: true },
      ];

      vi.mocked(prisma.skill.findMany).mockResolvedValue(mockSkills);
      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks);
      vi.mocked(prisma.match.findMany).mockResolvedValue([]);
      
      let capturedScore: number | undefined;
      vi.mocked(prisma.match.create).mockImplementation(async ({ data }: any) => {
        capturedScore = data.score;
        return {
          match_id: 'match-1',
          userId: data.userId,
          taskId: data.taskId,
          score: data.score,
          status: data.status,
          task: mockTasks[0],
        };
      });

      await matchesService.generateMatches('user-1');

      expect(capturedScore).toBeGreaterThanOrEqual(0.8);
      expect(capturedScore).toBeLessThanOrEqual(1.0);
    });
  });
});
