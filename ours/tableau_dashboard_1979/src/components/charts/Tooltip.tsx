/**
 * Tooltip component for displaying chart data on hover
 */

import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode | null;
  children: React.ReactElement;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseMove = (e: MouseEvent) => {
    setPosition({ x: e.clientX + 10, y: e.clientY + 10 });
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
    document.addEventListener('mousemove', handleMouseMove);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    document.removeEventListener('mousemove', handleMouseMove);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {React.cloneElement(children, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave
      })}
      {isVisible && content && (
        <div
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}
