/**
 * Partner: Distributon Worksheet
 * Shows distribution of EMR sites by partner
 */

import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart';
import type { HorizontalBarData } from '../../types';
import type { PartnerData } from '../../types';

interface PartnerDistributionProps {
  data: PartnerData[];
}

const PartnerDistribution: React.FC<PartnerDistributionProps> = ({ data }) => {
  // Transform data for chart
  const chartData: HorizontalBarData[] = data.map(item => ({
    category: item.partner,
    value: item.count,
    series: item.agency,
  }));

  return (
    <div className="worksheet partner-distribution">
      <HorizontalBarChart
        data={chartData}
        title="Distribution of EMR Sites by Partner"
        axisTitle="Number of EMR Sites by Partner"
        seriesField="DisplayAgency"
      />
    </div>
  );
};

export default PartnerDistribution;
