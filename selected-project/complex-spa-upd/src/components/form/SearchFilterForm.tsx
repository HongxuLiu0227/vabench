import { useState } from 'react';
import styles from './SearchFilterForm.module.css';

export const SearchFilterForm = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [inStock, setInStock] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      searchTerm,
      category,
      priceRange,
      inStock
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = parseInt(e.target.value);
    setPriceRange(newPriceRange);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          placeholder="Search products..."
        />
        <button type="submit" className={styles.searchButton}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.searchIcon}>
            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Garden</option>
            <option value="books">Books</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Price Range</label>
          <div className={styles.priceRangeContainer}>
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(e, 0)}
              className={styles.rangeInput}
            />
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(e, 1)}
              className={styles.rangeInput}
            />
            <div className={styles.priceValues}>
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={inStock}
              onChange={() => setInStock(!inStock)}
              className={styles.checkbox}
            />
            In Stock Only
          </label>
        </div>
      </div>
    </form>
  );
};