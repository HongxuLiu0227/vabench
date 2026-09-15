import { useDashboard } from '../../contexts/DashboardContext';
import { getMonths } from '../../services/dataService';
import type { SuperstoreRow } from '../../types';
import './MonthWorksheet.css';

interface MonthWorksheetProps {
  data: SuperstoreRow[];
}

export function MonthWorksheet({ data }: MonthWorksheetProps) {
  const { filters, setFilter, clearHighlight } = useDashboard();

  const months = getMonths(data);

  const handleMonthClick = (month: number) => {
    // Clear highlight on new selection
    clearHighlight();

    // Toggle month filter
    if (filters.month === month) {
      setFilter('month', 'All');
    } else {
      setFilter('month', month);
    }
  };

  return (
    <div className="month-worksheet">
      <div className="month-title">Month</div>
      <div className="month-list">
        {months.map(({ month, monthName }) => (
          <div
            key={month}
            className={`month-item ${filters.month === month ? 'active' : ''}`}
            onClick={() => handleMonthClick(month)}
          >
            {monthName}
          </div>
        ))}
      </div>
    </div>
  );
}
