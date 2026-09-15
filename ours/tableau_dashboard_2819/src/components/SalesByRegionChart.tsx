import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { SalesByRegionData } from '../types';

interface SalesByRegionChartProps {
  data: SalesByRegionData[];
  onCountryHighlight?: (country: string | null) => void;
  highlightState?: {
    segment: string | null;
    region: string | null;
    category: string | null;
    country: string | null;
  };
  width?: number;
  height?: number;
}

export const SalesByRegionChart: React.FC<SalesByRegionChartProps> = ({
  data,
  onCountryHighlight,
  highlightState,
  width = 800,
  height = 350,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: SalesByRegionData } | null>(null);
  const [localHoveredBar, setLocalHoveredBar] = useState<string | null>(null);

  // Use highlightState from other worksheets if available
  const effectiveHighlight = highlightState?.country ?? localHoveredBar;

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 60, bottom: 30, left: 200 }; // Increased left margin for long country names
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (Sales)
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([0, chartWidth])
      .nice();

    // Y scale (Country / Region) - band scale
    const yScale = d3
      .scaleBand()
      .domain(data.map(d => d.country))
      .range([0, chartHeight])
      .padding(0.2);

    // Color scale for Profit (diverging: red for negative, green for positive)
    const minProfit = d3.min(data, d => d.profit) || 0;
    const maxProfit = d3.max(data, d => d.profit) || 0;
    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([minProfit, maxProfit]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll('text')
      .style('font-size', '11px');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px')
      .style('text-anchor', 'end'); // Right-align labels for better readability

    // X axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 25)
      .style('font-size', '12px')
      .style('font-weight', '500')
      .text('SUM(Sales)');

    // Draw bars
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.country) || 0)
      .attr('width', d => xScale(d.sales))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.profit))
      .attr('opacity', d => {
        if (effectiveHighlight && effectiveHighlight !== d.country) {
          return 0.3;
        }
        return 0.8;
      })
      .attr('stroke', d => {
        return effectiveHighlight === d.country ? '#000' : 'none';
      })
      .attr('stroke-width', d => {
        return effectiveHighlight === d.country ? 2 : 0;
      })
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setLocalHoveredBar(d.country);
        onCountryHighlight?.(d.country);
        setTooltip({
          x: event.offsetX,
          y: event.offsetY,
          data: d
        });
      })
      .on('mouseout', () => {
        setLocalHoveredBar(null);
        onCountryHighlight?.(null);
        setTooltip(null);
      });

  }, [data, width, height, effectiveHighlight, onCountryHighlight]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg ref={svgRef} width={width} height={height} />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            pointerEvents: 'none',
            fontSize: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          <div><strong>Country / Region:</strong> {tooltip.data.country}</div>
          <div><strong>Sales:</strong> ${tooltip.data.sales.toFixed(2)}</div>
          <div><strong>Profit:</strong> ${tooltip.data.profit.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
};
