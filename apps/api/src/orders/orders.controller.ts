import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { EstimateOrderDto } from './dto/estimate-order.dto.js';
import { OrderActionDto } from './dto/order-action.dto.js';
import { OrdersService } from './orders.service.js';

@ApiTags('订单')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('estimate')
  @ApiOperation({ summary: '获取模拟预估费用' })
  estimate(@Body() dto: EstimateOrderDto) {
    return this.orders.estimate(dto);
  }

  @Post()
  @ApiOperation({ summary: '创建模拟寄件草稿' })
  create(@CurrentPrincipal() principal: AuthPrincipal, @Body() dto: CreateOrderDto) {
    return this.orders.create(principal, dto);
  }

  @Get()
  @ApiOperation({ summary: '按当前身份列出可见订单' })
  list(@CurrentPrincipal() principal: AuthPrincipal) {
    return this.orders.list(principal);
  }

  @Get(':id')
  @ApiOperation({ summary: '订单详情、状态日志和模拟物流轨迹' })
  detail(@CurrentPrincipal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.orders.detail(principal, id);
  }

  @Post(':id/actions')
  @ApiOperation({ summary: '执行受状态机和身份约束的订单动作' })
  act(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Param('id') id: string,
    @Body() dto: OrderActionDto,
  ) {
    return this.orders.act(principal, id, dto);
  }
}
