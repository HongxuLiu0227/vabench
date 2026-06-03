import { useState } from 'react';
import styles from './FormInput.module.css';

export const FormInput = ({ label, type = 'text', placeholder = '' }) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`${styles.formGroup} ${isFocused ? styles.focused : ''}`}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
};