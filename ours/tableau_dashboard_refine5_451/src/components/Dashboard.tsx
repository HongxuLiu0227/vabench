import React, { useState, useEffect } from 'react';
import type { ParsedRecord } from '../types';
import { loadData } from '../services/dataLoader';
import { assertValidDataSource } from '../utils/tableauValidator';
import { ChartContainer } from './ChartContainer';
import { SalesBySubCategory } from './SalesBySubCategory';
import { Scatterplot } from './Scatterplot';
import { TotalSalesEachYear } from './TotalSalesEachYear';
import { LineChartByMonth } from './LineChartByMonth';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<ParsedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loadedData = await loadData();

        // Validate the data source before using it
        // This prevents silent bad parses that lead to all-zero charts
        try {
          assertValidDataSource(loadedData);
        } catch (validationError) {
          // Log validation results for debugging
          console.error('Data source validation failed:', validationError);
          setError(validationError instanceof Error ? validationError.message : 'Data validation failed');
          setLoading(false);
          return;
        }

        setData(loadedData);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        console.error('Data loading error:', errorMessage);

        // Provide more detailed error messages for common issues
        if (errorMessage.includes('Missing required fields')) {
          setError(
            'CSV data format error: Required fields are missing.\n' +
            'Please check that the CSV file has all required columns:\n' +
            'Category, City, Country, Customer Name, Manufacturer, Order Date, Order ID,\n' +
            'Postal Code, Product Name, Region, Segment, Ship Date, Ship Mode, State,\n' +
            'Sub-Category, Discount, Number of Records, Profit, Profit Ratio, Quantity, Sales'
          );
        } else if (errorMessage.includes('Failed to parse all CSV rows')) {
          setError(
            'CSV parsing error: Unable to parse data rows.\n' +
            'This may be due to incorrect date format, non-numeric values in numeric fields,\n' +
            'or corrupted data. Please check the CSV file format.'
          );
        } else if (errorMessage.includes('HTTP error')) {
          setError(
            'Network error: Unable to load CSV file.\n' +
            'Please check that the data file exists at: /data/2648_dash_dashboard0_png_discount_20dashboard/\n' +
            'and that the server is running correctly.'
          );
        } else {
          setError(errorMessage);
        }

        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#666',
          fontFamily: 'sans-serif'
        }}
      >
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#d32f2f',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}
      >
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        fontFamily: 'sans-serif',
        padding: '8px'
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '8px',
          overflow: 'hidden'
        }}
      >
        {/* Top-Left: Sales by Sub Category */}
        <ChartContainer title="Sales by Sub Category">
          {(width, height) => <SalesBySubCategory data={data} width={width} height={height} />}
        </ChartContainer>

        {/* Top-Right: Scatterplot */}
        <ChartContainer title="Scatterplot">
          {(width, height) => <Scatterplot data={data} width={width} height={height} />}
        </ChartContainer>

        {/* Bottom-Left: Total Sales Each Year */}
        <ChartContainer title="Total Sales Each Year">
          {(width, height) => <TotalSalesEachYear data={data} width={width} height={height} />}
        </ChartContainer>

        {/* Bottom-Right: Line */}
        <ChartContainer title="Line">
          {(width, height) => <LineChartByMonth data={data} width={width} height={height} />}
        </ChartContainer>
      </div>
    </div>
  );
};
