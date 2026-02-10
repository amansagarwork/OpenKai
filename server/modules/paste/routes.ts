import { Router } from 'express';
import * as pasteController from './controllers';
import { optionalAuth, requireAuth } from '../../middleware/auth';

const router = Router();

// Create a new paste (with optional file upload, 5MB limit)
router.post('/', optionalAuth, pasteController.uploadMiddleware, pasteController.createPaste);

router.get('/me', requireAuth, pasteController.listMyPastes);

// Unified history endpoint (pastes + URLs + downloads)
router.get('/history/all', requireAuth, pasteController.getUserHistory);

// Get a paste by ID (optional auth for tracking downloads)
router.get('/:id', optionalAuth, pasteController.getPaste);

// Get a paste by content type and ID (optional auth for tracking downloads)
router.get('/text/:id', optionalAuth, pasteController.getPaste);
router.get('/image/:id', optionalAuth, pasteController.getPaste);
router.get('/file/:id', optionalAuth, pasteController.getPaste);

// Delete a paste
router.delete('/:id', pasteController.deletePaste);

export { router as pasteRouter };
export default router;
