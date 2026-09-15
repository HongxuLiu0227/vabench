import React, { useMemo } from 'react';
import { useFilters } from '../contexts/FilterContext';
import type { ParsedOrderRecord } from '../services/dataLoader';
import {
  applyFilters,
  aggregateByRegion,
  aggregateByState,
  aggregateBySubcategory,
  aggregateByProduct,
  aggregateByCategory,
  aggregateByCustomer
} from '../utils/dataAggregation';
import { VerticalRankedBar } from './charts/VerticalRankedBar';
import { HorizontalRankedBar } from './charts/HorizontalRankedBar';
import { CustomTableView } from './charts/CustomTableView';

interface DashboardProps {
  data: ParsedOrderRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { filters, setFilter, clearFilter } = useFilters();

  const filteredData = useMemo(() => applyFilters(data, filters), [data, filters]);

  // Aggregate data for all worksheets
  const regionData = useMemo(() => aggregateByRegion(filteredData), [filteredData]);
  const stateData = useMemo(() => aggregateByState(filteredData), [filteredData]);
  const subcategoryData = useMemo(() => aggregateBySubcategory(filteredData), [filteredData]);
  const productData = useMemo(() => aggregateByProduct(filteredData), [filteredData]);
  const categoryData = useMemo(() => aggregateByCategory(filteredData), [filteredData]);
  const customerData = useMemo(() => aggregateByCustomer(filteredData), [filteredData]);

  // Dashboard action handlers (from contract)
  const handleRegionClick = (region: string) => {
    // Action1: Filter on Region - targets entire dashboard
    if (filters.region === region) {
      clearFilter('region');
    } else {
      setFilter('region', region);
    }
  };

  const handleStateClick = (state: string) => {
    // Action2: Filter on State - targets entire dashboard
    if (filters.state === state) {
      clearFilter('state');
    } else {
      setFilter('state', state);
    }
  };

  const handleSubcategoryClick = (key: string) => {
    // Action3: Filter on Category+SubCategory - targets entire dashboard
    const [category, subCategory] = key.split('|');
    if (filters.category === category && filters.subCategory === subCategory) {
      clearFilter('category');
      clearFilter('subCategory');
    } else {
      setFilter('category', category);
      setFilter('subCategory', subCategory);
    }
  };

  const handleCategoryClick = (category: string) => {
    if (filters.category === category) {
      clearFilter('category');
    } else {
      setFilter('category', category);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 20px)',
      backgroundColor: '#fff',
    }}>
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '8px',
        padding: '8px',
        backgroundColor: '#f0f0f0',
      }}>
        {/* Sales by Region - Top Left */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '8px',
          border: '1px solid #ddd',
          overflow: 'hidden',
        }}>
          <VerticalRankedBar
            data={regionData}
            title="Sales by Region"
            categoryField="region"
            onBarClick={handleRegionClick}
            showLegend={true}
            legendPosition="overlay"
          />
        </div>

        {/* Sales&Profit by Subcategory - Top Right */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '8px',
          border: '1px solid #ddd',
          overflow: 'hidden',
        }}>
          <HorizontalRankedBar
            data={subcategoryData}
            title="Sales&Profit by Subcategory"
            categoryField="subCategory"
            onBarClick={handleSubcategoryClick}
          />
        </div>

        {/* Sales&Profits by Product Name - Bottom Left */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '8px',
          border: '1px solid #ddd',
          overflow: 'hidden',
        }}>
          <CustomTableView
            data={productData}
            title="Sales&Profits by Product Name"
            rowsField="productName"
          />
        </div>

        {/* Sales by States - Bottom Right */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '8px',
          border: '1px solid #ddd',
          overflow: 'hidden',
        }}>
          <HorizontalRankedBar
            data={stateData}
            title="Sales by States"
            categoryField="state"
            onBarClick={handleStateClick}
          />
        </div>
      </div>

      {/* Right-side panel for additional worksheets */}
      <div style={{
        width: '600px',
        backgroundColor: '#fff',
        borderLeft: '1px solid #ddd',
        padding: '8px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {/* CustomerName by Context Filter */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '8px',
          border: '1px solid #ddd',
          minHeight: '250px',
        }}>
          <HorizontalRankedBar
            data={customerData}
            title="CustomerName by Context Filter"
            categoryField="customerName"
          />
        </div>

        {/* Sales by Category with Filter */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '8px',
          border: '1px solid #ddd',
          minHeight: '250px',
        }}>
          <VerticalRankedBar
            data={categoryData}
            title="Sales by Category with Filter"
            categoryField="category"
            onBarClick={handleCategoryClick}
          />
        </div>

        {/* Sales&Profit Crosstab */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '8px',
          border: '1px solid #ddd',
          minHeight: '300px',
          overflow: 'auto',
        }}>
          <CustomTableView
            data={subcategoryData}
            title="Sales&Profit Crosstab"
            rowsField="subCategory"
            showCategory={true}
            showSubCategory={true}
          />
        </div>

        {/* Sales&Profits by Subcategory&Product Name */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '8px',
          border: '1px solid #ddd',
          minHeight: '300px',
          overflow: 'auto',
        }}>
          <CustomTableView
            data={productData}
            title="Sales&Profits by Subcategory&Product Name"
            rowsField="productName"
            showCategory={true}
            showSubCategory={true}
          />
        </div>

        {/* Sales by Product Names with Filter */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '8px',
          border: '1px solid #ddd',
          minHeight: '250px',
        }}>
          <VerticalRankedBar
            data={productData.slice(0, 20)}
            title="Sales by Product Names with Filter"
            categoryField="productName"
          />
        </div>
      </div>
    </div>
  );
};
