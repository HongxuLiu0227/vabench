import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { locations } from '../../data/locations';
import './MapComponent.css';

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

type MapVariant = 'default' | 'cluster' | 'heatmap';

interface MapComponentProps {
  variant?: MapVariant;
  onLocationSelect?: (location: any) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ variant = 'default', onLocationSelect }) => {
  const [activeLocation, setActiveLocation] = useState<any>(null);
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]);

  useEffect(() => {
    // Set initial center based on first location
    if (locations.length > 0) {
      setMapCenter([locations[0].lat, locations[0].lng]);
    }
  }, []);

  const handleMarkerClick = (location: any) => {
    setActiveLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const filterLocations = (type: string) => {
    if (type === 'all') {
      setFilteredLocations(locations);
    } else {
      setFilteredLocations(locations.filter(loc => loc.type === type));
    }
  };

  return (
    <div className="map-container">
      <div className="map-controls">
        <button onClick={() => filterLocations('all')}>All Locations</button>
        <button onClick={() => filterLocations('office')}>Offices</button>
        <button onClick={() => filterLocations('warehouse')}>Warehouses</button>
        <button onClick={() => filterLocations('retail')}>Retail Stores</button>
      </div>
      
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {filteredLocations.map((location) => (
          <Marker 
            key={location.id} 
            position={[location.lat, location.lng]}
            eventHandlers={{
              click: () => handleMarkerClick(location),
            }}
          >
            <Popup>
              <div>
                <h3>{location.name}</h3>
                <p>{location.address}</p>
                <p>Type: {location.type}</p>
                <p>Employees: {location.employees}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {activeLocation && (
        <div className="location-details">
          <h3>{activeLocation.name}</h3>
          <p>Address: {activeLocation.address}</p>
          <p>Phone: {activeLocation.phone}</p>
          <p>Manager: {activeLocation.manager}</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;