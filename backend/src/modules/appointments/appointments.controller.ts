import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { appointmentsService } from './appointments.service';
import { parseOrRespond } from '../../utils/validation';
import { videoService } from '../../services/video.service';

const idParamSchema = z.object({ id: z.string().min(1) });

const getAppointmentsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  advisorId: z.string().uuid().optional(),
  status: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const createAppointmentSchema = z.object({
  userId: z.string().uuid(),
  advisorId: z.string().uuid().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  video_link: z.string().url().optional(),
}).refine(
  (data) => new Date(data.end_time) > new Date(data.start_time),
  {
    message: 'end_time must be after start_time',
    path: ['end_time'],
  }
);

const updateAppointmentSchema = z.object({
  advisorId: z.string().uuid().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  video_link: z.string().url().optional().nullable(),
}).refine(
  (data) => {
    if (data.start_time && data.end_time) {
      return new Date(data.end_time) > new Date(data.start_time);
    }
    return true;
  },
  {
    message: 'end_time must be after start_time',
    path: ['end_time'],
  }
);

export const appointmentsController = {
  // GET /api/appointments
  async getAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = parseOrRespond(getAppointmentsQuerySchema, req.query, res);
      if (!query) return;
      
      const filters = {
        userId: query.userId,
        advisorId: query.advisorId,
        status: query.status,
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
      };
      
      const appointments = await appointmentsService.getAppointments(filters);
      res.json(appointments);
    } catch (error: any) {
      next(error);
    }
  },

  // GET /api/appointments/:id
  async getAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parseOrRespond(idParamSchema, req.params, res);
      if (!params) return;
      
      const appointment = await appointmentsService.getAppointment(params.id);
      res.json(appointment);
    } catch (error: any) {
      next(error);
    }
  },

  // POST /api/appointments
  async createAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = parseOrRespond(createAppointmentSchema, req.body, res);
      if (!body) return;
      
      let videoLink = body.video_link;
      
      // Auto-generate video link if not provided
      if (!videoLink) {
        try {
          const startTime = new Date(body.start_time);
          const endTime = new Date(body.end_time);
          const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
          
          const meetingLink = await videoService.generateMeetingLink({
            appointmentId: 'temp', // Will be replaced after creation
            userId: body.userId,
            advisorId: body.advisorId,
            duration: durationMinutes,
          });
          
          videoLink = meetingLink.meetingUrl;
        } catch (error) {
          console.error('Failed to generate video link:', error);
          // Continue without video link
        }
      }
      
      const appointment = await appointmentsService.createAppointment({
        userId: body.userId,
        advisorId: body.advisorId,
        start_time: new Date(body.start_time),
        end_time: new Date(body.end_time),
        status: body.status,
        video_link: videoLink,
      });
      
      res.status(201).json({ success: true, data: appointment });
    } catch (error: any) {
      next(error);
    }
  },

  // PATCH /api/appointments/:id
  async updateAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parseOrRespond(idParamSchema, req.params, res);
      if (!params) return;
      
      const body = parseOrRespond(updateAppointmentSchema, req.body, res);
      if (!body) return;
      
      const appointment = await appointmentsService.updateAppointment(params.id, {
        advisorId: body.advisorId,
        start_time: body.start_time ? new Date(body.start_time) : undefined,
        end_time: body.end_time ? new Date(body.end_time) : undefined,
        status: body.status,
        video_link: body.video_link === null ? null : body.video_link,
      });
      
      res.json({ success: true, data: appointment });
    } catch (error: any) {
      next(error);
    }
  },

  // DELETE /api/appointments/:id
  async deleteAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parseOrRespond(idParamSchema, req.params, res);
      if (!params) return;
      
      await appointmentsService.deleteAppointment(params.id);
      res.json({ success: true, message: 'Appointment deleted' });
    } catch (error: any) {
      next(error);
    }
  },
};
