import React, { useState, useEffect } from 'react';
import api from '../utils/axios';

const ProfessionalsTab = ({ professionals, setProfessionals }) => {
  const [newProfessionalName, setNewProfessionalName] = useState('');
  const [newProfessionalRole, setNewProfessionalRole] = useState('specialist');
  const [lastSelectedRole, setLastSelectedRole] = useState('specialist');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/professionals');

      setProfessionals(response.data);

      setError('');
    } catch {
      setError('Loading professionals is not possible at the moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProfessional = async () => {
    if (!newProfessionalName.trim()) return;

    try {
      setLoading(true);

      const response = await api.post('/api/professionals', {
        name: newProfessionalName.trim(),
        role: newProfessionalRole,
      });

      setProfessionals(prev => [...prev, response.data]
        );

      setNewProfessionalName('');
      setNewProfessionalRole(lastSelectedRole);
      setError('');
    } catch {
      setError('Failed to add professional');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfessional = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/professionals/${id}`);

      setProfessionals(prev =>
        prev.filter(p => p.id !== id)
      );
    } catch {
      setError('Failed to remove professional');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Manage Professionals</h2>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
          <label className="form-label">Name</label>
          <input
            className="form-input"
            placeholder="e.g. Dra. Maria Mateus"
            value={newProfessionalName}
            onChange={(e) => setNewProfessionalName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="form-label">Role</label>
          <select
            className="form-input"
            value={newProfessionalRole}
            onChange={(e) => {
              setNewProfessionalRole(e.target.value),
              setLastSelectedRole(e.target.value)
            }
          }
            disabled={loading}
          >
            <option value="specialist">Specialist</option>
            <option value="intern">Intern</option>
          </select>
        </div>

        <button className="btn-primary" onClick={handleAddProfessional} disabled={loading}>
          {loading ? 'Adding...' : 'Add Professional'}
        </button>
      </div>

      <h4>Current Professionals ({professionals.length})</h4>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th style={{ width: '100px' }} />
            </tr>
          </thead>
          <tbody>
            {professionals.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.role}</td>
                <td>
                  <button                    className="btn-secondary"
                    onClick={() => handleRemoveProfessional(p.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {professionals.length === 0 && !loading && (
              <tr className="empty-state-message">
                <td colSpan="3">No professionals added yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfessionalsTab;