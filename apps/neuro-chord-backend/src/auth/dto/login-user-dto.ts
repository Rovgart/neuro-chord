import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Incorrect email' })
  email: string;
  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Password must be 8 characters long' })
  password: string;
}
