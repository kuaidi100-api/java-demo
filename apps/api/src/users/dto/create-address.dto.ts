import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiPropertyOptional({ example: '家' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  label?: string;

  @ApiProperty({ example: '测试联系人（虚拟）' })
  @IsString()
  @Length(2, 80)
  contactName!: string;

  @ApiProperty({ example: '+8562099990010' })
  @Matches(/^\+[1-9]\d{7,14}$/)
  phone!: string;

  @ApiPropertyOptional({ default: 'LA' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
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

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefaultSender?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefaultReceiver?: boolean;
}
