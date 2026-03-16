import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';

const router = Router();

// Get featured/popular services with algorithm
router.get('/featured', analyticsController.getFeaturedServices);

// Get all users who favorited a specific item
router.get('/items/:itemId/favorites', analyticsController.getItemFavorites);

// Get popular items by favorite count
router.get('/popular', analyticsController.getPopularItems);

// Get user's favorite statistics
router.get('/users/:userId/stats', analyticsController.getUserFavoriteStats);

export default router;
