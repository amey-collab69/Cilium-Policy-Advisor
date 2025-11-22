import { useState, useEffect } from 'react';
import { policyAPI, versionAPI } from '../services/api';
import './PolicyHistory.css';

function PolicyHistory() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await policyAPI.getPolicies();
      setPolicies(response.data.policies);
    } catch (err) {
      setError(err.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPolicy = async (policy) => {
    try {
      setSelectedPolicy(policy);
      setSelectedVersion(null);
      setError(null);
      
      const response = await versionAPI.getVersionsByPolicy(policy.policy_id);
      setVersions(response.data.versions);
    } catch (err) {
      setError(err.message || 'Failed to load versions');
    }
  };

  const handleSelectVersion = (version) => {
    setSelectedVersion(version);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading policy history...
      </div>
    );
  }

  if (error && !selectedPolicy) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="policy-history">
      <h1>Policy History</h1>

      <div className="history-layout">
        <div className="policy-selector card">
          <h2>Select Policy</h2>
          {policies.length === 0 ? (
            <p>No policies found.</p>
          ) : (
            <ul className="policy-list">
              {policies.map((policy) => (
                <li
                  key={policy.policy_id}
                  className={selectedPolicy?.policy_id === policy.policy_id ? 'active' : ''}
                  onClick={() => handleSelectPolicy(policy)}
                >
                  <strong>{policy.policy_name}</strong>
                  <span className="policy-namespace">{policy.namespace}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="versions-panel">
          {selectedPolicy ? (
            <>
              <div className="card">
                <h2>Version History - {selectedPolicy.policy_name}</h2>
                {error && <div className="error">{error}</div>}
                {versions.length === 0 ? (
                  <p>No version history available.</p>
                ) : (
                  <div className="version-timeline">
                    {versions.map((version) => (
                      <div
                        key={version.version_id}
                        className={`version-item ${selectedVersion?.version_id === version.version_id ? 'active' : ''}`}
                        onClick={() => handleSelectVersion(version)}
                      >
                        <div className="version-marker">v{version.version_number}</div>
                        <div className="version-content">
                          <div className="version-header">
                            <strong>Version {version.version_number}</strong>
                            <span className="version-date">{formatDate(version.created_at)}</span>
                          </div>
                          {version.change_summary && (
                            <p className="version-summary">{version.change_summary}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedVersion && (
                <div className="card">
                  <h2>Version {selectedVersion.version_number} Content</h2>
                  <div className="version-details">
                    <p><strong>Created:</strong> {formatDate(selectedVersion.created_at)}</p>
                    {selectedVersion.change_summary && (
                      <p><strong>Changes:</strong> {selectedVersion.change_summary}</p>
                    )}
                  </div>
                  <div className="yaml-display">
                    <pre>{selectedVersion.yaml_content}</pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card">
              <p>Select a policy to view its version history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PolicyHistory;
