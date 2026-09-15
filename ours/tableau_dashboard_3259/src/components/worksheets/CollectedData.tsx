import React from 'react';
import type { TwitterData } from '../../types';
import { DateRange } from '../charts/CustomTableauView';

interface CollectedDataProps {
  data: TwitterData[];
}

export const CollectedData: React.FC<CollectedDataProps> = ({ data }) => {
  if (data.length === 0) {
    return <div>No data</div>;
  }

  const dates = data.map((d) => new Date(d.投稿日時));
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  return (
    <div className="worksheet-container">
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        収集データ
      </div>
      <DateRange minDate={minDate} maxDate={maxDate} />
    </div>
  );
};
