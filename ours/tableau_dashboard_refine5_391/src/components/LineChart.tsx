import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  year: number;
  month: number;
  sales: number;
  dateKey: string;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
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

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const innerWidth = w - margin.left - margin.right;
    const innerHeight = h - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', w)
      .attr('height', h);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create date objects for x scale
    const dates = data.map(d => new Date(d.year, d.month - 1, 1));

    // X scale (time)
    const xScale = d3.scaleTime()
      .domain(d3.extent(dates) as [Date, Date])
      .range([0, innerWidth]);

    // Y scale
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([innerHeight, 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(Math.min(data.length, 10)).tickFormat((d) => d3.timeFormat('%Y-%m')(d as Date)))
      .attr('color', '#666')
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d3.format(',.0f')))
      .attr('color', '#666');

    // Line
    const line = d3.line<DataPoint>()
      .x(d => xScale(new Date(d.year, d.month - 1, 1)))
      .y(d => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Dots
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(new Date(d.year, d.month - 1, 1)))
      .attr('cy', d => yScale(d.sales))
      .attr('r', 3)
      .attr('fill', '#1f77b4')
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 5);

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
          .html(`<strong>${d.dateKey}</strong><br/>Sales: ${d3.format(',.2f')(d.sales)}`);

        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 3);
        d3.selectAll('.tooltip').remove();
      });

  }, [data, dimensions]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};
