import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      database: 'ok',
      providerMode: this.config.get<string>('PROVIDER_MODE', 'mock'),
      storageDriver: this.config.get<string>('STORAGE_DRIVER', 'local'),
      mockEnvironment: this.config.get<string>('PROVIDER_MODE', 'mock') === 'mock',
    };
  }
}
