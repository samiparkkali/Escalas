import React from 'react';
import { formatDisplayDate, toIsoDate } from '../utils/dateUtils';

const ScheduleConfigTab = ({ config, setConfig }) => {
  const handleConfigChange = (field, value) => {
    setConfig({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Schedule Configuration</h2>
      </div>

      {/* Date range */}
      <div className="form-group">
        <label className="form-label">Start Date</label>
        <input
          type="date"
          className="form-input"
          value={toIsoDate(config.startDate)}
          onChange={(e) =>
            handleConfigChange('startDate', new Date(e.target.value))
          }
        />
      </div>

      <div className="form-group">
        <label className="form-label">End Date</label>
        <input
          type="date"
          className="form-input"
          value={toIsoDate(config.endDate)}
          onChange={(e) =>
            handleConfigChange('endDate', new Date(e.target.value))
          }
        />
      </div>

      {/* Specialist requirements */}
      <h3>Specialist requirements</h3>

      <div className="table-container">
        <table className="table">
          <tbody>
            <tr>
              <td>Morning Weekday Specialist</td>
              <td>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={config.morningWeekdaySpecialist}
                  onChange={(e) =>
                    handleConfigChange(
                      'morningWeekdaySpecialist',
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                />
              </td>
            </tr>

            <tr>
              <td>Night Weekday Specialist</td>
              <td>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={config.nightWeekdaySpecialist}
                  onChange={(e) =>
                    handleConfigChange(
                      'nightWeekdaySpecialist',
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                />
              </td>
            </tr>

            <tr>
              <td>Morning Weekend Specialist</td>
              <td>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={config.morningWeekendSpecialist}
                  onChange={(e) =>
                    handleConfigChange(
                      'morningWeekendSpecialist',
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                />
              </td>
            </tr>

            <tr>
              <td>Night Weekend Specialist</td>
              <td>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={config.nightWeekendSpecialist}
                  onChange={(e) =>
                    handleConfigChange(
                      'nightWeekendSpecialist',
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Intern requirements */}
      <h3>Intern requirements</h3>

      <div className="table-container">
        <table className="table">
          <tbody>
            <tr>
              <td>Morning Weekday Intern</td>
              <td>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={config.morningWeekdayIntern}
                  onChange={(e) =>
                    handleConfigChange(
                      'morningWeekdayIntern',
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                />
              </td>
            </tr>

            <tr>
              <td>Night Weekday Intern</td>
              <td>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={config.nightWeekdayIntern}
                  onChange={(e) =>
                    handleConfigChange(
                      'nightWeekdayIntern',
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                />
              </td>
            </tr>

            <tr>
              <td>Morning Weekend Intern</td>
              <td>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={config.morningWeekendIntern}
                  onChange={(e) =>
                    handleConfigChange(
                      'morningWeekendIntern',
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                />
              </td>
            </tr>

            <tr>
              <td>Night Weekend Intern</td>
              <td>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={config.nightWeekendIntern}
                  onChange={(e) =>
                    handleConfigChange(
                      'nightWeekendIntern',
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Period display */}
      <p style={{ marginTop: '20px', color: '#666' }}>
        Period: {formatDisplayDate(config.startDate)} to{' '}
        {formatDisplayDate(config.endDate)}
      </p>
    </div>
  );
};

export default ScheduleConfigTab;