import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { max } from 'd3-array';
import { interpolateRgb } from 'd3-interpolate';
import type { CategoryAggregation } from '../types/data';

interface HorizontalBarProps {
  data: CategoryAggregation[];
  width: number;
  height: number;
}

const HorizontalBar: React.FC<HorizontalBarProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  const margin = useMemo(() => ({ top: 40, right: 30, bottom: 30, left: 150 }), []);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Add worksheet title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('font-family', 'sans-serif')
      .text('Bar');

    // Sort by sales descending and take top 20
    const sortedData = [...data].sort((a, b) => b.sales - a.sales).slice(0, 20);

    // Create scales
    const xScale = d3Scale
      .scaleLinear()
      .domain([0, max(sortedData, (d) => d.sales) || 0])
      .range([0, innerWidth])
      .nice();

    const yScale = d3Scale
      .scaleBand()
      .domain(sortedData.map((d) => `${d.category} - ${d.subCategory}`))
      .range([0, innerHeight])
      .padding(0.2);

    // Color scale - blue teal gradient
    const maxSales = max(sortedData, (d) => d.sales) || 0;
    const colorScale = d3Scale
      .scaleSequential()
      .domain([0, maxSales])
      .interpolator(interpolateRgb('#d0e1f9', '#08519c'));

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add X axis
    const xAxis = axisBottom(xScale).ticks(5).tickFormat(format('.0f'));
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Add Y axis
    const yAxis = axisLeft(yScale);
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px')
      .attr('text-anchor', 'end');

    // Add bars
    g.selectAll('rect')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d) => yScale(`${d.category} - ${d.subCategory}`) || 0)
      .attr('width', (d) => xScale(d.sales))
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => colorScale(d.sales))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).attr('opacity', 0.8);
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `
            <strong>${d.category} - ${d.subCategory}</strong><br/>
            Sales: ${format(',.0f')(d.sales)}
          `,
        });
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).attr('opacity', 1);
        setTooltip((prev) => ({ ...prev, visible: false }));
      });
  }, [data, width, height, innerWidth, innerHeight, margin]);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block', backgroundColor: '#ffffff' }}
      />
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '12px',
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};

export default HorizontalBar;
