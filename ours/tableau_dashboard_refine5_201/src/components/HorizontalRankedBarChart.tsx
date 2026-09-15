import { useEffect, useRef, useState } from 'react';
import * as d3Scale from 'd3-scale';
import * as d3Select from 'd3-selection';
import * as d3Axis from 'd3-axis';
import { max } from 'd3-array';

export interface BarData {
  category: string;
  value: number;
  subCategory?: string;
}

interface HorizontalRankedBarChartProps {
  data: BarData[];
  width: number;
  height: number;
  title: string;
  showSubCategory?: boolean;
}

export const HorizontalRankedBarChart: React.FC<HorizontalRankedBarChartProps> = ({
  data,
  width,
  height,
  title,
  showSubCategory = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Calculate dimensions
    const margin = { top: 40, right: 20, bottom: 20, left: 180 };
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
      .domain([0, max(data, (d: BarData) => d.value) || 0])
      .range([0, chartWidth])
      .nice();

    const yScale = d3Scale
      .scaleBand()
      .domain(data.map((d: BarData) => {
        if (showSubCategory && d.subCategory) {
          return `${d.category} - ${d.subCategory}`;
        }
        return d.category;
      }))
      .range([0, chartHeight])
      .padding(0.15);

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

    // Create bars
    const bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar');

    bars
      .append('rect')
      .attr('y', (d: BarData) => {
        const label = showSubCategory && d.subCategory
          ? `${d.category} - ${d.subCategory}`
          : d.category;
        return yScale(label) || 0;
      })
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('width', (d: BarData) => xScale(d.value))
      .attr('fill', '#4e79a7')
      .attr('opacity', (d: BarData) => {
        const label = showSubCategory && d.subCategory
          ? `${d.category} - ${d.subCategory}`
          : d.category;
        return hoveredBar && hoveredBar !== label ? 0.3 : 1;
      })
      .on('mouseenter', (_event: MouseEvent, d: BarData) => {
        const label = showSubCategory && d.subCategory
          ? `${d.category} - ${d.subCategory}`
          : d.category;
        setHoveredBar(label);
      })
      .on('mouseleave', () => {
        setHoveredBar(null);
      });

    // Add value labels at the end of bars
    bars
      .append('text')
      .attr('y', (d: BarData) => {
        const label = showSubCategory && d.subCategory
          ? `${d.category} - ${d.subCategory}`
          : d.category;
        return (yScale(label) || 0) + yScale.bandwidth() / 2;
      })
      .attr('x', (d: BarData) => xScale(d.value) + 5)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .style('font-size', '11px')
      .style('font-family', 'Arial, sans-serif')
      .text((d: BarData) => d.value.toFixed(2));

    // Add y-axis labels
    g
      .selectAll('.y-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'y-label')
      .attr('y', (d: BarData) => {
        const label = showSubCategory && d.subCategory
          ? `${d.category} - ${d.subCategory}`
          : d.category;
        return (yScale(label) || 0) + yScale.bandwidth() / 2;
      })
      .attr('x', -10)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('font-size', '11px')
      .style('font-family', 'Arial, sans-serif')
      .text((d: BarData) => {
        if (showSubCategory && d.subCategory) {
          return `${d.category} - ${d.subCategory}`;
        }
        return d.category;
      });

    // Add x-axis
    g
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3Axis.axisBottom(xScale).ticks(5).tickFormat((d) => `$${Number(d).toLocaleString()}`))
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'Arial, sans-serif');

    // Add grid lines
    g
      .selectAll('.grid-line')
      .data(xScale.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', (d: number) => xScale(d))
      .attr('x2', (d: number) => xScale(d))
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '3,3');

  }, [data, dimensions, title, showSubCategory, hoveredBar]);

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
    </div>
  );
};
