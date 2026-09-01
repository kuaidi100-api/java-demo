/**
 * Rebuild SEZ buildings + named roads GeoJSON from Overpass `out tags geom`.
 */
const fs = require('fs');
const path = require('path');

const cache = path.join(__dirname, '../.cache/osm');
const geoDir = path.join(__dirname, '../apps/user-app/src/static/geo');

const SERVICE_RING = [
  [100.1527514569086, 20.28524340656723],
  [100.1808035291631, 20.34040320884711],
  [100.1151458134463, 20.40667826634942],
  [100.0934349107348, 20.38203521528422],
  [100.0817935837889, 20.3595561041063],
  [100.0872177242839, 20.29084279003852],
  [100.0943962829306, 20.25580789625191],
  [100.1527514569086, 20.28524340656723],
];

function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function centroid(ring) {
  let x = 0;
  let y = 0;
  const n = Math.max(ring.length - (ringClosed(ring) ? 1 : 0), 1);
  for (let i = 0; i < n; i += 1) {
    x += ring[i][0];
    y += ring[i][1];
  }
  return [x / n, y / n];
}

function ringClosed(ring) {
  if (ring.length < 2) return false;
  const a = ring[0];
  const b = ring[ring.length - 1];
  return a[0] === b[0] && a[1] === b[1];
}

function closeRing(ring) {
  if (!ring.length) return ring;
  if (!ringClosed(ring)) ring.push([ring[0][0], ring[0][1]]);
  return ring;
}

function geomToRing(el) {
  if (!el.geometry || !el.geometry.length) return null;
  const ring = el.geometry.map((p) => [p.lon, p.lat]);
  return closeRing(ring);
}

function pickName(tags = {}) {
  const candidates = [
    tags['name:zh'],
    tags['name:zh-Hans'],
    tags['name:zh-Hant'],
    tags.name,
    tags['name:en'],
    tags['name:lo'],
    tags.brand,
    tags.operator,
    tags['addr:housename'],
  ].filter(Boolean);
  if (candidates.length) return String(candidates[0]);

  // derive from amenity/shop/tourism
  const kind =
    tags.amenity ||
    tags.shop ||
    tags.tourism ||
    tags.leisure ||
    tags.office ||
    tags.building;
  if (kind && kind !== 'yes') {
    const map = {
      hotel: '酒店',
      restaurant: '餐厅',
      cafe: '咖啡',
      marketplace: '市场',
      supermarket: '超市',
      mall: '商场',
      bank: '银行',
      hospital: '医院',
      clinic: '诊所',
      school: '学校',
      college: '学院',
      university: '大学',
      place_of_worship: '宗教场所',
      temple: '寺庙',
      casino: '娱乐场',
      apartments: '公寓',
      commercial: '商业楼',
      retail: '商铺',
      warehouse: '仓库',
      industrial: '工业楼',
      office: '办公楼',
      residential: '住宅',
    };
    return map[kind] || null;
  }
  return null;
}

function parseHeight(tags = {}) {
  const hRaw = tags.height || tags['building:height'];
  if (hRaw) {
    const m = String(hRaw).match(/([\d.]+)/);
    if (m) {
      const h = Number(m[1]);
      if (Number.isFinite(h) && h > 1 && h < 300) return h;
    }
  }
  const levels = Number(tags['building:levels'] || tags.levels);
  if (Number.isFinite(levels) && levels > 0) return Math.min(levels * 3.2, 120);
  const kind = String(tags.building || '').toLowerCase();
  if (['hotel', 'office'].includes(kind)) return 24;
  if (['apartments', 'residential'].includes(kind)) return 14;
  if (['commercial', 'retail', 'industrial', 'warehouse'].includes(kind)) return 10;
  return 9;
}

function loadJson(name) {
  return JSON.parse(fs.readFileSync(path.join(cache, name), 'utf8'));
}

const buildingsOsm = loadJson('buildings-geom.json');
const roadsOsm = loadJson('roads-named.json');

const buildingFeatures = [];
for (const el of buildingsOsm.elements || []) {
  if (el.type !== 'way') continue;
  const ring = geomToRing(el);
  if (!ring || ring.length < 4) continue;
  const [lng, lat] = centroid(ring);
  if (!pointInRing(lng, lat, SERVICE_RING)) continue;
  const tags = el.tags || {};
  const label = pickName(tags);
  const height = parseHeight(tags);
  buildingFeatures.push({
    type: 'Feature',
    id: `osm-way-${el.id}`,
    properties: {
      id: `osm-way-${el.id}`,
      osmId: el.id,
      name: label || '',
      label: label || '',
      height,
      levels: Number(tags['building:levels']) || Math.max(1, Math.round(height / 3.2)),
      kind: 'building',
      building: tags.building || 'yes',
      source: 'OpenStreetMap',
    },
    geometry: { type: 'Polygon', coordinates: [ring] },
  });
}

const roadFeatures = [];
for (const el of roadsOsm.elements || []) {
  if (el.type !== 'way') continue;
  const tags = el.tags || {};
  const name = pickName(tags);
  if (!name) continue;
  if (!el.geometry || el.geometry.length < 2) continue;
  const coords = el.geometry.map((p) => [p.lon, p.lat]);
  const mid = coords[Math.floor(coords.length / 2)];
  if (!pointInRing(mid[0], mid[1], SERVICE_RING)) continue;
  roadFeatures.push({
    type: 'Feature',
    id: `osm-road-${el.id}`,
    properties: {
      id: `osm-road-${el.id}`,
      name,
      label: name,
      highway: tags.highway || 'residential',
      kind: 'road',
      source: 'OpenStreetMap',
    },
    geometry: { type: 'LineString', coordinates: coords },
  });
}

const buildingsOut = {
  type: 'FeatureCollection',
  name: 'sez-buildings',
  properties: { mapId: '0B2FBE3649419314B50B', source: 'OSM' },
  features: buildingFeatures,
};
const roadsOut = {
  type: 'FeatureCollection',
  name: 'sez-roads',
  properties: { mapId: '0B2FBE3649419314B50B', source: 'OSM named highways' },
  features: roadFeatures,
};

fs.writeFileSync(path.join(geoDir, 'sez-buildings.geojson'), JSON.stringify(buildingsOut));
fs.writeFileSync(path.join(geoDir, 'sez-roads.geojson'), JSON.stringify(roadsOut));

const namedBuildings = buildingFeatures.filter((f) => f.properties.name).length;
console.log(
  JSON.stringify(
    {
      buildings: buildingFeatures.length,
      namedBuildings,
      roads: roadFeatures.length,
      sampleBuildings: buildingFeatures.filter((f) => f.properties.name).slice(0, 12).map((f) => f.properties.name),
      sampleRoads: roadFeatures.slice(0, 12).map((f) => f.properties.name),
    },
    null,
    2,
  ),
);
