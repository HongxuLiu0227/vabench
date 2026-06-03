import { useState } from 'react';
import styles from './LoginForm.module.css';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password, rememberMe });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Welcome Back</h2>
      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          placeholder="your@email.com"
          required
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="password" className={styles.label}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          placeholder="••••••••"
          required
        />
      </div>
      <div className={styles.options}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className={styles.checkbox}
          />
          Remember me
        </label>
        <a href="#" className={styles.forgotLink}>Forgot password?</a>
      </div>
      <button type="submit" className={styles.submitButton}>Sign In</button>
      <p className={styles.signupText}>
        Don't have an account? <a href="#" className={styles.signupLink}>Sign up</a>
      </p>
    </form>
  );
};