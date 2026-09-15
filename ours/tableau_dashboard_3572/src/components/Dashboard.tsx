import React, { useState, useEffect } from 'react';
import { loadData, applyFilters } from '../services/dataService';
import type { HRData, FilterState } from '../types/hrData';
import { SatisfactionHistogram } from './worksheets/SatisfactionHistogram';
import { MonthlyHoursHistogram } from './worksheets/MonthlyHoursHistogram';
import { DepartmentDistribution } from './worksheets/DepartmentDistribution';
import { ProjectCountTurnover } from './worksheets/ProjectCountTurnover';
import { YearsWorkedTurnover } from './worksheets/YearsWorkedTurnover';

export const Dashboard: React.FC = () => {
  const [allData, setAllData] = useState<HRData[]>([]);
  const [filteredData, setFilteredData] = useState<HRData[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData()
      .then(data => {
        setAllData(data);
        setFilteredData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (allData.length > 0) {
      const filtered = applyFilters(allData, filters);
      setFilteredData(filtered);
    }
  }, [allData, filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: 'red' }}>Error: {error}</div>
      </div>
    );
  }

  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof FilterState] !== undefined);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>HR Dashboard</h1>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4e79a7',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <SatisfactionHistogram data={filteredData} width={600} height={350} filters={filters as Record<string, unknown>} />
        </div>
        <div>
          <MonthlyHoursHistogram data={filteredData} width={600} height={350} filters={filters as Record<string, unknown>} />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <ProjectCountTurnover
          data={filteredData}
          width={1200}
          height={350}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <DepartmentDistribution
            data={filteredData}
            width={600}
            height={350}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
        <div>
          <YearsWorkedTurnover
            data={filteredData}
            width={600}
            height={350}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px' }}>
          <strong>Active Filters:</strong>
          {filters.sales && <span style={{ marginLeft: '10px' }}>Department: {filters.sales}</span>}
          {filters.numberProject !== undefined && <span style={{ marginLeft: '10px' }}>Project Count: {filters.numberProject}</span>}
          {filters.left !== undefined && <span style={{ marginLeft: '10px' }}>Left: {filters.left === 0 ? 'Stayed' : 'Left'}</span>}
          {filters.timeSpendCompany !== undefined && <span style={{ marginLeft: '10px' }}>Time Spend Company: {filters.timeSpendCompany}</span>}
        </div>
      )}
    </div>
  );
};
