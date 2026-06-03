import styles from './CompactTable.module.css';

export const CompactTable = () => {
  const recentTransactions = [
    { id: 'TX1001', date: '2023-05-20', amount: '$125.00', status: 'Completed', category: 'Shopping' },
    { id: 'TX1002', date: '2023-05-19', amount: '$42.50', status: 'Pending', category: 'Food' },
    { id: 'TX1003', date: '2023-05-18', amount: '$89.99', status: 'Completed', category: 'Entertainment' },
    { id: 'TX1004', date: '2023-05-17', amount: '$15.30', status: 'Failed', category: 'Transport' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#4caf50';
      case 'Pending': return '#ff9800';
      case 'Failed': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className={styles.compactTableWrapper}>
      <h3 className={styles.tableTitle}>Recent Transactions</h3>
      <table className={styles.compactTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {recentTransactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.date}</td>
              <td>{tx.amount}</td>
              <td>
                <span 
                  className={styles.statusBadge} 
                  style={{ backgroundColor: getStatusColor(tx.status) }}
                >
                  {tx.status}
                </span>
              </td>
              <td>{tx.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};