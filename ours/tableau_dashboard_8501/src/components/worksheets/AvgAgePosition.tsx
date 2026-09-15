import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { PositionStats, SelectionState } from '../../types';

interface AvgAgePositionProps {
  data: PositionStats[];
  selection: SelectionState;
  onSelect: (worksheet: string, position: string) => void;
}

export const AvgAgePosition: React.FC<AvgAgePositionProps> = ({ data, selection, onSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current || data.length === 0) return;

    const wrapper = wrapperRef.current;
    const width = wrapper.clientWidth;
    const height = 400;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const margin = { top: 40, right: 20, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter out data with invalid ages
    const validData = data.filter(d => !isNaN(d.avgAge) && isFinite(d.avgAge));

    if (validData.length === 0) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#666')
        .text('No valid data available');
      return;
    }

    // Sort data by average age descending
    const sortedData = [...validData].sort((a, b) => b.avgAge - a.avgAge);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.position))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, (d3.max(sortedData, (d) => d.avgAge) || 0) * 1.1])
      .range([innerHeight, 0]);

    const colorScale = d3
      .scaleSequential()
      .domain([d3.min(sortedData, (d) => d.avgAge) || 0, d3.max(sortedData, (d) => d.avgAge) || 0])
      .interpolator(d3.interpolateViridis);

    // Add title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Times New Roman, serif')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#76b7b2')
      .text('Average Age at the Position');

    // Add X axis
    const xAxis = d3.axisBottom(xScale);
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '11px');

    // Add Y axis
    const yAxis = d3.axisLeft(yScale);
    g.append('g')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Average Age');

    // Draw bars
    g.selectAll('rect')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.position)!)
      .attr('y', (d) => yScale(d.avgAge))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => innerHeight - yScale(d.avgAge))
      .attr('fill', (d) => colorScale(d.avgAge))
      .attr('stroke', (d) =>
        selection?.worksheet === '9c_Avg_age_position' && selection?.position === d.position
          ? '#ff0000'
          : 'none'
      )
      .attr('stroke-width', (d) =>
        selection?.worksheet === '9c_Avg_age_position' && selection?.position === d.position
          ? 3
          : 0
      )
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelect('9c_Avg_age_position', d.position);
      })
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1);
        // Show tooltip
        const tooltip = svg
          .append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${event.offsetX + 10},${event.offsetY - 10})`);

        const text = tooltip
          .append('text')
          .attr('dy', '0.35em')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .text(`${d.position}: ${d.avgAge.toFixed(1)} years (n=${d.count})`);

        const bbox = (text.node() as SVGTextElement).getBBox();
        tooltip
          .insert('rect', 'text')
          .attr('x', bbox.x - 5)
          .attr('y', bbox.y - 5)
          .attr('width', bbox.width + 10)
          .attr('height', bbox.height + 10)
          .attr('fill', 'white')
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .attr('opacity', 0.9);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8);
        svg.selectAll('.tooltip').remove();
      });

    // Add value labels on bars
    g.selectAll('label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('x', (d) => xScale(d.position)! + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.avgAge) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .text((d) => d.avgAge.toFixed(1));

  }, [data, selection, onSelect]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '400px' }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};
