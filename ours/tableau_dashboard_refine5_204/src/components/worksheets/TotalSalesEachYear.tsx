/**
 * P1225__total_sales_each_year worksheet
 * Chart intent: line_chart
 */

import { LineChart } from '../charts';
import type { AggregatedSalesByYear } from '../../types/data';

interface TotalSalesEachYearProps {
  data: AggregatedSalesByYear[];
}

export const TotalSalesEachYear: React.FC<TotalSalesEachYearProps> = ({ data }) => {
  return (
    <div className="worksheet" style={{ padding: '8px' }}>
      <LineChart
        data={data}
        xField="Year"
        yField="Sales"
        title="Total Sales Each Year"
        width={450}
        height={320}
        color="#f28e2b"
      />
    </div>
  );
};
