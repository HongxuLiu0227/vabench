import { useEffect, useRef, useState, useMemo } from 'react';
import { scaleLinear, scaleSqrt } from 'd3-scale';
import { useDashboard } from '../../hooks/useDashboard';
import type { ParsedOrder } from '../../types';

interface MapDataPoint {
  city: string;
  state: string;
  sales: number;
  latitude: number;
  longitude: number;
}

interface SalesMapProps {
  data: ParsedOrder[];
}

// Approximate coordinates for major US cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'New York City': { lat: 40.7128, lng: -74.006 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Philadelphia': { lat: 39.9526, lng: -75.1652 },
  'Phoenix': { lat: 33.4484, lng: -112.074 },
  'San Antonio': { lat: 29.4241, lng: -98.4936 },
  'San Diego': { lat: 32.7157, lng: -117.1611 },
  'Dallas': { lat: 32.7767, lng: -96.797 },
  'San Jose': { lat: 37.3382, lng: -121.8863 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Jacksonville': { lat: 30.3322, lng: -81.6557 },
  'Columbus': { lat: 39.9612, lng: -82.9988 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'Detroit': { lat: 42.3314, lng: -83.0458 },
  'Memphis': { lat: 35.1495, lng: -90.049 },
  'Denver': { lat: 39.7392, lng: -104.9903 },
  'Washington': { lat: 38.9072, lng: -77.0369 },
  'Boston': { lat: 42.3601, lng: -71.0589 },
  'Nashville': { lat: 36.1627, lng: -86.7816 },
  'Baltimore': { lat: 39.2904, lng: -76.6122 },
  'Louisville': { lat: 38.2527, lng: -85.7585 },
  'Portland': { lat: 45.5152, lng: -122.6784 },
  'Las Vegas': { lat: 36.1699, lng: -115.1398 },
  'Milwaukee': { lat: 43.0318, lng: -87.8966 },
  'Albuquerque': { lat: 35.0844, lng: -106.6504 },
  'Tucson': { lat: 32.2226, lng: -110.9747 },
  'Fresno': { lat: 36.7468, lng: -119.7726 },
  'Sacramento': { lat: 38.5816, lng: -121.4944 },
  'Kansas City': { lat: 39.0997, lng: -94.5786 },
  'Mesa': { lat: 33.4152, lng: -111.8315 },
  'Atlanta': { lat: 33.749, lng: -84.388 },
  'Omaha': { lat: 41.2565, lng: -95.9345 },
  'Raleigh': { lat: 35.7796, lng: -78.6382 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'Long Beach': { lat: 33.7701, lng: -118.1937 },
  'Virginia Beach': { lat: 36.8529, lng: -75.978 },
  'Oakland': { lat: 37.8044, lng: -122.2712 },
  'Minneapolis': { lat: 44.9778, lng: -93.265 },
  'Tulsa': { lat: 36.154, lng: -95.9928 },
  'Cleveland': { lat: 41.4993, lng: -81.6944 },
  'Wichita': { lat: 37.6872, lng: -97.3301 },
  'Arlington': { lat: 32.7357, lng: -97.1081 },
  'New Orleans': { lat: 29.9511, lng: -90.0715 },
  'Bakersfield': { lat: 35.3733, lng: -119.0187 },
  'Tampa': { lat: 27.9506, lng: -82.4572 },
  'Aurora': { lat: 39.7294, lng: -104.8319 },
  'Anaheim': { lat: 33.8366, lng: -117.9143 },
  'Honolulu': { lat: 21.3069, lng: -157.8583 },
  'Santa Ana': { lat: 33.7455, lng: -117.8677 },
  'Riverside': { lat: 33.9533, lng: -117.3962 },
  'Corpus Christi': { lat: 27.8006, lng: -97.3964 },
  'Lexington': { lat: 38.0406, lng: -84.5037 },
  'Stockton': { lat: 37.9577, lng: -121.2908 },
  'St. Louis': { lat: 38.627, lng: -90.1994 },
  'Saint Paul': { lat: 44.9537, lng: -93.09 },
  'Henderson': { lat: 36.0395, lng: -114.9817 },
  'Pittsburgh': { lat: 40.4406, lng: -79.9959 },
  'Cincinnati': { lat: 39.1031, lng: -84.512 },
  'Anchorage': { lat: 61.2181, lng: -149.9003 },
  'Greensboro': { lat: 36.0726, lng: -79.792 },
  'Plano': { lat: 33.0198, lng: -96.6989 },
  'Newark': { lat: 40.7357, lng: -74.1724 },
  'Lincoln': { lat: 40.8136, lng: -96.7026 },
  'Orlando': { lat: 28.5383, lng: -81.3792 },
  'Irvine': { lat: 33.6846, lng: -117.8265 },
  'Toledo': { lat: 41.6528, lng: -83.5379 },
  'Jersey City': { lat: 40.7178, lng: -74.0431 },
  'Chula Vista': { lat: 32.6401, lng: -117.0842 },
  'Durham': { lat: 35.994, lng: -78.8986 },
  'Fort Wayne': { lat: 41.0793, lng: -85.1394 },
  'St. Petersburg': { lat: 27.7676, lng: -82.6403 },
  'Lubbock': { lat: 33.5779, lng: -101.8552 },
  'Madison': { lat: 43.0731, lng: -89.4012 },
  'Gilbert': { lat: 33.3528, lng: -111.789 },
  'Chandler': { lat: 33.3062, lng: -111.8413 },
  'Buffalo': { lat: 42.8864, lng: -78.8784 },
  'Reno': { lat: 39.5296, lng: -119.8138 },
  'Glendale': { lat: 33.5387, lng: -112.186 },
  'North Las Vegas': { lat: 36.1989, lng: -115.1175 },
  'Scottsdale': { lat: 33.4354, lng: -111.9268 },
  'Glen Burnie': { lat: 39.9583, lng: -76.9724 },
  'Irving': { lat: 32.814, lng: -96.9489 },
};

export function SalesMap({ data }: SalesMapProps) {
  const { filters, updateFilters } = useDashboard();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  // Aggregate data by city
  const mapData = useMemo(() => {
    const aggregation = new Map<string, MapDataPoint>();

    data.forEach((row) => {
      const city = row['City'];
      const key = `${city}-${row['State']}`;
      const existing = aggregation.get(key);

      if (existing) {
        existing.sales += Number(row['Sales']);
      } else {
        const coords = CITY_COORDINATES[city];
        if (coords) {
          aggregation.set(key, {
            city,
            state: row['State'],
            sales: Number(row['Sales']),
            latitude: coords.lat,
            longitude: coords.lng,
          });
        }
      }
    });

    return Array.from(aggregation.values());
  }, [data]);

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const containerWidth = svgRef.current.parentElement?.clientWidth || 600;
        setDimensions({ width: containerWidth, height: 400 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const margin = { top: 40, right: 20, bottom: 40, left: 60 };
  const chartWidth = dimensions.width - margin.left - margin.right;
  const chartHeight = dimensions.height - margin.top - margin.bottom;

  // Projection for US map
  const xScale = scaleLinear()
    .domain([-125, -66])
    .range([0, chartWidth]);

  const yScale = scaleLinear()
    .domain([24, 50])
    .range([chartHeight, 0]);

  const sizeScale = scaleSqrt()
    .domain([0, Math.max(...mapData.map((d) => d.sales))])
    .range([3, 25] as [number, number]);

  const colorScale = scaleLinear<string>()
    .domain([0, Math.max(...mapData.map((d) => d.sales))])
    .range(['#c6dbef', '#08306b']);

  const handleCircleClick = (city: string) => {
    if (filters.cityName === city) {
      updateFilters({ cityName: undefined });
    } else {
      updateFilters({ cityName: city });
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>Sales Map</h3>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible', backgroundColor: '#f5f5f5' }}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* US Map Outline (simplified) */}
          <path
            d="M 0 50 L 100 30 L 200 50 L 300 40 L 400 60 L 500 50 L 600 70 L 700 60 L 800 80 L 900 70 L 1000 90 L 1100 80 L 1200 100 L 1200 300 L 1100 320 L 1000 300 L 900 320 L 800 300 L 700 320 L 600 300 L 500 320 L 400 300 L 300 320 L 200 300 L 100 320 L 0 300 Z"
            fill="none"
            stroke="#ccc"
            strokeWidth={2}
          />

          {mapData.map((d) => (
            <circle
              key={`${d.city}-${d.state}`}
              cx={xScale(d.longitude)}
              cy={yScale(d.latitude)}
              r={sizeScale(d.sales)}
              fill={colorScale(d.sales)}
              stroke="#fff"
              strokeWidth={1}
              style={{
                cursor: 'pointer',
                opacity: filters.cityName && filters.cityName !== d.city ? 0.3 : 0.8,
                transition: 'opacity 0.2s',
              }}
              onClick={() => handleCircleClick(d.city)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
