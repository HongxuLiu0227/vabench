/**
 * P121__bar worksheet
 * Chart intent: horizontal_ranked_bar
 */

import { HorizontalRankedBar } from '../charts';
import type { AggregatedSalesByCategorySubCategory } from '../../types/data';

interface BarChartProps {
  data: AggregatedSalesByCategorySubCategory[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  return (
    <div className="worksheet" style={{ padding: '8px' }}>
      <HorizontalRankedBar
        data={data}
        categoryField="Sub-Category"
        valueField="Sales"
        title="Bar"
        width={450}
        height={320}
        color="#59a14f"
      />
    </div>
  );
};
