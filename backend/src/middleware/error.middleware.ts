import { NextFunction, Request, Response } from 'express';

const statusMap: Array<{ match: RegExp; status: number; code: string }> = [
  { match: /not authorized|unauthorized|invalid token|missing authorization/i, status: 401, code: 'UNAUTHORIZED' },
  { match: /forbidden|not allowed|not authorized to/i, status: 403, code: 'FORBIDDEN' },
  { match: /not found/i, status: 404, code: 'NOT_FOUND' },
  { match: /already exists|duplicate/i, status: 409, code: 'CONFLICT' },
  { match: /validation/i, status: 400, code: 'VALIDATION_ERROR' },
];

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  const message = err?.message || 'Internal server error';

  let status = err?.statusCode || 500;
  let code = err?.code || 'INTERNAL_ERROR';

  if (status === 500) {
    const mapped = statusMap.find((entry) => entry.match.test(message));
    if (mapped) {
      status = mapped.status;
      code = mapped.code;
    }
  }

  res.status(status).json({ message, code });
}
