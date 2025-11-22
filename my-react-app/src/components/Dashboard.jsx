import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getMetrics();
      setMetrics(response.data.metrics);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Total Flows</h3>
            <p className="metric-value">{metrics?.totalFlows || 0}</p>
            <span className="metric-subtitle">Captured network flows</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🛡️</div>
          <div className="metric-content">
            <h3>Total Policies</h3>
            <p className="metric-value">{metrics?.totalPolicies || 0}</p>
            <span className="metric-subtitle">Generated policies</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <h3>Recent Flows</h3>
            <p className="metric-value">{metrics?.recentActivity?.flowsLast24h || 0}</p>
            <span className="metric-subtitle">Last 24 hours</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📝</div>
          <div className="metric-content">
            <h3>Recent Policies</h3>
            <p className="metric-value">{metrics?.recentActivity?.policiesLast24h || 0}</p>
            <span className="metric-subtitle">Last 24 hours</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => window.location.href = '/traffic'}>
            View Traffic Flows
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/policies'}>
            View Policies
          </button>
        </div>
      </div>

      <div className="card">
        <h2>About Cilium Policy Advisor</h2>
        <p>
          Automatically analyze live Kubernetes Hubble flow logs and generate least-privilege 
          CiliumNetworkPolicy YAML configurations. Monitor your network traffic, generate policies, 
          and maintain version history all in one place.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
