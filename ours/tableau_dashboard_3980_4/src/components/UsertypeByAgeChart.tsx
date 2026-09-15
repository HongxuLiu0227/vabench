import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { UsertypeAgeData } from '../types';

interface UsertypeByAgeChartProps {
  data: UsertypeAgeData[];
  width?: number;
  height?: number;
  onUsertypeSelect?: (usertype: 'Subscriber' | 'Customer' | null) => void;
  selectedUsertype?: 'Subscriber' | 'Customer' | null;
}

// Color mapping from requirements
const USERTYPE_COLORS: Record<string, string> = {
  Subscriber: '#e15759',
  Customer: '#edc948',
};

const UsertypeByAgeChart: React.FC<UsertypeByAgeChartProps> = ({
  data,
  width = 400,
  height = 200,
  onUsertypeSelect,
  selectedUsertype = null,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);

    // Calculate margins based on label width
    const margin = { top: 20, right: 30, bottom: 30, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.avgAge) || 0])
      .range([0, innerWidth])
      .nice();

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.usertype))
      .range([0, innerHeight])
      .padding(0.3);

    // Create x-axis
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format('.1f'));

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#666')
      .attr('font-size', '12px');

    // Create y-axis
    const yAxis = d3.axisLeft(yScale);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .attr('color', '#666')
      .attr('font-size', '12px');

    // Add axis title
    g.append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', '#666')
      .text('Usertype');

    // Add x-axis label
    g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 25})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', '#666')
      .text('Average Age');

    // Create bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => yScale(d.usertype) || 0)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', (d) => xScale(d.avgAge))
      .attr('fill', (d) => USERTYPE_COLORS[d.usertype])
      .attr('opacity', (d) => {
        // Dim other bars when one is selected
        if (selectedUsertype && selectedUsertype !== d.usertype) {
          return 0.3;
        }
        // Highlight hovered bar
        if (hoveredBar && hoveredBar !== d.usertype) {
          return 0.7;
        }
        return 1;
      })
      .attr('cursor', 'pointer')
      .attr('rx', 2)
      .on('click', (_event, d) => {
        // Toggle selection
        if (onUsertypeSelect) {
          const newSelection = selectedUsertype === d.usertype ? null : d.usertype;
          onUsertypeSelect(newSelection);
        }
      })
      .on('mousemove', (event, d) => {
        const [x, y] = d3.pointer(event, svgRef.current);
        setTooltip({
          x: x + margin.left + 15,
          y: y + margin.top,
          content: `${d.usertype}: Avg Age ${d.avgAge.toFixed(1)} (${d.count} trips)`,
        });
        setHoveredBar(d.usertype);
      })
      .on('mouseleave', () => {
        setTooltip(null);
        setHoveredBar(null);
      });

    // Add value labels at the end of bars
    g.append('g')
      .selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('y', (d) => (yScale(d.usertype) || 0) + yScale.bandwidth() / 2)
      .attr('x', (d) => xScale(d.avgAge) + 5)
      .attr('dy', '.35em')
      .style('font-size', '12px')
      .style('fill', '#333')
      .style('font-weight', '500')
      .text((d) => d.avgAge.toFixed(1));

  }, [data, width, height, selectedUsertype, hoveredBar, onUsertypeSelect]);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 100,
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default UsertypeByAgeChart;
