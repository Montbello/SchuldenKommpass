import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prisma from '../prismaClient';
import { config } from '../config';

type AuthTokenPayload = JwtPayload & { id: string; role?: string };

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    let token: string | undefined;
    if (typeof authHeader === 'string') {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      token = req.cookies?.['sk_auth'];
    }

    if (!token) return res.status(401).json({ message: 'Missing auth token' });
    const payload = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
    if (!payload?.id) return res.status(401).json({ message: 'Invalid token payload' });

    const user = await prisma.user.findUnique({ where: { user_id: payload.id } });
    if (!user) return res.status(401).json({ message: 'User not found' });

    // remove password hash
    const { password_hash: _pw, ...userWithoutPassword } = user;

    // attach to request
    req.user = userWithoutPassword;

    next();
  } catch (err: any) {
    return res.status(401).json({ message: err.message || 'Unauthorized' });
  }
}
