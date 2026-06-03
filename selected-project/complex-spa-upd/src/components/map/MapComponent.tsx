import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

export const MapComponent = () => {
  const [position, setPosition] = useState<[number, number]>([51.505, -0.09]);
  const [zoom, setZoom] = useState(13);
  const [locations, setLocations] = useState([
    { id: 1, name: 'Central Park', position: [51.505, -0.09], visitors: 1250 },
    { id: 2, name: 'Downtown', position: [51.51, -0.1], visitors: 980 },
    { id: 3, name: 'Waterfront', position: [51.515, -0.07], visitors: 750 }
  ]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.warn(err)
      );
    }
  }, []);

  return (
    <div className="map-container">
      <MapContainer 
        center={position} 
        zoom={zoom} 
        style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={loc.position as [number, number]} 
            icon={icon}
          >
            <Popup>
              <div className="popup-content">
                <h3>{loc.name}</h3>
                <p>Visitors: {loc.visitors}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx>{`
        .map-container {
          width: 100%;
          margin: 1rem 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .map-container:hover {
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }

        .popup-content {
          padding: 0.5rem;
        }

        .popup-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: #333;
        }

        .popup-content p {
          margin: 0;
          font-size: 0.875rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};