import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { formatDisplayDate } from '../utils/dateUtils';

const StatisticsTab = ({ statistics, setStatistics }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only fetch if we don't already have statistics passed as props
    if (!statistics || statistics.length === 0) {
      loadStatistics();
    }
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/schedule/statistics');
      setStatistics(response.data);
    } catch (err) {
      setError('Failed to load statistics from server');
    } finally {
      setLoading(false);
    }
  };

  const profStats = statistics?.professional_stats || [];
  const unassignedShifts = statistics?.unassigned_shifts || [];
  const hasData = profStats.length > 0 || unassignedShifts.length > 0;

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Schedule Statistics</h2>
      </div>

      {error && <div className="alert error">{error}</div>}

      {hasData ? (
        <>
          {profStats.length > 0 && (
            <div className="table-container">
              <h4>Professional Workload</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Professional</th>
                    <th>Morning</th>
                    <th>Night</th>
                    <th>Weekday</th>
                    <th>Weekend</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {profStats.map((stat, index) => (
                    <tr key={index}>
                      <td>{stat.name}</td>
                      <td>{stat.morning}</td>
                      <td>{stat.night}</td>
                      <td>{stat.weekday}</td>
                      <td>{stat.weekend}</td>
                      <td><strong>{stat.total}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {unassignedShifts.length > 0 && (
            <div className="table-container" style={{ marginTop: '40px' }}>
              <h4 style={{ color: '#b42318' }}>Missing (Unassigned) Shifts</h4>
              <table className="table">
                <thead style={{ backgroundColor: '#fdecea' }}>
                  <tr style={{ color: '#b42318' }}>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Missing Specialists</th>
                    <th>Missing Interns</th>
                  </tr>
                </thead>
                <tbody>
                  {unassignedShifts.map((s, i) => (
                    <tr key={i} style={{ backgroundColor: '#fffbfa' }}>
                      <td>{formatDisplayDate(s.date)}</td>
                      <td style={{ textTransform: 'capitalize' }}>{s.shift_type}</td>
                      <td style={{ fontWeight: s.required_specialists > 0 ? 'bold' : 'normal' }}>
                        {s.required_specialists}
                      </td>
                      <td style={{ fontWeight: s.required_interns > 0 ? 'bold' : 'normal' }}>
                        {s.required_interns}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <p className="empty-state-message">
          {loading
            ? 'Loading statistics...'
            : 'No statistics available. Generate a schedule first.'}
        </p>
      )}
    </div>
  );
};

export default StatisticsTab;