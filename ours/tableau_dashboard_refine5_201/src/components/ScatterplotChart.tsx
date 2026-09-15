import { useEffect, useRef, useState } from 'react';
import * as d3Scale from 'd3-scale';
import * as d3Select from 'd3-selection';
import * as d3Axis from 'd3-axis';
import { extent, max } from 'd3-array';

export interface ScatterPoint {
  x: number;
  y: number;
  size: number;
  productName: string;
  subCategory: string;
  category: string;
}

interface ScatterplotChartProps {
  data: ScatterPoint[];
  width: number;
  height: number;
  title: string;
}

export const ScatterplotChart: React.FC<ScatterplotChartProps> = ({
  data,
  width,
  height,
  title
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Calculate dimensions
    const margin = { top: 40, right: 20, bottom: 50, left: 60 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    // Clear previous content
    const svg = d3Select.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3Scale
      .scaleLinear()
      .domain([0, max(data, (d: ScatterPoint) => d.x) || 0])
      .range([0, chartWidth])
      .nice();

    const yScale = d3Scale
      .scaleLinear()
      .domain(extent(data, (d: ScatterPoint) => d.y) as [number, number])
      .range([chartHeight, 0])
      .nice();

    const sizeScale = d3Scale
      .scaleSqrt()
      .domain([0, max(data, (d: ScatterPoint) => d.size) || 0])
      .range([3, 15]);

    // Add title
    svg
      .append('text')
      .attr('x', dimensions.width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('font-family', 'Arial, sans-serif')
      .text(title);

    // Create color scale for categories
    const categories = Array.from(new Set(data.map((d: ScatterPoint) => d.category)));
    const colorScale = d3Scale
      .scaleOrdinal()
      .domain(categories)
      .range(['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7']);

    // Create circles
    g
      .selectAll('.circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d: ScatterPoint) => xScale(d.x))
      .attr('cy', (d: ScatterPoint) => yScale(d.y))
      .attr('r', (d: ScatterPoint) => sizeScale(d.size))
      .attr('fill', (d: ScatterPoint) => colorScale(d.category) as string)
      .attr('fill-opacity', (d: ScatterPoint) => hoveredPoint === d.productName ? 1 : 0.6)
      .attr('stroke', (d: ScatterPoint) => hoveredPoint === d.productName ? '#000' : 'none')
      .attr('stroke-width', (d: ScatterPoint) => hoveredPoint === d.productName ? 2 : 0)
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, d: ScatterPoint) => {
        setHoveredPoint(d.productName);

        // Show tooltip
        const tooltip = d3Select.select('#tooltip');
        tooltip
          .style('display', 'block')
          .style('position', 'absolute')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .style('background', 'white')
          .style('border', '1px solid #ddd')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
          .style('font-size', '12px')
          .style('font-family', 'Arial, sans-serif')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .html(`
            <strong>${d.productName}</strong><br/>
            Category: ${d.category}<br/>
            Sub-Category: ${d.subCategory}<br/>
            Sales: $${d.x.toFixed(2)}<br/>
            Profit: $${d.y.toFixed(2)}<br/>
            Quantity: ${d.size}
          `);
      })
      .on('mousemove', (event: MouseEvent) => {
        const tooltip = d3Select.select('#tooltip');
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseleave', () => {
        setHoveredPoint(null);
        d3Select.select('#tooltip').style('display', 'none');
      });

    // Add x-axis
    g
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3Axis.axisBottom(xScale).tickFormat((d) => `$${Number(d) / 1000}k`))
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'Arial, sans-serif');

    // Add x-axis label
    g
      .append('text')
      .attr('class', 'x-label')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('font-family', 'Arial, sans-serif')
      .text('Sales');

    // Add y-axis
    g
      .append('g')
      .attr('class', 'y-axis')
      .call(d3Axis.axisLeft(yScale).tickFormat((d) => `$${Number(d) / 1000}k`))
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'Arial, sans-serif');

    // Add y-axis label
    g
      .append('text')
      .attr('class', 'y-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('font-family', 'Arial, sans-serif')
      .text('Profit');

    // Add grid lines
    g
      .selectAll('.x-grid')
      .data(xScale.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'x-grid')
      .attr('x1', (d: number) => xScale(d))
      .attr('x2', (d: number) => xScale(d))
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '3,3');

    g
      .selectAll('.y-grid')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'y-grid')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', (d: number) => yScale(d))
      .attr('y2', (d: number) => yScale(d))
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '3,3');

  }, [data, dimensions, title, hoveredPoint]);

  useEffect(() => {
    const updateDimensions = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth || width,
          height: container.clientHeight || height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [width, height]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block' }}
      />
      <div id="tooltip" style={{ display: 'none' }} />
    </div>
  );
};
