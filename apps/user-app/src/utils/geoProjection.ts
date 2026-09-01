/**
 * Local equirectangular projection around 金三角经济特区 origin.
 * Three.js: +X east, +Y up, +Z south (so map north ≈ -Z).
 */
import { SEZ_CENTER } from '../data/geo-sez';

const EARTH_R = 6378137;

export interface LngLat {
  lng: number;
  lat: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export class GeoProjection {
  readonly originLng: number;
  readonly originLat: number;
  readonly metersPerDegLat: number;
  readonly metersPerDegLng: number;

  constructor(origin: LngLat = SEZ_CENTER) {
    this.originLng = origin.lng;
    this.originLat = origin.lat;
    this.metersPerDegLat = (Math.PI / 180) * EARTH_R;
    this.metersPerDegLng = this.metersPerDegLat * Math.cos((origin.lat * Math.PI) / 180);
  }

  /** lng/lat → local meters (y ignored / ground) */
  toLocal(lng: number, lat: number, altitude = 0): Vec3 {
    return {
      x: (lng - this.originLng) * this.metersPerDegLng,
      y: altitude,
      z: -(lat - this.originLat) * this.metersPerDegLat,
    };
  }

  /** local meters → lng/lat */
  toLngLat(x: number, z: number): LngLat {
    return {
      lng: this.originLng + x / this.metersPerDegLng,
      lat: this.originLat - z / this.metersPerDegLat,
    };
  }

  ringToShapePoints(ring: number[][]): Array<{ x: number; y: number }> {
    return ring.map(([lng, lat]) => {
      const p = this.toLocal(lng, lat);
      // THREE.Shape uses x/y on ground plane; we map local x→x, local z→y
      return { x: p.x, y: p.z };
    });
  }
}

export const sezProjection = new GeoProjection(SEZ_CENTER);
