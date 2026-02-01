import { Router } from 'express';
import { InstitutionsController } from './institutions.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();
const institutionsController = new InstitutionsController();

// Alle Routen benötigen Authentifizierung
// RBAC-Check erfolgt in Controller (INSTITUTION-Rolle erforderlich)
router.use(authenticate);

/**
 * GET /institutions/users
 * Holt alle User der Institution mit optionalen Filtern
 */
router.get('/users', institutionsController.getUsers.bind(institutionsController));

/**
 * GET /institutions/users/:userId/progress
 * Holt detaillierten Fortschritt eines Users
 */
router.get('/users/:userId/progress', institutionsController.getUserProgress.bind(institutionsController));

/**
 * GET /institutions/statistics
 * Dashboard-Statistiken für Institution
 */
router.get('/statistics', institutionsController.getStatistics.bind(institutionsController));

/**
 * POST /institutions/reports
 * Generiert einen Report für die Institution
 */
router.post('/reports', institutionsController.generateReport.bind(institutionsController));

/**
 * GET /institutions/users/:userId/report/pdf
 * Downloads PDF report for a specific user
 */
router.get('/users/:userId/report/pdf', institutionsController.downloadUserPDF.bind(institutionsController));

export default router;
