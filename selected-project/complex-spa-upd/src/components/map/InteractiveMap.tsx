import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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

const LocationMarker = ({ addLocation }: { addLocation: (lat: number, lng: number) => void }) => {
  const map = useMapEvents({
    click(e) {
      addLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const InteractiveMap = () => {
  const [locations, setLocations] = useState<Array<{id: number, lat: number, lng: number, name: string}>>([]);
  const [name, setName] = useState('');
  const nextId = useRef(1);

  const addLocation = (lat: number, lng: number) => {
    if (!name) return;
    setLocations(prev => [...prev, { id: nextId.current++, lat, lng, name }]);
    setName('');
  };

  return (
    <div className="interactive-map">
      <div className="map-controls">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Location name"
          className="map-input"
        />
        <button 
          className="map-button"
          disabled={!name}
        >
          Click on map to add
        </button>
      </div>

      <MapContainer 
        center={[51.505, -0.09]} 
        zoom={13} 
        style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker addLocation={addLocation} />
        {locations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.lat, loc.lng]} 
            icon={icon}
          >
            <Popup>
              <div className="popup-content">
                <h3>{loc.name}</h3>
                <p>Lat: {loc.lat.toFixed(4)}</p>
                <p>Lng: {loc.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx>{`
        .interactive-map {
          width: 100%;
          margin: 1rem 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .map-controls {
          padding: 1rem;
          background: #f8f9fa;
          display: flex;
          gap: 0.5rem;
        }

        .map-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .map-button {
          padding: 0.5rem 1rem;
          background: #4a6bdf;
          color: white;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .map-button:hover {
          background: #3a5bd9;
        }

        .map-button:disabled {
          background: #ccc;
          cursor: not-allowed;
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