import { Injectable, NotImplementedException } from '@nestjs/common';
import type { PaymentProvider } from './provider.interfaces.js';

@Injectable()
export class DisabledPaymentProvider implements PaymentProvider {
  async createPayment(): Promise<never> {
    throw new NotImplementedException('当前阶段未启用在线支付');
  }
}
