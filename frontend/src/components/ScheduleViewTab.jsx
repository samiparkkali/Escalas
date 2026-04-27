import React, { useState } from 'react';
import axios from 'axios';
import { formatDisplayDate, toIsoDate } from '../utils/dateUtils';

const ScheduleViewTab = ({
  config,
  schedule,
  setSchedule,
  setStatistics,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSchedule = async (is24hMode) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/schedule/generate', {
        config: {
          start_date: toIsoDate(config.startDate),
          end_date: toIsoDate(config.endDate),
          
          is_24h: is24hMode,

          morning_weekday_specialist: config.morningWeekdaySpecialist,
          night_weekday_specialist: config.nightWeekdaySpecialist,
          morning_weekend_specialist: config.morningWeekendSpecialist,
          night_weekend_specialist: config.nightWeekendSpecialist,

          morning_weekday_intern: config.morningWeekdayIntern,
          night_weekday_intern: config.nightWeekdayIntern,
          morning_weekend_intern: config.morningWeekendIntern,
          night_weekend_intern: config.nightWeekendIntern,
        },
      });

      setSchedule(response.data);

      const statsResponse = await axios.get('/api/schedule/statistics');
      setStatistics(statsResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to generate schedule'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportSchedule = () => {
    window.location.href = '/api/schedule/export';
  };

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Generate Schedule</h2>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button className="btn-secondary" onClick={() => handleGenerateSchedule(false)} disabled={loading}>
          {loading ? 'Generating…' : 'Generate Standard Schedule'}
        </button>
        
        <button className="btn-secondary" onClick={() => handleGenerateSchedule(true)} disabled={loading}>
          {loading ? 'Generating…' : 'Generate Schedule - 24h Format'}
        </button>

        {schedule && (
          <button 
            className="btn-primary" 
            onClick={handleExportSchedule}
            style={{ marginLeft: 'auto' }}
          >
            Export Schedule
          </button>
        )}
      </div>

      {error && <div className="alert error" style={{ marginTop: '20px' }}>{error}</div>}

      {schedule && (
        <>
          <h4>
            Assignments ({schedule.assignments?.length || 0})
          </h4>

          <div className="table-container">
            <table className="table">
            <thead>
              <tr>
                <th>Professional</th>
                <th>Role</th>
                <th>Date</th>
                <th>Shift</th>
              </tr>
            </thead>
            <tbody>
              {schedule.assignments?.map((a, i) => (
                <tr key={i}>
                  <td>{a.professional_name}</td>
                  <td>{a.professional_role}</td>
                  <td>{formatDisplayDate(a.shift_date)}</td>
                  <td>{a.shift_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {schedule.unassigned_shifts?.length > 0 && (
            <>
              <h4>
                Unassigned Shifts (
                {schedule.unassigned_shifts.length})
              </h4>

              <div className="table-container">
                <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Missing Specialists</th>
                    <th>Missing Interns</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.unassigned_shifts.map((s, i) => (
                    <tr key={i}>
                      <td>{formatDisplayDate(s.date)}</td>
                      <td>{s.shift_type}</td>
                      <td>{s.required_specialists}</td>
                      <td>{s.required_interns}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ScheduleViewTab;