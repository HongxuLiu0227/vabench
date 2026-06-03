import { useState } from 'react';
import styles from './CompactTimeline.module.css';

interface Update {
  id: string;
  time: string;
  user: string;
  action: string;
  details: string;
  priority: 'low' | 'medium' | 'high';
}

export const CompactTimeline = () => {
  const [updates, setUpdates] = useState<Update[]>([
    {
      id: '1',
      time: '10:42 AM',
      user: 'Alex Johnson',
      action: 'Updated ticket status',
      details: 'Changed status from "In Progress" to "QA Review"',
      priority: 'medium'
    },
    {
      id: '2',
      time: '09:15 AM',
      user: 'Maria Garcia',
      action: 'Added comment',
      details: 'Requested additional documentation for API integration',
      priority: 'low'
    },
    {
      id: '3',
      time: 'Yesterday, 4:30 PM',
      user: 'Sam Wilson',
      action: 'Created new ticket',
      details: 'Reported critical bug in checkout process',
      priority: 'high'
    },
    {
      id: '4',
      time: 'Yesterday, 2:15 PM',
      user: 'Taylor Smith',
      action: 'Assigned ticket',
      details: 'Assigned UX redesign task to design team',
      priority: 'medium'
    }
  ]);

  return (
    <div className={styles.container}>
      <h3 className={styles.header}>Recent Activity</h3>
      <div className={styles.timeline}>
        {updates.map((update) => (
          <div key={update.id} className={`${styles.update} ${styles[update.priority]}`}>
            <div className={styles.time}>{update.time}</div>
            <div className={styles.dot}></div>
            <div className={styles.content}>
              <div className={styles.userAction}>
                <span className={styles.user}>{update.user}</span>
                <span className={styles.action}>{update.action}</span>
              </div>
              <p className={styles.details}>{update.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
