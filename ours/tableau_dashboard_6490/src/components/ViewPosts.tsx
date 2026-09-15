import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { DataRow, FilterState } from '../types';

interface ViewPostsProps {
  data: DataRow[];
  filter: FilterState | null;
}

const ViewPosts: React.FC<ViewPostsProps> = ({ data, filter }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Color palette from requirements
  const colorPalette: Record<string, string> = useMemo(() => ({
    html: '#499894',
    '.net': '#4e79a7',
    c: '#59a14f',
    javascript: '#79706e',
    ios: '#86bcb6',
    'c#': '#8cd17d',
    'ruby-on-rails': '#9d7660',
    android: '#a0cbe8',
    php: '#b07aa1',
    'c++': '#b6992d',
    jquery: '#bab0ac',
    mysql: '#d37295',
    python: '#d4a6c8',
    sql: '#d7b5a6',
    iphone: '#e15759',
    css: '#f1ce63',
    angularjs: '#f28e2b',
    'objective-c': '#fabfd2',
    java: '#ff9d9a',
    'asp.net': '#ffbe7d',
  }), []);

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const parent = svgRef.current.parentElement;
        if (parent) {
          setDimensions({
            width: parent.clientWidth,
            height: Math.max(400, parent.clientWidth * 0.45),
          });
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const margin = { top: 40, right: 40, bottom: 80, left: 80 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter data based on filter state
    const filteredData = filter
      ? data.filter(
          (d) => d['True Label'] === filter.trueLabel && d['Predicted Label'] === filter.predictedLabel
        )
      : data;

    // Create scales
    const xScale = d3.scaleLinear().domain([-0.4, 20.0]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-0.25, 20.25]).range([height, 0]);
    const colorScale = d3.scaleOrdinal<string>().domain(Object.keys(colorPalette)).range(Object.values(colorPalette));

    // Size scale based on F1 score
    const sizeScale = d3.scaleSqrt().domain(d3.extent(filteredData, (d) => d.F1) as [number, number]).range([4, 12]);

    // Shape scale based on True Label
    const uniqueTrueLabels = Array.from(new Set(data.map((d) => d['True Label'])));
    const shapeScale = d3
      .scaleOrdinal<string, d3.SymbolType>()
      .domain(uniqueTrueLabels)
      .range([
        d3.symbolCircle,
        d3.symbolCross,
        d3.symbolDiamond,
        d3.symbolSquare,
        d3.symbolStar,
        d3.symbolTriangle,
        d3.symbolWye,
      ]);

    // Add X axis
    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .selectAll('text')
      .style('font-size', '11px');

    // Add X axis label
    svg
      .append('text')
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Predicted');

    // Add Y axis
    svg
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(10))
      .selectAll('text')
      .style('font-size', '11px');

    // Add Y axis label
    svg
      .append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -60)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('True');

    // Add grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => '')
      );

    svg
      .append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-height)
          .tickFormat(() => '')
      );

    // Add symbols
    const symbolGenerator = d3.symbol();

    svg
      .selectAll('.symbol')
      .data(filteredData)
      .enter()
      .append('path')
      .attr('class', 'symbol')
      .attr('d', (d) => {
        const size = sizeScale(d.F1);
        const shape = shapeScale(d['True Label']) || d3.symbolCircle;
        symbolGenerator.type(shape).size(size * size);
        return symbolGenerator();
      })
      .attr('transform', (d) => `translate(${xScale(d.Predicted_XY)},${yScale(d.True_XY)})`)
      .attr('fill', (d) => colorScale(d['Predicted Label']) || '#999')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke-width', 2).attr('opacity', 1);

        // Show tooltip
        const tooltip = d3.select(tooltipRef.current);
        tooltip
          .style('display', 'block')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .html(`
            <div style="padding: 8px; background: rgba(0,0,0,0.8); color: white; border-radius: 4px; font-size: 12px; max-width: 300px;">
              <div><strong>ID:</strong> ${d.F1}</div>
              <div><strong>Post:</strong> ${d.Post.substring(0, 100)}${d.Post.length > 100 ? '...' : ''}</div>
              <div><strong>Predicted Label:</strong> ${d['Predicted Label']}</div>
              <div><strong>True Label:</strong> ${d['True Label']}</div>
            </div>
          `);
      })
      .on('mousemove', function(event) {
        const tooltip = d3.select(tooltipRef.current);
        tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 1).attr('opacity', 0.8);
        d3.select(tooltipRef.current).style('display', 'none');
      });
  }, [data, dimensions, filter, colorPalette]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {filter && (
        <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '14px', color: '#666' }}>
          Filtered by: True Label = "{filter.trueLabel}", Predicted Label = "{filter.predictedLabel}"
        </div>
      )}
      <div style={{ width: '100%', overflow: 'auto' }}>
        <svg ref={svgRef}></svg>
      </div>
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          display: 'none',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      ></div>
    </div>
  );
};

export default ViewPosts;
