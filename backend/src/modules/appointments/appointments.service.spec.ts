import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../prismaClient', () => ({
  default: {
    appointment: {
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
    auditEvent: {
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



import { appointmentsService } from './appointments.service';
import prisma from '../../prismaClient';

describe('appointmentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  // ... rest will be added
});
