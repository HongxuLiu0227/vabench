import { useEffect, useRef, useMemo, useCallback } from 'react';
import { select, scaleBand, scaleLinear, axisLeft, axisBottom } from 'd3';
import { useDashboard } from '../contexts/DashboardContext';
import { aggregateByStartStation } from '../services/dataLoader';

interface TopStationsProps {
  width?: number;
  height?: number;
}

export function TopStations({ width = 400, height = 300 }: TopStationsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filteredData, filterState, setFilterState } = useDashboard();

  // Aggregate and sort data
  const chartData = useMemo(() => {
    const aggregation = aggregateByStartStation(filteredData);
    const sorted = Array.from(aggregation.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([stationName, count]) => ({ stationName, count }));

    return sorted;
  }, [filteredData]);

  // Check if this station is highlighted
  const isHighlighted = useCallback((stationName: string) => {
    return filterState.selectedStation === null || filterState.selectedStation === stationName;
  }, [filterState.selectedStation]);

  const handleBarClick = useCallback((stationName: string) => {
    // Auto-clear behavior: if clicking the same station, clear the filter
    if (filterState.selectedStation === stationName) {
      setFilterState({ selectedStation: null, selectedEndStation: null });
    } else {
      setFilterState({ ...filterState, selectedStation: stationName });
    }
  }, [filterState, setFilterState]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = scaleBand()
      .domain(chartData.map((d) => d.stationName))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = scaleLinear()
      .domain([0, Math.max(...chartData.map((d) => d.count)) * 1.1])
      .range([innerHeight, 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em')
      .style('font-size', '10px');

    // Y axis
    g.append('g').call(axisLeft(yScale));

    // Bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.stationName)!)
      .attr('y', (d) => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => innerHeight - yScale(d.count))
      .attr('fill', (d) => (isHighlighted(d.stationName) ? '#1f77b4' : '#d3d3d3'))
      .attr('opacity', (d) => (isHighlighted(d.stationName) ? 1 : 0.3))
      .style('cursor', 'pointer')
      .on('click', (_event, d) => handleBarClick(d.stationName));

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Count');
  }, [chartData, width, height, isHighlighted, handleBarClick]);

  if (chartData.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>
        Top 10 Stations by Start Station (Count)
      </h3>
      <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid #ddd' }} />
    </div>
  );
}
