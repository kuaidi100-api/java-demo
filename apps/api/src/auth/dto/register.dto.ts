import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, Matches, MaxLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: '测试用户（虚拟）' })
  @IsString()
  @Length(2, 80)
  displayName!: string;

  @ApiProperty({ example: '+8562099990010', required: false })
  @IsOptional()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phone?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @ApiProperty({ format: 'password', minLength: 8 })
  @IsString()
  @Length(8, 72)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ description: '验证码校验成功后签发的一次性注册凭证' })
  @IsString()
  @MaxLength(2048)
  verificationToken!: string;
}
