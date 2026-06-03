import React, { useState } from 'react';

export const LanguageSelector = () => {
  const [language, setLanguage] = useState('en');
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' }
  ];

  return (
    <div className="language-selector">
      <h3>Language Preferences</h3>
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value)}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};