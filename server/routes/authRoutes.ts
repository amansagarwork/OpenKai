import { Router } from 'express';
import * as authController from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getUserProfile);
router.put('/update-profile', requireAuth, authController.updateProfile);
router.put('/settings', requireAuth, authController.updateSettings);
router.post('/favorites', requireAuth, authController.addFavorite);
router.delete('/favorites/:id', requireAuth, authController.removeFavorite);
router.delete('/delete-account', requireAuth, authController.deleteAccount);

export default router;
