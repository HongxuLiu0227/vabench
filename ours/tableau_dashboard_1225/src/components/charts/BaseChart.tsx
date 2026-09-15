import { useEffect, useRef, useState } from 'react';
import { type Selection } from 'd3-selection';

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function useChartDimensions(margin: Margin = { top: 20, right: 20, bottom: 60, left: 60 }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  return { ref, dimensions, margin };
}

export function createValueLabels(
  selection: Selection<SVGElement, unknown, null, undefined>,
  isHorizontal: boolean
) {
  selection
    .append('text')
    .attr('class', 'value-label')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .style('text-anchor', isHorizontal ? 'start' : 'middle')
    .style('fill', '#000')
    .style('pointer-events', 'none');
}
