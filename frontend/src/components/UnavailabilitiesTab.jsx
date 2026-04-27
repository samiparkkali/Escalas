import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDisplayDate } from '../utils/dateUtils';

const UnavailabilitiesTab = ({
  professionals,
  unavailabilities,
  setUnavailabilities,
}) => {
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [date, setDate] = useState('');
  const [shiftType, setShiftType] = useState('morning');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUnavailabilities();
  }, []);

  const loadUnavailabilities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/unavailabilities');
      setUnavailabilities(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load unavailabilities');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnavailability = async () => {
    if (!selectedProfessional || !date) return;
    setError(''); // Clear previous errors

    try {
      setLoading(true);
      let newUnavailabilities = [];

      if (shiftType === 'all_day') {
        const morningResponse = await axios.post('/api/unavailabilities', {
          professional_id: selectedProfessional,
          date,
          shift_type: 'morning',
        });
        newUnavailabilities.push(morningResponse.data);

        const nightResponse = await axios.post('/api/unavailabilities', {
          professional_id: selectedProfessional,
          date,
          shift_type: 'night',
        });
        newUnavailabilities.push(nightResponse.data);
      } else {
        const response = await axios.post('/api/unavailabilities', {
          professional_id: selectedProfessional,
          date,
          shift_type: shiftType,
        });
        newUnavailabilities.push(response.data);
      }

      setUnavailabilities(prev => [...prev, ...newUnavailabilities]);
    } catch (err) {
      setError('Failed to add unavailability');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUnavailability = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/api/unavailabilities/${id}`);

      setUnavailabilities(prev =>
        prev.filter(u => u.id !== id)
      );
    } catch {
      setError('Failed to remove unavailability');
    } finally {
      setLoading(false);
    }
  };

  const getProfessionalName = (id) =>
    professionals.find(p => p.id === id)?.name || 'Unknown';

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Manage Unavailabilities</h2>
      </div>

      {error && <div className="alert error">{error}</div>}

      {/* Form */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
          <label className="form-label">Professional</label>
          <select
            className="form-input"
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            disabled={loading}
          >
            <option value="">Select professional</option>
            {professionals.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.role})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="form-label">Shift</label>
          <select
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

        <button className="btn-primary" onClick={handleAddUnavailability} disabled={loading}>
          {loading ? 'Adding...' : 'Add Unavailability'}
        </button>
      </div>

      {/* List */}
      <h4>Current Unavailabilities ({unavailabilities.length})</h4>

      {unavailabilities.length > 0 ? (
        <div className="table-container">
          <table className="table">
          <thead>
            <tr>
              <th>Professional</th>
              <th>Date</th>
              <th>Shift</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {unavailabilities.map(u => (
              <tr key={u.id}>
                <td>{getProfessionalName(u.professional_id)}</td>
                <td>{formatDisplayDate(u.date)}</td>
                <td>{u.shift_type}</td>
                <td>
                  <button                    className="btn-secondary"
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
        !loading && <p className="empty-state-message">No unavailabilities set</p>
      )}
    </div>
  );
};

export default UnavailabilitiesTab;