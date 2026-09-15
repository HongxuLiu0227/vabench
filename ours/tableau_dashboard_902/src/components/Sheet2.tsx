import { useMemo, useRef, useEffect } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { max } from 'd3-array';
import * as d3 from 'd3';
import type { FunnelData } from '../types/data';
import { CONTROL_COLORS } from '../types/data';

interface Sheet2Props {
  data: FunnelData[];
}

/**
 * Sheet 2: "Воронка" (Funnel)
 * Horizontal bar chart showing events by control group
 * - Rows: event
 * - Split by control (Target vs Control) - side by side bars
 * - Length/Value: users_count
 * - Color: control
 */
export function Sheet2({ data }: Sheet2Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate dimensions based on zone aspect ratio (1.0078 ~ 1:1)
  const width = 600;
  const height = 600;

  // Margins for axis labels
  const margin = useMemo(() => ({ top: 20, right: 60, bottom: 40, left: 100 }), []);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Get unique events and sort them by total users
  const uniqueEvents = useMemo(() => {
    const eventTotals = new Map<string, number>();
    data.forEach((d) => {
      const current = eventTotals.get(d.event) || 0;
      eventTotals.set(d.event, current + d.users_count);
    });
    return Array.from(eventTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map((e) => e[0]);
  }, [data]);

  // Create x scale (value)
  const xScale = useMemo(() => {
    const maxUsers = max(data, (d: FunnelData) => d.users_count) || 1;
    return scaleLinear()
      .domain([0, maxUsers * 1.1]) // Add 10% padding
      .range([0, innerWidth]);
  }, [data, innerWidth]);

  // Create y scale (categories)
  const yScale = useMemo(() => {
    return scaleBand()
      .domain(uniqueEvents)
      .range([0, innerHeight])
      .padding(0.3);
  }, [uniqueEvents, innerHeight]);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Add x axis
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat((d) => d.toString());
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('font-size', '11px');

    // Add y axis
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
      // Truncate long event names if needed
      const str = d as string;
      return str.length > 15 ? str.substring(0, 12) + '...' : str;
    });
    g.append('g')
      .call(yAxis)
      .attr('font-size', '11px');

    // Group data by event
    const groupedData = new Map<string, FunnelData[]>();
    data.forEach((d) => {
      if (!groupedData.has(d.event)) {
        groupedData.set(d.event, []);
      }
      groupedData.get(d.event)!.push(d);
    });

    // Draw bars for each event
    uniqueEvents.forEach((event) => {
      const eventData = groupedData.get(event) || [];
      const y = yScale(event)!;
      const barHeight = yScale.bandwidth() / 2;

      // Draw bar for each control group (0 = Target, 1 = Control)
      eventData.forEach((d) => {
        const barY = y + (d.control === 0 ? 0 : barHeight);
        const barWidth = xScale(d.users_count);
        const color = CONTROL_COLORS[d.control];

        // Add bar
        g.append('rect')
          .attr('x', 0)
          .attr('y', barY)
          .attr('width', barWidth)
          .attr('height', barHeight - 2)
          .attr('fill', color)
          .attr('opacity', 0.85);

        // Add value label at end of bar
        g.append('text')
          .attr('x', barWidth + 5)
          .attr('y', barY + (barHeight - 2) / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'start')
          .attr('font-size', '10px')
          .attr('fill', '#333')
          .text(d.users_count.toLocaleString());
      });
    });
  }, [data, uniqueEvents, xScale, yScale, innerWidth, innerHeight, margin]);

  if (data.length === 0) {
    return (
      <div className="worksheet-container" style={{ width, height }}>
        <h3 className="worksheet-title">Воронка</h3>
        <div className="worksheet-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: height - 40 }}>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="worksheet-container" style={{ width, height }}>
      <h3 className="worksheet-title">Воронка</h3>
      <svg
        ref={svgRef}
        width={width}
        height={height - 40}
        style={{ overflow: 'visible' }}
      />
      <style>{`
        .worksheet-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 8px;
          box-sizing: border-box;
        }
        .worksheet-title {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
      `}</style>
    </div>
  );
}
