import { formatDisplayDate } from '../utils/dateUtils';

const UnassignedShiftsTable = ({ title, shifts }) => (
  <>
    <h4 className="danger">{title}</h4>
    <div className="table-container">
      <table className="table table-danger">
        <thead>
          <tr>
            <th>Date</th>
            <th>Shift</th>
            <th>Missing Specialists</th>
            <th>Missing Interns</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((s) => (
            <tr key={`${s.date}-${s.shift_type}`}>
              <td className="nowrap">{formatDisplayDate(s.date)}</td>
              <td className="capitalize">{s.shift_type}</td>
              <td className={s.required_specialists > 0 ? 'strong' : ''}>{s.required_specialists}</td>
              <td className={s.required_interns > 0 ? 'strong' : ''}>{s.required_interns}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

export default UnassignedShiftsTable;
