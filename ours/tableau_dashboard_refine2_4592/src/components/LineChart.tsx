import { useMemo, useRef, useEffect } from 'react';
import { scaleTime, scaleLinear, scaleOrdinal } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { line } from 'd3-shape';
import { select } from 'd3-selection';
import { timeFormat } from 'd3-time-format';
import { OfficeSupplyData, MonthlyDataPoint } from '../types';
import { useDashboardFilters } from '../contexts/DashboardContext';

interface Props {
  data: OfficeSupplyData[];
  width?: number;
  height?: number;
}

export function LineChart({ data, width = 600, height = 300 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { filters, setDate } = useDashboardFilters();

  // Aggregate data by Year-Month and Sales representative
  const lineData = useMemo(() => {
    const grouped = new Map<string, Map<string, number>>();

    data.forEach(row => {
      const yearMonth = row.YearMonth;
      const rep = row['Sales representative'];
      const revenue = Number(row.Revenue);

      if (!grouped.has(yearMonth)) {
        grouped.set(yearMonth, new Map());
      }
      const repMap = grouped.get(yearMonth)!;
      repMap.set(rep, (repMap.get(rep) || 0) + revenue);
    });

    // Convert to array of points per series (Sales representative)
    const seriesMap = new Map<string, MonthlyDataPoint[]>();
    const allDates = Array.from(grouped.keys()).sort();

    allDates.forEach(dateStr => {
      const repMap = grouped.get(dateStr)!;
      const [year, month] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, 1);

      repMap.forEach((value, series) => {
        if (!seriesMap.has(series)) {
          seriesMap.set(series, []);
        }
        seriesMap.get(series)!.push({
          date,
          yearMonth: dateStr,
          value,
          series,
        });
      });
    });

    return seriesMap;
  }, [data]);

  // Get all unique dates and series
  const allDates = useMemo(() => {
    const dates = new Set<string>();
    lineData.forEach(points => {
      points.forEach(p => dates.add(p.yearMonth));
    });
    return Array.from(dates).sort().map(str => {
      const [year, month] = str.split('-').map(Number);
      return new Date(year, month - 1, 1);
    });
  }, [lineData]);

  const allSeries = useMemo(() => {
    return Array.from(lineData.keys()).sort();
  }, [lineData]);

  // Calculate dimensions with increased bottom margin for better label visibility
  const margin = { top: 20, right: 120, bottom: 80, left: 70 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Create scales
  const xScale = useMemo(
    () => scaleTime()
      .domain([Math.min(...allDates.map(d => d.getTime())), Math.max(...allDates.map(d => d.getTime()))])
      .range([0, chartWidth]),
    [allDates, chartWidth]
  );

  const yScale = useMemo(
    () => scaleLinear()
      .domain([0, Math.max(
        ...Array.from(lineData.values()).flat().map(d => d.value)
      ) * 1.1])
      .range([chartHeight, 0])
      .nice(),
    [lineData, chartHeight]
  );

  const colorScale = useMemo(
    () => scaleOrdinal()
      .domain(allSeries)
      .range([
        '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
        '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac'
      ]),
    [allSeries]
  );

  // Create line generator
  const lineGenerator = useMemo(() => {
    return line<MonthlyDataPoint>()
      .x(d => xScale(d.date.getTime())!)
      .y(d => yScale(d.value))
      .defined(d => !isNaN(d.value));
  }, [xScale, yScale]);

  // Render axes
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);

    // X axis
    const xAxisGroup = svg.select<SVGGElement>('.x-axis');
    const xAxis = axisBottom(xScale)
      // @ts-ignore - d3-axis types are incompatible with TypeScript strict mode
      .tickFormat(timeFormat('%Y-%m'))
      .ticks(width > 500 ? 10 : 5);
    // @ts-ignore - d3-axis types are incompatible with TypeScript strict mode
    xAxisGroup.call(xAxis);
    xAxisGroup.selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em')
      .style('font-size', '11px');

    // Y axis
    const yAxisGroup = svg.select<SVGGElement>('.y-axis');
    // @ts-ignore - d3-axis types are incompatible with TypeScript strict mode
    yAxisGroup.call(axisLeft(yScale));
    yAxisGroup.selectAll('text').style('font-size', '12px');
  }, [xScale, yScale, width]);

  const handlePointClick = (dateStr: string) => {
    // Auto-clear behavior: if clicking same point, clear filter
    if (filters.selectedDate === dateStr) {
      setDate(null);
    } else {
      setDate(dateStr);
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
          {/* Grid lines */}
          {yScale.ticks(5).map((tick, i) => (
            <line
              key={`grid-${i}`}
              x1={0}
              y1={yScale(tick)}
              x2={chartWidth}
              y2={yScale(tick)}
              stroke="#e0e0e0"
              strokeDasharray="4,4"
            />
          ))}

          {/* Lines and points for each series */}
          {Array.from(lineData.entries()).map(([seriesName, points]) => {
            const pathData = lineGenerator(points);
            const color = colorScale(seriesName) as string;

            return (
              <g key={seriesName}>
                {/* Line */}
                <path
                  d={pathData || ''}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  opacity={
                    filters.selectedDate && !points.some(p => p.yearMonth === filters.selectedDate)
                      ? 0.3
                      : 1
                  }
                />

                {/* Points */}
                {points.map((point) => {
                  const cx = xScale(point.date.getTime());
                  const cy = yScale(point.value);
                  const isSelected = filters.selectedDate === point.yearMonth;

                  return (
                    <circle
                      key={point.yearMonth}
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 6 : 4}
                      fill={color}
                      stroke={isSelected ? '#f28e2b' : '#fff'}
                      strokeWidth={isSelected ? 2 : 1}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handlePointClick(point.yearMonth)}
                      opacity={
                        filters.selectedDate && !isSelected ? 0.3 : 1
                      }
                    />
                  );
                })}
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

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '11px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Sales Rep</div>
        {allSeries.map((series) => (
          <div key={series} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
            <div
              style={{
                width: '12px',
                height: '2px',
                backgroundColor: colorScale(series) as string,
              }}
            />
            <span>{series}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
        }}
      >
        Click a point to filter by Month
      </div>
    </div>
  );
}
