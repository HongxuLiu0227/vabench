import { useState } from 'react';
import type { TripData } from '../types/tripData';
import EndStationMap from './EndStationMap';
import StationBarChart from './StationBarChart';
import './Dashboard.css';

interface DashboardProps {
  data: TripData[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const handleStationClick = (stationName: string) => {
    if (stationName === '') {
      setSelectedStation(null);
    } else if (selectedStation === stationName) {
      setSelectedStation(null);
    } else {
      setSelectedStation(stationName);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>EndStation</h1>
        </div>
        
        <div className="dashboard-content">
          {/* Top section: End Station Map */}
          <div className="dashboard-row-top">
            <div className="worksheet worksheet-map">
              <EndStationMap
                data={data}
                selectedStation={selectedStation}
                onStationClick={handleStationClick}
              />
            </div>
          </div>

          {/* Bottom section: Top 10 and Bottom 10 */}
          <div className="dashboard-row-bottom">
            <div className="worksheet worksheet-top">
              <StationBarChart
                data={data}
                selectedStation={selectedStation}
                variant="top"
              />
            </div>
            <div className="worksheet worksheet-bottom">
              <StationBarChart
                data={data}
                selectedStation={selectedStation}
                variant="bottom"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
