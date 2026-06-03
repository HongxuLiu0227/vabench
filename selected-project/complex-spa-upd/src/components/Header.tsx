import React from 'react';
import styles from './Header.module.css';

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>AppName</div>
        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>Home</a>
          <a href="#" className={styles.navLink}>Features</a>
          <a href="#" className={styles.navLink}>About</a>
          <a href="#" className={styles.navLink}>Contact</a>
        </nav>
        <button className={styles.ctaButton}>Sign In</button>
      </div>
    </header>
  );
};