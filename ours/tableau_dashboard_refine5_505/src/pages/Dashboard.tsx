import { TotalSalesEachYear } from '../components/worksheets/TotalSalesEachYear';
import { LineChartMonthly } from '../components/worksheets/LineChartMonthly';
import { Scatterplot } from '../components/worksheets/Scatterplot';
import { SalesBySubCategory } from '../components/worksheets/SalesBySubCategory';

export function Dashboard() {
  return (
    <div style={{
      padding: '8px',
      width: '100%',
      height: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* P121__line: Top Left (x_ratio: 0.0059, y_ratio: 0.0105) */}
      <div style={{
        position: 'absolute',
        left: '0.59%',
        top: '1.05%',
        width: '49.41%',
        height: '48.94%',
        padding: '4px',
        boxSizing: 'border-box',
      }}>
        <LineChartMonthly />
      </div>

      {/* P9517__sales_by_sub_category: Top Right (x_ratio: 0.5, y_ratio: 0.0105) */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '1.05%',
        width: '49.41%',
        height: '48.94%',
        padding: '4px',
        boxSizing: 'border-box',
      }}>
        <SalesBySubCategory />
      </div>

      {/* P121__scatterplot: Bottom Left (x_ratio: 0.0059, y_ratio: 0.5) */}
      <div style={{
        position: 'absolute',
        left: '0.59%',
        top: '50%',
        width: '49.41%',
        height: '48.95%',
        padding: '4px',
        boxSizing: 'border-box',
      }}>
        <Scatterplot />
      </div>

      {/* P1225__total_sales_each_year: Bottom Right (x_ratio: 0.5, y_ratio: 0.5) */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '49.41%',
        height: '48.95%',
        padding: '4px',
        boxSizing: 'border-box',
      }}>
        <TotalSalesEachYear />
      </div>
    </div>
  );
}
