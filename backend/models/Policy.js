import { dbRun, dbGet, dbAll } from '../database.js';
import { randomUUID } from 'crypto';

/**
 * Policy Model - Handles database operations for policy records
 */
class Policy {
  /**
   * Create a new policy record
   * @param {Object} policyData - Policy data object
   * @returns {Promise<string>} - Created policy ID
   */
  static async create(policyData) {
    const policyId = randomUUID();
    const {
      policy_name,
      namespace,
      yaml_content,
      status = 'draft'
    } = policyData;

    const query = `
      INSERT INTO policies (
        policy_id, policy_name, namespace, yaml_content, status
      ) VALUES (?, ?, ?, ?, ?)
    `;

    await dbRun(query, [
      policyId,
      policy_name,
      namespace,
      yaml_content,
      status
    ]);

    return policyId;
  }

  /**
   * Find all policies
   * @returns {Promise<Array>} - Array of policy objects
   */
  static async findAll() {
    const query = 'SELECT * FROM policies ORDER BY created_at DESC';
    const policies = await dbAll(query);
    return policies;
  }

  /**
   * Find a single policy by ID
   * @param {string} policyId - Policy ID
   * @returns {Promise<Object|null>} - Policy object or null
   */
  static async findById(policyId) {
    const query = 'SELECT * FROM policies WHERE policy_id = ?';
    const policy = await dbGet(query, [policyId]);
    return policy || null;
  }

  /**
   * Find a policy by name
   * @param {string} policyName - Policy name
   * @returns {Promise<Object|null>} - Policy object or null
   */
  static async findByName(policyName) {
    const query = 'SELECT * FROM policies WHERE policy_name = ?';
    const policy = await dbGet(query, [policyName]);
    return policy || null;
  }

  /**
   * Update a policy's YAML content
   * @param {string} policyId - Policy ID
   * @param {string} yamlContent - New YAML content
   * @returns {Promise<boolean>} - Success status
   */
  static async update(policyId, yamlContent) {
    const query = `
      UPDATE policies 
      SET yaml_content = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE policy_id = ?
    `;
    const result = await dbRun(query, [yamlContent, policyId]);
    return result.changes > 0;
  }

  /**
   * Delete a policy record
   * @param {string} policyId - Policy ID
   * @returns {Promise<boolean>} - Success status
   */
  static async delete(policyId) {
    const query = 'DELETE FROM policies WHERE policy_id = ?';
    const result = await dbRun(query, [policyId]);
    return result.changes > 0;
  }
}

export default Policy;
