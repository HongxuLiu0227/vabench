import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useDashboard } from '../hooks/useDashboard';
import { STATE_COLORS } from '../types/data';
import { filterByStates, filterByProvider } from '../services/dataLoader';

interface LinearChartProps {
  width?: number;
  height?: number;
}

interface TooltipContent {
  providerName: string;
  providerState: string;
  diagnosis: string;
  x: number;
  y: number;
}

export const LinearChart: React.FC<LinearChartProps> = ({ width = 800, height = 300 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data, selectedStates, selectedProvider } = useDashboard();
  const [tooltip, setTooltip] = useState<TooltipContent | null>(null);

  // Filter data by selected states and provider
  const filteredData = filterByProvider(filterByStates(data, selectedStates), selectedProvider);

  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Margins for axes
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d.averageTotalPayments) as [number, number])
      .range([0, chartWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d.totalDischarges) as [number, number])
      .range([chartHeight, 0])
      .nice();

    // Create g element with margins
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(6)
        .tickFormat(d => `$${(d as number).toLocaleString()}`)
      )
      .attr('font-size', '10px');

    // Add X axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 40)
      .text('Average Total Payments ($)')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale)
        .ticks(6)
      )
      .attr('font-size', '10px');

    // Add Y axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -45)
      .text('Total Discharges')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold');

    // Draw circles
    g.selectAll('circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.averageTotalPayments))
      .attr('cy', d => yScale(d.totalDischarges))
      .attr('r', 5)
      .attr('fill', d => STATE_COLORS[d.providerState] || '#ccc')
      .attr('fill-opacity', 0.6)
      .attr('stroke', d =>
        selectedProvider && d.providerId === selectedProvider.providerId ? '#000' : 'none'
      )
      .attr('stroke-width', d =>
        selectedProvider && d.providerId === selectedProvider.providerId ? 2 : 0
      )
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const [x, y] = d3.pointer(event, svg.node() as SVGSVGElement);
        setTooltip({
          providerName: d.providerName,
          providerState: d.providerState,
          diagnosis: d.diagnosis,
          x,
          y
        });
      })
      .on('mouseout', () => {
        setTooltip(null);
      });

  }, [filteredData, width, height, selectedProvider]);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid #ddd', backgroundColor: '#fafafa' }}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '11px',
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {tooltip.providerName}
          </div>
          <div>State: {tooltip.providerState}</div>
          <div>Diagnosis: {tooltip.diagnosis}</div>
        </div>
      )}
    </div>
  );
};
