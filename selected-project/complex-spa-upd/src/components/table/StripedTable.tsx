import { useState } from 'react';
import styles from './StripedTable.module.css';

export const StripedTable = () => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const products = [
    { 
      id: 1, 
      name: 'Wireless Headphones', 
      price: '$89.99', 
      stock: 45,
      details: 'Noise-cancelling Bluetooth headphones with 30hr battery life'
    },
    { 
      id: 2, 
      name: 'Smart Watch', 
      price: '$199.99', 
      stock: 12,
      details: 'Fitness tracking with heart rate monitor and GPS'
    },
    { 
      id: 3, 
      name: 'Portable Charger', 
      price: '$29.99', 
      stock: 78,
      details: '10000mAh power bank with fast charging support'
    },
    { 
      id: 4, 
      name: 'Bluetooth Speaker', 
      price: '$59.99', 
      stock: 23,
      details: 'Waterproof speaker with 20hr playtime'
    }
  ];

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getStockStatus = (stock: number) => {
    if (stock > 50) return 'high';
    if (stock > 20) return 'medium';
    return 'low';
  };

  return (
    <div className={styles.stripedTableContainer}>
      <table className={styles.stripedTable}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <>
              <tr 
                key={product.id} 
                className={`${styles.tableRow} ${getStockStatus(product.stock)}`}
                onClick={() => toggleRow(product.id)}
              >
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>
                  <div className={styles.stockIndicator}>
                    <div 
                      className={styles.stockBar} 
                      style={{ width: `${Math.min(100, product.stock)}%` }}
                    />
                    <span>{product.stock} units</span>
                  </div>
                </td>
                <td className={styles.expandIcon}>
                  {expandedRow === product.id ? '−' : '+'}
                </td>
              </tr>
              {expandedRow === product.id && (
                <tr className={styles.detailsRow}>
                  <td colSpan={4}>
                    <div className={styles.detailsContent}>
                      {product.details}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};