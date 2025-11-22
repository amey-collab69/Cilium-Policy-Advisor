import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      throw error.response.data.error || error;
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
      throw { code: 'NETWORK_ERROR', message: 'Unable to connect to server' };
    } else {
      // Something else happened
      console.error('Error:', error.message);
      throw { code: 'UNKNOWN_ERROR', message: error.message };
    }
  }
);

// Flow API functions
export const flowAPI = {
  // Get all flows with optional filters
  getFlows: (params = {}) => api.get('/flows', { params }),
  
  // Get single flow by ID
  getFlowById: (id) => api.get(`/flows/${id}`),
  
  // Create new flow
  createFlow: (flowData) => api.post('/flows', flowData),
  
  // Delete flow
  deleteFlow: (id) => api.delete(`/flows/${id}`)
};

// Policy API functions
export const policyAPI = {
  // Get all policies
  getPolicies: () => api.get('/policies'),
  
  // Get single policy by ID
  getPolicyById: (id) => api.get(`/policies/${id}`),
  
  // Update policy
  updatePolicy: (id, yamlContent, changeSummary) => 
    api.put(`/policies/${id}`, { yaml_content: yamlContent, change_summary: changeSummary }),
  
  // Delete policy
  deletePolicy: (id) => api.delete(`/policies/${id}`),
  
  // Validate YAML
  validateYAML: (yamlContent) => api.post('/policies/validate', { yaml_content: yamlContent }),
  
  // Generate policy from flows
  generatePolicy: (flowIds, policyName) => 
    api.post('/policies/generate', { flow_ids: flowIds, policy_name: policyName })
};

// Version API functions
export const versionAPI = {
  // Get all versions for a policy
  getVersionsByPolicy: (policyId) => api.get(`/policies/${policyId}/versions`),
  
  // Get single version by ID
  getVersionById: (id) => api.get(`/versions/${id}`)
};

// Dashboard API functions
export const dashboardAPI = {
  // Get dashboard metrics
  getMetrics: () => api.get('/dashboard/metrics')
};

export default api;
