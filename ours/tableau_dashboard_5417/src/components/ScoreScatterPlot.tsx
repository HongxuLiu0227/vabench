import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { ScoreData } from '../types';

interface ScoreScatterPlotProps {
  data: ScoreData[];
  width: number;
  height: number;
  title?: string;
  onPointClick?: (game: string) => void;
  selectedGame?: string | null;
}

export const ScoreScatterPlot: React.FC<ScoreScatterPlotProps> = ({
  data,
  width,
  height,
  title,
  onPointClick,
  selectedGame,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (Metascore)
    const x = d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, chartWidth]);

    // Y scale (User Score)
    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([chartHeight, 0]);

    // Color scale for platforms
    const platforms = [...new Set(data.map(d => d.platform))];
    const color = d3
      .scaleOrdinal()
      .domain(platforms)
      .range(d3.schemeTableau10);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(10))
      .style('font-size', '10px');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(10))
      .style('font-size', '10px');

    // Add axis labels
    g.append('text')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 40})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Metascore');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -chartHeight / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('User Score');

    // Add title
    if (title) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(title);
    }

    // Add dots
    g.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => x(d.metascore))
      .attr('cy', d => y(d.user_score))
      .attr('r', 4)
      .attr('fill', d => color(d.platform) as string)
      .attr('fill-opacity', 0.7)
      .attr('class', d =>
        selectedGame && d.game === selectedGame ? 'circle circle-selected' : 'circle'
      )
      .style('cursor', onPointClick ? 'pointer' : 'default')
      .on('click', (_event, d) => {
        if (onPointClick) {
          onPointClick(d.game);
        }
      })
      .on('mouseover', function() {
        d3.select(this)
          .attr('r', 6)
          .attr('fill-opacity', 1);
      })
      .on('mouseout', function(_event, d) {
        d3.select(this)
          .attr('r', 4)
          .attr('fill-opacity', selectedGame && d.game === selectedGame ? 1 : 0.7);
      });

    // Add tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '11px');

    g.selectAll('circle')
      .on('mousemove', function(event, d) {
        const data = d as ScoreData;
        tooltip
          .style('opacity', 1)
          .html(
            `<strong>${data.game}</strong><br/>` +
            `Platform: ${data.platform}<br/>` +
            `Metascore: ${data.metascore}<br/>` +
            `User Score: ${data.user_score}`
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseleave', function() {
        tooltip.style('opacity', 0);
      });

    // Add legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 100}, ${height / 2})`);

    platforms.forEach((platform, i) => {
      const legendRow = legend
        .append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow
        .append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', color(platform) as string)
        .attr('fill-opacity', 0.7);

      legendRow
        .append('text')
        .attr('x', 18)
        .attr('y', 10)
        .style('font-size', '10px')
        .text(platform);
    });

  }, [data, width, height, title, onPointClick, selectedGame]);

  return <svg ref={svgRef}></svg>;
};
