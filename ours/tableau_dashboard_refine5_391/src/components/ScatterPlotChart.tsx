import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  sales: number;
  profit: number;
  quantity: number;
  productName: string;
}

interface ScatterPlotChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

export const ScatterPlotChart: React.FC<ScatterPlotChartProps> = ({
  data,
  width = 400,
  height = 300
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (container) {
      const updateDimensions = () => {
        const containerWidth = container.clientWidth;
        const aspectRatio = width / height;
        setDimensions({
          width: containerWidth,
          height: containerWidth / aspectRatio
        });
      };

      updateDimensions();
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(container);

      return () => resizeObserver.disconnect();
    }
  }, [width, height]);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const { width: w, height: h } = dimensions;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = w - margin.left - margin.right;
    const innerHeight = h - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', w)
      .attr('height', h);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (Sales)
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([0, innerWidth]);

    // Y scale (Profit)
    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.profit) || 0, d3.max(data, d => d.profit) || 0])
      .range([innerHeight, 0]);

    // Size scale (Quantity)
    const sizeScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.quantity) || 0, d3.max(data, d => d.quantity) || 0])
      .range([3, 15]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format(',.0f')))
      .attr('color', '#666');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d3.format(',.0f')))
      .attr('color', '#666');

    // Add zero line for y axis
    const yZero = yScale(0);
    if (yZero >= 0 && yZero <= innerHeight) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yZero)
        .attr('y2', yZero)
        .attr('stroke', '#999')
        .attr('stroke-dasharray', '3,3')
        .attr('stroke-width', 1);
    }

    // Circles
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.sales))
      .attr('cy', d => yScale(d.profit))
      .attr('r', d => sizeScale(d.quantity))
      .attr('fill', '#1f77b4')
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('fill-opacity', 0.9)
          .attr('stroke-width', 2);

        // Tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0,0,0,0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('pointer-events', 'none')
          .style('font-size', '12px')
          .style('max-width', '200px')
          .html(`
            <strong>${d.productName.substring(0, 50)}${d.productName.length > 50 ? '...' : ''}</strong><br/>
            Sales: ${d3.format(',.2f')(d.sales)}<br/>
            Profit: ${d3.format(',.2f')(d.profit)}<br/>
            Quantity: ${d.quantity}
          `);

        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('fill-opacity', 0.6)
          .attr('stroke-width', 1);
        d3.selectAll('.tooltip').remove();
      });

  }, [data, dimensions]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};
