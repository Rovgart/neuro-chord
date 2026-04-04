import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
export class CheckEmailDTO {
  @ApiProperty({ example: 'daniel@neuro-chord.pl' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
