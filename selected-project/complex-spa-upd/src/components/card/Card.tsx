import { useState } from 'react';
import styles from './Card.module.css';

export const Card = ({ title, description, imageUrl, variant = 'default' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`${styles.card} ${styles[variant]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={title} className={styles.image} />
        {variant === 'highlight' && <div className={styles.badge}>Featured</div>}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <button 
          className={`${styles.button} ${isHovered ? styles.hover : ''}`}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export const ProfileCard = ({ user }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className={styles.profileCard}>
      <div className={styles.avatarContainer}>
        <img src={user.avatar} alt={user.name} className={styles.avatar} />
      </div>
      <div className={styles.profileContent}>
        <h3 className={styles.profileName}>{user.name}</h3>
        <p className={styles.profileRole}>{user.role}</p>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{user.posts}</span>
            <span className={styles.statLabel}>Posts</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{user.followers}</span>
            <span className={styles.statLabel}>Followers</span>
          </div>
        </div>
        <button 
          className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
          onClick={() => setIsFollowing(!isFollowing)}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>
  );
};

export const StatCard = ({ icon, value, label, trend }) => {
  const isPositive = trend.direction === 'up';
  
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statInfo}>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
      <div className={`${styles.trend} ${isPositive ? styles.positive : styles.negative}`}>
        <span>{trend.value}%</span>
        <span>{isPositive ? '↑' : '↓'}</span>
      </div>
    </div>
  );
};