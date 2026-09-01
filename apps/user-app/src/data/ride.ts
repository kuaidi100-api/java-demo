import { BOKEO_AIRPORT, SEZ_BOUNDS, SEZ_CENTER, SEZ_LANDMARKS, SEZ_LANDMARKS_IN_ZONE, type SezPoint } from './geo-sez';

export type RideLandmark = SezPoint;

export interface RideCar {
  id: string;
  lat: number;
  lng: number;
  heading: number;
}

export const RIDE_LANDMARKS: RideLandmark[] = SEZ_LANDMARKS;

export const RIDE_ZONE_LANDMARKS = SEZ_LANDMARKS_IN_ZONE;

export const SEED_CARS: RideCar[] = [
  { id: 'c1', lat: 20.3455, lng: 100.1042, heading: 40 },
  { id: 'c2', lat: 20.3442, lng: 100.1068, heading: 120 },
  { id: 'c3', lat: 20.3428, lng: 100.1051, heading: 210 },
  { id: 'c4', lat: 20.3460, lng: 100.1075, heading: 300 },
  { id: 'c5', lat: 20.3435, lng: 100.1035, heading: 75 },
];

export const RIDE_BOUNDS = {
  ...SEZ_BOUNDS,
  centerLat: SEZ_CENTER.lat,
  centerLng: SEZ_CENTER.lng,
};

export { BOKEO_AIRPORT, SEZ_CENTER };
