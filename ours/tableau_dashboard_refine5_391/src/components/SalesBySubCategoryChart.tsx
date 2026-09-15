import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  subCategory: string;
  sales: number;
  count: number;
}

interface SalesBySubCategoryChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

export const SalesBySubCategoryChart: React.FC<SalesBySubCategoryChartProps> = ({
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

    const margin = { top: 20, right: 30, bottom: 20, left: 150 };
    const innerWidth = w - margin.left - margin.right;
    const innerHeight = h - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', w)
      .attr('height', h);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([0, innerWidth]);

    // Y scale
    const yScale = d3.scaleBand()
      .domain(data.map(d => d.subCategory))
      .range([0, innerHeight])
      .padding(0.1);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format(',.0f')))
      .attr('color', '#666');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .attr('color', '#666');

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('y', d => yScale(d.subCategory) || 0)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(d.sales))
      .attr('fill', '#1f77b4')
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#2077b4');

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
          .html(`<strong>${d.subCategory}</strong><br/>Sales: ${d3.format(',.2f')(d.sales)}<br/>Orders: ${d.count}`);

        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', '#1f77b4');
        d3.selectAll('.tooltip').remove();
      });

  }, [data, dimensions]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};
