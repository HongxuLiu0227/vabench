import React, { useState } from 'react';

export const PasswordChangeForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    // In a real app, you would call an API here
    setError('');
    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="password-change-form">
      <h3>Change Password</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Current Password</label>
          <input 
            type="password" 
            value={currentPassword} 
            onChange={(e) => setCurrentPassword(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Password changed successfully!</div>}
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};