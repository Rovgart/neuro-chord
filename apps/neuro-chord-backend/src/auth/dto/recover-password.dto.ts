import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecoverPasswordDto {
  @IsEmail({}, { message: 'To nie jest poprawny adres email' })
  @IsNotEmpty({ message: 'Email jest wymagany' })
  email: string;
}