import { useEffect, useRef } from 'react';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Axis from 'd3-axis';
import { useDashboard } from '../../contexts/DashboardContext';
import './AvgHRBarChart.css';

interface BarData {
  category: string;
  value: number;
  name: string;
  handedness: string;
}

export const AvgHRBarChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filteredData, selectionState, selectByName } = useDashboard();

  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare data: aggregate by player (name) and get HR
    const dataMap = new Map<string, BarData>();
    filteredData.forEach(d => {
      if (!dataMap.has(d.name)) {
        dataMap.set(d.name, {
          category: d.name,
          value: d.hr,
          name: d.name,
          handedness: d.handedness
        });
      }
    });

    // Sort by HR descending and take top 20
    const data: BarData[] = Array.from(dataMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);

    // Dimensions
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3Scale.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, width])
      .padding(0.2);

    const y = d3Scale.scaleLinear()
      .domain([0, Math.max(...data.map(d => d.value)) * 1.1])
      .range([height, 0]);

    // Color scale based on handedness
    const colorScale = d3Scale.scaleOrdinal()
      .domain(['L', 'R', 'B'])
      .range(['#4e79a7', '#f28e2b', '#e15759']);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3Axis.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '10px');

    // Y Axis
    svg.append('g')
      .call(d3Axis.axisLeft(y));

    // Y Axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Home Runs');

    // Bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.category) || 0)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value))
      .attr('fill', d => colorScale(d.handedness) as string)
      .attr('opacity', d => {
        // Highlight selected
        if (selectionState.names.length === 0) return 1;
        return selectionState.names.includes(d.name) ? 1 : 0.3;
      })
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        // Toggle selection
        if (selectionState.names.includes(d.name)) {
          // Clear selection
          selectByName([], 'Avg. Home Run with Height & Weight');
        } else {
          // Select this player
          selectByName([d.name], 'Avg. Home Run with Height & Weight');
        }
      });

    // Add tooltips on hover
    svg.selectAll('.bar')
      .append('title')
      .text((d: unknown) => {
        const barData = d as BarData;
        return `${barData.name}\nHandedness: ${barData.handedness}\nHR: ${barData.value}`;
      });

  }, [filteredData, selectionState, selectByName]);

  if (filteredData.length === 0) {
    return (
      <div className="worksheet avg-hr-bar-chart">
        <h3>Avg. Home Run with Height & Weight</h3>
        <div className="empty-state" role="status" aria-live="polite">
          <p>No data available for the current filters.</p>
          <p className="empty-state-hint">Try adjusting the handedness filter in the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="worksheet avg-hr-bar-chart">
      <h3>Avg. Home Run with Height & Weight</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
};
