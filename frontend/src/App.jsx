import React, { useState } from 'react';

import ProfessionalsTab from './components/ProfessionalsTab';
import UnavailabilitiesTab from './components/UnavailabilitiesTab';
import ScheduleConfigTab from './components/ScheduleConfigTab';
import ScheduleViewTab from './components/ScheduleViewTab';
import StatisticsTab from './components/StatisticsTab';

function App() {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

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
    morningWeekdayIntern: 1,
    nightWeekdayIntern: 1,
    morningWeekendIntern: 1,
    nightWeekendIntern: 1,
  });

  const [schedule, setSchedule] = useState(null);
  const [statistics, setStatistics] = useState([]);

  return (
    <div className="app-container">
      <header style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1>HBA – Shift Scheduler</h1>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 0 ? 'tab active' : 'tab'}
          onClick={() => setActiveTab(0)}
        >
          Medical Professionals
        </button>
        <button
          className={activeTab === 1 ? 'tab active' : 'tab'}
          onClick={() => setActiveTab(1)}
        >
          Unavailabilities
        </button>
        <button
          className={activeTab === 2 ? 'tab active' : 'tab'}
          onClick={() => setActiveTab(2)}
        >
          Schedule Config
        </button>
        <button
          className={activeTab === 3 ? 'tab active' : 'tab'}
          onClick={() => setActiveTab(3)}
        >
          Generate Schedule
        </button>
        <button
          className={activeTab === 4 ? 'tab active' : 'tab'}
          onClick={() => setActiveTab(4)}
        >
          Statistics
        </button>
      </div>

      {/* Tab content */}
      <div style={{ marginTop: '24px' }}>
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
            professionals={professionals}
            config={scheduleConfig}
            schedule={schedule}
            setSchedule={setSchedule}
            setStatistics={setStatistics}
          />
        )}

        {activeTab === 4 && (
          <StatisticsTab
            statistics={statistics}
            setStatistics={setStatistics}
          />
        )}
      </div>
    </div>
  );
}

export default App;