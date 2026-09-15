import { useMemo, useRef, useEffect } from 'react';
import { scaleBand, scaleLinear, scaleOrdinal } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { OfficeSupplyData, ITEM_COLORS } from '../types';
import { useDashboardFilters } from '../contexts/DashboardContext';

interface Props {
  data: OfficeSupplyData[];
  width?: number;
  height?: number;
}

interface StackedDataPoint {
  category: string;
  series: string;
  value: number;
}

export function SalesRepVsUnits({ data, width = 400, height = 300 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, setSalesRep } = useDashboardFilters();

  // Aggregate data by Sales representative and Item (stacked by Item)
  const stackedData = useMemo(() => {
    const grouped = new Map<string, Map<string, number>>();

    data.forEach(row => {
      const rep = row['Sales representative'];
      const item = row.Item;
      const units = Number(row['Units Sold']);

      if (!grouped.has(rep)) {
        grouped.set(rep, new Map());
      }
      const repMap = grouped.get(rep)!;
      repMap.set(item, (repMap.get(item) || 0) + units);
    });

    // Convert to stacked array
    const result: StackedDataPoint[] = [];
    grouped.forEach((itemMap, category) => {
      itemMap.forEach((value, series) => {
        result.push({ category, series, value });
      });
    });

    return result;
  }, [data]);

  // Get all unique items and sales reps
  const allItems = useMemo(() => {
    return Array.from(new Set(stackedData.map(d => d.series)));
  }, [stackedData]);

  const allReps = useMemo(() => {
    return Array.from(new Set(stackedData.map(d => d.category)))
      .sort((a, b) => {
        // Sort by total units descending
        const totalA = stackedData
          .filter(d => d.category === a)
          .reduce((sum, d) => sum + d.value, 0);
        const totalB = stackedData
          .filter(d => d.category === b)
          .reduce((sum, d) => sum + d.value, 0);
        return totalB - totalA;
      });
  }, [stackedData]);

  // Calculate total units per rep for sorting
  const repTotals = useMemo(() => {
    const totals = new Map<string, number>();
    stackedData.forEach(d => {
      totals.set(d.category, (totals.get(d.category) || 0) + d.value);
    });
    return totals;
  }, [stackedData]);

  // Calculate dimensions with increased bottom margin for better label visibility
  const margin = { top: 20, right: 20, bottom: 80, left: 70 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Create scales
  const xScale = useMemo(
    () => scaleBand()
      .domain(allReps)
      .range([0, chartWidth])
      .padding(0.3),
    [allReps, chartWidth]
  );

  const yScale = useMemo(
    () => scaleLinear()
      .domain([0, Math.max(...Array.from(repTotals.values())) * 1.1])
      .range([chartHeight, 0])
      .nice(),
    [repTotals, chartHeight]
  );

  const colorScale = useMemo(
    () => scaleOrdinal()
      .domain(allItems)
      .range(allItems.map(item => ITEM_COLORS[item] || '#999')),
    [allItems]
  );

  // Render axes
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);

    // X axis with increased spacing for long labels
    const xAxisGroup = svg.select<SVGGElement>('.x-axis');
    // @ts-ignore - d3-axis types are incompatible with TypeScript strict mode
    xAxisGroup.call(axisBottom(xScale));
    xAxisGroup.selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.5em')
      .style('font-size', '11px')
      .each(function() {
        // Ensure full visibility of long labels
        const text = select(this);
        const words = text.text().split(/\s+/);
        if (words.length > 2) {
          text.text(words.slice(0, 2).join(' ') + '...');
          text.append('title').text(words.join(' '));
        }
      });

    // Y axis
    const yAxisGroup = svg.select<SVGGElement>('.y-axis');
    // @ts-ignore - d3-axis types are incompatible with TypeScript strict mode
    yAxisGroup.call(axisLeft(yScale));
    yAxisGroup.selectAll('text').style('font-size', '12px');
  }, [xScale, yScale]);

  const handleBarClick = (category: string) => {
    // Auto-clear behavior: if clicking same bar, clear filter
    if (filters.selectedSalesRep === category) {
      setSalesRep(null);
    } else {
      setSalesRep(category);
    }
  };

  return (
    <div style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Stacked bars */}
          {allReps.map((category) => {
            const categoryData = stackedData.filter(d => d.category === category);
            const x = xScale(category) ?? 0;
            const barWidth = xScale.bandwidth() ?? 0;
            let yOffset = 0;

            // Check if this rep is selected
            const isSelected = filters.selectedSalesRep === category;

            return (
              <g key={category}>
                {categoryData.map((d) => {
                  const y = yScale(yOffset + d.value);
                  const barHeight = yScale(yOffset) - y;
                  yOffset += Number(d.value);

                  return (
                    <rect
                      key={d.series}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={colorScale(d.series) as string}
                      stroke="#fff"
                      strokeWidth={1}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleBarClick(category)}
                      opacity={
                        filters.selectedSalesRep && !isSelected ? 0.3 : 1
                      }
                    />
                  );
                })}

                {/* Total label */}
                <text
                  x={x + barWidth / 2}
                  y={yScale(repTotals.get(category) || 0) - 5}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#333"
                >
                  {repTotals.get(category)?.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <g
            className="x-axis"
            transform={`translate(0, ${chartHeight})`}
          />
          <g
            className="y-axis"
          />
        </g>
      </svg>

      {/* Legend - Required by Tableau contract */}
      <div
        style={{
          position: 'absolute',
          bottom: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          fontSize: '11px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '90%',
        }}
      >
        {allItems.map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: ITEM_COLORS[item] || '#999',
                border: '1px solid #ccc',
              }}
            />
            <span style={{ fontSize: '10px' }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
