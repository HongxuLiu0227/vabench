/**
 * Partner: Overall Worksheet
 * Shows overall reporting rate for Care & Treatment uploads by partner
 */

import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart';
import type { HorizontalBarData } from '../../types';
import type { PartnerUploadData } from '../../types';
import { getPerformanceColor } from '../../services/dataService';

interface PartnerOverallProps {
  data: PartnerUploadData[];
  selectedDate: string;
}

const PartnerOverall: React.FC<PartnerOverallProps> = ({ data, selectedDate }) => {
  // Transform data for chart
  const chartData: HorizontalBarData[] = data.map(item => ({
    category: item.partner,
    value: item.percentUploaded,
    series: item.category,
  }));

  // Create legend data
  const legendData = [
    { category: 'Above 67%', color: getPerformanceColor('Above 67%') },
    { category: '34 - 66%', color: getPerformanceColor('34 - 66%') },
    { category: 'Below 33%', color: getPerformanceColor('Below 33%') },
  ];

  const title = `Overall Reporting Care & Treatment by Partner\n${selectedDate}`;

  return (
    <div className="worksheet partner-overall">
      <HorizontalBarChart
        data={chartData}
        title={title}
        axisTitle="% C&T Uploads"
        seriesField="County Color"
        showLegend={true}
        legendData={legendData}
      />
    </div>
  );
};

export default PartnerOverall;
