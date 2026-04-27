import React, { useState } from 'react';
import axios from 'axios';
import { formatDisplayDate } from '../utils/dateUtils';

const ScheduleViewTab = ({ config, schedule, setSchedule, setStatistics }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSchedule = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/schedule/generate', {
        config: {
          start_date: config.startDate.toISOString().slice(0, 10),
          end_date: config.endDate.toISOString().slice(0, 10),
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

  const handleDownloadCSV = async () => {
    try {
      const response = await axios.get('/api/schedule/export', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'schedule.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError('Failed to download CSV');
    }
  };

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Generate Schedule</h2>
      </div>

      <button
        className="btn-primary"
        onClick={handleGenerateSchedule}
        disabled={loading}
      >
        {loading ? 'Generating…' : 'Generate Schedule'}
      </button>

      {schedule && (
        <button
          className="btn-secondary"
          style={{ marginLeft: '12px' }}
          onClick={handleDownloadCSV}
        >
          Download CSV
        </button>
      )}

      {error && <div className="alert error" style={{ marginTop: '16px' }}>{error}</div>}

      {schedule && (
        <>
          <h3 style={{ marginTop: '24px' }}>
            Assignments ({schedule.assignments?.length || 0})
          </h3>

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
              <h3 style={{ marginTop: '24px' }}>
                Unassigned Shifts ({schedule.unassigned_shifts.length})
              </h3>

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
                        <td>{s.date}</td>
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