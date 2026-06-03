import React, { useState } from 'react';

export const PreferencesForm = () => {
  const [preferences, setPreferences] = useState({
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    itemsPerPage: 25,
    emailFrequency: 'weekly'
  });

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save these preferences
    alert('Preferences saved!');
  };

  return (
    <div className="preferences-form">
      <h3>General Preferences</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Timezone</label>
          <select 
            name="timezone" 
            value={preferences.timezone} 
            onChange={handleChange}
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Date Format</label>
          <div className="radio-group">
            <label>
              <input 
                type="radio" 
                name="dateFormat" 
                value="MM/DD/YYYY" 
                checked={preferences.dateFormat === 'MM/DD/YYYY'} 
                onChange={handleChange} 
              />
              MM/DD/YYYY
            </label>
            <label>
              <input 
                type="radio" 
                name="dateFormat" 
                value="DD/MM/YYYY" 
                checked={preferences.dateFormat === 'DD/MM/YYYY'} 
                onChange={handleChange} 
              />
              DD/MM/YYYY
            </label>
            <label>
              <input 
                type="radio" 
                name="dateFormat" 
                value="YYYY-MM-DD" 
                checked={preferences.dateFormat === 'YYYY-MM-DD'} 
                onChange={handleChange} 
              />
              YYYY-MM-DD
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <label>Time Format</label>
          <div className="radio-group">
            <label>
              <input 
                type="radio" 
                name="timeFormat" 
                value="12h" 
                checked={preferences.timeFormat === '12h'} 
                onChange={handleChange} 
              />
              12-hour
            </label>
            <label>
              <input 
                type="radio" 
                name="timeFormat" 
                value="24h" 
                checked={preferences.timeFormat === '24h'} 
                onChange={handleChange} 
              />
              24-hour
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <label>Items Per Page</label>
          <input 
            type="number" 
            name="itemsPerPage" 
            min="5" 
            max="100" 
            value={preferences.itemsPerPage} 
            onChange={handleChange} 
          />
        </div>
        
        <div className="form-group">
          <label>Email Digest Frequency</label>
          <select 
            name="emailFrequency" 
            value={preferences.emailFrequency} 
            onChange={handleChange}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        
        <button type="submit">Save Preferences</button>
      </form>
    </div>
  );
};