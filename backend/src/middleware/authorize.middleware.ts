import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Authorization Middleware Factory
 * 
 * Creates a middleware that checks if the authenticated user has one of the allowed roles.
 * Must be used AFTER authMiddleware.
 * 
 * @example
 * // Only ADMIN can access
 * router.delete('/:id', authMiddleware, authorize('ADMIN'), controller.delete);
 * 
 * // ADMIN or ADVISOR can access
 * router.post('/', authMiddleware, authorize('ADMIN', 'ADVISOR'), controller.create);
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    // Check if user is authenticated
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        }
      });
    }

    // Check if user has required role
    if (!allowedRoles.includes(user.role as UserRole)) {
      return res.status(403).json({ 
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required roles: ${allowedRoles.join(' or ')}`,
        }
      });
    }

    next();
  };
}

/**
 * Checks if the current user owns the resource OR has admin/advisor role
 * Useful for "owner or admin" access patterns
 */
export function authorizeOwnerOrRole(
  getResourceOwnerId: (req: Request) => Promise<string | null>,
  ...allowedRoles: UserRole[]
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    // Admin/Advisor can always access
    if (allowedRoles.includes(user.role as UserRole)) {
      return next();
    }

    // Check ownership
    try {
      const ownerId = await getResourceOwnerId(req);
      if (ownerId === user.user_id) {
        return next();
      }
    } catch (error) {
      // Resource not found or error - let the controller handle it
      return next();
    }

    return res.status(403).json({ 
      success: false,
      error: { code: 'FORBIDDEN', message: 'Access denied' }
    });
  };
}
