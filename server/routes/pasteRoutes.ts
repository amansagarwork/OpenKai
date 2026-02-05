import { Router } from 'express';
import * as pasteController from '../controllers/pasteController';
import { optionalAuth, requireAuth } from '../middleware/auth';

const router = Router();

// Create a new paste
router.post('/', optionalAuth, pasteController.createPaste);

router.get('/me', requireAuth, pasteController.listMyPastes);

// Unified history endpoint (pastes + URLs)
router.get('/history/all', requireAuth, pasteController.getUserHistory);

// Get a paste by ID
router.get('/:id', pasteController.getPaste);

// Delete a paste
router.delete('/:id', pasteController.deletePaste);

export default router;
