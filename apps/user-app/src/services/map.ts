export interface MapCoordinate { latitude: number; longitude: number }
export interface MapRouteResult {
  distanceKm: number;
  durationMinutes: number;
  polyline: MapCoordinate[];
  provider: string;
}
export interface MapTrackingPoint extends MapCoordinate { recordedAt: string; label?: string }

export interface MapProviderAdapter {
  readonly name: string;
  readonly configured: boolean;
  geocode(address: string): Promise<MapCoordinate>;
  reverseGeocode(coordinate: MapCoordinate): Promise<string>;
  route(origin: MapCoordinate, destination: MapCoordinate): Promise<MapRouteResult>;
  trackingPoints(shipmentNo: string): Promise<MapTrackingPoint[]>;
  serviceAreaCheck(coordinate: MapCoordinate): Promise<boolean>;
}

class UnconfiguredMapProvider implements MapProviderAdapter {
  readonly name = '未配置';
  readonly configured = false;
  private unavailable(): never { throw new Error('地图服务尚未配置'); }
  async geocode(): Promise<MapCoordinate> { return this.unavailable(); }
  async reverseGeocode(): Promise<string> { return this.unavailable(); }
  async route(): Promise<MapRouteResult> { return this.unavailable(); }
  async trackingPoints(): Promise<MapTrackingPoint[]> { return this.unavailable(); }
  async serviceAreaCheck(): Promise<boolean> { return this.unavailable(); }
}

export const mapProvider: MapProviderAdapter = new UnconfiguredMapProvider();
