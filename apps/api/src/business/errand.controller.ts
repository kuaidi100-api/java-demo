import { Body, Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OfflinePaymentMethod, SettlementLocation } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { ErrandService } from './errand.service.js';

class ErrandEstimateDto {
  @IsIn([1, 2])
  @Type(() => Number)
  deliveryAreaType!: 1 | 2;

  @IsIn([1, 2])
  @Type(() => Number)
  weightTier!: 1 | 2;
}

class CreateErrandDto extends ErrandEstimateDto {
  @IsUUID()
  senderAddressId!: string;

  @IsUUID()
  recipientAddressId!: string;

  @IsString()
  @MaxLength(255)
  itemDescription!: string;

  @IsEnum(OfflinePaymentMethod)
  paymentMethod!: OfflinePaymentMethod;

  @IsEnum(SettlementLocation)
  settlementLoc!: SettlementLocation;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

class ErrandRejectDto {
  @IsString()
  @MaxLength(255)
  reason!: string;

  @IsOptional()
  @IsString()
  photoKey?: string;
}

class ErrandCollectDto {
  @IsOptional()
  @IsString()
  paymentImgKey?: string;
}

class ErrandProofDto {
  @IsIn(['pickup', 'payment'])
  kind!: 'pickup' | 'payment';

  @IsString()
  storageKey!: string;
}

@ApiTags('同城闪送')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('errands')
export class ErrandController {
  constructor(private readonly errands: ErrandService) {}

  @Post('estimate')
  @ApiOperation({ summary: '闪送一口价（区域+重量档，不可改价）' })
  estimate(@Body() dto: ErrandEstimateDto) {
    return this.errands.estimate(dto.deliveryAreaType, dto.weightTier);
  }

  @Post()
  @ApiOperation({ summary: '创建闪送订单' })
  create(@CurrentPrincipal() principal: AuthPrincipal, @Body() dto: CreateErrandDto) {
    return this.errands.create(principal, dto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '骑手现场超重/物品不符退单并记账退款' })
  reject(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Body() dto: ErrandRejectDto,
  ) {
    return this.errands.rejectAtPickup(principal, id, dto.reason, dto.photoKey);
  }

  @Post(':id/collect')
  @ApiOperation({ summary: '骑手确认现金或截图收款' })
  collect(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Body() dto: ErrandCollectDto,
  ) {
    return this.errands.confirmCollected(principal, id, dto.paymentImgKey);
  }

  @Post(':id/proofs')
  @ApiOperation({ summary: '骑手保存取件照或支付截图 storageKey' })
  proof(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Body() dto: ErrandProofDto,
  ) {
    return this.errands.saveProof(principal, id, dto.kind, dto.storageKey);
  }
}
