import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatisticsTab = ({ statistics, setStatistics }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/schedule/statistics');
      setStatistics(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Schedule Statistics</h2>
      </div>

      {error && <div className="alert error">{error}</div>}

      {statistics && statistics.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Professional</th>
                <th>Morning Shifts</th>
                <th>Night Shifts</th>
                <th>Total Shifts</th>
              </tr>
            </thead>
            <tbody>
              {statistics.map((stat, index) => (
                <tr key={index}>
                  <td>{stat.name}</td>
                  <td>{stat.morning}</td>
                  <td>{stat.night}</td>
                  <td>{stat.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: '#666', marginTop: '12px' }}>
          {loading
            ? 'Loading statistics...'
            : 'No statistics available. Generate a schedule first.'}
        </p>
      )}
    </div>
  );
};

export default StatisticsTab;