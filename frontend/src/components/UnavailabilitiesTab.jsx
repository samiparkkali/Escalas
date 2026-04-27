import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  TextField,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import axios from 'axios';

const UnavailabilitiesTab = ({ professionals, unavailabilities, setUnavailabilities }) => {
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [date, setDate] = useState('');
  const [shiftType, setShiftType] = useState('morning');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load unavailabilities on component mount
  useEffect(() => {
    loadUnavailabilities();
  }, []);

  const loadUnavailabilities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/unavailabilities');
      setUnavailabilities(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load unavailabilities');
      console.error('Error loading unavailabilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnavailability = async () => {
    if (selectedProfessional && date) {
      try {
        setLoading(true);
        const response = await axios.post('/api/unavailabilities', {
          professional_id: selectedProfessional,
          date: date,
          shift_type: shiftType
        });
        setUnavailabilities([...unavailabilities, response.data]);
        setSelectedProfessional('');
        setDate('');
        setShiftType('morning');
        setError('');
      } catch (err) {
        setError('Failed to add unavailability');
        console.error('Error adding unavailability:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveUnavailability = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/api/unavailabilities/${id}`);
      setUnavailabilities(unavailabilities.filter(u => u.id !== id));
      setError('');
    } catch (err) {
      setError('Failed to remove unavailability');
      console.error('Error removing unavailability:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Manage Unavailabilities
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Professional</InputLabel>
          <Select
            value={selectedProfessional}
            label="Professional"
            onChange={(e) => setSelectedProfessional(e.target.value)}
            disabled={loading}
          >
            {professionals.map((professional) => (
              <MenuItem key={professional.id} value={professional.id}>
                {professional.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          disabled={loading}
        />

        <FormControl fullWidth>
          <InputLabel>Shift Type</InputLabel>
          <Select
            value={shiftType}
            label="Shift Type"
            onChange={(e) => setShiftType(e.target.value)}
            disabled={loading}
          >
            <MenuItem value="morning">Morning</MenuItem>
            <MenuItem value="night">Night</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleAddUnavailability}
          disabled={!selectedProfessional || !date || loading}
        >
          Add Unavailability
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Current Unavailabilities ({unavailabilities.length})
      </Typography>

      <List>
        {unavailabilities.map((unavailability) => (
          <ListItem
            key={unavailability.id}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleRemoveUnavailability(unavailability.id)}
                disabled={loading}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${unavailability.professional_name} - ${format(new Date(unavailability.date), 'yyyy-MM-dd')} - ${unavailability.shift_type}`}
            />
          </ListItem>
        ))}
        {unavailabilities.length === 0 && !loading && (
          <ListItem>
            <ListItemText primary="No unavailabilities set" />
          </ListItem>
        )}
        {loading && (
          <ListItem>
            <ListItemText primary="Loading..." />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default UnavailabilitiesTab;