import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface PieChartProps {
  data: Array<{ category: string; value: number }>;
  width: number;
  height: number;
  colors?: string[];
  showLabels?: boolean;
}

const DEFAULT_COLORS = [
  '#4e79a7', '#59a14f', '#76b7b2', '#9c755f', '#b07aa1',
  '#e15759', '#edc948', '#f28e2b', '#ff9da7', '#499894',
  '#86bcb6', '#8cd17d', '#9d7660', '#a0cbe8', '#b6992d',
  '#bab0ac', '#d37295', '#d4a6c8', '#d7b5a6', '#f1ce63',
  '#fabfd2', '#ff9d9a', '#ffbe7d'
];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  width,
  height,
  colors = DEFAULT_COLORS,
  showLabels = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(width, height) / 2;
    const colorScale = d3.scaleOrdinal()
      .domain(data.map((d) => d.category))
      .range(colors);

    const pie = d3.pie<{ category: string; value: number }>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<{ category: string; value: number }>>()
      .innerRadius(0)
      .outerRadius(radius - 10);

    const arcHover = d3.arc<d3.PieArcDatum<{ category: string; value: number }>>()
      .innerRadius(0)
      .outerRadius(radius);

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const total = d3.sum(data, (d) => d.value);

    const arcs = g
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => (colorScale(d.data.category) as string) || '#ccc')
      .style('cursor', 'pointer')
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          // @ts-expect-error - D3 transition typing is complex for arc generators
          .attr('d', arcHover);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          // @ts-expect-error - D3 transition typing is complex for arc generators
          .attr('d', arc);
      });

    if (showLabels) {
      arcs
        .append('text')
        .attr('transform', (d) => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .text((d) => {
          const percentage = ((d.data.value / total) * 100).toFixed(1);
          if (parseFloat(percentage) < 5) return '';
          return `${percentage}%`;
        })
        .style('fill', 'white')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('text-shadow', '0 0 3px rgba(0,0,0,0.8)');
    }

    // Legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 120}, 20)`);

    data.forEach((d, i) => {
      const legendRow = legend
        .append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow
        .append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', (colorScale(d.category) as string) || '#ccc');

      legendRow
        .append('text')
        .attr('x', 20)
        .attr('y', 12)
        .text(d.category)
        .style('font-size', '11px');
    });
  }, [data, width, height, colors, showLabels]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ overflow: 'visible' }}
    />
  );
};
