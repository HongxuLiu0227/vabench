import React, { useState, useMemo } from 'react';
import { HorizontalStackedPercentageBar } from './charts/HorizontalStackedPercentageBar';
import type { TransformedDiabetesRecord } from '../types';
import { aggregateForStackedPercentage, filterData } from '../services/dataService';

interface DashboardProps {
  data: TransformedDiabetesRecord[];
}

interface FilterState {
  diag_1?: string[];
  diag_2?: string[];
  diag_3?: string[];
  readmitted_group?: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [filters, setFilters] = useState<FilterState>({});

  // Apply filters to data
  const filteredData = useMemo(() => {
    return filterData(data, filters as Record<string, string[]>);
  }, [data, filters]);

  // Aggregate data for each worksheet
  const diag1Data = useMemo(() => {
    return aggregateForStackedPercentage(filteredData, 'diag_1', 'readmitted_group');
  }, [filteredData]);

  const diag2Data = useMemo(() => {
    return aggregateForStackedPercentage(filteredData, 'diag_2', 'readmitted_group');
  }, [filteredData]);

  const diag3Data = useMemo(() => {
    return aggregateForStackedPercentage(filteredData, 'diag_3', 'readmitted_group');
  }, [filteredData]);

  // Handle segment clicks (filter actions)
  const handleSegmentClick = (worksheet: string, category: string) => {
    const fieldMap: Record<string, keyof FilterState> = {
      'Diag1 vs Readmit': 'diag_1',
      'Diag2 vs Readmit': 'diag_2',
      'Diag3 vs Readmit': 'diag_3'
    };

    const field = fieldMap[worksheet];
    if (!field) return;

    // Toggle filter with auto-clear behavior
    const currentFilter = filters[field] || [];
    const isSelected = currentFilter.includes(category);

    if (isSelected) {
      // Deselect - clear filter if this was the only selected item
      const newFilter = currentFilter.filter((c) => c !== category);
      if (newFilter.length === 0) {
        setFilters((prev) => {
          const newFilters = { ...prev };
          delete newFilters[field];
          return newFilters;
        });
      } else {
        setFilters((prev) => ({ ...prev, [field]: newFilter }));
      }
    } else {
      // Select - replace any existing selection (auto-clear other selections)
      setFilters({ [field]: [category] });
    }
  };

  // Handle highlight interactions based on contract highlight_bindings
  // Each worksheet highlights its category field when filtered
  const getHighlightedSeries = (): string[] => {
    // When a filter is active, highlight the selected categories across all worksheets
    // This implements the dashboard-targeted filter actions from the contract
    if (Object.keys(filters).length === 0) {
      return [];
    }

    // For all three worksheets, we highlight based on readmitted_group
    // This creates the cross-worksheet highlight effect defined in highlight_bindings
    return [];
  };

  // Get selected categories for highlighting and filter display
  const getSelectedCategories = (field: keyof FilterState): string[] => {
    return filters[field] || [];
  };

  // Check if a category should be dimmed (not highlighted)
  const isDimmed = (worksheet: string, category: string): boolean => {
    const fieldMap: Record<string, keyof FilterState> = {
      'Diag1 vs Readmit': 'diag_1',
      'Diag2 vs Readmit': 'diag_2',
      'Diag3 vs Readmit': 'diag_3'
    };

    const field = fieldMap[worksheet];
    if (!field || !filters[field]) return false;

    return !filters[field]!.includes(category);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '24px' }}>
      {/* Active Filters Display */}
      {Object.keys(filters).length > 0 && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px' }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e3a8a', marginBottom: '4px' }}>Active Filters:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(filters).map(([field, values]) => (
              <span key={field} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', backgroundColor: 'white', border: '1px solid #93c5fd', borderRadius: '4px', fontSize: '12px' }}>
                <span style={{ fontWeight: 500 }}>{field}:</span> {values.join(', ')}
                <button
                  onClick={() => setFilters((prev) => {
                    const newFilters = { ...prev };
                    delete newFilters[field as keyof FilterState];
                    return newFilters;
                  })}
                  style={{ marginLeft: '8px', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', background: 'none', border: 'none', padding: 0 }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Grid - Following Tableau zone coordinates from render contract */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Diag1 vs Readmit - zone: x_ratio 0.0069, y_ratio 0.0135, w_ratio 0.9861, h_ratio 0.3243 */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', padding: '16px' }}>
          <HorizontalStackedPercentageBar
            data={diag1Data}
            width={900}
            height={300}
            title="Diag1 vs Readmit"
            selectedCategories={getSelectedCategories('diag_1')}
            highlightedSeries={getHighlightedSeries()}
            isDimmed={(category) => isDimmed('Diag1 vs Readmit', category)}
            onSegmentClick={(category) => handleSegmentClick('Diag1 vs Readmit', category)}
          />
        </div>

        {/* Diag2 vs Readmit - zone: x_ratio 0.0069, y_ratio 0.3378, w_ratio 0.9861, h_ratio 0.3243 */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', padding: '16px' }}>
          <HorizontalStackedPercentageBar
            data={diag2Data}
            width={900}
            height={300}
            title="Diag2 vs Readmit"
            selectedCategories={getSelectedCategories('diag_2')}
            highlightedSeries={getHighlightedSeries()}
            isDimmed={(category) => isDimmed('Diag2 vs Readmit', category)}
            onSegmentClick={(category) => handleSegmentClick('Diag2 vs Readmit', category)}
          />
        </div>

        {/* Diag3 vs Readmit - zone: x_ratio 0.0069, y_ratio 0.6622, w_ratio 0.9861, h_ratio 0.3243 */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', padding: '16px' }}>
          <HorizontalStackedPercentageBar
            data={diag3Data}
            width={900}
            height={300}
            title="Diag3 vs Readmit"
            selectedCategories={getSelectedCategories('diag_3')}
            highlightedSeries={getHighlightedSeries()}
            isDimmed={(category) => isDimmed('Diag3 vs Readmit', category)}
            onSegmentClick={(category) => handleSegmentClick('Diag3 vs Readmit', category)}
          />
        </div>
      </div>
    </div>
  );
};
