import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { PieChartData } from '../../types';
import './PieChart.css';

interface PieChartProps {
  data: PieChartData[];
  title: string;
  width: number;
  height: number;
  onSliceClick?: (label: string) => void;
  highlightedLabels?: Set<string>;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  width,
  height,
  onSliceClick,
  highlightedLabels,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(width, height) / 2 - 10;
    const innerRadius = radius * 0.4;

    const pie = d3
      .pie<PieChartData>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<PieChartData>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const arcs = pie(data);

    g.selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('opacity', (d) =>
        highlightedLabels && highlightedLabels.size > 0
          ? highlightedLabels.has(d.data.label)
            ? 1
            : 0.3
          : 1
      )
      .on('mouseover', function() {
        d3.select(this).style('opacity', 0.8);
      })
      .on('mouseout', function() {
        const d = d3.select(this).datum() as d3.PieArcDatum<PieChartData>;
        const opacity = highlightedLabels && highlightedLabels.size > 0
          ? (highlightedLabels.has(d.data.label) ? 1 : 0.3)
          : 1;
        d3.select(this).style('opacity', opacity);
      })
      .on('click', (_event, d) => {
        if (onSliceClick) {
          onSliceClick(d.data.label);
        }
      });

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(title);
  }, [data, width, height, title, onSliceClick, highlightedLabels]);

  return (
    <div className="pie-chart-container">
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
};
