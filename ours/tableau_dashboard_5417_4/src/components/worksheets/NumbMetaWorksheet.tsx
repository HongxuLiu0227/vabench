import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import type { MetascoreTimeSeries } from '../../types/data';
import { useDashboard } from '../../contexts/DashboardContext';
import './NumbMetaWorksheet.css';

interface NumbMetaWorksheetProps {
  data: MetascoreTimeSeries[];
  width?: number;
  height?: number;
}

export const NumbMetaWorksheet: React.FC<NumbMetaWorksheetProps> = ({
  data,
  width = 800,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { selection, setSelection, clearSelection, highlights, autoClear } = useDashboard();

  const worksheetName = 'numb_meta';
  const highlightState = highlights.get(worksheetName);

  const margin = useMemo(() => ({ top: 40, right: 40, bottom: 60, left: 70 }), []);
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Parse dates and create scales
  const { xScale, yScale } = useMemo(() => {
    const parseDate = d3.timeParse('%Y-%m');
    const dates = data.map((d) => parseDate(d.month)!).filter((d) => d != null);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dates) as [Date, Date])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.avg_metascore) || 0,
        d3.max(data, (d) => d.avg_metascore) || 100,
      ])
      .range([chartHeight, 0])
      .nice();

    return { xScale, yScale };
  }, [data, chartWidth, chartHeight]);

  // Create line generator
  const lineGenerator = useMemo(() => {
    const parseDate = d3.timeParse('%Y-%m');
    return d3
      .line<MetascoreTimeSeries>()
      .x((d) => xScale(parseDate(d.month)!))
      .y((d) => yScale(d.avg_metascore))
      .curve(d3.curveMonotoneX);
  }, [xScale, yScale]);

  // Handle point click for interaction
  const handlePointClick = useCallback(() => {
    if (autoClear && selection.game) {
      clearSelection();
    } else {
      // For line chart, we can select by month
      // In a real implementation, this would filter by release_date
      setSelection({
        clear: false,
      });
    }
  }, [autoClear, selection.game, clearSelection, setSelection]);

  // Render chart
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke-opacity', 0.1);

    // Add X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0))
      .selectAll('text')
      .style('text-anchor', 'middle');

    // Add Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(10));

    // Add axis titles
    g.append('text')
      .attr('class', 'axis-title y-axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -chartHeight / 2)
      .text('Average Metascore');

    g.append('text')
      .attr('class', 'axis-title x-axis-title')
      .attr('y', chartHeight + margin.bottom - 10)
      .attr('x', chartWidth / 2)
      .text('Month of release');

    // Add the line
    const parseDate = d3.timeParse('%Y-%m');
    const path = g
      .append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', lineGenerator);

    // Add total length for animation
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Add dots
    const dots = g
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(parseDate(d.month)!))
      .attr('cy', (d) => yScale(d.avg_metascore))
      .attr('r', 4)
      .style('cursor', 'pointer')
      .on('click', () => {
        handlePointClick();
      })
      .on('mouseover', function (_event, d) {
        d3.select(this).attr('r', 6);

        // Add tooltip
        const tooltip = g
          .append('g')
          .attr('class', 'tooltip')
          .attr(
            'transform',
            `translate(${xScale(parseDate(d.month)!)},${yScale(d.avg_metascore) - 10})`
          );

        const text =
          `${d.month}\nAvg Metascore: ${d.avg_metascore.toFixed(1)}\nGames: ${d.count}`;

        const lines = text.split('\n');
        const textElement = tooltip
          .append('text')
          .attr('y', -10)
          .style('font-size', '12px')
          .style('font-weight', '500');

        lines.forEach((line, i) => {
          textElement
            .append('tspan')
            .attr('x', 0)
            .attr('dy', i === 0 ? 0 : '1.2em')
            .text(line);
        });

        const bbox = (textElement.node() as SVGTextElement)?.getBBox();
        if (bbox) {
          tooltip
            .insert('rect', 'text')
            .attr('x', bbox.x - 6)
            .attr('y', bbox.y - 4)
            .attr('width', bbox.width + 12)
            .attr('height', bbox.height + 8)
            .attr('rx', 4)
            .attr('fill', 'rgba(0, 0, 0, 0.8)');
          textElement.raise();
        }
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 4);
        g.selectAll('.tooltip').remove();
      });

    // Highlight selected points
    if (highlightState && highlightState.selections.size > 0) {
      dots
        .filter((d) => highlightState.selections.has(d.month))
        .attr('r', 8)
        .attr('stroke', '#ff6b35')
        .attr('stroke-width', 2);
    }
  }, [data, xScale, yScale, lineGenerator, chartWidth, chartHeight, margin, highlightState, handlePointClick, width]);

  return (
    <div className="numb-meta-worksheet" style={{ width, height }}>
      <div className="worksheet-title" style={{ fontWeight: 'bold', textAlign: 'center' }}>
        Number of players
      </div>
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
};
