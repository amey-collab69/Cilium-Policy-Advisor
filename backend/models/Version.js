import { dbRun, dbGet, dbAll } from '../database.js';
import { randomUUID } from 'crypto';

/**
 * Version Model - Handles database operations for policy version records
 */
class Version {
  /**
   * Create a new version record
   * @param {Object} versionData - Version data object
   * @returns {Promise<string>} - Created version ID
   */
  static async create(versionData) {
    const versionId = randomUUID();
    const {
      policy_id,
      version_number,
      yaml_content,
      change_summary = null
    } = versionData;

    const query = `
      INSERT INTO versions (
        version_id, policy_id, version_number, yaml_content, change_summary
      ) VALUES (?, ?, ?, ?, ?)
    `;

    await dbRun(query, [
      versionId,
      policy_id,
      version_number,
      yaml_content,
      change_summary
    ]);

    return versionId;
  }

  /**
   * Find all versions for a specific policy
   * @param {string} policyId - Policy ID
   * @returns {Promise<Array>} - Array of version objects
   */
  static async findByPolicyId(policyId) {
    const query = `
      SELECT * FROM versions 
      WHERE policy_id = ? 
      ORDER BY version_number DESC
    `;
    const versions = await dbAll(query, [policyId]);
    return versions;
  }

  /**
   * Find a single version by ID
   * @param {string} versionId - Version ID
   * @returns {Promise<Object|null>} - Version object or null
   */
  static async findById(versionId) {
    const query = 'SELECT * FROM versions WHERE version_id = ?';
    const version = await dbGet(query, [versionId]);
    return version || null;
  }

  /**
   * Get the latest version number for a policy
   * @param {string} policyId - Policy ID
   * @returns {Promise<number>} - Latest version number (0 if no versions exist)
   */
  static async getLatestVersion(policyId) {
    const query = `
      SELECT MAX(version_number) as latest 
      FROM versions 
      WHERE policy_id = ?
    `;
    const result = await dbGet(query, [policyId]);
    return result?.latest || 0;
  }
}

export default Version;
