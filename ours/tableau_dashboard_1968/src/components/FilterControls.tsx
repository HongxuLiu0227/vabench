import { useDashboard } from '../contexts/DashboardContext';
import type { DataRow } from '../services/dataLoader';
import { getUniqueValues, getUniqueYears } from '../services/dataLoader';

interface FilterControlsProps {
  data: DataRow[];
}

export function FilterControls({ data }: FilterControlsProps) {
  const { state, setYear, setSegment, setRegion, setCategory } = useDashboard();

  // Get unique values for filters
  const years = getUniqueYears(data);
  const segments = getUniqueValues(data, 'segment');
  const regions = getUniqueValues(data, 'region');
  const categories = getUniqueValues(data, 'category');

  return (
    <div className="filter-controls" style={{ padding: '10px' }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>Filters</h4>

      {/* Year Filter */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
          Year
        </label>
        <select
          value={state.filters.year}
          onChange={(e) => setYear(e.target.value)}
          style={{
            width: '100%',
            padding: '4px 8px',
            fontSize: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        >
          <option value="All">All</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Segment Filter */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
          Segment
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
            <input
              type="radio"
              name="segment"
              value="All"
              checked={state.filters.segment === 'All'}
              onChange={() => setSegment('All')}
              style={{ marginRight: '6px' }}
            />
            All
          </label>
          {segments.map((segment) => (
            <label key={segment} style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                name="segment"
                value={segment}
                checked={state.filters.segment === segment}
                onChange={() => setSegment(segment)}
                style={{ marginRight: '6px' }}
              />
              {segment}
            </label>
          ))}
        </div>
      </div>

      {/* Region Filter */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
          Region
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
            <input
              type="radio"
              name="region"
              value="All"
              checked={state.filters.region === 'All'}
              onChange={() => setRegion('All')}
              style={{ marginRight: '6px' }}
            />
            All
          </label>
          {regions.map((region) => (
            <label key={region} style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                name="region"
                value={region}
                checked={state.filters.region === region}
                onChange={() => setRegion(region)}
                style={{ marginRight: '6px' }}
              />
              {region}
            </label>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
          Category
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
            <input
              type="radio"
              name="category"
              value="All"
              checked={state.filters.category === 'All'}
              onChange={() => setCategory('All')}
              style={{ marginRight: '6px' }}
            />
            All
          </label>
          {categories.map((category) => (
            <label key={category} style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                name="category"
                value={category}
                checked={state.filters.category === category}
                onChange={() => setCategory(category)}
                style={{ marginRight: '6px' }}
              />
              {category}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
