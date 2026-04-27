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

    try {
      setLoading(true);
      const response = await axios.post('/api/unavailabilities', {
        professional_id: selectedProfessional,
        date, // yyyy-mm-dd
        shift_type: shiftType,
      });

      // ✅ latest state
      setUnavailabilities(prev => [...prev, response.data]);

      setSelectedProfessional('');
      setDate('');
      setShiftType('morning');
      setError('');
    } catch {
      setError('Failed to add unavailability');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUnavailability = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/api/unavailabilities/${id}`);

      // ✅ latest state
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
    <>
      <h3>Manage Unavailabilities</h3>

      {error && <p>{error}</p>}

      {/* Form */}
      <select
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

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        disabled={loading}
      />

      <select
        value={shiftType}
        onChange={(e) => setShiftType(e.target.value)}
        disabled={loading}
      >
        <option value="morning">Morning</option>
        <option value="night">Night</option>
      </select>

      <button onClick={handleAddUnavailability} disabled={loading}>
        Add Unavailability
      </button>

      {/* List */}
      <h4>Current Unavailabilities ({unavailabilities.length})</h4>

      {unavailabilities.length > 0 ? (
        <table>
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
                  <button
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
      ) : (
        !loading && <p>No unavailabilities set</p>
      )}
    </>
  );
};

export default UnavailabilitiesTab;