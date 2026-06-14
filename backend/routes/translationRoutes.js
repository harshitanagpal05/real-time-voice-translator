import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  saveTranslation,
  getHistory,
  deleteTranslation,
  clearHistory,
} from '../controllers/translationController.js';

const router = Router();

router.post('/', authMiddleware, saveTranslation);
router.get('/history', authMiddleware, getHistory);
router.delete('/', authMiddleware, clearHistory);
router.delete('/:id', authMiddleware, deleteTranslation);

export default router;
