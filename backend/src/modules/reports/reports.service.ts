import prisma from '../../prismaClient';
import { geminiService, ReportInput, GeneratedReport } from '../../services/gemini.service';

export interface CreateReportInput {
  userId: string;
  userStory: string;
  periodStart?: Date;
  periodEnd?: Date;
}

export interface ReportWithContent {
  report_id: string;
  type: string;
  period_start: Date;
  period_end: Date;
  format: string;
  generated_at: Date;
  content: GeneratedReport;
}

export const reportsService = {
  // Generate a new report using Gemini
  async generateReport(input: CreateReportInput): Promise<ReportWithContent> {
    const { userId, userStory, periodStart, periodEnd } = input;

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        skills: true,
      },
    });
    if (!user) throw new Error('User not found');

    // Fetch user's progress
    const progress = await prisma.progress.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { updated_at: 'desc' },
    });

    // Fetch user's documents
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { uploaded_at: 'desc' },
    });

    // Calculate total points
    const totalPoints = progress.reduce((sum, p) => sum + (p.points_earned || 0), 0);

    // Prepare input for Gemini
    const reportInput: ReportInput = {
      userName: user.name || 'Teilnehmer',
      userStory,
      progress: progress.map(p => ({
        taskTitle: p.task?.title || 'Aufgabe',
        status: p.status,
        points: p.points_earned || 0,
        completedAt: p.status === 'verified' ? p.updated_at.toISOString().split('T')[0] : undefined,
      })),
      documents: documents.map(d => ({
        type: d.file_type,
        description: d.description || undefined,
        uploadedAt: d.uploaded_at.toISOString().split('T')[0],
      })),
      totalPoints,
    };

    // Generate report with Gemini
    const generatedContent = await geminiService.generateReport(reportInput);

    // Save report to database
    const now = new Date();
    const report = await prisma.report.create({
      data: {
        type: 'PARTICIPANT_PROGRESS',
        period_start: periodStart || new Date(now.getFullYear(), now.getMonth(), 1),
        period_end: periodEnd || now,
        format: 'JSON',
        file_path: null, // Content stored in response, not as file
        generatedById: userId,
      },
    });

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        entity: 'Report',
        entity_id: report.report_id,
        action: 'GENERATED',
        payload: {
          userId,
          progressCount: progress.length,
          documentCount: documents.length,
          totalPoints,
        },
      },
    });

    return {
      report_id: report.report_id,
      type: report.type,
      period_start: report.period_start,
      period_end: report.period_end,
      format: report.format,
      generated_at: report.generated_at,
      content: generatedContent,
    };
  },

  // Get reports for a user
  async getUserReports(userId: string) {
    return prisma.report.findMany({
      where: { generatedById: userId },
      orderBy: { generated_at: 'desc' },
    });
  },

  // Get single report
  async getReportById(reportId: string, userId: string) {
    const report = await prisma.report.findUnique({
      where: { report_id: reportId },
    });
    if (!report) throw new Error('Report not found');
    if (report.generatedById !== userId) throw new Error('Not authorized');
    return report;
  },
};
