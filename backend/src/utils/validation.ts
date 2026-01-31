import { Response } from 'express';
import { ZodSchema } from 'zod';

export function parseOrRespond<T>(schema: ZodSchema<T>, data: unknown, res: Response): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    res.status(400).json({
      message: 'Validation error',
      issues: result.error.flatten(),
    });
    return null;
  }
  return result.data;
}
