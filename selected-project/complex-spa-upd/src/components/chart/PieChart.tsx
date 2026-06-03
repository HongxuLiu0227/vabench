import React from 'react';
import { usePieChart } from '../hooks/usePieChart';
import styled from 'styled-components';

const ChartContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  color: #2d3748;
  margin-bottom: 16px;
  font-weight: 600;
`;

const ChartCanvas = styled.canvas`
  width: 100%;
  height: 300px;
`;

export const PieChart = ({ title, data }) => {
  const chartRef = React.useRef(null);
  
  usePieChart(chartRef, data);
  
  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      <ChartCanvas ref={chartRef} />
    </ChartContainer>
  );
};