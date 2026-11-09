import { formatDisplayDate } from '../utils/dateUtils';

const STAFFING_FIELDS = [
  ['Morning Specialists', 'morning', 'Specialist'],
  ['Morning Interns', 'morning', 'Intern'],
  ['Night Specialists', 'night', 'Specialist'],
  ['Night Interns', 'night', 'Intern'],
];

const ScheduleConfigTab = ({ config, setConfig }) => {
  const handleConfigChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const invalidPeriod = config.startDate && config.endDate && config.endDate < config.startDate;

  const staffingSection = (title, period) => (
    <section className="config-section">
      <h3>{title}</h3>
      <div className="form-row">
        {STAFFING_FIELDS.map(([label, shift, role]) => {
          const field = `${shift}${period}${role}`;
          return (
            <div className="form-group grow-1 min-150" key={field}>
              <label className="form-label" htmlFor={field}>{label}</label>
              <input
                id={field}
                type="number"
                min="0"
                inputMode="numeric"
                className="form-input"
                value={config[field]}
                onChange={(e) => handleConfigChange(field, Math.max(0, parseInt(e.target.value, 10) || 0))}
              />
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="tab-panel">
      <div className="tab-header">
        <h2>Schedule Configuration</h2>
      </div>

      <div className="form-row">
        <div className="form-group grow-1">
          <label className="form-label" htmlFor="start-date">Start Date</label>
          <input
            id="start-date"
            type="date"
            className="form-input"
            value={config.startDate || ''}
            onChange={(e) => handleConfigChange('startDate', e.target.value)}
          />
        </div>

        <div className="form-group grow-1">
          <label className="form-label" htmlFor="end-date">End Date</label>
          <input
            id="end-date"
            type="date"
            className="form-input"
            value={config.endDate || ''}
            min={config.startDate || undefined}
            onChange={(e) => handleConfigChange('endDate', e.target.value)}
          />
        </div>
      </div>

      {invalidPeriod && (
        <div className="alert error" role="alert">The end date must be on or after the start date.</div>
      )}

      {config.startDate && config.endDate && !invalidPeriod && (
        <h4 className="period">
          Selected Period: {formatDisplayDate(config.startDate)} to {formatDisplayDate(config.endDate)}
        </h4>
      )}

      {staffingSection('Weekday Staffing', 'Weekday')}
      {staffingSection('Weekend Staffing', 'Weekend')}
    </div>
  );
};

export default ScheduleConfigTab;
