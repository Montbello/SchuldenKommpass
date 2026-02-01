import prisma from '../../prismaClient';
import { geminiService, ReportInput, GeneratedReport } from '../../services/gemini.service';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

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

  /**
   * Generates Institution Report PDF
   * With Timeline, Tasks, Certificates, Documents
   * Format for Jobcenter/Beratungsstellen
   */
  async generateInstitutionPDF(
    institutionId: string,
    userId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<Buffer> {
    // Verify user belongs to institution
    const user = await prisma.user.findFirst({
      where: {
        user_id: userId,
        institution_id: institutionId,
      },
      include: {
        progresses: {
          where: {
            updated_at: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          include: {
            task: {
              select: { title: true, description: true },
            },
          },
          orderBy: { updated_at: 'asc' },
        },
        certificates: {
          where: {
            issued_date: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          orderBy: { issued_date: 'asc' },
        },
        documents: {
          where: {
            uploaded_at: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          orderBy: { uploaded_at: 'asc' },
        },
      },
    });

    if (!user) {
      throw new Error('User not found or not assigned to institution');
    }

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // Header
    doc
      .fontSize(20)
      .text('Fortschrittsbericht Schuldenkompass', { align: 'center' })
      .moveDown();

    doc.fontSize(12).text(`Teilnehmer: ${user.name || user.email}`, { align: 'left' });
    doc.text(`Zeitraum: ${periodStart.toLocaleDateString('de-DE')} - ${periodEnd.toLocaleDateString('de-DE')}`);
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`);
    doc.moveDown(2);

    // Overview Section
    doc.fontSize(16).text('Übersicht', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Status: ${user.onboarding_status}`);
    doc.text(`Level: ${user.level}`);
    doc.text(`Gesammelte Punkte: ${user.total_points}`);
    doc.text(`Stabilitätsscore: ${user.stability_score?.toFixed(1) || 'N/A'}`);
    doc.moveDown(2);

    // Progress Timeline
    doc.fontSize(16).text('Fortschritts-Timeline', { underline: true });
    doc.moveDown();
    doc.fontSize(12);

    if (user.progresses.length === 0) {
      doc.text('Keine Fortschritte im angegebenen Zeitraum.');
    } else {
      user.progresses.forEach((progress, index) => {
        const date = progress.updated_at.toLocaleDateString('de-DE');
        doc.text(`${index + 1}. ${date} - ${progress.task?.title || 'Aufgabe'}`);
        doc.fontSize(10).text(`   Status: ${progress.status}`, { indent: 20 });
        if (progress.points_earned) {
          doc.text(`   Punkte: ${progress.points_earned}`, { indent: 20 });
        }
        doc.fontSize(12).moveDown(0.5);
      });
    }
    doc.moveDown(2);

    // Certificates Section
    doc.fontSize(16).text('Zertifikate & Abzeichen', { underline: true });
    doc.moveDown();
    doc.fontSize(12);

    if (user.certificates.length === 0) {
      doc.text('Keine Zertifikate im angegebenen Zeitraum.');
    } else {
      user.certificates.forEach((cert, index) => {
        const date = cert.issued_date.toLocaleDateString('de-DE');
        doc.text(`${index + 1}. ${cert.title} (${date})`);
        if (cert.description) {
          doc.fontSize(10).text(`   ${cert.description}`, { indent: 20 });
          doc.fontSize(12);
        }
        doc.moveDown(0.5);
      });
    }
    doc.moveDown(2);

    // Documents Section
    doc.fontSize(16).text('Hochgeladene Nachweise', { underline: true });
    doc.moveDown();
    doc.fontSize(12);

    if (user.documents.length === 0) {
      doc.text('Keine Dokumente im angegebenen Zeitraum.');
    } else {
      user.documents.forEach((doc_entry, index) => {
        const date = doc_entry.uploaded_at.toLocaleDateString('de-DE');
        doc.text(
          `${index + 1}. ${doc_entry.document_category} - ${doc_entry.file_type} (${date})`
        );
        if (doc_entry.verification_status) {
          doc
            .fontSize(10)
            .text(`   Verifikationsstatus: ${doc_entry.verification_status}`, { indent: 20 });
          doc.fontSize(12);
        }
        doc.moveDown(0.5);
      });
    }
    doc.moveDown(2);

    // Footer
    doc
      .fontSize(10)
      .text(
        'Dieser Bericht wurde automatisch durch Schuldenkompass generiert.',
        50,
        doc.page.height - 70,
        { align: 'center' }
      );

    doc.end();

    // Wait for PDF to finish
    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  },
};
