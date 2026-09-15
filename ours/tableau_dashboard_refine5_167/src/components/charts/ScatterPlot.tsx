import { useEffect, useRef } from 'react';
import { select } from 'd3';
import { scaleLinear, scaleSqrt } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';

interface ScatterPlotDataPoint {
  x: number;
  y: number;
  size: number;
  label: string;
}

interface ScatterPlotProps {
  data: ScatterPlotDataPoint[];
  width: number;
  height: number;
  title?: string;
  margin?: { top: number; right: number; bottom: number; left: number };
  circleColor?: string;
  xLabel?: string;
  yLabel?: string;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  width,
  height,
  title,
  margin = { top: 40, right: 30, bottom: 60, left: 80 },
  circleColor = '#4e79a7',
  xLabel = '',
  yLabel = '',
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
    const maxX = Math.max(...data.map((d) => d.x)) * 1.1;
    const maxY = Math.max(...data.map((d) => d.y)) * 1.1;
    const minY = Math.min(0, Math.min(...data.map((d) => d.y)) * 1.1);
    const maxSize = Math.max(...data.map((d) => d.size));

    const xScale = scaleLinear()
      .domain([0, maxX])
      .range([0, innerWidth]);

    const yScale = scaleLinear()
      .domain([minY, maxY])
      .range([innerHeight, 0]);

    const sizeScale = scaleSqrt()
      .domain([0, maxSize])
      .range([3, 20]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        axisBottom(xScale).tickFormat((d) => {
          const value = d as number;
          if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
          } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
          }
          return `$${value.toFixed(0)}`;
        })
      )
      .attr('color', '#666')
      .attr('font-size', '12px');

    // Add Y axis
    g.append('g')
      .call(
        axisLeft(yScale).tickFormat((d) => {
          const value = d as number;
          if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
          } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
          }
          return `$${value.toFixed(0)}`;
        })
      )
      .attr('color', '#666')
      .attr('font-size', '12px');

    // Add axis labels
    if (xLabel) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 45)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text(xLabel);
    }

    if (yLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -60)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text(yLabel);
    }

    // Add circles
    g.selectAll('.circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', (d) => sizeScale(d.size))
      .attr('fill', circleColor)
      .attr('opacity', 0.6)
      .on('mouseover', function(_event, d) {
        select(this).attr('opacity', 0.9);
        // Add tooltip
        const tooltip = g
          .append('g')
          .attr('class', 'tooltip');

        const tooltipX = Math.min(xScale(d.x) + 15, innerWidth - 100);
        const tooltipY = Math.max(yScale(d.y) - 10, 10);

        tooltip
          .append('rect')
          .attr('x', tooltipX)
          .attr('y', tooltipY)
          .attr('width', 140)
          .attr('height', 60)
          .attr('fill', 'white')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1)
          .attr('rx', 4);

        tooltip
          .append('text')
          .attr('x', tooltipX + 70)
          .attr('y', tooltipY + 15)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .attr('fill', '#333')
          .text(d.label.substring(0, 25) + (d.label.length > 25 ? '...' : ''));

        tooltip
          .append('text')
          .attr('x', tooltipX + 10)
          .attr('y', tooltipY + 32)
          .attr('text-anchor', 'start')
          .attr('font-size', '10px')
          .attr('fill', '#666')
          .text(`Sales: $${d.x.toLocaleString()}`);

        tooltip
          .append('text')
          .attr('x', tooltipX + 10)
          .attr('y', tooltipY + 46)
          .attr('text-anchor', 'start')
          .attr('font-size', '10px')
          .attr('fill', '#666')
          .text(`Profit: $${d.y.toLocaleString()}`);
      })
      .on('mouseout', function() {
        select(this).attr('opacity', 0.6);
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
  }, [data, width, height, margin, circleColor, title, xLabel, yLabel]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ overflow: 'visible' }}
    />
  );
};
