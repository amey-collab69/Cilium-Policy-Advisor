import { dbRun, dbGet, dbAll } from '../database.js';
import { randomUUID } from 'crypto';

/**
 * Flow Model - Handles database operations for flow records
 */
class Flow {
  /**
   * Create a new flow record
   * @param {Object} flowData - Flow data object
   * @returns {Promise<string>} - Created flow ID
   */
  static async create(flowData) {
    const flowId = randomUUID();
    const {
      timestamp,
      source_namespace,
      source_pod,
      source_labels,
      destination_namespace,
      destination_pod,
      destination_labels,
      destination_port,
      protocol,
      http_method,
      http_path
    } = flowData;

    const query = `
      INSERT INTO flows (
        flow_id, timestamp, source_namespace, source_pod, source_labels,
        destination_namespace, destination_pod, destination_labels,
        destination_port, protocol, http_method, http_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await dbRun(query, [
      flowId,
      timestamp,
      source_namespace,
      source_pod || null,
      JSON.stringify(source_labels || {}),
      destination_namespace,
      destination_pod || null,
      JSON.stringify(destination_labels || {}),
      destination_port || null,
      protocol || null,
      http_method || null,
      http_path || null
    ]);

    return flowId;
  }

  /**
   * Find all flows with optional filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Flows and total count
   */
  static async findAll(filters = {}, pagination = {}) {
    const { namespace, service, port, page = 1, limit = 50 } = { ...filters, ...pagination };
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM flows WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM flows WHERE 1=1';
    const params = [];

    // Apply filters
    if (namespace) {
      query += ' AND (source_namespace = ? OR destination_namespace = ?)';
      countQuery += ' AND (source_namespace = ? OR destination_namespace = ?)';
      params.push(namespace, namespace);
    }

    if (port) {
      query += ' AND destination_port = ?';
      countQuery += ' AND destination_port = ?';
      params.push(port);
    }

    // Get total count
    const { total } = await dbGet(countQuery, params);

    // Add ordering and pagination
    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    const flows = await dbAll(query, [...params, limit, offset]);

    // Parse JSON labels
    const parsedFlows = flows.map(flow => ({
      ...flow,
      source_labels: JSON.parse(flow.source_labels || '{}'),
      destination_labels: JSON.parse(flow.destination_labels || '{}')
    }));

    return {
      flows: parsedFlows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Find a single flow by ID
   * @param {string} flowId - Flow ID
   * @returns {Promise<Object|null>} - Flow object or null
   */
  static async findById(flowId) {
    const query = 'SELECT * FROM flows WHERE flow_id = ?';
    const flow = await dbGet(query, [flowId]);

    if (!flow) return null;

    return {
      ...flow,
      source_labels: JSON.parse(flow.source_labels || '{}'),
      destination_labels: JSON.parse(flow.destination_labels || '{}')
    };
  }

  /**
   * Find multiple flows by IDs
   * @param {Array<string>} flowIds - Array of flow IDs
   * @returns {Promise<Array>} - Array of flow objects
   */
  static async findByIds(flowIds) {
    if (!flowIds || flowIds.length === 0) return [];

    const placeholders = flowIds.map(() => '?').join(',');
    const query = `SELECT * FROM flows WHERE flow_id IN (${placeholders})`;
    const flows = await dbAll(query, flowIds);

    return flows.map(flow => ({
      ...flow,
      source_labels: JSON.parse(flow.source_labels || '{}'),
      destination_labels: JSON.parse(flow.destination_labels || '{}')
    }));
  }

  /**
   * Delete a flow record
   * @param {string} flowId - Flow ID
   * @returns {Promise<boolean>} - Success status
   */
  static async delete(flowId) {
    const query = 'DELETE FROM flows WHERE flow_id = ?';
    const result = await dbRun(query, [flowId]);
    return result.changes > 0;
  }
}

export default Flow;
