/**
 * HorizontalRankedBar - D3-based horizontal bar chart
 * Used for P9517__sales_by_sub_category and P121__bar
 */

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HorizontalRankedBarProps {
  data: Array<{ [key: string]: string | number }>;
  categoryField: string;
  valueField: string;
  title: string;
  width?: number;
  height?: number;
  color?: string;
}

export const HorizontalRankedBar: React.FC<HorizontalRankedBarProps> = ({
  data,
  categoryField,
  valueField,
  title,
  width = 400,
  height = 300,
  color = '#4e79a7',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    // Calculate dynamic left margin based on longest label
    const maxLabelLength = d3.max(data, (d) => (d[categoryField] as string)?.length || 0) || 0;
    const leftMargin = Math.max(120, maxLabelLength * 7); // 7px per character approximation
    const margin = { top: 20, right: 20, bottom: 30, left: leftMargin };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[valueField] as number) || 0])
      .range([0, innerWidth]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d[categoryField] as string))
      .range([0, innerHeight])
      .padding(0.15);

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('~s')))
      .attr('color', '#666')
      .attr('font-size', '11px');

    // Add y-axis with full category labels (no truncation)
    g.append('g')
      .call(d3.axisLeft(y))
      .attr('color', '#666')
      .attr('font-size', '11px')
      .selectAll('text')
      .style('text-anchor', 'end');

    // Add tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(255, 255, 255, 0.95)')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '11px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('pointer-events', 'none');

    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => y(d[categoryField] as string) || 0)
      .attr('x', 0)
      .attr('width', (d) => x(d[valueField] as number))
      .attr('height', y.bandwidth())
      .attr('fill', color)
      .attr('opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1);
        tooltip
          .style('visibility', 'visible')
          .html(`
            <strong>${d[categoryField]}</strong><br/>
            ${valueField}: ${d3.format(',.2f')(d[valueField] as number)}
          `)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8);
        tooltip.style('visibility', 'hidden');
      });

    // Add value labels at the end of bars
    g.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('y', (d) => (y(d[categoryField] as string) || 0) + y.bandwidth() / 2)
      .attr('x', (d) => x(d[valueField] as number) + 5)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .attr('font-size', '10px')
      .attr('fill', '#333')
      .text((d) => d3.format(',.0f')(d[valueField] as number));

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, categoryField, valueField, width, height, color]);

  return (
    <div style={{ width, height }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'left' }}>
        {title}
      </h3>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
