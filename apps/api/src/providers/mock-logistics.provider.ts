import { Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import type {
  LogisticsProvider,
  ShipmentDraft,
  ShipmentResult,
} from './provider.interfaces.js';

@Injectable()
export class MockLogisticsProvider implements LogisticsProvider {
  async createShipment(draft: ShipmentDraft): Promise<ShipmentResult> {
    const suffix = randomInt(100000, 999999);
    return {
      providerCode: 'MOCK',
      shipmentNo: `MOCK-${draft.orderNo}-${suffix}`,
      providerRef: `mock://${draft.orderNo}`,
      isMock: true,
      message: '模拟运单已创建，不代表真实寄件成功',
    };
  }
}
