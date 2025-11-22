import Version from '../models/Version.js';

/**
 * Get all versions for a specific policy
 * GET /api/policies/:id/versions
 */
export async function getVersionsByPolicy(req, res, next) {
  try {
    const { id } = req.params;
    const versions = await Version.findByPolicyId(id);

    res.json({
      policy_id: id,
      versions,
      total: versions.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single version by ID
 * GET /api/versions/:id
 */
export async function getVersionById(req, res, next) {
  try {
    const { id } = req.params;
    const version = await Version.findById(id);

    if (!version) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Version not found'
        }
      });
    }

    res.json({ version });
  } catch (error) {
    next(error);
  }
}
