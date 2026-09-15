import React from 'react';
import type { DataRow } from '../services/types';
import { getArtistColor, getSortedArtists } from '../services/dataService';

interface LegendProps {
  data: DataRow[];
  selectedArtist: string | null;
  onArtistSelect?: (artist: string | null) => void;
}

const Legend: React.FC<LegendProps> = ({ data, selectedArtist, onArtistSelect }) => {
  const sortedArtists = getSortedArtists(data);

  return (
    <div
      style={{
        padding: '12px',
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        maxHeight: '600px',
        overflowY: 'auto'
      }}
    >
      <h4
        style={{
          margin: '0 0 10px 0',
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#333',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '6px'
        }}
      >
        Artist
      </h4>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        {sortedArtists.map((artist) => (
          <div
            key={artist}
            onClick={() => onArtistSelect && onArtistSelect(artist)}
            onMouseEnter={(e) => {
              if (onArtistSelect) {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }
            }}
            onMouseLeave={(e) => {
              if (onArtistSelect) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 6px',
              borderRadius: '3px',
              cursor: onArtistSelect ? 'pointer' : 'default',
              transition: 'background-color 0.2s',
              opacity: selectedArtist === null || selectedArtist === artist ? 1 : 0.3,
              fontWeight: selectedArtist === artist ? 'bold' : 'normal'
            }}
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '2px',
                backgroundColor: getArtistColor(artist),
                flexShrink: 0,
                border: '1px solid #ccc'
              }}
            />
            <span
              style={{
                fontSize: '11px',
                color: '#333',
                wordBreak: 'break-word'
              }}
            >
              {artist}
            </span>
          </div>
        ))}
      </div>
      {selectedArtist && (
        <button
          onClick={() => onArtistSelect && onArtistSelect(null)}
          style={{
            marginTop: '10px',
            padding: '6px 12px',
            fontSize: '11px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '3px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Clear Selection
        </button>
      )}
    </div>
  );
};

export default Legend;
