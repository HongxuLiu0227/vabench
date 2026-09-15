/**
 * Breakdown of Where Tourism Demand Comes From - Pie Chart
 * Small multiples pie chart showing demand breakdown by indicator
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { pie, arc } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { select } from 'd3-selection';
import type { LocationGroup, IndicatorType } from '../../types/data';
import { LOCATION_GROUP_ORDER } from '../../types/data';
import { useDashboard } from '../../context/DashboardContext';

interface BreakdownPieChartProps {
  width: number;
  height: number;
}

export function BreakdownPieChart({ width, height }: BreakdownPieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data, selections, setHoveredIndicator } = useDashboard();

  // Prepare pie chart data
  const pieData = useMemo(() => {
    // Filter for selected indicators and location groups (excluding "Other")
    const validIndicators: IndicatorType[] = [
      'Domestic demand',
      'International demand (exports)',
      'Interprovincial demand (exports)',
      'Total demand'
    ];

    const filtered = data.filter(d =>
      validIndicators.includes(d.indicator) &&
      LOCATION_GROUP_ORDER.includes(d.locationGroup as LocationGroup)
    );

    // Aggregate by location group and indicator, then calculate percentages
    const groupIndicatorTotals = new Map<string, number>();
    const groupTotals = new Map<string, number>();

    filtered.forEach(d => {
      const groupKey = d.locationGroup;
      const indicatorKey = `${groupKey}-${d.indicator}`;

      groupIndicatorTotals.set(indicatorKey, (groupIndicatorTotals.get(indicatorKey) || 0) + d.value);
      groupTotals.set(groupKey, (groupTotals.get(groupKey) || 0) + d.value);
    });

    // Convert to pie data structure
    const result: Array<{
      locationGroup: LocationGroup;
      indicator: IndicatorType;
      value: number;
      percent: number;
    }> = [];

    LOCATION_GROUP_ORDER.forEach(group => {
      const total = groupTotals.get(group) || 0;
      if (total > 0) {
        validIndicators.forEach(indicator => {
          const indicatorKey = `${group}-${indicator}`;
          const value = groupIndicatorTotals.get(indicatorKey) || 0;
          if (value > 0) {
            result.push({
              locationGroup: group,
              indicator,
              value,
              percent: (value / total) * 100
            });
          }
        });
      }
    });

    return result;
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || pieData.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const numCharts = LOCATION_GROUP_ORDER.length;
    const chartWidth = width / numCharts;
    const radius = Math.min(chartWidth, height) / 3;

    const colorScale = scaleOrdinal<string>()
      .domain(['Domestic demand', 'International demand (exports)', 'Interprovincial demand (exports)', 'Total demand'])
      .range(['#87d180', '#4e9f50', '#3ca8bc', '#26897e']);

    LOCATION_GROUP_ORDER.forEach((group, i) => {
      const groupData = pieData.filter(d => d.locationGroup === group);

      if (groupData.length === 0) return;

      const cx = chartWidth * i + chartWidth / 2;
      const cy = height / 2;

      const pieGenerator = pie<{ indicator: string; value: number }>()
        .value(d => d.value)
        .sort(null);

      const arcs = pieGenerator(groupData.map(d => ({ indicator: d.indicator, value: d.value })));

      const arcGenerator = arc()
        .innerRadius(0)
        .outerRadius(radius);

      const chartGroup = svg.append('g')
        .attr('transform', `translate(${cx}, ${cy})`);

      chartGroup.selectAll('path')
        .data(arcs)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', d => colorScale(d.data.indicator))
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .attr('opacity', d => {
          if (selections.hoveredIndicator && !d.data.indicator.includes(selections.hoveredIndicator || '')) {
            return 0.3;
          }
          return 1;
        })
        .on('mouseenter', (event, d) => {
          const indicator = groupData.find(g => g.indicator === d.data.indicator)?.indicator;
          if (indicator) {
            setHoveredIndicator(indicator as IndicatorType);
          }
        })
        .on('mouseleave', () => {
          setHoveredIndicator(null);
        });

      // Add labels for large slices
      chartGroup.selectAll('text')
        .data(arcs.filter(d => d.endAngle - d.startAngle > 0.3))
        .enter()
        .append('text')
        .attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .style('font-size', '9px')
        .style('font-family', 'Arial, sans-serif')
        .text(d => {
          const data = groupData.find(g => g.indicator === d.data.indicator);
          return data ? `${Math.round(data.percent)}%` : '';
        });

      // Title
      svg.append('text')
        .attr('x', cx)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-family', 'Arial, sans-serif')
        .style('font-weight', 'bold')
        .text(group);
    });

  }, [pieData, width, height, selections, setHoveredIndicator]);

  return (
    <div>
      <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>
        Breakdown of Where Tourism Demand Comes From -
      </h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid #e0e0e0', backgroundColor: '#f7faf0' }}
      />
    </div>
  );
}
