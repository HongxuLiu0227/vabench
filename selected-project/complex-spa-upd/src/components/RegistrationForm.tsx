import React, { useState } from 'react';
import styles from './RegistrationForm.module.css';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const RegistrationForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Create Account</h2>
      
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={styles.input}
          required
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
          required
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
          required
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={styles.input}
          required
        />
      </div>
      
      <button type="submit" className={styles.submitButton}>Register</button>
    </form>
  );
};