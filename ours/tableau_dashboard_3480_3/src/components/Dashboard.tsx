/**
 * Dashboard 3 - Main dashboard component
 * Layout: Two worksheets side by side
 * - Left: Gender Trips by Hour of Day (51.33% width)
 * - Right: Trips by Day of Month (46.61% width)
 */
import { useEffect, useState, useMemo } from 'react';
import { GenderTripsByHour } from './GenderTripsByHour';
import { TripsByDayOfMonth } from './TripsByDayOfMonth';
import { loadTripData, aggregateByHourAndGender, aggregateByDayAndWeekday } from '../services/dataService';
import type { ParsedTrip } from '../types';
import type { GenderTripsByHour as GenderTripsByHourType } from '../types';
import { useDashboardContext } from '../contexts/useDashboardContext';

export function Dashboard() {
  const [trips, setTrips] = useState<ParsedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filterState } = useDashboardContext();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await loadTripData();
        setTrips(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Aggregate data for left worksheet (reacts to filter)
  const genderHourData: GenderTripsByHourType[] = useMemo(() => {
    return aggregateByHourAndGender(trips, filterState.selectedDay);
  }, [trips, filterState.selectedDay]);

  // Aggregate data for right worksheet (source of filter)
  const dayMonthData = useMemo(() => {
    return aggregateByDayAndWeekday(trips);
  }, [trips]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
      }}>
        Loading trip data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#d32f2f',
        textAlign: 'center',
        padding: '20px',
      }}>
        <div>
          <div style={{ fontSize: '20px', marginBottom: '10px' }}>Error loading data</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  // Calculate widths based on Tableau spec zones
  // Gender Trips by Hour of Day: 51.33% width
  // Trips by Day of Month: 46.61% width
  const containerWidth = Math.min(1400, window.innerWidth - 40);
  const leftWidth = Math.floor(containerWidth * 0.5133);
  const rightWidth = Math.floor(containerWidth * 0.4661);
  const sheetHeight = 650;

  return (
    <div style={{
      padding: '20px',
      background: '#f5f5f5',
      minHeight: '100vh',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `${leftWidth}px ${rightWidth}px`,
          gap: '20px',
          alignItems: 'start',
        }}>
          <div>
            <GenderTripsByHour
              data={genderHourData}
              width={leftWidth}
              height={sheetHeight}
              title="Trips by Hour of Day"
            />
            {filterState.selectedDay !== null && (
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                background: '#e3f2fd',
                border: '1px solid #90caf9',
                borderRadius: '4px',
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span>
                  Filtered by Day: <strong>{filterState.selectedDay}</strong>
                </span>
              </div>
            )}
          </div>

          <div>
            <TripsByDayOfMonth
              data={dayMonthData}
              width={rightWidth}
              height={sheetHeight}
              title="Trips by Day of Month"
            />
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              background: '#fff3e0',
              border: '1px solid #ffcc80',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#666',
            }}>
              Click a bar to filter the hourly chart by that day
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
