import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

const ScheduleViewTab = ({ 
  professionals, 
  unavailabilities, 
  config, 
  schedule, 
  setSchedule, 
  setStatistics 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSchedule = async () => {
    if (professionals.length === 0) {
      setError('Please add professionals first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/schedule/generate', {
        professionals,
        unavailabilities,
        config: {
          startDate: config.startDate.toISOString(),
          endDate: config.endDate.toISOString(),
          morningWeekday: config.morningWeekday,
          nightWeekday: config.nightWeekday,
          morningWeekend: config.morningWeekend,
          nightWeekend: config.nightWeekend,
        },
      });

      setSchedule(response.data.schedule);
      setStatistics(response.data.statistics);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await axios.get('/api/schedule/export', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'schedule.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download CSV');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Generate Schedule
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleGenerateSchedule}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Generate Schedule'}
        </Button>
        
        {schedule && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadCSV}
          >
            Download CSV
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {schedule && (
        <>
          <Typography variant="h6" gutterBottom>
            Schedule Results
          </Typography>
          
          {schedule.message && (
            <Alert severity={schedule.success ? "success" : "warning"} sx={{ mb: 2 }}>
              {schedule.message}
            </Alert>
          )}

          <Typography variant="subtitle1" gutterBottom>
            Assignments ({schedule.assignments?.length || 0})
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Professional</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Shift Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.assignments?.map((assignment, index) => (
                  <TableRow key={index}>
                    <TableCell>{assignment.professionalName}</TableCell>
                    <TableCell>{assignment.shiftDate}</TableCell>
                    <TableCell>{assignment.shiftType}</TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No assignments</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {schedule.unassignedShifts && schedule.unassignedShifts.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Unassigned Shifts ({schedule.unassignedShifts.length})
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Shift Type</TableCell>
                      <TableCell>Required Staff</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schedule.unassignedShifts.map((shift, index) => (
                      <TableRow key={index}>
                        <TableCell>{shift.date}</TableCell>
                        <TableCell>{shift.shiftType}</TableCell>
                        <TableCell>{shift.requiredStaff}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </>
      )}
    </Paper>
  );
};

export default ScheduleViewTab;