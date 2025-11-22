import express from 'express';
import { getMetrics } from '../controllers/dashboardController.js';

const router = express.Router();

// GET /api/dashboard/metrics - Get dashboard statistics
router.get('/metrics', getMetrics);

export default router;
