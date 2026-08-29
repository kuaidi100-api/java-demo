import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ApiEnvelopeInterceptor } from './common/interceptors/api-envelope.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const prefix = config.get<string>('API_PREFIX', 'api/v1');
  const port = config.get<number>('PORT', 3000);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix(prefix);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ApiEnvelopeInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('快递综合服务平台 API')
    .setDescription('MVP 核心接口。开发环境所有物流能力均明确标记为 Mock。')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
    customSiteTitle: '快递综合服务平台 API',
  });

  await app.listen(port, '0.0.0.0');
}
await bootstrap();
