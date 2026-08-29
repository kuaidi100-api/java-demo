import { Injectable } from '@nestjs/common';
import type { MapProvider } from './provider.interfaces.js';

@Injectable()
export class MockMapProvider implements MapProvider {
  async estimateRoute(input: Parameters<MapProvider['estimateRoute']>[0]) {
    const latDiff = input.origin.latitude - input.destination.latitude;
    const lngDiff = input.origin.longitude - input.destination.longitude;
    const distanceKm = Math.max(1, Math.sqrt(latDiff ** 2 + lngDiff ** 2) * 111);
    return {
      distanceKm: Number(distanceKm.toFixed(2)),
      durationMinutes: Math.max(10, Math.ceil(distanceKm * 3)),
      isMock: true,
    };
  }
}
