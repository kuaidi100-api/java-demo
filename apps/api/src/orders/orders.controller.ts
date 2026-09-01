import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketIssueType } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { EstimateOrderDto } from './dto/estimate-order.dto.js';
import { OrderActionDto } from './dto/order-action.dto.js';
import { OrdersService } from './orders.service.js';

class CreateComplaintDto {
  @IsEnum(TicketIssueType)
  issueType!: TicketIssueType;

  @IsString()
  @MaxLength(150)
  subject!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proofUrls?: string[];
}

@ApiTags('订单')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('estimate')
  @ApiOperation({ summary: '获取模拟预估费用' })
  estimate(@Body() dto: EstimateOrderDto) {
    return this.orders.estimate(dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '创建模拟寄件草稿' })
  create(@CurrentPrincipal() principal: AuthPrincipal, @Body() dto: CreateOrderDto) {
    return this.orders.create(principal, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '按当前身份列出可见订单' })
  list(@CurrentPrincipal() principal: AuthPrincipal) {
    return this.orders.list(principal);
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '当前用户投诉/售后工单列表' })
  tickets(@CurrentPrincipal() principal: AuthPrincipal) {
    return this.orders.listTickets(principal);
  }

  @Get('tickets/:ticketId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '工单进度详情' })
  ticketDetail(@CurrentPrincipal() principal: AuthPrincipal, @Param('ticketId') ticketId: string) {
    return this.orders.ticketDetail(principal, ticketId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '订单详情、状态日志和模拟物流轨迹' })
  detail(@CurrentPrincipal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.orders.detail(principal, id);
  }

  @Post(':id/complaints')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '用户对自己的订单提交投诉工单' })
  complaint(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Body() dto: CreateComplaintDto,
  ) {
    return this.orders.createComplaint(principal, id, dto);
  }

  @Post(':id/actions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '订单状态机动作' })
  act(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Body() dto: OrderActionDto,
  ) {
    return this.orders.act(principal, id, dto);
  }
}
