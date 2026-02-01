import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../prismaClient', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    skill: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { usersService } from './users.service';
import prisma from '../../prismaClient';

describe('usersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUser', () => {
    it('returns user without password hash', async () => {
      const mockUser = {
        user_id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'secret-hash',
        role: 'USER',
        status: 'ACTIVE',
        skills: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await usersService.getUser('user-1');

      expect(result.user_id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
      expect((result as any).password_hash).toBeUndefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        include: { skills: true },
      });
    });

    it('throws error when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(usersService.getUser('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('updateUser', () => {
    it('updates user profile and removes password hash', async () => {
      const mockUser = {
        user_id: 'user-1',
        email: 'test@example.com',
        name: 'Updated Name',
        password_hash: 'secret-hash',
        role: 'USER',
        status: 'ACTIVE',
        skills: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

      const result = await usersService.updateUser('user-1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect((result as any).password_hash).toBeUndefined();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        data: {
          name: 'Updated Name',
          date_of_birth: undefined,
          disabilities: undefined,
          consent_data_sharing: undefined,
        },
        include: { skills: true },
      });
    });

    it('updates multiple fields', async () => {
      const dateOfBirth = new Date('1990-01-01');
      const mockUser = {
        user_id: 'user-1',
        email: 'test@example.com',
        name: 'Updated Name',
        date_of_birth: dateOfBirth,
        consent_data_sharing: true,
        password_hash: 'secret-hash',
        role: 'USER',
        status: 'ACTIVE',
        skills: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

      const result = await usersService.updateUser('user-1', {
        name: 'Updated Name',
        date_of_birth: dateOfBirth,
        consent_data_sharing: true,
      });

      expect(result.name).toBe('Updated Name');
      expect(result.consent_data_sharing).toBe(true);
    });
  });

  describe('getUserSkills', () => {
    it('returns user skills ordered by creation date', async () => {
      const mockSkills = [
        { skill_id: 'skill-1', userId: 'user-1', category: 'Programming', description: 'JavaScript', created_at: new Date('2024-02-01') },
        { skill_id: 'skill-2', userId: 'user-1', category: 'Design', description: 'UI/UX', created_at: new Date('2024-01-01') },
      ];

      vi.mocked(prisma.skill.findMany).mockResolvedValue(mockSkills as any);

      const result = await usersService.getUserSkills('user-1');

      expect(result).toEqual(mockSkills);
      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { created_at: 'desc' },
      });
    });

    it('returns empty array when user has no skills', async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue([]);

      const result = await usersService.getUserSkills('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('addSkill', () => {
    it('creates a new skill for user', async () => {
      const mockSkill = {
        skill_id: 'skill-1',
        userId: 'user-1',
        category: 'Programming',
        description: 'TypeScript',
        verified: false,
        created_at: new Date(),
      };

      vi.mocked(prisma.skill.create).mockResolvedValue(mockSkill as any);

      const result = await usersService.addSkill('user-1', {
        category: 'Programming',
        description: 'TypeScript',
      });

      expect(result).toEqual(mockSkill);
      expect(prisma.skill.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          category: 'Programming',
          description: 'TypeScript',
        },
      });
    });

    it('creates skill without description', async () => {
      const mockSkill = {
        skill_id: 'skill-1',
        userId: 'user-1',
        category: 'Communication',
        description: undefined,
        verified: false,
        created_at: new Date(),
      };

      vi.mocked(prisma.skill.create).mockResolvedValue(mockSkill as any);

      const result = await usersService.addSkill('user-1', {
        category: 'Communication',
      });

      expect(result.category).toBe('Communication');
    });
  });

  describe('deleteSkill', () => {
    it('deletes skill when user owns it', async () => {
      const mockSkill = {
        skill_id: 'skill-1',
        userId: 'user-1',
        category: 'Programming',
      };

      vi.mocked(prisma.skill.findUnique).mockResolvedValue(mockSkill as any);
      vi.mocked(prisma.skill.delete).mockResolvedValue(mockSkill as any);

      const result = await usersService.deleteSkill('skill-1', 'user-1');

      expect(result.success).toBe(true);
      expect(prisma.skill.findUnique).toHaveBeenCalledWith({ where: { skill_id: 'skill-1' } });
      expect(prisma.skill.delete).toHaveBeenCalledWith({ where: { skill_id: 'skill-1' } });
    });

    it('throws error when skill not found', async () => {
      vi.mocked(prisma.skill.findUnique).mockResolvedValue(null);

      await expect(usersService.deleteSkill('nonexistent', 'user-1')).rejects.toThrow('Skill not found');
    });

    it('throws error when user does not own skill', async () => {
      const mockSkill = {
        skill_id: 'skill-1',
        userId: 'other-user',
        category: 'Programming',
      };

      vi.mocked(prisma.skill.findUnique).mockResolvedValue(mockSkill as any);

      await expect(usersService.deleteSkill('skill-1', 'user-1')).rejects.toThrow('Not authorized to delete this skill');
    });
  });

  describe('updateSkill', () => {
    it('updates skill verification status', async () => {
      const mockSkill = {
        skill_id: 'skill-1',
        userId: 'user-1',
        category: 'Programming',
        verified: true,
        created_at: new Date(),
      };

      vi.mocked(prisma.skill.update).mockResolvedValue(mockSkill as any);

      const result = await usersService.updateSkill('skill-1', { verified: true });

      expect(result.verified).toBe(true);
      expect(prisma.skill.update).toHaveBeenCalledWith({
        where: { skill_id: 'skill-1' },
        data: { verified: true },
      });
    });

    it('updates skill description', async () => {
      const mockSkill = {
        skill_id: 'skill-1',
        userId: 'user-1',
        category: 'Programming',
        description: 'Advanced TypeScript',
        created_at: new Date(),
      };

      vi.mocked(prisma.skill.update).mockResolvedValue(mockSkill as any);

      const result = await usersService.updateSkill('skill-1', { description: 'Advanced TypeScript' });

      expect(result.description).toBe('Advanced TypeScript');
    });
  });
});
