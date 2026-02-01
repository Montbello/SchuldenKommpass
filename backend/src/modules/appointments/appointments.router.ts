import { Router } from 'express';
import { appointmentsController } from './appointments.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorize.middleware';

const router = Router();

// All appointment routes require authentication
router.get('/', authMiddleware, appointmentsController.getAppointments);
router.get('/:id', authMiddleware, appointmentsController.getAppointment);

// Creating appointments - Users and Advisors can create
router.post('/', authMiddleware, appointmentsController.createAppointment);

// Updating appointments - Users, Advisors, and Admins
router.patch('/:id', authMiddleware, appointmentsController.updateAppointment);

// Deleting appointments - Admins only
router.delete('/:id', authMiddleware, authorize('ADMIN', 'ADVISOR'), appointmentsController.deleteAppointment);

export default router;
