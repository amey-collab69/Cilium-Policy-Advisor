import { useState, useEffect } from 'react';
import { flowAPI, policyAPI } from '../services/api';
import './TrafficViewer.css';

function TrafficViewer() {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFlows, setSelectedFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [generating, setGenerating] = useState(false);
  
  // Filters
  const [namespace, setNamespace] = useState('');
  const [port, setPort] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;

  useEffect(() => {
    fetchFlows();
  }, [page, namespace, port]);

  const fetchFlows = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit };
      if (namespace) params.namespace = namespace;
      if (port) params.port = port;
      
      const response = await flowAPI.getFlows(params);
      setFlows(response.data.flows);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.message || 'Failed to load flows');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlow = (flowId) => {
    setSelectedFlows(prev => {
      if (prev.includes(flowId)) {
        return prev.filter(id => id !== flowId);
      } else {
        return [...prev, flowId];
      }
    });
  };

  const handleViewDetails = (flow) => {
    setSelectedFlow(flow);
  };

  const handleCloseModal = () => {
    setSelectedFlow(null);
  };

  const handleGeneratePolicy = async () => {
    if (selectedFlows.length === 0) {
      alert('Please select at least one flow');
      return;
    }

    try {
      setGenerating(true);
      const policyName = prompt('Enter policy name:', 'generated-policy');
      if (!policyName) return;

      const response = await policyAPI.generatePolicy(selectedFlows, policyName);
      alert('Policy generated successfully!');
      window.location.href = `/policies/${response.data.policy.policy_id}`;
    } catch (err) {
      alert(`Failed to generate policy: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && flows.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading flows...
      </div>
    );
  }

  return (
    <div className="traffic-viewer">
      <div className="header">
        <h1>Traffic Viewer</h1>
        <button 
          className="btn btn-primary" 
          onClick={handleGeneratePolicy}
          disabled={selectedFlows.length === 0 || generating}
        >
          {generating ? 'Generating...' : `Generate Policy (${selectedFlows.length} selected)`}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <h2>Filters</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Namespace"
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="filter-input"
          />
          <button className="btn btn-secondary" onClick={() => { setNamespace(''); setPort(''); }}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Flows ({flows.length})</h2>
        {flows.length === 0 ? (
          <p>No flows found. Try adjusting your filters.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Timestamp</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Port</th>
                  <th>Protocol</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {flows.map((flow) => (
                  <tr key={flow.flow_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedFlows.includes(flow.flow_id)}
                        onChange={() => handleSelectFlow(flow.flow_id)}
                      />
                    </td>
                    <td>{formatTimestamp(flow.timestamp)}</td>
                    <td>{flow.source_namespace}/{flow.source_pod || 'unknown'}</td>
                    <td>{flow.destination_namespace}/{flow.destination_pod || 'unknown'}</td>
                    <td>{flow.destination_port || '-'}</td>
                    <td>{flow.protocol || '-'}</td>
                    <td>
                      <button 
                        className="btn-link" 
                        onClick={() => handleViewDetails(flow)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="btn btn-secondary" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button 
              className="btn btn-secondary" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedFlow && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Flow Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-content">
              <div className="detail-row">
                <strong>Flow ID:</strong> {selectedFlow.flow_id}
              </div>
              <div className="detail-row">
                <strong>Timestamp:</strong> {formatTimestamp(selectedFlow.timestamp)}
              </div>
              <div className="detail-row">
                <strong>Source Namespace:</strong> {selectedFlow.source_namespace}
              </div>
              <div className="detail-row">
                <strong>Source Pod:</strong> {selectedFlow.source_pod || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Source Labels:</strong>
                <pre>{JSON.stringify(selectedFlow.source_labels, null, 2)}</pre>
              </div>
              <div className="detail-row">
                <strong>Destination Namespace:</strong> {selectedFlow.destination_namespace}
              </div>
              <div className="detail-row">
                <strong>Destination Pod:</strong> {selectedFlow.destination_pod || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Destination Labels:</strong>
                <pre>{JSON.stringify(selectedFlow.destination_labels, null, 2)}</pre>
              </div>
              <div className="detail-row">
                <strong>Port:</strong> {selectedFlow.destination_port || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Protocol:</strong> {selectedFlow.protocol || 'N/A'}
              </div>
              {selectedFlow.http_method && (
                <>
                  <div className="detail-row">
                    <strong>HTTP Method:</strong> {selectedFlow.http_method}
                  </div>
                  <div className="detail-row">
                    <strong>HTTP Path:</strong> {selectedFlow.http_path}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrafficViewer;
