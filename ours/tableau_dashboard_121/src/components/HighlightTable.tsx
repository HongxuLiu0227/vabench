import React, { useMemo } from 'react';
import type { AggregatedMarketSales } from '../types';
import './HighlightTable.css';

interface HighlightTableProps {
  data: AggregatedMarketSales[];
}

export const HighlightTable: React.FC<HighlightTableProps> = ({ data }) => {
  const tableData = useMemo(() => {
    // Get unique markets and sub-categories
    const markets = Array.from(new Set(data.map(d => d.market))).sort();
    const subCategories = Array.from(new Set(data.map(d => d.subCategory))).sort();

    // Create pivot table
    const pivot: Record<string, Record<string, number>> = {};
    subCategories.forEach(sc => {
      pivot[sc] = {};
      markets.forEach(m => {
        pivot[sc][m] = 0;
      });
    });

    data.forEach(d => {
      if (pivot[d.subCategory] && pivot[d.subCategory][d.market] !== undefined) {
        pivot[d.subCategory][d.market] = d.sales;
      }
    });

    // Calculate color scale domain
    const allSales = data.map(d => d.sales);
    const maxSales = Math.max(...allSales);
    const minSales = Math.min(...allSales);

    return { markets, subCategories, pivot, maxSales, minSales };
  }, [data]);

  const getColor = (value: number) => {
    const { maxSales, minSales } = tableData;
    if (maxSales === minSales) return 'rgb(222, 235, 247)';

    const ratio = (value - minSales) / (maxSales - minSales);
    const r = Math.round(222 + (49 - 222) * ratio);
    const g = Math.round(235 + (130 - 235) * ratio);
    const b = Math.round(247 + (189 - 247) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const formatSales = (value: number) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value.toFixed(0);
  };

  return (
    <div className="highlight-table-container">
      <table className="highlight-table">
        <thead>
          <tr>
            <th className="row-header">Sub-Category</th>
            {tableData.markets.map(market => (
              <th key={market}>{market}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.subCategories.map(subCategory => (
            <tr key={subCategory}>
              <td className="row-header">{subCategory}</td>
              {tableData.markets.map(market => {
                const value = tableData.pivot[subCategory][market];
                return (
                  <td
                    key={market}
                    style={{ backgroundColor: getColor(value) }}
                    className="cell"
                  >
                    {formatSales(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
