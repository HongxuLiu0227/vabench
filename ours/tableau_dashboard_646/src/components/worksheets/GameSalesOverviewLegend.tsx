import { GENRE_PALETTE } from '../../types';

interface Props {
  onGenreClick?: (genre: string) => void;
}

export function GameSalesOverviewLegend({ onGenreClick }: Props) {
  const genres = Object.keys(GENRE_PALETTE).sort();

  return (
    <div style={{
      padding: '10px',
      border: '1px solid #ddd',
      backgroundColor: '#f9f9f9',
      fontSize: '12px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>Genre</h4>
      {genres.map((genre) => (
        <div
          key={genre}
          onClick={() => onGenreClick?.(genre)}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '5px',
            cursor: onGenreClick ? 'pointer' : 'default',
            padding: '2px 0',
          }}
          onMouseEnter={(e) => {
            if (onGenreClick) {
              e.currentTarget.style.backgroundColor = '#e0e0e0';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: GENRE_PALETTE[genre],
              marginRight: '8px',
              border: '1px solid #ccc',
            }}
          />
          <span>{genre}</span>
        </div>
      ))}
    </div>
  );
}
