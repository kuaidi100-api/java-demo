/**
 * SEZ inbound logistics corridor + simple live waybill progress.
 * Coords follow OSM roads: 机场路 → 入城 → 天龙/湄公 → 大黄楼分拨 → 末派。
 */
import { BOKEO_AIRPORT, SEZ_LANDMARKS } from '../../data/geo-sez';

export type LngLat = [number, number]; // [lng, lat]

export interface RouteStop {
  id: string;
  name: string;
  lng: number;
  lat: number;
  kind: 'hub' | 'gate' | 'road' | 'dest';
}

export interface DeliveryTrack {
  waybillNo: string;
  status: string;
  statusCode: 'inbound' | 'sorting' | 'delivering' | 'delivered';
  /** 0–1 along full polyline */
  progress: number;
  currentStop: string;
  nextStop: string;
  etaMinutes: number;
  updatedAt: string;
  coordinates: LngLat[];
  stops: RouteStop[];
  destName: string;
}

/** 博胶机场 → 特区分拨干线（简易折线，贴合公开路网） */
export const SEZ_INBOUND_STOPS: RouteStop[] = [
  { id: 'airport', name: BOKEO_AIRPORT.name, lng: BOKEO_AIRPORT.lng, lat: BOKEO_AIRPORT.lat, kind: 'gate' },
  { id: 'air-road-e', name: '机场路东段', lng: 100.15655, lat: 20.31952, kind: 'road' },
  { id: 'air-road-m', name: '机场路', lng: 100.1452, lat: 20.3305, kind: 'road' },
  { id: 'air-road-in', name: '机场路入城', lng: 100.12907, lat: 20.33982, kind: 'road' },
  { id: 'east-link', name: '东门衔接', lng: 100.11907, lat: 20.33698, kind: 'road' },
  { id: 'tianlong-e', name: '天龙路东', lng: 100.11687, lat: 20.3457, kind: 'road' },
  { id: 'tianlong', name: '天龙路', lng: 100.10774, lat: 20.34139, kind: 'road' },
  { id: 'mekong-s', name: '湄公大道南', lng: 100.10515, lat: 20.3404, kind: 'road' },
  { id: 'mekong', name: '湄公大道', lng: 100.10357, lat: 20.34705, kind: 'road' },
  { id: 'chinatown', name: '唐人街', lng: 100.10313, lat: 20.3447, kind: 'road' },
  { id: 'hub', name: '大黄楼分拨中心', lng: 100.10523, lat: 20.34317, kind: 'hub' },
];

const DEST_OPTIONS = SEZ_LANDMARKS.filter((p) =>
  ['jinshuiwan', 'hotel', 'casino', 'boxiang', 'jinwan', 'friendship', 'port'].includes(p.id),
);

function stopToLngLat(s: RouteStop): LngLat {
  return [s.lng, s.lat];
}

export function buildCorridorTo(dest?: { name: string; lng: number; lat: number }): {
  coordinates: LngLat[];
  stops: RouteStop[];
} {
  const stops = [...SEZ_INBOUND_STOPS];
  if (dest) {
    stops.push({
      id: 'dest',
      name: dest.name,
      lng: dest.lng,
      lat: dest.lat,
      kind: 'dest',
    });
  }
  return { coordinates: stops.map(stopToLngLat), stops };
}

export function defaultCorridor(): { coordinates: LngLat[]; stops: RouteStop[] } {
  const dest = DEST_OPTIONS[0];
  return buildCorridorTo(dest ? { name: dest.name, lng: dest.lng, lat: dest.lat } : undefined);
}

function hashWaybill(no: string): number {
  let h = 0;
  for (let i = 0; i < no.length; i += 1) h = (h * 31 + no.charCodeAt(i)) >>> 0;
  return h;
}

function statusFromProgress(p: number): Pick<DeliveryTrack, 'status' | 'statusCode'> {
  if (p >= 0.98) return { status: '已签收', statusCode: 'delivered' };
  if (p >= 0.78) return { status: '特区末派中', statusCode: 'delivering' };
  if (p >= 0.62) return { status: '分拨中心分拣', statusCode: 'sorting' };
  return { status: '进境运输中', statusCode: 'inbound' };
}

