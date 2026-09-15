import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { BrokerChartData, SelectionState } from '../types';
import { useDashboard } from '../contexts/DashboardContext';

interface HorizontalRankedBarChartProps {
  data: BrokerChartData[];
  title: string;
  axisTitle: string;
  colorMap: Map<string, string>;
  categoryOrder: string[];
  selection?: SelectionState;
  onSelectionChange?: (selection: Partial<SelectionState>) => void;
  worksheetName: string;
  isHighlighted?: boolean;
  seriesField?: 'hasPriceCut' | 'boatType' | 'boatCondition';
}

const CHART_MARGINS = { top: 20, right: 120, bottom: 50, left: 180 };
const BAR_HEIGHT = 25;
const CATEGORY_PADDING = 10;

export function HorizontalRankedBarChart({
  data,
  title,
  axisTitle,
  colorMap,
  categoryOrder,
  onSelectionChange,
  isHighlighted = false,
  worksheetName,
  seriesField,
}: HorizontalRankedBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const { triggerHighlight, clearHighlight } = useDashboard();

  // Group data by broker and get sorted unique brokers
  const brokerGroups = useMemo(() => {
    const grouped = new Map<string, BrokerChartData[]>();
    data.forEach((d) => {
      if (!grouped.has(d.broker)) {
        grouped.set(d.broker, []);
      }
      grouped.get(d.broker)!.push(d);
    });
    return grouped;
  }, [data]);

  const uniqueBrokers = useMemo(() => {
    return Array.from(brokerGroups.keys());
  }, [brokerGroups]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = svgRef.current.parentElement?.clientWidth || 800;
    const numBrokers = uniqueBrokers.length;
    const chartHeight = Math.max(400, numBrokers * (BAR_HEIGHT + CATEGORY_PADDING) + CHART_MARGINS.top + CHART_MARGINS.bottom);

    const g = svg
      .attr('width', containerWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${CHART_MARGINS.left},${CHART_MARGINS.top})`);

    const innerWidth = containerWidth - CHART_MARGINS.left - CHART_MARGINS.right;
    const innerHeight = chartHeight - CHART_MARGINS.top - CHART_MARGINS.bottom;

    // X scale (linear)
    const maxCount = d3.max(data, (d) => d.count) || 0;
    const xScale = d3.scaleLinear().domain([0, maxCount * 1.1]).range([0, innerWidth]);

    // Y scale (band)
    const yScale = d3.scaleBand().domain(uniqueBrokers).range([0, innerHeight]).paddingInner(0.1);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr('color', '#666')
      .attr('font-size', '12px');

    // X axis label
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2},${innerHeight + 40})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(axisTitle);

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .attr('color', '#666')
      .attr('font-size', '12px');

    // Draw bars for each broker
    uniqueBrokers.forEach((broker) => {
      const brokerData = brokerGroups.get(broker) || [];
      const yPos = yScale(broker);
      if (yPos === undefined) return;

      let xOffset = 0;

      // Ensure consistent ordering of categories
      const sortedData = [...brokerData].sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.category);
        const indexB = categoryOrder.indexOf(b.category);
        return indexA - indexB;
      });

      sortedData.forEach((d) => {
        const barWidth = xScale(d.count);
        const color = colorMap.get(d.category) || '#999';

        g
          .append('rect')
          .attr('x', xOffset)
          .attr('y', yPos)
          .attr('width', barWidth)
          .attr('height', yScale.bandwidth() / sortedData.length - 2)
          .attr('fill', color)
          .attr('opacity', isHighlighted ? 0.4 : 0.9)
          .attr('rx', 2)
          .style('cursor', 'pointer')
          .on('click', (event) => {
            event.stopPropagation();
            if (onSelectionChange) {
              // Update selection state
              onSelectionChange({ broker: d.broker });

              // Trigger highlight interactions based on the worksheet and series field
              // This implements the Tableau dashboard actions from the contract
              const allWorksheets = [
                'Number of Boats Sold By Brokers(Sail vs Power)',
                'Number of Boats Sold By Brokers(Price Cut)',
                'Number of Boats Sold By Brokers(Used vs New)',
              ];

              // Determine target worksheets based on series field
              let targetWorksheets: string[] = [];
              if (seriesField === 'hasPriceCut') {
                // Price Cut worksheet highlights all worksheets
                targetWorksheets = allWorksheets;
              } else if (seriesField === 'boatType') {
                // Sail vs Power highlights all worksheets via dashboard action
                targetWorksheets = allWorksheets;
              } else if (seriesField === 'boatCondition') {
                // Used vs New highlights all worksheets via dashboard action
                targetWorksheets = allWorksheets;
              } else {
                // Default: highlight all worksheets
                targetWorksheets = allWorksheets;
              }

              // Trigger the highlight with auto-clear
              triggerHighlight(worksheetName, targetWorksheets, true);
            }
          })
          .on('mouseover', (event) => {
            const content = `${d.broker}<br/><strong>${d.category}</strong><br/>Count: ${d.count}`;
            setTooltip({ x: event.pageX, y: event.pageY, content });
            d3.select(event.currentTarget).attr('opacity', isHighlighted ? 0.6 : 1);
          })
          .on('mouseout', (event) => {
            setTooltip(null);
            d3.select(event.currentTarget).attr('opacity', isHighlighted ? 0.4 : 0.9);
          });

        // Bar labels
        if (barWidth > 30) {
          g.append('text')
            .attr('x', xOffset + barWidth / 2)
            .attr('y', yPos + (yScale.bandwidth() / sortedData.length - 2) / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .attr('pointer-events', 'none')
            .text(d.count);
        }

        xOffset += barWidth;
      });
    });

    // Click outside to clear selection and highlights
    svg.on('click', (event) => {
      if (event.target === svgRef.current) {
        if (onSelectionChange) {
          onSelectionChange({ broker: null });
        }
        // Clear highlights when clicking outside (auto-clear behavior)
        clearHighlight();
      }
    });
  }, [data, uniqueBrokers, brokerGroups, colorMap, categoryOrder, axisTitle, isHighlighted, onSelectionChange, worksheetName, seriesField, triggerHighlight, clearHighlight]);

  return (
    <div className="worksheet-container">
      <h3 className="worksheet-title">{title}</h3>
      <svg ref={svgRef}></svg>
      {tooltip && (
        <div
          className="tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
}
