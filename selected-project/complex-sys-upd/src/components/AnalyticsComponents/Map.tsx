import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

type MapProps = {
  data: Record<string, number>;
};

// Very simplified world map implementation
// In a real app, you would use proper geoJSON data
const geoUrl = 'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json';

export default function Map(props) {
  return (
    <div className="map-container">
      <ComposableMap
        projection="geoMercator"
        width={800}
        height={400}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              const regionName = geo.properties.NAME;
              const value = props.data[regionName] || 0;
              const fill = value > 0 
                ? `rgba(52, 152, 219, ${Math.min(1, value / 1000)})` 
                : '#EEE';
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke="#FFF"
                  strokeWidth={0.5}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};