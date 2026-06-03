import React from 'react';
import styles from './SidebarNavigation.module.css';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
}

interface SidebarNavigationProps {
  items: NavItem[];
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ items }) => {
  return (
    <nav className={styles.sidebar}>
      <ul className={styles.navList}>
        {items.map((item) => (
          <li key={item.path} className={styles.navItem}>
            <a 
              href={item.path} 
              className={`${styles.navLink} ${item.active ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};