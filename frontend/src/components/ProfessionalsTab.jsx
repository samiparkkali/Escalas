import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfessionalsTab = ({ professionals, setProfessionals }) => {
  const [newProfessionalName, setNewProfessionalName] = useState('');
  const [newProfessionalRole, setNewProfessionalRole] = useState('specialist');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/professionals');
      setProfessionals(
        response.data.map((p) => ({
          id: p.id,
          name: p.name,
          role: p.role,
          isActive: p.is_active,
        }))
      );
      setError('');
    } catch (err) {
      setError('Failed to load professionals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProfessional = async () => {
    if (!newProfessionalName.trim()) return;

    try {
      setLoading(true);
      const response = await axios.post('/api/professionals', {
        name: newProfessionalName.trim(),
        role: newProfessionalRole,
      });

      setProfessionals([
        ...professionals,
        {
          id: response.data.id,
          name: response.data.name,
          role: response.data.role,
          isActive: response.data.is_active,
        },
      ]);

      setNewProfessionalName('');
      setNewProfessionalRole('specialist');
      setError('');
    } catch (err) {
      setError('Failed to add professional');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfessional = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/api/professionals/${id}`);
      setProfessionals(professionals.filter((p) => p.id !== id));
    } catch (err) {
      setError('Failed to remove professional');
      console.error(err);
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

      <div className="form-group">
        <label className="form-label">Professional Name</label>
        <input
          className="form-input"
          value={newProfessionalName}
          onChange={(e) => setNewProfessionalName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Role</label>
        <select
          className="form-input"
          value={newProfessionalRole}
          onChange={(e) => setNewProfessionalRole(e.target.value)}
          disabled={loading}
        >
          <option value="specialist">Specialist</option>
          <option value="intern">Intern</option>
        </select>
      </div>

      <button
        className="btn-primary"
        onClick={handleAddProfessional}
        disabled={loading}
      >
        Add
      </button>

      <h3 style={{ marginTop: '24px' }}>
        Current Professionals ({professionals.length})
      </h3>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {professionals.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.role}</td>
                <td>
                  <button
                    className="btn-secondary"
                    onClick={() => handleRemoveProfessional(p.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {professionals.length === 0 && !loading && (
              <tr>
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