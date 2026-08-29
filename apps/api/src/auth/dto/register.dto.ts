import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: '测试用户（虚拟）' })
  @IsString()
  @Length(2, 80)
  displayName!: string;

  @ApiProperty({ example: '+8562099990010' })
  @Matches(/^\+[1-9]\d{7,14}$/)
  phone!: string;

  @ApiProperty({ format: 'password', minLength: 8 })
  @IsString()
  @Length(8, 72)
  @MaxLength(72)
  password!: string;
}
