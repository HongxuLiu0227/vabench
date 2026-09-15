import { SalesBySubCategory } from './worksheets/SalesBySubCategory';
import { BarChart } from './worksheets/BarChart';
import { Scatterplot } from './worksheets/Scatterplot';
import { TotalSalesEachYear } from './worksheets/TotalSalesEachYear';

export const Dashboard: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '8px',
          padding: '8px',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Top-left: P121__bar */}
        <div
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <BarChart />
        </div>

        {/* Top-right: P9517__sales_by_sub_category */}
        <div
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <SalesBySubCategory />
        </div>

        {/* Bottom-left: P1225__total_sales_each_year */}
        <div
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <TotalSalesEachYear />
        </div>

        {/* Bottom-right: P121__scatterplot */}
        <div
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Scatterplot />
        </div>
      </div>
    </div>
  );
};
