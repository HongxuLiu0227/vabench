import React from 'react';
import type { TwitterData } from '../../types';
import { TextDisplay } from '../charts/CustomTableauView';

interface SearchWordProps {
  data: TwitterData[];
}

export const SearchWord: React.FC<SearchWordProps> = ({ data }) => {
  const searchWord = data.length > 0 ? data[0].検索ワード : '';

  return (
    <div className="worksheet-container">
      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        検索ワード
      </div>
      <TextDisplay label="" value={searchWord} size="large" />
    </div>
  );
};
