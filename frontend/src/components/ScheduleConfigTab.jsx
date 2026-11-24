import { formatDisplayDate } from '../utils/dateUtils';

const STAFFING_FIELDS = [
  ['Morning Specialists', 'morning', 'specialist'],
  ['Morning Interns', 'morning', 'intern'],
  ['Night Specialists', 'night', 'specialist'],
  ['Night Interns', 'night', 'intern'],
];

const ScheduleConfigTab = ({ config, setConfig }) => {
  const handleConfigChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const invalidPeriod = config.start_date && config.end_date && config.end_date < config.start_date;

  const staffingSection = (title, period) => (
    <section className="config-section">
      <h3>{title}</h3>
      <div className="form-row">
        {STAFFING_FIELDS.map(([label, shift, role]) => {
          const field = `${shift}_${period}_${role}`;
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
            value={config.start_date || ''}
            onChange={(e) => handleConfigChange('start_date', e.target.value)}
          />
        </div>

        <div className="form-group grow-1">
          <label className="form-label" htmlFor="end-date">End Date</label>
          <input
            id="end-date"
            type="date"
            className="form-input"
            value={config.end_date || ''}
            min={config.start_date || undefined}
            onChange={(e) => handleConfigChange('end_date', e.target.value)}
          />
        </div>
      </div>

      {invalidPeriod && (
        <div className="alert error" role="alert">The end date must be on or after the start date.</div>
      )}

      {config.start_date && config.end_date && !invalidPeriod && (
        <h4 className="period">
          Selected Period: {formatDisplayDate(config.start_date)} to {formatDisplayDate(config.end_date)}
        </h4>
      )}

      {staffingSection('Weekday Staffing', 'weekday')}
      {staffingSection('Weekend Staffing', 'weekend')}
    </div>
  );
};

export default ScheduleConfigTab;
