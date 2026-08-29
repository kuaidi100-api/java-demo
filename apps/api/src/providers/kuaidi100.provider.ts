import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  LogisticsProvider,
  ShipmentDraft,
  ShipmentResult,
} from './provider.interfaces.js';

@Injectable()
export class Kuaidi100Provider implements LogisticsProvider {
  constructor(private readonly config: ConfigService) {}

  async createShipment(_draft: ShipmentDraft): Promise<ShipmentResult> {
    const enabled = this.config.get<string>('KUAIDI100_ENABLED') === 'true';
    const hasCredentials = ['KUAIDI100_KEY', 'KUAIDI100_CUSTOMER', 'KUAIDI100_SECRET']
      .every((name) => Boolean(this.config.get<string>(name)));
    if (!enabled || !hasCredentials) {
      throw new ServiceUnavailableException('快递100真实接口未启用；当前环境只允许 MockProvider');
    }
    throw new ServiceUnavailableException('快递100 Java 适配服务尚未连接，未创建真实订单');
  }
}
