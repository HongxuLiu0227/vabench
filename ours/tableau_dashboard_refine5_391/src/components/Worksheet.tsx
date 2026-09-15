import type { ReactNode } from 'react';

interface WorksheetProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const Worksheet: React.FC<WorksheetProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`worksheet ${className}`}>
      <div className="worksheet-title">{title}</div>
      <div className="worksheet-content">
        {children}
      </div>
    </div>
  );
};
