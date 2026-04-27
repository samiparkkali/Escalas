import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const ProfessionalsTab = ({ professionals, setProfessionals }) => {
  const [newProfessional, setNewProfessional] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load professionals on component mount
  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/professionals');
      setProfessionals(response.data.map(p => ({
        id: p.id,
        name: p.name,
        isActive: p.is_active
      })));
      setError('');
    } catch (err) {
      setError('Failed to load professionals');
      console.error('Error loading professionals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProfessional = async () => {
    if (newProfessional.trim()) {
      try {
        setLoading(true);
        const response = await axios.post('/api/professionals', {
          name: newProfessional.trim()
        });
        setProfessionals([...professionals, {
          id: response.data.id,
          name: response.data.name,
          isActive: response.data.is_active
        }]);
        setNewProfessional('');
        setError('');
      } catch (err) {
        setError('Failed to add professional');
        console.error('Error adding professional:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveProfessional = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/api/professionals/${id}`);
      setProfessionals(professionals.filter(p => p.id !== id));
      setError('');
    } catch (err) {
      setError('Failed to remove professional');
      console.error('Error removing professional:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Manage Professionals
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Professional Name"
          value={newProfessional}
          onChange={(e) => setNewProfessional(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddProfessional()}
          disabled={loading}
        />
        <Button 
          variant="contained" 
          onClick={handleAddProfessional}
          disabled={!newProfessional.trim() || loading}
        >
          Add
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Current Professionals ({professionals.length})
      </Typography>
      
      <List>
        {professionals.map((professional) => (
          <ListItem
            key={professional.id}
            secondaryAction={
              <IconButton 
                edge="end" 
                aria-label="delete"
                onClick={() => handleRemoveProfessional(professional.id)}
                disabled={loading}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={professional.name} />
          </ListItem>
        ))}
        {professionals.length === 0 && !loading && (
          <ListItem>
            <ListItemText primary="No professionals added yet" />
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

export default ProfessionalsTab;