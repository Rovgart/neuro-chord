import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
export class RegisterUserDto {
  @IsEmail({}, { message: 'Incorrect email' })
  @ApiProperty()
  email: string;
  @IsString()
  @MinLength(8, { message: 'Password must be 8 characters long' })
  @ApiProperty()
  password: string;
}
