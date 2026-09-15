import { useEffect, useRef, useState } from 'react';
import { pack, hierarchy } from 'd3-hierarchy';
import { scaleSequential } from 'd3-scale';
import { select } from 'd3-selection';
import { interpolateTurbo } from 'd3-scale-chromatic';
import type { DiagnosisData, TooltipData } from '../types';
import { useFilter } from '../contexts/FilterContext';

interface BubbleChartProps {
  data: DiagnosisData[];
  width: number;
  height: number;
}

interface PackedNode {
  x: number;
  y: number;
  r: number;
  data: DiagnosisData;
}

/**
 * BubbleChart component - "G: Number of Records per Diagnosis"
 * Renders a packed circle visualization where:
 * - Circle size represents Number of Records
 * - Circle color represents Number of Records (sequential scale)
 * - Labels show Diagnosis text (with culling for small bubbles)
 *
 * Interactions:
 * - Click on a bubble triggers the filter action
 * - Hover shows detailed tooltip
 */
export function BubbleChart({ data, width, height }: BubbleChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const { selectedDiagnosis, setSelectedDiagnosis } = useFilter();

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    // Create color scale based on Number of Records
    const colorScale = scaleSequential(interpolateTurbo)
      .domain([
        Math.min(...data.map((d) => d.numberOfRecords)),
        Math.max(...data.map((d) => d.numberOfRecords)),
      ]);

    // Create packing layout
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const packLayout = pack<any>()
      .size([width, height])
      .padding(3);

    // Create hierarchy and pack
    type HierarchyData = { children?: DiagnosisData[] };
    const root = hierarchy({ children: data } as HierarchyData)
      .sum((d: HierarchyData | DiagnosisData) => {
        if ('numberOfRecords' in d) {
          return d.numberOfRecords;
        }
        return 0;
      });

    const nodes = packLayout(root).leaves() as PackedNode[];

    const g = svg.append('g');

    // Draw bubbles
    g.selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('cx', (d: PackedNode) => d.x)
      .attr('cy', (d: PackedNode) => d.y)
      .attr('r', (d: PackedNode) => d.r)
      .attr('fill', (d: PackedNode) => colorScale(d.data.numberOfRecords))
      .attr('stroke', (d: PackedNode) => {
        // Highlight selected bubble
        if (selectedDiagnosis && d.data.diagnosis === selectedDiagnosis) {
          return '#000';
        }
        return 'none';
      })
      .attr('stroke-width', (d: PackedNode) => {
        if (selectedDiagnosis && d.data.diagnosis === selectedDiagnosis) {
          return 3;
        }
        return 0;
      })
      .attr('opacity', (d: PackedNode) => {
        // Dim unselected bubbles when one is selected
        if (selectedDiagnosis && d.data.diagnosis !== selectedDiagnosis) {
          return 0.3;
        }
        return 1;
      })
      .style('cursor', 'pointer')
      .on('click', (_event: MouseEvent, d: PackedNode) => {
        // Toggle selection on click (auto-clear behavior)
        if (selectedDiagnosis === d.data.diagnosis) {
          setSelectedDiagnosis(null); // Clear if clicking the same bubble
        } else {
          setSelectedDiagnosis(d.data.diagnosis);
        }
      })
      .on('mouseover', (event: MouseEvent, d: PackedNode) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPosition({
            x: event.clientX - rect.left + 10,
            y: event.clientY - rect.top + 10,
          });
        }
        setTooltip({
          diagnosis: d.data.diagnosis,
          numberOfRecords: d.data.numberOfRecords,
          totalDischarges: d.data.totalDischarges,
          averageCoveredCharges: d.data.averageCoveredCharges,
          averageMedicarePayments: d.data.averageMedicarePayments,
        });
      })
      .on('mouseout', () => {
        setTooltip(null);
        setTooltipPosition(null);
      });

    // Add labels (with culling for small bubbles)
    g.selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('x', (d: PackedNode) => d.x)
      .attr('y', (d: PackedNode) => d.y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', (d: PackedNode) => {
        // Scale font size based on bubble radius, with minimum threshold
        const fontSize = Math.max(d.r * 0.3, 8);
        return fontSize < 10 ? '0' : `${fontSize}px`; // Hide label if too small
      })
      .attr('fill', '#fff')
      .attr('pointer-events', 'none')
      .text((d: PackedNode) => d.data.diagnosis)
      .each(function(d: PackedNode) {
        // Simple label culling - hide if text is wider than bubble
        const textWidth = (this as SVGTextElement).getComputedTextLength();
        if (textWidth > d.r * 1.8) {
          select(this as SVGTextElement).style('display', 'none');
        }
      });
  }, [data, width, height, selectedDiagnosis, setSelectedDiagnosis]);

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
