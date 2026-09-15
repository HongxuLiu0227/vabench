import { useState } from 'react';
import type { ParsedSalesData } from '../types/data';
import {
  TotalSalesEachYear,
  TotalProfitsEachYear,
  TotalSalesBySubCategories,
  TotalProfitsBySubCategories,
} from './charts';

interface DashboardProps {
  data: ParsedSalesData[];
}

export function Dashboard({ data }: DashboardProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', padding: '8px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
        Sales and Profits
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '8px',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Top-Left: Total Sales by Sub-Categories */}
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px',
            overflow: 'hidden',
          }}
        >
          <TotalSalesBySubCategories data={data} filterYear={selectedYear} />
        </div>

        {/* Top-Right: Total Profits Each Year */}
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px',
            overflow: 'hidden',
          }}
        >
          <TotalProfitsEachYear data={data} filterYear={selectedYear} />
        </div>

        {/* Bottom-Left: Total Profits by Sub-Categories */}
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px',
            overflow: 'hidden',
          }}
        >
          <TotalProfitsBySubCategories data={data} filterYear={selectedYear} />
        </div>

        {/* Bottom-Right: Total Sales Each Year */}
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px',
            overflow: 'hidden',
          }}
        >
          <TotalSalesEachYear data={data} selectedYear={selectedYear} onYearSelect={setSelectedYear} />
        </div>
      </div>

      {selectedYear !== null && (
        <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '14px' }}>
          <strong>Filter: Year {selectedYear}</strong> (click the same bar again to clear)
        </div>
      )}
    </div>
  );
}
