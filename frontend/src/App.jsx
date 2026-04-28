import React, { useState } from 'react';

import Login from './components/Login';
import ProfessionalsTab from './components/ProfessionalsTab';
import UnavailabilitiesTab from './components/UnavailabilitiesTab';
import ScheduleConfigTab from './components/ScheduleConfigTab';
import ScheduleViewTab from './components/ScheduleViewTab';
import StatisticsTab from './components/StatisticsTab';
import { getNextMonthRange } from './utils/dateUtils';

function App() {

  
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const { startDate, endDate } = getNextMonthRange();

  const [activeTab, setActiveTab] = useState(0);
  const [professionals, setProfessionals] = useState([]);
  const [unavailabilities, setUnavailabilities] = useState([]);

  const [scheduleConfig, setScheduleConfig] = useState({
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
  });

  const [schedule, setSchedule] = useState(null);
  const [statistics, setStatistics] = useState([]);

  
  if (!loggedIn) {
    return <Login onSuccess={() => setLoggedIn(true)} />;
  }

  return (
    <div className="app-container">
      <header style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1>HBA — Shift Scheduler</h1>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 0 ? 'active' : ''}`} 
          onClick={() => setActiveTab(0)}
        >Medical Professionals</button>
        <button 
          className={`tab-button ${activeTab === 1 ? 'active' : ''}`} 
          onClick={() => setActiveTab(1)}
        >Unavailabilities</button>
        <button 
          className={`tab-button ${activeTab === 2 ? 'active' : ''}`} 
          onClick={() => setActiveTab(2)}
        >Schedule Config</button>
        <button 
          className={`tab-button ${activeTab === 3 ? 'active' : ''}`} 
          onClick={() => setActiveTab(3)}
        >Generate Schedule</button>
        <button 
          className={`tab-button ${activeTab === 4 ? 'active' : ''}`} 
          onClick={() => setActiveTab(4)}
        >Statistics</button>
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <ProfessionalsTab
          professionals={professionals}
          setProfessionals={setProfessionals}
        />
      )}

      {activeTab === 1 && (
        <UnavailabilitiesTab
          professionals={professionals}
          unavailabilities={unavailabilities}
          setUnavailabilities={setUnavailabilities}
        />
      )}

      {activeTab === 2 && (
        <ScheduleConfigTab
          config={scheduleConfig}
          setConfig={setScheduleConfig}
        />
      )}

      {activeTab === 3 && (
        <ScheduleViewTab
          config={scheduleConfig}
          schedule={schedule}
          setSchedule={setSchedule}
          setStatistics={setStatistics}
        />
      )}

      {activeTab === 4 && (
        <StatisticsTab statistics={statistics} />
      )}
    </div>
  );
}

export default App;