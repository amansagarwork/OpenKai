import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { checkLint, getSupportedLanguages, verifyLinks } from './controllers';

const router = Router();

// All lint routes require authentication
router.use(requireAuth);

// Check code for lint issues
router.post('/check', checkLint);

// Verify links in code or standalone URLs
router.post('/verify-links', verifyLinks);

// Get supported languages and rules
router.get('/languages', getSupportedLanguages);

export { router as lintRouter };
export default router;
