
import { getTotalQuantity } from '../../services/dataService';
import type { SuperstoreRow } from '../../types';
import './KPIWorksheet.css';

interface SalesQuantityWorksheetProps {
  data: SuperstoreRow[];
}

export function SalesQuantityWorksheet({ data }: SalesQuantityWorksheetProps) {
  const totalQuantity = getTotalQuantity(data);

  return (
    <div className="kpi-worksheet">
      <div className="kpi-label">Sales Quantity</div>
      <div className="kpi-value" style={{ color: '#8138f7' }}>
        {totalQuantity.toLocaleString()}
      </div>
    </div>
  );
}
