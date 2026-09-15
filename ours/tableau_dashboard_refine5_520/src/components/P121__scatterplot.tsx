import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ProductMetrics } from '../types';

interface P121ScatterplotProps {
  data: ProductMetrics[];
  width?: number;
  height?: number;
}

const P121Scatterplot: React.FC<P121ScatterplotProps> = ({ data, width = 400, height = 300 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  const margin = { top: 20, right: 30, bottom: 60, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create scales
    const maxSales = Math.max(...data.map((d) => d.Sales));
    const minSales = Math.min(...data.map((d) => d.Sales));
    const maxProfit = Math.max(...data.map((d) => d.Profit));
    const minProfit = Math.min(...data.map((d) => d.Profit));
    const maxQuantity = Math.max(...data.map((d) => d.Quantity));

    const xScale = d3.scaleLinear()
      .domain([minSales, maxSales * 1.05])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([minProfit * 1.05, maxProfit * 1.05])
      .range([innerHeight, 0]);

    const sizeScale = d3.scaleLinear()
      .domain([0, maxQuantity])
      .range([4, 20]);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([minSales, maxSales]);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d) => `$${(d as number).toLocaleString()}`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '10px');

    const yAxis = d3.axisLeft(yScale)
      .tickFormat((d) => `$${(d as number).toLocaleString()}`);

    g.append('g')
      .call(yAxis)
      .style('font-size', '11px');

    // Add axis labels
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 55})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Sales');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -55)
      .attr('x', -innerHeight / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Profit');

    // Add circles
    g.selectAll('.circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', (d) => xScale(d.Sales))
      .attr('cy', (d) => yScale(d.Profit))
      .attr('r', (d) => sizeScale(d.Quantity))
      .attr('fill', (d) => colorScale(d.Sales))
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setTooltip({
          visible: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `
            <div style="font-weight: bold; margin-bottom: 4px; max-width: 200px;">${d.ProductName}</div>
            <div>Sales: $${d.Sales.toLocaleString()}</div>
            <div>Profit: $${d.Profit.toLocaleString()}</div>
            <div>Quantity: ${d.Quantity}</div>
          `,
        });

        // Highlight the hovered circle
        d3.select(event.currentTarget)
          .attr('opacity', 1)
          .attr('stroke-width', 2);
      })
      .on('mouseout', (event) => {
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
        d3.select(event.currentTarget)
          .attr('opacity', 0.7)
          .attr('stroke-width', 1);
      });
  }, [data, innerWidth, innerHeight, margin.left, margin.top]);

  return (
    <div style={{ position: 'relative' }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
        Scatterplot
      </h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block', margin: '0 auto' }}
      />
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
            zIndex: 1000,
            fontSize: '12px',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};

export default P121Scatterplot;
