import express from 'express';
import {
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
  validateYAML
} from '../controllers/policyController.js';
import { generatePolicy } from '../controllers/analyzerController.js';
import { getVersionsByPolicy } from '../controllers/versionController.js';

const router = express.Router();

// GET /api/policies - Get all policies
router.get('/', getPolicies);

// GET /api/policies/:id - Get a single policy by ID
router.get('/:id', getPolicyById);

// GET /api/policies/:id/versions - Get all versions for a policy
router.get('/:id/versions', getVersionsByPolicy);

// PUT /api/policies/:id - Update a policy's YAML content
router.put('/:id', updatePolicy);

// DELETE /api/policies/:id - Delete a policy
router.delete('/:id', deletePolicy);

// POST /api/policies/validate - Validate YAML syntax
router.post('/validate', validateYAML);

// POST /api/policies/generate - Generate policy from flows
router.post('/generate', generatePolicy);

export default router;
