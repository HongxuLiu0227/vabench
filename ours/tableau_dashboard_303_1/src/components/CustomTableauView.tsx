import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { AggregatedData, HighlightMap } from '../types/data';

interface CustomTableauViewProps {
  data: AggregatedData[];
  title: string;
  highlights: HighlightMap;
  onHighlight: (field: string, value: string | number) => void;
  width: number;
  height: number;
}

const SEVERITY_COLORS: Record<number, string> = {
  1: '#d62728', // Fatal - red
  2: '#ff7f0e', // Serious - orange
  3: '#1f77b4', // Slight - blue
};

export const CustomTableauView: React.FC<CustomTableauViewProps> = ({
  data,
  title,
  highlights,
  onHighlight,
  width,
  height,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = useMemo(() => ({ top: 40, right: 20, bottom: 60, left: 70 }), []);

  // Aggregate data by quarter-year and severity
  const { chartData, quarterYears, severities, maxValue } = useMemo(() => {
    const grouped = new Map<string, Map<number, number>>();

    data.forEach(({ category, series, value }) => {
      // category is quarter-year like "2014-Q1"
      const key = category;

      if (!grouped.has(key)) {
        grouped.set(key, new Map());
      }
      const severityMap = grouped.get(key)!;
      const severity = parseInt(series, 10);
      severityMap.set(severity, (severityMap.get(severity) || 0) + value);
    });

    const allSeverities = new Set<number>();
    const sortedQuarterYears = Array.from(grouped.keys()).sort();

    const chartData: Array<{
      quarterYear: string;
      severity: number;
      value: number;
    }> = [];

    grouped.forEach((severityMap, quarterYear) => {
      severityMap.forEach((value, severity) => {
        allSeverities.add(severity);
        chartData.push({ quarterYear, severity, value });
      });
    });

    const maxValue = Math.max(...chartData.map((d) => d.value), 1);

    return {
      chartData,
      quarterYears: sortedQuarterYears,
      severities: Array.from(allSeverities).sort((a, b) => a - b),
      maxValue,
    };
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // x-scale for quarters
    const x = d3.scaleBand().range([0, innerWidth]).padding(0.1);
    x.domain(quarterYears);

    // y-scale for values
    const y = d3.scaleLinear().range([innerHeight, 0]).nice().domain([0, maxValue]);

    // Stack the data
    const stack = d3.stack()
      .keys(severities.map(String))
      .offset(d3.stackOffsetDiverging);

    const stackedData = stack(
      quarterYears.map((qy) => {
        const obj: { [key: string]: number } = {};
        severities.forEach((s) => {
          const found = chartData.find((d) => d.quarterYear === qy && d.severity === s);
          obj[s.toString()] = found ? found.value : 0;
        });
        return obj;
      })
    );

    // Area generator
    const area = d3.area<d3.SeriesPoint<{ [key: string]: number }>>()
      .x((_d, i) => {
        // Use the index to get the quarter year
        const quarterYear = quarterYears[i % quarterYears.length];
        return (x(quarterYear) || 0) + x.bandwidth() / 2;
      })
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))
      .curve(d3.curveMonotoneX);

    // Draw areas
    severities.forEach((severity, i) => {
      const layerData = stackedData[i];
      if (!layerData) return;

      const severityHighlights = highlights['none:Accident_Severity:nk'];
      const isHighlighted = severityHighlights?.has(severity) || false;
      const hasHighlights = Object.keys(highlights).length > 0;
      const isDimmed = hasHighlights && !isHighlighted;

      g.append('path')
        .datum(layerData)
        .attr('fill', SEVERITY_COLORS[severity] || '#999')
        .attr('opacity', isDimmed ? 0.3 : 0.8)
        .attr('stroke', isHighlighted ? '#000' : 'none')
        .attr('stroke-width', isHighlighted ? 2 : 0)
        .attr('d', area)
        .style('cursor', 'pointer')
        .on('click', (event) => {
          event.stopPropagation();
          onHighlight('none:Accident_Severity:nk', severity);
        })
        .on('mouseover', function () {
          d3.select(this).attr('opacity', isDimmed ? 0.5 : 1);
        })
        .on('mouseout', function () {
          d3.select(this).attr('opacity', isDimmed ? 0.3 : 0.8);
        });
    });

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat((d) => {
        const [year, quarter] = d.split('-');
        return `${quarter} ${year}`;
      }))
      .selectAll('text')
      .style('font-size', '11px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('font-size', '11px');

    // Add x-axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 50)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Quarter and Year');

    // Add y-axis label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -55)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Number of Accidents');

  }, [chartData, quarterYears, severities, maxValue, width, height, margin, highlights, onHighlight]);

  return (
    <div style={{ width, height }}>
      <h3 style={{ color: '#0b2255', fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
        {title}
      </h3>
      <svg ref={svgRef} width={width} height={height} style={{ overflow: 'visible' }} />
    </div>
  );
};
