import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { max } from 'd3-array';
import { interpolateRgb } from 'd3-interpolate';
import type { ProductAggregation } from '../types/data';

interface ScatterplotProps {
  data: ProductAggregation[];
  width: number;
  height: number;
}

const Scatterplot: React.FC<ScatterplotProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  const margin = useMemo(() => ({ top: 40, right: 20, bottom: 50, left: 60 }), []);
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
      .text('Scatterplot');

    // Create scales
    const xScale = d3Scale
      .scaleLinear()
      .domain([0, max(data, (d) => d.sales) || 0])
      .range([0, innerWidth])
      .nice();

    const yScale = d3Scale
      .scaleLinear()
      .domain([0, max(data, (d) => d.profit) || 0])
      .range([innerHeight, 0])
      .nice();

    const sizeScale = d3Scale
      .scaleSqrt()
      .domain([0, max(data, (d) => d.quantity) || 0])
      .range([3, 20]);

    const colorScale = d3Scale
      .scaleSequential()
      .domain([0, max(data, (d) => d.sales) || 0])
      .interpolator(interpolateRgb('#c6dbef', '#08306b'));

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
    const yAxis = axisLeft(yScale).ticks(5).tickFormat(format('.0f'));
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Add circles
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.sales))
      .attr('cy', (d) => yScale(d.profit))
      .attr('r', (d) => sizeScale(d.quantity))
      .attr('fill', (d) => colorScale(d.sales))
      .attr('stroke', '#000000')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).attr('opacity', 1);
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `
            <strong>${d.productName}</strong><br/>
            Sales: ${format(',.0f')(d.sales)}<br/>
            Profit: ${format(',.0f')(d.profit)}<br/>
            Quantity: ${format(',.0f')(d.quantity)}
          `,
        });
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).attr('opacity', 0.7);
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

export default Scatterplot;
