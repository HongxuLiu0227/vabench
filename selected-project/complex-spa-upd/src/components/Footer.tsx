import React from 'react';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logo}>Company</div>
        <nav className={styles.nav}>
          <a href="#" className={styles.link}>Terms</a>
          <a href="#" className={styles.link}>Privacy</a>
          <a href="#" className={styles.link}>Contact</a>
        </nav>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} All rights reserved
        </div>
      </div>
    </footer>
  );
};