import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { DiagnosisData } from '../types/dashboard';

interface VerticalRankedBarProps {
  data: DiagnosisData[];
  selectedDiagnosis: string | null;
  highlightedDiagnosis: string | null;
  width: number;
  height: number;
}

const VerticalRankedBar: React.FC<VerticalRankedBarProps> = ({
  data,
  selectedDiagnosis,
  highlightedDiagnosis,
  width,
  height,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    data: DiagnosisData;
  } | null>(null);

  // Filter data if a diagnosis is selected
  const displayData = React.useMemo(() => {
    const filtered = selectedDiagnosis
      ? data.filter((d) => d.diagnosis === selectedDiagnosis)
      : data;

    // Sort descending by total discharges
    return filtered.sort((a, b) => b.totalDischarges - a.totalDischarges);
  }, [data, selectedDiagnosis]);

  useEffect(() => {
    if (!svgRef.current || displayData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Margins for axis labels
    const margin = { top: 20, right: 20, bottom: 80, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(displayData.map((d) => d.diagnosis))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(displayData, (d) => d.totalDischarges) || 0])
      .range([chartHeight, 0])
      .nice();

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create bars
    const bars = g
      .selectAll<SVGRectElement, DiagnosisData>('rect')
      .data(displayData)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.diagnosis) || 0)
      .attr('y', chartHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', (d) => {
        // Highlight if this diagnosis is selected or hovered
        if (selectedDiagnosis && d.diagnosis === selectedDiagnosis) {
          return '#ff6b6b';
        }
        if (highlightedDiagnosis && d.diagnosis === highlightedDiagnosis) {
          return '#ffd93d';
        }
        return '#4dabf7';
      })
      .attr('opacity', (d) => {
        // Dim other bars if one is selected/hovered
        if ((selectedDiagnosis || highlightedDiagnosis) &&
            d.diagnosis !== selectedDiagnosis &&
            d.diagnosis !== highlightedDiagnosis) {
          return 0.3;
        }
        return 0.8;
      })
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setTooltip({
          x: event.pageX + 10,
          y: event.pageY + 10,
          data: d,
        });
      })
      .on('mouseout', () => {
        setTooltip(null);
      });

    // Animate bars
    bars
      .transition()
      .duration(800)
      .attr('y', (d) => yScale(d.totalDischarges))
      .attr('height', (d) => chartHeight - yScale(d.totalDischarges));

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '10px')
      .style('font-weight', 'bold');

    // Y-axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px');

    // Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 10)
      .attr('x', -chartHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Total Discharges');

  }, [displayData, width, height, selectedDiagnosis, highlightedDiagnosis]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg ref={svgRef} width={width} height={height} />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
            zIndex: 1000,
            fontSize: '12px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {tooltip.data.diagnosis}
          </div>
          <div>
            Total Discharges: {tooltip.data.totalDischarges.toLocaleString()}
          </div>
          <div>Number of Records: {tooltip.data.count}</div>
          <div>
            Avg Covered Charges: $
            {tooltip.data.avgCoveredCharges.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div>
            Avg Medicare Payments: $
            {tooltip.data.avgMedicarePayments.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerticalRankedBar;
