import { useEffect, useRef, useState } from 'react';
import { scaleLinear, scaleTime, scaleBand } from 'd3-scale';
import type { ScaleBand, ScaleTime } from 'd3-scale';
import { select } from 'd3-selection';
import type { SalesByYear, SalesByMonth } from '../types';

interface LineChartProps {
  data: SalesByYear[] | SalesByMonth[];
  title?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  dataKey: 'year' | 'month';
}

const TABLEAU_COLORS = {
  blue: '#4E79A7',
  orange: '#F28E2B',
};

interface DataPoint {
  x: number | Date;
  y: number;
  label: string;
}

export function LineChart({
  data,
  title = 'Total Sales Each Year',
  width = 400,
  height = 400,
  margin = { top: 40, right: 30, bottom: 50, left: 70 },
  dataKey,
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Transform data to common format
    const dataPoints: DataPoint[] = data.map((d) => {
      if (dataKey === 'year') {
        const yearData = d as SalesByYear;
        return {
          x: yearData.year,
          y: yearData.sales,
          label: yearData.year.toString(),
        };
      } else {
        const monthData = d as SalesByMonth;
        return {
          x: monthData.month,
          y: monthData.sales,
          label: monthData.month.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        };
      }
    });

    // Create scales
    let xScale: ScaleBand<string> | ScaleTime<number, number>;
    let isBandScale = false;

    if (dataKey === 'year') {
      xScale = scaleBand()
        .domain(dataPoints.map((d) => d.label))
        .range([0, innerWidth])
        .padding(0.2);
      isBandScale = true;
    } else {
      xScale = scaleTime()
        .domain([
          new Date(Math.min(...dataPoints.map((d) => (d.x as Date).getTime()))),
          new Date(Math.max(...dataPoints.map((d) => (d.x as Date).getTime()))),
        ])
        .range([0, innerWidth]);
    }

    const yScale = scaleLinear()
      .domain([0, Math.max(...dataPoints.map((d) => d.y)) * 1.1])
      .range([innerHeight, 0])
      .nice();

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title
    if (title) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'system-ui, -apple-system, sans-serif')
        .text(title);
    }

    // Add grid lines
    g.selectAll('.grid-line')
      .data(yScale.ticks())
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d: number) => yScale(d))
      .attr('y2', (d: number) => yScale(d))
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '3,3');

    // Generate path data manually
    const getX = (d: DataPoint): number => {
      if (isBandScale) {
        const bandScale = xScale as ScaleBand<string>;
        return (bandScale(d.label) || 0) + bandScale.bandwidth() / 2;
      } else {
        return (xScale as ScaleTime<number, number>)(d.x as Date);
      }
    };

    const pathD = dataPoints
      .map((d, i) => {
        const x = getX(d);
        const y = yScale(d.y);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    // Add line path
    g.append('path')
      .attr('d', pathD)
      .attr('fill', 'none')
      .attr('stroke', TABLEAU_COLORS.blue)
      .attr('stroke-width', 2.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round');

    // Add points
    g.selectAll('.dot')
      .data(dataPoints)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d: DataPoint) => getX(d))
      .attr('cy', (d: DataPoint) => yScale(d.y))
      .attr('r', 4)
      .attr('fill', TABLEAU_COLORS.blue)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function (event: MouseEvent, d: DataPoint) {
        select(this as SVGCircleElement).attr('r', 6).attr('fill', TABLEAU_COLORS.orange);
        const rect = (event.target as SVGCircleElement).getBoundingClientRect();
        setTooltip({
          x: rect.left,
          y: rect.top,
          content: `${d.label}: $${d.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        });
      })
      // eslint-disable-next-line react-hooks/unsupported-syntax
      .on('mouseout', function (this: SVGCircleElement) {
        select(this).attr('r', 4).attr('fill', TABLEAU_COLORS.blue);
        setTooltip(null);
      });

    // Add y-axis labels (format as currency)
    g.selectAll('.y-label')
      .data(yScale.ticks())
      .enter()
      .append('text')
      .attr('x', -10)
      .attr('y', (d: number) => yScale(d))
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', '11px')
      .attr('font-family', 'system-ui, -apple-system, sans-serif')
      .text((d: number) => `$${(d / 1000).toFixed(0)}k`);

    // Add x-axis labels
    if (dataKey === 'year') {
      g.selectAll('.x-label')
        .data(dataPoints)
        .enter()
        .append('text')
        .attr('x', (d: DataPoint) => getX(d))
        .attr('y', innerHeight + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-family', 'system-ui, -apple-system, sans-serif')
        .text((d: DataPoint) => d.label);
    } else {
      // For time series, add a few date labels
      const timeScale = xScale as ScaleTime<number, number>;
      const dateTicks = timeScale.ticks(6);
      g.selectAll('.x-label')
        .data(dateTicks)
        .enter()
        .append('text')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr('x', (d: any) => timeScale(d))
        .attr('y', innerHeight + 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'system-ui, -apple-system, sans-serif')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .text((d: any) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }));
    }
  }, [data, width, height, margin, title, dataKey]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
