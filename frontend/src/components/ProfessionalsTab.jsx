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
        response.data.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          isActive: p.is_active,
        }))
      );

      setError('');
    } catch {
      setError('Failed to load professionals');
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

      setProfessionals(prev => [
        ...prev,
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
    } catch {
      setError('Failed to add professional');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfessional = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/api/professionals/${id}`);

      // ✅ ALWAYS use latest state
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
    <>
      <h3>Manage Professionals</h3>

      {error && <p>{error}</p>}

      <input
        placeholder="Professional Name"
        value={newProfessionalName}
        onChange={(e) => setNewProfessionalName(e.target.value)}
        disabled={loading}
      />

      <select
        value={newProfessionalRole}
        onChange={(e) => setNewProfessionalRole(e.target.value)}
        disabled={loading}
      >
        <option value="specialist">Specialist</option>
        <option value="intern">Intern</option>
      </select>

      <button onClick={handleAddProfessional} disabled={loading}>
        Add
      </button>

      <h4>Current Professionals ({professionals.length})</h4>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {professionals.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.role}</td>
              <td>
                <button
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
    </>
  );
};

export default ProfessionalsTab;