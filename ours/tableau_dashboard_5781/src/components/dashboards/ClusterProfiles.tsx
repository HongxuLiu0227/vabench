import type { ClusterProfileRow } from '../../types'

import { PatternsInCluster } from '../worksheets/PatternsInCluster';
import { UnitsSold } from '../worksheets/UnitsSold';
import { AvgPrice } from '../worksheets/AvgPrice';
import { Sheet9 } from '../worksheets/Sheet9';
import { NameOfPatterns } from '../worksheets/NameOfPatterns';

interface ClusterProfilesProps {
  data: ClusterProfileRow[]
}

export function ClusterProfiles({ data }: ClusterProfilesProps) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      padding: '20px',
      fontFamily: 'sans-serif',
      backgroundColor: '#f5f5f5',
    }}>
      {/* Dashboard Header */}
      <div
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '30px',
          color: '#000000',
        }}
      >
        Cluster Profiles - Based on first 3-week Performance
      </div>

      {/* Dashboard Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'auto auto',
          gap: '20px',
          height: 'calc(100% - 60px)',
        }}
      >
        {/* Row 1: Patterns in Cluster, Sheet 9, Name of Patterns */}
        <div style={{ backgroundColor: 'white', borderRadius: '4px', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ height: '300px' }}>
            <PatternsInCluster data={data} />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '4px', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ height: '300px' }}>
            <Sheet9 data={data} />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '4px', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ height: '300px' }}>
            <NameOfPatterns data={data} />
          </div>
        </div>

        {/* Row 2: Units Sold, Avg Price */}
        <div style={{ backgroundColor: 'white', borderRadius: '4px', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ height: '300px' }}>
            <UnitsSold data={data} />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '4px', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ height: '300px' }}>
            <AvgPrice data={data} />
          </div>
        </div>

        {/* Empty cell for layout balance */}
        <div style={{ backgroundColor: 'white', borderRadius: '4px', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', marginBottom: '10px' }}>Sales</div>
              <div style={{ fontSize: '12px', color: '#ccc' }}>View full dashboard for Sales chart</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
