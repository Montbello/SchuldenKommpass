import prisma from '../../prismaClient';

export interface JobOfferPayload {
  title: string;
  description: string;
  required_skill?: string;
  estimated_time?: number;
  partner_ref_id?: string;
}

export interface MatchConfirmPayload {
  match_id: string;
  accepted: boolean;
  notes?: string;
}

export const partnerService = {
  /**
   * Handle job offer from partner
   * Creates a new task in the system
   */
  async handleJobOffer(partnerId: string, payload: JobOfferPayload) {
    // Create task from partner
    const task = await prisma.task.create({
      data: {
        title: payload.title,
        description: payload.description,
        required_skill: payload.required_skill,
        estimated_time: payload.estimated_time,
        organisationId: partnerId,
        active: true,
      },
    });

    // Log the webhook event
    await prisma.auditEvent.create({
      data: {
        entity: 'Task',
        entity_id: task.task_id,
        action: 'partner_job_offer',
        payload: {
          partner_id: partnerId,
          partner_ref_id: payload.partner_ref_id,
          task_id: task.task_id,
        },
      },
    });

    return {
      task_id: task.task_id,
      status: 'created',
      message: 'Job offer received and task created',
    };
  },

  /**
   * Handle match confirmation from partner
   * Updates match status
   */
  async handleMatchConfirm(partnerId: string, payload: MatchConfirmPayload) {
    const match = await prisma.match.findUnique({
      where: { match_id: payload.match_id },
      include: {
        task: {
          select: {
            organisationId: true,
          },
        },
      },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    // Verify that the partner owns this task
    if (match.task.organisationId !== partnerId) {
      throw new Error('Unauthorized: Match does not belong to this partner');
    }

    // Update match status
    const updated = await prisma.match.update({
      where: { match_id: payload.match_id },
      data: {
        status: payload.accepted ? 'CONFIRMED' : 'REJECTED',
      },
    });

    // Log the event
    await prisma.auditEvent.create({
      data: {
        entity: 'Match',
        entity_id: payload.match_id,
        action: 'partner_match_confirm',
        payload: {
          partner_id: partnerId,
          accepted: payload.accepted,
          notes: payload.notes,
        },
      },
    });

    // If accepted, create progress entry
    if (payload.accepted) {
      await prisma.progress.create({
        data: {
          userId: match.userId,
          taskId: match.taskId,
          status: 'IN_PROGRESS',
          points_earned: 0,
        },
      });
    }

    return {
      match_id: payload.match_id,
      status: updated.status,
      message: `Match ${payload.accepted ? 'accepted' : 'rejected'}`,
    };
  },

  /**
   * Send webhook to partner
   * (Called when relevant events occur)
   */
  async sendWebhookToPartner(partnerId: string, event: string, payload: any) {
    const partner = await prisma.organisation.findUnique({
      where: { org_id: partnerId },
      select: {
        webhook_url: true,
        webhook_secret: true,
      },
    });

    if (!partner || !partner.webhook_url) {
      console.log(`No webhook URL configured for partner ${partnerId}`);
      return false;
    }

    try {
      // Create signature
      const crypto = require('crypto');
      const signature = crypto
        .createHmac('sha256', partner.webhook_secret || '')
        .update(JSON.stringify(payload))
        .digest('hex');

      // Send webhook
      const response = await fetch(partner.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Event-Type': event,
        },
        body: JSON.stringify(payload),
      });

      // Log webhook delivery
      await prisma.auditEvent.create({
        data: {
          entity: 'Webhook',
          entity_id: partnerId,
          action: 'webhook_sent',
          payload: {
            event,
            status: response.status,
            success: response.ok,
          },
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send webhook:', error);
      
      // Log failure
      await prisma.auditEvent.create({
        data: {
          entity: 'Webhook',
          entity_id: partnerId,
          action: 'webhook_failed',
          payload: {
            event,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      });

      return false;
    }
  },

  /**
   * Get partner's tasks
   */
  async getPartnerTasks(partnerId: string) {
    return prisma.task.findMany({
      where: {
        organisationId: partnerId,
        active: true,
      },
      include: {
        matches: {
          select: {
            match_id: true,
            userId: true,
            score: true,
            status: true,
            assigned_at: true,
          },
        },
        progresses: {
          select: {
            progress_id: true,
            userId: true,
            status: true,
            points_earned: true,
            updated_at: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  },
};
