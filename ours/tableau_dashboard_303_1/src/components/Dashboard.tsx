import React, { useState, useEffect, useCallback } from 'react';
import { VerticalRankedBar } from './VerticalRankedBar';
import { CustomTableauView } from './CustomTableauView';
import { HorizontalRankedBar } from './HorizontalRankedBar';
import { Legend } from './Legend';
import { loadAccidentData } from '../services/dataLoader';
import {
  aggregateByCategoryAndSeries,
  filterByHighlight,
  parseTimeToHour,
  parseDateToQuarter,
  parseDateToYear,
  getDayOfWeekName,
} from '../utils/dataTransform';
import type { AccidentRecord, HighlightMap } from '../types/data';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<AccidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<HighlightMap>({});
  const [dayOfWeekFilter, setDayOfWeekFilter] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadAccidentData()
      .then((accidentData) => {
        setData(accidentData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Clear highlights when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setHighlights({});
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleHighlight = useCallback((field: string, value: string | number) => {
    setHighlights((prev) => {
      const newHighlights: typeof prev = { ...prev };
      const fieldSet = newHighlights[field] || new Set<string | number>();
      fieldSet.add(value);
      newHighlights[field] = fieldSet;
      return newHighlights;
    });
  }, []);

  // Filter data based on highlights and day-of-week filter
  const filteredData = React.useMemo(() => {
    let result = data;

    // Apply day-of-week filter from Sheet 29 selection
    if (dayOfWeekFilter.size > 0) {
      result = result.filter((record) => dayOfWeekFilter.has(record.Day_of_Week));
    }

    // Apply highlights
    result = filterByHighlight(result, highlights);

    return result;
  }, [data, highlights, dayOfWeekFilter]);

  // Q10_Day: Impact of Time of Day on Number of Accidents
  const q10DayData = React.useMemo(() => {
    return aggregateByCategoryAndSeries(
      filteredData,
      (record) => parseTimeToHour(record.Time).toString(),
      (record) => record.Light_Conditions.toString(),
      (record) => {
        // Safely coerce to number, defaulting to 0 if undefined or NaN
        const value = Number(record.Number_of_Casualties);
        return isNaN(value) ? 0 : value;
      }
    );
  }, [filteredData]);

  // Q4_Time: Number of Accidents in Different Quarters
  const q4TimeData = React.useMemo(() => {
    return aggregateByCategoryAndSeries(
      filteredData,
      (record) => {
        const year = parseDateToYear(record.Date);
        const quarter = parseDateToQuarter(record.Date);
        return `${year}-${quarter}`;
      },
      (record) => {
        // Safely convert severity to string, handling potential undefined/null
        const severity = record.Accident_Severity;
        return (severity !== undefined && severity !== null) ? severity.toString() : 'Unknown';
      },
      () => 1 // Count records
    );
  }, [filteredData]);

  // Sheet 29: Impact of Day of the week on Number of Accidents
  const sheet29Data = React.useMemo(() => {
    return aggregateByCategoryAndSeries(
      filteredData,
      (record) => {
        // Safely convert day of week to string, handling potential undefined/null
        const dayOfWeek = record.Day_of_Week;
        return (dayOfWeek !== undefined && dayOfWeek !== null) ? dayOfWeek.toString() : 'Unknown';
      },
      () => 'all',
      () => 1 // Count records
    );
  }, [filteredData]);

  // Get unique values for legends
  const lightConditionValues = React.useMemo(() => {
    const values = new Set(
      data
        .map((d) => d.Light_Conditions)
        .filter((val) => val !== undefined && val !== null)
    );
    return Array.from(values).map(String).sort((a, b) => parseInt(a) - parseInt(b));
  }, [data]);

  const severityValues = React.useMemo(() => {
    const values = new Set(
      data
        .map((d) => d.Accident_Severity)
        .filter((val) => val !== undefined && val !== null)
    );
    return Array.from(values).map(String).sort((a, b) => parseInt(a) - parseInt(b));
  }, [data]);

  // Handle day-of-week filter from Sheet 29
  const handleDayOfWeekClick = useCallback((dayOfWeek: number) => {
    setDayOfWeekFilter((prev) => {
      const newFilter = new Set(prev);
      if (newFilter.has(dayOfWeek)) {
        newFilter.delete(dayOfWeek);
      } else {
        newFilter.add(dayOfWeek);
      }
      return newFilter;
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading dashboard data...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>This may take a moment for large datasets</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#d62728' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Error loading data</div>
          <div style={{ fontSize: '14px' }}>{error}</div>
        </div>
      </div>
    );
  }

  // Dashboard layout based on zone coordinates
  // Main area: 86.2% width, legends: 13.8% width on the right
  // Sheet 29: 0-43.1% width, 6.7-53% height
  // Q10_Day: 43.1-86.2% width, 6.7-53% height
  // Q4_Time: 0-86.2% width, 53-99.3% height
  const dashboardWidth = 1200;
  const dashboardHeight = 800;

  const legendWidth = 180;
  const mainContentWidth = dashboardWidth - legendWidth;

  const sheet29Width = mainContentWidth * 0.5;
  const q10DayWidth = mainContentWidth * 0.5;
  const q4TimeWidth = mainContentWidth;

  const sheet29Height = dashboardHeight * 0.46;
  const q10DayHeight = dashboardHeight * 0.46;
  const q4TimeHeight = dashboardHeight * 0.46;

  return (
    <div
      style={{
        width: dashboardWidth,
        height: dashboardHeight,
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#fff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Main content area */}
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          {/* Top row: Sheet 29 and Q10_Day */}
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            {/* Sheet 29 */}
            <div style={{ width: sheet29Width, paddingRight: '10px' }}>
              <HorizontalRankedBar
                data={sheet29Data}
                title="Impact of Day of the week on Number of Accidents"
                highlights={highlights}
                onHighlight={(field, value) => {
                  if (field === 'none:Day_of_Week:qk') {
                    handleDayOfWeekClick(value as number);
                  } else {
                    handleHighlight(field, value);
                  }
                }}
                width={sheet29Width}
                height={sheet29Height}
              />
            </div>

            {/* Q10_Day */}
            <div style={{ width: q10DayWidth }}>
              <VerticalRankedBar
                data={q10DayData}
                title="Impact of Time of Day on Number of Accidents"
                highlights={highlights}
                onHighlight={handleHighlight}
                width={q10DayWidth}
                height={q10DayHeight}
              />
            </div>
          </div>

          {/* Bottom row: Q4_Time */}
          <div>
            <CustomTableauView
              data={q4TimeData}
              title="Number of Accidents in Different Quarters"
              highlights={highlights}
              onHighlight={handleHighlight}
              width={q4TimeWidth}
              height={q4TimeHeight}
            />
          </div>
        </div>

        {/* Legend column */}
        <div style={{ width: legendWidth, paddingLeft: '10px' }}>
          {/* Q4_Time legend - at the top */}
          <div style={{ marginBottom: '20px' }}>
            <Legend
              categories={severityValues}
              position="top"
              orientation="vertical"
            />
          </div>

          {/* Q10_Day legend - below */}
          <div>
            <Legend
              categories={lightConditionValues}
              position="right"
              orientation="vertical"
            />
          </div>
        </div>
      </div>

      {/* Filter status indicator */}
      {dayOfWeekFilter.size > 0 && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '4px',
            fontSize: '13px',
          }}
        >
          <strong>Filter Active:</strong> Showing data for days:{' '}
          {Array.from(dayOfWeekFilter)
            .sort((a, b) => a - b)
            .map((d) => getDayOfWeekName(d))
            .join(', ')}{' '}
          <button
            onClick={() => setDayOfWeekFilter(new Set())}
            style={{
              marginLeft: '10px',
              padding: '2px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
            }}
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Highlight status indicator */}
      {Object.keys(highlights).length > 0 && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            borderRadius: '4px',
            fontSize: '13px',
          }}
        >
          <strong>Highlight Active:</strong> Click outside charts to clear
        </div>
      )}
    </div>
  );
};

export default Dashboard;
