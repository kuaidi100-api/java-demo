import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { SupportService, type SupportQrConfig } from './support.service.js';

class CreateSupportSessionDto {
  @IsIn(['EXPRESS', 'ERRAND', 'RIDE', 'HOTEL'])
  businessType!: 'EXPRESS' | 'ERRAND' | 'RIDE' | 'HOTEL';

  @IsIn(['ai', 'human'])
  channel!: 'ai' | 'human';

  @IsOptional()
  @IsString()
  @MaxLength(36)
  orderId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  orderNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  orderStatus?: string;
}

class SupportMessageDto {
  @IsString()
  @MaxLength(2000)
  content!: string;
}

class SupportQrItemDto {
  @IsIn(['wechat', 'telegram', 'whatsapp'])
  id!: SupportQrConfig['id'];

  @IsString()
  @MaxLength(40)
  label!: string;

  @IsString()
  @MaxLength(500)
  imageUrl!: string;
}

class UpdateSupportConfigDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupportQrItemDto)
  qrItems?: SupportQrItemDto[];

  @IsOptional()
  @IsBoolean()
  humanOnline?: boolean;
}

@ApiTags('support')
@Controller('support')
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Get('config')
  @ApiOperation({ summary: '客服配置（二维码占位 / 人工在线）' })
  getConfig() {
    return this.support.getConfig();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('sessions')
  @ApiOperation({ summary: '创建业务客服会话（AI 优先 / 人工）' })
  createSession(@CurrentPrincipal() principal: AuthPrincipal, @Body() dto: CreateSupportSessionDto) {
    return this.support.createSession(principal.id, dto.businessType, dto.channel, {
      orderId: dto.orderId,
      orderNo: dto.orderNo,
      orderStatus: dto.orderStatus,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('sessions/:id')
  getSession(@CurrentPrincipal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.support.getSession(id, principal.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('sessions/:id/messages')
  addMessage(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Body() dto: SupportMessageDto,
  ) {
    return this.support.addMessage(id, principal.id, dto.content.trim());
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('sessions/:id/transfer')
  transfer(@CurrentPrincipal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.support.transferToHuman(id, principal.id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('tickets.manage')
  @ApiBearerAuth()
  @Get('admin/sessions')
  @ApiOperation({ summary: '后台：按业务列出会话' })
  adminList(@Query('businessType') businessType?: 'EXPRESS' | 'ERRAND' | 'RIDE' | 'HOTEL') {
    return this.support.listByBusiness(businessType);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('tickets.manage')
  @ApiBearerAuth()
  @Patch('admin/config')
  @ApiOperation({ summary: '后台：替换社交二维码 / 人工在线状态' })
  updateConfig(@Body() dto: UpdateSupportConfigDto) {
    return this.support.updateConfig(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('tickets.manage')
  @ApiBearerAuth()
  @Delete('admin/sessions/mock')
  @ApiOperation({ summary: '测试环境：批量清理 mock 会话' })
  clearMock() {
    return this.support.clearMockSessions();
  }
}
