import React from 'react';
import styles from './LocationMap.module.css';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  zoom = 14,
  className = ''
}) => {
  // In a real implementation, you would use a map library like Leaflet or Google Maps
  // This is a placeholder implementation
  
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`;
  
  return (
    <div className={`${styles.mapContainer} ${className}`}>
      <iframe
        title="Location Map"
        src={mapUrl}
        className={styles.mapIframe}
        allowFullScreen
        loading="lazy"
      ></iframe>
    </div>
  );
};