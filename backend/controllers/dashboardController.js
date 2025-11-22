import { dbGet } from '../database.js';

/**
 * Get dashboard metrics
 * GET /api/dashboard/metrics
 */
export async function getMetrics(req, res, next) {
  try {
    // Get total flows count
    const flowsResult = await dbGet('SELECT COUNT(*) as total FROM flows');
    const totalFlows = flowsResult.total;

    // Get total policies count
    const policiesResult = await dbGet('SELECT COUNT(*) as total FROM policies');
    const totalPolicies = policiesResult.total;

    // Get recent activity (last 10 flows)
    const recentFlows = await dbGet(`
      SELECT COUNT(*) as count 
      FROM flows 
      WHERE created_at >= datetime('now', '-24 hours')
    `);

    // Get recent policies (last 24 hours)
    const recentPolicies = await dbGet(`
      SELECT COUNT(*) as count 
      FROM policies 
      WHERE created_at >= datetime('now', '-24 hours')
    `);

    res.json({
      metrics: {
        totalFlows,
        totalPolicies,
        recentActivity: {
          flowsLast24h: recentFlows.count,
          policiesLast24h: recentPolicies.count
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
