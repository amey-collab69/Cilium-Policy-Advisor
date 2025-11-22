import express from 'express';
import {
  createFlow,
  getFlows,
  getFlowById,
  deleteFlow
} from '../controllers/flowController.js';

const router = express.Router();

// POST /api/flows - Create a new flow record
router.post('/', createFlow);

// GET /api/flows - Get all flows with optional filtering and pagination
router.get('/', getFlows);

// GET /api/flows/:id - Get a single flow by ID
router.get('/:id', getFlowById);

// DELETE /api/flows/:id - Delete a flow record
router.delete('/:id', deleteFlow);

export default router;
