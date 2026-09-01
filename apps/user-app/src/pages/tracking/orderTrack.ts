/**
 * 订单物流查询：云南 → 金三角经济特区星光夜市二期木棉快递 → 派送到用户家
 * 跨境干线途中、到站、末派均可查询。
 */
export type LngLat = [number, number];

export interface TrackEvent {
  time: string;
  text: string;
  done: boolean;
}

export interface OrderTrackStop {
  id: string;
  name: string;
  lng: number;
  lat: number;
  kind: 'origin' | 'transit' | 'hub' | 'dest';
}

export type OrderPhase = 'yunnan' | 'crossing' | 'hub' | 'delivering' | 'delivered';

export interface OrderTrack {
  waybillNo: string;
  status: string;
  phase: OrderPhase;
  progress: number;
  currentStop: string;
  nextStop: string;
  etaMinutes: number;
  hubName: string;
  destName: string;
  coordinates: LngLat[];
  stops: OrderTrackStop[];
  events: TrackEvent[];
  updatedAt: string;
}

/** 木棉快递网点（星光夜市二期） */
export const KAPOK_HUB: OrderTrackStop = {
  id: 'kapok-hub',
  name: '金三角经济特区星光夜市二期木棉快递',
  lng: 100.1038,
  lat: 20.3445,
  kind: 'hub',
};

/** 云南 → 口岸 → 木棉快递 → 用户家（简易折线） */
export const ORDER_TRACK_STOPS: OrderTrackStop[] = [
  { id: 'yn-hub', name: '云南勐腊集散中心', lng: 101.568, lat: 21.482, kind: 'origin' },
  { id: 'yn-mohan', name: '云南磨憨口岸', lng: 101.684, lat: 21.183, kind: 'transit' },
  { id: 'boten', name: '老挝磨丁口岸', lng: 101.655, lat: 21.165, kind: 'transit' },
  { id: 'route-n', name: '北线运输中', lng: 100.72, lat: 20.78, kind: 'transit' },
  { id: 'bokeo', name: '博胶省转运', lng: 100.32, lat: 20.48, kind: 'transit' },
  { id: 'port', name: '金三角国际口岸', lng: 100.08705, lat: 20.35471, kind: 'transit' },
  { id: 'mekong', name: '湄公大道入城', lng: 100.10357, lat: 20.34705, kind: 'transit' },
  KAPOK_HUB,
];

const HOME_POOL = [
  { name: '用户地址 · 金水湾小区', lng: 100.10612, lat: 20.3412 },
  { name: '用户地址 · 唐人街附近', lng: 100.10313, lat: 20.3447 },
  { name: '用户地址 · 中老友谊街', lng: 100.1012, lat: 20.34491 },
  { name: '用户地址 · 木棉大道旁', lng: 100.0945, lat: 20.3452 },
];

function hash(no: string): number {
  let h = 0;
  for (let i = 0; i < no.length; i += 1) h = (h * 31 + no.charCodeAt(i)) >>> 0;
  return h;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatTime(base: Date, offsetMin: number): string {
  const d = new Date(base.getTime() + offsetMin * 60_000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
    return {
      lng: a[0] + (b[0] - a[0]) * r,
      lat: a[1] + (b[1] - a[1]) * r,
      bearing: (Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI,
    };
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

function phaseOf(progress: number): { phase: OrderPhase; status: string } {
  if (progress >= 0.98) return { phase: 'delivered', status: '已签收' };
  if (progress >= 0.82) return { phase: 'delivering', status: '木棉快递派送中' };
  if (progress >= 0.72) return { phase: 'hub', status: '已到达星光夜市二期木棉快递' };
  if (progress >= 0.28) return { phase: 'crossing', status: '云南→金三角跨境运输中' };
  return { phase: 'yunnan', status: '云南集散发出' };
}

function buildEvents(
  no: string,
  progress: number,
  destName: string,
  now: Date,
): TrackEvent[] {
  const steps: Array<{ at: number; offset: number; text: string }> = [
    { at: 0.05, offset: -2160, text: `【云南勐腊】快件已揽收，单号 ${no}` },
    { at: 0.15, offset: -1800, text: '【云南磨憨口岸】快件已报关出口' },
    { at: 0.28, offset: -1440, text: '【磨丁口岸】快件已入境老挝，发往博胶' },
    { at: 0.45, offset: -960, text: '【博胶省】干线运输中，预计抵达金三角经济特区' },
    { at: 0.62, offset: -420, text: '【金三角国际口岸】快件已入特区查验' },
    { at: 0.72, offset: -180, text: '【星光夜市二期木棉快递】快件已入库，准备派送' },
    { at: 0.82, offset: -60, text: `【派送中】快递员正在送往 ${destName}` },
    { at: 0.98, offset: 0, text: `【已签收】快件已送达 ${destName}` },
  ];
  return steps.map((s) => ({
    time: formatTime(now, s.offset),
    text: s.text,
    done: progress >= s.at,
  })).reverse();
}

/**
 * 查询订单物流（演示：按单号确定性进度；可接 VITE_RIDER_GPS_URL/orders/track）
 */
export async function fetchOrderTrack(waybillNo: string, tick = 0): Promise<OrderTrack> {
  const no = waybillNo.trim() || 'KM-SEZ-DEMO';
  const base = (import.meta.env.VITE_RIDER_GPS_URL as string | undefined)?.replace(/\/$/, '') || '';
  if (base) {
    try {
      const res = await fetch(`${base}/orders/track?no=${encodeURIComponent(no)}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const body = (await res.json()) as { data?: OrderTrack } | OrderTrack;
        const data = body && typeof body === 'object' && 'data' in body && body.data
          ? body.data
          : (body as OrderTrack);
        if (data?.coordinates?.length) return data;
      }
    } catch {
      /* demo fallback */
    }
  }

  const h = hash(no);
  const home = HOME_POOL[h % HOME_POOL.length];
  const stops: OrderTrackStop[] = [
    ...ORDER_TRACK_STOPS,
    {
      id: 'home',
      name: home.name,
      lng: home.lng,
      lat: home.lat,
      kind: 'dest',
    },
  ];
  const coordinates = stops.map((s) => [s.lng, s.lat] as LngLat);

  // 跨境段约占 0~0.72，末派 0.72~1；tick 缓慢推进便于「实时」观感
  const baseProgress = 0.18 + (h % 70) / 100;
  const progress = Math.min(0.97, baseProgress + (tick % 60) * 0.0038);
  const { phase, status } = phaseOf(progress);
  const idx = Math.min(stops.length - 1, Math.floor(progress * (stops.length - 1)));
  const currentStop = stops[idx]?.name ?? '';
  const nextStop = stops[Math.min(stops.length - 1, idx + 1)]?.name ?? currentStop;
  const now = new Date();

  return {
    waybillNo: no,
    status,
    phase,
    progress,
    currentStop,
    nextStop,
    etaMinutes: Math.max(8, Math.round((1 - progress) * 320)),
    hubName: KAPOK_HUB.name,
    destName: home.name,
    coordinates,
    stops,
    events: buildEvents(no, progress, home.name, now),
    updatedAt: now.toISOString(),
  };
}
