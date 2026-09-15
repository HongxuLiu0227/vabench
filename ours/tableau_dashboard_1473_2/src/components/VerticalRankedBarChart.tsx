import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { WorksheetProps, ChartMargins } from '../types';
import { getTableauColors } from '../services/dataService';
import { useHighlight } from '../contexts/HighlightContext';

const VerticalRankedBarChart: React.FC<WorksheetProps> = ({
  title,
  data,
  isTop,
  isStart,
  highlightedStations = new Set<string>()
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions] = useState({ width: 400, height: 350 });
  const { setHighlight, clearHighlight } = useHighlight();

  // Calculate if a bar should be highlighted
  const isHighlighted = useCallback((stationName: string): boolean => {
    if (highlightedStations.size === 0) return true; // No highlight active
    return highlightedStations.has(stationName);
  }, [highlightedStations]);

  // Calculate opacity for a bar
  const getOpacity = useCallback((stationName: string): number => {
    if (highlightedStations.size === 0) return 1; // No highlight active
    return isHighlighted(stationName) ? 1 : 0.2;
  }, [highlightedStations, isHighlighted]);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Dynamic margins based on label lengths
    const maxLabelLength = d3.max(data, d => d.name.length) || 0;
    const marginLeft = Math.max(60, maxLabelLength * 6);
    const marginBottom = Math.max(50, data.length * 20);

    const margins: ChartMargins = {
      top: 30,
      right: 30,
      bottom: marginBottom,
      left: marginLeft
    };

    const width = dimensions.width - margins.left - margins.right;
    const height = dimensions.height - margins.top - margins.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margins.left},${margins.top})`);

    // X scale (band scale for categories on x-axis)
    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.2);

    // Y scale (linear scale for counts on y-axis)
    const maxYValue = d3.max(data, d => d.count) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxYValue * 1.1]) // Add 10% headroom
      .nice()
      .range([height, 0]);

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(getTableauColors());

    // Create bars group
    const barsGroup = g.append('g');

    // Draw bars
    barsGroup.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.name) || 0)
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.count))
      .attr('fill', d => colorScale(d.name) as string)
      .attr('opacity', d => getOpacity(d.name))
      .attr('rx', 2) // Rounded corners
      .on('click', (event, d) => {
        event.stopPropagation();
        // Toggle highlight on click
        const type = isStart ? 'start' : 'end';
        if (isHighlighted(d.name)) {
          clearHighlight();
        } else {
          setHighlight(type, d.name);
        }
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', isHighlighted(d.name) ? 0.8 : 0.15)
          .attr('cursor', 'pointer');

        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('padding', '8px')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('border-radius', '4px')
          .style('pointer-events', 'none')
          .style('font-size', '12px')
          .style('z-index', '1000')
          .html(`<strong>${d.name}</strong><br/>Trips: ${d.count.toLocaleString()}`);

        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .style('opacity', 1);
      })
      .on('mousemove', function(event) {
        d3.select('.tooltip')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', function(_, d) {
        d3.select(this)
          .attr('opacity', getOpacity(d.name))
          .attr('cursor', 'default');

        d3.selectAll('.tooltip').remove();
      });

    // X Axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '11px')
      .style('font-family', 'Arial, sans-serif');

    // Y Axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'Arial, sans-serif');

    // Y Axis label
    g.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margins.left + 10)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-family', 'Arial, sans-serif')
      .style('font-weight', 'bold')
      .text('Number of Trips');

    // Title
    svg.append('text')
      .attr('class', 'chart-title')
      .attr('x', dimensions.width / 2)
      .attr('y', margins.top / 2 + 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-family', 'Arial, sans-serif')
      .style('font-weight', 'bold')
      .text(title);

  }, [data, title, isTop, isStart, dimensions, highlightedStations, setHighlight, clearHighlight, isHighlighted, getOpacity]);

  // Handle click outside to clear highlight
  useEffect(() => {
    const handleOutsideClick = () => {
      clearHighlight();
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [clearHighlight]);

  return (
    <div className="worksheet-container">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default VerticalRankedBarChart;
