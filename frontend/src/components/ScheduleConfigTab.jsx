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
    <>
      <h3>Schedule Configuration</h3>

      {/* Date range */}
      <label>
        Start Date
        <input
          type="date"
          value={config.startDate || ''}
          onChange={(e) =>
            handleConfigChange('startDate', e.target.value)
          }
        />
      </label>

      <label>
        End Date
        <input
          type="date"
          value={config.endDate || ''}
          onChange={(e) =>
            handleConfigChange('endDate', e.target.value)
          }
        />
      </label>

      {/* Period display */}
      {config.startDate && config.endDate && (
        <p>
          Period:{' '}
          {formatDisplayDate(config.startDate)} to{' '}
          {formatDisplayDate(config.endDate)}
        </p>
      )}
    </>
  );
};

export default ScheduleConfigTab;