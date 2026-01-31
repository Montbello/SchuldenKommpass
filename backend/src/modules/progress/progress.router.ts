import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { progressController } from './progress.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorize.middleware';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Progress routes
router.get('/', authMiddleware, progressController.getProgress);
router.get('/:id', authMiddleware, progressController.getProgressById);
router.post('/', authMiddleware, progressController.createProgress);
router.patch('/:id', authMiddleware, progressController.updateProgress);

// Admin/Advisor only - verify proof documents
router.patch('/:id/verify', authMiddleware, authorize('ADMIN', 'ADVISOR'), progressController.verifyProgress);

export { router as progressRouter, upload };
