/**
 * Summary Stats Chart - Horizontal Ranked Bar Chart
 * Shows facilities grouped by upload status category
 *
 * Chart Type: horizontal_ranked_bar
 * Y-Axis: Upload Status Category
 * X-Axis: Count of facilities
 * Interaction: Click to filter the table view
 */

import { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { SummaryStatsData, UploadStatusCategory } from '../types';

interface SummaryStatsChartProps {
  data: SummaryStatsData[];
  onCategoryClick?: (category: UploadStatusCategory) => void;
  selectedCategories: UploadStatusCategory[];
  width?: number;
  height?: number;
}

// Color encoding based on performance buckets
// From the requirements: >= 67% green, 34-66% orange, < 34% red
function getBarColor(percentage: number): string {
  if (percentage >= 67) return '#4caf50';
  if (percentage >= 34) return '#ff9800';
  return '#f44336';
}

export const SummaryStatsChart: React.FC<SummaryStatsChartProps> = ({
  data,
  onCategoryClick,
  selectedCategories,
  width = 400,
  height = 300,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = { top: 20, right: 30, bottom: 40, left: 20 };

  // Calculate dimensions
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Prepare data with categories in the correct order from the contract
  const chartData = useMemo(() => {
    const categoryOrder: UploadStatusCategory[] = [
      'CT & PKVs Uploaded',
      'Only CT Uploaded; No PKVs',
      'Not Uploaded this month',
      'Never Uploaded to DWH',
    ];

    return categoryOrder
      .map((cat) => data.find((d) => d.category === cat))
      .filter((d): d is SummaryStatsData => d !== undefined)
      .sort((a, b) => b.count - a.count); // Sort descending by count
  }, [data]);

  // Create scales
  const xScale = useMemo(() => {
    const maxCount = Math.max(...chartData.map((d) => d.count), 1);
    return d3.scaleLinear().domain([0, maxCount * 1.1]).range([0, innerWidth]);
  }, [chartData, innerWidth]);

  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(chartData.map((d) => d.category))
      .range([0, innerHeight])
      .padding(0.3);
  }, [chartData, innerHeight]);

  // Render chart
  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X-axis
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format('d'));
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // X-axis label
    g.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Number of Facilities');

    // Bars
    const bars = g.selectAll('.bar').data(chartData).enter().append('g').attr('class', 'bar');

    bars
      .append('rect')
      .attr('y', (d: SummaryStatsData) => yScale(d.category) || 0)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', (d: SummaryStatsData) => xScale(d.count))
      .attr('fill', (d: SummaryStatsData) => getBarColor(d.percentage))
      .attr('rx', 4)
      .attr('class', 'cursor-pointer')
      .style('cursor', 'pointer')
      .style('opacity', (d: SummaryStatsData) =>
        selectedCategories.length === 0 || selectedCategories.includes(d.category)
          ? 1
          : 0.3
      )
      .on('click', (_event: MouseEvent, d: SummaryStatsData) => {
        if (onCategoryClick) {
          onCategoryClick(d.category);
        }
      })
      .on('mouseover', function() {
        d3.select(this as d3.BaseType).style('opacity', 0.8);
      })
      .on('mouseout', function(_event, d: SummaryStatsData) {
        d3.select(this as d3.BaseType).style('opacity',
          selectedCategories.length === 0 || selectedCategories.includes(d.category)
            ? 1
            : 0.3
        );
      });

    // Bar labels (count)
    bars
      .append('text')
      .attr('y', (d: SummaryStatsData) => (yScale(d.category) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('x', (d: SummaryStatsData) => xScale(d.count) + 5)
      .attr('text-anchor', 'start')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text((d: SummaryStatsData) => d.count.toString());

    // Bar labels (category)
    bars
      .append('text')
      .attr('y', (d: SummaryStatsData) => (yScale(d.category) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('x', -5)
      .attr('text-anchor', 'end')
      .style('font-size', '11px')
      .style('fill', '#333')
      .text((d: SummaryStatsData) => d.category);

    // Tooltip placeholder (could be enhanced with a proper tooltip)
    bars.append('title').text(
      (d: SummaryStatsData) => `${d.category}: ${d.count} facilities (${d.percentage.toFixed(1)}%)`
    );
  }, [chartData, xScale, yScale, innerWidth, innerHeight, onCategoryClick, selectedCategories, margin.left, margin.top]);

  if (chartData.length === 0) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center text-gray-500"
      >
        No data available
      </div>
    );
  }

  return (
    <div className="summary-stats-chart">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      />
    </div>
  );
};

export default SummaryStatsChart;
