import { useFilters } from '../contexts/FilterContext';
import { ISSUE_AREA_LABELS } from '../types';
import type { IssueArea } from '../types';

export const IssueAreaFilter: React.FC = () => {
  const { filters, setIssueAreas } = useFilters();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === 'all') {
      setIssueAreas(new Set<IssueArea>());
    } else {
      setIssueAreas(new Set([Number(value) as IssueArea]));
    }
  };

  const selectedValue = filters.issueAreas.size === 0 ? 'all' : Array.from(filters.issueAreas)[0].toString();

  return (
    <div className="issue-area-filter">
      <label htmlFor="issue-area-select">Issue Area:</label>
      <select
        id="issue-area-select"
        value={selectedValue}
        onChange={handleChange}
        className="filter-select"
      >
        <option value="all">All</option>
        {Object.entries(ISSUE_AREA_LABELS).map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};
