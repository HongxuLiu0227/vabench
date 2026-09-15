import { useEffect, useRef, useState } from 'react';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import type { DiagnosisData, TooltipData } from '../types';
import { useFilter } from '../contexts/FilterContext';

interface BarChartProps {
  data: DiagnosisData[];
  width: number;
  height: number;
}

/**
 * BarChart component - "G: Total Discharges vs Diagnosis"
 * Renders a vertical ranked bar chart where:
 * - X-axis: Diagnosis (categorical)
 * - Y-axis: Total Discharges (quantitative)
 * - Bars are sorted in descending order by Total Discharges
 *
 * Interactions:
 * - Displays filtered data based on selection from bubble chart
 * - Hover shows detailed tooltip
 * - Highlighting when a diagnosis is selected
 */
export function BarChart({ data, width, height }: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const { selectedDiagnosis } = useFilter();

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    // Sort data by Total Discharges (descending)
    const sortedData = [...data].sort((a, b) => b.totalDischarges - a.totalDischarges);

    // Margins for axes
    const margin = { top: 20, right: 20, bottom: 80, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // X scale (band scale for categories)
    const xScale = scaleBand()
      .domain(sortedData.map((d) => d.diagnosis))
      .range([0, chartWidth])
      .padding(0.2);

    // Y scale (linear for quantitative values)
    const yScale = scaleLinear()
      .domain([0, Math.max(...sortedData.map((d) => d.totalDischarges))])
      .range([chartHeight, 0])
      .nice();

    // Create main group with margins
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw Y axis
    const yAxis = axisLeft(yScale).ticks(10);
    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-family', 'sans-serif');

    // Draw X axis
    const xAxis = axisBottom(xScale);
    const xAxisGroup = g
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis);

    // Style X axis labels
    xAxisGroup
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-family', 'sans-serif')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.3em')
      .attr('transform', 'rotate(-45)');

    // Draw bars
    g.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.diagnosis)!)
      .attr('y', (d) => yScale(d.totalDischarges))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => chartHeight - yScale(d.totalDischarges))
      .attr('fill', (d) => {
        // Highlight selected bar
        if (selectedDiagnosis && d.diagnosis === selectedDiagnosis) {
          return '#1f77b4';
        }
        // Dim unselected bars
        if (selectedDiagnosis && d.diagnosis !== selectedDiagnosis) {
          return '#d3d3d3';
        }
        return '#4c78a8';
      })
      .attr('stroke', (d) => {
        if (selectedDiagnosis && d.diagnosis === selectedDiagnosis) {
          return '#000';
        }
        return 'none';
      })
      .attr('stroke-width', (d) => {
        if (selectedDiagnosis && d.diagnosis === selectedDiagnosis) {
          return 2;
        }
        return 0;
      })
      .style('cursor', 'pointer')
      .on('mouseover', (event: MouseEvent, d: DiagnosisData) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPosition({
            x: event.clientX - rect.left + 10,
            y: event.clientY - rect.top + 10,
          });
        }
        setTooltip({
          diagnosis: d.diagnosis,
          numberOfRecords: d.numberOfRecords,
          totalDischarges: d.totalDischarges,
          averageCoveredCharges: d.averageCoveredCharges,
          averageMedicarePayments: d.averageMedicarePayments,
        });
      })
      .on('mouseout', () => {
        setTooltip(null);
        setTooltipPosition(null);
      });

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -chartHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-family', 'sans-serif')
      .text('Total Discharges');
  }, [data, width, height, selectedDiagnosis]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />
      {tooltip && tooltipPosition && (
        <div
          style={{
            position: 'absolute',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '12px',
            fontFamily: 'sans-serif',
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {tooltip.diagnosis}
          </div>
          {tooltip.numberOfRecords !== undefined && (
            <div>Number of Records: {tooltip.numberOfRecords.toLocaleString()}</div>
          )}
          {tooltip.totalDischarges !== undefined && (
            <div>Total Discharges: {tooltip.totalDischarges.toLocaleString()}</div>
          )}
          {tooltip.averageCoveredCharges !== undefined && (
            <div>
              Avg Covered Charges: $
              {tooltip.averageCoveredCharges.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )}
          {tooltip.averageMedicarePayments !== undefined && (
            <div>
              Avg Medicare Payments: $
              {tooltip.averageMedicarePayments.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
