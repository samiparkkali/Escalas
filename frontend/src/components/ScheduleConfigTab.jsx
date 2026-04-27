import React from 'react';
import { formatDisplayDate } from '../utils/dateUtils';

const ScheduleConfigTab = ({ config, setConfig }) => {
  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Schedule Configuration</h2>
      </div>

      {/* Date range */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-input"
            value={config.startDate || ''}
            onChange={(e) =>
              handleConfigChange('startDate', e.target.value)
            }
          />
        </div>

        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-input"
            value={config.endDate || ''}
            onChange={(e) =>
              handleConfigChange('endDate', e.target.value)
            }
          />
        </div>
      </div>

      {/* Period display */}
      {config.startDate && config.endDate && (
        <h4 style={{ textAlign: 'left', marginTop: 0 }}>
          Selected Period: {formatDisplayDate(config.startDate)} to {formatDisplayDate(config.endDate)}
        </h4>
      )}

      <div style={{ marginTop: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Weekday Staffing</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '16px' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label className="form-label">Morning Specialists</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.morningWeekdaySpecialist}
                onChange={(e) => handleConfigChange('morningWeekdaySpecialist', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label className="form-label">Morning Interns</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.morningWeekdayIntern}
                onChange={(e) => handleConfigChange('morningWeekdayIntern', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label className="form-label">Night Specialists</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.nightWeekdaySpecialist}
                onChange={(e) => handleConfigChange('nightWeekdaySpecialist', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label className="form-label">Night Interns</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.nightWeekdayIntern}
                onChange={(e) => handleConfigChange('nightWeekdayIntern', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Weekend Staffing</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '16px' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label className="form-label">Morning Specialists</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.morningWeekendSpecialist}
                onChange={(e) => handleConfigChange('morningWeekendSpecialist', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label className="form-label">Morning Interns</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.morningWeekendIntern}
                onChange={(e) => handleConfigChange('morningWeekendIntern', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label className="form-label">Night Specialists</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.nightWeekendSpecialist}
                onChange={(e) => handleConfigChange('nightWeekendSpecialist', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label className="form-label">Night Interns</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={config.nightWeekendIntern}
                onChange={(e) => handleConfigChange('nightWeekendIntern', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleConfigTab;