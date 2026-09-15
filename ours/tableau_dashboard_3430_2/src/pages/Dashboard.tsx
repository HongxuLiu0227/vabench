import { useEffect, useState } from 'react';
import { loadTripData } from '../services/dataLoader';
import type { TripData } from '../types';
import AgeComparison from '../components/AgeComparison';
import CustomersVsSubscribersTotals from '../components/CustomersVsSubscribersTotals';
import MaleVsFemaleTotals from '../components/MaleVsFemaleTotals';
import TotalTrips2020 from '../components/TotalTrips2020';
import { useFilters } from '../contexts/FilterContext';
import './Dashboard.css';

function Dashboard() {
  const [data, setData] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filters, resetFilters } = useFilters();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const tripData = await loadTripData();
        setData(tripData);
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof typeof filters] !== undefined);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Short-Term Customers vs Annual Subscribers</h1>
        {hasActiveFilters && (
          <button className="reset-filters-button" onClick={resetFilters}>
            Reset Filters
          </button>
        )}
      </header>

      <div className="dashboard-grid">
        <div className="worksheet-container male-vs-female">
          <MaleVsFemaleTotals data={data} />
        </div>

        <div className="worksheet-container customers-vs-subscribers">
          <CustomersVsSubscribersTotals data={data} />
        </div>

        <div className="worksheet-container total-trips">
          <TotalTrips2020 data={data} />
        </div>

        <div className="worksheet-container age-comparison">
          <AgeComparison data={data} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
