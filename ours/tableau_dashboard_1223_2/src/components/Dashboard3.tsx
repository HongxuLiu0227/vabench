/**
 * Dashboard3 Component
 *
 * Tableau Dashboard "Dashboard 3" layout container
 * Displays the Market Penetration worksheet with proper sizing and layout constraints
 *
 * Spec requirements:
 * - min-width: 420px, max-width: 650px
 * - min-height: 560px, max-height: 860px
 * - 8px margin around container
 * - Centered horizontally
 * - No borders, border-radius, or background colors (not in spec)
 * - No dashboard title (dashboard_text_zones is empty)
 */

import type { MarketPenetrationData } from '../services/dataService';
import MarketPenetration from './MarketPenetration';

interface Dashboard3Props {
  data: MarketPenetrationData[];
}

export default function Dashboard3({ data }: Dashboard3Props) {
  return (
    <div
      style={{
        minWidth: '420px',
        maxWidth: '650px',
        minHeight: '560px',
        maxHeight: '860px',
        margin: '0 auto',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Worksheet Container - no extra styling per Tableau spec */}
        <MarketPenetration data={data} width={550} height={480} />
      </div>
    </div>
  );
}
