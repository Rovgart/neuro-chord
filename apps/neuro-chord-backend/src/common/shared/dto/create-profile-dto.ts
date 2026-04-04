import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsUrl, MinLength } from "class-validator";

export type CreateProfileDTOs =
  | CreateStudentProfileDto
  | CreateTeacherProfileDto;
export class CreateProfileDto {
  @IsString()
  @MinLength(3)
  @ApiProperty()
  displayName: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty()
  imgUrl?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string;
}
export class CreateStudentProfileDto extends CreateProfileDto {
  @IsOptional()
  @IsInt()
  @ApiProperty()
  experienceLevel?: number;
  @IsString()
  @MinLength(3)
  @ApiProperty()
  username: string;
}

export class CreateTeacherProfileDto extends CreateProfileDto {
  @IsString()
  @MinLength(5)
  @ApiProperty()
  specialization: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  favMusicGenre?: string;
}
