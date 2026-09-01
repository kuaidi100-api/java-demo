import type { GeoProjection } from '../../utils/geoProjection';

export type GeoJsonPosition = [number, number] | [number, number, number];

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export interface GeoJsonFeature {
  type: 'Feature';
  id?: string | number;
  properties?: Record<string, unknown> | null;
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

export type MapMarkerKind = 'rider' | 'order' | 'from' | 'to' | 'car';

export interface MapMarkerInput {
  id: string;
  lng: number;
  lat: number;
  kind: MapMarkerKind;
  label?: string;
  heading?: number;
  status?: string;
}

/** Load local static GeoJSON (no third-party map SDK). */
export async function loadLocalGeoJson(url: string): Promise<GeoJsonFeatureCollection> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return (await res.json()) as GeoJsonFeatureCollection;
}

export function polygonRings(geometry: GeoJsonFeature['geometry']): number[][][] {
  if (geometry.type === 'Polygon') return geometry.coordinates as number[][][];
  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates as number[][][][]).flatMap((poly) => poly);
  }
  return [];
}

export function lineCoords(geometry: GeoJsonFeature['geometry']): number[][][] {
  if (geometry.type === 'LineString') return [geometry.coordinates as number[][]];
  if (geometry.type === 'MultiLineString') return geometry.coordinates as number[][][];
  return [];
}

export function featureHeight(props: Record<string, unknown> | null | undefined, fallback = 12): number {
  const h = Number(props?.height ?? props?.Height ?? props?.HEIGHT);
  if (Number.isFinite(h) && h > 0) return h;
  const levels = Number(props?.levels ?? props?.building_levels);
  if (Number.isFinite(levels) && levels > 0) return levels * 3.2;
  return fallback;
}

export function roadWidth(props: Record<string, unknown> | null | undefined): number {
  const w = Number(props?.width);
  if (Number.isFinite(w) && w > 0) return w;
  const kind = String(props?.kind || 'local');
  if (kind === 'primary') return 12;
  if (kind === 'secondary') return 9;
  return 6;
}

export function projectRing(
  projection: GeoProjection,
  ring: number[][],
): Array<{ x: number; y: number }> {
  return projection.ringToShapePoints(ring);
}
