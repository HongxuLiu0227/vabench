import { useData, useMonthlyTrips, useUserTypePercentages, useGenderPercentages } from '../hooks/useData';
import { useFilters } from '../contexts/FilterContext';
import { TripsOverTimeChart } from './TripsOverTimeChart';
import { PercentageLineChart } from './PercentageLineChart';
import { ChartLegend } from './ChartLegend';

export function TripDashboard() {
  const { data, loading, error } = useData();
  const { filters, highlights, setFilter, setHighlight, clearHighlights } = useFilters();

  const monthlyTrips = useMonthlyTrips(data, filters);
  const userTypePercentages = useUserTypePercentages(data, filters);
  const genderPercentages = useGenderPercentages(data, filters);

  const handleMonthClick = (month: string) => {
    if (filters.selectedMonth === month) {
      setFilter({ selectedMonth: null });
    } else {
      setFilter({ selectedMonth: month });
    }
    // Clear highlights after selection
    clearHighlights();
  };

  const handleSeriesClick = (month: string, category: string, isGender: boolean) => {
    if (filters.selectedMonth === month && ((isGender && filters.selectedGender === category) || (!isGender && filters.selectedUserType === category))) {
      setFilter({
        selectedMonth: null,
        selectedUserType: isGender ? filters.selectedUserType : null,
        selectedGender: isGender ? null : filters.selectedGender,
      });
    } else {
      if (isGender) {
        setFilter({ selectedMonth: month, selectedGender: category });
      } else {
        setFilter({ selectedMonth: month, selectedUserType: category });
      }
    }
    clearHighlights();
  };

  const handleMeasureClick = (measure: string) => {
    if (highlights.measureName === measure) {
      setHighlight({ measureName: null });
    } else {
      setHighlight({ measureName: measure });
    }
  };

  const handleGenderClick = (gender: string) => {
    if (highlights.gender === gender) {
      setHighlight({ gender: null });
    } else {
      setHighlight({ gender });
    }
  };

  const handleUserTypeClick = (userType: string) => {
    if (highlights.userType === userType) {
      setHighlight({ userType: null });
    } else {
      setHighlight({ userType });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error loading data: {error}
      </div>
    );
  }

  const userTypeColorScale = (category: string) => {
    const colors: Record<string, string> = {
      'Subscriber': '#4e79a7',
      'Customer': '#f28e2b',
    };
    return colors[category] || '#999999';
  };

  const genderColorScale = (category: string) => {
    // Per Tableau contract filter_members, gender chart only shows Female and Unknown
    const colors: Record<string, string> = {
      'Female': '#4e79a7',
      'Unknown': '#e15759',
    };
    return colors[category] || '#999999';
  };

  return (
    <div className="trip-dashboard" style={{ padding: '16px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5' }}>
      {/* Top section: Trips Over Time */}
      <div className="dashboard-top" style={{ marginBottom: '16px' }}>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px' }}>
          <TripsOverTimeChart
            data={monthlyTrips}
            width={800}
            height={350}
            onMonthClick={handleMonthClick}
            highlightedMonth={filters.selectedMonth}
            highlightedMeasure={highlights.measureName}
          />
        </div>
        {/* Legend for Trips Over Time - positioned below */}
        <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '4px', marginTop: '8px' }}>
          <ChartLegend
            items={[
              { label: 'Count of Trips', color: '#e15759' },
              { label: 'Avg Trip Duration (Minutes)', color: '#4e79a7' },
            ]}
            highlightedItem={highlights.measureName}
            onItemClick={handleMeasureClick}
          />
        </div>
      </div>

      {/* Bottom section: Split into two columns */}
      <div className="dashboard-bottom" style={{ display: 'flex', gap: '16px' }}>
        {/* Left column: Charts */}
        <div className="dashboard-left" style={{ flex: '0 0 80%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* PCT of Trips By UserType */}
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px' }}>
            <PercentageLineChart
              data={userTypePercentages}
              title="PCT of Trips By UserType"
              width={650}
              height={250}
              yAxisTitle="% of Total Trips"
              onSeriesClick={(month, category) => handleSeriesClick(month, category, false)}
              highlightedMonth={filters.selectedMonth}
              highlightedCategory={highlights.userType}
              colorScale={userTypeColorScale}
            />
          </div>

          {/* Pct of Trips by Gender */}
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px' }}>
            <PercentageLineChart
              data={genderPercentages}
              title="Pct of Trips by Gender"
              width={650}
              height={200}
              yAxisTitle="% of Total Trips"
              onSeriesClick={(month, category) => handleSeriesClick(month, category, true)}
              highlightedMonth={filters.selectedMonth}
              highlightedCategory={highlights.gender}
              colorScale={genderColorScale}
            />
            {/* Legend for Gender - positioned above */}
            <div style={{ marginTop: '12px' }}>
              <ChartLegend
                items={[
                  // Per Tableau contract filter_members, gender chart only shows Female and Unknown
                  { label: 'Female', color: '#4e79a7' },
                  { label: 'Unknown', color: '#e15759' },
                ]}
                highlightedItem={highlights.gender}
                onItemClick={handleGenderClick}
              />
            </div>
          </div>
        </div>

        {/* Right column: Legends */}
        <div className="dashboard-right" style={{ flex: '0 0 20%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Legend for UserType - positioned to the right */}
          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '4px' }}>
            <ChartLegend
              title="User Type"
              items={[
                { label: 'Subscriber', color: '#4e79a7' },
                { label: 'Customer', color: '#f28e2b' },
              ]}
              position="right"
              highlightedItem={highlights.userType}
              onItemClick={handleUserTypeClick}
            />
          </div>
        </div>
      </div>

      {/* Filter status */}
      {(filters.selectedMonth || filters.selectedUserType || filters.selectedGender) && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '14px' }}>
          <strong>Active Filters:</strong>
          {filters.selectedMonth && <span style={{ marginLeft: '8px' }}>Month: {filters.selectedMonth}</span>}
          {filters.selectedUserType && <span style={{ marginLeft: '8px' }}>User Type: {filters.selectedUserType}</span>}
          {filters.selectedGender && <span style={{ marginLeft: '8px' }}>Gender: {filters.selectedGender}</span>}
          <button
            onClick={() => {
              setFilter({ selectedMonth: null, selectedUserType: null, selectedGender: null });
              clearHighlights();
            }}
            style={{ marginLeft: '16px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px' }}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
