import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderServiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { LifestyleService, PurchaseService } from './purchase.service.js';

class CreatePurchaseDto {
  @IsString()
  @MaxLength(1000)
  productUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

class QuotePurchaseDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  quoteAmount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}

class ConfirmQuoteDto {
  @IsBoolean()
  accept!: boolean;
}

class CreateLifestyleDto {
  @IsEnum(OrderServiceType)
  serviceType!: OrderServiceType;

  @IsString()
  @MaxLength(80)
  contactName!: string;

  @IsString()
  @MaxLength(20)
  phone!: string;

  @IsString()
  @MaxLength(1000)
  detail!: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

@ApiTags('代买与预约')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PurchaseController {
  constructor(
    private readonly purchases: PurchaseService,
    private readonly lifestyle: LifestyleService,
  ) {}

  @Post('purchases')
  @ApiOperation({ summary: '提交代买链接' })
  createPurchase(@CurrentPrincipal() principal: AuthPrincipal, @Body() dto: CreatePurchaseDto) {
    return this.purchases.create(principal, dto);
  }

  @Post('purchases/:id/quote')
  @UseGuards(PermissionsGuard)
  @Permissions('orders.dispatch')
  @ApiOperation({ summary: '后台录入代买报价' })
  quote(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Body() dto: QuotePurchaseDto,
  ) {
    return this.purchases.quote(principal, id, dto.quoteAmount, dto.adminNote);
  }

  @Post('purchases/:id/confirm')
  @ApiOperation({ summary: '用户确认或拒绝代买报价' })
  confirm(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Body() dto: ConfirmQuoteDto,
  ) {
    return this.purchases.confirmQuote(principal, id, dto.accept);
  }

  @Post('lifestyle')
  @ApiOperation({ summary: '酒店/票务/搬家/旅拍/叫车需求单' })
  lifestyleCreate(@CurrentPrincipal() principal: AuthPrincipal, @Body() dto: CreateLifestyleDto) {
    return this.lifestyle.create(principal, dto);
  }
}
