import React from 'react';
import styles from './UserTable.module.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
}

interface UserTableProps {
  users: User[];
}

export const UserTable: React.FC<UserTableProps> = ({ users }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.userTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                  {user.status}
                </span>
              </td>
              <td>{user.lastLogin}</td>
              <td>
                <button className={styles.actionButton}>Edit</button>
                <button className={styles.actionButton}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};