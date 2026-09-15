import { useDashboard } from '../contexts/DashboardContext';
import { TopStations } from './TopStations';
import { BottomStations } from './BottomStations';
import { Map1 } from './Map1';

export function Dashboard() {
  const { loading, error } = useDashboard();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>
          <h2>Loading CitiBike Data...</h2>
          <p>This may take a moment as we process the trip data.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: 'red' }}>
          <h2>Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Popularity of Stations</h1>

      {/* Dashboard layout based on zones from contract */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'auto auto',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Map 1 - occupies full width on top */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Map1 width={1100} height={500} />
        </div>

        {/* Top Stations - left side */}
        <div>
          <TopStations width={500} height={350} />
        </div>

        {/* Bottom Stations - right side */}
        <div>
          <BottomStations width={500} height={350} />
        </div>
      </div>
    </div>
  );
}
