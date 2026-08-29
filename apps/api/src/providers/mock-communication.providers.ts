import { Injectable } from '@nestjs/common';
import type { NotificationProvider, SmsProvider } from './provider.interfaces.js';

@Injectable()
export class MockSmsProvider implements SmsProvider {
  async send(): Promise<{ accepted: boolean; isMock: boolean }> {
    return { accepted: true, isMock: true };
  }
}

@Injectable()
export class MockNotificationProvider implements NotificationProvider {
  async send(): Promise<{ accepted: boolean; isMock: boolean }> {
    return { accepted: true, isMock: true };
  }
}
