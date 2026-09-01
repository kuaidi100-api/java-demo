/**
 * Rider GPS adapter — keeps lng/lat, ready for backend heartbeat/list APIs.
 * When VITE_RIDER_GPS_URL is unset, falls back to local demo positions.
 */
import { SEED_CARS } from '../../data/ride';
import type { MapMarkerInput } from './geo';

export interface RiderGpsPoint {
  id: string;
  lng: number;
  lat: number;
  heading?: number;
  label?: string;
  updatedAt?: string;
}

export interface OrderMapPoint {
  id: string;
  lng: number;
  lat: number;
  label?: string;
  status?: string;
}

const gpsBase = (import.meta.env.VITE_RIDER_GPS_URL as string | undefined)?.replace(/\/$/, '') || '';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`GPS ${res.status}`);
  const body = (await res.json()) as { data?: T } | T;
  if (body && typeof body === 'object' && 'data' in body && (body as { data?: T }).data !== undefined) {
    return (body as { data: T }).data;
  }
  return body as T;
}

function demoRiders(tick = 0): RiderGpsPoint[] {
  return SEED_CARS.map((c, i) => {
    const t = tick * 0.015 + i;
    return {
      id: c.id,
      lng: c.lng + Math.cos(t) * 0.00018,
      lat: c.lat + Math.sin(t * 0.9) * 0.00014,
      heading: (c.heading + tick * 3 + i * 20) % 360,
      label: `骑手 ${i + 1}`,
      updatedAt: new Date().toISOString(),
    };
  });
}

function demoOrders(): OrderMapPoint[] {
  return [
    { id: 'o1', lng: 100.1056, lat: 20.3438, label: '闪送 #1021', status: 'picking' },
    { id: 'o2', lng: 100.1072, lat: 20.3416, label: '快递 #884', status: 'delivering' },
    { id: 'o3', lng: 100.1024, lat: 20.3424, label: '代买 #553', status: 'pending' },
  ];
}

/** List active rider GPS; backend expected: GET → { data: RiderGpsPoint[] } or RiderGpsPoint[] */
export async function fetchRiderPositions(tick = 0): Promise<RiderGpsPoint[]> {
  if (!gpsBase) return demoRiders(tick);
  try {
    return await fetchJson<RiderGpsPoint[]>(`${gpsBase}/riders/locations`);
  } catch {
    return demoRiders(tick);
  }
}

/** Optional order pins; backend expected: GET → OrderMapPoint[] */
export async function fetchOrderPositions(): Promise<OrderMapPoint[]> {
  if (!gpsBase) return demoOrders();
  try {
    return await fetchJson<OrderMapPoint[]>(`${gpsBase}/orders/map-pins`);
  } catch {
    return demoOrders();
  }
}

export function toMarkers(
  riders: RiderGpsPoint[],
  orders: OrderMapPoint[],
): MapMarkerInput[] {
  return [
    ...riders.map((r) => ({
      id: `rider-${r.id}`,
      lng: r.lng,
      lat: r.lat,
      kind: 'rider' as const,
      label: r.label || r.id,
      heading: r.heading,
    })),
    ...orders.map((o) => ({
      id: `order-${o.id}`,
      lng: o.lng,
      lat: o.lat,
      kind: 'order' as const,
      label: o.label || o.id,
      status: o.status,
    })),
  ];
}
