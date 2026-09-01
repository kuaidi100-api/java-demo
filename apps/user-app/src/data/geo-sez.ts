/** 金三角经济特区（老挝博胶省通佩县）统一地理锚点 */

export interface SezPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

/** Google Earth Placemark ID（配送范围面） */
export const SEZ_MAP_ID = '0B2FBE3649419314B50B';

/**
 * 官方配送范围外环（KML Placemark 0B2FBE3649419314B50B）
 * 仅表示服务区，不是建筑轮廓。
 */
export const SEZ_SERVICE_RING: Array<[number, number]> = [
  [100.1527514569086, 20.28524340656723],
  [100.1808035291631, 20.34040320884711],
  [100.1151458134463, 20.40667826634942],
  [100.0934349107348, 20.38203521528422],
  [100.0817935837889, 20.3595561041063],
  [100.0872177242839, 20.29084279003852],
  [100.0943962829306, 20.25580789625191],
  [100.1527514569086, 20.28524340656723],
];

/** 配送区外包矩形（由服务多边形计算，用于越界校验） */
export const SEZ_SERVICE_BOUNDS = {
  minLat: 20.25580789625191,
  maxLat: 20.40667826634942,
  minLng: 100.0817935837889,
  maxLng: 100.1808035291631,
};

/** 城区核心（白模 / 选点 / 叫车默认中心） */
export const SEZ_CENTER = { lat: 20.3448, lng: 100.1052 };
export const SEZ_CORE = SEZ_CENTER;

/** 城区可视范围（约 3–4 km，含口岸西侧与河岸路名） */
export const SEZ_BOUNDS = {
  minLat: 20.330,
  maxLat: 20.360,
  minLng: 100.084,
  maxLng: 100.125,
};

/** 含博胶国际机场的扩展范围（叫车接机用） */
export const SEZ_WIDE_BOUNDS = {
  minLat: 20.318,
  maxLat: 20.360,
  minLng: 100.090,
  maxLng: 100.175,
};

/** 博胶国际机场 BOR / VLBK */
export const BOKEO_AIRPORT: SezPoint = {
  id: 'airport',
  name: '博胶国际机场',
  lat: 20.324,
  lng: 100.1654,
};

/**
 * 特区常用点位：与航拍图 OSM 路名 / 建筑名对齐（可作叫车快捷标签）。
 */
export const SEZ_LANDMARKS: SezPoint[] = [
  { id: 'mekong', name: '湄公大道', lat: 20.34705, lng: 100.10357 },
  { id: 'chinatown', name: '唐人街', lat: 20.3447, lng: 100.10313 },
  { id: 'huanglou', name: '大黄楼', lat: 20.34317, lng: 100.10523 },
  { id: 'friendship', name: '中老友谊街', lat: 20.34491, lng: 100.1012 },
  { id: 'jinwan', name: '金万大厦', lat: 20.34528, lng: 100.10146 },
  { id: 'boxiang', name: '博翔综合体', lat: 20.34472, lng: 100.09813 },
  { id: 'kapok-ave', name: '木棉大道', lat: 20.34581, lng: 100.09242 },
  { id: 'hotel', name: '木棉之星酒店', lat: 20.34124, lng: 100.09779 },
  { id: 'casino', name: '娱乐场', lat: 20.33986, lng: 100.09727 },
  { id: 'tianlong', name: '天龙路', lat: 20.34139, lng: 100.10774 },
  { id: 'jinshuiwan', name: '金水湾商业', lat: 20.3412, lng: 100.10612 },
  { id: 'port', name: '金三角国际口岸', lat: 20.35471, lng: 100.08705 },
  BOKEO_AIRPORT,
];

export const SEZ_LANDMARKS_IN_ZONE = SEZ_LANDMARKS.filter((p) => p.id !== 'airport');

/** 射线法：点是否在 KML 配送多边形内 */
export function pointInSezServiceArea(lat: number, lng: number): boolean {
  const ring = SEZ_SERVICE_RING;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function clampToSez(lat: number, lng: number, wide = false): { lat: number; lng: number } {
  const b = wide ? SEZ_WIDE_BOUNDS : SEZ_BOUNDS;
  return {
    lat: Math.min(b.maxLat, Math.max(b.minLat, lat)),
    lng: Math.min(b.maxLng, Math.max(b.minLng, lng)),
  };
}

export function nearestSezName(lat: number, lng: number): string {
  let best = '金三角经济特区';
  let dist = 0.008;
  for (const item of SEZ_LANDMARKS) {
    const d = Math.hypot(item.lat - lat, item.lng - lng);
    if (d < dist) {
      dist = d;
      best = item.name;
    }
  }
  return best;
}
