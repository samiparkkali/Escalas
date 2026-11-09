import { useState } from 'react';
import api, { errorMessage } from '../utils/api';
import { formatDisplayDate } from '../utils/dateUtils';

const byDate = (a, b) => a.date.localeCompare(b.date) || a.shift_type.localeCompare(b.shift_type);

const UnavailabilitiesTab = ({ professionals, unavailabilities, setUnavailabilities, loadingList }) => {
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [date, setDate] = useState('');
  const [shiftType, setShiftType] = useState('morning');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddUnavailability = async (event) => {
    event.preventDefault();
    if (!selectedProfessional || !date) {
      setError('Choose a professional and a date.');
      return;
    }
    setError('');
    setLoading(true);

    const shifts = shiftType === 'all_day' ? ['morning', 'night'] : [shiftType];
    const added = [];
    const failures = [];
    for (const shift of shifts) {
      try {
        const response = await api.post('/api/unavailabilities', {
          professional_id: selectedProfessional,
          date,
          shift_type: shift,
        });
        added.push(response.data);
      } catch (err) {
        failures.push(errorMessage(err, `Failed to add ${shift} unavailability`));
      }
    }
    if (added.length) setUnavailabilities((prev) => [...prev, ...added].sort(byDate));
    if (failures.length) setError(failures.join(' '));
    setLoading(false);
  };

  const handleRemoveUnavailability = async (id) => {
    try {
      setLoading(true);
      setError('');
      await api.delete(`/api/unavailabilities/${id}`);
      setUnavailabilities((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(errorMessage(err, 'Failed to remove unavailability'));
    } finally {
      setLoading(false);
    }
  };

  const getProfessionalName = (id) => professionals.find((p) => p.id === id)?.name || 'Unknown';

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Manage Unavailabilities</h2>
      </div>

      {error && <div className="alert error" role="alert">{error}</div>}

      <form className="form-row" onSubmit={handleAddUnavailability}>
        <div className="form-group grow-2">
          <label className="form-label" htmlFor="unavailability-professional">Professional</label>
          <select
            id="unavailability-professional"
            className="form-input"
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            disabled={loading}
          >
            <option value="">Select professional</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.role})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group grow-1">
          <label className="form-label" htmlFor="unavailability-date">Date</label>
          <input
            id="unavailability-date"
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group grow-1">
          <label className="form-label" htmlFor="unavailability-shift">Shift</label>
          <select
            id="unavailability-shift"
            className="form-input"
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value)}
            disabled={loading}
          >
            <option value="morning">Morning</option>
            <option value="night">Night</option>
            <option value="all_day">All Day</option>
          </select>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Add Unavailability'}
        </button>
      </form>

      <h4>Current Unavailabilities ({unavailabilities.length})</h4>

      {unavailabilities.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Professional</th>
                <th>Date</th>
                <th>Shift</th>
                <th className="col-action" />
              </tr>
            </thead>
            <tbody>
              {unavailabilities.map((u) => (
                <tr key={u.id}>
                  <td>{getProfessionalName(u.professional_id)}</td>
                  <td className="nowrap">{formatDisplayDate(u.date)}</td>
                  <td className="capitalize">{u.shift_type}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => handleRemoveUnavailability(u.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state-message">{loadingList ? 'Loading…' : 'No unavailabilities set'}</p>
      )}
    </div>
  );
};

export default UnavailabilitiesTab;
