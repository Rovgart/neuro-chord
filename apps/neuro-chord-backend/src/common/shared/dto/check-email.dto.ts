import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CheckEmailDTO {
  @ApiProperty()
  @IsEmail({}, { message: 'Invalid format email' })
  @IsNotEmpty()
  email: string;
}
