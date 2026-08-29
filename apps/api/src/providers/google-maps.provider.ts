import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MapProvider } from './provider.interfaces.js';

@Injectable()
export class GoogleMapsProvider implements MapProvider {
  constructor(private readonly config: ConfigService) {}

  async estimateRoute(_input: Parameters<MapProvider['estimateRoute']>[0]): Promise<never> {
    if (!this.config.get<string>('GOOGLE_MAPS_API_KEY')) {
      throw new ServiceUnavailableException('Google Maps 未配置，当前环境使用 MockMapProvider');
    }
    throw new ServiceUnavailableException('Google Maps 连接占位尚未启用');
  }
}
