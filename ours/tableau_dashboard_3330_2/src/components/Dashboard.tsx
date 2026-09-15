import React, { useMemo } from 'react';
import type { ExtendedDataRow, PieChartData } from '../types';
import { AmountOfPositive } from './worksheets/AmountOfPositive';
import { AmountOfPositivePercent } from './worksheets/AmountOfPositivePercent';
import { AmountOfNegative } from './worksheets/AmountOfNegative';
import { AmountOfNegativePercent } from './worksheets/AmountOfNegativePercent';
import { AnnualIncomePie } from './worksheets/AnnualIncomePie';
import { EducationPie } from './worksheets/EducationPie';
import { EmploymentStatusPie } from './worksheets/EmploymentStatusPie';
import { YearsOfExperiencePie } from './worksheets/YearsOfExperiencePie';
import { Legend } from './Legend';
import { groupByField, getColorPalette } from '../services/aggregationService';
import './Dashboard.css';

interface DashboardProps {
  data: ExtendedDataRow[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {

  // Calculate legend data for each pie chart
  const annualIncomeLegendData = useMemo(() => {
    const grouped = groupByField(data, 'A6. What is your annual income?');
    const colors = getColorPalette(grouped.length);
    return grouped.map((item, index) => ({
      label: item.label,
      value: item.count,
      percentage: item.percentage,
      color: colors[index],
    })) as PieChartData[];
  }, [data]);

  const educationLegendData = useMemo(() => {
    const grouped = groupByField(data, 'A5. What is your highest level of education?');
    const colors = getColorPalette(grouped.length);
    return grouped.map((item, index) => ({
      label: item.label,
      value: item.count,
      percentage: item.percentage,
      color: colors[index],
    })) as PieChartData[];
  }, [data]);

  const employmentStatusLegendData = useMemo(() => {
    const grouped = groupByField(
      data,
      'A7. What is your employment status as a musician?  If "other" please specify'
    );
    const colors = getColorPalette(grouped.length);
    return grouped.map((item, index) => ({
      label: item.label,
      value: item.count,
      percentage: item.percentage,
      color: colors[index],
    })) as PieChartData[];
  }, [data]);

  const yearsOfExperienceLegendData = useMemo(() => {
    const grouped = groupByField(
      data,
      'A8. How many years of experience do you have as a musician?  If "other" please specify'
    );
    const colors = getColorPalette(grouped.length);
    return grouped.map((item, index) => ({
      label: item.label,
      value: item.count,
      percentage: item.percentage,
      color: colors[index],
    })) as PieChartData[];
  }, [data]);

  return (
    <div
      className="dashboard"
      style={{
        width: '1000px',
        height: '800px',
      }}
    >
      {/* Amount of Positive - Top Left */}
      <div
        className="dashboard-zone amount-of-positive-zone"
        style={{
          position: 'absolute',
          left: `${0.8}%`,
          top: '7%',
          width: '41.2%',
          height: '14.25%',
        }}
      >
        <AmountOfPositive data={data} />
      </div>

      {/* Amount of Positive % - Below Amount of Positive */}
      <div
        className="dashboard-zone amount-of-positive-percent-zone"
        style={{
          position: 'absolute',
          left: '9.6%',
          top: '9.12%',
          width: '9.7%',
          height: '8.25%',
        }}
      >
        <AmountOfPositivePercent data={data} />
      </div>

      {/* Amount of Negative - Top Right */}
      <div
        className="dashboard-zone amount-of-negative-zone"
        style={{
          position: 'absolute',
          left: '42%',
          top: '7%',
          width: '41.2%',
          height: '14.25%',
        }}
      >
        <AmountOfNegative data={data} />
      </div>

      {/* Amount of Negative % - Below Amount of Negative */}
      <div
        className="dashboard-zone amount-of-negative-percent-zone"
        style={{
          position: 'absolute',
          left: '50.6%',
          top: '9.12%',
          width: '9.4%',
          height: '7.88%',
        }}
      >
        <AmountOfNegativePercent data={data} />
      </div>

      {/* Education Pie - Middle Left */}
      <div
        className="dashboard-zone education-pie-zone"
        style={{
          position: 'absolute',
          left: '0.8%',
          top: '21.25%',
          width: '41.2%',
          height: '39.26%',
        }}
      >
        <EducationPie data={data} width={400} height={300} />
      </div>

      {/* Education Legend - Right of Education Pie */}
      <div
        className="dashboard-zone education-legend-zone"
        style={{
          position: 'absolute',
          left: '83.2%',
          top: '7%',
          width: '16%',
          height: '18.25%',
        }}
      >
        <Legend data={educationLegendData} />
      </div>

      {/* Annual Income Pie - Middle Right */}
      <div
        className="dashboard-zone annual-income-pie-zone"
        style={{
          position: 'absolute',
          left: '42%',
          top: '21.25%',
          width: '41.2%',
          height: '39.26%',
        }}
      >
        <AnnualIncomePie data={data} width={400} height={300} />
      </div>

      {/* Annual Income Legend - Right of Annual Income Pie */}
      <div
        className="dashboard-zone annual-income-legend-zone"
        style={{
          position: 'absolute',
          left: '83.2%',
          top: '31%',
          width: '16%',
          height: '25.75%',
        }}
      >
        <Legend data={annualIncomeLegendData} />
      </div>

      {/* Employment Status Pie - Bottom Left */}
      <div
        className="dashboard-zone employment-status-pie-zone"
        style={{
          position: 'absolute',
          left: '0.8%',
          top: '60.51%',
          width: '41.2%',
          height: '38.49%',
        }}
      >
        <EmploymentStatusPie data={data} width={400} height={300} />
      </div>

      {/* Employment Status Legend - Right of Employment Status Pie */}
      <div
        className="dashboard-zone employment-status-legend-zone"
        style={{
          position: 'absolute',
          left: '83.2%',
          top: '56.75%',
          width: '16%',
          height: '13.25%',
        }}
      >
        <Legend data={employmentStatusLegendData} />
      </div>

      {/* Years of Experience Pie - Bottom Right */}
      <div
        className="dashboard-zone years-of-experience-pie-zone"
        style={{
          position: 'absolute',
          left: '42%',
          top: '60.51%',
          width: '41.2%',
          height: '38.49%',
        }}
      >
        <YearsOfExperiencePie data={data} width={400} height={300} />
      </div>

      {/* Years of Experience Legend - Right of Years of Experience Pie */}
      <div
        className="dashboard-zone years-of-experience-legend-zone"
        style={{
          position: 'absolute',
          left: '83.2%',
          top: '70%',
          width: '16%',
          height: '20.75%',
        }}
      >
        <Legend data={yearsOfExperienceLegendData} />
      </div>
    </div>
  );
};
