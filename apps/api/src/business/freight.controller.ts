import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { FreightService } from './freight.service.js';

class FreightForecastDto {
  @IsIn([1, 2])
  @Type(() => Number)
  channel!: 1 | 2;

  @IsString()
  @MaxLength(64)
  domesticTrackingNo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

class FreightReceiveDto {
  @IsString()
  @MaxLength(64)
  domesticTrackingNo!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(200)
  actualWeight!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lengthCm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  widthCm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsBoolean()
  unclaimed?: boolean;
}

class FreightClaimDto {
  @IsString()
  @MaxLength(64)
  domesticTrackingNo!: string;
}

class FreightDepartDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  thirdPartyCode?: string;
}

class FreightExceptionDto {
  @IsString()
  @MaxLength(255)
  reason!: string;
}

@ApiTags('跨境集运')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('freight')
export class FreightController {
  constructor(private readonly freight: FreightService) {}

  @Post('forecast')
  @ApiOperation({ summary: '用户预报国内快递单号（不计费）' })
  forecast(@CurrentPrincipal() principal: AuthPrincipal, @Body() dto: FreightForecastDto) {
    return this.freight.forecast(principal, dto);
  }

  @Post('claim')
  @ApiOperation({ summary: '用户认领无主包裹' })
  claim(@CurrentPrincipal() principal: AuthPrincipal, @Body() dto: FreightClaimDto) {
    return this.freight.claim(principal, dto.domesticTrackingNo);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: '用户确认支付仓内计费运费（线下记账）' })
  pay(@CurrentPrincipal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.freight.confirmPay(principal, id);
  }

  @Post('warehouse/receive')
  @UseGuards(PermissionsGuard)
  @Permissions('orders.dispatch')
  @ApiOperation({ summary: '库管扫码入库并按实重/体积重计费' })
  receive(@CurrentPrincipal() principal: AuthPrincipal, @Body() dto: FreightReceiveDto) {
    return this.freight.receive(principal, dto);
  }

  @Post(':id/depart')
  @UseGuards(PermissionsGuard)
  @Permissions('orders.dispatch')
  @ApiOperation({ summary: '库管发车出境' })
  depart(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Body() dto: FreightDepartDto,
  ) {
    return this.freight.depart(principal, id, dto.thirdPartyCode);
  }

  @Post(':id/exception')
  @UseGuards(PermissionsGuard)
  @Permissions('orders.dispatch')
  @ApiOperation({ summary: '库管标记违禁品/退回' })
  exception(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Body() dto: FreightExceptionDto,
  ) {
    return this.freight.markException(principal, id, dto.reason);
  }

  @Get('unclaimed')
  @UseGuards(PermissionsGuard)
  @Permissions('orders.read')
  @ApiOperation({ summary: '无主件认领池' })
  unclaimed() {
    return this.freight.unclaimed();
  }
}
