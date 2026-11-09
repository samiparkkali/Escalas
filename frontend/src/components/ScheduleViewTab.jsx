import { useState } from 'react';
import api, { downloadSchedule, errorMessage } from '../utils/api';
import { formatDisplayDate, toIsoDate } from '../utils/dateUtils';

const ScheduleViewTab = ({ config, schedule, setSchedule }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSchedule = async (is24hMode) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/schedule/generate', {
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
    } catch (err) {
      setError(errorMessage(err, 'Failed to generate schedule'));
    } finally {
      setLoading(false);
    }
  };

  const handleExportSchedule = async () => {
    setError('');
    try {
      await downloadSchedule();
    } catch (err) {
      setError(errorMessage(err, 'Failed to export schedule'));
    }
  };

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Generate Schedule</h2>
      </div>

      <div className="button-row">
        <button className="btn-secondary" onClick={() => handleGenerateSchedule(false)} disabled={loading}>
          {loading ? 'Generating…' : 'Generate Standard Schedule'}
        </button>

        <button className="btn-secondary" onClick={() => handleGenerateSchedule(true)} disabled={loading}>
          {loading ? 'Generating…' : 'Generate Schedule - 24h Format'}
        </button>

        {schedule && (
          <button className="btn-primary push-right" onClick={handleExportSchedule} disabled={loading}>
            Export Schedule
          </button>
        )}
      </div>

      {error && <div className="alert error" role="alert">{error}</div>}

      {!schedule && !error && (
        <p className="empty-state-message">
          No schedule yet. Set the period and staffing in Schedule Config, then generate.
        </p>
      )}

      {schedule && (
        <>
          <div className={`alert ${schedule.success ? 'success' : 'warning'}`}>
            {schedule.message} for {formatDisplayDate(schedule.start_date)} to{' '}
            {formatDisplayDate(schedule.end_date)}
            {schedule.is_24h ? ' (24h format)' : ''}.
          </div>

          {schedule.unassigned_shifts?.length > 0 && (
            <>
              <h4 className="danger">Unassigned Shifts ({schedule.unassigned_shifts.length})</h4>
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
                    {schedule.unassigned_shifts.map((s) => (
                      <tr key={`${s.date}-${s.shift_type}`}>
                        <td className="nowrap">{formatDisplayDate(s.date)}</td>
                        <td className="capitalize">{s.shift_type}</td>
                        <td>{s.required_specialists}</td>
                        <td>{s.required_interns}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <h4>Assignments ({schedule.assignments?.length || 0})</h4>
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
                {schedule.assignments?.map((a) => (
                  <tr key={`${a.professional_id}-${a.shift_date}-${a.shift_type}`}>
                    <td>{a.professional_name}</td>
                    <td className="capitalize">{a.professional_role}</td>
                    <td className="nowrap">{formatDisplayDate(a.shift_date)}</td>
                    <td className="capitalize">{a.shift_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ScheduleViewTab;
