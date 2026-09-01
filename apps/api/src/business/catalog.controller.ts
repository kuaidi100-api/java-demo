import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service.js';

@ApiTags('公开配置')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @ApiOperation({ summary: '仓库、闪送一口价、客服等前台配置（失败时返回硬编码兜底）' })
  snapshot() {
    return this.catalog.snapshot();
  }
}
