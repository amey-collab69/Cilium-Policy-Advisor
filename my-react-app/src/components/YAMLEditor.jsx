import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { policyAPI } from '../services/api';
import './YAMLEditor.css';

function YAMLEditor() {
  const { id } = useParams();
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [yamlContent, setYamlContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    if (id && policies.length > 0) {
      const policy = policies.find(p => p.policy_id === id);
      if (policy) {
        selectPolicy(policy);
      }
    }
  }, [id, policies]);

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

  const selectPolicy = (policy) => {
    setSelectedPolicy(policy);
    setYamlContent(policy.yaml_content);
    setIsEditing(false);
    setValidationError(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setYamlContent(selectedPolicy.yaml_content);
    setIsEditing(false);
    setValidationError(null);
  };

  const handleSave = async () => {
    try {
      setValidationError(null);
      
      // Validate YAML first
      await policyAPI.validateYAML(yamlContent);
      
      // Save if valid
      const changeSummary = prompt('Enter a summary of changes (optional):');
      await policyAPI.updatePolicy(selectedPolicy.policy_id, yamlContent, changeSummary);
      
      alert('Policy updated successfully!');
      setIsEditing(false);
      fetchPolicies();
    } catch (err) {
      setValidationError(err.message || 'Failed to save policy');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPolicy.policy_name}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading policies...
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="yaml-editor">
      <h1>Policy Editor</h1>

      <div className="editor-layout">
        <div className="policy-list card">
          <h2>Policies</h2>
          {policies.length === 0 ? (
            <p>No policies found. Generate a policy from the Traffic Viewer.</p>
          ) : (
            <ul className="policies">
              {policies.map((policy) => (
                <li
                  key={policy.policy_id}
                  className={selectedPolicy?.policy_id === policy.policy_id ? 'active' : ''}
                  onClick={() => selectPolicy(policy)}
                >
                  <div className="policy-item">
                    <strong>{policy.policy_name}</strong>
                    <span className="policy-namespace">{policy.namespace}</span>
                    <span className={`policy-status status-${policy.status}`}>
                      {policy.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="editor-panel">
          {selectedPolicy ? (
            <>
              <div className="card">
                <div className="editor-header">
                  <div>
                    <h2>{selectedPolicy.policy_name}</h2>
                    <p className="policy-meta">
                      Namespace: {selectedPolicy.namespace} | 
                      Status: {selectedPolicy.status} | 
                      Updated: {new Date(selectedPolicy.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="editor-actions">
                    {!isEditing ? (
                      <>
                        <button className="btn btn-primary" onClick={handleEdit}>
                          Edit
                        </button>
                        <button className="btn btn-secondary" onClick={handleDownload}>
                          Download
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-primary" onClick={handleSave}>
                          Save
                        </button>
                        <button className="btn btn-secondary" onClick={handleCancel}>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {validationError && (
                  <div className="error">{validationError}</div>
                )}

                <div className="yaml-content">
                  <textarea
                    value={yamlContent}
                    onChange={(e) => setYamlContent(e.target.value)}
                    disabled={!isEditing}
                    className="yaml-textarea"
                    spellCheck="false"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="card">
              <p>Select a policy from the list to view and edit its YAML content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default YAMLEditor;
