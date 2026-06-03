import { useState } from 'react';
import styles from './DataTable.module.css';

export const DataTable = () => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  const users = [
    { id: 1, name: 'Alex Johnson', email: 'alex.j@example.com', role: 'Developer', lastActive: '2023-05-15' },
    { id: 2, name: 'Maria Garcia', email: 'maria.g@example.com', role: 'Designer', lastActive: '2023-05-18' },
    { id: 3, name: 'James Wilson', email: 'james.w@example.com', role: 'Manager', lastActive: '2023-05-10' },
    { id: 4, name: 'Sarah Lee', email: 'sarah.l@example.com', role: 'QA Engineer', lastActive: '2023-05-20' }
  ];

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users];
  if (sortConfig !== null) {
    sortedUsers.sort((a, b) => {
      if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th onClick={() => requestSort('name')} className={styles.sortableHeader}>
              Name {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th onClick={() => requestSort('email')} className={styles.sortableHeader}>
              Email {sortConfig?.key === 'email' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th onClick={() => requestSort('role')} className={styles.sortableHeader}>
              Role {sortConfig?.key === 'role' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th onClick={() => requestSort('lastActive')} className={styles.sortableHeader}>
              Last Active {sortConfig?.key === 'lastActive' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user.id} className={styles.tableRow}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td><span className={styles.roleBadge}>{user.role}</span></td>
              <td>{user.lastActive}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};