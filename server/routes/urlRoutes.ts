import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { createShortUrl, redirectToOriginalUrl, getShortUrlStats, getShortUrlInfo, deleteShortUrl } from '../controllers/urlController';

const router = Router();

// Create a short URL (supports both authenticated and anonymous users)
router.post('/', optionalAuth, createShortUrl);

// Get URL info without redirecting (for preview page)
router.get('/:shortId/info', getShortUrlInfo);

// Get stats for a short URL
router.get('/:shortId/stats', getShortUrlStats);

// Delete short URL (requires auth if owned, optional if anonymous)
router.delete('/:shortId', optionalAuth, deleteShortUrl);

// Redirect to original URL (this is handled at app level for /u/:shortId)
// But we can also have it here for /api/urls/:shortId/redirect
router.get('/:shortId/redirect', redirectToOriginalUrl);

export default router;
