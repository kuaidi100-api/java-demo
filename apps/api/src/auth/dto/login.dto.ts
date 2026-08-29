import { ApiProperty } from '@nestjs/swagger';
import { PrincipalType } from '@prisma/client';
import { IsEnum, IsString, Length, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ enum: [PrincipalType.USER, PrincipalType.COURIER, PrincipalType.ADMINISTRATOR] })
  @IsEnum(PrincipalType)
  subjectType!: PrincipalType;

  @ApiProperty({ description: '用户/配送员填国际格式手机号，管理员填用户名' })
  @IsString()
  @MaxLength(100)
  identifier!: string;

  @ApiProperty({ format: 'password' })
  @IsString()
  @Length(8, 72)
  password!: string;
}
