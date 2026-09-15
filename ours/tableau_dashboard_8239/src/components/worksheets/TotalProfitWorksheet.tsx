
import { getTotalProfit } from '../../services/dataService';
import type { SuperstoreRow } from '../../types';
import './KPIWorksheet.css';

interface TotalProfitWorksheetProps {
  data: SuperstoreRow[];
}

export function TotalProfitWorksheet({ data }: TotalProfitWorksheetProps) {
  const totalProfit = getTotalProfit(data);

  return (
    <div className="kpi-worksheet">
      <div className="kpi-label">Total Profit</div>
      <div className="kpi-value" style={{ color: '#8138f7' }}>
        ${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </div>
    </div>
  );
}
