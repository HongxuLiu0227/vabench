import React from 'react';
import type { TwitterData } from '../../types';
import { DataCount as DataCountDisplay } from '../charts/CustomTableauView';

interface DataCountProps {
  data: TwitterData[];
}

export const DataCount: React.FC<DataCountProps> = ({ data }) => {
  return (
    <div className="worksheet-container">
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        データ数
      </div>
      <DataCountDisplay count={data.length} />
    </div>
  );
};
