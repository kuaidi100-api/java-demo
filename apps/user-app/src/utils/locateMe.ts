/**
 * One-tap device location for map pages (H5 / uni.getLocation).
 */
import { clampToSez, pointInSezServiceArea } from '../data/geo-sez';

export interface LocateResult {
  lat: number;
  lng: number;
  accuracy?: number;
  /** true when raw GPS is outside SEZ service polygon */
  outsideSez: boolean;
  /** map-friendly point (clamped if needed) */
  mapLat: number;
  mapLng: number;
}

function viaBrowser(timeoutMs: number): Promise<{ lat: number; lng: number; accuracy?: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('NO_GEO'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 8000 },
    );
  });
}

function viaUni(timeoutMs: number): Promise<{ lat: number; lng: number; accuracy?: number }> {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'wgs84',
      isHighAccuracy: true,
      highAccuracyExpireTime: timeoutMs,
      success: (res) => {
        resolve({ lat: res.latitude, lng: res.longitude, accuracy: res.accuracy });
      },
      fail: (err) => reject(err),
    });
  });
}

export async function locateMe(timeoutMs = 12000): Promise<LocateResult> {
  let raw: { lat: number; lng: number; accuracy?: number };
  try {
    raw = await viaUni(timeoutMs);
  } catch {
    raw = await viaBrowser(timeoutMs);
  }
  const outsideSez = !pointInSezServiceArea(raw.lat, raw.lng);
  const clamped = clampToSez(raw.lat, raw.lng, true);
  return {
    lat: raw.lat,
    lng: raw.lng,
    accuracy: raw.accuracy,
    outsideSez,
    mapLat: outsideSez ? clamped.lat : raw.lat,
    mapLng: outsideSez ? clamped.lng : raw.lng,
  };
}

export function locateErrorMessage(cause: unknown): string {
  const msg = cause instanceof Error ? cause.message : String((cause as { errMsg?: string })?.errMsg || cause || '');
  if (/deny|permission|auth/i.test(msg)) return '定位权限未开启';
  if (/timeout|TIME/i.test(msg)) return '定位超时，请重试';
  if (/NO_GEO/i.test(msg)) return '当前环境不支持定位';
  return '定位失败，请检查系统定位权限';
}
