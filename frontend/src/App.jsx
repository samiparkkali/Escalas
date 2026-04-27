import React, { useState } from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import ProfessionalsTab from './components/ProfessionalsTab';
import UnavailabilitiesTab from './components/UnavailabilitiesTab';
import ScheduleConfigTab from './components/ScheduleConfigTab';
import ScheduleViewTab from './components/ScheduleViewTab';
import StatisticsTab from './components/StatisticsTab';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [professionals, setProfessionals] = useState([]);
  const [unavailabilities, setUnavailabilities] = useState([]);
  const [scheduleConfig, setScheduleConfig] = useState({
    startDate: new Date(), // first day of next month
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // last day of next month 
    morningWeekday: 1,
    nightWeekday: 1,
    morningWeekend: 1,
    nightWeekend: 1,
  });
  const [schedule, setSchedule] = useState(null);
  const [statistics, setStatistics] = useState([]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          HBA - Shift Scheduler
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="shift scheduler tabs">
            <Tab label="Medical Professionals" />
            <Tab label="Unavailabilities" />
            <Tab label="Schedule Config" />
            <Tab label="Generate Schedule" />
            <Tab label="Statistics" />
          </Tabs>
        </Box>

        <Box sx={{ mt: 3 }}>
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
              unavailabilities={unavailabilities}
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
        </Box>
      </Box>
    </Container>
  );
}

export default App;