import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { PositionStats, SelectionState } from '../../types';

interface MaxAgePositionProps {
  data: PositionStats[];
  selection: SelectionState;
  onSelect: (worksheet: string, position: string) => void;
}

export const MaxAgePosition: React.FC<MaxAgePositionProps> = ({ data, selection, onSelect }) => {
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
    const validData = data.filter(d => !isNaN(d.maxAge) && isFinite(d.maxAge));

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

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(validData.map((d) => d.position))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3
      .scaleLinear()
      .domain([0, (d3.max(validData, (d) => d.maxAge) || 0) * 1.2])
      .range([innerHeight, 0]);

    const colorScale = d3
      .scaleSequential()
      .domain([d3.min(validData, (d) => d.maxAge) || 0, d3.max(validData, (d) => d.maxAge) || 0])
      .interpolator(d3.interpolatePlasma);

    // Add title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Times New Roman, serif')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#edc948')
      .text('Players at the position with Maximal Age');

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
      .text('Age');

    // Draw squares
    const squareSize = Math.min(xScale.bandwidth(), 40);

    g.selectAll('rect')
      .data(validData)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.position)! + (xScale.bandwidth() - squareSize) / 2)
      .attr('y', (d) => yScale(d.maxAge) - squareSize / 2)
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('fill', (d) => colorScale(d.maxAge))
      .attr('stroke', (d) =>
        selection?.worksheet === '9b_Max_age_position' && selection?.position === d.position
          ? '#ff0000'
          : '#333'
      )
      .attr('stroke-width', (d) =>
        selection?.worksheet === '9b_Max_age_position' && selection?.position === d.position
          ? 3
          : 1
      )
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelect('9b_Max_age_position', d.position);
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
          .text(`${d.position}: ${d.maxAge} years (${d.maxPlayer?.Name || 'N/A'})`);

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

    // Add value labels on squares
    g.selectAll('label')
      .data(validData)
      .enter()
      .append('text')
      .attr('x', (d) => xScale(d.position)! + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.maxAge))
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .style('pointer-events', 'none')
      .text((d) => d.maxAge);

  }, [data, selection, onSelect]);

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '400px' }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};
