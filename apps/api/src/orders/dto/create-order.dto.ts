import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemType, OrderServiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderAddressInputDto {
  @ApiProperty({ example: '测试寄件人（虚拟）' })
  @IsString()
  @MaxLength(80)
  contactName!: string;

  @ApiProperty({ example: '+8562099990010' })
  @Matches(/^\+[1-9]\d{7,14}$/)
  phone!: string;

  @ApiPropertyOptional({ default: 'LA' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ example: '老挝' })
  @IsString()
  @MaxLength(80)
  country!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @ApiProperty({ example: '万象市' })
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiPropertyOptional({ example: '西沙达那区' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiProperty({ example: '测试路 100 号（虚拟地址）' })
  @IsString()
  @MaxLength(255)
  detail!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  longitude?: number;
}

export class OrderItemInputDto {
  @ApiProperty({ enum: ItemType })
  @IsEnum(ItemType)
  type!: ItemType;

  @ApiProperty({ example: '测试文件（虚拟）' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  @Max(99)
  quantity!: number;

  @ApiProperty({ example: 0.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.01)
  @Max(1000)
  weightKg!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({ enum: OrderServiceType })
  @IsEnum(OrderServiceType)
  serviceType!: OrderServiceType;

  @ApiProperty({ type: OrderAddressInputDto })
  @ValidateNested()
  @Type(() => OrderAddressInputDto)
  sender!: OrderAddressInputDto;

  @ApiProperty({ type: OrderAddressInputDto })
  @ValidateNested()
  @Type(() => OrderAddressInputDto)
  recipient!: OrderAddressInputDto;

  @ApiProperty({ type: OrderItemInputDto })
  @ValidateNested()
  @Type(() => OrderItemInputDto)
  item!: OrderItemInputDto;

  @ApiPropertyOptional({ example: '2026-08-30T02:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  scheduledPickupAt?: string;

  @ApiPropertyOptional({ example: '请提前联系；仅为模拟订单' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}
