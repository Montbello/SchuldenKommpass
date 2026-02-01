import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../prismaClient', () => ({
  default: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    skill: {
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

import { Request, Response, NextFunction } from 'express';

// Mock the service
vi.mock('./users.service', () => ({
  usersService: {
    getUser: vi.fn(),
    updateUser: vi.fn(),
    getUserSkills: vi.fn(),
    addSkill: vi.fn(),
    deleteSkill: vi.fn(),
    updateSkill: vi.fn(),
  },
}));

import { usersController } from './users.controller';
import { usersService } from './users.service';

describe('usersController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
mockReq = {
      params: {},
      body: {},
      user: undefined,
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();

    });

  describe('getUser', () => {
    it('returns user data for valid id', async () => {
      const mockUser = {
        user_id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        skills: [],
      };

      mockReq.params = { id: 'user-1' };
      vi.mocked(usersService.getUser).mockResolvedValue(mockUser);

      await usersController.getUser(mockReq as Request, mockRes as Response, mockNext);

      expect(usersService.getUser).toHaveBeenCalledWith('user-1');
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it('calls next with error when service throws', async () => {
      mockReq.params = { id: 'user-1' };
      const error = new Error('User not found');
      vi.mocked(usersService.getUser).mockRejectedValue(error);

      await usersController.getUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUser', () => {
    it('updates user when authorized', async () => {
      const mockUser = {
        user_id: 'user-1',
        email: 'test@example.com',
        name: 'Updated Name',
        skills: [],
      };

      mockReq.params = { id: 'user-1' };
      mockReq.body = { name: 'Updated Name' };
      mockReq.user = { user_id: 'user-1', role: 'USER' } as any;
      vi.mocked(usersService.updateUser).mockResolvedValue(mockUser);

      await usersController.updateUser(mockReq as Request, mockRes as Response, mockNext);

      expect(usersService.updateUser).toHaveBeenCalledWith('user-1', { name: 'Updated Name', date_of_birth: undefined });
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it('allows admin to update any user', async () => {
      const mockUser = {
        user_id: 'other-user',
        email: 'other@example.com',
        name: 'Updated Name',
        skills: [],
      };

      mockReq.params = { id: 'other-user' };
      mockReq.body = { name: 'Updated Name' };
      mockReq.user = { user_id: 'admin-1', role: 'ADMIN' } as any;
      vi.mocked(usersService.updateUser).mockResolvedValue(mockUser);

      await usersController.updateUser(mockReq as Request, mockRes as Response, mockNext);

      expect(usersService.updateUser).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it('returns 401 when user not authenticated', async () => {
      mockReq.params = { id: 'user-1' };
      mockReq.body = { name: 'Updated Name' };
      mockReq.user = undefined;

      await usersController.updateUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('returns 403 when user tries to update other user profile', async () => {
      mockReq.params = { id: 'other-user' };
      mockReq.body = { name: 'Updated Name' };
      mockReq.user = { user_id: 'user-1', role: 'USER' } as any;

      await usersController.updateUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized' });
    });

    it('converts date_of_birth string to Date', async () => {
      const mockUser = {
        user_id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        date_of_birth: new Date('1990-01-01'),
        skills: [],
      };

      mockReq.params = { id: 'user-1' };
      mockReq.body = { date_of_birth: '1990-01-01T00:00:00.000Z' };
      mockReq.user = { user_id: 'user-1', role: 'USER' } as any;
      vi.mocked(usersService.updateUser).mockResolvedValue(mockUser);

      await usersController.updateUser(mockReq as Request, mockRes as Response, mockNext);

      expect(usersService.updateUser).toHaveBeenCalledWith('user-1', {
        date_of_birth: new Date('1990-01-01T00:00:00.000Z'),
      });
    });
  });

  describe('getUserSkills', () => {
    it('returns user skills', async () => {
      const mockSkills = [
        { skill_id: 'skill-1', userId: 'user-1', category: 'Programming' },
      ];

      mockReq.params = { id: 'user-1' };
      vi.mocked(usersService.getUserSkills).mockResolvedValue(mockSkills);

      await usersController.getUserSkills(mockReq as Request, mockRes as Response, mockNext);

      expect(usersService.getUserSkills).toHaveBeenCalledWith('user-1');
      expect(mockRes.json).toHaveBeenCalledWith(mockSkills);
    });

    it('returns 400 when service throws error', async () => {
      mockReq.params = { id: 'user-1' };
      const error = new Error('Database error');
      vi.mocked(usersService.getUserSkills).mockRejectedValue(error);

      await usersController.getUserSkills(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('addSkill', () => {
    it('adds skill for authenticated user', async () => {
      const mockSkill = {
        skill_id: 'skill-1',
        userId: 'user-1',
        category: 'Programming',
        description: 'TypeScript',
      };

      mockReq.body = { category: 'Programming', description: 'TypeScript' };
      mockReq.user = { user_id: 'user-1' } as any;
      vi.mocked(usersService.addSkill).mockResolvedValue(mockSkill);

      await usersController.addSkill(mockReq as Request, mockRes as Response, mockNext);

      expect(usersService.addSkill).toHaveBeenCalledWith('user-1', {
        category: 'Programming',
        description: 'TypeScript',
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockSkill);
    });

    it('returns 401 when user not authenticated', async () => {
      mockReq.body = { category: 'Programming' };
      mockReq.user = undefined;

      await usersController.addSkill(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('returns 400 on service error', async () => {
      mockReq.body = { category: 'Programming' };
      mockReq.user = { user_id: 'user-1' } as any;
      const error = new Error('Invalid category');
      vi.mocked(usersService.addSkill).mockRejectedValue(error);

      await usersController.addSkill(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid category' });
    });
  });

  describe('deleteSkill', () => {
    it('deletes skill for authenticated user', async () => {
      mockReq.params = { id: 'skill-1' };
      mockReq.user = { user_id: 'user-1' } as any;
      vi.mocked(usersService.deleteSkill).mockResolvedValue({ success: true });

      await usersController.deleteSkill(mockReq as Request, mockRes as Response, mockNext);

      expect(usersService.deleteSkill).toHaveBeenCalledWith('skill-1', 'user-1');
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Skill deleted' });
    });

    it('returns 401 when user not authenticated', async () => {
      mockReq.params = { id: 'skill-1' };
      mockReq.user = undefined;

      await usersController.deleteSkill(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('calls next with error on service error', async () => {
      mockReq.params = { id: 'skill-1' };
      mockReq.user = { user_id: 'user-1' } as any;
      const error = new Error('Not authorized to delete this skill');
      vi.mocked(usersService.deleteSkill).mockRejectedValue(error);

      await usersController.deleteSkill(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
