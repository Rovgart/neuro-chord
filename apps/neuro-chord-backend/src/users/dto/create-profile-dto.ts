import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @MinLength(3, { message: 'Username must have at least 3 characters long ' })
  @ApiProperty()
  username: string;
  @ApiProperty()
  @IsString()
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}
