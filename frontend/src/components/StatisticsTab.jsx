import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../utils/api';
import UnassignedShiftsTable from './UnassignedShiftsTable';

const StatisticsTab = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/schedule/statistics');
      setStatistics(response.data);
    } catch (err) {
      setError(errorMessage(err, 'Failed to load statistics'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const profStats = statistics?.professional_stats || [];
  const unassignedShifts = statistics?.unassigned_shifts || [];
  const hasData = profStats.length > 0 || unassignedShifts.length > 0;

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Schedule Statistics</h2>
      </div>

      {error && (
        <div className="alert error" role="alert">
          {error}{' '}
          <button className="btn-link" onClick={loadStatistics}>Retry</button>
        </div>
      )}

      {hasData ? (
        <>
          {profStats.length > 0 && (
            <>
              <h4>Professional Workload</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Professional</th>
                      <th>Role</th>
                      <th>Morning</th>
                      <th>Night</th>
                      <th>Weekday</th>
                      <th>Weekend</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profStats.map((stat) => (
                      <tr key={stat.professional_id}>
                        <td>{stat.name}</td>
                        <td className="capitalize">{stat.role}</td>
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
            </>
          )}

          {unassignedShifts.length > 0 && (
            <UnassignedShiftsTable title="Missing (Unassigned) Shifts" shifts={unassignedShifts} />
          )}
        </>
      ) : (
        !error && (
          <p className="empty-state-message">
            {loading ? 'Loading statistics…' : 'No statistics available. Generate a schedule first.'}
          </p>
        )
      )}
    </div>
  );
};

export default StatisticsTab;
