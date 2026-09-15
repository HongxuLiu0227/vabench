/**
 * P9517__sales_by_sub_category worksheet
 * Chart intent: horizontal_ranked_bar
 */

import { HorizontalRankedBar } from '../charts';
import type { AggregatedSalesBySubCategory } from '../../types/data';

interface SalesBySubCategoryProps {
  data: AggregatedSalesBySubCategory[];
}

export const SalesBySubCategory: React.FC<SalesBySubCategoryProps> = ({ data }) => {
  return (
    <div className="worksheet" style={{ padding: '8px' }}>
      <HorizontalRankedBar
        data={data}
        categoryField="Sub-Category"
        valueField="Sales"
        title="Sales by Sub Category"
        width={450}
        height={320}
        color="#4e79a7"
      />
    </div>
  );
};
