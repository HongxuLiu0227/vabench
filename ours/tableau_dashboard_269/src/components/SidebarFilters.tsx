import React from 'react';
import { useFilters } from '../contexts/FilterContext';
import type { ParsedOrderRecord } from '../services/dataLoader';
import { getCategoricalValues, getYearValues } from '../utils/dataAggregation';

interface SidebarFiltersProps {
  data: ParsedOrderRecord[];
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({ data }) => {
  const { filters, setFilter, clearFilter, clearAllFilters } = useFilters();

  const years = getYearValues(data);
  const categories = getCategoricalValues(data, 'Category');

  const handleYearChange = (year: number) => {
    if (filters.orderDateYear === year) {
      clearFilter('orderDateYear');
    } else {
      setFilter('orderDateYear', year);
    }
  };

  const handleCategoryChange = (category: string) => {
    if (filters.category === category) {
      clearFilter('category');
    } else {
      setFilter('category', category);
    }
  };

  return (
    <div style={{
      width: '100%',
      padding: '16px',
      backgroundColor: '#f8f8f8',
      borderLeft: '1px solid #ddd',
      height: '100%',
      overflowY: 'auto',
    }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333',
            margin: 0,
          }}>
            Filters
          </h4>
          <button
            onClick={clearAllFilters}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Clear All
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#555',
            marginBottom: '8px',
          }}>
            Order Date (Year)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {years.map(year => (
              <label
                key={year}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.orderDateYear === year}
                  onChange={() => handleYearChange(year)}
                  style={{ marginRight: '8px' }}
                />
                {year}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#555',
            marginBottom: '8px',
          }}>
            Category
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {categories.map(category => (
              <label
                key={category}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.category === category}
                  onChange={() => handleCategoryChange(category)}
                  style={{ marginRight: '8px' }}
                />
                {category}
              </label>
            ))}
          </div>
        </div>

        {(filters.region || filters.state || filters.subCategory) && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#e8f4f8',
            borderRadius: '4px',
            border: '1px solid #b8d4e3',
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '8px',
            }}>
              Active Selections:
            </div>
            {filters.region && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                marginBottom: '4px',
              }}>
                <span>Region: {filters.region}</span>
                <button
                  onClick={() => clearFilter('region')}
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            {filters.state && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                marginBottom: '4px',
              }}>
                <span>State: {filters.state}</span>
                <button
                  onClick={() => clearFilter('state')}
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            {filters.subCategory && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                marginBottom: '4px',
              }}>
                <span>Sub-Category: {filters.subCategory}</span>
                <button
                  onClick={() => clearFilter('subCategory')}
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
