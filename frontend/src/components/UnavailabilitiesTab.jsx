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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnavailability = async () => {
    if (!selectedProfessional || !date) return;

    try {
      setLoading(true);
      const response = await axios.post('/api/unavailabilities', {
        professional_id: selectedProfessional,
        date,
        shift_type: shiftType,
      });

      setUnavailabilities([...unavailabilities, response.data]);

      setSelectedProfessional('');
      setDate('');
      setShiftType('morning');
      setError('');
    } catch (err) {
      setError('Failed to add unavailability');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUnavailability = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/api/unavailabilities/${id}`);
      setUnavailabilities(unavailabilities.filter((u) => u.id !== id));
    } catch (err) {
      setError('Failed to remove unavailability');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getProfessionalName = (professionalId) => {
    const prof = professionals.find((p) => p.id === professionalId);
    return prof ? prof.name : 'Unknown professional';
  };

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Manage Unavailabilities</h2>
      </div>

      {error && <div className="alert error">{error}</div>}

      {/* Form */}
      <div className="form-group">
        <label className="form-label">Professional</label>
        <select
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

      <div className="form-group">
        <label className="form-label">Date</label>
        <input
          type="date"
          className="form-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Shift Type</label>
        <select
          className="form-input"
          value={shiftType}
          onChange={(e) => setShiftType(e.target.value)}
          disabled={loading}
        >
          <option value="morning">Morning</option>
          <option value="night">Night</option>
        </select>
      </div>

      <button
        className="btn-primary"
        onClick={handleAddUnavailability}
        disabled={!selectedProfessional || !date || loading}
      >
        Add Unavailability
      </button>

      {/* List */}
      <h3 style={{ marginTop: '24px' }}>
        Current Unavailabilities ({unavailabilities.length})
      </h3>

      {unavailabilities.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Professional</th>
                <th>Date</th>
                <th>Shift</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {unavailabilities.map((u) => (
                <tr key={u.id}>
                  <td>{getProfessionalName(u.professional_id)}</td>
                  <td>{formatDisplayDate(u.date)}</td>
                  <td>{u.shift_type}</td>
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
        !loading && <p>No unavailabilities set</p>
      )}
    </div>
  );
};

export default UnavailabilitiesTab;