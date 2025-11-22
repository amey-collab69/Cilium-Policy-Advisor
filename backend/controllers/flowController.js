import Flow from '../models/Flow.js';

/**
 * Create a new flow record
 * POST /api/flows
 */
export async function createFlow(req, res, next) {
  try {
    const flowData = req.body;

    // Validate required fields
    if (!flowData.timestamp || !flowData.source_namespace || !flowData.destination_namespace) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields: timestamp, source_namespace, destination_namespace'
        }
      });
    }

    const flowId = await Flow.create(flowData);
    const createdFlow = await Flow.findById(flowId);

    res.status(201).json({
      message: 'Flow created successfully',
      flow: createdFlow
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all flows with optional filtering and pagination
 * GET /api/flows?namespace=default&port=8080&page=1&limit=50
 */
export async function getFlows(req, res, next) {
  try {
    const { namespace, service, port, page, limit } = req.query;

    const filters = {
      namespace,
      service,
      port: port ? parseInt(port) : undefined
    };

    const pagination = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50
    };

    const result = await Flow.findAll(filters, pagination);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single flow by ID
 * GET /api/flows/:id
 */
export async function getFlowById(req, res, next) {
  try {
    const { id } = req.params;
    const flow = await Flow.findById(id);

    if (!flow) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Flow not found'
        }
      });
    }

    res.json({ flow });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a flow record
 * DELETE /api/flows/:id
 */
export async function deleteFlow(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Flow.delete(id);

    if (!deleted) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Flow not found'
        }
      });
    }

    res.json({
      message: 'Flow deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
