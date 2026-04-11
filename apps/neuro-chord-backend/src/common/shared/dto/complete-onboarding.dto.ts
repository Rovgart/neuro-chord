import { ApiProperty } from '@nestjs/swagger'; // Upewnij się, że import jest poprawny
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength, ValidateIf } from 'class-validator';

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export class CompleteOnboardingDto {
  @ApiProperty({ enum: UserRole, example: 'STUDENT' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ example: 'Daniel Kowalski' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  displayName: string;

  @ApiProperty({ required: false, example: 'Krótki opis' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false, example: 'https://...' })
  @IsUrl()
  @IsOptional()
  imgUrl?: string;

  // --- STUDENT ---
  @ApiProperty({ required: false, example: 'daniel_dev' })
  @ValidateIf((o) => o.role === UserRole.STUDENT)
  @IsString()
  @IsNotEmpty()
  username?: string;

  // --- TEACHER ---
  @ApiProperty({ required: false, example: 'Git Guru' })
  @ValidateIf((o) => o.role === UserRole.TEACHER)
  @IsString()
  @IsNotEmpty()
  specialization?: string;

  @ApiProperty({ required: false, example: 'Jazz' })
  @ValidateIf((o) => o.role === UserRole.TEACHER)
  @IsString()
  @IsOptional()
  favMusicGenre?: string;
}
