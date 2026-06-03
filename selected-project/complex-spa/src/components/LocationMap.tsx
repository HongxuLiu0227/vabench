import React from 'react';
import { Card } from 'antd';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

const LocationMap: React.FC<LocationMapProps> = ({ latitude, longitude, zoom = 13 }) => {
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`;
  
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Card title="Location Map">
        <iframe
          title="location-map"
          width="100%"
          height="350px"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapUrl}
        ></iframe>
      </Card>
    </div>
  );
};

export default LocationMap;