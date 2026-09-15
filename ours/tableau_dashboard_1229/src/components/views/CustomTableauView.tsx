import type { BaseballPlayer } from '../../types/baseball';
import { calculateBadHeightWeight } from '../../services/dataService';

interface GroupedOverviewData {
  handedness: string;
  avg_sum: number;
  height_sum: number;
  hr_sum: number;
  count: number;
  weight_kg_sum: number;
  players: BaseballPlayer[];
}

interface GroupedSheet3Data {
  handedness: string;
  avg_sum: number;
  height_sum: number;
  hr_sum: number;
  count: number;
  weight_kg_sum: number;
}

interface CustomTableauViewProps {
  data: BaseballPlayer[];
  viewType: 'overview' | 'bad-height' | 'bad-weight' | 'relation' | 'handedness' | 'sheet3';
  highlightedNames?: Set<string>;
  highlightedHandedness?: Set<string>;
  onRowClick?: (player: BaseballPlayer) => void;
  onHandednessClick?: (handedness: string) => void;
}

export function CustomTableauView({
  data,
  viewType,
  highlightedNames = new Set(),
  highlightedHandedness = new Set(),
  onRowClick,
  onHandednessClick
}: CustomTableauViewProps) {
  const isHighlighted = (player: BaseballPlayer) => {
    const nameHighlighted = highlightedNames.size === 0 || highlightedNames.has(player.name);
    const handednessHighlighted = highlightedHandedness.size === 0 || highlightedHandedness.has(player.handedness);
    return nameHighlighted && handednessHighlighted;
  };

  const isHandednessHighlighted = (handedness: string) => {
    return highlightedHandedness.size === 0 || highlightedHandedness.has(handedness);
  };

  const renderOverView = () => {
    const grouped = data.reduce((acc, player) => {
      const key = player.handedness || 'Unknown';
      if (!acc[key]) {
        acc[key] = {
          handedness: key,
          avg_sum: 0,
          height_sum: 0,
          hr_sum: 0,
          count: 0,
          weight_kg_sum: 0,
          players: []
        };
      }
      acc[key].avg_sum += player.avg;
      acc[key].height_sum += player.height;
      acc[key].hr_sum += player.HR;
      acc[key].weight_kg_sum += player.weight_kg;
      acc[key].count++;
      acc[key].players.push(player);
      return acc;
    }, {} as Record<string, GroupedOverviewData>);

    const rows = Object.values(grouped);

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Handedness</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Avg Sum</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Height Sum</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>HR Sum</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Count</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Weight (kg) Sum</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: isHandednessHighlighted(row.handedness) ? 'white' : '#f9f9f9',
                  opacity: isHandednessHighlighted(row.handedness) ? 1 : 0.3,
                  cursor: onHandednessClick ? 'pointer' : 'default'
                }}
                onClick={() => onHandednessClick && onHandednessClick(row.handedness)}
              >
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.handedness}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{row.avg_sum.toFixed(2)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{row.height_sum.toFixed(0)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{row.hr_sum.toFixed(0)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{row.count}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{row.weight_kg_sum.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBadGoodHeight = () => {
    const heightGroups = data.reduce((acc, player) => {
      const { badHeight } = calculateBadHeightWeight(player);
      const key = badHeight ? 'Bad Height (>73")' : 'Good Height (≤73")';
      if (!acc[key]) {
        acc[key] = { category: key, players: [] };
      }
      acc[key].players.push(player);
      return acc;
    }, {} as Record<string, { category: string; players: BaseballPlayer[] }>);

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Category</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Count</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(heightGroups).map((group, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9f9f9' }}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{group.category}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{group.players.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBadGoodWeight = () => {
    const weightGroups = data.reduce((acc, player) => {
      const { badWeight } = calculateBadHeightWeight(player);
      const key = badWeight ? 'Bad Weight (>184 lbs)' : 'Good Weight (≤184 lbs)';
      if (!acc[key]) {
        acc[key] = { category: key, players: [] };
      }
      acc[key].players.push(player);
      return acc;
    }, {} as Record<string, { category: string; players: BaseballPlayer[] }>);

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Category</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Count</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(weightGroups).map((group, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9f9f9' }}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{group.category}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{group.players.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRelationWeightHeight = () => {
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Height</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Weight</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Handedness</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 20).map((player, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: isHighlighted(player) ? 'white' : '#f9f9f9',
                  opacity: isHighlighted(player) ? 1 : 0.3,
                  cursor: onRowClick ? 'pointer' : 'default'
                }}
                onClick={() => onRowClick && onRowClick(player)}
              >
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{player.height}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{player.weight}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{player.handedness}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 20 && <p style={{ fontSize: '11px', color: '#666' }}>Showing first 20 records</p>}
      </div>
    );
  };

  const renderHandednessRelation = () => {
    const grouped = data.reduce((acc, player) => {
      const key = player.handedness || 'Unknown';
      if (!acc[key]) {
        acc[key] = { handedness: key, players: [] };
      }
      acc[key].players.push(player);
      return acc;
    }, {} as Record<string, { handedness: string; players: BaseballPlayer[] }>);

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Handedness</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Count</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Avg Height</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Avg Weight</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(grouped).map((group, idx) => {
              const avgHeight = group.players.reduce((sum, p) => sum + p.height, 0) / group.players.length;
              const avgWeight = group.players.reduce((sum, p) => sum + p.weight, 0) / group.players.length;
              return (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: isHighlighted(group.players[0]) ? 'white' : '#f9f9f9',
                    opacity: isHighlighted(group.players[0]) ? 1 : 0.3,
                    cursor: onRowClick ? 'pointer' : 'default'
                  }}
                  onClick={() => onRowClick && onRowClick(group.players[0])}
                >
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{group.handedness}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{group.players.length}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{avgHeight.toFixed(1)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{avgWeight.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSheet3 = () => {
    const grouped = data.reduce((acc, player) => {
      const key = player.handedness || 'Unknown';
      if (!acc[key]) {
        acc[key] = {
          handedness: key,
          avg_sum: 0,
          height_sum: 0,
          hr_sum: 0,
          count: 0,
          weight_kg_sum: 0
        };
      }
      acc[key].avg_sum += player.avg;
      acc[key].height_sum += player.height;
      acc[key].hr_sum += player.HR;
      acc[key].weight_kg_sum += player.weight_kg;
      acc[key].count++;
      return acc;
    }, {} as Record<string, GroupedSheet3Data>);

    const rows = Object.values(grouped);

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Handedness</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Measure Values</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: isHandednessHighlighted(row.handedness) ? 'white' : '#f9f9f9',
                  opacity: isHandednessHighlighted(row.handedness) ? 1 : 0.3,
                  cursor: onHandednessClick ? 'pointer' : 'default'
                }}
                onClick={() => onHandednessClick && onHandednessClick(row.handedness)}
              >
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.handedness}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                  Avg: {row.avg_sum.toFixed(2)}, Height: {row.height_sum.toFixed(0)}, HR: {row.hr_sum.toFixed(0)}, Count: {row.count}, Wt(kg): {row.weight_kg_sum.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  switch (viewType) {
    case 'overview':
      return renderOverView();
    case 'bad-height':
      return renderBadGoodHeight();
    case 'bad-weight':
      return renderBadGoodWeight();
    case 'relation':
      return renderRelationWeightHeight();
    case 'handedness':
      return renderHandednessRelation();
    case 'sheet3':
      return renderSheet3();
    default:
      return <div>Unknown view type</div>;
  }
}
