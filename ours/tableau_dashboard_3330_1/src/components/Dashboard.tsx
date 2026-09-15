import React, { useState, useMemo } from 'react';
import KPICard from './KPICard';
import PieChart from './PieChart';
import Legend from './Legend';
import type {
  AugmentedDataRow,
  FilterState,
  HighlightState,
} from '../types';
import {
  calculateGlobalAggregates,
  filterData,
  aggregateByDimension,
  sortByManualOrder,
  AGE_ORDER,
  ETHNICITY_ORDER,
  MARITAL_STATUS_ORDER,
  COLOR_PALETTES,
} from '../services/dataService';

interface DashboardProps {
  data: AugmentedDataRow[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [filters, setFilters] = useState<FilterState>({
    positiveNegativeFilter: null,
    ageFilter: [],
    ethnicityFilter: [],
    genderFilter: [],
    maritalStatusFilter: [],
  });

  const [highlights, setHighlights] = useState<HighlightState>({
    field: null,
    value: null,
  });

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return filterData(data, filters);
  }, [data, filters]);

  // Calculate global aggregates from filtered data
  const aggregates = useMemo(() => {
    return calculateGlobalAggregates(filteredData);
  }, [filteredData]);

  // Aggregate data for pie charts
  const ageData = useMemo(() => {
    const aggregated = aggregateByDimension(
      filteredData,
      'A2. Age:',
      ['Null', '75 years or older', '18-24 years old']
    );
    return sortByManualOrder(aggregated, AGE_ORDER);
  }, [filteredData]);

  const genderData = useMemo(() => {
    return aggregateByDimension(filteredData, 'A1. Gender:', ['Null']);
  }, [filteredData]);

  const ethnicityData = useMemo(() => {
    const aggregated = aggregateByDimension(
      filteredData,
      'A4. What is your ethnicity? If "other" please specify',
      ['Null']
    );
    return sortByManualOrder(aggregated, ETHNICITY_ORDER);
  }, [filteredData]);

  const maritalStatusData = useMemo(() => {
    const aggregated = aggregateByDimension(
      filteredData,
      'A3. What is your marital status? If "other" please specify',
      [],
      ['Common-law', 'Married', 'Other', 'Single']
    );
    return sortByManualOrder(aggregated, MARITAL_STATUS_ORDER);
  }, [filteredData]);

  // Handle highlight interactions
  const handleHighlight = (field: string, value: string | null) => {
    setHighlights({ field, value });
  };

  // Handle filter action from positive KPI card
  const handlePositiveFilter = () => {
    setFilters(prev => ({
      ...prev,
      positiveNegativeFilter:
        prev.positiveNegativeFilter === 'positive' ? null : 'positive',
    }));
    // Clear highlights when filter changes
    setHighlights({ field: null, value: null });
  };

  // Handle filter action from negative KPI card
  const handleNegativeFilter = () => {
    setFilters(prev => ({
      ...prev,
      positiveNegativeFilter:
        prev.positiveNegativeFilter === 'negative' ? null : 'negative',
    }));
    // Clear highlights when filter changes
    setHighlights({ field: null, value: null });
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Dashboard Title */}
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        Percent and Number of Positive and Negative in Varied Group
      </h1>

      {/* Dashboard Grid Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '412px 412px 160px',
          gridTemplateRows: '137.5px 377.5px 405px',
          gap: '0px',
          width: '1000px',
          height: '800px',
        }}
      >
        {/* Row 1: KPI Cards */}
        {/* Amount of Positive - Zone: x=800, y=7000, w=41200, h=13750 */}
        <div
          style={{
            gridColumn: 1,
            gridRow: 1,
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <KPICard
              label="Amount of Positive"
              value={aggregates.overallPositiveCount}
              percentage={`${aggregates.overallPositivePct.toFixed(1)}%`}
              type="positive"
              onClick={handlePositiveFilter}
            />
            <KPICard
              label="Amount of Positive %"
              value={0}
              percentage={`${aggregates.overallPositivePct.toFixed(1)}%`}
              type="positive"
            />
          </div>
        </div>

        {/* Amount of Negative - Zone: x=42000, y=7000, w=41200, h=13750 */}
        <div
          style={{
            gridColumn: 2,
            gridRow: 1,
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <KPICard
              label="Amount of Negative"
              value={aggregates.overallNegativeCount}
              percentage={`${aggregates.overallNegativePct.toFixed(1)}%`}
              type="negative"
              onClick={handleNegativeFilter}
            />
            <KPICard
              label="Amount of Negative %"
              value={0}
              percentage={`${aggregates.overallNegativePct.toFixed(1)}%`}
              type="negative"
            />
          </div>
        </div>

        {/* Legend column - zones will be placed here */}
        <div
          style={{
            gridColumn: 3,
            gridRow: '1 / 4',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Gender Legend - Zone: x=83200, y=7000, w=16000, h=10750 */}
          <div style={{ flex: '0 0 auto' }}>
            <Legend title="Gender" colorMap={COLOR_PALETTES.Gender} data={genderData} />
          </div>

          {/* Marital Status Legend - Zone: x=83200, y=38500, w=16000, h=15750 */}
          <div style={{ flex: '0 0 auto' }}>
            <Legend
              title="Marital Status"
              colorMap={COLOR_PALETTES['Marital Status']}
              data={maritalStatusData}
            />
          </div>

          {/* Age Legend - Zone: x=83200, y=17750, w=16000, h=20750 */}
          <div style={{ flex: '0 0 auto' }}>
            <Legend title="Age" colorMap={COLOR_PALETTES.Age} data={ageData} />
          </div>

          {/* Ethnicity Legend - Zone: x=83200, y=60000, w=16000, h=23250 */}
          <div style={{ flex: '0 0 auto' }}>
            <Legend
              title="Ethnicity"
              colorMap={COLOR_PALETTES.Ethnicity}
              data={ethnicityData}
            />
          </div>
        </div>

        {/* Row 2: Pie Charts */}
        {/* Gender - Zone: x=800, y=20750, w=41200, h=37750 */}
        <div
          style={{
            gridColumn: 1,
            gridRow: 2,
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PieChart
            data={genderData}
            title="Gender"
            colorMap={COLOR_PALETTES.Gender}
            dimension="A1. Gender:"
            highlights={highlights}
            onHighlight={handleHighlight}
          />
        </div>

        {/* Age - Zone: x=42000, y=20750, w=41200, h=37750 */}
        <div
          style={{
            gridColumn: 2,
            gridRow: 2,
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PieChart
            data={ageData}
            title="Age"
            colorMap={COLOR_PALETTES.Age}
            dimension="A2. Age:"
            highlights={highlights}
            onHighlight={handleHighlight}
          />
        </div>

        {/* Row 3: Pie Charts */}
        {/* Marital Status - Zone: x=800, y=58500, w=41200, h=40500 */}
        <div
          style={{
            gridColumn: 1,
            gridRow: 3,
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PieChart
            data={maritalStatusData}
            title="Marital Status"
            colorMap={COLOR_PALETTES['Marital Status']}
            dimension={'A3. What is your marital status? If "other" please specify'}
            highlights={highlights}
            onHighlight={handleHighlight}
          />
        </div>

        {/* Ethnicity - Zone: x=42000, y=58500, w=41200, h=40500 */}
        <div
          style={{
            gridColumn: 2,
            gridRow: 3,
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PieChart
            data={ethnicityData}
            title="Ethnicity"
            colorMap={COLOR_PALETTES.Ethnicity}
            dimension={'A4. What is your ethnicity? If "other" please specify'}
            highlights={highlights}
            onHighlight={handleHighlight}
          />
        </div>
      </div>

      {/* Filter status indicator */}
      {filters.positiveNegativeFilter && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '14px',
          }}
        >
          Filter active: Showing only{' '}
          {filters.positiveNegativeFilter === 'positive' ? 'Positive' : 'Negative'}{' '}
          scores{' '}
          <button
            onClick={() =>
              setFilters(prev => ({ ...prev, positiveNegativeFilter: null }))
            }
            style={{
              marginLeft: '10px',
              padding: '4px 8px',
              backgroundColor: '#1976d2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
