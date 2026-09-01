import maplibregl, { type GeoJSONSource, type Map as MlMap, type Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { SEZ_CENTER } from '../../data/geo-sez';
import type { MapMarkerInput } from './geo';

const GEO = {
  buildings: '/static/geo/sez-buildings.geojson',
  roads: '/static/geo/sez-roads.geojson',
  water: '/static/geo/sez-water.geojson',
  boundary: '/static/geo/sez-boundary.geojson',
};

/** Google hybrid: satellite + baked road / POI labels (incl. CJK). */
const SAT_TILES = [
  'https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  'https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  'https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
];
const OSM_TILES = ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'];
const ESRI_TILES = [
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
];
/** OpenFreeMap Noto Sans includes CJK ranges for building / road names. */
const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';
const LABEL_FONT = ['Noto Sans Regular'];

let selfLocCssInjected = false;
function ensureSelfLocCss(): void {
  if (selfLocCssInjected || typeof document === 'undefined') return;
  selfLocCssInjected = true;
  const style = document.createElement('style');
  style.textContent = `
.sez-self-loc{position:relative;width:18px;height:18px;pointer-events:none}
.sez-self-dot{position:absolute;left:50%;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 2px 8px rgba(37,99,235,.45);z-index:2}
.sez-self-pulse{position:absolute;left:50%;top:50%;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;background:rgba(37,99,235,.28);animation:sez-self-pulse 1.6s ease-out infinite}
@keyframes sez-self-pulse{0%{transform:scale(.55);opacity:.9}100%{transform:scale(1.55);opacity:0}}
`;
  document.head.appendChild(style);
}

export interface LayerStats {
  buildings: number;
  roads: number;
  water: number;
}

export interface SezAerialMapOptions {
  host: HTMLElement;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  showControls?: boolean;
  minZoom?: number;
  maxZoom?: number;
  /** Optional SEZ clamp box: [[minLng,minLat],[maxLng,maxLat]] */
  maxBounds?: [[number, number], [number, number]];
}

const PIN_STYLE: Record<string, string> = {
  rider: 'width:14px;height:14px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.28);',
  order: 'width:14px;height:14px;border-radius:50%;background:#f59e0b;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.28);',
  from: 'width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.3);',
  to: 'width:16px;height:16px;border-radius:50%;background:#dc2626;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.3);',
  car: 'width:18px;height:18px;border-radius:6px;background:#fff;color:#1d4ed8;font-size:11px;line-height:18px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.2);',
};

/**
 * Google Earth–like oblique aerial map:
 * smooth continuous zoom/pan/pitch, satellite ground, extruded OSM buildings.
 */
export class SezAerialMap {
  readonly projection = {
    // keep lng/lat API surface for GPS adapters
    toLngLat: (lng: number, lat: number) => ({ lng, lat }),
  };

  private host: HTMLElement;
  private map: MlMap;
  private markers = new Map<string, { marker: Marker; data: MapMarkerInput }>();
  private buildingCount = 0;
  private defaultPitch: number;
  private pickHandler: ((ll: { lng: number; lat: number }) => void) | null = null;
  private viewHandler: ((ll: { lng: number; lat: number }, zoom: number) => void) | null = null;
  private vehicleMarker: Marker | null = null;
  private selfMarker: Marker | null = null;

  constructor(options: SezAerialMapOptions) {
    this.host = options.host;
    this.defaultPitch = options.pitch ?? 62;
    ensureSelfLocCss();
    this.host.innerHTML = '';
    const canvasHost = document.createElement('div');
    canvasHost.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    this.host.appendChild(canvasHost);

    this.map = new maplibregl.Map({
      container: canvasHost,
      style: {
        version: 8,
        glyphs: GLYPHS,
        sources: {
          osm: {
            type: 'raster',
            tiles: OSM_TILES,
            tileSize: 256,
            maxzoom: 19,
            attribution: '© OpenStreetMap',
          },
          sat: {
            type: 'raster',
            tiles: SAT_TILES,
            tileSize: 256,
            maxzoom: 20,
            attribution: 'Imagery',
          },
          esri: {
            type: 'raster',
            tiles: ESRI_TILES,
            tileSize: 256,
            maxzoom: 17,
            attribution: 'Esri',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            paint: { 'raster-opacity': 1 },
          },
          {
            id: 'esri',
            type: 'raster',
            source: 'esri',
            maxzoom: 17,
            paint: { 'raster-opacity': 0.85 },
          },
          {
            id: 'sat',
            type: 'raster',
            source: 'sat',
            paint: {
              'raster-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                11, 0.94,
                17, 0.98,
                19.5, 1,
              ],
              'raster-saturation': -0.02,
              'raster-contrast': 0.04,
            },
          },
        ],
      },
      center: [SEZ_CENTER.lng, SEZ_CENTER.lat],
      zoom: options.zoom ?? 16.6,
      pitch: this.defaultPitch,
      bearing: options.bearing ?? -28,
      minZoom: options.minZoom ?? 12,
      maxZoom: options.maxZoom ?? 19.8,
      maxPitch: 78,
      maxBounds: options.maxBounds,
      dragRotate: true,
      pitchWithRotate: true,
      touchPitch: true,
      fadeDuration: 0,
      antialias: true,
    });

    if (options.showControls !== false) {
      this.map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
      this.map.addControl(new maplibregl.ScaleControl({ maxWidth: 120 }), 'bottom-left');
    }

    this.map.on('click', (e) => {
      if (!this.pickHandler) return;
      this.pickHandler({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    const emitView = () => {
      if (!this.viewHandler) return;
      const c = this.map.getCenter();
      this.viewHandler({ lng: c.lng, lat: c.lat }, this.map.getZoom());
    };
    this.map.on('moveend', emitView);
    this.map.on('zoomend', emitView);

    // Silky inertia
    this.map.scrollZoom.setWheelZoomRate(1 / 450);
    this.map.scrollZoom.setZoomRate(1 / 80);
  }

  async loadLocalLayers(): Promise<LayerStats> {
    await this.whenReady();

    const [buildings, roads, water, boundary] = await Promise.all([
      fetch(GEO.buildings).then((r) => r.json()),
      fetch(GEO.roads).then((r) => r.json()),
      fetch(GEO.water).then((r) => r.json()),
      fetch(GEO.boundary).then((r) => r.json()),
    ]);

    this.buildingCount = buildings.features?.length ?? 0;

    // Water: very light tint only (avoid heavy blue blotch)
    this.map.addSource('water', { type: 'geojson', data: water });
    this.map.addLayer({
      id: 'water-fill',
      type: 'fill',
      source: 'water',
      paint: {
        'fill-color': '#3b82a8',
        'fill-opacity': 0.22,
      },
    });

    // Buildings — soft extrusions (no white road web / landmark dots)
    this.map.addSource('buildings', { type: 'geojson', data: buildings });
    this.map.addLayer({
      id: 'buildings-3d',
      type: 'fill-extrusion',
      source: 'buildings',
      minzoom: 13,
      paint: {
        'fill-extrusion-color': [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'height'], 10],
          4, '#f3f5f7',
          18, '#e4e9ee',
          40, '#d0d7df',
          80, '#b7c1cc',
        ],
        'fill-extrusion-height': ['coalesce', ['get', 'height'], 10],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.82,
        'fill-extrusion-vertical-gradient': true,
      },
    });

    // Named roads: labels along centerline (no thick white strokes)
    this.map.addSource('roads', { type: 'geojson', data: roads });
    this.map.addLayer({
      id: 'road-names',
      type: 'symbol',
      source: 'roads',
      minzoom: 14,
      filter: ['!=', ['coalesce', ['get', 'name'], ''], ''],
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 280,
        'text-field': ['coalesce', ['get', 'name'], ['get', 'label']],
        'text-font': LABEL_FONT,
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          14, 10,
          17, 13,
          19, 15,
        ],
        'text-max-angle': 30,
        'text-pitch-alignment': 'viewport',
        'text-rotation-alignment': 'map',
        'text-keep-upright': true,
        'text-allow-overlap': false,
        'text-ignore-placement': false,
      },
      paint: {
        'text-color': '#f8fafc',
        'text-halo-color': 'rgba(15, 23, 42, 0.78)',
        'text-halo-width': 1.4,
        'text-halo-blur': 0.4,
        'text-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          14, 0.75,
          16, 0.95,
        ],
      },
    });

    // Named buildings (e.g. 金三角经济特区管理委员会 / Cafe Amazon)
    this.map.addLayer({
      id: 'building-names',
      type: 'symbol',
      source: 'buildings',
      minzoom: 15.2,
      filter: [
        'any',
        ['!=', ['coalesce', ['get', 'name'], ''], ''],
        ['!=', ['coalesce', ['get', 'label'], ''], ''],
      ],
      layout: {
        'symbol-placement': 'point',
        'text-field': ['coalesce', ['get', 'name'], ['get', 'label']],
        'text-font': LABEL_FONT,
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15, 11,
          17, 13,
          19, 15,
        ],
        'text-anchor': 'center',
        'text-offset': [0, -0.15],
        'text-max-width': 10,
        'text-padding': 4,
        'text-optional': true,
        'text-allow-overlap': false,
        'text-ignore-placement': false,
        'text-pitch-alignment': 'viewport',
        'text-rotation-alignment': 'viewport',
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': 'rgba(15, 23, 42, 0.82)',
        'text-halo-width': 1.6,
        'text-halo-blur': 0.3,
        'text-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15.2, 0.7,
          16.5, 0.95,
        ],
      },
    });

    // Service boundary: thin cyan outline only (not white)
    this.map.addSource('boundary', { type: 'geojson', data: boundary });
    this.map.addLayer({
      id: 'boundary-line',
      type: 'line',
      source: 'boundary',
      paint: {
        'line-color': '#38bdf8',
        'line-width': 1.5,
        'line-opacity': 0.55,
      },
    });

    return {
      buildings: this.buildingCount,
      roads: roads.features?.length ?? 0,
      water: water.features?.length ?? 0,
    };
  }

  setMarkers(markers: MapMarkerInput[]): void {
    const keep = new Set(markers.map((m) => m.id));
    for (const [id, entry] of this.markers) {
      if (!keep.has(id)) {
        entry.marker.remove();
        this.markers.delete(id);
      }
    }
    for (const m of markers) {
      const existing = this.markers.get(m.id);
      if (existing) {
        existing.marker.setLngLat([m.lng, m.lat]);
        existing.data = m;
        const el = existing.marker.getElement();
        el.style.cssText = PIN_STYLE[m.kind] || PIN_STYLE.order;
        if (m.kind === 'car') {
          el.textContent = '▲';
          el.style.transform = `rotate(${m.heading ?? 0}deg)`;
        }
        continue;
      }
      const el = document.createElement('div');
      el.className = `sez-pin sez-pin-${m.kind}`;
      el.style.cssText = PIN_STYLE[m.kind] || PIN_STYLE.order;
      el.title = m.label || m.id;
      if (m.kind === 'car') el.textContent = '▲';
      const marker = new maplibregl.Marker({
        element: el,
        anchor: m.kind === 'car' ? 'center' : 'bottom',
      })
        .setLngLat([m.lng, m.lat])
        .addTo(this.map);
      this.markers.set(m.id, { marker, data: m });
    }
  }

  upsertMarker(marker: MapMarkerInput): void {
    const next = this.listMarkers().filter((m) => m.id !== marker.id);
    next.push(marker);
    this.setMarkers(next);
  }

  listMarkers(): MapMarkerInput[] {
    return [...this.markers.values()].map((v) => ({ ...v.data }));
  }

  getFocusLngLat(): { lng: number; lat: number } {
    const c = this.map.getCenter();
    return { lng: c.lng, lat: c.lat };
  }

  onPick(handler: ((ll: { lng: number; lat: number }) => void) | null): void {
    this.pickHandler = handler;
  }

  onViewChange(handler: ((ll: { lng: number; lat: number }, zoom: number) => void) | null): void {
    this.viewHandler = handler;
  }

  getZoom(): number {
    return this.map.getZoom();
  }

  getPitch(): number {
    return this.map.getPitch();
  }

  setPitch(pitch: number, duration = 450): void {
    this.map.easeTo({
      pitch,
      duration,
      easing: (t) => 1 - (1 - t) ** 3,
    });
  }

  resize(): void {
    this.map.resize();
  }

  focusLngLat(lng: number, lat: number, _height = 320): void {
    this.map.easeTo({
      center: [lng, lat],
      zoom: Math.max(this.map.getZoom(), 16.4),
      pitch: this.defaultPitch,
      duration: 900,
      easing: (t) => 1 - (1 - t) ** 3,
    });
  }

  setCenter(lng: number, lat: number, duration = 500): void {
    this.map.easeTo({
      center: [lng, lat],
      duration,
      easing: (t) => 1 - (1 - t) ** 3,
    });
  }

  /** Fly from overview → street (Google Earth–like) */
  softZoomIn(): void {
    const next = Math.min(18.8, this.map.getZoom() + 1.2);
    this.map.easeTo({
      zoom: next,
      duration: 650,
      easing: (t) => 1 - (1 - t) ** 3,
    });
  }

  softZoomOut(): void {
    const next = Math.max(12.5, this.map.getZoom() - 1.2);
    this.map.easeTo({
      zoom: next,
      duration: 650,
      easing: (t) => 1 - (1 - t) ** 3,
    });
  }

  /**
   * Draw a simple logistics route: full path + traveled segment + vehicle pin.
   * coordinates are [lng, lat].
   */
  setDeliveryRoute(input: {
    coordinates: Array<[number, number]>;
    traveled?: Array<[number, number]>;
    vehicle?: { lng: number; lat: number; heading?: number; label?: string } | null;
    fit?: boolean;
  }): void {
    const full = {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'LineString' as const, coordinates: input.coordinates },
    };
    const traveledCoords = input.traveled?.length ? input.traveled : input.coordinates.slice(0, 1);
    const traveled = {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'LineString' as const, coordinates: traveledCoords },
    };

    if (!this.map.getSource('delivery-route')) {
      this.map.addSource('delivery-route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [full] },
      });
      this.map.addSource('delivery-traveled', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [traveled] },
      });
      this.map.addLayer({
        id: 'delivery-route-casing',
        type: 'line',
        source: 'delivery-route',
        paint: {
          'line-color': '#0ea5e9',
          'line-width': 6,
          'line-opacity': 0.25,
          'line-blur': 0.4,
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      });
      this.map.addLayer({
        id: 'delivery-route-line',
        type: 'line',
        source: 'delivery-route',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2.5,
          'line-opacity': 0.55,
          'line-dasharray': [1.2, 1.6],
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      });
      this.map.addLayer({
        id: 'delivery-traveled-line',
        type: 'line',
        source: 'delivery-traveled',
        paint: {
          'line-color': '#22d3ee',
          'line-width': 4,
          'line-opacity': 0.95,
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      });
    } else {
      (this.map.getSource('delivery-route') as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [full],
      });
      (this.map.getSource('delivery-traveled') as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [traveled],
      });
    }

    if (input.vehicle) {
      const el = document.createElement('div');
      el.className = 'sez-pin sez-pin-car sez-pin-truck';
      el.style.cssText =
        'width:22px;height:22px;border-radius:8px;background:#06b6d4;color:#fff;font-size:12px;font-weight:700;line-height:22px;text-align:center;box-shadow:0 2px 10px rgba(6,182,212,.45);border:2px solid #fff;';
      el.textContent = '运';
      el.title = input.vehicle.label || '运输中';
      el.style.transform = `rotate(${input.vehicle.heading ?? 0}deg)`;
      if (this.vehicleMarker) {
        this.vehicleMarker.setLngLat([input.vehicle.lng, input.vehicle.lat]);
        const node = this.vehicleMarker.getElement();
        node.style.transform = `rotate(${input.vehicle.heading ?? 0}deg)`;
        node.title = input.vehicle.label || '运输中';
      } else {
        this.vehicleMarker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([input.vehicle.lng, input.vehicle.lat])
          .addTo(this.map);
      }
    }

    if (input.fit && input.coordinates.length >= 2) {
      this.fitCoordinates(input.coordinates);
    }
  }

  clearDeliveryRoute(): void {
    for (const id of ['delivery-traveled-line', 'delivery-route-line', 'delivery-route-casing']) {
      if (this.map.getLayer(id)) this.map.removeLayer(id);
    }
    for (const id of ['delivery-traveled', 'delivery-route']) {
      if (this.map.getSource(id)) this.map.removeSource(id);
    }
    if (this.vehicleMarker) {
      this.vehicleMarker.remove();
      this.vehicleMarker = null;
    }
  }

  fitCoordinates(coordinates: Array<[number, number]>, pad = 48): void {
    if (coordinates.length < 2) return;
    let minLng = coordinates[0][0];
    let maxLng = coordinates[0][0];
    let minLat = coordinates[0][1];
    let maxLat = coordinates[0][1];
    for (const [lng, lat] of coordinates) {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
    this.map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: pad,
        duration: 900,
        pitch: Math.min(this.defaultPitch, 48),
        essential: true,
      },
    );
  }

  /** Blue “me” pin + fly to device location */
  showSelfLocation(lng: number, lat: number, opts?: { zoom?: number; fly?: boolean }): void {
    if (!this.selfMarker) {
      const el = document.createElement('div');
      el.className = 'sez-self-loc';
      el.innerHTML = '<span class="sez-self-pulse"></span><span class="sez-self-dot"></span>';
      el.title = '我的位置';
      this.selfMarker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(this.map);
    } else {
      this.selfMarker.setLngLat([lng, lat]);
    }
    if (opts?.fly === false) {
      this.map.setCenter([lng, lat]);
      if (opts.zoom != null) this.map.setZoom(opts.zoom);
      return;
    }
    this.map.easeTo({
      center: [lng, lat],
      zoom: opts?.zoom ?? Math.max(this.map.getZoom(), 16.6),
      pitch: this.defaultPitch,
      duration: 900,
      easing: (t) => 1 - (1 - t) ** 3,
    });
  }

  clearSelfLocation(): void {
    if (this.selfMarker) {
      this.selfMarker.remove();
      this.selfMarker = null;
    }
  }

  dispose(): void {
    this.pickHandler = null;
    this.viewHandler = null;
    if (this.vehicleMarker) {
      this.vehicleMarker.remove();
      this.vehicleMarker = null;
    }
    if (this.selfMarker) {
      this.selfMarker.remove();
      this.selfMarker = null;
    }
    for (const { marker } of this.markers.values()) marker.remove();
    this.markers.clear();
    this.map.remove();
    this.host.innerHTML = '';
  }

  private whenReady(): Promise<void> {
    if (this.map.loaded()) return Promise.resolve();
    return new Promise((resolve) => {
      this.map.once('load', () => resolve());
    });
  }
}

// Re-export name expected by page (swap engine without rewriting callers much)
export { SezAerialMap as Sez3dMap };
