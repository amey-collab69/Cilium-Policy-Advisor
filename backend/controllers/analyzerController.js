import { spawn } from 'child_process';
import Flow from '../models/Flow.js';
import Policy from '../models/Policy.js';
import Version from '../models/Version.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate CiliumNetworkPolicy from flow data
 * POST /api/policies/generate
 */
export async function generatePolicy(req, res, next) {
  try {
    const { flow_ids, policy_name } = req.body;

    if (!flow_ids || !Array.isArray(flow_ids) || flow_ids.length === 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing or invalid flow_ids array'
        }
      });
    }

    // Fetch flows from database
    const flows = await Flow.findByIds(flow_ids);

    if (flows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'No flows found with provided IDs'
        }
      });
    }

    // Transform flows to Hubble format for analyzer
    const hubbleFlows = flows.map(flow => ({
      flow_id: flow.flow_id,
      timestamp: flow.timestamp,
      source: {
        namespace: flow.source_namespace,
        pod: flow.source_pod,
        labels: flow.source_labels
      },
      destination: {
        namespace: flow.destination_namespace,
        pod: flow.destination_pod,
        labels: flow.destination_labels
      },
      l4: flow.protocol && flow.destination_port ? {
        [flow.protocol]: {
          destination_port: flow.destination_port
        }
      } : {},
      l7: flow.http_method && flow.http_path ? {
        http: {
          method: flow.http_method,
          path: flow.http_path
        }
      } : {}
    }));

    // Spawn Python analyzer
    const yamlContent = await spawnAnalyzer(hubbleFlows);

    // Extract namespace from first flow
    const namespace = flows[0].destination_namespace;

    // Generate policy name if not provided
    const finalPolicyName = policy_name || `policy-${Date.now()}`;

    // Store policy in database
    const policyId = await Policy.create({
      policy_name: finalPolicyName,
      namespace,
      yaml_content: yamlContent,
      status: 'draft'
    });

    // Create initial version
    await Version.create({
      policy_id: policyId,
      version_number: 1,
      yaml_content: yamlContent,
      change_summary: 'Initial policy generation'
    });

    const policy = await Policy.findById(policyId);

    res.status(201).json({
      message: 'Policy generated successfully',
      policy
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Spawn Python analyzer process and capture output
 * @param {Array} flowData - Array of flow objects in Hubble format
 * @returns {Promise<string>} - Generated YAML content
 */
function spawnAnalyzer(flowData) {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || 'python';
    const analyzerPath = path.join(__dirname, '../../analyzer/analyze.py');

    const pythonProcess = spawn(pythonPath, [analyzerPath]);

    let stdout = '';
    let stderr = '';

    // Set timeout
    const timeout = setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Analyzer execution timeout (30 seconds)'));
    }, 30000);

    // Capture stdout
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // Capture stderr
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        const error = new Error('Analyzer execution failed');
        error.code = 'ANALYZER_FAILED';
        error.details = stderr || 'Unknown error';
        error.status = 500;
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });

    // Handle process errors
    pythonProcess.on('error', (err) => {
      clearTimeout(timeout);
      const error = new Error('Failed to spawn analyzer process');
      error.code = 'SPAWN_ERROR';
      error.details = err.message;
      error.status = 500;
      reject(error);
    });

    // Write flow data to stdin
    pythonProcess.stdin.write(JSON.stringify(flowData));
    pythonProcess.stdin.end();
  });
}
