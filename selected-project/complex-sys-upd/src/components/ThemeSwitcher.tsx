import React, { useState } from 'react';

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="theme-switcher">
      <h3>Theme Preferences</h3>
      <div className="theme-options">
        <label>
          <input 
            type="radio" 
            name="theme" 
            checked={theme === 'light'} 
            onChange={() => setTheme('light')} 
          />
          Light Mode
        </label>
        <label>
          <input 
            type="radio" 
            name="theme" 
            checked={theme === 'dark'} 
            onChange={() => setTheme('dark')} 
          />
          Dark Mode
        </label>
      </div>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};