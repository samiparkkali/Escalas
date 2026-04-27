import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
} from '@mui/material';
import { format } from 'date-fns';

const ScheduleConfigTab = ({ config, setConfig }) => {
  const handleConfigChange = (field, value) => {
    setConfig({
      ...config,
      [field]: value,
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Schedule Configuration
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={format(config.startDate, 'yyyy-MM-dd')}
            onChange={(e) => handleConfigChange('startDate', new Date(e.target.value))}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={format(config.endDate, 'yyyy-MM-dd')}
            onChange={(e) => handleConfigChange('endDate', new Date(e.target.value))}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Staff Requirements
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Morning Weekday"
            type="number"
            value={config.morningWeekday}
            onChange={(e) => handleConfigChange('morningWeekday', parseInt(e.target.value) || 0)}
            inputProps={{ min: 0 }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Night Weekday"
            type="number"
            value={config.nightWeekday}
            onChange={(e) => handleConfigChange('nightWeekday', parseInt(e.target.value) || 0)}
            inputProps={{ min: 0 }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Morning Weekend"
            type="number"
            value={config.morningWeekend}
            onChange={(e) => handleConfigChange('morningWeekend', parseInt(e.target.value) || 0)}
            inputProps={{ min: 0 }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Night Weekend"
            type="number"
            value={config.nightWeekend}
            onChange={(e) => handleConfigChange('nightWeekend', parseInt(e.target.value) || 0)}
            inputProps={{ min: 0 }}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Period: {format(config.startDate, 'MMM dd, yyyy')} to {format(config.endDate, 'MMM dd, yyyy')}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ScheduleConfigTab;