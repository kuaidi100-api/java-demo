const fs = require('fs');
const path = require('path');
const out = 'F:/100fen/DK100/java-demo/apps/user-app/src/static/geo';
fs.mkdirSync(out, { recursive: true });

function rect(lng, lat, wDeg, hDeg) {
  const hw = wDeg / 2;
  const hh = hDeg / 2;
  return [[
    [lng - hw, lat - hh],
    [lng + hw, lat - hh],
    [lng + hw, lat + hh],
    [lng - hw, lat + hh],
    [lng - hw, lat - hh],
  ]];
}

const buildingSeeds = [
  { id: 'b-gate', name: '正门综合楼', lng: 100.1038, lat: 20.3461, w: 0.00035, h: 0.00022, height: 18 },
  { id: 'b-street-a', name: '商业街A栋', lng: 100.1056, lat: 20.3438, w: 0.00055, h: 0.00018, height: 24 },
  { id: 'b-street-b', name: '商业街B栋', lng: 100.1059, lat: 20.3442, w: 0.0004, h: 0.00016, height: 20 },
  { id: 'b-dongpeng', name: '东鹏国际', lng: 100.1072, lat: 20.3416, w: 0.0006, h: 0.00035, height: 42 },
  { id: 'b-market', name: '万鹏市场', lng: 100.1024, lat: 20.3424, w: 0.0007, h: 0.0004, height: 12 },
  { id: 'b-hotel', name: '酒店区主楼', lng: 100.1086, lat: 20.3452, w: 0.00045, h: 0.0003, height: 48 },
  { id: 'b-casino', name: '娱乐中心', lng: 100.1064, lat: 20.3408, w: 0.00065, h: 0.0004, height: 36 },
  { id: 'b-warehouse', name: '物流仓', lng: 100.1012, lat: 20.3455, w: 0.0008, h: 0.00035, height: 10 },
  { id: 'b-apt1', name: '公寓1', lng: 100.1045, lat: 20.3472, w: 0.00028, h: 0.00022, height: 28 },
  { id: 'b-apt2', name: '公寓2', lng: 100.1068, lat: 20.3470, w: 0.0003, h: 0.00024, height: 30 },
  { id: 'b-office', name: '管委会', lng: 100.1032, lat: 20.3440, w: 0.0004, h: 0.00028, height: 22 },
  { id: 'b-clinic', name: '医疗站', lng: 100.1078, lat: 20.3430, w: 0.00032, h: 0.0002, height: 14 },
];

for (let i = 0; i < 28; i += 1) {
  const col = i % 7;
  const row = Math.floor(i / 7);
  const lng = 100.1030 + col * 0.00055 + (row % 2) * 0.00012;
  const lat = 20.3410 + row * 0.00085;
  const height = 8 + ((i * 7) % 5) * 4 + (i % 3) * 2;
  buildingSeeds.push({
    id: `b-block-${i}`,
    name: `街区楼宇${i + 1}`,
    lng,
    lat,
    w: 0.00022 + (i % 4) * 0.00004,
    h: 0.00016 + (i % 3) * 0.00003,
    height,
  });
}

const buildings = {
  type: 'FeatureCollection',
  name: 'sez-buildings',
  crs: { type: 'name', properties: { name: 'EPSG:4326' } },
  features: buildingSeeds.map((b) => ({
    type: 'Feature',
    properties: {
      id: b.id,
      name: b.name,
      height: b.height,
      levels: Math.max(1, Math.round(b.height / 3.2)),
      kind: 'building',
    },
    geometry: { type: 'Polygon', coordinates: rect(b.lng, b.lat, b.w, b.h) },
  })),
};

const roads = {
  type: 'FeatureCollection',
  name: 'sez-roads',
  features: [
    {
      type: 'Feature',
      properties: { id: 'r-main', name: '友谊主街', width: 12, kind: 'primary' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [100.1005, 20.3485], [100.1025, 20.3472], [100.1040, 20.3460],
          [100.1056, 20.3445], [100.1070, 20.3430], [100.1088, 20.3415], [100.1105, 20.3400],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'r-ring', name: '环区路', width: 9, kind: 'secondary' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [100.1010, 20.3468], [100.1035, 20.3488], [100.1075, 20.3482],
          [100.1100, 20.3455], [100.1095, 20.3418], [100.1060, 20.3395],
          [100.1020, 20.3405], [100.1008, 20.3435], [100.1010, 20.3468],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'r-market', name: '市场路', width: 7, kind: 'local' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [100.1015, 20.3435], [100.1028, 20.3428], [100.1045, 20.3422],
          [100.1062, 20.3418], [100.1080, 20.3412],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'r-hotel', name: '酒店支路', width: 6, kind: 'local' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [100.1065, 20.3465], [100.1078, 20.3458], [100.1088, 20.3450], [100.1095, 20.3438],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'r-cross1', name: '横一路', width: 6, kind: 'local' },
      geometry: {
        type: 'LineString',
        coordinates: [[100.1020, 20.3455], [100.1045, 20.3452], [100.1070, 20.3448], [100.1090, 20.3445]],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'r-cross2', name: '横二路', width: 6, kind: 'local' },
      geometry: {
        type: 'LineString',
        coordinates: [[100.1018, 20.3430], [100.1040, 20.3428], [100.1065, 20.3425], [100.1088, 20.3420]],
      },
    },
  ],
};

const water = {
  type: 'FeatureCollection',
  name: 'sez-water-mekong',
  features: [
    {
      type: 'Feature',
      properties: { id: 'mekong-main', name: '湄公河', kind: 'river' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [100.0920, 20.3580], [100.0985, 20.3565], [100.1010, 20.3520],
          [100.1005, 20.3480], [100.0990, 20.3430], [100.0975, 20.3380],
          [100.0955, 20.3330], [100.0925, 20.3320], [100.0905, 20.3360],
          [100.0900, 20.3420], [100.0908, 20.3500], [100.0920, 20.3580],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'canal-1', name: '内河水道', kind: 'canal' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [100.1008, 20.3475], [100.1018, 20.3472], [100.1022, 20.3440],
          [100.1016, 20.3410], [100.1006, 20.3412], [100.1002, 20.3442],
          [100.1008, 20.3475],
        ]],
      },
    },
  ],
};

fs.writeFileSync(path.join(out, 'sez-buildings.geojson'), JSON.stringify(buildings, null, 2));
fs.writeFileSync(path.join(out, 'sez-roads.geojson'), JSON.stringify(roads, null, 2));
fs.writeFileSync(path.join(out, 'sez-water.geojson'), JSON.stringify(water, null, 2));
console.log('ok', buildings.features.length, roads.features.length, water.features.length);
