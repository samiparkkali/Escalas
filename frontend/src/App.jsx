import { useCallback, useEffect, useState } from 'react';

import Login from './components/Login';
import ProfessionalsTab from './components/ProfessionalsTab';
import UnavailabilitiesTab from './components/UnavailabilitiesTab';
import ScheduleConfigTab from './components/ScheduleConfigTab';
import ScheduleViewTab from './components/ScheduleViewTab';
import StatisticsTab from './components/StatisticsTab';
import api, { errorMessage, getToken, logout, onUnauthorized, sessionCheckFailure } from './utils/api';
import { getNextMonthRange } from './utils/dateUtils';

const TABS = [
  'Medical Professionals',
  'Unavailabilities',
  'Schedule Config',
  'Generate Schedule',
  'Statistics',
];

const initialConfig = () => {
  const { startDate, endDate } = getNextMonthRange();
  return {
    startDate,
    endDate,
    morningWeekdaySpecialist: 1,
    nightWeekdaySpecialist: 1,
    morningWeekendSpecialist: 1,
    nightWeekendSpecialist: 1,

    morningWeekdayIntern: 2,
    nightWeekdayIntern: 2,
    morningWeekendIntern: 2,
    nightWeekendIntern: 2,
  };
};

function App() {
  // undefined while the stored token is being checked, null when signed out.
  const [user, setUser] = useState(getToken() ? undefined : null);
  const [activeTab, setActiveTab] = useState(0);
  const [professionals, setProfessionals] = useState([]);
  const [unavailabilities, setUnavailabilities] = useState([]);
  const [scheduleConfig, setScheduleConfig] = useState(initialConfig);
  const [schedule, setSchedule] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');

  const signOut = useCallback(() => {
    logout();
    setUser(null);
    setProfessionals([]);
    setUnavailabilities([]);
    setSchedule(null);
    setActiveTab(0);
  }, []);

  useEffect(() => onUnauthorized(signOut), [signOut]);

  const checkSession = useCallback(() => {
    setSessionError('');
    api.get('/api/auth/me')
      .then(({ data }) => setUser(data.username))
      .catch((err) => {
        if (sessionCheckFailure(err) === 'signed-out') signOut();
        else setSessionError(errorMessage(err, 'Could not check your session'));
      });
  }, [signOut]);

  useEffect(() => {
    if (user === undefined) checkSession();
  }, [user, checkSession]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [pros, unavs] = await Promise.all([
        api.get('/api/professionals'),
        api.get('/api/unavailabilities'),
      ]);
      setProfessionals(pros.data);
      setUnavailabilities(unavs.data);
      const latest = await api.get('/api/schedule');
      setSchedule(latest.data);
      if (latest.data) {
        setScheduleConfig((prev) => ({
          ...prev,
          startDate: latest.data.start_date,
          endDate: latest.data.end_date,
        }));
      }
    } catch (err) {
      setLoadError(errorMessage(err, 'Failed to load your data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  if (user === undefined) {
    return sessionError ? (
      <div className="login-container">
        <div className="alert error" role="alert">
          {sessionError}{' '}
          <button className="btn-link" onClick={checkSession}>Retry</button>{' '}
          <button className="btn-link" onClick={signOut}>Sign in again</button>
        </div>
      </div>
    ) : (
      <p className="empty-state-message centered">Loading…</p>
    );
  }

  if (user === null) {
    return <Login onSuccess={setUser} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>HBA — Shift Scheduler</h1>
        <div className="user-bar">
          <span>Signed in as <strong>{user}</strong></span>
          <button className="btn-link" onClick={signOut}>Log out</button>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((label, index) => (
          <button
            key={label}
            className={`tab-button ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {label}
          </button>
        ))}
      </nav>

      {loadError && (
        <div className="alert error" role="alert">
          {loadError}{' '}
          <button className="btn-link" onClick={loadData}>Retry</button>
        </div>
      )}

      {activeTab === 0 && (
        <ProfessionalsTab
          professionals={professionals}
          setProfessionals={setProfessionals}
          setUnavailabilities={setUnavailabilities}
          loadingList={loading}
        />
      )}

      {activeTab === 1 && (
        <UnavailabilitiesTab
          professionals={professionals}
          unavailabilities={unavailabilities}
          setUnavailabilities={setUnavailabilities}
          loadingList={loading}
        />
      )}

      {activeTab === 2 && (
        <ScheduleConfigTab config={scheduleConfig} setConfig={setScheduleConfig} />
      )}

      {activeTab === 3 && (
        <ScheduleViewTab config={scheduleConfig} schedule={schedule} setSchedule={setSchedule} />
      )}

      {activeTab === 4 && <StatisticsTab />}
    </div>
  );
}

export default App;
