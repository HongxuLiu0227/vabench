import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { AggregatedData } from '../../types';
import { createProfitColorScale, formatCompactNumber, calculateDynamicLabels } from '../../utils/chartUtils';

interface VerticalRankedBarProps {
  data: AggregatedData[];
  title?: string;
  width?: number;
  height?: number;
  categoryField: 'region' | 'category' | 'productName';
  onBarClick?: (category: string) => void;
  showLegend?: boolean;
  legendPosition?: 'overlay' | 'right' | 'bottom';
}

export const VerticalRankedBar: React.FC<VerticalRankedBarProps> = ({
  data,
  title,
  width = 400,
  height = 300,
  categoryField,
  onBarClick,
  showLegend = false,
  legendPosition = 'overlay',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        setDimensions({ width: newWidth, height: newHeight });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const labels = data.map(d =>
      categoryField === 'region' ? d.region || '' :
      categoryField === 'category' ? d.category || '' :
      d.productName || ''
    );
    const margin = calculateDynamicLabels(labels, 12);
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(labels)
      .range([0, chartWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d.sales)) * 1.1])
      .range([chartHeight, 0]);

    const profitValues = data.map(d => d.profit);
    const colorScale = createProfitColorScale(profitValues);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d => formatCompactNumber(d as number));

    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('transform', 'rotate(-15)')
      .style('font-size', '11px');

    svg.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .style('font-size', '11px');

    const bars = svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(
        categoryField === 'region' ? d.region || '' :
        categoryField === 'category' ? d.category || '' :
        d.productName || ''
      ) || 0)
      .attr('y', chartHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', d => colorScale(d.profit))
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        if (onBarClick) {
          const key = categoryField === 'region' ? d.region :
                      categoryField === 'category' ? d.category :
                      d.productName;
          if (key) onBarClick(key);
        }
      })
      .on('mouseover', function() {
        d3.select(this)
          .attr('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.8);
      });

    bars.transition()
      .duration(750)
      .attr('y', d => yScale(d.sales))
      .attr('height', d => chartHeight - yScale(d.sales));

    svg.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (xScale(
        categoryField === 'region' ? d.region || '' :
        categoryField === 'category' ? d.category || '' :
        d.productName || ''
      ) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.sales) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#333')
      .text(d => formatCompactNumber(d.sales));

    if (showLegend && legendPosition === 'overlay') {
      const legendWidth = 120;
      const legendHeight = 80;
      const legendX = chartWidth - legendWidth - 10;
      const legendY = 10;

      const legendGroup = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${legendX},${legendY})`);

      const defs = svg.append('defs');
      const linearGradient = defs.append('linearGradient')
        .attr('id', 'legend-gradient')
        .attr('x1', '0%')
        .attr('y1', '100%')
        .attr('x2', '0%')
        .attr('y2', '0%');

      const minProfit = Math.min(...profitValues);
      const maxProfit = Math.max(...profitValues);

      linearGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale(minProfit));

      linearGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', colorScale((minProfit + maxProfit) / 2));

      linearGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale(maxProfit));

      legendGroup.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#legend-gradient)')
        .style('stroke', '#ccc')
        .style('stroke-width', '0.5px');

      legendGroup.append('text')
        .attr('x', legendWidth / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .text('Profit');

      legendGroup.append('text')
        .attr('x', legendWidth + 5)
        .attr('y', legendHeight)
        .attr('text-anchor', 'start')
        .style('font-size', '10px')
        .text(formatCompactNumber(maxProfit));

      legendGroup.append('text')
        .attr('x', legendWidth + 5)
        .attr('y', 10)
        .attr('text-anchor', 'start')
        .style('font-size', '10px')
        .text(formatCompactNumber(minProfit));
    }

  }, [data, dimensions, categoryField, onBarClick, showLegend, legendPosition]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {title && (
        <h3 style={{
          fontSize: '14px',
          fontWeight: 'normal',
          color: '#666',
          marginBottom: '10px',
          fontFamily: 'Tableau Book, Arial, sans-serif',
        }}>
          {title}
        </h3>
      )}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible' }}
      />
    </div>
  );
};
