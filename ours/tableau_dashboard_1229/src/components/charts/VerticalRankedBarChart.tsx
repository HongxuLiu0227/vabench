import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { AggregatedData } from '../../types/baseball';
import { calculateMargins } from '../../utils/chartUtils';

interface VerticalRankedBarChartProps {
  data: AggregatedData[];
  width?: number;
  height?: number;
  title?: string;
  onBarClick?: (category: string, series?: string) => void;
  highlightedCategories?: Set<string>;
  highlightedSeries?: Set<string>;
}

export function VerticalRankedBarChart({
  data,
  width = 600,
  height = 400,
  title,
  onBarClick,
  highlightedCategories = new Set(),
  highlightedSeries = new Set()
}: VerticalRankedBarChartProps) {
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

    // Calculate max label length
    const maxLabelLength = Math.max(...data.map(d => d.category.length));

    // Calculate margins
    const margins = calculateMargins(maxLabelLength, true, true, false);
    const innerWidth = w - margins.left - margins.right;
    const innerHeight = h - margins.top - margins.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', w)
      .attr('height', h);

    // Create group
    const g = svg.append('g')
      .attr('transform', `translate(${margins.left},${margins.top})`);

    // Get unique series for color scale
    const allSeries = Array.from(new Set(data.map(d => d.series || 'default')));

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(allSeries)
      .range(d3.schemeCategory10);

    // X scale (band scale for categories)
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, innerWidth])
      .padding(0.2);

    // Y scale (linear for values)
    const maxValue = d3.max(data, d => d.value) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([innerHeight, 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .style('font-size', '11px');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale));

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margins.left + 10)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Value');

    // Bars
    const bars = g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.category) || 0)
      .attr('y', innerHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', d => colorScale(d.series || 'default') as string)
      .attr('opacity', d => {
        const categoryHighlighted = highlightedCategories.size === 0 || highlightedCategories.has(d.category);
        const seriesHighlighted = highlightedSeries.size === 0 || highlightedSeries.has(d.series || '');
        return categoryHighlighted && seriesHighlighted ? 1 : 0.3;
      })
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        if (onBarClick) {
          onBarClick(d.category, d.series);
        }
      });

    // Animation
    bars.transition()
      .duration(750)
      .attr('y', d => yScale(d.value))
      .attr('height', d => innerHeight - yScale(d.value));

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

    bars.on('mouseover', function(_event, d) {
      d3.select(this)
        .attr('stroke', '#333')
        .attr('stroke-width', 2);

      tooltip
        .style('visibility', 'visible')
        .html(`
          <strong>${d.category}</strong><br/>
          ${d.series ? `Series: ${d.series}<br/>` : ''}
          Value: ${d.value.toFixed(2)}
        `)
        .style('left', (_event.pageX + 10) + 'px')
        .style('top', (_event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      d3.select(this)
        .attr('stroke', 'none');
      tooltip.style('visibility', 'hidden');
    });

  }, [data, dimensions, onBarClick, highlightedCategories, highlightedSeries]);

  return (
    <div>
      {title && <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>{title}</h3>}
      <svg ref={svgRef}></svg>
    </div>
  );
}
