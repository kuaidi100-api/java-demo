import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({ example: '+8562099990010', required: false })
  @IsOptional()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phone?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code!: string;
}
