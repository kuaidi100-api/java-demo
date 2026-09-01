import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AdminModule } from './admin/admin.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { RateLimitGuard } from './common/guards/rate-limit.guard.js';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { validateEnvironment } from './config/env.js';
import { BusinessModule } from './business/business.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProvidersModule } from './providers/providers.module.js';
import { SecurityModule } from './security/security.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      validate: validateEnvironment,
    }),
    PrismaModule,
    SecurityModule,
    ProvidersModule,
    AuthModule,
    AdminModule,
    UsersModule,
    OrdersModule,
    BusinessModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RateLimitGuard,
    { provide: APP_GUARD, useExisting: RateLimitGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes({ path: '{*path}', method: RequestMethod.ALL });
  }
}
