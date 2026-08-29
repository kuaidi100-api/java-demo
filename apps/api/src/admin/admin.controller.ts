import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { AdminService } from './admin.service.js';

@ApiTags('管理后台')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('overview')
  @Permissions('dashboard.read')
  @ApiOperation({ summary: '管理后台数据概览' })
  overview() {
    return this.admin.overview();
  }

  @Get('couriers')
  @Permissions('couriers.manage')
  @ApiOperation({ summary: '可调度配送员列表（手机号脱敏）' })
  couriers() {
    return this.admin.couriers();
  }
}
