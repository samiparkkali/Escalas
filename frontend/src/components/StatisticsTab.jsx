import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import axios from 'axios';

const StatisticsTab = ({ statistics, setStatistics }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load statistics when component mounts or when statistics prop changes
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/schedule/statistics');
      setStatistics(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Schedule Statistics
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {statistics && statistics.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Professional</TableCell>
                <TableCell align="right">Morning Shifts</TableCell>
                <TableCell align="right">Night Shifts</TableCell>
                <TableCell align="right">Total Shifts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statistics.map((stat, index) => (
                <TableRow key={index}>
                  <TableCell>{stat.name}</TableCell>
                  <TableCell align="right">{stat.morning}</TableCell>
                  <TableCell align="right">{stat.night}</TableCell>
                  <TableCell align="right">{stat.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" color="text.secondary">
          {loading ? 'Loading statistics...' : 'No statistics available. Generate a schedule first.'}
        </Typography>
      )}
    </Paper>
  );
};

export default StatisticsTab;