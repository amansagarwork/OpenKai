import { Router } from 'express';
import * as serviceController from '../controllers/serviceController';

const router = Router();

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/category/:category', serviceController.getServicesByCategory);
router.get('/featured', serviceController.getFeaturedServices);
router.get('/search', serviceController.searchServices);

// Admin routes (you should add authentication middleware for these)
router.post('/admin/services', serviceController.addService);
router.put('/admin/services/:id', serviceController.updateService);
router.delete('/admin/services/:id', serviceController.deleteService);

export default router;
