// server/src/modules/lichtruc/lichtruc.route.js
import express from 'express';
import lichtrucController from './lichtruc.controller.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticate);

// GET routes - specific routes first
router.get('/today', lichtrucController.getTodayDuty);
router.get('/date/:date', lichtrucController.getDutyByDate);
router.get('/month/:year/:month', lichtrucController.getByMonth);
router.get('/stats', authorize(['QuanLy', 'ChuNha']), lichtrucController.getStats);
router.get('/', lichtrucController.getAll);

// POST routes
router.post('/bulk', authorize(['QuanLy', 'ChuNha']), lichtrucController.createBulk);
router.post('/', authorize(['QuanLy', 'ChuNha']), lichtrucController.create);

// PUT routes
router.put('/:id/cancel', authorize(['QuanLy', 'ChuNha']), lichtrucController.cancel);
router.put('/:id', authorize(['QuanLy', 'ChuNha']), lichtrucController.update);

// DELETE routes
router.delete('/:id', authorize(['QuanLy', 'ChuNha']), lichtrucController.delete);

export default router;
