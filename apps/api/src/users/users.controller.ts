import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('用户与地址')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('users/me')
  @ApiOperation({ summary: '当前用户资料（手机号脱敏）' })
  profile(@CurrentPrincipal() principal: AuthPrincipal) {
    return this.users.profile(principal);
  }

  @Get('addresses')
  @ApiOperation({ summary: '当前用户地址簿' })
  listAddresses(@CurrentPrincipal() principal: AuthPrincipal) {
    return this.users.listAddresses(principal);
  }

  @Post('addresses')
  @ApiOperation({ summary: '新增地址' })
  createAddress(
    @CurrentPrincipal() principal: AuthPrincipal,
    @Body() dto: CreateAddressDto,
  ) {
    return this.users.createAddress(principal, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: '软删除地址' })
  deleteAddress(@CurrentPrincipal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.users.deleteAddress(principal, id);
  }
}
