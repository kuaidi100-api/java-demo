import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: '登录或刷新接口返回的 Refresh Token' })
  @IsJWT()
  refreshToken!: string;
}
