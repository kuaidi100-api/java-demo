import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { AuthPrincipal } from '../common/types/auth-principal.js';
import { AuthService } from './auth.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginCodeDto } from './dto/login-code.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { SendCodeDto } from './dto/send-code.dto.js';
import { VerifyCodeDto } from './dto/verify-code.dto.js';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '注册普通用户（支持手机号或邮箱）' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '用户、配送员或管理员登录（用户支持手机号或邮箱）' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('login-code')
  @HttpCode(200)
  @ApiOperation({ summary: '用户验证码登录（mock 环境验证码 123456）' })
  loginCode(@Body() dto: LoginCodeDto) {
    return this.auth.loginByCode(dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: '用户修改密码（校验旧密码）' })
  changePassword(@CurrentPrincipal() principal: AuthPrincipal, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(principal, dto);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: '自助重置密码（验证码）' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @Post('send-code')
  @HttpCode(200)
  @ApiOperation({ summary: '发送验证码（purpose=login|register|reset）' })
  sendCode(@Body() dto: SendCodeDto) {
    return this.auth.sendCode(dto);
  }

  @Post('verify-code')
  @HttpCode(200)
  @ApiOperation({ summary: '校验验证码（模拟环境固定为 123456）' })
  verifyCode(@Body() dto: VerifyCodeDto) {
    return this.auth.verifyCode(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: '轮换 Access Token 与 Refresh Token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: '撤销 Refresh Token' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.auth.logout(dto.refreshToken);
  }
}
