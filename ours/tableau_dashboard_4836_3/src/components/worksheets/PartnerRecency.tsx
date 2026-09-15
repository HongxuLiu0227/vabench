/**
 * Partner: Recency Worksheet
 * Shows overall reporting rate for PKV uploads by partner
 */

import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart';
import type { HorizontalBarData } from '../../types';
import type { PartnerUploadData } from '../../types';

interface PartnerRecencyProps {
  data: PartnerUploadData[];
  selectedDate: string;
}

const PartnerRecency: React.FC<PartnerRecencyProps> = ({ data, selectedDate }) => {
  // Transform data for chart
  const chartData: HorizontalBarData[] = data.map(item => ({
    category: item.partner,
    value: item.percentUploaded,
    series: item.category,
  }));

  const title = `Overall Reporting PKVs by Partner\n${selectedDate}`;

  return (
    <div className="worksheet partner-recency">
      <HorizontalBarChart
        data={chartData}
        title={title}
        axisTitle="% PKV Uploads"
        seriesField="Partner Color"
      />
    </div>
  );
};

export default PartnerRecency;
