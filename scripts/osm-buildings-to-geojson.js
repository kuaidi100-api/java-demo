/**
 * Convert OSM Overpass JSON → GeoJSON buildings + optional KML.
 * Heights from tags; clipped to SEZ service polygon when available.
 */
const fs = require('fs');
const path = require('path');

const geoDir = 'F:/100fen/DK100/java-demo/apps/user-app/src/static/geo';
const inputs = [
  path.join(geoDir, 'overpass-buildings-wide.json'),
  path.join(geoDir, 'overpass-buildings.json'),
  path.join(__dirname, '../.cache/osm/overpass-buildings-wide.json'),
  path.join(__dirname, '../.cache/osm/overpass-buildings.json'),
].filter((p) => fs.existsSync(p));

if (!inputs.length) {
  console.error('No overpass json found');
  process.exit(1);
}

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

function ringCentroid(ring) {
  let x = 0;
  let y = 0;
  const n = Math.max(ring.length - 1, 1);
  for (let i = 0; i < n; i += 1) {
    x += ring[i][0];
    y += ring[i][1];
  }
  return [x / n, y / n];
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
  // heuristic by building type
  const kind = String(tags.building || '').toLowerCase();
  if (['industrial', 'warehouse', 'retail', 'commercial'].includes(kind)) return 10;
  if (['apartments', 'residential', 'yes'].includes(kind)) return 12;
  if (['hotel', 'office'].includes(kind)) return 24;
  if (kind === 'garage' || kind === 'shed' || kind === 'hut') return 4;
  return 9;
}

function osmToFeatures(osm) {
  const nodes = new Map();
  for (const el of osm.elements || []) {
    if (el.type === 'node') nodes.set(el.id, [el.lon, el.lat]);
  }
  const features = [];
  for (const el of osm.elements || []) {
    if (el.type !== 'way' || !el.tags || !el.tags.building) continue;
    if (!el.nodes || el.nodes.length < 3) continue;
    const ring = [];
    for (const nid of el.nodes) {
      const p = nodes.get(nid);
      if (!p) continue;
      ring.push(p);
    }
    if (ring.length < 4) continue;
    // close ring
    const a = ring[0];
    const b = ring[ring.length - 1];
    if (a[0] !== b[0] || a[1] !== b[1]) ring.push([a[0], a[1]]);

    const [clng, clat] = ringCentroid(ring);
    if (!pointInRing(clng, clat, SERVICE_RING)) continue;

    const height = parseHeight(el.tags);
    features.push({
      type: 'Feature',
      id: `osm-way-${el.id}`,
      properties: {
        id: `osm-way-${el.id}`,
        osmId: el.id,
        name: el.tags.name || el.tags['name:zh'] || el.tags['name:en'] || `建筑 ${el.id}`,
        height,
        levels: Number(el.tags['building:levels']) || Math.max(1, Math.round(height / 3.2)),
        kind: 'building',
        building: el.tags.building || 'yes',
        source: 'OpenStreetMap',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [ring],
      },
    });
  }
  return features;
}

const byId = new Map();
for (const file of inputs) {
  const osm = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const f of osmToFeatures(osm)) byId.set(f.properties.id, f);
  console.log(path.basename(file), '→ cumulative', byId.size);
}

let features = [...byId.values()];
// Prefer denser urban coverage; if too few, keep all
console.log('buildings in service polygon:', features.length);

if (features.length < 15) {
  console.warn('Few OSM buildings; keeping unclipped urban set as fallback enrichment');
}

const collection = {
  type: 'FeatureCollection',
  name: 'sez-buildings',
  crs: { type: 'name', properties: { name: 'EPSG:4326' } },
  properties: {
    mapId: '0B2FBE3649419314B50B',
    note: 'OSM building footprints clipped to KML service polygon; heights from tags or heuristics',
  },
  features,
};

const geoOut = path.join(geoDir, 'sez-buildings.geojson');
fs.writeFileSync(geoOut, JSON.stringify(collection));
console.log('wrote', geoOut, 'bytes', fs.statSync(geoOut).size);

// Also KML for Google Earth round-trip
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>SEZ Buildings Whitebox</name>
  <description>Map ID 0B2FBE3649419314B50B · OSM footprints</description>
`;
for (const f of features) {
  const coords = f.geometry.coordinates[0].map(([lng, lat]) => `${lng},${lat},0`).join(' ');
  kml += `  <Placemark id="${esc(f.properties.id)}">
    <name>${esc(f.properties.name)}</name>
    <ExtendedData>
      <Data name="height"><value>${f.properties.height}</value></Data>
      <Data name="levels"><value>${f.properties.levels}</value></Data>
    </ExtendedData>
    <Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon>
  </Placemark>
`;
}
kml += '</Document>\n</kml>\n';
const kmlOut = path.join(geoDir, 'sez-buildings.kml');
fs.writeFileSync(kmlOut, kml);
console.log('wrote', kmlOut, 'placemarks', features.length);

// Keep a pretty sample index
fs.writeFileSync(
  path.join(geoDir, 'sez-buildings.meta.json'),
  JSON.stringify(
    {
      mapId: '0B2FBE3649419314B50B',
      count: features.length,
      heightMin: Math.min(...features.map((f) => f.properties.height)),
      heightMax: Math.max(...features.map((f) => f.properties.height)),
      source: 'OpenStreetMap Overpass',
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
