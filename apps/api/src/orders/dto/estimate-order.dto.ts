import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderServiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class EstimateOrderDto {
  @ApiProperty({ enum: OrderServiceType })
  @IsEnum(OrderServiceType)
  serviceType!: OrderServiceType;

  @ApiProperty({ example: 1.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.01)
  @Max(1000)
  weightKg!: number;

  @ApiPropertyOptional({ description: '由地图适配层计算后传入；未提供时只按重量估价' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10000)
  distanceKm?: number;
}
