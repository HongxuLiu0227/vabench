import { useEffect, useRef, useState, useMemo } from 'react';
import { scaleLinear, scaleSqrt } from 'd3-scale';
import { useDashboard } from '../../hooks/useDashboard';
import type { ParsedOrder } from '../../types';

interface DataPoint {
  customerName: string;
  sales: number;
  profit: number;
  quantity: number;
}

interface CustomerSalesProfitsProps {
  data: ParsedOrder[];
}

export function CustomerSalesProfits({ data }: CustomerSalesProfitsProps) {
  const { filters, updateFilters, selection, setSelection } = useDashboard();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });

  // Aggregate data by customer
  const chartData = useMemo(() => {
    const aggregation = new Map<string, DataPoint>();

    data.forEach((row) => {
      const customerName = row['Customer Name'];
      const existing = aggregation.get(customerName);

      if (existing) {
        existing.sales += Number(row['Sales']);
        existing.profit += Number(row['Profit']);
        existing.quantity += Number(row['Quantity']);
      } else {
        aggregation.set(customerName, {
          customerName,
          sales: Number(row['Sales']),
          profit: Number(row['Profit']),
          quantity: Number(row['Quantity']),
        });
      }
    });

    return Array.from(aggregation.values());
  }, [data]);

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const containerWidth = svgRef.current.parentElement?.clientWidth || 500;
        setDimensions({ width: containerWidth, height: 400 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const margin = { top: 40, right: 40, bottom: 60, left: 80 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  const xScale = scaleLinear()
    .domain([0, Math.max(...chartData.map((d) => d.sales)) * 1.1])
    .range([0, chartWidth]);

  const yScale = scaleLinear()
    .domain([
      Math.min(...chartData.map((d) => d.profit)) * 1.1,
      Math.max(...chartData.map((d) => d.profit)) * 1.1,
    ])
    .range([chartHeight, 0]);

  const sizeScale = scaleSqrt()
    .domain([0, Math.max(...chartData.map((d) => d.quantity))])
    .range([4, 20] as [number, number]);

  const colorScale = scaleLinear<string>()
    .domain([
      Math.min(...chartData.map((d) => d.profit)),
      0,
      Math.max(...chartData.map((d) => d.profit)),
    ])
    .range(['#d7191c', '#ffffbf', '#2c7bb6']);

  const handleCircleClick = (customerName: string) => {
    if (filters.customerName === customerName) {
      updateFilters({ customerName: undefined });
      setSelection(null);
    } else {
      updateFilters({ customerName });
      setSelection({ field: 'Customer Name', value: customerName });
    }
  };

  const isHighlighted = (customerName: string) => {
    if (!selection) return true;
    return selection.value === customerName;
  };

  return (
    <div style={{ width: '100%' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
        Customer Sales & Profits
      </h3>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible' }}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {chartData.map((d) => (
            <circle
              key={d.customerName}
              cx={xScale(d.sales)}
              cy={yScale(d.profit)}
              r={sizeScale(d.quantity)}
              fill={colorScale(d.profit)}
              stroke="#fff"
              strokeWidth={1}
              style={{
                cursor: 'pointer',
                opacity: isHighlighted(d.customerName) ? 0.8 : 0.2,
                transition: 'opacity 0.2s',
              }}
              onClick={() => handleCircleClick(d.customerName)}
            />
          ))}

          <line
            x1={0}
            y1={yScale(0)}
            x2={chartWidth}
            y2={yScale(0)}
            stroke="#666"
            strokeWidth={1}
            strokeDasharray="5,5"
          />

          <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#ccc" strokeWidth={1} />
          <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#ccc" strokeWidth={1} />

          <text
            x={chartWidth / 2}
            y={chartHeight + 40}
            textAnchor="middle"
            style={{ fontSize: '12px', fill: '#333' }}
          >
            Sales
          </text>

          <text
            x={-chartHeight / 2}
            y={-50}
            textAnchor="middle"
            transform={`rotate(-90)`}
            style={{ fontSize: '12px', fill: '#333' }}
          >
            Profit
          </text>
        </g>
      </svg>
    </div>
  );
}
