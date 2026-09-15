import type { SalesData } from '../types';
import { P121Bar } from './P121__bar';
import { P9517SalesBySubCategory } from './P9517__sales_by_sub_category';
import { P121Scatterplot } from './P121__scatterplot';
import { P1225TotalSalesEachYear } from './P1225__total_sales_each_year';

interface DashboardProps {
  data: SalesData[];
}

export function Dashboard({ data }: DashboardProps) {
  // Dashboard dimensions from spec: 1000px width x 800px height
  const dashboardWidth = 1000;
  const dashboardHeight = 800;

  // Calculate worksheet dimensions based on zone specifications
  // Zones use normalized coordinates (0-100000 scale)
  // Top-left zone: x=800, y=1000, w=49200, h=49000 (normalized: 0.008, 0.01, 0.492, 0.49)
  // Top-right zone: x=50000, y=1000, w=49200, h=49000 (normalized: 0.5, 0.01, 0.492, 0.49)
  // Bottom-left zone: x=800, y=50000, w=49200, h=49000 (normalized: 0.008, 0.5, 0.492, 0.49)
  // Bottom-right zone: x=50000, y=50000, w=49200, h=49000 (normalized: 0.5, 0.5, 0.492, 0.49)

  const worksheetWidth = (dashboardWidth - 16) / 2 - 8; // Account for margins
  const worksheetHeight = (dashboardHeight - 16) / 2 - 8;

  return (
    <div
      style={{
        width: `${dashboardWidth}px`,
        height: `${dashboardHeight}px`,
        margin: '0 auto',
        padding: '8px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '4px',
        backgroundColor: '#f5f5f5',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Top-left: P121__bar */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '4px',
          overflow: 'hidden',
        }}
      >
        <P121Bar data={data} width={worksheetWidth} height={worksheetHeight} />
      </div>

      {/* Top-right: P9517__sales_by_sub_category */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '4px',
          overflow: 'hidden',
        }}
      >
        <P9517SalesBySubCategory data={data} width={worksheetWidth} height={worksheetHeight} />
      </div>

      {/* Bottom-left: P1225__total_sales_each_year */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '4px',
          overflow: 'hidden',
        }}
      >
        <P1225TotalSalesEachYear data={data} width={worksheetWidth} height={worksheetHeight} />
      </div>

      {/* Bottom-right: P121__scatterplot */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '4px',
          overflow: 'hidden',
        }}
      >
        <P121Scatterplot data={data} width={worksheetWidth} height={worksheetHeight} />
      </div>
    </div>
  );
}
