import { useEffect, useRef, useMemo } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import type { StationData } from '../types';

interface HorizontalBarChartProps {
  data: StationData[];
  title: string;
  xAxisTitle?: string;
  width: number;
  height: number;
  onBarClick?: (stationName: string) => void;
  highlightedStation?: string | null;
  isFiltered?: boolean;
  showLegend?: boolean;
  legendData?: { value: number; color: string }[];
}

export function HorizontalBarChart({
  data,
  title,
  xAxisTitle,
  width,
  height,
  onBarClick,
  highlightedStation,
  isFiltered = false,
  showLegend = false,
  legendData,
}: HorizontalBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Margins for axis labels
  const margin = useMemo(() => ({ top: 40, right: 20, bottom: xAxisTitle ? 50 : 40, left: 150 }), [xAxisTitle]);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = useMemo(() => {
    const maxValue = Math.max(...data.map(d => d.count), 1);
    return scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([0, innerWidth])
      .nice();
  }, [data, innerWidth]);

  const yScale = useMemo(() => {
    return scaleBand()
      .domain(data.map(d => d.stationName))
      .range([0, innerHeight])
      .padding(0.2);
  }, [data, innerHeight]);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Color function
    const getColor = (stationName: string) => {
      if (highlightedStation && stationName !== highlightedStation) {
        return '#d0d0d0'; // Dimmed color for non-highlighted
      }
      return '#F28E2B'; // Tableau orange
    };

    // X axis
    const xAxis = axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => `${Number(d)}`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#666')
      .attr('font-size', '12px');

    // X axis title
    if (xAxisTitle) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 40)
        .attr('text-anchor', 'middle')
        .attr('fill', '#333')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .text(xAxisTitle);
    }

    // Y axis
    const yAxis = axisLeft(yScale)
      .tickFormat(d => {
        const str = String(d);
        if (str.length > 25) {
          return str.substring(0, 22) + '...';
        }
        return str;
      });

    g.append('g')
      .call(yAxis)
      .attr('color', '#666')
      .attr('font-size', '12px');

    // Bars
    const t = transition().duration(300);

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => yScale(d.stationName) || 0)
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('width', 0)
      .attr('fill', d => getColor(d.stationName))
      .attr('rx', 2)
      .on('click', (_event, d) => {
        if (onBarClick) {
          onBarClick(d.stationName);
        }
      })
      .on('mouseover', function() {
        select(this)
          .transition().duration(100)
          .attr('opacity', 0.8);
      })
      .on('mouseout', function() {
        select(this)
          .transition().duration(100)
          .attr('opacity', 1);
      })
      .transition(t)
      .attr('width', d => xScale(d.count));

    // Bar labels (count at end of bar)
    g.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('y', d => (yScale(d.stationName) || 0) + yScale.bandwidth() / 2)
      .attr('x', d => xScale(d.count) + 5)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .attr('fill', '#333')
      .attr('font-size', '11px')
      .text(d => d.count.toLocaleString())
      .style('opacity', 0)
      .transition(t)
      .style('opacity', 1);

    // Tooltip group
    const tooltip = g.append('g')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    tooltip.append('rect')
      .attr('class', 'tooltip-bg')
      .attr('fill', 'rgba(0, 0, 0, 0.8)')
      .attr('rx', 4);

    tooltip.append('text')
      .attr('class', 'tooltip-text')
      .attr('fill', 'white')
      .attr('font-size', '12px');

    // Show tooltip on bar hover
    g.selectAll('.bar')
      .on('mouseenter', function(_event, d) {
        const stationData = d as StationData;
        const text = `${stationData.stationName}: ${stationData.count.toLocaleString()} trips`;
        tooltip.select('.tooltip-text').text(text);

        const textWidth = text.length * 7;
        tooltip.select('.tooltip-bg')
          .attr('width', textWidth + 20)
          .attr('height', 24);

        const [x, y] = [xScale(stationData.count) + 10, (yScale(stationData.stationName) || 0)];
        tooltip.attr('transform', `translate(${x}, ${y})`)
          .style('opacity', 1);
      })
      .on('mouseleave', function() {
        tooltip.style('opacity', 0);
      });

  }, [data, xScale, yScale, innerWidth, innerHeight, margin, onBarClick, highlightedStation, xAxisTitle]);

  return (
    <div className="chart-container">
      <h3 className="chart-title" style={{ textAlign: 'center', marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
        {title}
      </h3>
      {isFiltered && (
        <div style={{ textAlign: 'center', marginBottom: '5px', fontSize: '12px', color: '#666' }}>
          (Filtered)
        </div>
      )}
      <svg ref={svgRef} width={width} height={height}>
        {/* Legend */}
        {showLegend && legendData && legendData.length > 0 && (
          <g transform={`translate(${width - 100}, 10)`}>
            {legendData.map((item, i) => (
              <g key={i} transform={`translate(0, ${i * 20})`}>
                <rect width={12} height={12} fill={item.color} rx={2} />
                <text x={18} y={10} fontSize="11" fill="#333">{item.value}</text>
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
