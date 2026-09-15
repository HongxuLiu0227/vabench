import { useEffect, useRef } from 'react';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Axis from 'd3-axis';
import { useDashboard } from '../../contexts/DashboardContext';
import './HeightWeightScatter.css';

export const HeightWeightScatter: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filteredData, selectionState, selectByName } = useDashboard();

  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Dimensions
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const width = 600 - margin.left - margin.right;
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

    // Color by bad weight (outliers in red)
    const colorScale = d3Scale.scaleOrdinal<string>()
      .domain(['outlier', 'normal'])
      .range(['#e15759', '#4e79a7']);

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
      .attr('fill', d => colorScale(d.isBadWeight ? 'outlier' : 'normal') as string)
      .attr('opacity', d => {
        if (selectionState.names.length === 0) return 0.7;
        return selectionState.names.includes(d.name) ? 1 : 0.2;
      })
      .attr('stroke', d => colorScale(d.isBadWeight ? 'outlier' : 'normal') as string)
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        if (selectionState.names.includes(d.name)) {
          selectByName([], 'Relation btw Weight and Height');
        } else {
          selectByName([d.name], 'Relation btw Weight and Height');
        }
      })
      .append('title')
      .text(d => `${d.name}\nHeight: ${d.height}"\nWeight: ${d.weight} lbs\nHandedness: ${d.handedness}${d.isBadWeight ? '\n⚠️ Weight Outlier' : ''}`);

    // Add legend
    const legendG = svg.append('g')
      .attr('transform', `translate(${width - 100}, 10)`);

    legendG.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 5)
      .attr('fill', '#4e79a7');

    legendG.append('text')
      .attr('x', 10)
      .attr('y', 4)
      .style('font-size', '10px')
      .text('Normal');

    legendG.append('circle')
      .attr('cx', 0)
      .attr('cy', 20)
      .attr('r', 5)
      .attr('fill', '#e15759');

    legendG.append('text')
      .attr('x', 10)
      .attr('y', 24)
      .style('font-size', '10px')
      .text('Outlier');

  }, [filteredData, selectionState, selectByName]);

  if (filteredData.length === 0) {
    return (
      <div className="worksheet height-weight-scatter">
        <h3>Relation btw Weight and Height</h3>
        <div className="empty-state" role="status" aria-live="polite">
          <p>No data available for the current filters.</p>
          <p className="empty-state-hint">Try adjusting the handedness filter in the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="worksheet height-weight-scatter">
      <h3>Relation btw Weight and Height</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
};
