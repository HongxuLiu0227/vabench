import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { BaseballPlayer } from '../../types/baseball';
import { calculateMargins } from '../../utils/chartUtils';

interface ScatterPlotProps {
  data: BaseballPlayer[];
  width?: number;
  height?: number;
  title?: string;
  xField?: keyof BaseballPlayer;
  yField?: keyof BaseballPlayer;
  colorField?: keyof BaseballPlayer;
  onPointClick?: (player: BaseballPlayer) => void;
  highlightedNames?: Set<string>;
  highlightedHandedness?: Set<string>;
}

export function ScatterPlot({
  data,
  width = 600,
  height = 400,
  title,
  xField = 'height',
  yField = 'weight',
  colorField = 'handedness',
  onPointClick,
  highlightedNames = new Set(),
  highlightedHandedness = new Set()
}: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const updateDimensions = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        setDimensions({
          width: containerWidth,
          height: Math.max(300, containerWidth * 0.6)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const { width: w, height: h } = dimensions;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Calculate margins
    const margins = calculateMargins(20, true, true, false);
    const innerWidth = w - margins.left - margins.right;
    const innerHeight = h - margins.top - margins.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', w)
      .attr('height', h);

    // Create group
    const g = svg.append('g')
      .attr('transform', `translate(${margins.left},${margins.top})`);

    // Get unique values for color field
    const colorValues = Array.from(new Set(data.map(d => String(d[colorField]))));

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(colorValues)
      .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']);

    // X scale
    const xExtent = d3.extent(data, d => Number(d[xField])) as [number, number];
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] * 0.95, xExtent[1] * 1.05])
      .range([0, innerWidth]);

    // Y scale
    const yExtent = d3.extent(data, d => Number(d[yField])) as [number, number];
    const yScale = d3.scaleLinear()
      .domain([yExtent[0] * 0.95, yExtent[1] * 1.05])
      .range([innerHeight, 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10));

    // X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2},${innerHeight + margins.bottom - 10})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(String(xField));

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(10));

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margins.left + 10)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(String(yField));

    // Points
    const points = g.selectAll('.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => xScale(Number(d[xField])))
      .attr('cy', d => yScale(Number(d[yField])))
      .attr('r', 5)
      .attr('fill', d => colorScale(String(d[colorField])) as string)
      .attr('opacity', d => {
        const nameHighlighted = highlightedNames.size === 0 || highlightedNames.has(d.name);
        const handednessHighlighted = highlightedHandedness.size === 0 || highlightedHandedness.has(d.handedness);
        return nameHighlighted && handednessHighlighted ? 0.7 : 0.2;
      })
      .attr('stroke', d => {
        const nameHighlighted = highlightedNames.has(d.name);
        const handednessHighlighted = highlightedHandedness.has(d.handedness);
        if (nameHighlighted || handednessHighlighted) {
          return '#333';
        }
        return 'none';
      })
      .attr('stroke-width', d => {
        const nameHighlighted = highlightedNames.has(d.name);
        const handednessHighlighted = highlightedHandedness.has(d.handedness);
        if (nameHighlighted || handednessHighlighted) {
          return 2;
        }
        return 0;
      })
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        if (onPointClick) {
          onPointClick(d);
        }
      });

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

    points.on('mouseover', function(_event, d) {
      d3.select(this)
        .attr('r', 7);

      tooltip
        .style('visibility', 'visible')
        .html(`
          <strong>${d.name}</strong><br/>
          Handedness: ${d.handedness}<br/>
          Height: ${d.height}<br/>
          Weight: ${d.weight}<br/>
          Avg: ${d.avg.toFixed(3)}<br/>
          HR: ${d.HR}
        `)
        .style('left', (_event.pageX + 10) + 'px')
        .style('top', (_event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      d3.select(this)
        .attr('r', 5);
      tooltip.style('visibility', 'hidden');
    });

  }, [data, dimensions, xField, yField, colorField, onPointClick, highlightedNames, highlightedHandedness]);

  return (
    <div>
      {title && <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>{title}</h3>}
      <svg ref={svgRef}></svg>
    </div>
  );
}
