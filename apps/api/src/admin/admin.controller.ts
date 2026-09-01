import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketIssueType, TicketStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { AdminService } from './admin.service.js';

class ManualTraceDto {
  @IsString()
  @MaxLength(255)
  description!: string;
}

class TicketCreateDto {
  @IsString()
  orderId!: string;

  @IsEnum(TicketIssueType)
  issueType!: TicketIssueType;

  @IsString()
  @MaxLength(150)
  subject!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;
}

class TicketResolveDto {
  @IsEnum(TicketStatus)
  status!: TicketStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  penaltyAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}

class DepositDto {
  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

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
  @ApiOperation({ summary: '可调度配送员列表（含押金）' })
  couriers() {
    return this.admin.couriers();
  }

  @Get('finance')
  @Permissions('orders.read')
  @ApiOperation({ summary: '财务对账批次' })
  finance(@Query('batchDate') batchDate?: string) {
    return this.admin.finance(batchDate);
  }

  @Post('finance/run')
  @Permissions('orders.dispatch')
  @ApiOperation({ summary: '立即生成早/晚对账批次' })
  runFinance(@Query('slot') slot?: 'Morning' | 'Evening') {
    return this.admin.runFinance(slot === 'Evening' ? 'Evening' : 'Morning');
  }

  @Get('tickets')
  @Permissions('orders.read')
  @ApiOperation({ summary: '客服工单列表' })
  tickets() {
    return this.admin.tickets();
  }

  @Post('tickets')
  @Permissions('orders.dispatch')
  @ApiOperation({ summary: '创建客服工单' })
  createTicket(@CurrentPrincipal() principal: AuthPrincipal, @Body() dto: TicketCreateDto) {
    return this.admin.createTicket(principal, dto);
  }

  @Post('tickets/:id/resolve')
  @Permissions('orders.dispatch')
  @ApiOperation({ summary: '结案工单，可选扣除骑手押金' })
  resolveTicket(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Body() dto: TicketResolveDto,
  ) {
    return this.admin.resolveTicket(principal, id, dto);
  }

  @Post('orders/:id/traces')
  @Permissions('orders.dispatch')
  @ApiOperation({ summary: '后台手工追加物流轨迹（前端降级读取）' })
  addTrace(@Param('id') id: string, @Body() dto: ManualTraceDto) {
    if (!dto.description.trim()) throw new BadRequestException('轨迹内容不能为空');
    return this.admin.addManualTrace(id, dto.description);
  }

  @Post('couriers/:id/deposit')
  @Permissions('couriers.manage')
  @ApiOperation({ summary: '骑手押金充值或扣减' })
  deposit(@Param('id') id: string, @Body() dto: DepositDto) {
    return this.admin.adjustDeposit(id, dto.amount, dto.note);
  }
}
