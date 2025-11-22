import Policy from '../models/Policy.js';
import Version from '../models/Version.js';
import yaml from 'js-yaml';

/**
 * Get all policies
 * GET /api/policies
 */
export async function getPolicies(req, res, next) {
  try {
    const policies = await Policy.findAll();
    res.json({ policies });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single policy by ID
 * GET /api/policies/:id
 */
export async function getPolicyById(req, res, next) {
  try {
    const { id } = req.params;
    const policy = await Policy.findById(id);

    if (!policy) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Policy not found'
        }
      });
    }

    res.json({ policy });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a policy's YAML content and create a new version
 * PUT /api/policies/:id
 */
export async function updatePolicy(req, res, next) {
  try {
    const { id } = req.params;
    const { yaml_content, change_summary } = req.body;

    if (!yaml_content) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required field: yaml_content'
        }
      });
    }

    // Validate YAML syntax
    try {
      yaml.load(yaml_content);
    } catch (yamlError) {
      return res.status(400).json({
        error: {
          code: 'INVALID_YAML',
          message: 'Invalid YAML syntax',
          details: yamlError.message
        }
      });
    }

    // Check if policy exists
    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Policy not found'
        }
      });
    }

    // Update policy
    await Policy.update(id, yaml_content);

    // Create new version
    const latestVersion = await Version.getLatestVersion(id);
    await Version.create({
      policy_id: id,
      version_number: latestVersion + 1,
      yaml_content,
      change_summary
    });

    const updatedPolicy = await Policy.findById(id);

    res.json({
      message: 'Policy updated successfully',
      policy: updatedPolicy,
      version: latestVersion + 1
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a policy
 * DELETE /api/policies/:id
 */
export async function deletePolicy(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Policy.delete(id);

    if (!deleted) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Policy not found'
        }
      });
    }

    res.json({
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Validate YAML syntax
 * POST /api/policies/validate
 */
export async function validateYAML(req, res, next) {
  try {
    const { yaml_content } = req.body;

    if (!yaml_content) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required field: yaml_content'
        }
      });
    }

    try {
      yaml.load(yaml_content);
      res.json({
        valid: true,
        message: 'YAML is valid'
      });
    } catch (yamlError) {
      res.status(400).json({
        valid: false,
        error: {
          code: 'INVALID_YAML',
          message: 'Invalid YAML syntax',
          details: yamlError.message
        }
      });
    }
  } catch (error) {
    next(error);
  }
}
