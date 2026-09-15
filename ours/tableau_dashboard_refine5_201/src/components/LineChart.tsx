import { useEffect, useRef, useState } from 'react';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Select from 'd3-selection';
import * as d3Axis from 'd3-axis';
import { max } from 'd3-array';

export interface TimeSeriesPoint {
  year: string;
  value: number;
}

interface LineChartProps {
  data: TimeSeriesPoint[];
  width: number;
  height: number;
  title: string;
}

export const LineChart: React.FC<LineChartProps> = ({
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
    const margin = { top: 40, right: 30, bottom: 50, left: 70 };
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
      .scalePoint()
      .domain(data.map((d: TimeSeriesPoint) => d.year))
      .range([0, chartWidth])
      .padding(0.5);

    const yScale = d3Scale
      .scaleLinear()
      .domain([0, max(data, (d: TimeSeriesPoint) => d.value) || 0])
      .range([chartHeight, 0])
      .nice();

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

    // Create line generator
    const line = d3Shape
      .line<TimeSeriesPoint>()
      .x((d: TimeSeriesPoint) => xScale(d.year) || 0)
      .y((d: TimeSeriesPoint) => yScale(d.value))
      .curve(d3Shape.curveMonotoneX);

    // Add area fill
    const area = d3Shape
      .area<TimeSeriesPoint>()
      .x((d: TimeSeriesPoint) => xScale(d.year) || 0)
      .y0(chartHeight)
      .y1((d: TimeSeriesPoint) => yScale(d.value))
      .curve(d3Shape.curveMonotoneX);

    g
      .append('path')
      .datum(data)
      .attr('fill', '#4e79a7')
      .attr('fill-opacity', 0.2)
      .attr('d', area);

    // Add line
    g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4e79a7')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add points
    g
      .selectAll('.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', (d: TimeSeriesPoint) => xScale(d.year) || 0)
      .attr('cy', (d: TimeSeriesPoint) => yScale(d.value))
      .attr('r', (d: TimeSeriesPoint) => hoveredPoint === d.year ? 6 : 4)
      .attr('fill', '#4e79a7')
      .attr('stroke', (d: TimeSeriesPoint) => hoveredPoint === d.year ? '#000' : 'none')
      .attr('stroke-width', (d: TimeSeriesPoint) => hoveredPoint === d.year ? 2 : 0)
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, d: TimeSeriesPoint) => {
        setHoveredPoint(d.year);

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
            <strong>${d.year}</strong><br/>
            Sales: $${d.value.toFixed(2)}
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
      .call(d3Axis.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '11px')
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
      .text('Year');

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
      .attr('y', -55)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('font-family', 'Arial, sans-serif')
      .text('Sales');

    // Add grid lines
    g
      .selectAll('.x-grid')
      .data(xScale.domain())
      .enter()
      .append('line')
      .attr('class', 'x-grid')
      .attr('x1', (d: string) => xScale(d) || 0)
      .attr('x2', (d: string) => xScale(d) || 0)
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
