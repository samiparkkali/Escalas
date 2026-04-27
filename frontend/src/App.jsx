import React, { useState } from 'react';

import ProfessionalsTab from './components/ProfessionalsTab';
import UnavailabilitiesTab from './components/UnavailabilitiesTab';
import ScheduleConfigTab from './components/ScheduleConfigTab';
import ScheduleViewTab from './components/ScheduleViewTab';
import StatisticsTab from './components/StatisticsTab';
import { toIsoDate } from './utils/dateUtils';

function App() {
  const today = new Date();

  const startDate = toIsoDate(
    new Date(today.getFullYear(), today.getMonth() + 1, 1)
  );

  const endDate = toIsoDate(
    new Date(today.getFullYear(), today.getMonth() + 2, 0)
  );

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
    <>
      <h2>HBA — Shift Scheduler</h2>

      {/* Tabs */}
      <nav>
        <button onClick={() => setActiveTab(0)}>Medical Professionals</button>
        <button onClick={() => setActiveTab(1)}>Unavailabilities</button>
        <button onClick={() => setActiveTab(2)}>Schedule Config</button>
        <button onClick={() => setActiveTab(3)}>Generate Schedule</button>
        <button onClick={() => setActiveTab(4)}>Statistics</button>
      </nav>

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
    </>
  );
}

export default App;