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

  const handleGenerateSchedule = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/schedule/generate', {
        config: {
          start_date: toIsoDate(config.startDate),
          end_date: toIsoDate(config.endDate),

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

  return (
    <>
      <h3>Generate Schedule</h3>

      <button onClick={handleGenerateSchedule} disabled={loading}>
        {loading ? 'Generating…' : 'Generate Schedule'}
      </button>

      {error && <p>{error}</p>}

      {schedule && (
        <>
          <h4>
            Assignments ({schedule.assignments?.length || 0})
          </h4>

          <table>
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

          {schedule.unassigned_shifts?.length > 0 && (
            <>
              <h4>
                Unassigned Shifts (
                {schedule.unassigned_shifts.length})
              </h4>

              <table>
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
            </>
          )}
        </>
      )}
    </>
  );
};

export default ScheduleViewTab;