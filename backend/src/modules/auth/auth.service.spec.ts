import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Prisma client before importing the service
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: function () {
      return {
        user: {
          findUnique: mockFindUnique,
          create: mockCreate,
        },
      };
    },
  };
});

import { authService } from './auth.service';
import argon2 from 'argon2';

describe('authService', () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockCreate.mockReset();
  });

  it('registers a new user and returns token', async () => {
    const email = 'newuser@example.com';
    const name = 'New User';
    const password = 'securepass';

    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockImplementation(async ({ data }: any) => ({
      user_id: 'uuid-1',
      email: data.email,
      name: data.name,
      password_hash: data.password_hash,
      role: data.role,
      status: data.status,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const result = await authService.register({ email, password, name });

    expect(result.user.email).toBe(email);
    expect(result.user.name).toBe(name);
    expect(result.token).toBeTruthy();
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email } });
    expect(mockCreate).toHaveBeenCalled();
  });

  it('logs in existing user with correct password', async () => {
    const email = 'existing@example.com';
    const password = 'mypassword';
    const hash = await argon2.hash(password);

    mockFindUnique.mockResolvedValue({
      user_id: 'uuid-2',
      email,
      name: 'Existing',
      password_hash: hash,
      role: 'USER',
      status: 'ACTIVE',
    });

    const result = await authService.login({ email, password });

    expect(result.user.email).toBe(email);
    expect(result.token).toBeTruthy();
  });

  it('throws on invalid login', async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(authService.login({ email: 'nope@example.com', password: 'x' })).rejects.toThrow('Invalid credentials.');
  });
});