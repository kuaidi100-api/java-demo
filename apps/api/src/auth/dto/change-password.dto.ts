import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ format: 'password', minLength: 8 })
  @IsString()
  @Length(8, 72)
  @MaxLength(72)
  oldPassword!: string;

  @ApiProperty({ format: 'password', minLength: 8 })
  @IsString()
  @Length(8, 72)
  @MaxLength(72)
  newPassword!: string;
}
