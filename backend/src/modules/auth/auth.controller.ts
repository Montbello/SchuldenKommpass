// src/modules/auth/auth.controller.ts
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import { parseOrRespond } from '../../utils/validation';
import crypto from 'crypto';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = parseOrRespond(registerSchema, req.body, res);
      if (!body) return;
      const { user, token } = await authService.register(body);
      const csrfToken = crypto.randomBytes(32).toString('hex');
      res.cookie('sk_auth', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000,
      });
      res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000,
      });
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error: any) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = parseOrRespond(loginSchema, req.body, res);
      if (!body) return;
      const { user, token } = await authService.login(body);
      const csrfToken = crypto.randomBytes(32).toString('hex');
      res.cookie('sk_auth', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000,
      });
      res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000,
      });
      res.status(200).json({ message: 'Login successful', user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      res.status(200).json({ user });
    } catch (error: any) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('sk_auth');
    res.clearCookie('XSRF-TOKEN');
    res.status(200).json({ message: 'Logged out' });
  },
};
