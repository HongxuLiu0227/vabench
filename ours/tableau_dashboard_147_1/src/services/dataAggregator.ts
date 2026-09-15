import type { TripData, StationAggregation } from '../types/tripData';

export interface StationCount {
  stationName: string;
  count: number;
}

export function aggregateByStation(
  data: TripData[],
  stationNameKey: 'startStationName' | 'endStationName' = 'endStationName'
): StationCount[] {
  const stationMap = new Map<string, number>();

  data.forEach(trip => {
    const stationName = trip[stationNameKey];
    if (stationName) {
      stationMap.set(stationName, (stationMap.get(stationName) || 0) + 1);
    }
  });

  const result: StationCount[] = Array.from(stationMap.entries()).map(
    ([stationName, count]) => ({
      stationName,
      count,
    })
  );

  return result;
}

export function aggregateEndStations(
  data: TripData[]
): StationAggregation[] {
  const stationMap = new Map<string, { count: number; latitude: number; longitude: number }>();

  data.forEach(trip => {
    const stationName = trip.endStationName;
    if (stationName && trip.endStationLatitude !== 0 && trip.endStationLongitude !== 0) {
      const existing = stationMap.get(stationName);
      if (existing) {
        existing.count += 1;
      } else {
        stationMap.set(stationName, {
          count: 1,
          latitude: trip.endStationLatitude,
          longitude: trip.endStationLongitude,
        });
      }
    }
  });

  const result: StationAggregation[] = Array.from(stationMap.entries()).map(
    ([stationName, { count, latitude, longitude }]) => ({
      stationName,
      count,
      latitude,
      longitude,
    })
  );

  return result;
}

export function getTopNStations(data: StationCount[], n: number): StationCount[] {
  return [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export function getBottomNStations(data: StationCount[], n: number): StationCount[] {
  return [...data]
    .sort((a, b) => a.count - b.count)
    .slice(0, n);
}

export function filterDataByStation(
  data: TripData[],
  stationName: string | null,
  stationType: 'start' | 'end' = 'end'
): TripData[] {
  if (!stationName) {
    return data;
  }

  const field = stationType === 'start' ? 'startStationName' : 'endStationName';

  return data.filter(trip => trip[field] === stationName);
}
