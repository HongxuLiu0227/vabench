import type { BaseballPlayer } from '../types/baseball';
import { OverViewWorksheet } from './worksheets/OverViewWorksheet';
import { BattingAvgWorksheet } from './worksheets/BattingAvgWorksheet';
import { AvgHRWorksheet } from './worksheets/AvgHRWorksheet';
import { BadGoodHeightWorksheet } from './worksheets/BadGoodHeightWorksheet';
import { BadGoodWeightWorksheet } from './worksheets/BadGoodWeightWorksheet';
import { RelationWeightHeightWorksheet } from './worksheets/RelationWeightHeightWorksheet';
import { HandednessRelationWorksheet } from './worksheets/HandednessRelationWorksheet';
import { Sheet3Worksheet } from './worksheets/Sheet3Worksheet';

interface DashboardProps {
  data: BaseballPlayer[];
}

export function Dashboard({ data }: DashboardProps) {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Result Of Final Analysis</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div>
          <OverViewWorksheet data={data} />
        </div>
        <div>
          <BattingAvgWorksheet data={data} />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div>
          <AvgHRWorksheet data={data} />
        </div>
        <div>
          <BadGoodHeightWorksheet data={data} />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div>
          <BadGoodWeightWorksheet data={data} />
        </div>
        <div>
          <RelationWeightHeightWorksheet data={data} />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div>
          <HandednessRelationWorksheet data={data} />
        </div>
        <div>
          <Sheet3Worksheet data={data} />
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
          <strong>Interactions:</strong> Click on any chart element to select/highlight data points.
          Selected items will be highlighted across all worksheets. Click again to deselect.
        </p>
      </div>
    </div>
  );
}
