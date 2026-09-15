import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { PayTypeWithYearData, ChartProps } from '../types';
import { useHighlight } from '../context/HighlightContext';

interface PayTypeWithYearChartProps extends ChartProps {
  data: PayTypeWithYearData[];
}

const YEAR_COLOR = '#a0cbe8';

export const PayTypeWithYearChart: React.FC<PayTypeWithYearChartProps> = ({
  data,
  width = 400,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { highlightState } = useHighlight();
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!data || data.length === 0) return;

    const margin = { top: 40, right: 40, bottom: 40, left: 50 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique years and sort them
    const years = Array.from(new Set(data.map((d) => d.year))).sort((a, b) => a - b);

    // Aggregate by year
    const aggregatedByYear = years.map((year) => ({
      year,
      salesQty: d3.sum(data.filter((d) => d.year === year), (d) => d.salesQty)!,
    }));

    // Create scales
    const yScale = d3
      .scaleBand()
      .domain(aggregatedByYear.map((d) => d.year.toString()))
      .range([0, chartHeight])
      .padding(0.2);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(aggregatedByYear, (d) => d.salesQty)! * 1.1])
      .range([0, chartWidth]);

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .style('font-size', '11px');

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .style('font-size', '11px');

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 35})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Sum(Sales_Qty)');

    // Draw bars
    g.selectAll('rect')
      .data(aggregatedByYear)
      .enter()
      .append('rect')
      .attr('y', (d) => yScale(d.year.toString())!)
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('width', 0)
      .attr('fill', YEAR_COLOR)
      .attr('opacity', 0.9)
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .on('click', function(_event, _d) {
        // Toggle selection on click - visual feedback
        const currentStrokeWidth = d3.select(this).attr('stroke-width');
        const newStrokeWidth = currentStrokeWidth === '3' ? '0.5' : '3';
        g.selectAll('rect').attr('stroke-width', 0.5);
        d3.select(this).attr('stroke-width', newStrokeWidth);
      })
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.9);
      })
      .transition()
      .duration(800)
      .attr('width', (d) => xScale(d.salesQty));

    // Add value labels after bars
    g.selectAll('.value-label')
      .data(aggregatedByYear)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('y', (d) => (yScale(d.year.toString()) || 0) + yScale.bandwidth()! / 2)
      .attr('x', (d) => xScale(d.salesQty) + 5)
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('opacity', 0)
      .text((d) => d.salesQty.toString())
      .transition()
      .delay(500)
      .duration(500)
      .style('opacity', 1);

    // Title
    svg
      .append('text')
      .attr('x', dimensions.width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Years with Product sales');

  }, [data, dimensions, highlightState]);

  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: dimensions.height,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [dimensions.height]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block' }}
      />
    </div>
  );
};
