import { useState } from 'react';
import api, { errorMessage } from '../utils/api';

const ProfessionalsTab = ({ professionals, setProfessionals, setUnavailabilities, loadingList }) => {
  const [newProfessionalName, setNewProfessionalName] = useState('');
  const [newProfessionalRole, setNewProfessionalRole] = useState('specialist');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddProfessional = async (event) => {
    event.preventDefault();
    if (!newProfessionalName.trim()) {
      setError('Enter a name.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/api/professionals', {
        name: newProfessionalName.trim(),
        role: newProfessionalRole,
      });
      setProfessionals((prev) => [...prev, response.data]);
      // The role is kept so several people of the same role can be added in a row.
      setNewProfessionalName('');
    } catch (err) {
      setError(errorMessage(err, 'Failed to add professional'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfessional = async (professional) => {
    if (!window.confirm(`Delete ${professional.name} and their unavailabilities?`)) return;
    try {
      setLoading(true);
      setError('');
      await api.delete(`/api/professionals/${professional.id}`);
      setProfessionals((prev) => prev.filter((p) => p.id !== professional.id));
      // The backend deletes the professional's unavailabilities too.
      setUnavailabilities((prev) => prev.filter((u) => u.professional_id !== professional.id));
    } catch (err) {
      setError(errorMessage(err, 'Failed to remove professional'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Manage Professionals</h2>
      </div>

      {error && <div className="alert error" role="alert">{error}</div>}

      <form className="form-row" onSubmit={handleAddProfessional}>
        <div className="form-group grow-2">
          <label className="form-label" htmlFor="professional-name">Name</label>
          <input
            id="professional-name"
            className="form-input"
            placeholder="e.g. Dr. Jane Doe"
            value={newProfessionalName}
            onChange={(e) => setNewProfessionalName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group grow-1">
          <label className="form-label" htmlFor="professional-role">Role</label>
          <select
            id="professional-role"
            className="form-input"
            value={newProfessionalRole}
            onChange={(e) => setNewProfessionalRole(e.target.value)}
            disabled={loading}
          >
            <option value="specialist">Specialist</option>
            <option value="intern">Intern</option>
          </select>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Add Professional'}
        </button>
      </form>

      <h4>Current Professionals ({professionals.length})</h4>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th className="col-action" />
            </tr>
          </thead>
          <tbody>
            {professionals.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="capitalize">{p.role}</td>
                <td>
                  <button
                    className="btn-secondary"
                    onClick={() => handleRemoveProfessional(p)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {professionals.length === 0 && (
              <tr className="empty-state-message">
                <td colSpan="3">{loadingList ? 'Loading…' : 'No professionals added yet'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfessionalsTab;
