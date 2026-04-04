import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecoverPasswordDto {
  @IsEmail({}, { message: 'Not correct email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @ApiProperty()
  email: string;
}
