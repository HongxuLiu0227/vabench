import { useDashboard } from '../../contexts/DashboardContext';
import { getYears } from '../../services/dataService';
import type { SuperstoreRow } from '../../types';
import './YearWorksheet.css';

interface YearWorksheetProps {
  data: SuperstoreRow[];
}

export function YearWorksheet({ data }: YearWorksheetProps) {
  const { filters, setFilter, clearHighlight } = useDashboard();

  const years = getYears(data);

  const handleYearClick = (year: number) => {
    // Clear highlight on new selection
    clearHighlight();

    // Toggle year filter
    if (filters.year === year) {
      setFilter('year', 'All');
    } else {
      setFilter('year', year);
    }
  };

  return (
    <div className="year-worksheet">
      <div className="year-title">Year</div>
      <div className="year-list">
        {years.map(year => (
          <div
            key={year}
            className={`year-item ${filters.year === year ? 'active' : ''}`}
            onClick={() => handleYearClick(year)}
          >
            {year}
          </div>
        ))}
      </div>
    </div>
  );
}
