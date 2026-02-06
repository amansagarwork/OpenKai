import { Router } from 'express';
import * as authController from './controllers';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.me);

export { router as authRouter };
export default router;
