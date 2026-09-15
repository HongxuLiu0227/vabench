import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useDashboard } from '../../contexts/DashboardContext';
import type { ParsedAccidentRecord } from '../../types/data';
import { DAY_OF_WEEK_MAP } from '../../types/constants';
import { DataService } from '../../services/dataService';

interface Sheet29ChartProps {
  data: ParsedAccidentRecord[];
  width?: number;
  height?: number;
}

export const Sheet29Chart: React.FC<Sheet29ChartProps> = ({
  data,
  width = 400,
  height = 300
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, highlight, setHighlight } = useDashboard();

  // Get filtered data - Sheet 29 has fixed filters per contract:
  // Light_Conditions = "1" (Daylight) and Time hour = "11" (11 AM)
  const filteredData = React.useMemo(() => {
    let result = DataService.filterData(data, {
      selectedLightConditions: filters.selectedLightConditions,
      selectedSpeedLimits: filters.selectedSpeedLimits,
      selectedWeatherConditions: filters.selectedWeatherConditions,
      selectedRoadSurfaceConditions: filters.selectedRoadSurfaceConditions,
      selectedAccidentSeverities: filters.selectedAccidentSeverities,
      selectedDayOfWeek: filters.selectedDayOfWeek
    });

    // Apply Sheet 29's fixed filters from contract
    // Filter for Light_Conditions = "1" (Daylight)
    result = result.filter(d => d.Light_Conditions === '1');

    // Filter for Time hour = "11" (11 AM)
    result = result.filter(d => {
      const hour = d.Time.split(':')[0];
      return hour === '11';
    });

    return result;
  }, [data, filters]);

  // Aggregate data
  const chartData = React.useMemo(() => {
    return DataService.aggregateSheet29(filteredData);
  }, [filteredData]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 50, bottom: 40, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Sort by day of week (1-7)
    const sortedData = [...chartData].sort((a, b) =>
      parseInt(a.Day_of_Week) - parseInt(b.Day_of_Week)
    );

    // Create scales
    const y = d3.scaleBand()
      .domain(sortedData.map(d => DAY_OF_WEEK_MAP[d.Day_of_Week] || d.Day_of_Week))
      .range([0, chartHeight])
      .padding(0.2);

    const maxX = d3.max(sortedData, d => d.count) || 0;
    const x = d3.scaleLinear()
      .domain([0, maxX * 1.1])
      .range([0, chartWidth]);

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y))
      .style('font-size', '11px');

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .style('font-size', '11px');

    // Draw bars
    g.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => {
        const label = DAY_OF_WEEK_MAP[d.Day_of_Week] || d.Day_of_Week;
        return y(label) || 0;
      })
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', d => x(d.count))
      .attr('fill', '#6baed6')
      .attr('opacity', d => {
        if (highlight.field === 'Day_of_Week' && highlight.value !== d.Day_of_Week) {
          return 0.3;
        }
        return 1;
      })
      .style('cursor', 'pointer')
      .on('mouseover', (_event, d) => {
        setHighlight('Day_of_Week', d.Day_of_Week, 'Sheet 29');
      });

    // Add value labels
    g.selectAll('.label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('x', d => x(d.count) + 5)
      .attr('y', d => {
        const label = DAY_OF_WEEK_MAP[d.Day_of_Week] || d.Day_of_Week;
        return (y(label) || 0) + y.bandwidth() / 2;
      })
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('fill', '#333')
      .text(d => d.count.toLocaleString());

    // Add title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#0b2255')
      .text('Impact of Day of the week on Number of Accidents');

  }, [chartData, width, height, highlight, setHighlight]);

  return (
    <div className="sheet-29-chart">
      <svg ref={svgRef}></svg>
    </div>
  );
};
