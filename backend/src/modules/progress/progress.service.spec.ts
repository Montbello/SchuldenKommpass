import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../prismaClient', () => ({
  default: {
    progress: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    task: {
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
    }
  },
}));

import crypto from 'crypto';





import { progressService } from './progress.service';
import prisma from '../../prismaClient';

describe('progressService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
vi.mocked(prisma.progress.findMany).mockReset();
    vi.mocked(prisma.progress.findUnique).mockReset();
    vi.mocked(prisma.progress.findFirst).mockReset();
    vi.mocked(prisma.progress.create).mockReset();
    vi.mocked(prisma.progress.update).mockReset();
    vi.mocked(prisma.document.create).mockReset();
    vi.mocked(prisma.award.points).mockReset();
    vi.clearAllMocks();
  });

  describe('getProgress', () => {
    it('returns progress entries for user', async () => {
      const mockProgress = [
        {
          progress_id: 'prog-1',
          userId: 'user-1',
          taskId: 'task-1',
          status: 'in_progress',
          points_earned: 0,
          task: { task_id: 'task-1', title: 'Task 1' },
          proof_document: null,
        },
      ];

      vi.mocked(prisma.progress.findMany).mockResolvedValue(mockProgress);

      const result = await progressService.getProgress('user-1');

      expect(result).toEqual(mockProgress);
      expect(prisma.progress.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          task: true,
          proof_document: true,
        },
        orderBy: { updated_at: 'desc' },
      });
    });
  });

  describe('getProgressById', () => {
    it('returns single progress entry', async () => {
      const mockProgress = {
        progress_id: 'prog-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'in_progress',
        task: { task_id: 'task-1', title: 'Task 1' },
        proof_document: null,
      };

      vi.mocked(prisma.progress.findUnique).mockResolvedValue(mockProgress);

      const result = await progressService.getProgressById('prog-1');

      expect(result).toEqual(mockProgress);
    });

    it('throws error when progress not found', async () => {
      vi.mocked(prisma.progress.findUnique).mockResolvedValue(null);

      await expect(progressService.getProgressById('nonexistent')).rejects.toThrow('Progress not found');
    });
  });

  describe('createProgress', () => {
    it('creates new progress entry', async () => {
      const mockProgress = {
        progress_id: 'prog-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'in_progress',
        points_earned: 0,
        task: { task_id: 'task-1', title: 'Task 1' },
      };

      vi.mocked(prisma.progress.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.progress.create).mockResolvedValue(mockProgress);

      const result = await progressService.createProgress('user-1', { taskId: 'task-1' });

      expect(result).toEqual(mockProgress);
      expect(prisma.progress.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          taskId: 'task-1',
          status: 'in_progress',
          points_earned: 0,
        },
        include: { task: true },
      });
    });

    it('throws error when progress already exists', async () => {
      const existingProgress = {
        progress_id: 'prog-1',
        userId: 'user-1',
        taskId: 'task-1',
      };

      vi.mocked(prisma.progress.findFirst).mockResolvedValue(existingProgress);

      await expect(
        progressService.createProgress('user-1', { taskId: 'task-1' })
      ).rejects.toThrow('Progress already exists for this task');
    });
  });

  describe('updateProgress', () => {
    it('updates progress when authorized', async () => {
      const mockProgress = {
        progress_id: 'prog-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'in_progress',
      };

      const updatedProgress = {
        ...mockProgress,
        status: 'submitted',
        proofDocumentId: 'doc-1',
        task: { task_id: 'task-1', title: 'Task 1' },
        proof_document: { document_id: 'doc-1' },
      };

      vi.mocked(prisma.progress.findUnique).mockResolvedValue(mockProgress);
      vi.mocked(prisma.progress.update).mockResolvedValue(updatedProgress);

      const result = await progressService.updateProgress('prog-1', 'user-1', {
        status: 'submitted',
        proofDocumentId: 'doc-1',
      });

      expect(result).toEqual(updatedProgress);
      expect(prisma.progress.update).toHaveBeenCalledWith({
        where: { progress_id: 'prog-1' },
        data: {
          status: 'submitted',
          proofDocumentId: 'doc-1',
        },
        include: { task: true, proof_document: true },
      });
    });

    it('throws error when progress not found', async () => {
      vi.mocked(prisma.progress.findUnique).mockResolvedValue(null);

      await expect(
        progressService.updateProgress('nonexistent', 'user-1', { status: 'submitted' })
      ).rejects.toThrow('Progress not found');
    });

    it('throws error when user not authorized', async () => {
      const mockProgress = {
        progress_id: 'prog-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'in_progress',
      };

      vi.mocked(prisma.progress.findUnique).mockResolvedValue(mockProgress);

      await expect(
        progressService.updateProgress('prog-1', 'other-user', { status: 'submitted' })
      ).rejects.toThrow('Not authorized');
    });

    it('throws error for invalid status', async () => {
      const mockProgress = {
        progress_id: 'prog-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'in_progress',
      };

      vi.mocked(prisma.progress.findUnique).mockResolvedValue(mockProgress);

      await expect(
        progressService.updateProgress('prog-1', 'user-1', { status: 'invalid_status' })
      ).rejects.toThrow('Invalid status');
    });
  });

  describe('verifyProgress', () => {
    it('verifies progress and awards points', async () => {
      const mockProgress = {
        progress_id: 'prog-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'submitted',
      };

      const updatedProgress = {
        ...mockProgress,
        status: 'completed',
        points_earned: 15,
      };

      vi.mocked(prisma.progress.findUnique).mockResolvedValue(mockProgress);
      vi.mocked(prisma.progress.update).mockResolvedValue(updatedProgress);
      vi.mocked(prisma.award.points).mockResolvedValue({
        leveledUp: true,
        oldLevel: 1,
        newLevel: 2,
      });

      const result = await progressService.verifyProgress('prog-1', true, 15);

      expect(result.status).toBe('completed');
      expect(result.points_earned).toBe(15);
      expect(prisma.award.points).toHaveBeenCalledWith(
        'user-1',
        15,
        'Task completed: prog-1',
        'System'
      );
    });

    it('uses default points when not specified', async () => {
      const mockProgress = {
        progress_id: 'prog-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'submitted',
      };

      const updatedProgress = {
        ...mockProgress,
        status: 'completed',
        points_earned: 10,
      };

      vi.mocked(prisma.progress.findUnique).mockResolvedValue(mockProgress);
      vi.mocked(prisma.progress.update).mockResolvedValue(updatedProgress);
      vi.mocked(prisma.award.points).mockResolvedValue({ leveledUp: false });

      await progressService.verifyProgress('prog-1', true);

      expect(prisma.progress.update).toHaveBeenCalledWith({
        where: { progress_id: 'prog-1' },
        data: {
          status: 'completed',
          points_earned: 10,
        },
      });
    });

    it('rejects progress without points', async () => {
      const mockProgress = {
        progress_id: 'prog-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'submitted',
      };

      const updatedProgress = {
        ...mockProgress,
        status: 'rejected',
        points_earned: 0,
      };

      vi.mocked(prisma.progress.findUnique).mockResolvedValue(mockProgress);
      vi.mocked(prisma.progress.update).mockResolvedValue(updatedProgress);

      const result = await progressService.verifyProgress('prog-1', false);

      expect(result.status).toBe('rejected');
      expect(result.points_earned).toBe(0);
      expect(prisma.award.points).not.toHaveBeenCalled();
    });

    it('throws error when progress not found', async () => {
      vi.mocked(prisma.progress.findUnique).mockResolvedValue(null);

      await expect(progressService.verifyProgress('nonexistent', true)).rejects.toThrow('Progress not found');
    });

    it('handles points award failure gracefully', async () => {
      const mockProgress = {
        progress_id: 'prog-1',
        userId: 'user-1',
        taskId: 'task-1',
        status: 'submitted',
      };

      const updatedProgress = {
        ...mockProgress,
        status: 'completed',
        points_earned: 10,
      };

      vi.mocked(prisma.progress.findUnique).mockResolvedValue(mockProgress);
      vi.mocked(prisma.progress.update).mockResolvedValue(updatedProgress);
      vi.mocked(prisma.award.points).mockRejectedValue(new Error('Points service error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await progressService.verifyProgress('prog-1', true);

      expect(result).toEqual(updatedProgress);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to award points:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('createDocument', () => {
    it('creates document record', async () => {
      const mockDocument = {
        document_id: 'doc-1',
        userId: 'user-1',
        file_path: '/uploads/doc.pdf',
        file_type: 'application/pdf',
        description: 'Test document',
        file_hash: 'abc123',
        encrypted: false,
        storage_provider: 'local',
      };

      vi.mocked(prisma.document.create).mockResolvedValue(mockDocument);

      const result = await progressService.createDocument('user-1', {
        file_path: '/uploads/doc.pdf',
        file_type: 'application/pdf',
        description: 'Test document',
        file_hash: 'abc123',
      });

      expect(result).toEqual(mockDocument);
      expect(prisma.document.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          file_path: '/uploads/doc.pdf',
          file_type: 'application/pdf',
          description: 'Test document',
          file_hash: 'abc123',
          encrypted: false,
          storage_provider: 'local',
        },
      });
    });
  });

  describe('generateFileHash', () => {
    it('generates sha256 hash for buffer', () => {
      const buffer = Buffer.from('test content');
      const hash = progressService.generateFileHash(buffer);

      const expectedHash = crypto.createHash('sha256').update(buffer).digest('hex');
      expect(hash).toBe(expectedHash);
    });

    it('generates different hashes for different content', () => {
      const buffer1 = Buffer.from('content 1');
      const buffer2 = Buffer.from('content 2');

      const hash1 = progressService.generateFileHash(buffer1);
      const hash2 = progressService.generateFileHash(buffer2);

      expect(hash1).not.toBe(hash2);
    });
  });
});