export function pointAlong(coords: LngLat[], t: number): { lng: number; lat: number; bearing: number } {
  if (!coords.length) return { lng: 0, lat: 0, bearing: 0 };
  if (coords.length === 1) return { lng: coords[0][0], lat: coords[0][1], bearing: 0 };
  const clamped = Math.min(1, Math.max(0, t));
  const segLens: number[] = [];
  let total = 0;
  for (let i = 1; i < coords.length; i += 1) {
    const d = Math.hypot(coords[i][0] - coords[i - 1][0], coords[i][1] - coords[i - 1][1]);
    segLens.push(d);
    total += d;
  }
  if (total <= 0) return { lng: coords[0][0], lat: coords[0][1], bearing: 0 };
  let remain = clamped * total;
  for (let i = 0; i < segLens.length; i += 1) {
    const len = segLens[i];
    if (remain > len && i < segLens.length - 1) {
      remain -= len;
      continue;
    }
    const r = len > 0 ? remain / len : 0;
    const a = coords[i];
    const b = coords[i + 1];
    const lng = a[0] + (b[0] - a[0]) * r;
    const lat = a[1] + (b[1] - a[1]) * r;
    const bearing = (Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI;
    return { lng, lat, bearing };
  }
  const last = coords[coords.length - 1];
  return { lng: last[0], lat: last[1], bearing: 0 };
}

export function sliceTraveled(coords: LngLat[], t: number): LngLat[] {
  if (coords.length < 2) return coords.slice();
  const clamped = Math.min(1, Math.max(0, t));
  if (clamped <= 0) return [coords[0]];
  if (clamped >= 1) return coords.slice();
  const end = pointAlong(coords, clamped);
  // rebuild by walking
  const segLens: number[] = [];
  let total = 0;
  for (let i = 1; i < coords.length; i += 1) {
    const d = Math.hypot(coords[i][0] - coords[i - 1][0], coords[i][1] - coords[i - 1][1]);
    segLens.push(d);
    total += d;
  }
  let remain = clamped * total;
  const out: LngLat[] = [coords[0]];
  for (let i = 0; i < segLens.length; i += 1) {
    const len = segLens[i];
    if (remain >= len - 1e-12) {
      out.push(coords[i + 1]);
      remain -= len;
    } else {
      out.push([end.lng, end.lat]);
      break;
    }
  }
  return out;
}

function stopsAroundProgress(stops: RouteStop[], progress: number): { current: string; next: string } {
  if (!stops.length) return { current: '—', next: '—' };
  const idx = Math.min(stops.length - 1, Math.floor(progress * (stops.length - 1)));
  const current = stops[idx]?.name ?? '—';
  const next = stops[Math.min(stops.length - 1, idx + 1)]?.name ?? current;
  return { current, next };
}

/**
 * Resolve a waybill into an inbound SEZ track.
 * Uses VITE_RIDER_GPS_URL/logistics/track?no= when configured; else deterministic demo.
 */
export async function fetchDeliveryTrack(waybillNo: string, tick = 0): Promise<DeliveryTrack> {
  const no = waybillNo.trim() || 'KM-DEMO-SEZ';
  const base = (import.meta.env.VITE_RIDER_GPS_URL as string | undefined)?.replace(/\/$/, '') || '';
  if (base) {
    try {
      const res = await fetch(`${base}/logistics/track?no=${encodeURIComponent(no)}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const body = (await res.json()) as { data?: DeliveryTrack } | DeliveryTrack;
        const data = body && typeof body === 'object' && 'data' in body && body.data ? body.data : (body as DeliveryTrack);
        if (data?.coordinates?.length) return data;
      }
    } catch {
      /* fall through to demo */
    }
  }

  const h = hashWaybill(no);
  const dest = DEST_OPTIONS[h % DEST_OPTIONS.length] ?? DEST_OPTIONS[0];
  const { coordinates, stops } = buildCorridorTo(
    dest ? { name: dest.name, lng: dest.lng, lat: dest.lat } : undefined,
  );
  // Live-ish progress: base from waybill + slow advance with tick
  const baseProgress = 0.28 + (h % 45) / 100;
  const progress = Math.min(0.97, baseProgress + (tick % 80) * 0.0045);
  const { status, statusCode } = statusFromProgress(progress);
  const { current, next } = stopsAroundProgress(stops, progress);
  return {
    waybillNo: no,
    status,
    statusCode,
    progress,
    currentStop: current,
    nextStop: next,
    etaMinutes: Math.max(3, Math.round((1 - progress) * 55)),
    updatedAt: new Date().toISOString(),
    coordinates,
    stops,
    destName: dest?.name || '特区末端',
  };
}

/** Preview corridor without a waybill (always visible trunk line). */
export function previewInboundRoute(): DeliveryTrack {
  const { coordinates, stops } = defaultCorridor();
  return {
    waybillNo: '',
    status: '特区进境配送干线',
    statusCode: 'inbound',
    progress: 0,
    currentStop: stops[0]?.name || '',
    nextStop: stops[1]?.name || '',
    etaMinutes: 0,
    updatedAt: new Date().toISOString(),
    coordinates,
    stops,
    destName: stops[stops.length - 1]?.name || '',
  };
}
