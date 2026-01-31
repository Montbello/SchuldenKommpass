import jwt from 'jsonwebtoken';
import prisma from '../../prismaClient';
import argon2 from 'argon2';
import { config } from '../../config';

export const authService = {
  async register(data: any) {
    const { email, password, name } = data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    // Hash password
    const password_hash = await argon2.hash(password);

    // Create new user (Prisma)
    const newUser = await prisma.user.create({
      data: {
        email,
        password_hash,
        name,
        role: 'USER',
        status: 'ACTIVE',
      },
    });

    // Generate JWT
    const token = jwt.sign({ id: newUser.user_id, role: newUser.role }, config.jwtSecret, {
      expiresIn: '1h',
    });

    const { password_hash: _pw, ...userWithoutPassword } = newUser as any;

    return { user: userWithoutPassword, token };
  },

  async login(data: any) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials.');
    }

    const isMatch = await argon2.verify(user.password_hash || '', password);
    if (!isMatch) {
      throw new Error('Invalid credentials.');
    }

    const token = jwt.sign({ id: user.user_id, role: user.role }, config.jwtSecret, {
      expiresIn: '1h',
    });

    const { password_hash: _pw, ...userWithoutPassword } = user as any;

    return { user: userWithoutPassword, token };
  },
};
