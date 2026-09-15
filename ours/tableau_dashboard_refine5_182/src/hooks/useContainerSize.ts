import { useState, useEffect, type RefObject } from 'react';

/**
 * Hook that tracks the size of a container element using ResizeObserver
 * Returns the dimensions of the container, updating when the container resizes
 */
export function useContainerSize(containerRef: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial size measurement
    const rect = container.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    // Set up ResizeObserver to track size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return size;
}
