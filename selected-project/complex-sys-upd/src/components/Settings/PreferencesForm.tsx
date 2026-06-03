import React, { useState } from 'react';
import { TextField, FormControlLabel, Switch, Button, Stack, Typography } from '@mui/material';

export const PreferencesForm: React.FC = () => {
  const [formData, setFormData] = useState({
    language: 'en',
    timezone: 'UTC',
    darkMode: false,
    notifications: true,
    emailFrequency: 'weekly'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Preferences saved:', formData);
    // Here you would typically make an API call to save preferences
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Typography variant="h6">Account Preferences</Typography>
        
        <TextField
          select
          label="Language"
          name="language"
          value={formData.language}
          onChange={handleChange}
          SelectProps={{ native: true }}
          fullWidth
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </TextField>

        <TextField
          select
          label="Timezone"
          name="timezone"
          value={formData.timezone}
          onChange={handleChange}
          SelectProps={{ native: true }}
          fullWidth
        >
          <option value="UTC">UTC</option>
          <option value="EST">Eastern Time (EST)</option>
          <option value="PST">Pacific Time (PST)</option>
          <option value="CET">Central European Time (CET)</option>
        </TextField>

        <FormControlLabel
          control={
            <Switch
              name="darkMode"
              checked={formData.darkMode}
              onChange={handleChange}
            />
          }
          label="Dark Mode"
        />

        <FormControlLabel
          control={
            <Switch
              name="notifications"
              checked={formData.notifications}
              onChange={handleChange}
            />
          }
          label="Enable Notifications"
        />

        <TextField
          select
          label="Email Frequency"
          name="emailFrequency"
          value={formData.emailFrequency}
          onChange={handleChange}
          SelectProps={{ native: true }}
          fullWidth
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </TextField>

        <Button type="submit" variant="contained" color="primary">
          Save Preferences
        </Button>
      </Stack>
    </form>
  );
};