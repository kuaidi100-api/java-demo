import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export enum OrderAction {
  SUBMIT = 'SUBMIT',
  CONFIRM = 'CONFIRM',
  DISPATCH = 'DISPATCH',
  ACCEPT = 'ACCEPT',
  START_PICKUP = 'START_PICKUP',
  CONFIRM_PICKUP = 'CONFIRM_PICKUP',
  START_TRANSIT = 'START_TRANSIT',
  CONFIRM_DELIVERY = 'CONFIRM_DELIVERY',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
  REPORT_EXCEPTION = 'REPORT_EXCEPTION',
}

export class OrderActionDto {
  @ApiProperty({ enum: OrderAction })
  @IsEnum(OrderAction)
  action!: OrderAction;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;

  @ApiPropertyOptional({ description: '管理员调度时可指定配送员 UUID' })
  @IsOptional()
  @IsUUID()
  courierId?: string;
}
