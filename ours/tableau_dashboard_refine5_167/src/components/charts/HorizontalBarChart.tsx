import { useEffect, useRef } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3';

interface HorizontalBarChartProps {
  data: Array<{ label: string; value: number; category?: string }>;
  width: number;
  height: number;
  title?: string;
  margin?: { top: number; right: number; bottom: number; left: number };
  barColor?: string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  width,
  height,
  title,
  margin = { top: 40, right: 20, bottom: 40, left: 150 },
  barColor = '#4e79a7',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = scaleLinear()
      .domain([0, Math.max(...data.map((d) => d.value)) * 1.1])
      .range([0, innerWidth]);

    const yScale = scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerHeight])
      .padding(0.15);

    // Add X axis
    const xAxis = axisBottom(xScale).ticks(5).tickFormat((d) => {
      const value = d as number;
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      }
      return `$${value.toFixed(0)}`;
    });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#666')
      .attr('font-size', '12px');

    // Add Y axis
    g.append('g')
      .call(axisLeft(yScale))
      .attr('color', '#666')
      .attr('font-size', '12px');

    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d: { label: string; value: number }) => yScale(d.label) || 0)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', (d: { label: string; value: number }) => xScale(d.value))
      .attr('fill', barColor)
      .attr('opacity', 0.9)
      .on('mouseover', function(_event: MouseEvent, d: { label: string; value: number }) {
        select(this).attr('opacity', 0.7);
        // Add tooltip
        g.append('text')
          .attr('class', 'tooltip')
          .attr('x', xScale(d.value) + 5)
          .attr('y', (yScale(d.label) || 0) + yScale.bandwidth() / 2)
          .attr('dy', '0.35em')
          .attr('fill', '#333')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(`$${d.value.toLocaleString()}`);
      })
      .on('mouseout', function() {
        select(this).attr('opacity', 0.9);
        g.selectAll('.tooltip').remove();
      });

    // Add title if provided
    if (title) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(title);
    }
  }, [data, width, height, margin, barColor, title]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ overflow: 'visible' }}
    />
  );
};
