import prisma from '../../prismaClient';

export const appointmentsService = {
  // Get all appointments (with filters)
  async getAppointments(filters?: { 
    userId?: string; 
    advisorId?: string;
    status?: string;
    from?: Date;
    to?: Date;
  }) {
    const where: any = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    
    if (filters?.advisorId) {
      where.advisorId = filters.advisorId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    // Filter by date range
    if (filters?.from || filters?.to) {
      where.start_time = {};
      if (filters.from) {
        where.start_time.gte = filters.from;
      }
      if (filters.to) {
        where.start_time.lte = filters.to;
      }
    }

    return prisma.appointment.findMany({
      where,
      include: {
        user: {
          select: { user_id: true, name: true, email: true }
        },
        advisor: {
          select: { user_id: true, name: true, email: true }
        }
      },
      orderBy: { start_time: 'asc' },
    });
  },

  // Get single appointment by ID
  async getAppointment(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { appointment_id: appointmentId },
      include: {
        user: {
          select: { user_id: true, name: true, email: true }
        },
        advisor: {
          select: { user_id: true, name: true, email: true }
        }
      },
    });
    if (!appointment) throw new Error('Appointment not found');
    return appointment;
  },

  // Create a new appointment
  async createAppointment(data: {
    userId: string;
    advisorId?: string;
    start_time: Date;
    end_time: Date;
    status: string;
    video_link?: string;
  }) {
    return prisma.appointment.create({
      data: {
        userId: data.userId,
        advisorId: data.advisorId,
        start_time: data.start_time,
        end_time: data.end_time,
        status: data.status,
        video_link: data.video_link,
      },
      include: {
        user: {
          select: { user_id: true, name: true, email: true }
        },
        advisor: {
          select: { user_id: true, name: true, email: true }
        }
      },
    });
  },

  // Update appointment
  async updateAppointment(appointmentId: string, data: {
    advisorId?: string;
    start_time?: Date;
    end_time?: Date;
    status?: string;
    video_link?: string | null;
  }) {
    return prisma.appointment.update({
      where: { appointment_id: appointmentId },
      data,
      include: {
        user: {
          select: { user_id: true, name: true, email: true }
        },
        advisor: {
          select: { user_id: true, name: true, email: true }
        }
      },
    });
  },

  // Delete appointment
  async deleteAppointment(appointmentId: string) {
    return prisma.appointment.delete({
      where: { appointment_id: appointmentId },
    });
  },
};
