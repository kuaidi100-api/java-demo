import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, Matches, MaxLength } from 'class-validator';

export class SendCodeDto {
  @ApiPropertyOptional({ example: '+8562099990010' })
  @IsOptional()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phone?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  /** login=须已注册；register=须未注册；reset=须已注册 */
  @ApiPropertyOptional({ enum: ['login', 'register', 'reset'], default: 'login' })
  @IsOptional()
  @IsIn(['login', 'register', 'reset'])
  purpose?: 'login' | 'register' | 'reset';
}
