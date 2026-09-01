import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class ResetPasswordDto {
  @ApiPropertyOptional({ example: '+8562099990010' })
  @ValidateIf((o: ResetPasswordDto) => !o.email)
  @IsOptional()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phone?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @ValidateIf((o: ResetPasswordDto) => !o.phone)
  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(4, 8)
  code!: string;

  @ApiProperty({ example: 'NewPassw0rd' })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  newPassword!: string;
}
