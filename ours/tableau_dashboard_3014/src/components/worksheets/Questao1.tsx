import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { dataService } from '../../services/dataService';
import type { StateRecord } from '../../types';
import { useInteraction } from '../../hooks/useInteraction';
import './Questao1.css';

interface Questao1Props {
  className?: string;
}

export function Questao1({ className = '' }: Questao1Props) {
  const [data, setData] = useState<StateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const { getSelection, setSelection, filterState, setFilter, clearFilter, clearSelection } = useInteraction();

  const selection = useMemo(() => getSelection('questao1'), [getSelection]);

  useEffect(() => {
    async function loadData() {
      await dataService.loadData();
      const stateData = dataService.getStateRecords();
      setData(stateData);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    if (!filterState?.enabled) return data;

    const { state } = filterState.filters;
    if (state) {
      return data.filter(d => d.state === state);
    }
    return data;
  }, [data, filterState]);

  const handleBarClick = useCallback((stateData: StateRecord) => {
    setSelection('questao1', [stateData.state]);
    setFilter(true, 'questao1', { state: stateData.state });
  }, [setSelection, setFilter]);

  const handleBackgroundClick = useCallback(() => {
    clearSelection('questao1');
    clearFilter();
  }, [clearSelection, clearFilter]);

  const isHighlighted = useCallback((state: string) => {
    if (selection.length === 0) return true;
    return selection.includes(state);
  }, [selection]);

  useEffect(() => {
    if (loading || filteredData.length === 0 || !svgRef.current) return;

    const svg = svgRef.current;
    const width = svg.clientWidth || 600;
    const height = svg.clientHeight || 400;

    const margin = { top: 20, right: 20, bottom: 40, left: 120 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    svg.innerHTML = '';

    const maxCount = Math.max(...filteredData.map(d => d.count));

    const xScale = scaleLinear()
      .domain([0, maxCount * 1.1])
      .range([0, chartWidth]);

    const yScale = scaleBand()
      .domain(filteredData.map(d => d.state))
      .range([0, chartHeight])
      .padding(0.2);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);

    filteredData.forEach((d) => {
      const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      barGroup.setAttribute('class', `bar-group ${isHighlighted(d.state) ? 'highlighted' : 'dimmed'}`);
      barGroup.style.cursor = 'pointer';

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', '0');
      rect.setAttribute('y', String(yScale(d.state) || 0));
      rect.setAttribute('width', String(xScale(d.count)));
      rect.setAttribute('height', String(yScale.bandwidth()));
      rect.setAttribute('fill', '#4477aa');
      rect.setAttribute('rx', '2');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(xScale(d.count) + 5));
      text.setAttribute('y', String((yScale(d.state) || 0) + yScale.bandwidth() / 2));
      text.setAttribute('dy', '0.35em');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-size', '11px');
      text.textContent = String(d.count);

      barGroup.appendChild(rect);
      barGroup.appendChild(text);
      barGroup.addEventListener('click', () => handleBarClick(d));

      g.appendChild(barGroup);
    });

    const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxisGroup.setAttribute('transform', `translate(0,${chartHeight})`);
    xAxisGroup.setAttribute('class', 'x-axis');

    xScale.ticks(5).forEach(tick => {
      const tickGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tickGroup.setAttribute('transform', `translate(${xScale(tick)},0)`);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('y2', '6');
      line.setAttribute('stroke', '#666');
      line.setAttribute('stroke-width', '1');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('y', '20');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#999');
      text.setAttribute('font-size', '10px');
      text.textContent = String(tick);

      tickGroup.appendChild(line);
      tickGroup.appendChild(text);
      xAxisGroup.appendChild(tickGroup);
    });

    g.appendChild(xAxisGroup);

    filteredData.forEach((d) => {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', '-10');
      label.setAttribute('y', String((yScale(d.state) || 0) + yScale.bandwidth() / 2));
      label.setAttribute('dy', '0.35em');
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('fill', '#ffffff');
      label.setAttribute('font-size', '11px');
      label.textContent = d.state;
      g.appendChild(label);
    });

    svg.appendChild(g);
  }, [loading, filteredData, selection, isHighlighted, handleBarClick]);

  useEffect(() => {
    if (selection.length > 0 && filterState?.enabled === false) {
      const state = selection[0];
      setSelection('questao1', [state]);
    }
  }, [selection, filterState, setSelection]);

  if (loading) {
    return <div className={`questao1-loading ${className}`}>Loading...</div>;
  }

  return (
    <div className={`questao1-container ${className}`} onClick={handleBackgroundClick}>
      <h3 className="questao1-title">
        Análise do número  de ocorrências com o nível de infeção por estado
      </h3>
      <svg ref={svgRef} className="questao1-chart" width="100%" height="100%" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
