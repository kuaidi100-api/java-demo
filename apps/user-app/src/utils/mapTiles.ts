/**
 * Premium light basemap (Apple Maps–like soft streets / parks).
 * True Apple MapKit JS needs an Apple Developer token; Carto Voyager is the free stand-in.
 */
const SUBS = ['a', 'b', 'c', 'd'] as const;

export function mapTileSrc(z: number, x: number, y: number, mirror = 0): string {
  const s = SUBS[(x + y) % SUBS.length];
  if (mirror === 0) {
    return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}@2x.png`;
  }
  if (mirror === 1) {
    return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
  }
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`;
}

export function onMapTileError(event: Event): void {
  const img = event.target as HTMLImageElement | null;
  if (!img?.dataset.key) return;
  const step = Number(img.dataset.fallback || '0');
  if (step >= 2) return;
  const next = step + 1;
  img.dataset.fallback = String(next);
  const [z, x, y] = img.dataset.key.split('-').map(Number);
  img.src = mapTileSrc(z, x, y, next);
}
