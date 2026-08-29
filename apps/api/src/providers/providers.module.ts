import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DisabledPaymentProvider } from './disabled-payment.provider.js';
import { GoogleMapsProvider } from './google-maps.provider.js';
import { Kuaidi100Provider } from './kuaidi100.provider.js';
import { LocalStorageProvider } from './local-storage.provider.js';
import { MockLogisticsProvider } from './mock-logistics.provider.js';
import { MockMapProvider } from './mock-map.provider.js';
import { MockNotificationProvider, MockSmsProvider } from './mock-communication.providers.js';
import {
  LOGISTICS_PROVIDER,
  MAP_PROVIDER,
  NOTIFICATION_PROVIDER,
  PAYMENT_PROVIDER,
  SMS_PROVIDER,
  STORAGE_PROVIDER,
} from './provider.interfaces.js';

@Global()
@Module({
  providers: [
    MockLogisticsProvider,
    Kuaidi100Provider,
    MockMapProvider,
    GoogleMapsProvider,
    LocalStorageProvider,
    DisabledPaymentProvider,
    MockSmsProvider,
    MockNotificationProvider,
    {
      provide: LOGISTICS_PROVIDER,
      inject: [ConfigService, MockLogisticsProvider, Kuaidi100Provider],
      useFactory: (
        config: ConfigService,
        mock: MockLogisticsProvider,
        kuaidi100: Kuaidi100Provider,
      ) => config.get<string>('PROVIDER_MODE', 'mock') === 'kuaidi100' ? kuaidi100 : mock,
    },
    { provide: MAP_PROVIDER, useExisting: MockMapProvider },
    { provide: SMS_PROVIDER, useExisting: MockSmsProvider },
    { provide: STORAGE_PROVIDER, useExisting: LocalStorageProvider },
    { provide: PAYMENT_PROVIDER, useExisting: DisabledPaymentProvider },
    { provide: NOTIFICATION_PROVIDER, useExisting: MockNotificationProvider },
  ],
  exports: [
    LOGISTICS_PROVIDER,
    MAP_PROVIDER,
    SMS_PROVIDER,
    STORAGE_PROVIDER,
    PAYMENT_PROVIDER,
    NOTIFICATION_PROVIDER,
  ],
})
export class ProvidersModule {}
