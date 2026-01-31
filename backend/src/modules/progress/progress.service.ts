import prisma from '../../prismaClient';
import crypto from 'crypto';
import { ProgressStatusCode } from './progress.types';

export const progressService = {
  // Get progress entries for a user
  async getProgress(userId: string) {
    return prisma.progress.findMany({
      where: { userId },
      include: { 
        task: true,
        proof_document: true,
      },
      orderBy: { updated_at: 'desc' },
    });
  },

  // Get single progress entry
  async getProgressById(progressId: string) {
    const progress = await prisma.progress.findUnique({
      where: { progress_id: progressId },
      include: { task: true, proof_document: true },
    });
    if (!progress) throw new Error('Progress not found');
    return progress;
  },

  // Create progress entry (when accepting a match)
  async createProgress(userId: string, data: { taskId: string }) {
    // Check if progress already exists for this task
    const existing = await prisma.progress.findFirst({
      where: { userId, taskId: data.taskId },
    });
    if (existing) throw new Error('Progress already exists for this task');

    return prisma.progress.create({
      data: {
        userId,
        taskId: data.taskId,
        status: ProgressStatusCode.IN_PROGRESS,
        points_earned: 0,
      },
      include: { task: true },
    });
  },

  // Update progress
  async updateProgress(progressId: string, userId: string, data: {
    status?: string;
    proofDocumentId?: string;
  }) {
    // Verify ownership
    const progress = await prisma.progress.findUnique({ where: { progress_id: progressId } });
    if (!progress) throw new Error('Progress not found');
    if (progress.userId !== userId) throw new Error('Not authorized');

    const validStatuses: string[] = Object.values(ProgressStatusCode);
    if (data.status && !validStatuses.includes(data.status)) {
      throw new Error('Invalid status');
    }

    return prisma.progress.update({
      where: { progress_id: progressId },
      data: {
        status: data.status,
        proofDocumentId: data.proofDocumentId,
      },
      include: { task: true, proof_document: true },
    });
  },

  // Verify progress (Advisor/Admin only)
  async verifyProgress(progressId: string, verified: boolean, points?: number) {
    const progress = await prisma.progress.findUnique({
      where: { progress_id: progressId },
      include: { task: true },
    });
    if (!progress) throw new Error('Progress not found');

    // Calculate points based on task (simplified)
    const earnedPoints = verified ? (points || progress.task?.estimated_time || 10) : 0;

    return prisma.progress.update({
      where: { progress_id: progressId },
      data: {
        status: verified ? ProgressStatusCode.VERIFIED : ProgressStatusCode.REJECTED,
        points_earned: earnedPoints,
      },
      include: { task: true, proof_document: true },
    });
  },

  // Create document record
  async createDocument(userId: string, data: {
    file_path: string;
    file_type: string;
    description?: string;
    file_hash?: string;
  }) {
    return prisma.document.create({
      data: {
        userId,
        file_path: data.file_path,
        file_type: data.file_type,
        description: data.description,
        file_hash: data.file_hash,
        encrypted: false,
        storage_provider: 'local',
      },
    });
  },

  // Generate file hash
  generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  },
};
