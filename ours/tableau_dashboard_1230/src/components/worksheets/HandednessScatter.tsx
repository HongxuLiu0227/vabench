import { useEffect, useRef } from 'react';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Axis from 'd3-axis';
import { useDashboard } from '../../contexts/DashboardContext';
import './HandednessScatter.css';

export const HandednessScatter: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filteredData, selectionState, selectByName } = useDashboard();

  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Dimensions
    const margin = { top: 20, right: 120, bottom: 50, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3Scale.scaleLinear()
      .domain([
        Math.min(...filteredData.map(d => d.height)) * 0.98,
        Math.max(...filteredData.map(d => d.height)) * 1.02
      ])
      .range([0, width]);

    const y = d3Scale.scaleLinear()
      .domain([
        Math.min(...filteredData.map(d => d.weight)) * 0.98,
        Math.max(...filteredData.map(d => d.weight)) * 1.02
      ])
      .range([height, 0]);

    // Color scale by handedness
    const colorScale = d3Scale.scaleOrdinal()
      .domain(['L', 'R', 'B'])
      .range(['#4e79a7', '#f28e2b', '#e15759']);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3Axis.axisBottom(x));

    // Y Axis
    svg.append('g')
      .call(d3Axis.axisLeft(y));

    // X Axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Height (inches)');

    // Y Axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Weight (lbs)');

    // Circles
    svg.selectAll('.circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.height))
      .attr('cy', d => y(d.weight))
      .attr('r', 5)
      .attr('fill', d => colorScale(d.handedness) as string)
      .attr('opacity', d => {
        if (selectionState.names.length === 0) return 0.7;
        return selectionState.names.includes(d.name) ? 1 : 0.2;
      })
      .attr('stroke', d => colorScale(d.handedness) as string)
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        if (selectionState.names.includes(d.name)) {
          selectByName([], 'Relation btw Weight and Height with respect to the Handedness');
        } else {
          selectByName([d.name], 'Relation btw Weight and Height with respect to the Handedness');
        }
      })
      .append('title')
      .text(d => `${d.name}\nHeight: ${d.height}"\nWeight: ${d.weight} lbs\nHandedness: ${d.handedness}${d.isBadWeight ? '\n⚠️ Weight Outlier' : ''}`);

    // Add legend
    const legendG = svg.append('g')
      .attr('transform', `translate(${width + 10}, 20)`);

    const handednessValues = ['L', 'R', 'B'];
    const handednessLabels = ['Left', 'Right', 'Both'];

    handednessValues.forEach((value, i) => {
      const y = i * 25;

      legendG.append('circle')
        .attr('cx', 0)
        .attr('cy', y)
        .attr('r', 5)
        .attr('fill', colorScale(value) as string);

      legendG.append('text')
        .attr('x', 10)
        .attr('y', y + 4)
        .style('font-size', '11px')
        .text(handednessLabels[i]);
    });

    // Add outlier indicator in legend
    const outlierY = handednessValues.length * 25 + 10;
    legendG.append('text')
      .attr('x', 0)
      .attr('y', outlierY)
      .style('font-size', '9px')
      .style('fill', '#666')
      .text('⚠️ = Outlier');

  }, [filteredData, selectionState, selectByName]);

  if (filteredData.length === 0) {
    return (
      <div className="worksheet handedness-scatter">
        <h3>Relation btw Weight and Height with respect to the Handedness</h3>
        <div className="empty-state" role="status" aria-live="polite">
          <p>No data available for the current filters.</p>
          <p className="empty-state-hint">Try adjusting the handedness filter in the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="worksheet handedness-scatter">
      <h3>Relation btw Weight and Height with respect to the Handedness</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
};
