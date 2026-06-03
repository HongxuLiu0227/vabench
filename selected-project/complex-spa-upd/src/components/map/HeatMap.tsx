import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const generateHeatData = () => {
  const data = [];
  for (let i = 0; i < 20; i++) {
    data.push({
      id: i,
      lat: 51.5 + Math.random() * 0.1 - 0.05,
      lng: -0.1 + Math.random() * 0.1 - 0.05,
      intensity: Math.floor(Math.random() * 100)
    });
  }
  return data;
};

export const HeatMap = () => {
  const [heatData, setHeatData] = useState(generateHeatData());
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setHeatData(generateHeatData());
      setTime(new Date().toLocaleTimeString());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (intensity: number) => {
    if (intensity < 30) return '#ffeda0';
    if (intensity < 60) return '#feb24c';
    if (intensity < 90) return '#f03b20';
    return '#bd0026';
  };

  const getRadius = (intensity: number) => {
    return intensity / 2;
  };

  return (
    <div className="heat-map">
      <div className="map-header">
        <h3>Activity Heatmap</h3>
        <p>Last updated: {time}</p>
      </div>

      <MapContainer 
        center={[51.505, -0.09]} 
        zoom={13} 
        style={{ height: '400px', width: '100%', borderRadius: '0 0 0.5rem 0.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {heatData.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.lat, point.lng]}
            radius={getRadius(point.intensity)}
            fillOpacity={0.6}
            color={getColor(point.intensity)}
          >
            <Tooltip>
              <div className="tooltip-content">
                <p>Intensity: {point.intensity}</p>
                <p>Lat: {point.lat.toFixed(4)}</p>
                <p>Lng: {point.lng.toFixed(4)}</p>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <style jsx>{`
        .heat-map {
          width: 100%;
          margin: 1rem 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .heat-map:hover {
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }

        .map-header {
          padding: 1rem;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }

        .map-header h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.125rem;
          color: #333;
        }

        .map-header p {
          margin: 0;
          font-size: 0.875rem;
          color: #666;
        }

        .tooltip-content {
          padding: 0.5rem;
        }

        .tooltip-content p {
          margin: 0;
          font-size: 0.875rem;
          color: #333;
        }
      `}</style>
    </div>
  );
};