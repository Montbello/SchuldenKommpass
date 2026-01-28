// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import { authService } from './auth.service';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { user, token } = await authService.register(req.body);
      res.status(201).json({ message: 'User registered successfully', user, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { user, token } = await authService.login(req.body);
      res.status(200).json({ message: 'Login successful', user, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};
