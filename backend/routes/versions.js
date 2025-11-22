import express from 'express';
import {
  getVersionsByPolicy,
  getVersionById
} from '../controllers/versionController.js';

const router = express.Router();

// GET /api/versions/:id - Get a single version by ID
router.get('/:id', getVersionById);

export default router;
