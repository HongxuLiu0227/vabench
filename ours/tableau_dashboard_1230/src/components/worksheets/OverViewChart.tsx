import { useEffect, useRef } from 'react';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Axis from 'd3-axis';
import { useDashboard } from '../../contexts/DashboardContext';
import { getOverviewStats } from '../../services/dataService';
import './OverViewChart.css';

export const OverViewChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filteredData, selectionState, selectByName } = useDashboard();

  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const stats = getOverviewStats(filteredData);

    // Create a multi-panel view with 4 small scatter plots
    const margin = { top: 40, right: 20, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define 4 panels (2x2 grid)
    const panels = [
      { id: 1, title: 'Height vs Weight', x: 0, y: 0, xField: 'height', yField: 'weight', w: width / 2 - 10, h: height / 2 - 10 },
      { id: 2, title: 'Batting Avg vs HR', x: width / 2 + 10, y: 0, xField: 'avg', yField: 'hr', w: width / 2 - 10, h: height / 2 - 10 },
      { id: 3, title: 'Height vs HR', x: 0, y: height / 2 + 10, xField: 'height', yField: 'hr', w: width / 2 - 10, h: height / 2 - 10 },
      { id: 4, title: 'Weight vs Batting Avg', x: width / 2 + 10, y: height / 2 + 10, xField: 'weight', yField: 'avg', w: width / 2 - 10, h: height / 2 - 10 }
    ];

    panels.forEach(panel => {
      // Create panel group
      const panelG = svg.append('g')
        .attr('transform', `translate(${panel.x},${panel.y})`);

      // Panel title
      panelG.append('text')
        .attr('x', panel.w / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .text(panel.title);

      // Get data for this panel
      const xValues = filteredData.map(d => d[panel.xField as keyof typeof d] as number);
      const yValues = filteredData.map(d => d[panel.yField as keyof typeof d] as number);

      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = Math.min(...yValues);
      const yMax = Math.max(...yValues);

      // Scales
      const x = d3Scale.scaleLinear()
        .domain([xMin * 0.95, xMax * 1.05])
        .range([0, panel.w]);

      const y = d3Scale.scaleLinear()
        .domain([yMin * 0.95, yMax * 1.05])
        .range([panel.h, 0]);

      // Color by handedness
      const colorScale = d3Scale.scaleOrdinal()
        .domain(['L', 'R', 'B'])
        .range(['#4e79a7', '#f28e2b', '#e15759']);

      // X Axis
      panelG.append('g')
        .attr('transform', `translate(0,${panel.h})`)
        .call(d3Axis.axisBottom(x).ticks(5))
        .style('font-size', '9px');

      // Y Axis
      panelG.append('g')
        .call(d3Axis.axisLeft(y).ticks(5))
        .style('font-size', '9px');

      // X Axis label
      panelG.append('text')
        .attr('x', panel.w / 2)
        .attr('y', panel.h + 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .text(panel.xField);

      // Y Axis label
      panelG.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -35)
        .attr('x', -panel.h / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .text(panel.yField);

      // Circles
      panelG.selectAll('.circle')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('cx', d => x(d[panel.xField as keyof typeof d] as number))
        .attr('cy', d => y(d[panel.yField as keyof typeof d] as number))
        .attr('r', 4)
        .attr('fill', d => colorScale(d.handedness) as string)
        .attr('opacity', d => {
          if (selectionState.names.length === 0) return 0.7;
          return selectionState.names.includes(d.name) ? 1 : 0.2;
        })
        .style('cursor', 'pointer')
        .on('click', (_event, d) => {
          if (selectionState.names.includes(d.name)) {
            selectByName([], 'OverView');
          } else {
            selectByName([d.name], 'OverView');
          }
        })
        .append('title')
        .text(d => `${d.name}\nHandedness: ${d.handedness}\n${panel.xField}: ${d[panel.xField as keyof typeof d]}\n${panel.yField}: ${d[panel.yField as keyof typeof d]}`);
    });

    // Add summary stats at bottom
    const summaryG = svg.append('g')
      .attr('transform', `translate(${width / 2},${height + 20})`);

    summaryG.append('text')
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .text(`Players: ${stats.count} | Avg Height: ${stats.avgHeight.toFixed(1)}" | Avg Weight: ${(stats.avgHtWtRatio * 72).toFixed(0)} lbs | Total HR: ${stats.totalHR}`);

  }, [filteredData, selectionState, selectByName]);

  if (filteredData.length === 0) {
    return (
      <div className="worksheet overview-chart">
        <h3>OverView</h3>
        <div className="empty-state" role="status" aria-live="polite">
          <p>No data available for the current filters.</p>
          <p className="empty-state-hint">Try adjusting the handedness filter in the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="worksheet overview-chart">
      <h3>OverView</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
};
